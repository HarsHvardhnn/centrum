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
 * Maps `patient.phone` (+ optional `patient.phoneCode`) to form `phoneCode` + `mobileNumber`.
 */
export function mapPatientPhoneToFormFields(
  rawPhone,
  apiPhoneCode,
  countryCodes = PHONE_COUNTRY_CODES
) {
  const list = countryCodes?.length ? countryCodes : PHONE_COUNTRY_CODES;
  const sortedCodes = [...list].sort((a, b) => b.code.length - a.code.length);

  const codeFromApi = apiPhoneCode != null ? String(apiPhoneCode).trim() : "";
  if (codeFromApi && list.some((c) => c.code === codeFromApi)) {
    let num = String(rawPhone).trim();
    if (num.startsWith(codeFromApi)) num = num.slice(codeFromApi.length).trim();
    return { phoneCode: codeFromApi, mobileNumber: num.replace(/\s+/g, "") };
  }

  let phoneWithCode = String(rawPhone).trim();
  if (!phoneWithCode.startsWith("+")) {
    phoneWithCode = phoneWithCode.replace(/^0+/, "");
    if (phoneWithCode.length > 0) phoneWithCode = "+" + phoneWithCode;
  }
  const foundCountry = sortedCodes.find((country) =>
    phoneWithCode.startsWith(country.code)
  );
  if (foundCountry) {
    return {
      phoneCode: foundCountry.code,
      mobileNumber: phoneWithCode
        .replace(foundCountry.code, "")
        .trim()
        .replace(/\s+/g, ""),
    };
  }

  let digitsOnly = String(rawPhone).trim().replace(/\D/g, "");
  if (digitsOnly.startsWith("48") && digitsOnly.length >= 11) {
    digitsOnly = digitsOnly.slice(2);
  }
  digitsOnly = digitsOnly.replace(/^0+/, "");
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

  if (preferredAppointmentId) {
    try {
      const aptRes = await appointmentHelper.getAppointmentById(
        preferredAppointmentId
      );
      const apt = aptRes?.appointment || aptRes?.data || aptRes;
      doctorId = toEntityId(apt?.doctor);
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
          v?.doctor?.id &&
          String(v.status || "").toLowerCase() !== "cancelled"
      );
      const oldest = withDoctor.length
        ? withDoctor[withDoctor.length - 1]
        : null;
      doctorId = toEntityId(oldest?.doctor?.id || oldest?.doctor);
    } catch (err) {
      console.warn("Could not load visits for attending doctor prefill:", err);
    }
  }

  let consultingSpecialization = "";
  if (doctorId) {
    try {
      const docRes = await doctorService.getDoctorById(doctorId);
      const doctor = docRes?.doctor || docRes?.data || docRes;
      const specs = doctor?.specialization || doctor?.specializations || [];
      const first = Array.isArray(specs) ? specs[0] : null;
      consultingSpecialization = toEntityId(
        first && typeof first === "object" ? first._id || first.id : first
      );
    } catch (_) {
      /* optional */
    }
  }

  return {
    consultingDoctor: doctorId,
    consultingSpecialization,
  };
}

/**
 * Fetch patient + map into the multi-step edit form shape.
 */
export async function loadPatientEditFormData(
  patientId,
  preferredAppointmentId = null,
  countryCodes = PHONE_COUNTRY_CODES
) {
  const patientDetails = await patientService.getPatientById(patientId, {
    include: "documents,consents",
  });
  // Support both flat patient payload and wrapped { patient } / { data }
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
    !/^_no_phone_/i.test(String(rawPhone).trim());

  let consultingDoctor = toEntityId(details.consultingDoctor);
  let consultingSpecialization = toEntityId(
    details.consultingSpecialization
  );

  if (!consultingDoctor) {
    const resolved = await resolveAttendingDoctorFromVisits(
      patientId,
      preferredAppointmentId
    );
    consultingDoctor = resolved.consultingDoctor;
    if (!consultingSpecialization && resolved.consultingSpecialization) {
      consultingSpecialization = resolved.consultingSpecialization;
    }
  } else if (!consultingSpecialization) {
    try {
      const docRes = await doctorService.getDoctorById(consultingDoctor);
      const doctor = docRes?.doctor || docRes?.data || docRes;
      const specs = doctor?.specialization || doctor?.specializations || [];
      const first = Array.isArray(specs) ? specs[0] : null;
      consultingSpecialization = toEntityId(
        first && typeof first === "object" ? first._id || first.id : first
      );
    } catch (_) {
      /* keep empty */
    }
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
