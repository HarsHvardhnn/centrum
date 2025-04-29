import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Activity,
  Package,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { apiCaller } from "../../utils/axiosInstance";

// Simulated API call functionality
const fetchMedicalDetails = async () => {
  try {
    const response = await apiCaller("GET", "/patients/by-id/medical-details");
    return response.data;
  } catch (error) {
    console.error("Error fetching medical details:", error);
    throw error;
  }
};
// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Main component
export default function PatientMedicalDetails() {
  const [medicalData, setMedicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    medications: true,
    tests: true,
    consultation: true,
    documents: true,
  });

  useEffect(() => {
    const getMedicalData = async () => {
      try {
        const data = await fetchMedicalDetails();
        setMedicalData(data);
      } catch (err) {
        setError("Failed to load medical details. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getMedicalData();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-teal-600">
          Loading medical details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      {/* Header */}
      {/* <div className="bg-teal-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold">Patient Medical Details</h1>
        <p className="text-sm opacity-90">View your health information</p>
      </div> */}

      <div className="w-full mx-auto p-4">
        {/* Medications Section */}
        <section className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div
            className="bg-teal-600 p-4 text-white flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("medications")}
          >
            <div className="flex items-center space-x-2">
              <Package size={20} />
              <h2 className="font-bold text-lg">Medications</h2>
            </div>
            {expandedSections.medications ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>

          {expandedSections.medications && (
            <div className="p-4">
              {medicalData.medications && medicalData.medications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Medication
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Dosage
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Frequency
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Start Date
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          End Date
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {medicalData.medications.map((medication) => (
                        <tr key={medication._id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm">{medication.name}</td>
                          <td className="p-3 text-sm">{medication.dosage}</td>
                          <td className="p-3 text-sm">
                            {medication.frequency}
                          </td>
                          <td className="p-3 text-sm">
                            {formatDate(medication.startDate)}
                          </td>
                          <td className="p-3 text-sm">
                            {formatDate(medication.endDate)}
                          </td>
                          <td className="p-3 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                medication.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {medication.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No medications found
                </div>
              )}
            </div>
          )}
        </section>

        {/* Tests Section */}
        <section className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div
            className="bg-teal-600 p-4 text-white flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("tests")}
          >
            <div className="flex items-center space-x-2">
              <Activity size={20} />
              <h2 className="font-bold text-lg">Test Results</h2>
            </div>
            {expandedSections.tests ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>

          {expandedSections.tests && (
            <div className="p-4">
              {medicalData.tests && medicalData.tests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Test Name
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Date
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Results
                        </th>
                        <th className="p-3 text-left text-sm font-medium text-teal-800">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {medicalData.tests.map((test) => (
                        <tr key={test._id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm">{test.name}</td>
                          <td className="p-3 text-sm">
                            {formatDate(test.date)}
                          </td>
                          <td className="p-3 text-sm">{test.results}</td>
                          <td className="p-3 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                test.status === "Normal"
                                  ? "bg-green-100 text-green-800"
                                  : test.status === "Abnormal"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {test.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No test results found
                </div>
              )}
            </div>
          )}
        </section>

        {/* Consultation Section */}
        <section className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div
            className="bg-teal-600 p-4 text-white flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("consultation")}
          >
            <div className="flex items-center space-x-2">
              <Calendar size={20} />
              <h2 className="font-bold text-lg">Latest Consultation</h2>
            </div>
            {expandedSections.consultation ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>

          {expandedSections.consultation && medicalData.consultation && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-800 mb-2">
                    Consultation Details
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-teal-700 font-medium w-32">
                        Type:
                      </span>
                      <span>{medicalData.consultation.consultationType}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-700 font-medium w-32">
                        Date:
                      </span>
                      <span>
                        {formatDate(medicalData.consultation.consultationDate)}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-700 font-medium w-32">
                        Time:
                      </span>
                      <span>{medicalData.consultation.consultationTime}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-700 font-medium w-32">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          medicalData.consultation.consultationStatus ===
                          "Completed"
                            ? "bg-green-100 text-green-800"
                            : medicalData.consultation.consultationStatus ===
                              "Scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : medicalData.consultation.consultationStatus ===
                              "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {medicalData.consultation.consultationStatus}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-teal-800 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">
                    {medicalData.consultation.description ||
                      "No description provided"}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg mt-4">
                <div className="border-b border-gray-200">
                  <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                    <li className="mr-2">
                      <a
                        href="#"
                        className="inline-block p-4 border-b-2 border-teal-600 text-teal-600 active"
                      >
                        Consultation Notes
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-teal-700 mb-2">
                        Interview
                      </h4>
                      <p className="text-sm text-gray-700 mb-4">
                        {medicalData.consultation.interview ||
                          "No interview details"}
                      </p>

                      <h4 className="font-medium text-teal-700 mb-2">
                        Physical Examination
                      </h4>
                      <p className="text-sm text-gray-700">
                        {medicalData.consultation.physicalExamination ||
                          "No examination details"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-teal-700 mb-2">
                        Treatment
                      </h4>
                      <p className="text-sm text-gray-700 mb-4">
                        {medicalData.consultation.treatment ||
                          "No treatment details"}
                      </p>

                      <h4 className="font-medium text-teal-700 mb-2">
                        Recommendations
                      </h4>
                      <p className="text-sm text-gray-700">
                        {medicalData.consultation.recommendations ||
                          "No recommendations provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Documents Section */}
        <section className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div
            className="bg-teal-600 p-4 text-white flex justify-between items-center cursor-pointer"
            onClick={() => toggleSection("documents")}
          >
            <div className="flex items-center space-x-2">
              <FileText size={20} />
              <h2 className="font-bold text-lg">Medical Documents</h2>
            </div>
            {expandedSections.documents ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>

          {expandedSections.documents && (
            <div className="p-4">
              {medicalData.documents && medicalData.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {medicalData.documents.map((doc, index) => {
                    // Extract filename from path
                    const filename = doc.name.split("/").pop() || "Document";

                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center mb-2">
                          <FileText className="text-teal-600 mr-2" size={20} />
                          <h3 className="font-medium text-gray-800 truncate">
                            {filename}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {doc.document_type
                            ? doc.document_type.charAt(0).toUpperCase() +
                              doc.document_type.slice(1)
                            : "Document"}{" "}
                          • {doc.size}
                        </p>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-teal-600 hover:text-teal-800"
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No documents found
                </div>
              )}

              {/* <div className="mt-4 text-center">
                <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  <PlusCircle size={16} className="mr-2" />
                  Upload New Document
                </button>
              </div> */}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
