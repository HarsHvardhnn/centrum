// FileUploadArea.jsx
import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useLoader } from "../../../../context/LoaderContext";
import { toast } from "sonner";
import { apiCaller } from "../../../../utils/axiosInstance";

const FileUploadArea = ({ onFileUpload, appointmentId }) => {
  const { showLoader, hideLoader } = useLoader();
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = ""; // reset input to allow re-upload same file
    }
  };

  const uploadFiles = async (files) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // Validate file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Rozmiar pliku przekracza limit 5MB');
        toast.error('Rozmiar pliku przekracza limit 5MB');
        continue;
      }
      
      // Check file type
      const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!acceptedTypes.includes(file.type)) {
        setError('Nieprawidłowy typ pliku. Proszę przesłać plik PDF, obraz lub dokument Word');
        toast.error('Nieprawidłowy typ pliku. Proszę przesłać plik PDF, obraz lub dokument Word');
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", file.type.includes('image') ? 'Imaging' : 'Other');
      formData.append("description", "Przesłano z karty pacjenta");

      try {
        showLoader();
        
        const response = await apiCaller(
          'POST',
          `/appointments/${appointmentId}/upload-report`,
          formData,
          true // isFormData
        );

        toast.success('Raport przesłany pomyślnie');
        
        // Convert the returned data to the format expected by the parent component
        const uploadedFile = {
          name: response.data.name,
          size: response.data.metadata?.size ? `${(response.data.metadata.size / 1024).toFixed(1)} KB` : 'Nieznany rozmiar',
          url: response.data.fileUrl,
          type: response.data.fileType,
        };

        onFileUpload(uploadedFile); // send uploaded file info to parent
      } catch (error) {
        console.error("Błąd przesyłania pliku:", error);
        toast.error("Błąd przesyłania pliku: " + (error.response?.data?.message || error.message));
      } finally {
        hideLoader();
      }
    }
  };

  return (
    <div
      className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="p-2 border border-gray-200 rounded-full mb-2">
        <Upload size={16} className="text-gray-400" />
      </div>
      <div className="text-sm">
        <span className="text-teal-500 cursor-pointer">Kliknij, aby przesłać</span> lub
        przeciągnij i upuść
      </div>
      <div className="text-xs text-gray-500 mt-1">
        PDF, JPG, PNG, DOC, DOCX (Maks. 5MB)
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
    </div>
  );
};

export default FileUploadArea;
