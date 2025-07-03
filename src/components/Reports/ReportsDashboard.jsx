import React, { useState, useEffect } from 'react';
import { Calendar, Download, FileText, Eye, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { useUser } from '../../context/userContext';
import doctorService from '../../helpers/doctorHelper';
import { 
  generateReport, 
  getAppointmentDetails, 
  exportReportToPDF, 
  exportReportToCSV,
  formatDate,
  formatCurrency,
  getStatusText,
  getServiceTypeText,
  getPaymentStatusText,
  handleApiError,
  validateFilters,
  getUserPermissions
} from '../../helpers/reportsHelper';

const ReportsDashboard = () => {
  const { user } = useUser();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({ pdf: false, csv: false });
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    doctorId: '',
    patientId: '',
    status: 'all',
    serviceType: 'all'
  });

  // Get user permissions
  const permissions = getUserPermissions('admin');

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const response = await doctorService.getAllDoctors();
        setDoctors(response?.doctors);
      } catch (error) {
        showMessage('Błąd podczas pobierania listy lekarzy: ' + error.message, 'error');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Auto-set default date range (last 30 days)
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  }, []);

  const showMessage = (message, type = 'info') => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(''), 5000);
    } else if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  const handleGenerateReport = async () => {
    // Validate filters
    const validationErrors = validateFilters(filters);
    if (validationErrors.length > 0) {
      showMessage(validationErrors.join(', '), 'error');
      return;
    }

    if (!permissions.canGenerateReports) {
      showMessage('Brak uprawnień do generowania raportów', 'error');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await generateReport(filters);
      if (data.success) {
        setReportData(data.data);
        showMessage('Raport wygenerowany pomyślnie', 'success');
      } else {
        showMessage(data.message || 'Błąd podczas generowania raportu', 'error');
      }
    } catch (error) {
      showMessage(handleApiError(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointmentDetails = async (appointmentId) => {
    if (!permissions.canViewDetails) {
      showMessage('Brak uprawnień do przeglądania szczegółów', 'error');
      return;
    }

    try {
      const data = await getAppointmentDetails(appointmentId);
      if (data.success) {
        setAppointmentDetails(data.data);
        setDetailsModalVisible(true);
      } else {
        showMessage(data.message || 'Błąd podczas pobierania szczegółów', 'error');
      }
    } catch (error) {
      showMessage(handleApiError(error), 'error');
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) {
      showMessage('Najpierw wygeneruj raport', 'error');
      return;
    }

    if (!permissions.canExport) {
      showMessage('Brak uprawnień do eksportu', 'error');
      return;
    }

    setExportLoading(prev => ({ ...prev, pdf: true }));
    
    try {
      await exportReportToPDF(filters);
      showMessage('Raport wyeksportowany do PDF', 'success');
    } catch (error) {
      showMessage(handleApiError(error), 'error');
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleExportCSV = async () => {
    if (!reportData) {
      showMessage('Najpierw wygeneruj raport', 'error');
      return;
    }

    if (!permissions.canExport) {
      showMessage('Brak uprawnień do eksportu', 'error');
      return;
    }

    setExportLoading(prev => ({ ...prev, csv: true }));
    
    try {
      await exportReportToCSV(filters);
      showMessage('Raport wyeksportowany do CSV', 'success');
    } catch (error) {
      showMessage(handleApiError(error), 'error');
    } finally {
      setExportLoading(prev => ({ ...prev, csv: false }));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Generator raportów</h1>
        <p className="text-gray-600">Wygeneruj szczegółowe raporty z wizyt i rozliczeń</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtry raportu</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data początkowa
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data końcowa
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lekarz
            </label>
            <select
              value={filters.doctorId}
              onChange={(e) => setFilters(prev => ({ ...prev, doctorId: e.target.value }))}
              disabled={loadingDoctors}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Wszyscy lekarze</option>
              {doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} 
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status wizyty
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Wszystkie</option>
              <option value="completed">Zakończone</option>
              <option value="cancelled">Anulowane</option>
              <option value="booked">Zarezerwowane</option>
              <option value="checkedIn">Zameldowane</option>
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ usługi
            </label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Wszystkie</option>
              <option value="online">Online</option>
              <option value="offline">Przychodnia</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-end space-y-2">
            <button
              onClick={handleGenerateReport}
              disabled={loading || !permissions.canGenerateReports}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span>{loading ? 'Generowanie...' : 'Generuj raport'}</span>
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleExportPDF}
                disabled={!reportData || exportLoading.pdf || !permissions.canExport}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
              >
                {exportLoading.pdf ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <Download className="h-3 w-3" />
                )}
                <span>PDF</span>
              </button>
              
              <button
                onClick={handleExportCSV}
                disabled={!reportData || exportLoading.csv || !permissions.canExport}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
              >
                {exportLoading.csv ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <Download className="h-3 w-3" />
                )}
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Łączna liczba wizyt</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Zrealizowane wizyty</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.completedAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Łączne przychody</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Średnia wartość wizyty</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.summary.averageAppointmentValue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Summary Cards */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Wizyty online</p>
              <p className="text-xl font-bold text-teal-600">{reportData.summary.onlineAppointments}</p>
              <p className="text-xs text-gray-500">{formatCurrency(reportData.summary.onlineEarnings)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Wizyty stacjonarne</p>
              <p className="text-xl font-bold text-blue-600">{reportData.summary.offlineAppointments}</p>
              <p className="text-xs text-gray-500">{formatCurrency(reportData.summary.offlineEarnings)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Opłacone rachunki</p>
              <p className="text-xl font-bold text-green-600">{reportData.summary.paidBills}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Oczekujące rachunki</p>
              <p className="text-xl font-bold text-orange-600">{reportData.summary.pendingBills}</p>
            </div>
          </div>
        </div>
      )}

      {/* Appointments Table */}
      {reportData && reportData.appointments && reportData.appointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Szczegóły wizyt</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pacjent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lekarz
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data / Godzina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Typ / Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usługi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Koszt / Płatność
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.appointments.map((appointment, index) => (
                  <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <button
                          onClick={() => handleViewAppointmentDetails(appointment.appointmentId)}
                          className="text-teal-600 hover:text-teal-800 font-medium"
                        >
                          {appointment.patientName}
                        </button>
                        <p className="text-sm text-gray-500">{appointment.patientPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appointment.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(appointment.appointmentDate)}</div>
                      <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getServiceTypeText(appointment.mode)}</div>
                      <div className="text-sm text-gray-500">{getStatusText(appointment.status)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {appointment.services && appointment.services.map((service, serviceIndex) => (
                          <div key={serviceIndex} className="mb-1">
                            <span className="text-gray-900">{service.title}</span>
                            <span className="text-gray-500"> - {formatCurrency(service.price)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(appointment.totalEarnings)}</div>
                      <div className="text-sm text-gray-500">{getPaymentStatusText(appointment.paymentStatus)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewAppointmentDetails(appointment.appointmentId)}
                        disabled={!permissions.canViewDetails}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {reportData && reportData.appointments && reportData.appointments.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak danych</h3>
          <p className="text-gray-500">Nie znaleziono wizyt dla wybranych kryteriów.</p>
        </div>
      )}

      {/* Appointment Details Modal */}
      {detailsModalVisible && appointmentDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Szczegóły wizyty</h3>
                <button
                  onClick={() => setDetailsModalVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {/* Patient Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Informacje o pacjencie</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Imię i nazwisko:</strong> {appointmentDetails.patient?.name}</p>
                    <p><strong>Telefon:</strong> {appointmentDetails.patient?.phone}</p>
                    <p><strong>Email:</strong> {appointmentDetails.patient?.email}</p>
                    {appointmentDetails.patient?.address && (
                      <p><strong>Adres:</strong> {appointmentDetails.patient.address}</p>
                    )}
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Informacje o lekarzu</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Imię i nazwisko:</strong> {appointmentDetails.doctor?.name}</p>
                    <p><strong>Email:</strong> {appointmentDetails.doctor?.email}</p>
                    {appointmentDetails.doctor?.phone && (
                      <p><strong>Telefon:</strong> {appointmentDetails.doctor.phone}</p>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Szczegóły wizyty</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Data:</strong> {formatDate(appointmentDetails.appointment?.date)}</p>
                    <p><strong>Godzina:</strong> {appointmentDetails.appointment?.startTime} - {appointmentDetails.appointment?.endTime}</p>
                    <p><strong>Typ:</strong> {getServiceTypeText(appointmentDetails.appointment?.mode)}</p>
                    <p><strong>Status:</strong> {getStatusText(appointmentDetails.appointment?.status)}</p>
                    {appointmentDetails.appointment?.notes && (
                      <p><strong>Uwagi:</strong> {appointmentDetails.appointment.notes}</p>
                    )}
                  </div>
                </div>

                {/* Billing Information */}
                {appointmentDetails.billing && (
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Rozliczenie</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong>ID faktury:</strong> {appointmentDetails.billing.invoiceId}</p>
                      <p><strong>Łączna kwota:</strong> {formatCurrency(appointmentDetails.billing.totalAmount)}</p>
                      <p><strong>Status płatności:</strong> {getPaymentStatusText(appointmentDetails.billing.paymentStatus)}</p>
                      <p><strong>Metoda płatności:</strong> {appointmentDetails.billing.paymentMethod}</p>
                      
                      {appointmentDetails.billing.services && appointmentDetails.billing.services.length > 0 && (
                        <div className="mt-3">
                          <strong>Usługi:</strong>
                          <ul className="mt-1 ml-4">
                            {appointmentDetails.billing.services.map((service, index) => (
                              <li key={index}>
                                • {service.title} - {formatCurrency(service.price)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setDetailsModalVisible(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard; 