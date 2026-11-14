import { useState, useEffect, useMemo, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  X,
  User,
  Mail,
  Award,
  BookOpen,
  FileText,
  Briefcase,
  Camera,
} from "lucide-react";
import { useSpecializations } from "../../context/SpecializationContext";
import { toast } from "sonner";
import ehealthAdminHelper from "../../helpers/ehealthAdminHelper";
import SpecializationDropdown from "./SpecializationDropdown";
import SpecialtyPicker from "../ehealth/SpecialtyPicker";
import DoctorCellsField from "../ehealth/DoctorCellsField";
import { isValidPesel, pwzError, isDoctorRole } from "../ehealth/p1Validation";
import ImageCropper from "../UtilComponents/ImageCropper";
import AutoSaveIndicator from "../UtilComponents/AutoSaveIndicator";

// Base schema fields (same for create and edit)
const getDoctorSchema = (isEditMode) =>
  Yup.object().shape({
    firstName: Yup.string().required("Imię jest wymagane"),
    lastName: Yup.string().required("Nazwisko jest wymagane"),
    email: Yup.string()
      .email("Nieprawidłowy adres email")
      .required("Email jest wymagany"),
    phone: Yup.string()
      .required("Numer telefonu jest wymagany")
      .matches(/^\d{9}$/, "Numer telefonu musi składać się z dokładnie 9 cyfr"),
    // Create: required + min 8. Edit: optional; if provided, min 8
    password: isEditMode
      ? Yup.string()
          .optional()
          .nullable()
          .transform((v) => (v === "" || v === undefined ? undefined : v))
          .test("password-edit", function (value) {
            if (value == null || (typeof value === "string" && value.trim() === "")) return true;
            if (value.length < 8) return this.createError({ path: this.path, message: "Hasło musi zawierać co najmniej 8 znaków" });
            return true;
          })
      : Yup.string()
          .required("Hasło jest wymagane")
          .min(8, "Hasło musi zawierać co najmniej 8 znaków"),
    confirmPassword: isEditMode
      ? Yup.string()
          .optional()
          .nullable()
          .transform((v) => (v === "" || v === undefined ? undefined : v))
          .test("confirm-edit", function (value) {
            const password = this.parent.password;
            if (password == null || (typeof password === "string" && password.trim() === "")) return true;
            if (value != null && value !== password) return this.createError({ path: this.path, message: "Hasła muszą być zgodne" });
            return true;
          })
      : Yup.string()
          .required("Potwierdzenie hasła jest wymagane")
          .oneOf([Yup.ref("password"), null], "Hasła muszą być zgodne"),
    pesel: Yup.string().test("pesel-p1", function (value) {
      const v = String(value || "").trim();
      if (!v) return this.parent.issuesEDocuments ? this.createError({ message: "PESEL jest wymagany dla lekarza wystawiającego e-dokumenty" }) : true;
      return isValidPesel(v) ? true : this.createError({ message: "PESEL musi mieć 11 cyfr i poprawną cyfrę kontrolną" });
    }),
    npwz: Yup.string().test("pwz-p1", function (value) {
      const v = String(value || "").trim();
      if (!v) return this.parent.issuesEDocuments ? this.createError({ message: "Numer PWZ jest wymagany dla lekarza wystawiającego e-dokumenty" }) : true;
      const msg = pwzError(v, this.parent.medfileRole);
      return msg ? this.createError({ message: msg }) : true;
    }),
    medfileQualifications: Yup.array().test("spec-p1", function (value) {
      const { medfileRole, noSpecialization, issuesEDocuments } = this.parent;
      if (!isDoctorRole(medfileRole)) return true;
      if (noSpecialization && (value || []).length) return this.createError({ message: "Wybierz specjalizację albo „Bez specjalizacji”, nie oba naraz" });
      if (issuesEDocuments && !noSpecialization && !(value || []).length) return this.createError({ message: "Wybierz specjalizację albo zaznacz „Bez specjalizacji”" });
      return true;
    }),
    homePostalCode: Yup.string().matches(/^(\d{2}-\d{3})?$/, "Kod pocztowy w formacie 00-000"),
    addrPostalCode: Yup.string().matches(/^(\d{2}-\d{3})?$/, "Kod pocztowy w formacie 00-000"),
    // The fields below only build the public profile page. An account that is not shown on the website
    // (staff who only work in CM7Med: nurses, physiotherapists, doctors without a page) does not need them.
    showOnWebsite: Yup.boolean(),
    specialization: Yup.array().test("spec-site", "Wymagana jest co najmniej jedna specjalizacja", function (value) {
      return !this.parent.showOnWebsite || (value || []).length > 0;
    }),
    qualifications: Yup.array().test("qual-site", "Wymagana jest co najmniej jedna kwalifikacja", function (value) {
      return !this.parent.showOnWebsite || (value || []).length > 0;
    }),
    shortDescription: Yup.string().test("short-site", function (value) {
      if (!this.parent.showOnWebsite) return true;
      const v = String(value || "").trim();
      if (!v) return this.createError({ message: "Krótki opis jest wymagany" });
      if (v.length < 10) return this.createError({ message: "Krótki opis musi zawierać co najmniej 10 znaków" });
      if (v.length > 200) return this.createError({ message: "Krótki opis nie może przekraczać 200 znaków" });
      return true;
    }),
    bio: Yup.string().test("bio-site", "Bio jest wymagane", function (value) {
      return !this.parent.showOnWebsite || Boolean(String(value || "").trim());
    }),
    // Create: required (File) only for a profile shown on the website. Edit: optional
    profilePicture: Yup.mixed().nullable().notRequired().test("photo-site", "Zdjęcie profilowe jest wymagane", function (value) {
      if (isEditMode || !this.parent.showOnWebsite) return true;
      return value instanceof File;
    }),
  });


export default function AddDoctorForm({ isOpen, onClose, onAddDoctor, initialData, isEditMode, onFormDataChange, saveStatus, inline = false, selfMode = false }) {
  const practitionerLoadedRef = useRef(false);
  const medfileIdRef = useRef("");
  const [medfileSending, setMedfileSending] = useState(false);
  //("doctors",initialData)

  console.log("intitial data", initialData?.profilePicture)
  const [profileImage, setProfileImage] = useState(null);
  const [specializationInput, setSpecializationInput] = useState("");
  const [qualificationInput, setQualificationInput] = useState("");
  const { specializations } = useSpecializations();
  
  // State for image cropping
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  const [formikSetFieldValue, setFormikSetFieldValue] = useState(null);

  // Show current profile picture as preview when editing
  useEffect(() => {
    if (isOpen && isEditMode && initialData?.profilePicture && !profileImage) {
      setProfileImage(initialData.profilePicture);
    }
    // Reset preview when modal closes
    if (!isOpen) {
      setProfileImage(null);
    }
  }, [isOpen, isEditMode, initialData?.profilePicture]);

  const doctorSchema = useMemo(() => getDoctorSchema(isEditMode), [isEditMode]);

  if (!isOpen) return null;

  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      // Save the setFieldValue function for later use after cropping
      setFormikSetFieldValue(() => setFieldValue);
      
      // Create a URL for the selected image and show the cropper
      const reader = new FileReader();
      reader.onload = () => {
        setCropperImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage) => {
    // Update the form with the cropped image
    if (formikSetFieldValue) {
      // Convert the data URL to a File object for form submission
      fetch(croppedImage.url)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "cropped_profile.jpg", { type: "image/jpeg" });
          formikSetFieldValue("profilePicture", file);
          setProfileImage(croppedImage.url);
          setShowCropper(false);
        });
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperImage(null);
  };

  const handleAddSpecialization = (values, setFieldValue) => {
    if (specializationInput.trim()) {
      const updatedSpecializations = [
        ...values.specialization,
        specializationInput.trim(),
      ];
      setFieldValue("specialization", updatedSpecializations);
      setSpecializationInput("");
    }
  };

  const handleAddQualification = (values, setFieldValue) => {
    if (qualificationInput.trim()) {
      const updatedQualifications = [
        ...values.qualifications,
        qualificationInput.trim(),
      ];
      setFieldValue("qualifications", updatedQualifications);
      setQualificationInput("");
    }
  };

  const handleRemoveSpecialization = (index, values, setFieldValue) => {
    const updatedSpecializations = values.specialization.filter(
      (_, i) => i !== index
    );
    setFieldValue("specialization", updatedSpecializations);
  };

  const handleRemoveQualification = (index, values, setFieldValue) => {
    const updatedQualifications = values.qualifications.filter(
      (_, i) => i !== index
    );
    setFieldValue("qualifications", updatedQualifications);
  };

  // Helper to normalize specializations to {id, name}
  const normalizeSpecs = (specs) =>
    (specs || []).map(spec => ({ id: spec._id || spec.id, name: spec.name }));

  return (
    <div className={inline ? "" : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"}>
      <div className={inline ? "bg-white rounded-lg border border-gray-200 p-6 w-full" : "bg-white rounded-lg shadow-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"}>
        <div className={inline ? "hidden" : "flex justify-between items-center mb-6"}>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-800">
              {isEditMode ? "Edytuj Lekarza" : "Dodaj Nowego Lekarza"}
            </h2>
            {!isEditMode && saveStatus && (
              <AutoSaveIndicator status={saveStatus} />
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <Formik
          initialValues={{
            firstName: initialData?.name?.first || initialData?.firstName || "",
            lastName: initialData?.name?.last || initialData?.lastName || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            // In edit mode, always start with empty password fields (optional)
            password: isEditMode ? "" : (initialData?.password || ""),
            confirmPassword: "",
            department: initialData?.department || "",
            specialization: normalizeSpecs(initialData?.specializations) || initialData?.specialization || [],
            qualifications: initialData?.qualifications || [],
            shortDescription: initialData?.shortDescription || "",
            bio: initialData?.bio || "",
            professionalTitle: initialData?.professionalTitle || "",
            npwz: initialData?.npwz || initialData?.pwz || "",
            // Medfile / P1 practitioner data (loaded from the e-health admin API in edit mode)
            secondName: initialData?.secondName || "",
            pesel: initialData?.pesel || "",
            medfileRole: initialData?.medfileRole || "LEK",
            // Shown on the public website? Existing accounts keep their setting; one that never had a public profile stays off.
            showOnWebsite: isEditMode
              ? (initialData?.showOnWebsite !== undefined
                  ? initialData.showOnWebsite !== false
                  : Boolean(String(initialData?.shortDescription || "").trim()) && (initialData?.specializations || initialData?.specialization || []).length > 0 && (initialData?.qualifications || []).length > 0)
              : true,
            medfilePractitionerId: initialData?.medfilePractitionerId || "",
            medfileQualifications: (initialData?.medfileQualifications || []).map((q) => ({ code: q.code, display: q.display })),
            noSpecialization: !!initialData?.noSpecialization,
            issuesEDocuments: !!initialData?.issuesEDocuments,
            paAllowed: !!initialData?.paAllowed,
            cellIds: initialData?.cellIds || [],
            defaultCellId: initialData?.defaultCellId || "",
            prescribingRights: initialData?.prescribingRights || "independent",
            homeStreet: initialData?.residentialAddress?.street || "",
            homeHouseNumber: initialData?.residentialAddress?.houseNumber || "",
            homeUnitId: initialData?.residentialAddress?.unitId || "",
            homeCity: initialData?.residentialAddress?.city || "",
            homePostalCode: initialData?.residentialAddress?.postalCode || "",
            addrStreet: initialData?.practitionerAddress?.street || "",
            addrHouseNumber: initialData?.practitionerAddress?.houseNumber || "",
            addrUnitId: initialData?.practitionerAddress?.unitId || "",
            addrCity: initialData?.practitionerAddress?.city || "",
            addrPostalCode: initialData?.practitionerAddress?.postalCode || "",
            // In edit mode, set to existing URL if available, otherwise null
            // This ensures validation passes when editing with existing picture
            profilePicture: isEditMode && initialData?.profilePicture ? initialData.profilePicture : null,
          }}
          validationSchema={doctorSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              // Always map specialization to array of ids for backend
              const submitValues = {
                ...values,
                specialization: (values.specialization || []).map(spec => spec.id),
              };
              
              submitValues.medfileQualifications = values.medfileQualifications || [];
              submitValues.residentialAddress = {
                street: values.homeStreet, houseNumber: values.homeHouseNumber, unitId: values.homeUnitId,
                city: values.homeCity, postalCode: values.homePostalCode,
              };
              submitValues.practitionerAddress = {
                street: values.addrStreet, houseNumber: values.addrHouseNumber, unitId: values.addrUnitId,
                city: values.addrCity, postalCode: values.addrPostalCode,
              };
              // Medfile ID typed by hand (an existing practitioner): saved first, so the automatic sync that follows the save updates that record.
              const typedMedfileId = String(values.medfilePractitionerId || "").trim();
              delete submitValues.medfilePractitionerId;
              if (isEditMode && practitionerLoadedRef.current && typedMedfileId !== medfileIdRef.current) {
                await ehealthAdminHelper.saveDoctorPractitioner(initialData?.id || initialData?._id, { medfilePractitionerId: typedMedfileId });
                medfileIdRef.current = typedMedfileId;
              }
              // Edit mode: never overwrite P1 data with blanks if it could not be loaded first
              if (isEditMode && !practitionerLoadedRef.current) {
                ["pesel", "secondName", "medfileRole", "medfileQualifications", "practitionerAddress", "residentialAddress", "noSpecialization", "issuesEDocuments", "prescribingRights", "cellIds", "defaultCellId", "paAllowed"].forEach((k) => delete submitValues[k]);
              }
              ["homeStreet", "homeHouseNumber", "homeUnitId", "homeCity", "homePostalCode"].forEach((k) => delete submitValues[k]);
              ["addrStreet", "addrHouseNumber", "addrUnitId", "addrCity", "addrPostalCode"].forEach((k) => delete submitValues[k]);

              // Remove password fields when empty (optional in both create and edit)
              if (!submitValues.password || submitValues.password.trim() === '') {
                delete submitValues.password;
                delete submitValues.confirmPassword;
              }

              if (isEditMode) {
                // If no new profile picture is uploaded, use the existing URL
                if (!submitValues.profilePicture && initialData?.profilePicture) {
                  submitValues.profilePicture = initialData.profilePicture;
                }
              }
              
              await onAddDoctor(submitValues, resetForm, onClose);
              setSubmitting(false);
            } catch (error) {
              setSubmitting(false);
              console.error("Błąd podczas przesyłania formularza:", error);
            }
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue, setTouched, handleSubmit, dirty, submitCount }) => {
            useEffect(() => {
              const id = initialData?.id || initialData?._id;
              if (!isEditMode || !id) return undefined;
              // The record already came with the professional data: nothing more to load.
              if (initialData?.medfileRole !== undefined) { practitionerLoadedRef.current = true; medfileIdRef.current = initialData.medfilePractitionerId || ""; return undefined; }
              let cancelled = false;
              ehealthAdminHelper.getStaffRow(id).then((res) => {
                const row = res?.data || null;
                if (cancelled || !row) return;
                const a = row.practitionerAddress || {};
                setFieldValue("secondName", row.secondName || "");
                setFieldValue("pesel", row.pesel || "");
                setFieldValue("medfilePractitionerId", row.medfilePractitionerId || "");
                medfileIdRef.current = row.medfilePractitionerId || "";
                setFieldValue("medfileRole", row.medfileRole || "LEK");
                setFieldValue("medfileQualifications", (row.medfileQualifications || []).map((q) => ({ code: q.code, display: q.display })));
                setFieldValue("noSpecialization", !!row.noSpecialization);
                setFieldValue("issuesEDocuments", !!row.issuesEDocuments);
                setFieldValue("prescribingRights", row.prescribingRights || "independent");
                setFieldValue("paAllowed", !!row.paAllowed);
                setFieldValue("cellIds", row.cellIds || []);
                setFieldValue("defaultCellId", row.defaultCellId || "");
                const h = row.residentialAddress || {};
                setFieldValue("homeStreet", h.street || "");
                setFieldValue("homeHouseNumber", h.houseNumber || "");
                setFieldValue("homeUnitId", h.unitId || "");
                setFieldValue("homeCity", h.city || "");
                setFieldValue("homePostalCode", h.postalCode || "");
                setFieldValue("addrStreet", a.street || "");
                setFieldValue("addrHouseNumber", a.houseNumber || "");
                setFieldValue("addrUnitId", a.unitId || "");
                setFieldValue("addrCity", a.city || "");
                setFieldValue("addrPostalCode", a.postalCode || "");
                practitionerLoadedRef.current = true;
              }).catch(() => {});
              return () => { cancelled = true; };
              // eslint-disable-next-line react-hooks/exhaustive-deps
            }, []);

            // Track form data changes for auto-save
            useEffect(() => {
              if (onFormDataChange && !isEditMode) {
                onFormDataChange(values);
              }
            }, [values, onFormDataChange, isEditMode]);

            // When validation fails on submit, touch fields with errors so messages show
            useEffect(() => {
              const errorKeys = Object.keys(errors);
              if (errorKeys.length === 0) return;
              const toTouch = errorKeys.filter((k) => !touched[k]);
              if (toTouch.length > 0) {
                setTouched((prev) => ({ ...prev, ...Object.fromEntries(toTouch.map((k) => [k, true])) }));
              }
            }, [errors]);

            return (
              <Form className="space-y-6" onSubmit={handleSubmit}>
              {submitCount > 0 && Object.keys(errors).length > 0 && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  Formularz zawiera błędy. Proszę poprawić zaznaczone pola poniżej.
                </div>
              )}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left column */}
                <div className="flex-1 space-y-6">
                  {values.showOnWebsite && (<>
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-teal-50 flex items-center justify-center overflow-hidden border-4 border-teal-100">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt="Podgląd Profilu"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={48} className="text-teal-500" />
                        )}
                      </div>
                      <label
                        htmlFor="profilePicture"
                        className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-2 cursor-pointer hover:bg-teal-600 transition-colors"
                        title={isEditMode && initialData?.profilePicture ? "Zmień zdjęcie profilowe" : "Dodaj zdjęcie profilowe"}
                      >
                        <input
                          id="profilePicture"
                          name="profilePicture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                        />
                        {isEditMode && initialData?.profilePicture ? (
                          <Camera size={16} className="text-white" />
                        ) : (
                          <User size={16} className="text-white" />
                        )}
                      </label>
                    </div>
                  </div>
                  {errors.profilePicture && touched.profilePicture && !isEditMode && (
                    <div className="text-red-500 text-xs text-center">
                      {errors.profilePicture}
                    </div>
                  )}
                  {isEditMode && initialData?.profilePicture && !errors.profilePicture && (
                    <div className="text-green-600 text-xs text-center">
                      Zdjęcie profilowe już istnieje. Kliknij ikonę, aby zmienić.
                    </div>
                  )}
                  </>)}

                  <fieldset disabled={selfMode} className="contents space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Imię*
                      </label>
                      <Field
                        type="text"
                        name="firstName"
                        id="firstName"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nazwisko*
                      </label>
                      <Field
                        type="text"
                        name="lastName"
                        id="lastName"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="professionalTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Tytuł
                    </label>
                    <Field
                      type="text"
                      name="professionalTitle"
                      id="professionalTitle"
                      placeholder="np. Dr n. med."
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tytuł drukowany w stopce dokumentu, przed imieniem i nazwiskiem. Specjalizacja nie jest tam pokazywana.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="npwz" className="block text-sm font-medium text-gray-700 mb-1">
                      Numer PWZ
                    </label>
                    <Field
                      type="text"
                      name="npwz"
                      id="npwz"
                      placeholder="np. 9017575"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Prawo wykonywania zawodu. Ten numer jest wymagany, gdy lekarz wystawia e-receptę, e-skierowanie albo e-ZLA w systemie P1.
                    </p>
                    <ErrorMessage name="npwz" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  </fieldset>

                  <div className="rounded-md border border-teal-200 bg-teal-50/40 p-3 space-y-3">
                    <p className="text-sm font-semibold text-teal-800">Dane lekarza dla P1 (Medfile)</p>
                    {selfMode && (
                      <p className="text-xs text-gray-600">Te dane ustawia administrator. Jeśli coś się nie zgadza, napisz do niego (zakładka „e-Zdrowie” → „Zgłoś zmianę danych”). Adresy poniżej możesz zmienić sam.</p>
                    )}
                    <fieldset disabled={selfMode} className="contents space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="secondName" className="block text-xs font-medium text-gray-700 mb-1">Drugie imię</label>
                        <Field type="text" name="secondName" id="secondName" className="w-full p-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label htmlFor="pesel" className="block text-xs font-medium text-gray-700 mb-1">PESEL lekarza</label>
                        <Field type="text" name="pesel" id="pesel" maxLength={11} inputMode="numeric" className="w-full p-2 border border-gray-300 rounded-md" />
                        <ErrorMessage name="pesel" component="p" className="text-red-500 text-xs mt-1" />
                      </div>
                      <div>
                        <label htmlFor="medfileRole" className="block text-xs font-medium text-gray-700 mb-1">Rola w P1</label>
                        <Field
                          as="select"
                          name="medfileRole"
                          id="medfileRole"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          onChange={(e) => {
                            const role = e.target.value;
                            setFieldValue("medfileRole", role);
                            if (!isDoctorRole(role)) { setFieldValue("medfileQualifications", []); setFieldValue("noSpecialization", false); setFieldValue("showOnWebsite", false); }
                            setFieldValue("prescribingRights", isDoctorRole(role) ? "independent" : role === "FIZJO" ? "none" : (values.prescribingRights === "independent" ? "on-order" : values.prescribingRights));
                          }}
                        >
                          <option value="LEK">LEK — lekarz / felczer</option>
                          <option value="LEKD">LEKD — lekarz dentysta</option>
                          <option value="FIZJO">FIZJO — fizjoterapeuta</option>
                          <option value="PIEL">PIEL — pielęgniarka</option>
                        </Field>
                      </div>
                    </div>
                    {!selfMode && (
                    <div className="rounded-md border border-teal-200 bg-white p-3 space-y-2">
                      <label htmlFor="medfilePractitionerId" className="block text-xs font-medium text-gray-700">Konto w Medfile (ID praktyka)</label>
                      {isEditMode ? (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <Field type="text" name="medfilePractitionerId" id="medfilePractitionerId" placeholder="Uzupełnia się po wysłaniu do Medfile" className="flex-1 min-w-[16rem] p-2 border border-gray-300 rounded-md text-sm" />
                            <button
                              type="button"
                              disabled={dirty || medfileSending}
                              title={dirty ? "Najpierw zapisz zmiany w formularzu" : undefined}
                              className="rounded-md border border-[#1b766a] px-3 py-2 text-sm font-semibold text-[#1b766a] hover:bg-[#1b766a]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={async () => {
                                try {
                                  setMedfileSending(true);
                                  const res = await ehealthAdminHelper.syncDoctorPractitioner(initialData?.id || initialData?._id);
                                  const uuid = res?.practitionerUuid || "";
                                  if (uuid) { setFieldValue("medfilePractitionerId", uuid); medfileIdRef.current = uuid; }
                                  toast.success(res?.created ? "Konto utworzone w Medfile" : "Dane zaktualizowane w Medfile");
                                } catch (err) {
                                  toast.error(err?.response?.data?.error?.message || err.message || "Nie udało się wysłać do Medfile");
                                } finally {
                                  setMedfileSending(false);
                                }
                              }}
                            >
                              {medfileSending ? "Wysyłam…" : values.medfilePractitionerId ? "Wyślij zmiany do Medfile" : "Utwórz konto w Medfile"}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">Zapis formularza sam wysyła dane lekarza do Medfile. Przycisk służy do ponowienia wysyłki (np. po błędzie); działa na zapisanych danych{dirty ? " — najpierw zapisz zmiany" : ""}. ID wpisuj ręcznie tylko, gdy lekarz już istnieje w Medfile.</p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-600">Po zapisaniu lekarz zostanie automatycznie utworzony w Medfile (dotyczy każdej roli: lekarz, pielęgniarka, fizjoterapeuta). Jeśli się nie uda, konto i tak zostanie zapisane, a wysyłkę ponowisz tutaj w edycji.</p>
                      )}
                    </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Specjalizacje (lista ministerialna)</label>
                      <SpecialtyPicker
                        role={values.medfileRole}
                        value={values.medfileQualifications}
                        disabled={!isDoctorRole(values.medfileRole) || values.noSpecialization}
                        onChange={(next) => setFieldValue("medfileQualifications", next)}
                      />
                      {isDoctorRole(values.medfileRole) && (
                        <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                          <input
                            type="checkbox"
                            checked={values.noSpecialization}
                            onChange={(e) => { setFieldValue("noSpecialization", e.target.checked); if (e.target.checked) setFieldValue("medfileQualifications", []); }}
                          />
                          Bez specjalizacji / w trakcie specjalizacji
                        </label>
                      )}
                      <ErrorMessage name="medfileQualifications" component="p" className="text-red-500 text-xs mt-1" />
                      <p className="text-xs text-gray-500 mt-1">Wymagane m.in. dla e-skierowań. Nazwa uzupełnia się z listy.</p>
                    </div>
                    <div>
                      <p className="block text-xs font-medium text-gray-700 mb-1">Uprawnienia do wystawiania recept</p>
                      {values.medfileRole === "PIEL" ? (
                        <Field as="select" name="prescribingRights" className="w-full p-2 border border-gray-300 rounded-md">
                          <option value="none">Brak</option>
                          <option value="on-order">Tylko na zlecenie lekarza (kontynuacja leczenia)</option>
                          <option value="independent">Samodzielnie i na zlecenie lekarza</option>
                        </Field>
                      ) : (
                        <p className="text-sm text-gray-700">
                          {isDoctorRole(values.medfileRole) ? "Samodzielnie i na zlecenie lekarza (wynika z zawodu)" : "Brak (nie dotyczy zawodu)"}
                        </p>
                      )}
                    </div>
                    <label className="flex items-start gap-2 text-sm text-gray-800">
                      <input type="checkbox" className="mt-1" checked={values.issuesEDocuments} onChange={(e) => setFieldValue("issuesEDocuments", e.target.checked)} />
                      <span>
                        <span className="font-medium">Wystawia e-dokumenty</span>
                        <span className="block text-xs text-gray-500">Włącz, gdy lekarz wystawia e-recepty, e-skierowania lub e-ZLA. Wtedy PESEL, PWZ i specjalizacja są wymagane. Certyfikat ZUS lekarz dodaje w swoich ustawieniach.</span>
                      </span>
                    </label>
                    <label className="flex items-start gap-2 text-sm text-gray-800">
                      <input type="checkbox" className="mt-1" checked={!!values.paAllowed} onChange={(e) => setFieldValue("paAllowed", e.target.checked)} />
                      <span>
                        <span className="font-medium">Może wystawiać recepty dla siebie i rodziny</span>
                        <span className="block text-xs text-gray-500">Domyślnie wyłączone. Po włączeniu osoba uzupełnia adres i telefon w „Moje ustawienia e-Zdrowie”. Po wyłączeniu takie recepty są blokowane od razu.</span>
                      </span>
                    </label>
                    <DoctorCellsField
                      cellIds={values.cellIds || []}
                      defaultCellId={values.defaultCellId || ""}
                      onChange={(ids, def) => { setFieldValue("cellIds", ids); setFieldValue("defaultCellId", def); }}
                    />
                    </fieldset>
                    <div>
                      <p className="block text-xs font-medium text-gray-700 mb-1">Adres zamieszkania (do recept dla siebie i rodziny)</p>
                      <div className="grid grid-cols-6 gap-2">
                        <Field name="homeStreet" placeholder="Ulica" className="col-span-6 sm:col-span-3 p-2 border border-gray-300 rounded-md" />
                        <Field name="homeHouseNumber" placeholder="Nr domu" className="col-span-3 sm:col-span-1 p-2 border border-gray-300 rounded-md" />
                        <Field name="homeUnitId" placeholder="Lokal" className="col-span-3 sm:col-span-2 p-2 border border-gray-300 rounded-md" />
                        <Field name="homePostalCode" placeholder="00-000" className="col-span-2 p-2 border border-gray-300 rounded-md" />
                        <Field name="homeCity" placeholder="Miasto" className="col-span-4 p-2 border border-gray-300 rounded-md" />
                      </div>
                      <ErrorMessage name="homePostalCode" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                      <p className="block text-xs font-medium text-gray-700 mb-1">Adres praktyki (wymagany m.in. dla recept PA, PF)</p>
                      <div className="grid grid-cols-6 gap-2">
                        <Field name="addrStreet" placeholder="Ulica" className="col-span-6 sm:col-span-3 p-2 border border-gray-300 rounded-md" />
                        <Field name="addrHouseNumber" placeholder="Nr domu" className="col-span-3 sm:col-span-1 p-2 border border-gray-300 rounded-md" />
                        <Field name="addrUnitId" placeholder="Lokal" className="col-span-3 sm:col-span-2 p-2 border border-gray-300 rounded-md" />
                        <Field name="addrPostalCode" placeholder="00-000" className="col-span-2 p-2 border border-gray-300 rounded-md" />
                        <Field name="addrCity" placeholder="Miasto" className="col-span-4 p-2 border border-gray-300 rounded-md" />
                      </div>
                    </div>
                  </div>

                  <fieldset disabled={selfMode} className="contents">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email*
                    </label>
                    <div className="relative">
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                      <Mail
                        size={16}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  </fieldset>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Numer Telefonu*
                    </label>
                    <Field
                      type="text"
                      name="phone"
                      id="phone"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {!selfMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Hasło{isEditMode ? " (opcjonalne)" : "*"}
                      </label>
                      <Field
                        type="password"
                        name="password"
                        id="password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder={isEditMode ? "Zostaw puste, aby zachować obecne hasło" : ""}
                      />
                      {errors.password && touched.password && (
                        <div className="text-red-500 text-xs mt-1">{errors.password}</div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Potwierdź Hasło{isEditMode ? " (opcjonalne)" : "*"}
                      </label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder={isEditMode ? "Zostaw puste, aby zachować obecne hasło" : ""}
                      />
                      {errors.confirmPassword && touched.confirmPassword && (
                        <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </div>
                  )}
                </div>

                {/* Right column */}
                <div className="flex-1 space-y-6">
                  {/* <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Oddział*
                    </label>
                    <div className="relative">
                      <Field
                        as="select"
                        name="department"
                        id="department"
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                      >
                        <option value="">Wybierz Oddział</option>
                        {DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </Field>
                      <Briefcase
                        size={16}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                    <ErrorMessage
                      name="department"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div> */}

                  <fieldset disabled={selfMode} className="contents">
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <label className="flex items-start gap-2 text-sm text-gray-800">
                      <input type="checkbox" className="mt-1" checked={!!values.showOnWebsite} onChange={(e) => setFieldValue("showOnWebsite", e.target.checked)} />
                      <span>
                        <span className="font-medium">Pokaż na stronie internetowej (profil publiczny)</span>
                        <span className="block text-xs text-gray-500">
                          {values.showOnWebsite
                            ? "Do profilu na stronie potrzebne są: zdjęcie, specjalizacje, kwalifikacje, krótki opis i bio."
                            : "To konto służy tylko do pracy w systemie (e-recepty, wizyty, e-ZLA). Nie powstaje strona lekarza, więc zdjęcie, bio i opisy nie są potrzebne."}
                        </span>
                      </span>
                    </label>
                  </div>

                  </fieldset>

                  {values.showOnWebsite && (<>
                  <fieldset disabled={selfMode} className="contents space-y-6">
                  <SpecializationDropdown
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                    specializations={specializations} // Pass the specializations array from context
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kwalifikacje*
                    </label>
                    <div className="flex items-center">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          value={qualificationInput}
                          onChange={(e) =>
                            setQualificationInput(e.target.value)
                          }
                          className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Dodaj kwalifikację"
                        />
                        <BookOpen
                          size={16}
                          className="absolute left-3 top-3 text-gray-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleAddQualification(values, setFieldValue)
                        }
                        className="ml-2 bg-teal-500 text-white p-2 rounded-md hover:bg-teal-600"
                      >
                        Dodaj
                      </button>
                    </div>
                    {values.qualifications.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {values.qualifications.map((qual, index) => (
                          <span
                            key={index}
                            className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-sm flex items-center"
                          >
                            {qual}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveQualification(
                                  index,
                                  values,
                                  setFieldValue
                                )
                              }
                              className="ml-1 text-teal-700 hover:text-teal-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {errors.qualifications && touched.qualifications && (
                      <div className="text-red-500 text-xs mt-1">
                        {errors.qualifications}
                      </div>
                    )}
                  </div>

                  </fieldset>

                  <div>
                    <label
                      htmlFor="shortDescription"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Krótki Opis*
                    </label>
                    <div className="relative">
                      <Field
                        as="textarea"
                        name="shortDescription"
                        id="shortDescription"
                        rows="2"
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Krótki opis lekarza (np. specjalizacja, doświadczenie)"
                      />
                      <FileText
                        size={16}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <ErrorMessage
                        name="shortDescription"
                        component="div"
                        className="text-red-500"
                      />
                      <span className={`text-gray-500 ${values.shortDescription?.length > 180 ? 'text-yellow-600' : ''}`}>
                        {values.shortDescription?.length || 0}/200
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Bio*
                    </label>
                    <div className="relative">
                      <Field
                        as="textarea"
                        name="bio"
                        id="bio"
                        rows="4"
                        className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Doświadczenie zawodowe i specjalizacja lekarza..."
                      />
                      <FileText
                        size={16}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <ErrorMessage
                        name="bio"
                        component="div"
                        className="text-red-500"
                      />
                      <span className="text-gray-500">
                        {values.bio?.length || 0} znaków
                      </span>
                    </div>
                  </div>
                  </>)}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Zapisywanie..." : "Zapisz Lekarza"}
                </button>
              </div>
            </Form>
            );
          }}
        </Formik>

        {/* Image Cropper Modal */}
        {showCropper && cropperImage && (
          <ImageCropper
            imageSrc={cropperImage}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
            aspect={1} // Square aspect ratio for profile picture
          />
        )}
      </div>
    </div>
  );
}