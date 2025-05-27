import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Printer,
  Download,
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
import { useLoader } from "../../context/LoaderContext";

const BillDetails = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  
  useEffect(() => {
    fetchBillDetails();
  }, [billId]);
  
  const fetchBillDetails = async () => {
    try {
      showLoader();
      setLoading(true);
      
      const response = await billingHelper.getBillDetails(billId);
      
      if (response.success) {
        setBillData(response.data);
      } else {
        setError("Nie udało się załadować szczegółów faktury");
        toast.error("Nie można załadować szczegółów faktury");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania szczegółów faktury:", error);
      setError("Wystąpił błąd podczas ładowania szczegółów faktury");
      toast.error("Błąd podczas ładowania szczegółów faktury");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };
  
  const handleUpdatePaymentStatus = async (newStatus) => {
    try {
      showLoader();
      
      const response = await billingHelper.updatePaymentStatus(billId, {
        paymentStatus: newStatus,
        paymentMethod,
        notes: paymentNotes || `Płatność oznaczona jako ${newStatus}`
      });
      
      if (response.success) {
        toast.success(`Status płatności zaktualizowany na ${newStatus}`);
        setShowPaymentModal(false);
        // Refresh bill details
        fetchBillDetails();
      } else {
        toast.error("Nie udało się zaktualizować statusu płatności");
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji statusu płatności:", error);
      toast.error("Nie udało się zaktualizować statusu płatności");
    } finally {
      hideLoader();
    }
  };
  
  const handleGenerateInvoice = async () => {
    try {
      setGeneratingInvoice(true);
      showLoader();
      
      const response = await billingHelper.generateInvoice(billId);
      
      if (response.success) {
        // Open the invoice in a new tab
        window.open(response.data.invoiceUrl, '_blank');
        toast.success("Pomyślnie wygenerowano fakturę");
      } else {
        toast.error("Nie udało się wygenerować faktury");
      }
    } catch (error) {
      console.error("Błąd podczas generowania faktury:", error);
      toast.error("Nie udało się wygenerować faktury");
    } finally {
      setGeneratingInvoice(false);
      hideLoader();
    }
  };
  
  const handlePrintBill = () => {
    window.print();
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
      case 'bank_transfer':
        return 'Przelew bankowy';
      case 'insurance':
        return 'Ubezpieczenie';
      case 'mobile_payment':
        return 'Płatność mobilna';
      default:
        return method || 'Nie określono';
    }
  };
  
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
              onClick={() => navigate('/billing')}
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
              onClick={() => navigate('/admin/billing')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Faktura #{billData._id}</h1>
              <p className="text-gray-600">
                Wygenerowano dnia {formatDate(billData.billedAt)}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateInvoice}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download size={16} className="mr-2" />
              Generuj Fakturę
            </button>
            
            {billData.paymentStatus === "pending" && (
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
        
        {/* Bill Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 sm:p-8">
            {/* Bill Header */}
            <div className="flex flex-wrap justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Faktura</h2>
                <p className="text-sm text-gray-600 mb-3">Faktura #{billData._id}</p>
                
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
              </div>
              
              <div className="mt-4 sm:mt-0">
                <div className="text-right">
                  <div className="text-gray-600 text-sm">Metoda Płatności</div>
                  <div className="flex items-center justify-end mt-1">
                    <CreditCard size={16} className="mr-2 text-gray-400" />
                    <span className="font-medium">{translatePaymentMethod(billData.paymentMethod)}</span>
                  </div>
                </div>
              </div>
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
                  <p className="text-gray-600 mt-1">{billData.patient?.email}</p>
                  <p className="text-gray-600 mt-1">{billData.patient?.phone || "Brak numeru telefonu"}</p>
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
                    {billData.services.map((service, index) => (
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
                    ))}
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
                  
                  <div className="flex justify-between py-2 text-sm">
                    <span className="text-gray-600">Podatek ({billData.taxPercentage}%)</span>
                    <span className="font-medium">{formatCurrency(billData.taxAmount)}</span>
                  </div>
                  
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