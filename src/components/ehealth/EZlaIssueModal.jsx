import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import ehealthHelper, { unwrapEhealthError } from "../../helpers/ehealthHelper";
import { STATUS_LABELS, statusClass } from "./ehealthStatus";
import P1SignDialog from "./P1SignDialog";

const LETTERS = [
  { code: "A", label: "A – po przerwie < 60 dni" },
  { code: "B", label: "B – stan ciąży" },
  { code: "C", label: "C – nadużycie alkoholu" },
  { code: "D", label: "D – gruźlica" },
  { code: "E", label: "E – choroba zakaźna" },
];

function iso(date) {
  return date.toISOString().slice(0, 10);
}

const EZlaIssueModal = ({ open, onClose, visitId, patientId, patient, initialPayload, onDocumentsChanged }) => {
  const today = iso(new Date());
  const inSix = iso(new Date(Date.now() + 6 * 86400000));
  const copied = initialPayload || {};
  const copiedLetters = ["disease1", "disease2", "disease3", "disease4"].map((key) => copied[key]).filter(Boolean);
  const [institution, setInstitution] = useState(copied.institution || "ZUS");
  const [payerName, setPayerName] = useState(copied.payerName || "");
  const [payerId, setPayerId] = useState(copied.payers?.[0]?.id || "");
  const [payerType, setPayerType] = useState(copied.payers?.[0]?.type || "1");
  const [addressOfStay, setAddressOfStay] = useState(copied.addressOfStay || patient?.address || "");
  const [startDate, setStartDate] = useState(copied.from || today);
  const [endDate, setEndDate] = useState(copied.to || inSix);
  const [hospital, setHospital] = useState(Boolean(copied.hospitalFrom));
  const [hospitalFrom, setHospitalFrom] = useState(copied.hospitalFrom || copied.from || today);
  const [hospitalTo, setHospitalTo] = useState(copied.hospitalTo || copied.to || inSix);
  const [suggestion, setSuggestion] = useState(copied.suggestion || "2");
  const [letters, setLetters] = useState(copiedLetters);
  const [icd10, setIcd10] = useState(String(copied.icd10 || "").replace(/\..*$/, ""));
  const [icdName, setIcdName] = useState(copied.icd10Display || "");
  const [reasonInPast, setReasonInPast] = useState(copied.reasonInPast || "");
  const [signOpen, setSignOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const totalDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
    return Math.round((end - start) / 86400000) + 1;
  }, [startDate, endDate]);

  if (!open) return null;

  const payersForbidden = institution === "KRUS" || institution === "W_INNYM_PANSTWIE";
  const backdated = startDate < today;
  const psychiatry = icd10.trim().toUpperCase().startsWith("F");
  const doctorLine = [patient?.doctorName, patient?.pwz ? `PWZ ${patient.pwz}` : ""].filter(Boolean).join(" · ");

  const toggleLetter = (code) => {
    setLetters((prev) => {
      if (prev.includes(code)) return prev.filter((item) => item !== code);
      if (prev.length >= 4) {
        toast.error("P1 przyjmuje najwyżej 4 kody literowe.");
        return prev;
      }
      return [...prev, code];
    });
  };

  const validate = () => {
    if (!patient?.pesel) return "Brak PESEL pacjenta.";
    if (!startDate || !endDate || endDate < startDate) return "Podaj poprawny okres niezdolności.";
    if (!/^[A-Za-z][0-9]{2}$/.test(icd10.trim())) return "Rozpoznanie musi być kodem ICD-10 bez części po kropce, np. J06.";
    if (!payersForbidden && !payerId.trim()) return "Podaj identyfikator płatnika: NIP, PESEL albo paszport.";
    if (hospital && (!hospitalFrom || !hospitalTo)) return "Pobyt w szpitalu wymaga daty od i do.";
    if (backdated && !psychiatry && !reasonInPast.trim()) return "Zwolnienie wsteczne wymaga uzasadnienia.";
    return "";
  };

  const submit = async () => {
    const problem = validate();
    if (problem) {
      toast.error(problem);
      setSignOpen(false);
      return;
    }
    const payload = {
      institution,
      from: startDate,
      to: endDate,
      suggestion,
      icd10: icd10.trim().toUpperCase(),
      icd10Display: icdName.trim(),
      payerName: payerName.trim(),
      addressOfStay: addressOfStay.trim(),
      payers: payersForbidden ? [] : [{ type: payerType, id: payerId.trim() }],
      hospitalFrom: hospital ? hospitalFrom : "",
      hospitalTo: hospital ? hospitalTo : "",
      disease1: letters[0] || "",
      disease2: letters[1] || "",
      disease3: letters[2] || "",
      disease4: letters[3] || "",
      reasonInPast: backdated && !psychiatry ? reasonInPast.trim() : "",
    };
    try {
      setBusy(true);
      const res = await ehealthHelper.submitEzla({ visitId, patientId, payload });
      if (!res?.success) throw new Error(res?.error?.message || "Wystawianie nieudane");
      setSignOpen(false);
      onDocumentsChanged?.();
      if (res.licenseWarning) toast.warning(res.licenseWarning);
      if (res.data?.status === "failed") toast.error(res.data.error?.message || "e-ZLA zapisane z błędem wysyłki.");
      else toast.success("E-ZLA jest na liście dokumentów tej wizyty.");
      onClose?.();
    } catch (err) {
      toast.error(unwrapEhealthError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#854d0e] via-[#a16207] to-[#ca8a04] px-6 py-4 text-white flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black tracking-widest uppercase">ZUS PUE · e-ZLA</div>
            <h2 className="text-base font-bold">
              {result ? "Zaświadczenie lekarskie e-ZLA zostało zapisane" : "Wystawianie zaświadczenia lekarskiego e-ZLA"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-lg px-2" aria-label="Zamknij">×</button>
        </div>

        <div className="p-6 overflow-y-auto text-xs text-slate-700 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="border-2 border-amber-300 rounded-2xl p-6 text-center bg-amber-50">
                <span className={`inline-flex px-3 py-1 rounded-full font-bold ${statusClass(result.status)}`}>
                  {STATUS_LABELS[result.status] || result.status}
                </span>
                <p className="mt-3 text-slate-500">Numer zaświadczenia</p>
                <div className="my-3 font-mono text-2xl font-black text-amber-950">{result.seriesNumber || result.accessCode || result.id}</div>
                <p>{result.error?.message || "Dokument trafi do ZUS dopiero po włączeniu wysyłki i certyfikacie ZUS."}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <button type="button" onClick={() => ehealthHelper.printDocument("ezla", result.id)} className="py-3 border rounded-xl font-bold">
                  Drukuj zaświadczenie dla pacjenta
                </button>
                <button type="button" onClick={onClose} className="py-3 bg-slate-800 text-white rounded-xl font-bold">
                  Wróć do karty wizyty
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Ubezpieczony (pacjent)</span>
                    <strong className="text-sm">{patient?.name || "—"}</strong>
                    <div className="font-mono">PESEL: {patient?.pesel || "Brak"}</div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 block">Instytucja</label>
                    <select value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full border rounded px-2 py-1">
                      <option value="ZUS">ZUS</option>
                      <option value="KRUS">KRUS</option>
                      <option value="INNE_W_POLSCE">Inne w Polsce</option>
                      <option value="W_INNYM_PANSTWIE">W innym państwie</option>
                    </select>
                    {!payersForbidden && (
                      <>
                        <input value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Nazwa płatnika" className="w-full border rounded px-2 py-1 font-semibold" />
                        <div className="flex gap-2">
                          <select value={payerType} onChange={(e) => setPayerType(e.target.value)} className="border rounded px-2 py-1">
                            <option value="1">NIP</option>
                            <option value="2">PESEL</option>
                            <option value="3">Paszport</option>
                          </select>
                          <input value={payerId} onChange={(e) => setPayerId(e.target.value)} placeholder="Identyfikator płatnika" className="flex-1 border rounded px-2 py-1 font-mono" />
                        </div>
                      </>
                    )}
                    {payersForbidden && <p className="text-[11px] text-slate-500">Dla KRUS i ubezpieczenia za granicą nie podaje się płatnika.</p>}
                  </div>
                </div>
                <label className="block">
                  <span className="font-bold">Adres pobytu w okresie niezdolności</span>
                  <input value={addressOfStay} onChange={(e) => setAddressOfStay(e.target.value)} className="mt-1 w-full border rounded-lg px-2 py-1.5" />
                  <span className="text-[10px] text-slate-400">Adres, pod którym pacjent będzie przebywać w trakcie kontroli ZUS.</span>
                </label>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold uppercase tracking-wider text-amber-950">Okres niezdolności do pracy</h3>
                  <span className="px-3 py-1 bg-amber-700 text-white rounded-full font-bold">Łącznie: {totalDays} dni</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label>Niezdolność od dnia *<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full border rounded-lg px-2 py-1.5" /></label>
                  <label>Niezdolność do dnia *<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full border rounded-lg px-2 py-1.5" /></label>
                </div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={hospital} onChange={(e) => setHospital(e.target.checked)} />
                  Niezdolność obejmuje pobyt w szpitalu
                </label>
                {hospital && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label>Szpital od<input type="date" value={hospitalFrom} onChange={(e) => setHospitalFrom(e.target.value)} className="mt-1 w-full border rounded-lg px-2 py-1.5" /></label>
                    <label>Szpital do<input type="date" value={hospitalTo} onChange={(e) => setHospitalTo(e.target.value)} className="mt-1 w-full border rounded-lg px-2 py-1.5" /></label>
                  </div>
                )}
                {backdated && !psychiatry && (
                  <label className="block">
                    Uzasadnienie zwolnienia wstecznego *
                    <textarea rows={2} value={reasonInPast} onChange={(e) => setReasonInPast(e.target.value)} className="mt-1 w-full border rounded-lg p-2" />
                  </label>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="border rounded-xl p-3 space-y-2">
                  <div className="font-bold">Wskazania lekarskie *</div>
                  <label className="flex gap-2"><input type="radio" checked={suggestion === "1"} onChange={() => setSuggestion("1")} />1 – Chory powinien leżeć</label>
                  <label className="flex gap-2"><input type="radio" checked={suggestion === "2"} onChange={() => setSuggestion("2")} />2 – Chory może chodzić</label>
                </div>
                <div className="border rounded-xl p-3">
                  <div className="font-bold mb-2">Kody literowe ZUS (jeśli dotyczą)</div>
                  <div className="grid grid-cols-1 gap-1">
                    {LETTERS.map((item) => (
                      <label key={item.code} className="flex gap-2">
                        <input type="checkbox" checked={letters.includes(item.code)} onChange={() => toggleLetter(item.code)} />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border rounded-xl p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Rozpoznanie medyczne (ICD-10) *</span>
                  <span className="text-[10px] text-slate-500">Kod nie jest widoczny dla pracodawcy</span>
                </div>
                <div className="flex gap-2">
                  <input value={icd10} onChange={(e) => setIcd10(e.target.value.toUpperCase())} placeholder="J06" className="w-24 border rounded-lg px-2 py-1.5 font-mono font-bold" />
                  <input value={icdName} onChange={(e) => setIcdName(e.target.value)} placeholder="Nazwa rozpoznania" className="flex-1 border rounded-lg px-2 py-1.5" />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-amber-950">Podpis cyfrowy certyfikatem ZUS PUE lekarza</h4>
                  <p className="text-[11px] text-amber-800">Podpisujący: {doctorLine || "lekarz wizyty"}</p>
                </div>
                <button type="button" onClick={() => { const problem = validate(); if (problem) toast.error(problem); else setSignOpen(true); }} className="px-5 py-2.5 bg-amber-700 text-white rounded-xl font-bold">
                  Podpisz i wyślij do ZUS
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <P1SignDialog
        open={signOpen}
        accent="amber"
        title="Podpis certyfikatem ZUS PUE"
        doctorLine={doctorLine}
        busy={busy}
        onClose={() => setSignOpen(false)}
        onConfirm={submit}
      />
    </div>
  );
};

export default EZlaIssueModal;
