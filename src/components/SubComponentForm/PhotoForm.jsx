import { X, Plus, Check } from "lucide-react";
import { useFormContext } from "../../context/SubStepFormContext";
import { useState } from "react";

const ConsentDocumentUpload = () => {
  const { formData, updateFormData } = useFormContext();
  const [activeTab, setActiveTab] = useState("consent");
  const [newConsent, setNewConsent] = useState("");

  // Initialize consents array if not exists
  if (!formData.consents) {
    updateFormData("consents", []);
  }

  // Add a new consent
  const addConsent = () => {
    if (newConsent.trim() === "") return;

    const updatedConsents = [...(formData.consents || [])];
    updatedConsents.push({
      id: Date.now(),
      text: newConsent,
      agreed: false,
    });

    updateFormData("consents", updatedConsents);
    setNewConsent("");
  };

  // Toggle consent agreement
  const toggleConsent = (id) => {
    const updatedConsents = formData.consents.map((consent) =>
      consent.id === id ? { ...consent, agreed: !consent.agreed } : consent
    );

    updateFormData("consents", updatedConsents);
  };

  // Remove a consent
  const removeConsent = (id) => {
    const updatedConsents = formData.consents.filter(
      (consent) => consent.id !== id
    );
    updateFormData("consents", updatedConsents);
  };

  // Handle file upload for documents
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDocuments = [...(formData.documents || [])];

      // Create document object
      const document = {
        id: Date.now(),
        file: file,
        name: file.name,
        type: file.type,
        // Create preview URL for images only
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        isPdf: file.type === "application/pdf",
      };

      newDocuments.push(document);
      updateFormData("documents", newDocuments);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const newDocuments = [...(formData.documents || [])];

      // Create document object
      const document = {
        id: Date.now(),
        file: file,
        name: file.name,
        type: file.type,
        // Create preview URL for images only
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        isPdf: file.type === "application/pdf",
      };

      newDocuments.push(document);
      updateFormData("documents", newDocuments);
    }
  };

  const removeDocument = (id) => {
    const newDocuments = formData.documents.filter((doc) => doc.id !== id);
    updateFormData("documents", newDocuments);
  };

  // Handle PDF click to open in new tab
  const openPdfInNewTab = (document) => {
    if (document.isPdf && document.file) {
      const pdfUrl = URL.createObjectURL(document.file);
      window.open(pdfUrl, "_blank");
    }
  };

  // Common consent options
  const commonConsents = [
    "Patient agrees to receive SMS notifications",
    "Patient agrees to share medical information with referring doctor",
    "Patient consents to telehealth services",
    "Patient agrees to be contacted for follow-up appointments",
  ];

  // Add a common consent
  const addCommonConsent = (text) => {
    const updatedConsents = [...(formData.consents || [])];
    // Check if consent already exists
    if (!updatedConsents.some((c) => c.text === text)) {
      updatedConsents.push({
        id: Date.now(),
        text: text,
        agreed: false,
      });

      updateFormData("consents", updatedConsents);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === "consent"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("consent")}
        >
          Patient Consents
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "documents"
              ? "border-b-2 border-primary-light text-primary"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
      </div>

      {activeTab === "consent" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800">
              Patient Consents
            </h2>
            <p className="text-gray-600">Manage patient consent agreements</p>
          </div>

          {/* Add new consent */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium mb-3">Add New Consent</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newConsent}
                onChange={(e) => setNewConsent(e.target.value)}
                placeholder="Enter consent statement"
                className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={addConsent}
                className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary flex items-center"
              >
                <Plus size={18} className="mr-1" />
                Add
              </button>
            </div>
          </div>

          {/* Common consents */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium mb-3">Common Consent Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commonConsents.map((text, index) => (
                <button
                  key={index}
                  onClick={() => addCommonConsent(text)}
                  className="text-left p-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center"
                >
                  <Plus size={16} className="mr-2 text-purple-600" />
                  <span className="text-sm">{text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* List of consents */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium mb-3">Active Consents</h3>
            {formData.consents && formData.consents.length > 0 ? (
              <ul className="space-y-3">
                {formData.consents.map((consent) => (
                  <li
                    key={consent.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleConsent(consent.id)}
                        className={`w-5 h-5 flex-shrink-0 rounded ${
                          consent.agreed
                            ? "bg-green-500"
                            : "border border-gray-400"
                        } flex items-center justify-center`}
                      >
                        {consent.agreed && (
                          <Check size={14} className="text-white" />
                        )}
                      </button>
                      <span
                        className={
                          consent.agreed ? "text-gray-800" : "text-gray-600"
                        }
                      >
                        {consent.text}
                      </span>
                    </div>
                    <button
                      onClick={() => removeConsent(consent.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No consents added yet
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Document Upload</h2>
          <p className="text-gray-600">
            Upload patient documents (PDF or Images)
          </p>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("document-upload").click()}
          >
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <svg
                className="w-6 h-6 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
            </div>

            <p className="mb-1">
              <span className="text-primary font-medium">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-gray-500 text-sm">
              PDF or Image files (JPG, PNG, GIF)
            </p>
          </div>

          <input
            type="file"
            className="hidden"
            id="document-upload"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
          />

          {formData.documents && formData.documents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Uploaded Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.documents.map((document) => (
                  <div
                    key={document.id}
                    className="relative border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    {document.isPdf ? (
                      <div
                        onClick={() => openPdfInNewTab(document)}
                        className="flex items-center p-2 cursor-pointer hover:bg-gray-50 rounded"
                      >
                        <div className="bg-red-100 p-2 rounded-lg mr-3">
                          <svg
                            className="w-8 h-8 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </div>
                        <div className="truncate flex-1">
                          <p className="font-medium truncate">
                            {document.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Click to view PDF
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div className="aspect-[4/3] overflow-hidden flex items-center justify-center bg-gray-100 rounded-lg mb-2">
                          {document.preview ? (
                            <img
                              src={document.preview}
                              alt={document.name}
                              className="max-w-full max-h-full object-contain"
                            />
                            ):
                            (
                            <img
                              src={document}
                              alt={document}
                              className="max-w-full max-h-full object-contain"
                            />
                            )
                          }
                        </div>
                        <p className="text-sm truncate font-medium text-center">
                          {document.name}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => removeDocument(document.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      aria-label="Remove document"
                    >
                      <X size={16} className="text-gray-700" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsentDocumentUpload;
