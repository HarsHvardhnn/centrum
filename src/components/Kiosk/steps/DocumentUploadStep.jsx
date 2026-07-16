import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X, FileImage } from "lucide-react";

export default function DocumentUploadStep({
  formData = {},
  updateFormData,
  patientType,
  mode = "full_registration",
  validation = {},
  onValidationChange,
  onGoToStep,
}) {
  const [uploadedFiles, setUploadedFiles] = useState(formData.uploadedDocuments || []);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const update = (field, value) => {
    updateFormData({ [field]: value });
  };

  // Update form data when files change
  useEffect(() => {
    update("uploadedDocuments", uploadedFiles);
  }, [uploadedFiles]);

  // Validation - this step is optional, so no required validation
  useEffect(() => {
    const isValid = true; // Always valid since it's optional
    const errors = [];
    onValidationChange?.({ isValid, errors });
  }, [uploadedFiles, onValidationChange]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Nie można uzyskać dostępu do kamery. Sprawdź uprawnienia przeglądarki.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          addFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(addFile);
    event.target.value = ''; // Reset input
  };

  const addFile = (file) => {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (file.size > maxSize) {
      alert('Plik jest za duży. Maksymalny rozmiar to 10MB.');
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      alert('Nieobsługiwany format pliku. Dozwolone: JPG, PNG, PDF.');
      return;
    }

    if (uploadedFiles.length >= 3) {
      alert('Możesz przesłać maksymalnie 3 pliki.');
      return;
    }

    // Create file object with preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const newFile = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? e.target.result : null,
        uploadedAt: new Date().toISOString()
      };
      setUploadedFiles(prev => [...prev, newFile]);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Wgraj skan dokumentu / Zrób zdjęcie
        </h3>
        <p className="text-gray-600">
          <strong>Opcjonalnie:</strong> Dodaj skany lub zdjęcia dokumentów tożsamości, upoważnień lub innej dokumentacji medycznej.
        </p>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Zrób zdjęcie dokumentu</h4>
              <button
                onClick={stopCamera}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                autoPlay
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="flex justify-center mt-4 gap-4">
              <button
                onClick={stopCamera}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={capturePhoto}
                className="px-6 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800"
              >
                📷 Zrób zdjęcie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-xl p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            <button
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors"
            >
              <Camera size={20} />
              Otwórz aparat
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Upload size={20} />
              Przeglądaj pliki
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* File Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((slot) => {
          const file = uploadedFiles[slot - 1];
          return (
            <div
              key={slot}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-40 flex flex-col items-center justify-center relative"
            >
              {file ? (
                <>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                  
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                      <FileImage size={32} className="text-gray-400" />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-600 text-center truncate w-full">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <Camera size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">SLOT {slot}</p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* File Count and Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-gray-900">
            Liczba zdjęć: {uploadedFiles.length}
          </p>
          {uploadedFiles.length > 0 && (
            <button
              onClick={() => setUploadedFiles([])}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Usuń wszystkie
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            💡 <strong>Wskazówka:</strong> Możesz zrobić wiele zdjęć swoich dokumentów (np. obie strony dowodu osobistego)
          </p>
          <p className="text-xs">
            <strong>OBSŁUGIWANE FORMATY:</strong> JPG, PNG, PDF (MAX. 10MB)
          </p>
        </div>
      </div>

      {/* Optional Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          📋 <strong>Ten krok jest opcjonalny.</strong> Możesz pominąć przesyłanie dokumentów i przejść dalej, lub dodać je później podczas wizyty w placówce.
        </p>
      </div>
    </div>
  );
}