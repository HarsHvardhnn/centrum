import { X, Plus, Check, Trash2 } from "lucide-react";
import { useFormContext } from "../../context/SubStepFormContext";
import { useState } from "react";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";

const ConsentDocumentUpload = ({currentPatientId}) => {
  const { formData, updateFormData } = useFormContext();
  //("formData", formData);
  const [activeTab, setActiveTab] = useState("consent");
  const [newConsent, setNewConsent] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize consents array if not exists
  if (!formData.consents) {
    updateFormData("consents", []);
    updateFormData("smsConsentAgreed", false);
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
    const updatedConsents = formData.consents.map((consent) => {
      if (consent.id === id) {
        const newAgreedValue = !consent.agreed;
        // Check if this is the SMS consent
        if (consent.text === "Pacjent wyraża zgodę na otrzymywanie powiadomień SMS") {
          updateFormData("smsConsentAgreed", newAgreedValue);
        }
        return { ...consent, agreed: newAgreedValue };
      }
      return consent;
    });

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
      //("newDocuments", newDocuments);
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
        name: file.name || file.fileName,

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

  const removeDocument = (document) => {
    setDocumentToDelete(document);
    setDeleteModalOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      //("documentToDelete", documentToDelete._id , currentPatientId);
      // If document has _id, it's from the server and needs API call
      if (documentToDelete._id && currentPatientId) {
        await apiCaller("DELETE", `/patients/${currentPatientId}/documents/${documentToDelete._id}`);
        toast.success("Dokument został pomyślnie usunięty");
      }

      // Remove from local state - identify document by _id if it exists, otherwise by id
      const newDocuments = formData.documents.filter((doc) => {
        // For server documents, compare by _id
        if (documentToDelete._id) {
          return doc._id !== documentToDelete._id;
        }
        // For local documents, compare by id
        return doc.id !== documentToDelete.id;
      });
      updateFormData("documents", newDocuments);
      
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Nie udało się usunąć dokumentu. Spróbuj ponownie.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteDocument = () => {
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  // Handle PDF click to open in new tab or show image preview
  const openPdfInNewTab = (document) => {
    //("document", document);
    
    if (document.isPdf || document.type === "application/pdf") {
      if (document.file) {
        const pdfUrl = URL.createObjectURL(document.file);
        window.open(pdfUrl, "_blank");
      } else if (document.preview || document.path) {
        window.open(document.preview || document.path, "_blank");
      }
    } else if (isImageFile(document)) {
      // For images, open the preview or path URL in new tab
      const imageUrl = document.preview || document.path || (document.file ? URL.createObjectURL(document.file) : null);
      if (imageUrl) {
        window.open(imageUrl, "_blank");
      }
    }
  };

  // Helper function to check if document is an image
  const isImageFile = (document) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(document.type) || 
           imageTypes.includes(document.mimeType) || 
           imageTypes.includes(document.fileType);
  };

  // Get the appropriate image source URL
  const getImageSrc = (document) => {
    if (document.preview) return document.preview;
    if (document.path) return document.path;
    if (document.file && document.file instanceof File) return URL.createObjectURL(document.file);
    return document; // Fallback for direct URL strings
  };

  // Common consent options
  const commonConsents = [
    "Pacjent wyraża zgodę na otrzymywanie powiadomień SMS",
    "Pacjent wyraża zgodę na udostępnienie informacji medycznych lekarzowi kierującemu",
    "Pacjent wyraża zgodę na usługi telemedyczne",
    "Pacjent wyraża zgodę na kontakt w sprawie wizyt kontrolnych",
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
          Zgody Pacjenta
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "documents"
              ? "border-b-2 border-primary-light text-primary"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("documents")}
        >
          Dokumenty
        </button>
      </div>

      {activeTab === "consent" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-800">
              Zgody Pacjenta
            </h2>
            <p className="text-gray-600">Zarządzaj zgodami pacjenta</p>
          </div>

          {/* Add new consent */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium mb-3">Dodaj Nową Zgodę</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newConsent}
                onChange={(e) => setNewConsent(e.target.value)}
                placeholder="Wprowadź treść zgody"
                className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={addConsent}
                className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary flex items-center"
              >
                <Plus size={18} className="mr-1" />
                Dodaj
              </button>
            </div>
          </div>

          {/* Common consents */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium mb-3">Szablony Typowych Zgód</h3>
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
            <h3 className="font-medium mb-3">Aktywne Zgody</h3>
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
                Brak dodanych zgód
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Dokumenty</h2>
          <p className="text-gray-600">
            Zarządzaj dokumentami i zdjęciami pacjenta
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

          {formData?.documents && formData?.documents.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Przesłane dokumenty</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData?.documents.map((document) => (
                  <div
                    key={document?.id}
                    className="relative border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    {(document?.isPdf || document?.type === "application/pdf") ? (
                      <div
                        onClick={() => openPdfInNewTab(document)}
                        className="flex items-center p-2 cursor-pointer hover:bg-gray-50 rounded transition-colors"
                        title="Kliknij, aby otworzyć PDF"
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
                            {document?.fileName?.split(".")[0] || document?.name || 'Dokument PDF'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Kliknij, aby otworzyć PDF w nowej karcie
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <div 
                          className="aspect-[4/3] overflow-hidden flex items-center justify-center bg-gray-100 rounded-lg mb-2 cursor-pointer hover:bg-gray-200 transition-colors"
                          onClick={() => openPdfInNewTab(document)}
                          title="Kliknij, aby zobaczyć pełny rozmiar"
                        >
                          {isImageFile(document) ? (
                            <img
                              src={getImageSrc(document)}
                              alt={document?.name || 'Obraz'}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDE5VjVDMjEgMy45IDIwLjEgMyAxOSAzSDVDMy45IDMgMyAzLjkgMyA1VjE5QzMgMjAuMSAzLjkgMjEgNSAyMUgxOUMyMC4xIDIxIDIxIDIwLjEgMjEgMTlaIiBzdHJva2U9IiM5Q0E3QkEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41IiBzdHJva2U9IiM5Q0E3QkEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yMSAxNUwxNiAxMEw1IDIxIiBzdHJva2U9IiM5Q0E3QkEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center text-gray-500">
                              <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs">Nieobsługiwany format</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm truncate font-medium text-center">
                          {document?.fileName?.split(".")[0] || document?.name || 'Bez nazwy'}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => removeDocument(document)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Remove document"
                      title="Usuń dokument"
                    >
                      <Trash2 size={16} className="text-gray-700 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Potwierdź usunięcie
              </h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Czy na pewno chcesz usunąć dokument{" "}
              <span className="font-medium">
                "{documentToDelete?.fileName || documentToDelete?.name || 'Bez nazwy'}"
              </span>?
              <br />
              <span className="text-sm text-red-600 mt-2 block">
                Ta operacja jest nieodwracalna.
              </span>
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteDocument}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDeleteDocument}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Usuwanie...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Usuń
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsentDocumentUpload;
