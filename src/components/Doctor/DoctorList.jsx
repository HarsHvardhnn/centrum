import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronRight, Eye } from "lucide-react";

const DoctorListing = ({ doctors = [] }) => {
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
      : doc.specialty || "General";

  const statusLabel = (doc) => {
    const s = (doc.status || "").trim().toLowerCase();
    if (s === "available" || s === "dostępny") return "Available";
    if (s === "unavailable" || s === "niedostępny") return "Unavailable";
    if (doc.status) return doc.status;
    return doc.available ? "Available" : "Unavailable";
  };

  return (
    <div className="space-y-3">
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_10rem_8rem_7rem_1fr] gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">
        <div>Doctor & ID</div>
        <div>Specialty</div>
        <div>Status</div>
        <div>Date</div>
        <div className="text-right">Actions</div>
      </div>

      {currentDoctors.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm py-12 text-center text-gray-500">
          No doctors found.
        </div>
      ) : (
        currentDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white border border-gray-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow grid grid-cols-[1fr_10rem_8rem_7rem_1fr] gap-4 px-4 py-3 items-center"
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
              <button
                type="button"
                onClick={() => navigate(`/lekarze/wizyty/${doctor.id}`)}
                className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                View appointments
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate(`/szczegoly-lekarza/${doctor.id}`)}
                className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                <Eye size={16} />
                Details
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
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            Next
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorListing;
