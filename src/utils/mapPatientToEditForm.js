import appointmentHelper from "../helpers/appointmentHelper";
import doctorService from "../helpers/doctorHelper";
import patientService from "../helpers/patientHelper";
import { PHONE_COUNTRY_CODES } from "../constants/phoneCountryCodes";
import { mapPatientAuthorizationFields } from "./authorizedPersons";
import { mapPatientGuardianFields } from "./guardian";
import { normalizeVoivodeship } from "./voivodeshipUtils";

export const DEFAULT_PATIENT_PHONE_CODE = "+48";

/** Normalize ObjectId / populated ref / string to a plain id string for form selects. */
export function toEntityId(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

/**
 * Prefer Mongo ObjectId from a specialization entry; fall back to name string
 * (ReferrerForm resolves names against the specialization catalog).
 */
export function extractSpecializationRef(specs) {
  if (!Array.isArray(specs) || specs.length === 0) return "";
  const first = specs[0];
  if (first && typeof first === "object") {
    return String(first._id || first.id || first.name || "");
  }
  return String(first || "");
}

/**
 * Resolve specialization name → catalog _id when the value is not already an ObjectId-shaped id.
 */
export function resolveSpecializationAgainstCatalog(value, specializations = []) {
  const raw = toEntityId(value);
  if (!raw) return "";
  if (!specializations?.length) return raw;

  const byId = specializations.find((s) => String(s._id) === raw);
  if (byId) return String(byId._id);

  const lower = raw.toLowerCase();
  const byName = specializations.find(
    (s) => String(s.name || "").toLowerCase() === lower
  );
  if (byName) return String(byName._id);

  return raw;
}

async function specializationFromDoctorId(doctorId) {
  if (!doctorId) return "";
  try {
    const docRes = await doctorService.getDoctorById(doctorId);
    const doctor = docRes?.doctor || docRes?.data || docRes;
    const specs = doctor?.specialization || doctor?.specializations || [];
    return extractSpecializationRef(specs);
  } catch {
    return "";
  }
}

/**
 * Maps `patient.phone` (+ optional `patient.phoneCode`) to form `phoneCode` + `mobileNumber`.
 * Never treat a national number (no "+") as +1/US just because it starts with 1.
 */
export function mapPatientPhoneToFormFields(
  rawPhone,
  apiPhoneCode,
  countryCodes = PHONE_COUNTRY_CODES
) {
  const list = countryCodes?.length ? countryCodes : PHONE_COUNTRY_CODES;
  const raw = String(rawPhone ?? "").trim();
  if (!raw || /_no_phone_/i.test(raw)) {
    return { phoneCode: DEFAULT_PATIENT_PHONE_CODE, mobileNumber: "" };
  }

  const codeFromApi = apiPhoneCode != null ? String(apiPhoneCode).trim() : "";
  if (codeFromApi && list.some((c) => c.code === codeFromApi)) {
    let num = raw;
    if (num.startsWith(codeFromApi)) num = num.slice(codeFromApi.length).trim();
    return { phoneCode: codeFromApi, mobileNumber: num.replace(/\D/g, "") };
  }

  const hadPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");

  // List rows often store 9-digit PL numbers without "+48". Prefixing "+" would
  // make "123..." match the US code +1 and flash the US flag until the API loads.
  if (!hadPlus && digits.length <= 9) {
    return { phoneCode: DEFAULT_PATIENT_PHONE_CODE, mobileNumber: digits };
  }

  const phoneWithCode = hadPlus ? raw.replace(/\s+/g, "") : `+${digits}`;
  const sortedCodes = [...list].sort((a, b) => b.code.length - a.code.length);
  const foundCountry = sortedCodes.find((country) =>
    phoneWithCode.startsWith(country.code)
  );
  if (foundCountry) {
    return {
      phoneCode: foundCountry.code,
      mobileNumber: phoneWithCode
        .slice(foundCountry.code.length)
        .replace(/\D/g, ""),
    };
  }

  let digitsOnly = digits;
  if (digitsOnly.startsWith("48") && digitsOnly.length >= 11) {
    digitsOnly = digitsOnly.slice(2);
  }
  return { phoneCode: DEFAULT_PATIENT_PHONE_CODE, mobileNumber: digitsOnly };
}

/**
 * Resolve attending (consulting) doctor from a specific appointment or the patient's visits.
 */
export async function resolveAttendingDoctorFromVisits(
  patientId,
  preferredAppointmentId
) {
  let doctorId = "";
  let doctorName = "";

  if (preferredAppointmentId) {
    try {
      const aptRes = await appointmentHelper.getAppointmentById(
        preferredAppointmentId
      );
      // API: { success, data: appointment } — doctor may be populated {_id, name}
      const apt = aptRes?.appointment || aptRes?.data || aptRes;
      doctorId = toEntityId(apt?.doctor);
      if (apt?.doctor?.name) {
        const n = apt.doctor.name;
        doctorName =
          typeof n === "object"
            ? `${n.first || ""} ${n.last || ""}`.trim()
            : String(n);
      }
    } catch (err) {
      console.warn("Could not load appointment for attending doctor prefill:", err);
    }
  }

  if (!doctorId && patientId) {
    try {
      const visitsRes = await patientService.getPatientVisits(patientId);
      const visits = Array.isArray(visitsRes?.data) ? visitsRes.data : [];
      const withDoctor = visits.filter(
        (v) =>
          (v?.doctor?.id || v?.doctor?._id) &&
          String(v.status || "").toLowerCase() !== "cancelled"
      );
      const oldest = withDoctor.length
        ? withDoctor[withDoctor.length - 1]
        : null;
      doctorId = toEntityId(oldest?.doctor?.id || oldest?.doctor?._id || oldest?.doctor);
      if (oldest?.doctor?.name) doctorName = String(oldest.doctor.name);
    } catch (err) {
      console.warn("Could not load visits for attending doctor prefill:", err);
    }
  }

  const consultingSpecialization = doctorId
    ? await specializationFromDoctorId(doctorId)
    : "";

  return {
    consultingDoctor: doctorId,
    consultingSpecialization,
    consultingDoctorName: doctorName,
  };
}

/**
 * Minimal form stub from list-row patient — instant modal prefill while full fetch runs.
 */
export function mapListPatientToEditStub(patient) {
  if (!patient) return { phoneCode: DEFAULT_PATIENT_PHONE_CODE };
  const name = patient.name;
  let fullName = "";
  if (name && typeof name === "object") {
    fullName = `${name.first || ""} ${name.last || ""}`.trim();
  } else if (patient.fullName) {
    fullName = String(patient.fullName);
  } else if (typeof name === "string") {
    fullName = name;
  }
  const stub = {
    fullName,
    patient_id: patient.id || patient._id,
    patientId: patient.patientId || "",
    govtId: patient.govtId || patient.pesel || "",
    sex: patient.sex || patient.gender || "",
    phoneCode: DEFAULT_PATIENT_PHONE_CODE,
    mobileNumber: "",
  };
  const rawPhone = patient.phoneNumber ?? patient.phone;
  if (rawPhone != null && String(rawPhone).trim() !== "") {
    const { phoneCode, mobileNumber } = mapPatientPhoneToFormFields(
      rawPhone,
      patient.phoneCode
    );
    stub.phoneCode = phoneCode;
    stub.mobileNumber = mobileNumber;
  }
  return stub;
}

/**
 * Fetch patient + map into the multi-step edit form shape.
 * Patient, appointment (if any), and visits (if needed) load in parallel.
 */
export async function loadPatientEditFormData(
  patientId,
  preferredAppointmentId = null,
  countryCodes = PHONE_COUNTRY_CODES
) {
  const patientPromise = patientService.getPatientById(patientId, {
    include: "documents,consents",
  });

  const appointmentPromise = preferredAppointmentId
    ? appointmentHelper.getAppointmentById(preferredAppointmentId).catch((err) => {
        console.warn("Could not load appointment for attending doctor prefill:", err);
        return null;
      })
    : Promise.resolve(null);

  const visitsPromise = preferredAppointmentId
    ? Promise.resolve(null)
    : patientService.getPatientVisits(patientId).catch((err) => {
        console.warn("Could not load visits for attending doctor prefill:", err);
        return { data: [] };
      });

  const [patientDetails, aptRes, visitsRes] = await Promise.all([
    patientPromise,
    appointmentPromise,
    visitsPromise,
  ]);

  const details =
    patientDetails?.name || patientDetails?._id
      ? patientDetails
      : patientDetails?.patient || patientDetails?.data || patientDetails;

  if (!details) {
    throw new Error("Nie znaleziono pacjenta");
  }

  const rawPhone = details.phone;
  const hasRealPhone =
    rawPhone != null &&
    String(rawPhone).trim() !== "" &&
    !/_no_phone_/i.test(String(rawPhone).trim());

  let consultingDoctor = toEntityId(details.consultingDoctor);
  let consultingSpecialization = toEntityId(details.consultingSpecialization);
  let consultingDoctorName = "";

  const needsVisitPrefill = !consultingDoctor || !!preferredAppointmentId;

  if (needsVisitPrefill) {
    if (aptRes) {
      const apt = aptRes?.appointment || aptRes?.data || aptRes;
      const docId = toEntityId(apt?.doctor);
      if (docId) {
        if (!consultingDoctor || preferredAppointmentId) {
          consultingDoctor = docId;
          if (apt?.doctor?.name) {
            const n = apt.doctor.name;
            consultingDoctorName =
              typeof n === "object"
                ? `${n.first || ""} ${n.last || ""}`.trim()
                : String(n);
          }
        }
      }
    }

    if (!consultingDoctor && visitsRes) {
      const visits = Array.isArray(visitsRes?.data) ? visitsRes.data : [];
      const withDoctor = visits.filter(
        (v) =>
          (v?.doctor?.id || v?.doctor?._id) &&
          String(v.status || "").toLowerCase() !== "cancelled"
      );
      const oldest = withDoctor.length ? withDoctor[withDoctor.length - 1] : null;
      consultingDoctor = toEntityId(
        oldest?.doctor?.id || oldest?.doctor?._id || oldest?.doctor
      );
      if (oldest?.doctor?.name) consultingDoctorName = String(oldest.doctor.name);
    }
  }

  if (consultingDoctor && !consultingSpecialization) {
    consultingSpecialization = await specializationFromDoctorId(consultingDoctor);
  }

  const mappedFormData = {
    fullName:
      details.name?.first + " " + (details.name?.last || ""),
    email: details.email,
    mobileNumber: "",
    patient_id: details._id,
    dateOfBirth: details.dateOfBirth,
    motherTongue: details.motherTongue,
    govtId: details.govtId,
    sex: details.sex,
    maritalStatus: details.maritalStatus,
    ethnicity: details.ethnicity,
    otherHospitalIds: details.otherHospitalIds,
    patientId: details.patientId || "",
    consents: details.consents || [],
    documents: details.documents || [],
    referrerType: details.referrerType || "bez-skierowania",
    mainComplaint: details.mainComplaint,
    referrerName: details.referrerName,
    referrerNumber: details.referrerNumber,
    referrerEmail: details.referrerEmail,
    consultingDepartment: details.consultingDepartment,
    consultingSpecialization,
    consultingDoctor,
    consultingDoctorName,
    address: details.address,
    city: details.city,
    pinCode: details.pinCode,
    state: normalizeVoivodeship(
      details.state || details.province || ""
    ),
    country: details.country,
    district: details.district,
    isInternationalPatient: details.isInternationalPatient || false,
    documentCountry: details.documentCountry || "",
    documentType: details.documentType || "",
    documentNumber: details.documentNumber || "",
    documentDateOfBirth: details.documentDateOfBirth || "",
    documentExpiryDate: details.documentExpiryDate || "",
    citizenship: details.citizenship || "",
    photo: details.photo || null,
    ...mapPatientAuthorizationFields(details),
    ...mapPatientGuardianFields(details),
    allergies: details.allergies,
    preferredLanguage: details.preferredLanguage,
    reviewNotes: details.reviewNotes,
  };

  if (hasRealPhone) {
    const { phoneCode, mobileNumber } = mapPatientPhoneToFormFields(
      rawPhone,
      details.phoneCode,
      countryCodes
    );
    mappedFormData.phoneCode = phoneCode;
    mappedFormData.mobileNumber = mobileNumber;
  } else {
    mappedFormData.phoneCode = DEFAULT_PATIENT_PHONE_CODE;
    mappedFormData.mobileNumber = "";
  }

  return mappedFormData;
}
