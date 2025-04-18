import React, { useState } from "react";
import { ChevronDown, ArrowLeft, Upload, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientDetailsPage = ({ patient = defaultPatient }) => {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      name: "Tech design requirements.pdf",
      size: "200 KB",
      progress: 10,
    },
  ]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm text-[#80c5c5] font-medium ">
        <button onClick={handleGoBack} className=" mr-2">
          <ArrowLeft size={18} />
        </button>
        <span
          className="cursor-pointer"
          onClick={() => navigate("/doctor-appointment")}
        >
          Doctor Appointment
        </span>
        <span className="mx-2">/</span>
        <span
          className="cursor-pointer"
          onClick={() => navigate("/patients-details")}
        >
          Patients Details
        </span>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{patient.name}</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Patient Profile */}
          <div className="w-full md:w-1/3 md:border-r border-gray-100 p-6">
            {/* Profile Info */}
            <div className="w-full flex  items-center">
              <div className="flex flex-col items-center text-center w-1/2 mb-6">
                <div className="relative mb-2">
                  <div className="w-16 h-16 rounded-full bg-blue-100 overflow-hidden">
                    <img
                      src={patient.avatar}
                      alt={patient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                    <div className="bg-white rounded-full p-0.5">
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-500"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-base">{patient.name}</h3>
                <p className="text-xs text-gray-500">
                  {patient.age} Years, {patient.gender}
                </p>
              </div>

              {/* Status Card */}
              <div className="bg-teal-50 rounded-lg p-4 w-1/2">
                <h4 className="text-sm font-medium mb-3">Current Status</h4>

                <div className="bg-[#cce8e8] rounded-md p-2 mb-2 text-xs text-center">
                  Room Number: 28B
                </div>

                <div className="bg-[#cce8e8] rounded-md p-2 mb-2 text-xs flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mr-2"></div>
                    Risky
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>

                <div className="bg-[#cce8e8] rounded-md p-2 text-xs flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mr-2"></div>
                    Under Treatment
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>
              </div>
            </div>
            {/* Contact Info */}
            <div className="mb-6 grid grid-cols-2 gap-4 mt-4 border-y py-4">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm">{patient.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Numer telefonu</p>
                <p className="text-sm">{patient.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data urodzenia</p>
                <p className="text-sm">{patient.birthDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Choroby</p>
                <p className="text-sm">{patient.disease}</p>
              </div>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Blood Pressure</p>
                <p className="text-xs text-gray-500">30%</p>
                <div className="relative w-full h-1.5 bg-gray-200 rounded-full mt-1">
                  <div
                    className="absolute h-1.5 bg-[#99d1d1] rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <p className="text-xs mt-1">141/90 mmHg</p>
              </div>

              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Blood Pressure</p>
                <p className="text-xs text-gray-500">30%</p>
                <div className="relative w-full h-1.5 bg-gray-200 rounded-full mt-1">
                  <div
                    className="absolute h-1.5 bg-[#99d1d1] rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <p className="text-xs mt-1">29°C</p>
              </div>

              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Body Height</p>
                <p className="text-xs text-gray-500">30%</p>
                <div className="relative w-full h-1.5 bg-gray-200 rounded-full mt-1">
                  <div
                    className="absolute h-1.5 bg-[#99d1d1] rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <p className="text-xs mt-1">78kg</p>
              </div>

              <div className="bg-teal-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Body Height</p>
                <p className="text-xs text-gray-500">30%</p>
                <div className="relative w-full h-1.5 bg-gray-200 rounded-full mt-1">
                  <div
                    className="absolute h-1.5 bg-[#99d1d1] rounded-full"
                    style={{ width: "30%" }}
                  ></div>
                </div>
                <p className="text-xs mt-1">5'6" inc</p>
              </div>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="w-full md:w-2/3 p-6">
            {/* Doctor Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Attending doctor
                </label>
                <input
                  type="text"
                  value="Dr. Stephen Conley"
                  className="w-full p-2.5 border border-gray-200 rounded-lg"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Consultation Type
                </label>
                <input
                  type="text"
                  value="Clinic Consulting"
                  className="w-full p-2.5 border border-gray-200 rounded-lg"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patient.name}
                  className="w-full p-2.5 border border-gray-200 rounded-lg"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  In-person consultation at the clinic
                </label>
                <div className="relative">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <div className="pl-2.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value="Konsultacja online"
                      className="w-full p-2.5 border-none rounded-lg"
                      readOnly
                    />
                    <div className="pr-2.5">
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Consultation time
                </label>
                <div className="relative flex items-center border border-gray-200 rounded-lg">
                  <div className="pl-2.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value="11:20 pm"
                    className="w-full p-2.5 border-none rounded-lg"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Consultation date
                </label>
                <div className="relative flex items-center border border-gray-200 rounded-lg">
                  <div className="pl-2.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value="16-12-2021"
                    className="w-full p-2.5 border-none rounded-lg"
                    readOnly
                  />
                </div>
              </div>

              {/* Consultation Notes */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Consultation description
                </label>
                <textarea
                  className="w-full p-2.5 border border-gray-200 rounded-lg h-24"
                  value="The best study I could find found nothing particularly Another small study looked at sedentary individuals without diabetes who were overweight or obese."
                  readOnly
                />
              </div>

              {/* Notes */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full p-2.5 border border-gray-200 rounded-lg h-24"
                  value="Is there any evidence of benefit if people without diabetes monitor their blood sugar levels with CGMs? There's little published research to help answer this question."
                  readOnly
                />
              </div>

              {/* International Patient */}
              <div className="col-span-1 md:col-span-2 mt-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mr-2"
                    checked={true}
                    readOnly
                  />
                  <label className="text-sm">International Patient</label>
                </div>
              </div>

              {/* Review Notes */}
              <div className="col-span-1 md:col-span-2 mt-2">
                <label className="block text-sm text-gray-600 mb-1">
                  Review Notes
                </label>
                <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                  <div className="p-2 border border-gray-200 rounded-full mb-2">
                    <Upload size={16} className="text-gray-400" />
                  </div>
                  <div className="text-sm">
                    <span className="text-teal-500 cursor-pointer">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="col-span-1 md:col-span-2 mt-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-gray-500 text-xs">D</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 md:w-32 bg-gray-200 h-1 rounded-full relative">
                        <div
                          className="absolute h-1 bg-teal-400 rounded-full"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{file.progress}%</span>
                      <button className="p-1">
                        <Trash2 size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 w-full">
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 justify-between border-b pb-4">
            <button className="flex items-center justify-center border border-gray-200 rounded-lg px-4 py-2 text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Set New Appointment
            </button>
            <button className="flex items-center justify-center border border-gray-200 rounded-lg px-4 py-2 text-sm">
              <input type="checkbox" className="mr-2 w-3 h-3" />
              Set Goals
            </button>
            <button className="flex items-center justify-center border border-gray-200 rounded-lg px-4 py-2 text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add test
            </button>
            <button className="flex items-center justify-center bg-teal-100 text-teal-600 rounded-lg px-4 py-2 text-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              Set Monitoring Plan
            </button>
            <button className="flex items-center justify-center bg-[#80c5c5] hover:bg-teal-500 text-white border border-gray-200 rounded-lg px-4 py-2 text-sm col-span-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Medicine
            </button>
          </div>

          {/* Notification Checkbox */}
          <div className="flex justify-between mt-3">
            <div className="flex items-center">
              <input type="checkbox" className="w-3 h-3 mr-2" />
              <label className="text-xs">
                Notify Patient about Availability of Consultation Note
              </label>
            </div>
            <button className="bg-[#80c5c5] hover:bg-teal-500 text-white px-6 py-2 rounded-lg text-sm">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Default patient data
const defaultPatient = {
  name: "Morshed Ali",
  age: 22,
  gender: "Male",
  email: "jubed435@gmail.com",
  phone: "(704) 555-0127",
  birthDate: "14 February 2001",
  disease: "Cardiology",
  avatar: "https://randomuser.me/api/portraits/men/75.jpg",
};

export default PatientDetailsPage;
