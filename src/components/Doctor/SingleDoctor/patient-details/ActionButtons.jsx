import React, { useState } from "react";
import { useLoader } from "../../../../context/LoaderContext";
import { Download, Tag, Save } from "lucide-react";
import appointmentHelper from "../../../../helpers/appointmentHelper";
import { toast } from "sonner";
import { resolveDocumentOpenUrl } from "../../../../utils/documentUrl";
import { openPdfUrl, printPdfFromUrl } from "../../../../utils/pdfPrint";
import VisitCardActionModal from "./VisitCardActionModal";

const ActionButtons = ({ patientId, onAddServicesClick, onSave, appointmentId }) => {
  const { showLoader, hideLoader } = useLoader();
  const [showVisitCardModal, setShowVisitCardModal] = useState(false);
  const [pendingVisitCardData, setPendingVisitCardData] = useState(null);

  const handleDownloadVisitCard = async (forceNew = false) => {
    try {
      showLoader();
      const response = await appointmentHelper.generateVisitCard(appointmentId, forceNew);
      
      if (response.success && response.data.url) {
        if (response.message === "Karta wizyty już istnieje" && !forceNew) {
          setPendingVisitCardData({
            url: response.data.url,
            mode: "exists",
          });
          setShowVisitCardModal(true);
          hideLoader();
          return;
        }

        setPendingVisitCardData({
          url: response.data.url,
          mode: "ready",
        });
        setShowVisitCardModal(true);
        toast.success("Karta wizyty wygenerowana");
      } else {
        toast.error("Nie udało się wygenerować karty wizyty");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania karty wizyty:", error);
      toast.error("Błąd podczas pobierania karty wizyty");
    } finally {
      hideLoader();
    }
  };

  const visitCardOpenUrl = () =>
    resolveDocumentOpenUrl(pendingVisitCardData?.url) || pendingVisitCardData?.url;

  const handleViewExistingCard = async () => {
    const url = visitCardOpenUrl();
    if (url) {
      try {
        await openPdfUrl(url);
      } catch {
        window.open(url, "_blank");
      }
    }
    setPendingVisitCardData(null);
  };

  const handlePrintVisitCard = async () => {
    const url = visitCardOpenUrl();
    if (!url) return;
    try {
      await printPdfFromUrl(url);
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się otworzyć okna drukowania");
    }
  };

  const handleGenerateNewCard = async () => {
    await handleDownloadVisitCard(true);
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
      <VisitCardActionModal
        isOpen={showVisitCardModal}
        mode={pendingVisitCardData?.mode || "ready"}
        onClose={() => {
          setShowVisitCardModal(false);
          setPendingVisitCardData(null);
        }}
        onOpen={handleViewExistingCard}
        onPrint={handlePrintVisitCard}
        onGenerateNew={handleGenerateNewCard}
      />
    </>
  );
};

export default ActionButtons;
