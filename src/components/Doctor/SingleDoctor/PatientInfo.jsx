import React, { useState } from "react";



const PatientInfo = ({ patientData }) => {
  console.log("Patient Data in info:", patientData);
  
  const [selectedImage, setSelectedImage] = useState(null);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Extract first name and last name from full name or use placeholder


  // Calculate age and gender (placeholder since not provided in new data)

  return (
    <div className="bg-gray-50">
      <div className="rounded-2xl max-w-5xl mx-auto flex flex-col gap-4">
        <div className="border rounded-2xl p-4 bg-white">
          <div className="flex items-center space-x-6 mb-6 border-b pb-2">
            <div className="flex gap-2 w-full">
              <img
                src={
                  patientData.avatar ||
                  "https://randomuser.me/api/portraits/men/75.jpg"
                }
                alt="Użytkownik"
                className="size-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold">{`${patientData.name?.first || ""} ${patientData.name?.last || ""}`}</h2>
                <p className="text-xs">{patientData.patientId}</p>
              </div>
            </div>

            <p className="text-sm w-full flex flex-col border-l px-2">
              <span className="font-semibold">Email:</span> {patientData.email}
            </p>
            <p className="text-sm w-full flex flex-col border-l px-2">
              <span className="font-semibold">Telefon:</span> {patientData.phone}
            </p>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex flex-col gap-8 w-1/3 border-r">
              <div className="flex flex-col gap-4">
                <div>Ciśnienie krwi: {patientData.bp}</div>
                <div>Tętno: {patientData.pulseRate}</div>
                <div>Waga: {patientData.weight}</div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold mb-2">ID Pacjenta:</h3>
                <p>{patientData.patientId}</p>
              </div>
            </div>
            <div className="flex flex-col gap-8 w-2/3">
              <div className="flex flex-col gap-4">
                <div>Ostatnie badanie: {patientData.lastChecked}</div>
                <div>ID Recepty: {patientData.prescription}</div>
                <div>Obserwacje: {patientData.observation}</div>
              </div>
              <div className="mb-6 flex gap-2">
                <h3 className="mb-2">Leki:</h3>
                <div className="list-disc list-inside space-y-4">
                  {patientData.medications.map((med, i) => (
                    <p key={i}>
                      {med.name} {med.dosage} {med.frequency} - {med.duration}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {patientData.reports.map((report, index) => (
            <div key={index} className="border rounded-2xl bg-white p-4">
              <h3 className="font-semibold mb-2 text-sm">
                {report?.name || "Raport"} -{`type ${report?.type}` || "Raport"}
              </h3>
              <div
                className="h-36 cursor-pointer"
                onClick={() => openImageModal(report.fileUrl)}
              >
                <img
                  src={report.fileUrl}
                  alt={`Raport medyczny ${index + 1}`}
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Modal ze zdjęciem */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeImageModal}
          >
            <div
              className="max-w-4xl max-h-4xl p-2 bg-white rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-2">
                <button
                  className="bg-gray-200 p-1 rounded-full"
                  onClick={closeImageModal}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <img
                src={selectedImage}
                alt="Pełnowymiarowy raport medyczny"
                className="max-h-screen max-w-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientInfo;
