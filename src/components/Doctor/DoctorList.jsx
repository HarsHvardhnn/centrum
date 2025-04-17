import React, { useState } from "react";
import DoctorCard from "./DoctorCard";

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
    <div className="flex flex-col h-screen">
      <div className="container mx-auto px-4 py-4 flex flex-col h-full">
        {/* <h1 className="text-2xl font-bold text-gray-dark mb-4">Our Doctors</h1> */}

        {/* Content area with fixed height and overflow */}
        <div className="flex-grow overflow-auto mb-2 px-1">
          {currentDoctors.length > 0 ? (
            currentDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-medium">
              No doctors found matching your criteria
            </div>
          )}
        </div>

        {doctors.length > 0 && (
          <div className="flex items-center justify-between shadow-md bg-white rounded-lg px-[24px] py-[16px] border border-gray-100">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-medium bg-white hover:bg-gray-50 gap-2 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-left"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
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
                            ? "text-primary font-medium"
                            : "text-gray-medium"
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
                        className="w-10 h-10 flex items-center justify-center text-gray-medium"
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
                        className="w-10 h-10 flex items-center justify-center text-gray-medium"
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
                        className={`w-10 h-10 flex items-center justify-center text-gray-medium`}
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
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-medium bg-white hover:bg-gray-50 gap-2 disabled:opacity-50"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorListing;
