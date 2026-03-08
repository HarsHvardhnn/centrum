import React, { useState } from "react";

const PATIENT_ID_PREFIX = "P-";

// Helpers for flexible API shape
const getName = (d) => {
  if (!d) return "";
  if (typeof d.name === "string") return d.name.trim();
  if (d.name?.first != null || d.name?.last != null) return `${d.name.first || ""} ${d.name.last || ""}`.trim();
  return "";
};

const getPesel = (d) => (d?.pesel ?? d?.PESEL ?? d?.identificationNumber ?? "");

const getPhone = (d) => {
  const p = d?.phone ?? d?.phoneNumber ?? d?.telephone ?? "";
  if (p == null || String(p).trim() === "" || String(p).trim().startsWith("__no_phone_")) return "";
  return String(p).trim();
};

const getPatientId = (d) => d?.patientId ?? d?.patient_id ?? d?.id ?? "";

const POLISH_MONTHS = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];

const formatVisitDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dayNum = d.getDate();
  const month = POLISH_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayNum} ${month} ${year}`;
};

const formatTimeRange = (start, end) => {
  const s = start ?? "";
  const e = end ?? "";
  if (!s && !e) return "—";
  return `${s} - ${e}`.replace(/^ - | - $/g, "—");
};

const statusLabel = (status) => {
  const s = (status || "").toLowerCase();
  if (s === "booked") return "Zarezerwowana";
  if (s === "checkedin" || s === "checked_in") return "Zameldowana";
  return status || "—";
};

const PatientInfo = ({ patientData, currentAppointment }) => {
  const [showAllMedsModal, setShowAllMedsModal] = useState(false);

  const name = getName(patientData);
  const pesel = getPesel(patientData);
  const phone = getPhone(patientData);
  const patientId = getPatientId(patientData);
  const isInternational = patientData?.isInternational === true || patientData?.isInternationalPatient === true;
  const documentId = patientData?.documentId ?? patientData?.internationalPatientDocumentKey ?? "";

  // Active medications only (status "Aktywny" or "active"), max 5 in list
  const medications = Array.isArray(patientData?.medications)
    ? patientData.medications.filter(
        (m) =>
          (String(m?.status || "").toLowerCase() === "aktywny") ||
          (String(m?.status || "").toLowerCase() === "active")
      )
    : [];
  const displayMeds = medications.slice(0, 5);
  const hasMoreMeds = medications.length > 5;

  const allergies = patientData?.allergies ?? patientData?.allergy ?? "";
  const consultationType = currentAppointment?.consultationType ?? currentAppointment?.visitType ?? patientData?.consultationType ?? "";
  const lastVisit = patientData?.lastVisit ?? patientData?.last_visit ?? patientData?.previousVisit ?? "";
  const lastDiagnosis = patientData?.lastDiagnosis ?? patientData?.last_diagnosis ?? patientData?.icd10 ?? patientData?.lastIcd10 ?? "";

  const visitDate = currentAppointment?.date ?? currentAppointment?.startDate ?? currentAppointment?.appointmentDate ?? "";
  const visitStart = currentAppointment?.startTime ?? currentAppointment?.start_time ?? "";
  const visitEnd = currentAppointment?.endTime ?? currentAppointment?.end_time ?? "";
  const visitStatus = currentAppointment?.status ?? "";

  const idDisplay = patientId ? (patientId.startsWith(PATIENT_ID_PREFIX) ? patientId : `${PATIENT_ID_PREFIX}${patientId}`) : "Brak ID – niezweryfikowany";
  const allergiesText = allergies && String(allergies).trim() ? allergies : "Brak zgłoszonych";

  return (
    <div className="bg-gray-50 flex flex-col">
      <div className="rounded-2xl max-w-5xl flex flex-col gap-4 p-4">
        {/* Top block – Basic patient data: name + PESEL, Telefon, ID pacjenta (three boxes) */}
        <div className="border rounded-2xl p-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{name || "—"}</h2>
          <div className="flex flex-wrap gap-3">
            {isInternational ? (
              <>
                <div className="rounded-lg border border-teal-300 bg-teal-50 text-teal-800 px-4 py-2.5 min-w-[140px]">
                  <p className="text-xs font-semibold uppercase mb-0.5 text-teal-600">ID dokumentu</p>
                  <p className="text-sm font-medium text-teal-900">{documentId || "—"}</p>
                </div>
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 min-w-[140px]">
                  <p className="text-xs font-semibold uppercase mb-0.5 text-amber-700">Pacjent międzynarodowy</p>
                  <p className="text-sm font-medium text-amber-900">Tak</p>
                </div>
              </>
            ) : (
              <div
                className={`rounded-lg border px-4 py-2.5 min-w-[140px] ${pesel ? "border-teal-300 bg-teal-50 text-teal-800" : "border-gray-200 bg-gray-50"}`}
              >
                <p className={`text-xs font-semibold uppercase mb-0.5 ${pesel ? "text-teal-600" : "text-gray-500"}`}>PESEL</p>
                <p className={`text-sm font-medium ${pesel ? "text-teal-900" : "text-gray-900"}`}>{pesel ? pesel : "Brak PESEL – niezweryfikowany"}</p>
              </div>
            )}
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 min-w-[140px]">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-0.5">Telefon</p>
              <p className="text-sm text-gray-900">{phone || ""}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 min-w-[140px]">
              <p className="text-xs font-semibold uppercase text-gray-500 mb-0.5">ID pacjenta</p>
              <p className="text-sm text-gray-900">{idDisplay}</p>
            </div>
          </div>
        </div>

        {/* Single column: BIEŻĄCA WIZYTA block (full width) */}
        <div className="rounded-2xl border bg-gray-50/80 border-gray-200 p-4">
          <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-4">Bieżąca wizyta</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Status wizyty</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  String(visitStatus).toLowerCase() === "checkedin" || String(visitStatus).toLowerCase() === "checked_in"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {statusLabel(visitStatus)}
              </span>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 inline-block">
              <p className="text-xs text-gray-500 mb-0.5">Data</p>
              <p className="text-gray-900">{formatVisitDate(visitDate)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 inline-block ml-0 sm:ml-2">
              <p className="text-xs text-gray-500 mb-0.5">Godzina</p>
              <p className="text-gray-900">{formatTimeRange(visitStart, visitEnd)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <p className="text-xs text-gray-500">Typ konsultacji:</p>
              {consultationType ? (
                <span className="inline-flex px-3 py-1 rounded-lg text-sm font-medium border border-teal-200 bg-teal-50 text-teal-800">
                  {consultationType}
                </span>
              ) : (
                <span className="text-gray-500">Brak informacji</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Ostatnia wizyta</p>
              <p className="text-gray-900">{lastVisit ? lastVisit : "Pierwsza wizyta"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Ostatnie rozpoznanie (ICD-10)</p>
              <p className="text-gray-900">{lastDiagnosis ? lastDiagnosis : "Brak rozpoznania"}</p>
            </div>
          </div>
        </div>

        {/* Single column: PROFIL MEDYCZNY block (full width) */}
        <div className="rounded-2xl border bg-gray-50/80 border-gray-200 p-4">
          <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wide mb-4">Profil medyczny</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-red-600 font-medium mb-0.5">Alergie</p>
              <p className="text-red-600">{allergiesText}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Leki stałe</p>
              {displayMeds.length === 0 ? (
                <p className="text-gray-500">Brak informacji</p>
              ) : (
                <ul className="space-y-2">
                  {displayMeds.map((med, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-900">
                        {med.name ?? med.nazwa ?? ""} {med.dosage ?? med.dawkowanie ?? ""}
                      </span>
                      {(med.frequency ?? med.czystotliwosc) && (
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                          {String(med.frequency ?? med.czystotliwosc).toUpperCase()}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {hasMoreMeds && (
                <button
                  type="button"
                  onClick={() => setShowAllMedsModal(true)}
                  className="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700 border border-teal-400 rounded-lg px-4 py-2"
                >
                  ZOBACZ PEŁNĄ HISTORIĘ LEKÓW
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: all active medications */}
      {showAllMedsModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllMedsModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Pełna historia leków</h3>
              <button
                type="button"
                onClick={() => setShowAllMedsModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2 pr-2">Nazwa leku</th>
                    <th className="pb-2 pr-2">Dawkowanie</th>
                    <th className="pb-2">Częstotliwość</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 pr-2">{med.name ?? med.nazwa ?? "—"}</td>
                      <td className="py-2 pr-2">{med.dosage ?? med.dawkowanie ?? "—"}</td>
                      <td className="py-2">{med.frequency ?? med.czystotliwosc ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientInfo;
