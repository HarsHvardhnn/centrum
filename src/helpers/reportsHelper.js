import { apiCaller } from '../utils/axiosInstance';
import { axiosInstance } from '../utils/axiosInstance';

// Generate report with filters
export const generateReport = async (filters) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add required date parameters
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    
    // Add optional filters
    if (filters.doctorId) {
      queryParams.append('doctorId', filters.doctorId);
    }
    if (filters.patientId) {
      queryParams.append('patientId', filters.patientId);
    }
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters.serviceType && filters.serviceType !== 'all') {
      queryParams.append('serviceType', filters.serviceType);
    }

    const response = await apiCaller('GET', `/api/reports/generate?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Generate report error:', error);
    throw error;
  }
};

// Get detailed appointment information
export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await apiCaller('GET', `/api/reports/appointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error('Get appointment details error:', error);
    throw error;
  }
};

// Export report to PDF
export const exportReportToPDF = async (filters) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    if (filters.doctorId) {
      queryParams.append('doctorId', filters.doctorId);
    }
    if (filters.patientId) {
      queryParams.append('patientId', filters.patientId);
    }
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters.serviceType && filters.serviceType !== 'all') {
      queryParams.append('serviceType', filters.serviceType);
    }

    const url = `/api/reports/export/pdf?${queryParams.toString()}`;
    console.log('🔍 Requesting PDF from:', url);
    console.log('📊 With filters:', filters);

    // Use axiosInstance directly for binary responses
    const response = await axiosInstance({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/pdf',
        'Content-Type': 'application/pdf'
      }
    });

    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      contentType: response.headers['content-type'],
      contentLength: response.headers['content-length'],
      dataType: response.data?.constructor.name,
      dataLength: response.data?.byteLength
    });

    // Check if we received PDF data
    if (!response.data || response.data.byteLength === 0) {
      // If we got empty data, try to decode any error message
      if (response.data) {
        try {
          const decoder = new TextDecoder('utf-8');
          const textContent = decoder.decode(response.data);
          console.error('❌ Server response (decoded):', textContent);
          if (textContent.includes('{')) {
            const jsonResponse = JSON.parse(textContent);
            console.error('❌ Server error:', jsonResponse);
            throw new Error(jsonResponse.message || 'Server returned an error message');
          }
        } catch (decodeError) {
          console.error('❌ Could not decode server response:', decodeError);
        }
      }
      throw new Error('Received empty PDF data from server');
    }

    // Check content type to ensure we received a PDF
    const contentType = response.headers['content-type'];
    console.log('📄 Content-Type:', contentType);

    if (!contentType || !contentType.includes('application/pdf')) {
      // If we received an error message instead of PDF
      if (contentType && contentType.includes('application/json')) {
        const decoder = new TextDecoder('utf-8');
        const jsonResponse = JSON.parse(decoder.decode(response.data));
        console.error('❌ Server returned JSON instead of PDF:', jsonResponse);
        throw new Error(jsonResponse.message || 'Server returned an error');
      }
      console.error('❌ Invalid content type:', contentType);
      throw new Error('Invalid response type: Expected PDF but received ' + contentType);
    }
    
    // Create blob with proper PDF mime type
    const blob = new Blob([response.data], { type: 'application/pdf' });
    console.log('📦 Created blob:', {
      size: blob.size,
      type: blob.type
    });
    
    // Verify blob size
    if (blob.size === 0) {
      throw new Error('Generated PDF is empty');
    }

    // Create object URL and trigger download
    const url2 = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url2;
    a.download = `raport-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Append to body, click, and cleanup
    document.body.appendChild(a);
    a.click();
    
    // Cleanup after small delay to ensure download starts
    setTimeout(() => {
      window.URL.revokeObjectURL(url2);
      document.body.removeChild(a);
    }, 100);
    
    return { success: true };
  } catch (error) {
    console.error('❌ PDF Export error:', {
      name: error.name,
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data
    });
    
    // Provide more specific error messages
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          throw new Error('Nieprawidłowe parametry raportu');
        case 401:
          throw new Error('Brak autoryzacji. Zaloguj się ponownie');
        case 403:
          throw new Error('Brak uprawnień do generowania raportów');
        case 404:
          throw new Error('Nie znaleziono danych do raportu');
        case 500:
          throw new Error('Błąd serwera podczas generowania PDF');
        default:
          throw new Error(`Błąd podczas generowania PDF (${status})`);
      }
    }
    
    throw new Error('Nie udało się wygenerować raportu PDF. Spróbuj ponownie.');
  }
};

// Export report to CSV
export const exportReportToCSV = async (filters) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) {
      queryParams.append('startDate', filters.startDate);
    }
    if (filters.endDate) {
      queryParams.append('endDate', filters.endDate);
    }
    if (filters.doctorId) {
      queryParams.append('doctorId', filters.doctorId);
    }
    if (filters.patientId) {
      queryParams.append('patientId', filters.patientId);
    }
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }
    if (filters.serviceType && filters.serviceType !== 'all') {
      queryParams.append('serviceType', filters.serviceType);
    }

    // Use axiosInstance directly for binary responses
    const response = await axiosInstance({
      method: 'GET',
      url: `/api/reports/export/csv?${queryParams.toString()}`,
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv'
      }
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raport-${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
  } catch (error) {
    console.error('CSV Export error:', error);
    throw error;
  }
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pl-PL');
};

// Format currency
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0.00 PLN';
  return `${parseFloat(amount).toFixed(2)} PLN`;
};

// Get status display text
export const getStatusText = (status) => {
  const statusMap = {
    'completed': 'Zakończone',
    'cancelled': 'Anulowane',
    'booked': 'Zarezerwowane',
    'checkedIn': 'Zameldowane',
    'pending': 'Oczekujące'
  };
  return statusMap[status] || status;
};

// Get service type display text
export const getServiceTypeText = (serviceType) => {
  return serviceType === 'online' ? 'Online' : 'Przychodnia';
};

// Get payment status text
export const getPaymentStatusText = (paymentStatus) => {
  const statusMap = {
    'paid': 'Opłacone',
    'pending': 'Oczekuje',
    'cancelled': 'Anulowane',
    'refunded': 'Zwrócone'
  };
  return statusMap[paymentStatus] || paymentStatus;
};

// Handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    const { status } = error.response;
    switch (status) {
      case 403:
        return 'Brak uprawnień do tej operacji';
      case 404:
        return 'Dane nie znalezione';
      case 401:
        return 'Sesja wygasła. Zaloguj się ponownie.';
      case 400:
        return 'Nieprawidłowe dane wejściowe';
      case 500:
        return 'Błąd serwera. Spróbuj ponownie później.';
      default:
        return 'Wystąpił błąd. Spróbuj ponownie.';
    }
  }
  return 'Błąd połączenia. Sprawdź połączenie internetowe.';
};

// Validate filters
export const validateFilters = (filters) => {
  const errors = [];
  
  if (!filters.startDate) {
    errors.push('Data początkowa jest wymagana');
  }
  
  if (!filters.endDate) {
    errors.push('Data końcowa jest wymagana');
  }
  
  // Removed date comparison validation - users can select any date range
  // Removed date range size limitation - users can select any range size
  
  return errors;
};

// Get permission based on user role
export const getUserPermissions = (userRole) => {
  const permissions = {
    canGenerateReports: false,
    canViewAllData: false,
    canViewOwnData: false,
    canExport: false,
    canViewDetails: false
  };
  
  switch (userRole?.toLowerCase()) {
    case 'admin':
    case 'superadmin':
    case 'reception':
      permissions.canGenerateReports = true;
      permissions.canViewAllData = true;
      permissions.canViewOwnData = true;
      permissions.canExport = true;
      permissions.canViewDetails = true;
      break;
    case 'doctor':
      permissions.canGenerateReports = true;
      permissions.canViewAllData = false;
      permissions.canViewOwnData = true;
      permissions.canExport = true;
      permissions.canViewDetails = true;
      break;
    default:
      // No permissions by default
      break;
  }
  
  return permissions;
}; 