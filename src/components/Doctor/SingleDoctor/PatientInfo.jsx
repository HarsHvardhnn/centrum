import React, { useState } from "react";

const patientData = {
  name: "undefined undefined",
  patientId: "P-1745725178981",
  avatar: "/path/to/patient-avatar.jpg",
  email: "harshvchawla9sds9sd7@gmail.com",
  phone: "08000561485",
  lastChecked: "Dr. Surajpancholi on April 28, 2025",
  prescription: "#67517886",
  weight: "78 kg",
  bp: "141/90 mmHg",
  pulseRate: "Normal",
  observation: "jasdisaiofaiosdoisad",
  medications: [
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "X 182 Days",
    },
    {
      name: "ajshdjs",
      dosage: "jjadhfj",
      frequency: "afhj",
      duration: "X 3 Days",
    },
  ],
  reports: [
    {
      name: "hospital_app/dnx2m9svmm6uu3d3gcwv",
      size: "32.0 KB",
      url: "https://res.cloudinary.com/ddrquhbgy/image/upload/v1745866947/hospital_app/dnx2m9svmm6uu3d3gcwv.jpg",
      type: "image/jpeg",
    },
    {
      name: "hospital_app/dnx2m9svmm6uu3d3gcwv",
      size: "32.0 KB",
      url: "https://res.cloudinary.com/ddrquhbgy/image/upload/v1745866947/hospital_app/dnx2m9svmm6uu3d3gcwv.jpg",
      type: "image/jpeg",
    },
    {
      name: "hospital_app/xiljmukoigmp1geglywf",
      size: "32.0 KB",
      url: "https://res.cloudinary.com/ddrquhbgy/image/upload/v1745867036/hospital_app/xiljmukoigmp1geglywf.jpg",
      type: "image/jpeg",
    },
  ],
};

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
  const ageGender = "N/A"; // Replace with actual data if available

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
                alt="User"
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
              <span className="font-semibold">Phone:</span> {patientData.phone}
            </p>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex flex-col gap-8 w-1/3 border-r">
              <div className="flex flex-col gap-4">
                <div>BP: {patientData.bp}</div>
                <div>Pulse: {patientData.pulseRate}</div>
                <div>Weight: {patientData.weight}</div>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Patient ID:</h3>
                <p>{patientData.patientId}</p>
              </div>
            </div>
            <div className="flex flex-col gap-8 w-2/3">
              <div className="flex flex-col gap-4">
                <div>Last Checked: {patientData.lastChecked}</div>
                <div>Prescription ID: {patientData.prescription}</div>
                <div>Observation: {patientData.observation}</div>
              </div>
              <div className="mb-6 flex gap-2">
                <h3 className="mb-2">Medications:</h3>
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
                Medical Report {index + 1}
              </h3>
              <div
                className="h-36 cursor-pointer"
                onClick={() => openImageModal(report.url)}
              >
                <img
                  src={report.url}
                  alt={`Medical Report ${index + 1}`}
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Image Modal */}
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
                alt="Full size medical report"
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
