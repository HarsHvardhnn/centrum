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
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-3">
          <PatientSearchField onPatientSelect={handlePatientSelect} />

          {/* About the patient section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              About the patient
            </label>
            <div className="flex gap-2 mb-2">
              <div className="w-1/3">
                <input
                  type="text"
                  placeholder="Select patient source"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="w-1/3">
                <button className="w-full p-2 bg-teal-50 text-teal-700 rounded-md text-sm">
                  First-Time Visit
                </button>
              </div>
              <div className="w-1/3">
                <button className="w-full p-2 bg-teal-50 text-teal-700 rounded-md text-sm">
                  Re-Visit
                </button>
              </div>
            </div>

            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="international"
                className="h-4 w-4 text-teal-600 rounded mr-2"
              />
              <label htmlFor="international" className="text-sm text-gray-700">
                International Patient
              </label>
            </div>
          </div>

          {/* Doctor section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor
            </label>
            <div className="flex gap-2">
              <div className="w-1/3">
                <select className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm">
                  <option>Select doctor</option>
                </select>
              </div>
              <div className="w-1/3">
                <select className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm">
                  <option>Select visit type</option>
                </select>
              </div>
              <div className="w-1/3">
                <input
                  type="text"
                  placeholder="Enter slots number"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Time section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <div className="flex gap-2 mb-2">
              <div className="w-1/4">
                <input
                  type="text"
                  placeholder="25/05/2022"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                />
              </div>
              <div className="w-1/4">
                <input
                  type="text"
                  placeholder="03:00 PM"
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
                />
              </div>
              <div className="w-1/4">
                <button className="w-full p-2 text-teal-500 border border-teal-500 rounded-md text-sm">
                  Change Time
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="arrived"
                  className="h-4 w-4 text-teal-600 rounded mr-1"
                />
                <label htmlFor="arrived" className="text-xs text-gray-700">
                  Mark Apt as Arrived
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="walkin"
                  className="h-4 w-4 text-teal-600 rounded mr-1"
                />
                <label htmlFor="walkin" className="text-xs text-gray-700">
                  Is Walkin
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="attention"
                  className="h-4 w-4 text-teal-600 rounded mr-1"
                />
                <label htmlFor="attention" className="text-xs text-gray-700">
                  Needs Attention
                </label>
              </div>
            </div>
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Notes
            </label>
            <textarea
              placeholder="Enter patient details..."
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 h-16 text-sm"
            ></textarea>
          </div>

          <div className="flex items-center mb-3">
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
