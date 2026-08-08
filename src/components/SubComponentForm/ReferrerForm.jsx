// ReferrerForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
import { useEffect, useState, useRef } from "react";
import doctorService from "../../helpers/doctorHelper";
import patientService from "../../helpers/patientHelper";
import { useSpecializations } from "../../context/SpecializationContext";
import { stripDoctorTitle } from "../../utils/statusHelper";

function toEntityId(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

const ReferrerForm = () => {
  const { formData, updateFormData, updateMultipleFields } = useFormContext();
  const { specializations } = useSpecializations();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [touched, setTouched] = useState({
    consultingDoctor: false,
    consultingSpecialization: false,
  });
  const prefillAttemptedRef = useRef(false);

  const consultingSpecializationId = toEntityId(formData.consultingSpecialization);
  const consultingDoctorId = toEntityId(formData.consultingDoctor);
  const patientId = formData.patient_id || formData.patientId || null;

  // Normalize object refs → string ids once (so <select> values match options)
  useEffect(() => {
    const updates = {};
    if (
      formData.consultingDoctor &&
      typeof formData.consultingDoctor === "object" &&
      consultingDoctorId
    ) {
      updates.consultingDoctor = consultingDoctorId;
    }
    if (
      formData.consultingSpecialization &&
      typeof formData.consultingSpecialization === "object" &&
      consultingSpecializationId
    ) {
      updates.consultingSpecialization = consultingSpecializationId;
    }
    if (Object.keys(updates).length) {
      updateMultipleFields(updates);
    }
  }, [
    formData.consultingDoctor,
    formData.consultingSpecialization,
    consultingDoctorId,
    consultingSpecializationId,
    updateMultipleFields,
  ]);

  // If doctor is set but specialization is missing, derive it from the doctor profile
  useEffect(() => {
    if (!consultingDoctorId || consultingSpecializationId) return;
    let cancelled = false;

    (async () => {
      try {
        const docRes = await doctorService.getDoctorById(consultingDoctorId);
        if (cancelled) return;
        const doctor = docRes?.doctor || docRes?.data || docRes;
        const specs = doctor?.specialization || doctor?.specializations || [];
        const first = Array.isArray(specs) ? specs[0] : null;
        const specId = toEntityId(
          first && typeof first === "object" ? first._id || first.id : first
        );
        if (specId) {
          updateFormData("consultingSpecialization", specId);
        }
      } catch (err) {
        console.warn("ReferrerForm: could not derive specialization from doctor", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [consultingDoctorId, consultingSpecializationId, updateFormData]);

  // First-time empty attending physician → prefill from patient's initial booked visit
  useEffect(() => {
    if (prefillAttemptedRef.current) return;
    if (consultingDoctorId || !patientId) return;
    prefillAttemptedRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const visitsRes = await patientService.getPatientVisits(patientId);
        if (cancelled) return;
        const visits = Array.isArray(visitsRes?.data) ? visitsRes.data : [];
        const withDoctor = visits.filter(
          (v) => v?.doctor?.id && String(v.status || "").toLowerCase() !== "cancelled"
        );
        // Newest-first from API → initial appointment is last
        const initial = withDoctor.length ? withDoctor[withDoctor.length - 1] : null;
        const doctorId = toEntityId(initial?.doctor?.id);
        if (!doctorId) return;

        const docRes = await doctorService.getDoctorById(doctorId);
        if (cancelled) return;
        const doctor = docRes?.doctor || docRes?.data || docRes;
        const specs = doctor?.specialization || doctor?.specializations || [];
        const first = Array.isArray(specs) ? specs[0] : null;
        const specId = toEntityId(
          first && typeof first === "object" ? first._id || first.id : first
        );

        updateMultipleFields({
          consultingDoctor: doctorId,
          ...(specId ? { consultingSpecialization: specId } : {}),
        });
        setValidationError("");
      } catch (err) {
        console.warn("ReferrerForm: visit-based attending doctor prefill failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [consultingDoctorId, patientId, updateMultipleFields]);

  // Fetch doctors when specialization changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!consultingSpecializationId) {
        setDoctors([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const filters = { specialization: consultingSpecializationId };
        const response = await doctorService.getAllDoctors(filters);
        const fetchedDoctors = response.doctors || [];
        setDoctors(fetchedDoctors);

        if (fetchedDoctors.length === 0) {
          setValidationError("Brak dostępnych lekarzy dla wybranej specjalizacji");
          return;
        }

        if (consultingDoctorId) {
          const selectedDoctorExists = fetchedDoctors.some(
            (doctor) => String(doctor._id) === String(consultingDoctorId)
          );
          if (!selectedDoctorExists) {
            // Keep the preferred appointment doctor visible even if filter mismatch
            console.warn(
              "Selected attending doctor not in filtered list for specialization; keeping selection"
            );
            setValidationError("");
          } else {
            setValidationError("");
          }
        } else {
          setValidationError("");
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Nie udało się załadować listy lekarzy. Spróbuj ponownie.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [consultingSpecializationId, consultingDoctorId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData(name, type === "checkbox" ? checked : value);

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Changing specialization clears doctor so user picks within the new specialty
    if (name === "consultingSpecialization") {
      updateFormData("consultingDoctor", "");
    }

    if (name === "consultingDoctor" && value) {
      setValidationError("");
    }
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    if (fieldName === "consultingDoctor" && !consultingDoctorId) {
      setValidationError("Wybór lekarza jest wymagany");
    }
  };

  const doctorInList = doctors.some(
    (d) => String(d._id) === String(consultingDoctorId)
  );

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
              value={formData.referrerType || "bez-skierowania"}
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
            value={formData.mainComplaint || ""}
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
            value={formData.referrerName || ""}
            onChange={handleChange}
            placeholder="Wprowadź imię i nazwisko"
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
            value={formData.referrerNumber || ""}
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
            value={formData.referralNumber || ""}
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
        <div
          className={`bg-primary-lighter p-4 rounded-xl ${
            touched.consultingDoctor && validationError ? "border border-red-500" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <select
                  name="consultingSpecialization"
                  value={consultingSpecializationId}
                  onChange={handleChange}
                  onBlur={() => handleBlur("consultingSpecialization")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white"
                >
                  <option value="">Wybierz specjalizację</option>
                  {specializations && specializations.length > 0 ? (
                    specializations.map((specialization) => (
                      <option key={specialization._id} value={specialization._id}>
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
                  value={consultingDoctorId}
                  onChange={handleChange}
                  onBlur={() => handleBlur("consultingDoctor")}
                  className={`w-full px-3 py-2 border ${
                    touched.consultingDoctor && validationError
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md appearance-none bg-white`}
                  disabled={!consultingSpecializationId || loading}
                  required
                >
                  <option value="">
                    {loading
                      ? "Ładowanie lekarzy..."
                      : !consultingSpecializationId
                        ? "Najpierw wybierz specjalizację"
                        : "Wybierz lekarza"}
                  </option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {stripDoctorTitle(doctor.name || `Lekarz ${doctor._id}`)}
                    </option>
                  ))}
                  {consultingDoctorId && !doctorInList && !loading && (
                    <option value={consultingDoctorId}>
                      Lekarz z wizyty (załadowany)
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
