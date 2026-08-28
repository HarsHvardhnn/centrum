import React, { useState, useEffect } from "react";
import { Download, Save, Check } from "lucide-react";

const DARK_TEAL = "#0f766e"; // dark teal, same as rest of app

const PatientDetailsFooter = ({
  onDownloadVisitCard,
  onSaveVisit,
  lastSavedTime,
  onEndVisit,
  isSaving,
  isVisitCompleted = false,
  isVisitReasonVerified = null,
  isVisitReasonVerifyLoading = false,
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
          disabled={isSaving || isVisitReasonVerifyLoading || isVisitReasonVerified === false}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-200/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={isVisitReasonVerified === false ? "Najpierw zweryfikuj rodzaj wizyty" : undefined}
        >
          <Download size={18} className="text-gray-600" />
          {isVisitReasonVerifyLoading
            ? "Sprawdzanie..."
            : isVisitReasonVerified === false
            ? "Pobierz po weryfikacji"
            : "Pobierz kartę wizyty"}
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

      {/* Right: dark teal "Zakończ wizytę" — same rule as visit card: require verified visit reason */}
      <div>
        <button
          type="button"
          onClick={isVisitCompleted ? undefined : onEndVisit}
          disabled={
            isVisitCompleted ||
            isSaving ||
            isVisitReasonVerifyLoading ||
            isVisitReasonVerified !== true
          }
          title={
            isVisitCompleted
              ? "Wizyta została już zakończona i rozliczona. Zmiany możesz zapisać przyciskiem „Zapisz wizytę”."
              : isVisitReasonVerified === false
              ? "Najpierw zweryfikuj rodzaj wizyty"
              : isVisitReasonVerified !== true && !isVisitReasonVerifyLoading
              ? "Oczekiwanie na status weryfikacji rodzaju wizyty"
              : undefined
          }
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm transition-opacity disabled:cursor-not-allowed disabled:hover:opacity-100 ${
            isVisitCompleted
              ? "bg-gray-300 text-gray-600"
              : "text-white hover:opacity-95 disabled:opacity-50"
          }`}
          style={isVisitCompleted ? undefined : { backgroundColor: DARK_TEAL }}
        >
          <Check size={18} />
          {isVisitCompleted ? "Wizyta zakończona" : "Zakończ wizytę"}
        </button>
      </div>
    </footer>
  );
};

export default PatientDetailsFooter;
