import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, ChevronRight, Eye } from "lucide-react";
import RoleAccess from "../UtilComponents/RoleAccess";

const DoctorListing = ({ doctors = [], onManageSchedule }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 10;

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToPrevious = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const specialtyLabel = (doc) =>
    typeof doc.specialty === "object" && doc.specialty?.name
      ? doc.specialty.name
      : doc.specialty || "Ogólny";

  const statusLabel = (doc) => {
    const s = (doc.status || "").trim().toLowerCase();
    if (s === "available") return "Dostępny";
    if (s === "unavailable") return "Niedostępny";
    if (doc.status) return doc.status;
    return doc.available ? "Dostępny" : "Niedostępny";
  };

  return (
    <div className="space-y-3">
      {/* Column headers */}
      <div className="grid grid-cols-[minmax(0,1.1fr)_9rem_7.5rem_6.5rem_minmax(18rem,1.4fr)] gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">
        <div>Lekarz i ID</div>
        <div>Specjalizacja</div>
        <div>Status</div>
        <div>Data</div>
        <div className="text-right">Akcje</div>
      </div>

      {currentDoctors.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-12 text-center text-gray-500">
          Nie znaleziono lekarzy.
        </div>
      ) : (
        currentDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white border border-gray-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow grid grid-cols-[minmax(0,1.1fr)_9rem_7.5rem_6.5rem_minmax(18rem,1.4fr)] gap-4 px-4 py-3 items-center"
          >
            <div className="min-w-0 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-medium">
                    {doctor.name?.charAt(0) || "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">{doctor.name}</div>
                <div className="text-sm text-gray-500 truncate">ID: {doctor.id}</div>
              </div>
            </div>
            <div className="text-gray-800 truncate text-sm">{specialtyLabel(doctor)}</div>
            <div className="text-gray-800 truncate text-sm">
              {statusLabel(doctor)}
            </div>
            <div className="text-gray-800 truncate text-sm">{doctor.date || "—"}</div>
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <RoleAccess allowedRoles={["admin", "receptionist"]}>
                <button
                  type="button"
                  onClick={() => onManageSchedule?.(doctor)}
                  className="inline-flex items-center gap-1.5 border border-teal-600 text-teal-700 hover:bg-teal-50 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                >
                  <Calendar size={16} />
                  Grafik
                </button>
              </RoleAccess>
              <button
                type="button"
                onClick={() => navigate(`/lekarze/wizyty/${doctor.id}`)}
                className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                Zobacz wizyty
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/szczegoly-lekarza/${doctor.id}`)}
                className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                <Eye size={16} />
                Szczegóły
              </button>
            </div>
          </div>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Poprzednia
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            Strona {currentPage} z {totalPages}
          </span>
          <button
            type="button"
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Następna
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorListing;
