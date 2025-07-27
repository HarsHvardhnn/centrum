import React from 'react';
import { File, FileText, Image, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiCaller } from '../../../../utils/axiosInstance';

const ReportsList = ({ appointmentId, reports = [], onReportDeleted }) => {
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten raport?')) {
      return;
    }
    
    try {
      const response = await apiCaller(
        'DELETE',
        `/appointments/${appointmentId}/reports/${reportId}`
      );
      
      toast.success('Raport usunięty pomyślnie');
      
      if (onReportDeleted) {
        onReportDeleted(response.data.remainingReports);
      }
      
    } catch (error) {
      console.error('Błąd podczas usuwania raportu:', error);
      toast.error('Nie udało się usunąć raportu: ' + (error.response?.data?.message || error.message));
    }
  };
  
  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4 text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Brak dostępnych raportów dla tej wizyty</p>
      </div>
    );
  }
  
  // Helper function to get file icon
  const getFileIcon = (fileType) => {
    switch(fileType?.toLowerCase()) {
      case 'pdf': return <File className="h-8 w-8 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png': return <Image className="h-8 w-8 text-blue-500" />;
      case 'doc':
      case 'docx': return <FileText className="h-8 w-8 text-blue-700" />;
      default: return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Nieznana data';
    
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Raporty Medyczne</h3>
      
      <div className="space-y-4">
        {reports.map(report => (
          <div key={report._id} className="border rounded-lg overflow-hidden">
            <div className="p-4 flex items-start">
              <div className="flex-shrink-0 mr-4">
                {getFileIcon(report.fileType)}
              </div>
              
              <div className="flex-grow">
                <h4 className="font-medium text-gray-900">{report.name || 'Raport bez nazwy'}</h4>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {report.type || 'Inne'}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    Przesłano: {formatDate(report.uploadedAt)}
                  </span>
                </div>
                
                {report.description && (
                  <p className="mt-2 text-sm text-gray-500">
                    {report.description}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0 ml-4 flex space-x-2">
                <a 
                  href={report.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  title="Zobacz Raport"
                >
                  <ExternalLink size={16} />
                </a>
                
                <button
                  onClick={() => handleDeleteReport(report._id)}
                  className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  title="Usuń Raport"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsList; 