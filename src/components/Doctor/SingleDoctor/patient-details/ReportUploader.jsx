import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Upload, X, File, FileText, Image } from 'lucide-react';
import { apiCaller } from '../../../../utils/axiosInstance';

const ReportUploader = ({ appointmentId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('Lab');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Rozmiar pliku przekracza limit 5MB');
        e.target.value = null;
        return;
      }
      
      // Check file type
      const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!acceptedTypes.includes(selectedFile.type)) {
        setError('Nieprawidłowy typ pliku. Proszę przesłać plik PDF, obraz lub dokument Word');
        e.target.value = null;
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      // Auto-fill name from filename if not already set
      if (!reportName) {
        const fileName = selectedFile.name;
        // Remove extension from filename
        setReportName(fileName.split('.').slice(0, -1).join('.'));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Proszę wybrać plik do przesłania');
      return;
    }
    
    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', reportName || file.name);
    formData.append('type', reportType);
    formData.append('description', description);
    
    try {
      const response = await apiCaller(
        'POST',
        `/appointments/rep/${appointmentId}/upload-report`,
        formData,
        true // isFormData
      );
      
      // Reset form
      setFile(null);
      setReportName('');
      setDescription('');
      
      // Clear file input
      const fileInput = document.getElementById('report-file-input');
      if (fileInput) fileInput.value = '';
      
      toast.success('Raport przesłany pomyślnie');
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(response.data);
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Błąd podczas przesyłania pliku');
      toast.error('Nie udało się przesłać raportu');
      console.error('Błąd przesyłania:', err);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">Prześlij Raport Medyczny</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa Raportu
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="np. Wyniki badania krwi"
              className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ Raportu
            </label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="Lab">Badanie Laboratoryjne</option>
              <option value="Imaging">Obrazowanie</option>
              <option value="Procedure">Procedura</option>
              <option value="Consultation">Konsultacja</option>
              <option value="Prescription">Recepta</option>
              <option value="Other">Inne</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opis
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Krótki opis raportu"
            className="w-full p-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
            rows="2"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Wybierz Plik
          </label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-1">
              Kliknij, aby przesłać lub przeciągnij i upuść
            </p>
            <p className="text-xs text-gray-400 mb-4">
              PDF, JPG, PNG, DOC, DOCX (Maks. 5MB)
            </p>
            <input
              id="report-file-input"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {file && (
              <div className="mt-2 bg-gray-50 p-2 rounded-md w-full flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-blue-500 mr-2">
                    {file.type.includes('image') ? (
                      <Image size={20} />
                    ) : file.type.includes('pdf') ? (
                      <File size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(file.size/1024)} KB</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setFile(null);
                    document.getElementById('report-file-input').value = '';
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          disabled={uploading || !file}
        >
          {uploading ? 'Przesyłanie...' : 'Prześlij Raport'}
        </button>
      </form>
    </div>
  );
};

export default ReportUploader; 