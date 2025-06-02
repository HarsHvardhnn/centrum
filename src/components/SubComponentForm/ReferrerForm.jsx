// ReferrerForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
import { useEffect, useState } from "react";
import doctorService from "../../helpers/doctorHelper";
import { useSpecializations } from "../../context/SpecializationContext";

const ReferrerForm = () => {
  const { formData, updateFormData } = useFormContext();
  const { specializations } = useSpecializations();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [touched, setTouched] = useState({
    consultingDoctor: false,
    consultingSpecialization: false
  });

  // Fetch doctors when specialization changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.consultingSpecialization) return;

      try {
        setLoading(true);
        setError(null);
        const filters = { specialization: formData.consultingSpecialization };
        const response = await doctorService.getAllDoctors(filters);
        const fetchedDoctors = response.doctors || [];
        setDoctors(fetchedDoctors);

        // If we have doctors and no consultingDoctor is set, set the first doctor
        if (fetchedDoctors.length > 0 && !formData.consultingDoctor) {
          updateFormData('consultingDoctor', fetchedDoctors[0]._id);
          setValidationError("");
        } else if (fetchedDoctors.length === 0) {
          setValidationError("Brak dostępnych lekarzy dla wybranej specjalizacji");
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Nie udało się załadować listy lekarzy. Spróbuj ponownie.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [formData.consultingSpecialization]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === "checkbox" ? checked : value);
    
    // Mark field as touched when changed
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Clear validation error when doctor is selected
    if (name === 'consultingDoctor' && value) {
      setValidationError("");
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Only validate if the field has been touched
    if (fieldName === 'consultingDoctor' && !formData.consultingDoctor) {
      setValidationError("Wybór lekarza jest wymagany");
    }
  };

  // Remove initial validation check since we only want to validate after user interaction

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Typ Skierowania
          </label>
          <div className="relative">
            <select
              name="referrerType"
              value={formData.referrerType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
            >
              <option value="bez-skierowania">Bez skierowania (samodzielne zgłoszenie)</option>
              <option value="lekarz-poz">Lekarz POZ / rodzinny</option>
              <option value="lekarz-specjalista">Lekarz specjalista</option>
              <option value="inna-placowka">Inna placówka medyczna</option>
              <option value="badania-diagnostyczne">Badania diagnostyczne</option>
              <option value="inne">Inne</option>
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
            Główna Dolegliwość/ Cel wizyty
          </label>
          <input
            type="text"
            name="mainComplaint"
            value={formData.mainComplaint}
            onChange={handleChange}
            placeholder="Wprowadź dolegliwość/ cel wizyty"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lekarz Kierujący
          </label>
          <input
            type="text"
            name="referrerName"
            value={formData.referrerName}
            onChange={handleChange}
            placeholder="Wprowadź imię i nazwisko l"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer Telefonu Kierującego
          </label>
          <input
            type="tel"
            name="referrerNumber"
            value={formData.referrerNumber}
            onChange={handleChange}
            placeholder="Wprowadź numer telefonu"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numer Skierowania
          </label>
          <input
            type="text"
            name="referralNumber"
            value={formData.referralNumber}
            onChange={handleChange}
            placeholder="Wprowadź numer skierowania"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lekarz Prowadzący <span className="text-red-500">*</span>
        </label>
        <div className={`bg-primary-lighter p-4 rounded-xl ${touched.consultingDoctor && validationError ? 'border border-red-500' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <select
                  name="consultingSpecialization"
                  value={formData.consultingSpecialization || ""}
                  onChange={handleChange}
                  onBlur={() => handleBlur("consultingSpecialization")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
                >
                  <option value="">Wybierz specjalizację</option>
                  {specializations && specializations.length > 0 ? (
                    specializations.map((specialization) => (
                      <option
                        key={specialization._id}
                        value={specialization._id}
                      >
                        {specialization.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Ładowanie specjalizacji...
                    </option>
                  )}
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
                  value={formData.consultingDoctor || ""}
                  onChange={handleChange}
                  onBlur={() => handleBlur("consultingDoctor")}
                  className={`w-full px-3 py-2 border ${touched.consultingDoctor && validationError ? 'border-red-500' : 'border-gray-300'} rounded-md appearance-none bg-white`}
                  disabled={!formData.consultingSpecialization || loading}
                  required
                >
                  <option value="">
                    {loading ? "Ładowanie lekarzy..." : "Wybierz lekarza"}
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
              {touched.consultingDoctor && validationError && (
                <p className="mt-1 text-sm text-red-500">{validationError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferrerForm;
