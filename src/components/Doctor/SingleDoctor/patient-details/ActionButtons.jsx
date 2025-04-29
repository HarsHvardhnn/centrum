import React from "react";
import { apiCaller } from "../../../../utils/axiosInstance";

const ActionButtons = ({ onAddMedicineClick, onAddTestClick, patientId }) => {
  const handleDownloadVisitCard = async () => {
    try {
      const response = await apiCaller(
        "GET",
        `/visit-cards/generate/${patientId}`
      );

      const data = response.data;

      if (data.success && data.data.url) {
        // Create a temporary anchor element to download the PDF
        const downloadLink = document.createElement("a");
        downloadLink.href = data.data.url;
        downloadLink.target = "_blank";
        downloadLink.download = `visit_card_${patientId}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        console.error("Failed to generate visit card:", data.message);
        alert("Failed to generate visit card. Please try again.");
      }
    } catch (error) {
      console.error("Error downloading visit card:", error);
      alert("Error downloading visit card. Please try again.");
    }
  };

  return (
    <div className="flex gap-3 mt-4 justify-between border-b pb-4">
      {/* <button className="flex items-center justify-center border border-gray-200 rounded-lg px-4 py-2 text-sm">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Set New Appointment
      </button> */}
      <button
        className="flex items-center justify-center border border-gray-200 rounded-lg px-4 py-2 text-sm"
        onClick={handleDownloadVisitCard}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download Visit Card
      </button>
      {/* <button
        className="flex items-center justify-center border border-gray-200 rounded-lg px-4 py-2 text-sm"
        onClick={onAddTestClick}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Test
      </button> */}
      {/* <button className="flex items-center justify-center bg-teal-100 text-teal-600 rounded-lg px-4 py-2 text-sm">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        Set Monitoring Plan
      </button> */}
      {/* <button
        className="flex items-center justify-center bg-[#80c5c5] hover:bg-teal-500 text-white border border-gray-200 rounded-lg px-4 py-2 text-sm col-span-1"
        onClick={onAddMedicineClick}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Medicine
      </button> */}
    </div>
  );
};

export default ActionButtons;
