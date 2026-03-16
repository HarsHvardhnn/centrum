import React, { useState, useEffect } from "react";
import { Download, Save, Check } from "lucide-react";

const DARK_TEAL = "#0f766e"; // dark teal, same as rest of app

const PatientDetailsFooter = ({
  onDownloadVisitCard,
  onSaveVisit,
  lastSavedTime,
  onEndVisit,
  isSaving,
}) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const format = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("pl-PL", {
          timeZone: "Europe/Warsaw",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    format();
    const t = setInterval(format, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-10">
      {/* Left: two light grey buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDownloadVisitCard}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-200/80 transition-colors"
        >
          <Download size={18} className="text-gray-600" />
          Pobierz kartę wizyty
        </button>
        <button
          type="button"
          onClick={onSaveVisit}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save size={18} className="text-gray-600" />
          {isSaving ? "Zapisywanie..." : "Zapisz wizytę"}
        </button>
      </div>

      {/* Middle: last auto-save time + current time (Poland) */}
      <div className="flex items-center justify-center gap-6">
        <span className="text-sm text-gray-500">
          Ostatni autozapis: {lastSavedTime ?? "—"}
        </span>
        <span className="text-sm text-gray-500">
          Godzina: {currentTime}
        </span>
      </div>

      {/* Right: dark teal "Zakończ wizytę" */}
      <div>
        <button
          type="button"
          onClick={onEndVisit}
          className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-medium rounded-sm hover:opacity-95 transition-opacity"
          style={{ backgroundColor: DARK_TEAL }}
        >
          <Check size={18} />
          Zakończ wizytę
        </button>
      </div>
    </footer>
  );
};

export default PatientDetailsFooter;
