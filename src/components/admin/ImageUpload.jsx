import React, { useRef, useState } from 'react';
import { apiCaller } from "../../utils/axiosInstance";

const ImageUpload = ({ value, onChange }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiCaller('POST', '/admin/upload-file', formData, true);
      
      if (response.data?.success && response.data?.file?.path) {
        setPreview(response.data.file.path);
        onChange(response.data.file.path);
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`px-4 py-2 rounded-lg ${
            isUploading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
        {preview && (
          <button
            onClick={handleRemoveImage}
            className="px-4 py-2 text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      {preview && (
        <div className="relative w-full max-w-xl">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto rounded-lg border border-gray-300"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 