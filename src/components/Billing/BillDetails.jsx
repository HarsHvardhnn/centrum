import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  DollarSign,
  Calendar,
  User,
  Clock,
  CreditCard,
  Check,
  FileText
} from "lucide-react";
import billingHelper from "../../helpers/billingHelper";
import { toast } from "sonner";
import { queryKeys } from "../../lib/queryKeys";
import { useUser } from "../../context/userContext";
import { isPlaceholderPhone } from "../../utils/phoneUtils";

const BillDetails = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const isBillingStaff =
    user?.role === "admin" || user?.role === "receptionist";
  const isDoctorViewOnly = user?.role === "doctor";

  const {
    data: billResponse,
    isLoading: loading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.billDetail(billId, "full"),
    queryFn: () => billingHelper.getBillDetails(billId, { scope: "full" }),
    enabled: Boolean(billId),
    staleTime: 30_000,
  });

  const billData = billResponse?.success ? billResponse.data : null;
  const error =
    isError || (billResponse && !billResponse.success)
      ? "Nie udało się załadować szczegółów faktury"
      : null;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);
  
  const handleUpdatePaymentStatus = async (newStatus) => {
    try {
      setPaymentSaving(true);
      
      const response = await billingHelper.updatePaymentStatus(billId, {
        paymentStatus: newStatus,
        paymentMethod,
        notes: paymentNotes || `Płatność oznaczona jako ${newStatus}`
      });
      
      if (response.success) {
        toast.success(`Status płatności zaktualizowany na ${newStatus}`);
        setShowPaymentModal(false);
        queryClient.invalidateQueries({ queryKey: queryKeys.billDetail(billId, "full") });
        queryClient.invalidateQueries({ queryKey: ["billing-list"] });
      } else {
        toast.error("Nie udało się zaktualizować statusu płatności");
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji statusu płatności:", error);
      toast.error("Nie udało się zaktualizować statusu płatności");
    } finally {
      setPaymentSaving(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(2)} zł`;
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get color for payment status
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'awaiting_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Polish translation for payment status
  const translatePaymentStatus = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return 'Opłacone';
      case 'pending':
        return 'Oczekujące';
      case 'awaiting_payment':
        return 'Oczekuje na płatność';
      case 'overdue':
        return 'Zaległe';
      case 'partial':
        return 'Częściowo opłacone';
      default:
        return status;
    }
  };
  
  // Polish translation for payment method
  const translatePaymentMethod = (method) => {
    switch(method?.toLowerCase()) {
      case 'cash':
        return 'Gotówka';
      case 'card':
        return 'Karta kredytowa/debetowa';
      case 'blik':
        return 'BLIK';
      case 'bank_transfer':
        return 'Przelew bankowy';
      case 'online':
        return 'Płatność online';
      case 'package':
        return 'Pakiet / abonament';
      case 'insurance':
        return 'Ubezpieczenie';
      case 'other':
        return 'Inne';
      default:
        return method || 'Nie wybrano';
    }
  };

  const isUnsettledBill =
    billData?.paymentStatus === "pending" ||
    billData?.paymentStatus === "awaiting_payment";
  const paymentMethodLabel = isUnsettledBill
    ? "Nie wybrano"
    : translatePaymentMethod(billData?.paymentMethod);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  if (error || !billData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Nie znaleziono faktury</h2>
            <p className="text-gray-600 mb-6">{error || "Nie można znaleźć żądanej faktury."}</p>
            <button
              onClick={() => navigate('/administracja/rozliczenia')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
            >
              <ChevronLeft size={16} className="mr-2" />
              Powrót do Faktur
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/administracja/rozliczenia')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isDoctorViewOnly
                  ? "Podstawa rozliczenia"
                  : billData.documentType === "fiscal_receipt"
                  ? `Rozliczenie ${billData.internalTxnId || ""}`
                  : billData.documentType === "invoice"
                    ? `Faktura #${billData.invoiceId || billData.invoiceSnapshot?.number || billData._id}`
                    : "Rozliczenie pacjenta"}
              </h1>
              <p className="text-gray-600">
                Wygenerowano dnia {formatDate(billData.billedAt)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {isBillingStaff &&
              (billData.paymentStatus === "pending" ||
                billData.paymentStatus === "awaiting_payment") && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
              >
                <DollarSign size={16} className="mr-2" />
                Oznacz jako Opłacone
              </button>
            )}
          </div>
        </div>
        
        {isDoctorViewOnly && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Usługi i kwoty z Twojej wizyty. Faktury i paragony wystawia recepcja.
          </div>
        )}

        {/* Bill Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            {/* Bill Header */}
            <div className="flex flex-wrap justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {isDoctorViewOnly
                    ? "Rozliczenie wizyty"
                    : billData.documentType === "fiscal_receipt"
                    ? "Rozliczenie (paragon)"
                    : billData.documentType === "invoice"
                      ? "Faktura"
                      : "Rozliczenie pacjenta"}
                </h2>
                {!isDoctorViewOnly && (
                <p className="text-sm text-gray-600 mb-3">
                  {billData.documentType === "invoice" &&
                  (billData.invoiceId || billData.invoiceSnapshot?.number)
                    ? `Nr ${(billData.invoiceId || billData.invoiceSnapshot?.number)}`
                    : billData.documentType === "fiscal_receipt" && billData.internalTxnId
                      ? billData.internalTxnId
                    : billData.documentType === "fiscal_receipt" && billData.receiptNumber
                      ? `Nr paragonu ${billData.receiptNumber}`
                    : `ID: ${billData._id}`}
                </p>
                )}
                
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <span>Data: {formatDate(billData.billedAt)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-2 text-gray-400" />
                  <span>
                    Status: 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(billData.paymentStatus)}`}>
                      {translatePaymentStatus(billData.paymentStatus)}
                    </span>
                  </span>
                </div>
                {!isDoctorViewOnly && (billData.invoiceUrl || billData.invoiceSnapshot?.pdfUrl) && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await billingHelper.openInvoicePdf(billData._id);
                        } catch (_) {
                          toast.error("Nie udało się otworzyć PDF");
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                    >
                      <FileText size={14} className="mr-1" />
                      Podgląd PDF
                    </button>
                  </div>
                )}
              </div>
              
              {!isDoctorViewOnly && (
              <div className="mt-4 sm:mt-0">
                <div className="text-right">
                  <div className="text-gray-600 text-sm">Metoda Płatności</div>
                  <div className="flex items-center justify-end mt-1">
                    <CreditCard size={16} className="mr-2 text-gray-400" />
                    <span className="font-medium">{paymentMethodLabel}</span>
                  </div>
                </div>
              </div>
              )}
            </div>
            
            {/* Client & Provider Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Pacjent</h3>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {billData.patient?.name?.first} {billData.patient?.name?.last}
                  </p>
                  <p className="text-gray-600 mt-1">ID: {billData.patient?.patientId}</p>
                  {billData.patient?.email ? (
                    <p className="text-gray-600 mt-1">{billData.patient.email}</p>
                  ) : null}
                  <p className="text-gray-600 mt-1">
                    {isPlaceholderPhone(billData.patient?.phone)
                      ? "Brak numeru telefonu"
                      : billData.patient.phone}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Lekarz</h3>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {billData.appointment?.doctor?.name?.first} {billData.appointment?.doctor?.name?.last}
                  </p>
                  <p className="text-gray-600 mt-1">{billData.appointment?.doctor?.specialization || "Ogólny"}</p>
                  <p className="text-gray-600 mt-1">
                    Wizyta: {formatDate(billData.appointment?.date)}
                  </p>
                  <p className="text-gray-600 mt-1">
                    Godzina: {billData.appointment?.startTime} - {billData.appointment?.endTime}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Services Table */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Usługi</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Opis
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cena
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ilość
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Suma
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(billData.lineItems?.length
                      ? billData.lineItems.map((item, index) => (
                          <tr key={item._id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.name}
                              {item.discount > 0 && (
                                <span className="block text-xs text-gray-400">
                                  Rabat {item.discount}
                                  {item.discountReason ? ` (${item.discountReason})` : ""}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {formatCurrency(item.basePrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              {item.quantity || 1} {item.unit || "szt."}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(item.finalPrice)}
                            </td>
                          </tr>
                        ))
                      : billData.services?.map((service, index) => (
                      <tr key={service.serviceId || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {service.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {formatCurrency(service.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          {service.quantity || 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(parseFloat(service.price) * (service.quantity || 1))}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Totals */}
            <div className="border-t pt-6">
              <div className="flex justify-end">
                <div className="w-full sm:w-64">
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">Suma częściowa</span>
                    <span className="font-medium">{formatCurrency(billData.subtotal)}</span>
                  </div>
                  
                  {!isDoctorViewOnly && (
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">Podatek ({billData.taxPercentage}%{billData.taxPercentage === 0 ? ' ZW' : ''})</span>
                    <span className="font-medium">{formatCurrency(billData.taxAmount)}</span>
                  </div>
                  )}
                  
                  {billData.appointment?.mode === 'online' && billData.consultationCharges > 0 && (
                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-gray-600">Opłata za konsultację </span>
                      <span className="font-medium">OPŁACONE</span>
                    </div>
                  )}
                  
                  {billData.additionalCharges > 0 && (
                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-gray-600">Dodatkowe opłaty</span>
                      <span className="font-medium">{formatCurrency(billData.additionalCharges)}</span>
                    </div>
                  )}
                  
                  {billData.discount > 0 && (
                    <div className="flex justify-between py-2 text-sm">
                      <span className="text-gray-600">Zniżka</span>
                      <span className="font-medium text-red-600">-{formatCurrency(billData.discount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between py-2 mt-2 border-t border-gray-200 text-base font-semibold">
                    <span>Razem</span>
                    <span>{formatCurrency(billData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes */}
            {billData.additionalChargeNote && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Notatki</h3>
                <p className="text-sm text-gray-600">{billData.additionalChargeNote}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Oznacz fakturę jako opłaconą</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metoda płatności
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="cash">Gotówka</option>
                <option value="card">Karta kredytowa/debetowa</option>
                <option value="bank_transfer">Przelew bankowy</option>
                <option value="insurance">Ubezpieczenie</option>
                <option value="mobile_payment">Płatność mobilna</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notatki dotyczące płatności (Opcjonalnie)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                placeholder="Dodaj notatki dotyczące tej płatności..."
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleUpdatePaymentStatus("paid")}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
              >
                <Check size={16} className="mr-2" />
                Potwierdź płatność
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillDetails; 