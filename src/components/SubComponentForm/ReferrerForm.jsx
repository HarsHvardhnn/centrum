// ReferrerForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
import { useEffect, useState } from "react";
import doctorService from "../../helpers/doctorHelper";
import { DEPARTMENTS } from "../../utils/departments";



const ReferrerForm = () => {
  const { formData, updateFormData } = useFormContext();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch doctors when department changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.consultingDepartment) return;

      try {
        setLoading(true);
        setError(null);
        const filters = { department: formData.consultingDepartment };
        console.log("form data",formData)
        const response = await doctorService.getAllDoctors(filters);
        console.log("response",response.doctors)
        setDoctors(response.doctors || []);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Failed to load doctors. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [formData.consultingDepartment]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === "checkbox" ? checked : value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referrer Type
          </label>
          <div className="relative">
            <select
              name="referrerType"
              value={formData.referrerType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
            >
              <option value="" disabled>
                Select referrer type
              </option>
              <option value="doctor">Doctor</option>
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="patient">Patient</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Complaint
          </label>
          <input
            type="text"
            name="mainComplaint"
            value={formData.mainComplaint}
            onChange={handleChange}
            placeholder="Enter your complaint"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referrer Name
          </label>
          <input
            type="text"
            name="referrerName"
            value={formData.referrerName}
            onChange={handleChange}
            placeholder="Type to get suggestions"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referrer Number
          </label>
          <input
            type="tel"
            name="referrerNumber"
            value={formData.referrerNumber}
            onChange={handleChange}
            placeholder="Enter referrer number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referrer Email
          </label>
          <input
            type="email"
            name="referrerEmail"
            value={formData.referrerEmail}
            onChange={handleChange}
            placeholder="Enter referrer e-mail"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Consulting doctor
        </label>
        <div className="bg-primary-lighter p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <select
                  name="consultingDepartment"
                  value={formData.consultingDepartment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center font-medium">&</div>

            <div className="flex-1">
              <div className="relative">
                <select
                  name="consultingDoctor"
                  value={formData.consultingDoctor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
                  disabled={!formData.consultingDepartment || loading}
                >
                  <option value="" disabled>
                    {loading ? "Loading doctors..." : "Select doctor name"}
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name || ""}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferrerForm;
