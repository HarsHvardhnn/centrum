// ReferrerForm.jsx
import { useFormContext } from "../../context/SubStepFormContext";
import { useEffect, useState, useRef } from "react";
import doctorService from "../../helpers/doctorHelper";
import patientService from "../../helpers/patientHelper";
import { useSpecializations } from "../../context/SpecializationContext";
import { stripDoctorTitle } from "../../utils/statusHelper";
import {
  toEntityId,
  extractSpecializationRef,
  resolveSpecializationAgainstCatalog,
} from "../../utils/mapPatientToEditForm";

function formatDoctorName(doctor) {
  if (!doctor) return "";
  if (typeof doctor.name === "string") return stripDoctorTitle(doctor.name);
  const nested = [doctor.name?.first, doctor.name?.last].filter(Boolean).join(" ");
  if (nested) return stripDoctorTitle(nested);
  if (typeof doctor.fullName === "string") return stripDoctorTitle(doctor.fullName);
  return "";
}

function unwrapDoctorPayload(payload) {
  return payload?.doctor || payload?.data || payload || null;
}

/** Map a doctor's specialization (id, populated object, or name) onto catalog ObjectIds. */
function resolveSpecializationId(doctor, catalog = []) {
  const specs = doctor?.specialization || doctor?.specializations || [];
  const items = Array.isArray(specs) ? specs : specs ? [specs] : [];
  const list = Array.isArray(catalog) ? catalog : [];

  for (const spec of items) {
    if (spec && typeof spec === "object") {
      const id = spec._id || spec.id;
      if (id) return String(id);
      const name = spec.name;
      const match = list.find(
        (s) => String(s.name || "").toLowerCase() === String(name || "").toLowerCase()
      );
      if (match?._id) return String(match._id);
    } else if (typeof spec === "string" && spec.trim()) {
      if (/^[a-fA-F0-9]{24}$/.test(spec)) return spec;
      const match = list.find(
        (s) => String(s.name || "").toLowerCase() === spec.trim().toLowerCase()
      );
      if (match?._id) return String(match._id);
    }
  }
  return "";
}

const ReferrerForm = () => {
  const { formData, updateFormData, updateMultipleFields } = useFormContext();
  const { specializations } = useSpecializations();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [selectedDoctorLabel, setSelectedDoctorLabel] = useState("");
  const [touched, setTouched] = useState({
    consultingDoctor: false,
    consultingSpecialization: false,
  });
  const prefillAttemptedRef = useRef(false);

  const consultingSpecializationId = toEntityId(formData.consultingSpecialization);
  const consultingDoctorId = toEntityId(formData.consultingDoctor);
  const patientId = formData.patient_id || null;

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

  // If specialization is a name (e.g. "Chirurg") instead of ObjectId, map to catalog id
  useEffect(() => {
    if (!consultingSpecializationId || !specializations?.length) return;
    const resolved = resolveSpecializationAgainstCatalog(
      consultingSpecializationId,
      specializations
    );
    if (resolved && resolved !== consultingSpecializationId) {
      updateFormData("consultingSpecialization", resolved);
    }
  }, [consultingSpecializationId, specializations, updateFormData]);

  // Load the selected doctor's name + specialization so both dropdowns show real values
  useEffect(() => {
    if (!consultingDoctorId) {
      setSelectedDoctorLabel("");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const docRes = await doctorService.getDoctorById(consultingDoctorId);
        if (cancelled) return;
        const doctor = unwrapDoctorPayload(docRes);
        const name = formatDoctorName(doctor);
        if (name) {
          setSelectedDoctorLabel(name);
          updateFormData("consultingDoctorName", name);
        }

        if (!consultingSpecializationId) {
          let specId = extractSpecializationRef(
            doctor?.specialization || doctor?.specializations || []
          );
          specId =
            resolveSpecializationAgainstCatalog(specId, specializations) ||
            resolveSpecializationId(doctor, specializations);
          if (specId) updateFormData("consultingSpecialization", specId);
        }
      } catch (err) {
        console.warn("ReferrerForm: could not load attending doctor details", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    consultingDoctorId,
    consultingSpecializationId,
    specializations,
    updateFormData,
  ]);

  // Reset visit-prefill guard when switching patients
  useEffect(() => {
    prefillAttemptedRef.current = false;
  }, [patientId]);

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
          (v) =>
            (v?.doctor?.id || v?.doctor?._id) &&
            String(v.status || "").toLowerCase() !== "cancelled"
        );
        const initial = withDoctor.length ? withDoctor[withDoctor.length - 1] : null;
        const doctorId = toEntityId(initial?.doctor?.id || initial?.doctor?._id);
        if (!doctorId) return;

        const visitName = stripDoctorTitle(initial?.doctor?.name || "");
        if (visitName) setSelectedDoctorLabel(visitName);

        let specId = "";
        let doctorName = visitName;
        try {
          const docRes = await doctorService.getDoctorById(doctorId);
          if (cancelled) return;
          const doctor = unwrapDoctorPayload(docRes);
          const profileName = formatDoctorName(doctor);
          if (profileName) {
            setSelectedDoctorLabel(profileName);
            doctorName = profileName;
          }
          specId =
            resolveSpecializationAgainstCatalog(
              extractSpecializationRef(
                doctor?.specialization || doctor?.specializations || []
              ),
              specializations
            ) || resolveSpecializationId(doctor, specializations);
        } catch (err) {
          console.warn("ReferrerForm: could not load specialization for visit doctor", err);
        }

        updateMultipleFields({
          consultingDoctor: doctorId,
          ...(specId ? { consultingSpecialization: specId } : {}),
          ...(doctorName ? { consultingDoctorName: doctorName } : {}),
        });
        setValidationError("");
      } catch (err) {
        console.warn("ReferrerForm: visit-based attending doctor prefill failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [consultingDoctorId, patientId, specializations, updateMultipleFields]);

  // Fetch doctors when specialization changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!consultingSpecializationId) {
        setDoctors([]);
        return;
      }

      // Don't query with a non-ObjectId name string
      const looksLikeObjectId = /^[a-f\d]{24}$/i.test(consultingSpecializationId);
      if (!looksLikeObjectId) {
        setDoctors([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await doctorService.getAllDoctors({
          specialization: consultingSpecializationId,
          limit: 500,
        });
        const fetchedDoctors = response.doctors || [];
        setDoctors(fetchedDoctors);

        if (fetchedDoctors.length === 0) {
          setValidationError("Brak dostępnych lekarzy dla wybranej specjalizacji");
          return;
        }

        setValidationError("");
        if (consultingDoctorId) {
          const selectedDoctorExists = fetchedDoctors.some(
            (doctor) =>
              String(doctor._id) === String(consultingDoctorId) ||
              String(doctor.id) === String(consultingDoctorId)
          );
          if (!selectedDoctorExists) {
            console.warn(
              "Selected attending doctor not in filtered list for specialization; keeping selection"
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setError("Nie udało się załadować listy lekarzy. Spróbuj ponownie.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [consultingSpecializationId]);

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
      setSelectedDoctorLabel("");
      updateFormData("consultingDoctorName", "");
    }

    if (name === "consultingDoctor" && value) {
      const picked = doctors.find(
        (d) => String(d._id) === String(value) || String(d.id) === String(value)
      );
      const label = formatDoctorName(picked) || "";
      setSelectedDoctorLabel(label);
      setValidationError("");
      if (label) {
        updateFormData("consultingDoctorName", label);
      }
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
    (d) =>
      String(d._id) === String(consultingDoctorId) ||
      String(d.id) === String(consultingDoctorId)
  );
  const selectedDoctorOptionLabel =
    selectedDoctorLabel ||
    formatDoctorName(doctors.find((d) => String(d._id) === String(consultingDoctorId))) ||
    "Wybrany lekarz";

  const fallbackDoctorLabel =
    formData.consultingDoctorName ||
    (consultingDoctorId ? "Lekarz z wizyty (załadowany)" : "");

  const specializationSelectValue =
    resolveSpecializationAgainstCatalog(
      consultingSpecializationId,
      specializations
    ) || consultingSpecializationId;

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
                  value={specializationSelectValue}
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
                  disabled={
                    !/^[a-f\d]{24}$/i.test(String(specializationSelectValue || "")) ||
                    loading
                  }
                  required
                >
                  <option value="">
                    {loading
                      ? "Ładowanie lekarzy..."
                      : !specializationSelectValue
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
                      {selectedDoctorOptionLabel !== "Wybrany lekarz"
                        ? selectedDoctorOptionLabel
                        : stripDoctorTitle(fallbackDoctorLabel) || selectedDoctorOptionLabel}
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
