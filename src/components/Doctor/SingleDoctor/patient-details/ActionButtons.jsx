import React, { useState } from "react";
import { useLoader } from "../../../../context/LoaderContext";
import { Download, Tag, Save, FileText } from "lucide-react";
import appointmentHelper from "../../../../helpers/appointmentHelper";
import { toast } from "sonner";

const ActionButtons = ({ patientId, onAddServicesClick, onSave, appointmentId }) => {
  const { showLoader, hideLoader } = useLoader();
  const [showVisitCardModal, setShowVisitCardModal] = useState(false);
  const [pendingVisitCardData, setPendingVisitCardData] = useState(null);

  const handleDownloadVisitCard = async (forceNew = false) => {
    try {
      showLoader();
      const response = await appointmentHelper.generateVisitCard(appointmentId, forceNew);
      
      //("response", response);
      if (response.success && response.data.url) {
        // Check if visit card already exists
        if (response.message === "Karta wizyty już istnieje" && !forceNew) {
          // Store the data for the modal
          setPendingVisitCardData({
            url: response.data.url
          });
          setShowVisitCardModal(true);
          hideLoader();
          return;
        }
        
        // Download the visit card
        const downloadLink = document.createElement("a");
        downloadLink.href = response.data.url;
        downloadLink.target = "_blank";
        downloadLink.download = `karta_wizyty_${patientId}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast.success("Karta wizyty została pobrana");
      } else {
        console.error("Nie udało się wygenerować karty wizyty:", response.message);
        toast.error("Nie udało się wygenerować karty wizyty");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania karty wizyty:", error);
      toast.error("Błąd podczas pobierania karty wizyty");
    } finally {
      hideLoader();
    }
  };

  // Handle viewing existing visit card
  const handleViewExistingCard = () => {
    if (pendingVisitCardData?.url) {
      window.open(pendingVisitCardData.url, '_blank');
    }
    setPendingVisitCardData(null);
  };

  // Handle generating new visit card
  const handleGenerateNewCard = async () => {
    await handleDownloadVisitCard(true);
    setPendingVisitCardData(null);
  };

  // Visit Card Confirmation Modal Component
  const VisitCardConfirmationModal = ({ isOpen, onClose, onViewExisting, onGenerateNew }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <div className="flex items-center mb-4">
            <FileText className="text-teal-500 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Karta wizyty już istnieje</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Dla tej wizyty została już wygenerowana karta wizyty. Czy chcesz wyświetlić istniejącą kartę, czy pobrać nową?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anuluj
            </button>
            <button
              onClick={() => {
                onGenerateNew();
                onClose();
              }}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Pobierz nową
            </button>
            <button
              onClick={() => {
                onViewExisting();
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Wyświetl istniejącą
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex gap-3 mt-4 justify-between border-b pb-4">
        <button
          className="flex items-center justify-center border border-gray-200 rounded-lg px-4 py-2 text-sm"
          onClick={() => handleDownloadVisitCard()}
        >
          <Download size={16} className="mr-2" />
          Pobierz kartę wizyty
        </button>
        
        <button
          className="flex items-center justify-center border border-gray-200 bg-teal-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-teal-600 transition-colors"
          onClick={onAddServicesClick}
        >
          <Tag size={16} className="mr-2" />
          Dodaj usługi
        </button>
        
        <button
          className="flex items-center justify-center border border-gray-200 bg-teal-500 text-white rounded-lg px-4 py-2 text-sm hover:bg-teal-600 transition-colors"
          onClick={onSave}
        >
          <Save size={16} className="mr-2" />
          Zapisz wizytę
        </button>
      </div>
      
      {/* Visit Card Confirmation Modal */}
      <VisitCardConfirmationModal
        isOpen={showVisitCardModal}
        onClose={() => {
          setShowVisitCardModal(false);
          setPendingVisitCardData(null);
        }}
        onViewExisting={handleViewExistingCard}
        onGenerateNew={handleGenerateNewCard}
      />
    </>
  );
};

export default ActionButtons;
