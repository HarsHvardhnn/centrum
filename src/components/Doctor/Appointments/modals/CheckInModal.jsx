import React, { useState } from "react";

const PatientModal = ({ isOpen, onClose, patientDetails }) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  if (!isOpen) return null;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold">Zameldowanie</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Patient Details */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-600">Dane pacjenta</h3>
          <div className="flex items-center mt-2">
            <img
              src={patientDetails.image}
              alt="Pacjent"
              className="w-12 h-12 rounded-full border"
            />
            <div className="ml-4">
              <p className="font-bold">{patientDetails.name}</p>
              <p className="text-sm text-gray-500">{patientDetails.ageGender}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
            <div>
              <span className="font-semibold">Email:</span> {patientDetails.email}
            </div>
            <div>
              <span className="font-semibold">Telefon:</span> {patientDetails.phone}
            </div>
            <div>
              <span className="font-semibold">Data urodzenia:</span>{" "}
              {patientDetails.dob}
            </div>
            <div>
              <span className="font-semibold">Choroby:</span>{" "}
              {patientDetails.diseases}
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="mt-6">
          <label
            htmlFor="file-upload"
            className="block border-dashed border-2 border-teal-300 bg-teal-50 rounded-lg p-4 cursor-pointer text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#14b8a6"
              className="w-8 h-8 mx-auto mb-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {uploadedFile ? (
              <p>{uploadedFile.name}</p>
            ) : (
              <>
                <p>Prześlij dokument podpisany przez pacjenta</p>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg mr-2 hover:bg-gray-300"
          >
            Anuluj
          </button>
          <button
            onClick={() => alert("Zameldowano")}
            disabled={!uploadedFile}
            className={`px-4 py-2 rounded-lg ${
              uploadedFile
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "bg-teal-300 text-white cursor-not-allowed"
            }`}
          >
            Zamelduj →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientModal;
