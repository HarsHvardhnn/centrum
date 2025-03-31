// src/components/AppointmentForm/PatientSelectionStep.jsx
import { useState } from "react";
import { useMultiStepForm } from "../MultiStepForm";
import PatientSearchField from "./PatientSearchField";

const PatientSelectionStep = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { nextStep } = useMultiStepForm();

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleContinue = () => {
    if (selectedPatient) {
      nextStep();
    }
  };

  return (
    // Remove the fixed height and overflow property that's causing scrollbar issues
    <div className="w-full">
      <div className="space-y-2">  {/* Reduced spacing between elements */}
        <PatientSearchField onPatientSelect={handlePatientSelect} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1"> {/* Reduced margin */}
            About the patient
          </label>

          {/* Mint background container - reduced padding */}
          <div className="bg-primary-lighter p-3 inline-block rounded-lg mb-2">
            <div className="flex gap-3 items-center"> {/* Reduced gap */}
              {/* Patient source input */}
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Select patient source"
                  className="w-full p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Visit type radio buttons */}
              <div className="w-full flex justify-between items-center gap-3">
                <label className="inline-flex items-center whitespace-nowrap">
                  <input
                    type="radio"
                    name="visitType"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">First-Time Visit</span>
                </label>
                <label className="inline-flex items-center whitespace-nowrap">
                  <input
                    type="radio"
                    name="visitType"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">Re-Visit</span>
                </label>
              </div>
            </div>
          </div>

          {/* International Patient checkbox - OUTSIDE the mint background */}
          <div className="flex items-center">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="international"
                className="h-5 w-5 text-purple-600 border-gray-300 rounded-md focus:ring-purple-500"
              />
              <span className="ml-2 text-gray-700">International Patient</span>
            </label>
          </div>
        </div>

        {/* Doctor section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor
          </label>
          <div className="bg-primary-lighter p-3 rounded-lg">
            <div className="flex gap-3">
              <div className="w-1/3">
                <div className="relative">
                  <select className="w-full appearance-none p-2 pl-3 pr-8 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500">
                    <option value="">Select doctor</option>
                    <option value="test">Test Doctor</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="#667085"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="w-1/3">
                <div className="relative">
                  <select className="w-full appearance-none p-2 pl-3 pr-8 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500">
                    <option value="">Select visit type</option>
                    <option value="test">Test visit type</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="#667085"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="w-1/3">
                <input
                  type="text"
                  placeholder="Enter slots number"
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Time section */}
        <div className="w-[50%]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>

          {/* Light teal background container */}
          <div className="bg-primary-lighter p-3 rounded-lg mb-2">
            <div className="flex gap-2 items-center">
              {/* Date input */}
              <div className="w-1/3">
                <input
                  type="text"
                  placeholder="25/05/2022"
                  className="w-full p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Time input */}
              <div className="w-1/3">
                <input
                  type="text"
                  placeholder="03:00 PM"
                  className="w-full p-2 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Change Time button */}
              <div className="w-1/3">
                <button className="w-full p-1 text-teal-500 rounded-lg text-sm hover:underline">
                  Change Time
                </button>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex gap-x-4 gap-y-1 flex-wrap">
            {/* Mark Apt as Arrived */}
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="arrived"
                className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mark Apt as Arrived
              </span>
            </label>

            {/* Is Walkin */}
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="walkin"
                className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">Is Walkin</span>
            </label>

            {/* Needs Attention */}
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="attention"
                className="h-4 w-4 text-gray-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Needs Attention
              </span>
            </label>
          </div>
        </div>

        {/* Review Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Review Notes
          </label>
          <textarea
            placeholder="Enter patient details..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 h-12 text-sm"
          ></textarea>
        </div>

        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="repeat-patient"
            className="h-4 w-4 text-teal-600 rounded mr-2"
          />
          <label htmlFor="repeat-patient" className="text-sm text-gray-700">
            Enable repeats patient
          </label>
        </div>

        {/* <div className="text-right">
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 inline-flex items-center text-sm"
            >
              Add Appointment
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div> */}
      </div>
    </div>
  );
};

export default PatientSelectionStep;