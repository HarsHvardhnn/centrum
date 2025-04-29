import { useState, useRef } from "react";
import { X, Upload, AlertCircle, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { apiCaller } from "../../utils/axiosInstance";

const CheckInModal = ({ isOpen, setIsOpen, patientData = null }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  console.log("patientData", patientData);

  // Default patient data if none provided
  const patient = patientData || {
    name: "Demi Wilkinson",
    age: "22",
    sex: "Male",
    email: "wilkinson87@gmail.com",
    phone: "(704) 555-0783",
    dateOfBirth: "14 February 2003",
    disease: "Cardiology",
    id: "#PT-0025",
    photo: "/api/placeholder/48/48", // Placeholder for patient photo
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [
      ...prev,
      ...selectedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substring(2),
        progress: 100,
        error: null,
      })),
    ]);

    // Reset file input
    e.target.value = null;
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [
        ...prev,
        ...droppedFiles.map((file) => ({
          file,
          id: Math.random().toString(36).substring(2),
          progress: 100,
          error: null,
        })),
      ]);
    }
  };

const handleSubmit = async () => {
  if (files.length === 0) {
    setUploadError("Please upload at least one document");
    return;
  }

  setUploading(true);
  setUploadError(null);

  try {
    // Create FormData
    const formData = new FormData();

    files.forEach((fileObj) => {
      formData.append("files", fileObj.file);
    });

    // Prepare URL (assuming your backend route is `/api/patients/:patientId/upload-documents`)
    const url = `/patients/documents/${patient._id}/upload`;

    // Prepare headers
    const headers = {
      "Content-Type": "multipart/form-data",
      // If your apiCaller auto-attaches token, no need to add Authorization here manually
    };

    // Call your apiCaller
    const response = await apiCaller("POST",url, formData, headers);

    if (response) {
      setUploadSuccess(true);

        setIsOpen(false);
        setFiles([]);
        setUploadSuccess(false);
    } else {
      throw new Error(response.message || "Upload failed");
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    setUploadError(
      error.message || "Failed to upload files. Please try again."
    );
  } finally {
    setUploading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-medium">Check In</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              setIsOpen(false);
              setFiles([]);
              setUploadError(null);
              setUploadSuccess(false);
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Patient Details - New Compact Layout */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">Patient Details</h3>
            <div className="flex items-start mb-2">
              <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                <img
                  src={patient.photo}
                  alt={patient.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">{patient.name}</h4>
                  <div className="ml-2 bg-blue-100 text-blue-600 p-1 rounded-full">
                    <Check size={12} />
                  </div>
                </div>
                <p className="text-gray-500 text-sm">
                  {patient.age} Years, {patient.sex}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
              <div>
                <p className="text-gray-500">Email</p>
                <p>{patient.email}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p>{patient.phone}</p>
              </div>
              {/* <div>
                <p className="text-gray-500">Date of Birth</p>
                <p>{format(patient?.dateOfBirth,"dd-mm-yyyy")}</p>
              </div> */}
              <div>
                <p className="text-gray-500">Diseases</p>
                <p>{patient.disease}</p>
              </div>
            </div>
          </div>

          {/* File Upload Section - Simplified */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-md font-medium">Upload Documents</h3>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              Upload document signed by patient
            </p>

            {/* Upload Area - Simplified */}
            <div
              className="border border-dashed border-teal-300 bg-teal-50 rounded-lg p-4 text-center mb-4 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center">
                <div className="text-teal-500 mb-2">
                  <Upload size={24} />
                </div>
                <p className="text-gray-700 text-sm mb-1">
                  Drop your files here or click to browse
                </p>
                <p className="text-gray-500 text-xs">
                  Accepted file types: PDF, JPG, PNG (Max: 10MB)
                </p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                <div className="space-y-2">
                  {files.map((fileObj) => (
                    <div
                      key={fileObj.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-1 rounded mr-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-blue-600"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-xs">
                            {fileObj.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(fileObj.file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(fileObj.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error message */}
            {uploadError && (
              <div className="flex items-center text-red-500 mb-3">
                <AlertCircle size={16} className="mr-1" />
                <p className="text-sm">{uploadError}</p>
              </div>
            )}

            {/* Success message */}
            {uploadSuccess && (
              <div className="flex items-center text-green-500 mb-3">
                <Check size={16} className="mr-1" />
                <p className="text-sm">Files uploaded successfully!</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 text-sm"
              onClick={() => {
                setIsOpen(false);
                setFiles([]);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 flex items-center text-sm"
              onClick={handleSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  Check In <span className="ml-1">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInModal;
