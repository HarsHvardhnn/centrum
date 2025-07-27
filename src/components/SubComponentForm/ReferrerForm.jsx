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

  // Fetch doctors when specialization changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.consultingSpecialization) return;

      try {
        setLoading(true);
        setError(null);
        const filters = { specialization: formData.consultingSpecialization };
        console.log("form data", formData);
        const response = await doctorService.getAllDoctors(filters);
        console.log("response", response.doctors);
        setDoctors(response.doctors || []);
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
  };

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
              <option value="" disabled>
                Wybierz typ skierowania
              </option>
              <option value="doctor">Lekarz</option>
              <option value="hospital">Szpital</option>
              <option value="clinic">Przychodnia</option>
              <option value="patient">Pacjent</option>
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
            Główna Dolegliwość
          </label>
          <input
            type="text"
            name="mainComplaint"
            value={formData.mainComplaint}
            onChange={handleChange}
            placeholder="Wprowadź dolegliwość"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nazwa Kierującego
          </label>
          <input
            type="text"
            name="referrerName"
            value={formData.referrerName}
            onChange={handleChange}
            placeholder="Wpisz, aby uzyskać sugestie"
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
            Email Kierującego
          </label>
          <input
            type="email"
            name="referrerEmail"
            value={formData.referrerEmail}
            onChange={handleChange}
            placeholder="Wprowadź adres email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lekarz Prowadzący
        </label>
        <div className="bg-primary-lighter p-4 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <select
                  name="consultingSpecialization"
                  value={formData.consultingSpecialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
                >
                  <option value="" disabled>
                    Wybierz specjalizację
                  </option>
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
                  value={formData.consultingDoctor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
                  disabled={!formData.consultingSpecialization || loading}
                >
                  <option value="" disabled>
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
              {error && <p className="mt-1 text-sm text-red-600">Nie udało się załadować listy lekarzy. Spróbuj ponownie.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferrerForm;
