import React from "react";
import { FaStethoscope } from "react-icons/fa6";

const DoctorInfoCard = ({ doctor }) => {
  const {
    name,
    specialty,
    timeSlot,
    timeZone = "BST",
    description,
    avatarUrl,
  } = doctor;

  return (
    <div className="flex items-start p-4  rounded-lg">
      {/* Doctor Avatar */}
      <div className="mr-3">
        <img
          src={avatarUrl}
          alt={`Dr. ${name}`}
          className="w-16 h-16 rounded-full object-cover border border-blue-100"
        />
      </div>

      {/* Doctor Information */}
      <div className="flex flex-col">
        {/* Name */}
        <h2 className="text-lg font-bold text-gray-800 mb-1">Dr. {name}</h2>

        {/* Specialty and Time Slot */}
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-4 gap-2">
            <FaStethoscope />
            <span className="text-gray-600 text-sm">{specialty}</span>
          </div>

          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-gray-500 mr-[6px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-gray-600 text-sm">
              {timeSlot} {timeZone}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="flex gap-2">
          <svg
            className="size-4 text-gray-700 mt-1 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <p className="text-gray-600 text-sm leading-snug">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfoCard;
