// FileUploadArea.jsx
import React, { useRef } from "react";
import { Upload } from "lucide-react";
import { apiCaller } from "../../../../utils/axiosInstance";
import { useLoader } from "../../../../context/LoaderContext";

const FileUploadArea = ({ onFileUpload }) => {


  const { showLoader, hideLoader } = useLoader();
  const fileInputRef = useRef(null);

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
      const formData = new FormData();
      formData.append("file", file);

      try {
        showLoader();
        const response = await apiCaller("POST", "/admin/upload-file", formData, {
          "Content-Type": "multipart/form-data",
        });

        const uploadedUrl = response.data.file; // Adjust if your backend returns differently
        const uploadedFile = {
          name: uploadedUrl.filename,
          size: `${(uploadedUrl.size / 1024).toFixed(1)} KB`, // size in KB
          url: uploadedUrl.path,
          type: uploadedUrl.mimetype,
        };

        onFileUpload(uploadedFile); // send uploaded file info to parent
      } catch (error) {
        console.error("Przesyłanie pliku nie powiodło się:", error);
      }
      finally {
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
      <div className="p-2 border border-gray-200 rounded-full mb-2">
        <Upload size={16} className="text-gray-400" />
      </div>
      <div className="text-sm">
        <span className="text-teal-500 cursor-pointer">Kliknij, aby przesłać</span> lub
        przeciągnij i upuść
      </div>
      <div className="text-xs text-gray-500 mt-1">
        SVG, PNG, JPG lub GIF (maks. 800x400px)
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploadArea;
