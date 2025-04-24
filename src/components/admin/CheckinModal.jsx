import { X, CheckCircle, ArrowRight, Upload } from "lucide-react";

export default function CheckInModal({ isOpen=false, setIsOpen }) {
  

  // Hardcoded patient data object
  const patientData = {
    name: "Demi Wilkinson",
    age: "22 Years, Male",
    email: "wilkinson87@gmail.com",
    phone: "(704) 555-0783",
    dateOfBirth: "14 February 2003",
    diseases: "Cardiology",
    photoUrl: "/api/placeholder/80/80", // Using placeholder for the patient photo
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Button to reopen the modal (for demo purposes) */}
      {!isOpen && (
        <button
          className="px-4 py-2 bg-teal-500 text-white rounded-md"
          onClick={() => setIsOpen(true)}
        >
          Open Check-In Modal
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center p-4 ">
          {/* Modal Content */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="text-xl font-medium">Check In</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <h3 className="text-lg text-gray-700 mb-4">Patient Details</h3>

              <div className="flex gap-6 mb-6">
                {/* Patient Photo and Verification */}
                <div className="relative">
                  <img
                    src={patientData.photoUrl}
                    alt="Patient"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <CheckCircle
                      size={20}
                      className="text-blue-500 fill-blue-500"
                    />
                  </div>
                </div>

                {/* Patient Name and Age */}
                <div>
                  <h4 className="text-lg font-medium">{patientData.name}</h4>
                  <p className="text-gray-500">{patientData.age}</p>
                </div>
              </div>

              {/* Patient Information Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <p>{patientData.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Phone</p>
                  <p>{patientData.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Date of Birth</p>
                  <p>{patientData.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Diseases</p>
                  <p>{patientData.diseases}</p>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="mt-6">
                <div className="border-2 border-dashed border-teal-500 bg-teal-50 rounded-md p-6 flex items-center justify-center flex-col">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                    <Upload size={24} className="text-teal-600" />
                  </div>
                  <p className="text-gray-400 text-sm">
                    Upload document signed by patient
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 flex justify-end">
              <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md flex items-center">
                Check In
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
