import React, { useState } from "react";
import DoctorCard from "./DoctorCard";
import { ArrowLeft, ArrowRight } from "lucide-react";

const DoctorListing = ({ doctors = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 4;

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  const totalPages = Math.ceil(doctors.length / doctorsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex flex-col">
      {/* Doctor cards */}
      <div className="mb-4">
        {currentDoctors.length > 0 ? (
          currentDoctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No doctors found matching your criteria
          </div>
        )}
      </div>

      {/* Pagination */}
      {doctors.length > 0 && (
        <div className="flex items-center justify-between shadow-md bg-white rounded-lg px-6 py-4 border border-gray-100">
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 gap-2 disabled:opacity-50"
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          <div className="flex mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .map((pageNumber) => {
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 &&
                    pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`w-10 h-10 flex items-center justify-center ${
                        currentPage === pageNumber
                          ? "text-teal-500 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }

                if (pageNumber === 2 && currentPage > 4) {
                  return (
                    <span
                      key="ellipsis-1"
                      className="w-10 h-10 flex items-center justify-center text-gray-500"
                    >
                      ...
                    </span>
                  );
                }

                if (
                  pageNumber === totalPages - 1 &&
                  currentPage < totalPages - 3
                ) {
                  return (
                    <span
                      key="ellipsis-2"
                      className="w-10 h-10 flex items-center justify-center text-gray-500"
                    >
                      ...
                    </span>
                  );
                }

                if (
                  (pageNumber >= 2 && pageNumber <= 4 && currentPage <= 4) ||
                  (pageNumber >= totalPages - 3 &&
                    pageNumber <= totalPages - 1 &&
                    currentPage >= totalPages - 3)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className="w-10 h-10 flex items-center justify-center text-gray-500"
                    >
                      {pageNumber}
                    </button>
                  );
                }

                return null;
              })
              .filter(Boolean)}
          </div>

          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-500 bg-white hover:bg-gray-50 gap-2 disabled:opacity-50"
          >
            Next
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorListing;
