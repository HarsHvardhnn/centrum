import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader, Plus, Trash2, X, Eye, Printer, FileDown } from "lucide-react";
import { toast } from "sonner";
import billingHelper from "../../helpers/billingHelper";
import { queryKeys } from "../../lib/queryKeys";
import { translateStatus } from "../../utils/statusHelper";
import {
  DEFAULT_VAT_EXEMPTION_TEXT,
  isZwTax,
  lineItemToInvoicePosition,
  normalizeTaxRate,
  taxSelectValue,
  VAT_RATE_PRESETS,
} from "../../utils/invoiceVat";

const PAYMENT_METHODS = [
  { value: "cash", label: "Gotówka" },
  { value: "card", label: "Karta" },
  { value: "blik", label: "BLIK" },
  { value: "bank_transfer", label: "Przelew" },
  { value: "online", label: "Online" },
  { value: "package", label: "Pakiet / abonament" },
  { value: "other", label: "Inne" },
];

const SELLER_READONLY = {
  name: "CM7 SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ",
  street: "ul. Powstańców Warszawy 7/1.5",
  postCode: "26-110",
  city: "Skarżysko-Kamienna",
  taxNo: "6631891951",
  regon: "541934650",
  krs: "0001177361",
  email: "biuro@centrummedyczne7.pl",
};

function toMoney(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v * 100) / 100;
}

function toDateInput(value) {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function patientName(patient) {
  if (!patient) return "Pacjent";
  if (typeof patient.name === "string") return patient.name;
  return `${patient.name?.first || ""} ${patient.name?.last || ""}`.trim() || "Pacjent";
}

function doctorName(appointment) {
  const d = appointment?.doctor;
  if (!d) return "—";
  if (typeof d.name === "string") return d.name;
  return `${d.name?.first || ""} ${d.name?.last || ""}`.trim() || "—";
}

function buildLineItemsFromBill(bill) {
  if (Array.isArray(bill?.lineItems) && bill.lineItems.length) {
    return bill.lineItems.map((i) => ({
      key: i._id || `${i.kind}-${i.name}-${Math.random()}`,
      serviceId: i.serviceId?._id || i.serviceId || null,
      name: i.name,
      kind: i.kind || "service",
      basePrice: toMoney(i.basePrice),
      discount: toMoney(i.discount),
      discountReason: i.discountReason || "",
      finalPrice: toMoney(
        i.finalPrice != null ? i.finalPrice : Math.max(0, toMoney(i.basePrice) - toMoney(i.discount))
      ),
      quantity: i.quantity || 1,
      unit: i.unit || "szt.",
      status: i.status || "active",
      tax: normalizeTaxRate(i.tax),
    }));
  }
  const items = (bill?.services || []).map((s) => {
    const base = toMoney(s.price);
    return {
      key: s.serviceId?._id || s.serviceId || `svc-${s.title}`,
      serviceId: s.serviceId?._id || s.serviceId || null,
      name: s.title,
      kind: "service",
      basePrice: base,
      discount: 0,
      discountReason: "",
      finalPrice: base,
      quantity: 1,
      unit: "szt.",
      status: s.status || "active",
      tax: "zw",
    };
  });
  if (toMoney(bill?.consultationCharges) > 0) {
    items.push({
      key: "consultation",
      serviceId: null,
      name: "Konsultacja",
      kind: "consultation",
      basePrice: toMoney(bill.consultationCharges),
      discount: 0,
      discountReason: "",
      finalPrice: toMoney(bill.consultationCharges),
      quantity: 1,
      unit: "szt.",
      status: "active",
      tax: "zw",
    });
  }
  if (toMoney(bill?.additionalCharges) > 0) {
    items.push({
      key: "additional-legacy",
      serviceId: null,
      name: bill.additionalChargeNote || "Opłata dodatkowa",
      kind: "additional",
      basePrice: toMoney(bill.additionalCharges),
      discount: 0,
      discountReason: "",
      finalPrice: toMoney(bill.additionalCharges),
      quantity: 1,
      unit: "szt.",
      status: "active",
      tax: "zw",
    });
  }
  const disc = toMoney(bill?.discount);
  if (disc > 0 && items.length) {
    const target = items.find((i) => i.kind === "service") || items[0];
    target.discount = disc;
    target.discountReason = target.discountReason || "Rabat";
    target.finalPrice = toMoney(Math.max(0, target.basePrice - disc));
  }
  return items;
}

const LoaderOverlay = () => (
  <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center rounded-xl">
    <div className="flex items-center gap-2 text-gray-700">
      <Loader className="animate-spin" size={22} />
      <span>Ładowanie...</span>
    </div>
  </div>
);

/**
 * Patient Settlement modal — paragon default + optional Faktura form.
 */
const PatientSettlementModal = ({ isOpen, onClose, billId, onUpdate }) => {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [lineItems, setLineItems] = useState([]);
  const [documentType, setDocumentType] = useState("fiscal_receipt");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [notes, setNotes] = useState("");
  const [hydratedBillId, setHydratedBillId] = useState(null);

  const {
    data: billRes,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.billDetail(billId, "settlement"),
    queryFn: () => billingHelper.getBillDetails(billId, { scope: "settlement" }),
    enabled: Boolean(isOpen && billId),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const bill = billRes?.success ? billRes.data : null;

  // Invoice draft (independent snapshot fields)
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [place, setPlace] = useState("Skarżysko-Kamienna");
  const [issueDate, setIssueDate] = useState(toDateInput(new Date()));
  const [sellDate, setSellDate] = useState(toDateInput(new Date()));
  const [paymentDueKind, setPaymentDueKind] = useState("immediate");
  const [paymentDueDate, setPaymentDueDate] = useState(toDateInput(new Date()));
  const [buyer, setBuyer] = useState({
    name: "",
    street: "",
    postCode: "",
    city: "",
    taxNo: "",
    email: "",
    phone: "",
  });
  const [recipientName, setRecipientName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [vatExemptionText, setVatExemptionText] = useState(
    DEFAULT_VAT_EXEMPTION_TEXT
  );
  const [issuedPdfUrl, setIssuedPdfUrl] = useState(null);
  const [issuedNumber, setIssuedNumber] = useState("");
  const [locked, setLocked] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Hydrate form once per bill open (avoid resetting while user edits)
  useEffect(() => {
    if (!isOpen || !bill || bill._id === hydratedBillId) return;

    setHydratedBillId(bill._id);
    setLineItems(buildLineItemsFromBill(bill));
    setDocumentType(bill.documentType === "invoice" ? "invoice" : "fiscal_receipt");
    setPaymentMethod(bill.paymentMethod || "cash");
    setAmountReceived(
      bill.amountReceived != null && bill.amountReceived !== ""
        ? String(bill.amountReceived)
        : ""
    );
    setNotes(bill.notes || "");

    const snap = bill.invoiceSnapshot;
    const prefill = bill.buyerPrefill || {};
    setBuyer({
      name: snap?.buyer?.name || prefill.name || patientName(bill.patient),
      street: snap?.buyer?.street || prefill.street || "",
      postCode: snap?.buyer?.postCode || prefill.postCode || "",
      city: snap?.buyer?.city || prefill.city || "",
      taxNo: snap?.buyer?.taxNo || "",
      email: snap?.buyer?.email || prefill.email || bill.patient?.email || "",
      phone: snap?.buyer?.phone || prefill.phone || bill.patient?.phoneNumber || "",
    });
    setRecipientName(snap?.recipientName || "");
    setIssuerName(snap?.issuerName || "");
    setPlace(snap?.place || "Skarżysko-Kamienna");
    setIssueDate(toDateInput(snap?.issueDate || new Date()));
    setSellDate(toDateInput(snap?.sellDate || new Date()));
    setPaymentDueKind(snap?.paymentDueKind || "immediate");
    setPaymentDueDate(toDateInput(snap?.paymentDueDate || new Date()));
    setInvoiceNumber(snap?.number || bill.invoiceId || "");
    if (snap?.vatExemptionText) setVatExemptionText(snap.vatExemptionText);

    const isIssued =
      Boolean(snap?.number) && snap?.status && snap.status !== "draft";
    setLocked(isIssued);
    setIssuedPdfUrl(bill.invoiceUrl || snap?.pdfUrl || null);
    setIssuedNumber(snap?.number || bill.invoiceId || "");
  }, [isOpen, bill, hydratedBillId]);

  useEffect(() => {
    if (!isOpen) {
      setHydratedBillId(null);
    }
  }, [isOpen]);

  // Suggest next invoice number only when user picks Faktura (not on every modal open)
  useEffect(() => {
    if (!isOpen || documentType !== "invoice" || locked || invoiceNumber) return;

    let cancelled = false;
    (async () => {
      try {
        const d = new Date();
        const suggested = await billingHelper.suggestInvoiceId(
          d.getMonth() + 1,
          d.getFullYear()
        );
        if (!cancelled && suggested) setInvoiceNumber(suggested);
      } catch (_) {}
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, documentType, locked, invoiceNumber]);

  useEffect(() => {
    if (billRes && !billRes.success && isOpen && billId && !isLoading) {
      toast.error("Nie udało się pobrać rozliczenia");
    }
  }, [billRes, isOpen, billId, isLoading]);

  const total = useMemo(
    () => toMoney(lineItems.reduce((s, i) => s + toMoney(i.finalPrice), 0)),
    [lineItems]
  );

  const showVatExemptionField = useMemo(
    () => documentType === "invoice" && lineItems.some((i) => isZwTax(i.tax)),
    [documentType, lineItems]
  );

  const invoicePositions = useMemo(
    () => lineItems.map((line) => lineItemToInvoicePosition(line)),
    [lineItems]
  );

  const changeDue = useMemo(() => {
    if (paymentMethod !== "cash" || amountReceived === "") return null;
    return toMoney(Math.max(0, toMoney(amountReceived) - total));
  }, [paymentMethod, amountReceived, total]);

  const updateLine = (key, patch) => {
    setLineItems((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;
        const next = { ...row, ...patch };
        if (patch.basePrice != null || patch.discount != null) {
          const base = toMoney(next.basePrice);
          const disc = toMoney(next.discount);
          next.finalPrice = toMoney(Math.max(0, base - disc));
        }
        return next;
      })
    );
  };

  const addAdditionalCharge = () => {
    setLineItems((prev) => [
      ...prev,
      {
        key: `add-${Date.now()}`,
        serviceId: null,
        name: "",
        kind: "additional",
        basePrice: 0,
        discount: 0,
        discountReason: "",
        finalPrice: 0,
        quantity: 1,
        unit: "szt.",
        status: "active",
        tax: "zw",
      },
    ]);
  };

  const applyTaxToAllLines = (preset) => {
    if (!preset) return;
    setLineItems((prev) =>
      prev.map((row) => ({
        ...row,
        tax: preset === "custom" ? row.tax || "zw" : preset,
      }))
    );
  };

  const removeLine = (key) => {
    setLineItems((prev) => prev.filter((i) => i.key !== key));
  };

  const payloadLineItems = () =>
    lineItems.map(({ key, ...rest }) => rest);

  const handleSettleParagon = async () => {
    if (locked) return;
    const badAdd = lineItems.find(
      (i) => i.kind === "additional" && !String(i.name || "").trim()
    );
    if (badAdd) {
      toast.error("Opłata dodatkowa wymaga opisu");
      return;
    }
    if (!lineItems.length) {
      toast.error("Dodaj co najmniej jedną pozycję");
      return;
    }
    setSaving(true);
    try {
      const res = await billingHelper.settlePatient(billId, {
        documentType: "fiscal_receipt",
        paymentMethod,
        amountReceived:
          paymentMethod === "cash" && amountReceived !== ""
            ? toMoney(amountReceived)
            : undefined,
        changeDue: changeDue != null ? changeDue : undefined,
        notes,
        lineItems: payloadLineItems(),
      });
      if (res?.success) {
        toast.success(
          `Rozliczono (paragon). TRX: ${res.data?.internalTxnId || "—"}`
        );
        queryClient.invalidateQueries({ queryKey: queryKeys.billDetail(billId, "settlement") });
        queryClient.invalidateQueries({ queryKey: ["billing-list"] });
        onUpdate?.(res.data);
        onClose?.();
      } else {
        toast.error(res?.message || "Nie udało się rozliczyć");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Nie udało się rozliczyć");
    } finally {
      setSaving(false);
    }
  };

  const handleIssueInvoice = async () => {
    if (locked) return;
    const badAdd = lineItems.find(
      (i) => i.kind === "additional" && !String(i.name || "").trim()
    );
    if (badAdd) {
      toast.error("Opłata dodatkowa wymaga opisu");
      return;
    }
    if (!buyer.name?.trim()) {
      toast.error("Podaj dane nabywcy");
      return;
    }
    setSaving(true);
    try {
      // Save settlement draft first
      await billingHelper.settlePatient(billId, {
        documentType: "invoice",
        paymentMethod,
        amountReceived:
          paymentMethod === "cash" && amountReceived !== ""
            ? toMoney(amountReceived)
            : undefined,
        changeDue: changeDue != null ? changeDue : undefined,
        notes,
        lineItems: payloadLineItems(),
        invoiceDraft: {
          place,
          issueDate,
          sellDate,
          paymentDueKind,
          paymentDueDate: paymentDueKind === "other" ? paymentDueDate : undefined,
          paymentType: paymentMethod,
          buyer,
          recipientName: String(recipientName || "").trim(),
          issuerName: String(issuerName || "").trim(),
          vatExemptionText: showVatExemptionField ? vatExemptionText : "",
          paidAmount: paymentDueKind === "immediate" ? total : 0,
        },
      });

      const res = await billingHelper.issueInvoice(billId, {
        number: invoiceNumber || undefined,
        place,
        issueDate,
        sellDate,
        paymentDueKind,
        paymentDueDate: paymentDueKind === "other" ? paymentDueDate : undefined,
        paymentType: paymentMethod,
        buyer,
        recipientName: String(recipientName || "").trim(),
        issuerName: String(issuerName || "").trim(),
        vatExemptionText: showVatExemptionField ? vatExemptionText : "",
        paidAmount: paymentDueKind === "immediate" ? total : 0,
        lineItems: payloadLineItems(),
        positions: invoicePositions,
      });

      if (res?.success) {
        const pdfReady = Boolean(res.data?.invoiceUrl);
        if (pdfReady) {
          toast.success(`Faktura ${res.data?.number} wystawiona`);
        } else {
          toast.warning(
            `Faktura ${res.data?.number} wystawiona, ale PDF nie został wygenerowany. Kliknij „Generuj PDF”.`
          );
        }
        setLocked(true);
        setIssuedNumber(res.data?.number || "");
        setIssuedPdfUrl(res.data?.invoiceUrl || null);
        queryClient.invalidateQueries({ queryKey: queryKeys.billDetail(billId, "settlement") });
        queryClient.invalidateQueries({ queryKey: ["billing-list"] });
        onUpdate?.(res.data);
      } else {
        toast.error(res?.message || "Nie udało się wystawić faktury");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Nie udało się wystawić faktury");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!billId) return;
    setPdfGenerating(true);
    try {
      const res = await billingHelper.generateInvoice(billId);
      if (res?.success && res.data?.invoiceUrl) {
        setIssuedPdfUrl(res.data.invoiceUrl);
        toast.success("PDF faktury wygenerowany");
        queryClient.invalidateQueries({ queryKey: queryKeys.billDetail(billId, "settlement") });
      } else {
        toast.error(res?.message || "Nie udało się wygenerować PDF");
      }
    } catch (e) {
      toast.error(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Nie udało się wygenerować PDF (sprawdź Chrome na serwerze)"
      );
    } finally {
      setPdfGenerating(false);
    }
  };

  const openPdf = async () => {
    if (!issuedPdfUrl || !billId) return;
    try {
      await billingHelper.openInvoicePdf(billId, issuedPdfUrl);
    } catch (e) {
      toast.error("Nie udało się otworzyć PDF");
    }
  };

  const printPdf = async () => {
    if (!issuedPdfUrl || !billId) return;
    try {
      const blob = await billingHelper.fetchInvoicePdfBlob(billId, issuedPdfUrl);
      const objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const w = window.open(objectUrl, "_blank", "noopener,noreferrer");
      if (w) {
        setTimeout(() => {
          try {
            w.print();
          } catch (_) {}
        }, 800);
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (_) {
      toast.error("Nie udało się wydrukować PDF");
    }
  };

  if (!isOpen) return null;

  const apt = bill?.appointment;
  const name = patientName(bill?.patient);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl max-h-[92vh] flex flex-col relative">
        {(isLoading || (isFetching && !bill) || saving) && <LoaderOverlay />}

        <div className="flex justify-between items-start border-b p-4 gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Rozliczenie pacjenta: {name}
            </h3>
            {bill && (
              <p className="text-sm text-gray-500 mt-1">
                {apt?.date
                  ? new Date(apt.date).toLocaleDateString("pl-PL")
                  : "—"}
                {apt?.startTime ? ` · ${apt.startTime}` : ""}
                {` · ${doctorName(apt)}`}
                {apt?.status ? ` · ${translateStatus(apt.status)}` : ""}
                {bill.internalTxnId ? ` · ${bill.internalTxnId}` : ""}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Document type */}
          <section className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-3">Typ dokumentu</h4>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="documentType"
                  disabled={locked}
                  checked={documentType === "fiscal_receipt"}
                  onChange={() => setDocumentType("fiscal_receipt")}
                />
                <span>Paragon fiskalny (domyślny)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="documentType"
                  disabled={locked}
                  checked={documentType === "invoice"}
                  onChange={() => setDocumentType("invoice")}
                />
                <span>Faktura</span>
              </label>
            </div>
            {documentType === "fiscal_receipt" && (
              <p className="text-xs text-gray-500 mt-2">
                Zapisze płatność i wewnętrzne ID TRX. Paragon drukujesz na kasie fiskalnej — bez PDF i numeru faktury.
              </p>
            )}
            {documentType === "invoice" && (
              <p className="text-xs text-gray-500 mt-2">
                Ustaw stawkę VAT przy każdej pozycji poniżej. Domyślnie ZW — tekst zwolnienia pojawi się tylko dla pozycji ze stawką ZW.
              </p>
            )}
          </section>

          {/* Line items */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h4 className="font-medium text-gray-800">Pozycje</h4>
              <div className="flex flex-wrap items-center gap-2">
                {documentType === "invoice" && !locked && (
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-xs text-gray-500">Stawka VAT (wszystkie):</span>
                    <select
                      className="px-2 py-1 border rounded-md text-sm bg-white"
                      defaultValue=""
                      onChange={(e) => applyTaxToAllLines(e.target.value)}
                    >
                      <option value="" disabled>
                        Wybierz…
                      </option>
                      {VAT_RATE_PRESETS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                      <option value="custom">Inna…</option>
                    </select>
                  </label>
                )}
                {!locked && (
                  <button
                    type="button"
                    onClick={addAdditionalCharge}
                    className="inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-900"
                  >
                    <Plus size={16} />
                    Dodaj opłatę dodatkową
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {lineItems.map((item) => (
                <div
                  key={item.key}
                  className="border border-gray-200 rounded-lg p-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-end"
                >
                  <div className={documentType === "invoice" ? "md:col-span-3" : "md:col-span-4"}>
                    <label className="text-xs text-gray-500">Nazwa</label>
                    <input
                      type="text"
                      disabled={locked || item.kind === "service"}
                      value={item.name}
                      onChange={(e) => updateLine(item.key, { name: e.target.value })}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm disabled:bg-gray-50"
                      placeholder={
                        item.kind === "additional" ? "Opis opłaty (wymagany)" : ""
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">Cena bazowa</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={locked}
                      value={item.basePrice}
                      onChange={(e) =>
                        updateLine(item.key, { basePrice: toMoney(e.target.value) })
                      }
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm disabled:bg-gray-50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">Rabat</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      disabled={locked}
                      value={item.discount}
                      onChange={(e) =>
                        updateLine(item.key, { discount: toMoney(e.target.value) })
                      }
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm disabled:bg-gray-50"
                    />
                  </div>
                  <div className={documentType === "invoice" ? "md:col-span-2" : "md:col-span-3"}>
                    <label className="text-xs text-gray-500">Powód rabatu</label>
                    <input
                      type="text"
                      disabled={locked}
                      value={item.discountReason}
                      onChange={(e) =>
                        updateLine(item.key, { discountReason: e.target.value })
                      }
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm disabled:bg-gray-50"
                    />
                  </div>
                  {documentType === "invoice" && (
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-500">Stawka VAT</label>
                    <div className="flex gap-1 mt-0.5">
                      <select
                        disabled={locked}
                        value={taxSelectValue(item.tax)}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "custom") {
                            const current = taxSelectValue(item.tax);
                            updateLine(item.key, {
                              tax:
                                current === "custom"
                                  ? normalizeTaxRate(item.tax)
                                  : "5",
                            });
                          } else {
                            updateLine(item.key, { tax: v });
                          }
                        }}
                        className="w-full px-2 py-1.5 border rounded-md text-sm disabled:bg-gray-50"
                      >
                        {VAT_RATE_PRESETS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                        <option value="custom">Inna…</option>
                      </select>
                    </div>
                    {taxSelectValue(item.tax) === "custom" && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={locked}
                        value={normalizeTaxRate(item.tax) === "zw" ? "" : item.tax}
                        onChange={(e) =>
                          updateLine(item.key, { tax: e.target.value })
                        }
                        placeholder="%"
                        className="w-full mt-1 px-2 py-1 border rounded-md text-sm disabled:bg-gray-50"
                      />
                    )}
                  </div>
                  )}
                  <div
                    className={
                      documentType === "invoice"
                        ? "md:col-span-2 flex items-center justify-between gap-2"
                        : "md:col-span-1 flex items-center justify-between gap-2"
                    }
                  >
                    <div>
                      <div className="text-xs text-gray-500">Suma</div>
                      <div className="font-semibold text-sm">{toMoney(item.finalPrice).toFixed(2)}</div>
                    </div>
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => removeLine(item.key)}
                        className="text-red-500 hover:text-red-700"
                        title="Usuń pozycję"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!lineItems.length && (
                <p className="text-sm text-gray-500 text-center py-4">Brak pozycji</p>
              )}
            </div>
            <div className="mt-3 flex justify-end text-base font-semibold">
              Razem: {total.toFixed(2)} zł
            </div>
          </section>

          {/* Payment */}
          <section className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="font-medium">Płatność</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Metoda</label>
                <select
                  disabled={locked}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full mt-0.5 px-2 py-2 border rounded-md text-sm disabled:bg-gray-50"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              {paymentMethod === "cash" && (
                <div>
                  <label className="text-xs text-gray-500">Otrzymano (gotówka)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={locked}
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full mt-0.5 px-2 py-2 border rounded-md text-sm disabled:bg-gray-50"
                    placeholder="0.00"
                  />
                  {changeDue != null && (
                    <p className="text-sm text-teal-700 mt-1">
                      Reszta do wydania: <strong>{changeDue.toFixed(2)} zł</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500">Notatki</label>
              <textarea
                disabled={locked}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full mt-0.5 px-2 py-2 border rounded-md text-sm disabled:bg-gray-50"
              />
            </div>
          </section>

          {/* Invoice form */}
          {documentType === "invoice" && (
            <section className="border border-teal-200 bg-teal-50/40 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-teal-900">Faktura — dane dokumentu</h4>
              <p className="text-xs text-gray-600">
                Dane faktury są niezależne od karty pacjenta / wizyty. Po wystawieniu edycja jest zablokowana.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Numer (N/MM/RRRR)</label>
                  <input
                    type="text"
                    disabled={locked}
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm bg-white disabled:bg-gray-50"
                    placeholder="np. 16/08/2026"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Miejsce</label>
                  <input
                    type="text"
                    disabled={locked}
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm bg-white disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Data wystawienia</label>
                  <input
                    type="date"
                    disabled={locked}
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm bg-white disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Data sprzedaży</label>
                  <input
                    type="date"
                    disabled={locked}
                    value={sellDate}
                    onChange={(e) => setSellDate(e.target.value)}
                    className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm bg-white disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Termin płatności</label>
                  <select
                    disabled={locked}
                    value={paymentDueKind}
                    onChange={(e) => setPaymentDueKind(e.target.value)}
                    className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm bg-white disabled:bg-gray-50"
                  >
                    <option value="immediate">Natychmiast (zapłacono)</option>
                    <option value="7">7 dni</option>
                    <option value="14">14 dni</option>
                    <option value="other">Inna data</option>
                  </select>
                </div>
                {paymentDueKind === "other" && (
                  <div>
                    <label className="text-xs text-gray-500">Data płatności</label>
                    <input
                      type="date"
                      disabled={locked}
                      value={paymentDueDate}
                      onChange={(e) => setPaymentDueDate(e.target.value)}
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm bg-white disabled:bg-gray-50"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border rounded-md p-3">
                  <div className="text-xs font-semibold uppercase text-gray-500 mb-2">
                    Sprzedawca (stały)
                  </div>
                  <div className="text-sm space-y-0.5 text-gray-700">
                    <div className="font-medium">{SELLER_READONLY.name}</div>
                    <div>{SELLER_READONLY.street}</div>
                    <div>
                      {SELLER_READONLY.postCode} {SELLER_READONLY.city}
                    </div>
                    <div>NIP: {SELLER_READONLY.taxNo}</div>
                    <div>REGON: {SELLER_READONLY.regon}</div>
                    <div>KRS: {SELLER_READONLY.krs}</div>
                  </div>
                </div>
                <div className="bg-white border rounded-md p-3 space-y-2">
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Nabywca (edytowalny na fakturze)
                  </div>
                  {[
                    ["name", "Imię i nazwisko / nazwa"],
                    ["street", "Ulica"],
                    ["postCode", "Kod pocztowy"],
                    ["city", "Miasto"],
                    ["taxNo", "NIP (opcjonalnie)"],
                    ["email", "E-mail"],
                    ["phone", "Telefon"],
                  ].map(([field, label]) => (
                    <div key={field}>
                      <label className="text-xs text-gray-500">{label}</label>
                      <input
                        type="text"
                        disabled={locked}
                        value={buyer[field] || ""}
                        onChange={(e) =>
                          setBuyer((b) => ({ ...b, [field]: e.target.value }))
                        }
                        className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm disabled:bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
                <div className="bg-white border rounded-md p-3 space-y-2">
                  <div className="text-xs font-semibold uppercase text-gray-500">
                    Odbiorca (opcjonalnie)
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Imię i nazwisko odbiorcy
                    </label>
                    <input
                      type="text"
                      disabled={locked}
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Pozostaw puste, jeśli odbiorca = nabywca"
                      className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {showVatExemptionField && (
              <div>
                <label className="text-xs text-gray-500">Tekst zwolnienia VAT (ZW)</label>
                <textarea
                  disabled={locked}
                  value={vatExemptionText}
                  onChange={(e) => setVatExemptionText(e.target.value)}
                  rows={2}
                  className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm bg-white disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pole widoczne tylko gdy co najmniej jedna pozycja ma stawkę ZW.
                </p>
              </div>
              )}

              <div>
                <label className="text-xs text-gray-500">
                  Imię i nazwisko wystawcy (opcjonalnie)
                </label>
                <input
                  type="text"
                  disabled={locked}
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1.5 border rounded-md text-sm bg-white disabled:bg-gray-50"
                />
              </div>

              {locked && (
                <div className="flex flex-wrap gap-2 pt-2 items-center">
                  {!issuedPdfUrl && (
                    <>
                      <p className="text-sm text-amber-700 w-full">
                        PDF nie został wygenerowany przy wystawieniu (Chrome/Cloudinary). Kliknij poniżej, aby wygenerować ponownie.
                      </p>
                      <button
                        type="button"
                        onClick={handleGeneratePdf}
                        disabled={pdfGenerating}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 disabled:opacity-60"
                      >
                        {pdfGenerating ? (
                          <Loader className="animate-spin" size={16} />
                        ) : (
                          <FileDown size={16} />
                        )}
                        Generuj PDF
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={openPdf}
                    disabled={!issuedPdfUrl}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Eye size={16} />
                    Podgląd PDF
                  </button>
                  <button
                    type="button"
                    onClick={printPdf}
                    disabled={!issuedPdfUrl}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Printer size={16} />
                    Drukuj
                  </button>
                  {issuedNumber && (
                    <span className="text-sm text-gray-600 self-center">
                      Nr {issuedNumber}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 self-center">
                    Wysyłka e-mail niedostępna w tej fazie
                  </span>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="border-t p-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
          >
            {locked ? "Zamknij" : "Anuluj"}
          </button>
          {!locked && documentType === "fiscal_receipt" && (
            <button
              type="button"
              onClick={handleSettleParagon}
              disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60"
            >
              Rozlicz pacjenta
            </button>
          )}
          {!locked && documentType === "invoice" && (
            <button
              type="button"
              onClick={handleIssueInvoice}
              disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-60"
            >
              Wystaw fakturę
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSettlementModal;
