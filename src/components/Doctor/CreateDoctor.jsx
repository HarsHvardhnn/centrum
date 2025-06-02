import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  X,
  User,
  Mail,
  Award,
  BookOpen,
  Clock,
  FileText,
  Briefcase,
} from "lucide-react";
import { useSpecializations } from "../../context/SpecializationContext";
import SpecializationDropdown from "./SpecializationDropdown";
import ImageCropper from "../UtilComponents/ImageCropper";

// List of departments

// Updated validation schema with department field
const DoctorSchema = Yup.object().shape({
  firstName: Yup.string().required("Imię jest wymagane"),
  lastName: Yup.string().required("Nazwisko jest wymagane"),
  email: Yup.string()
    .email("Nieprawidłowy adres email")
    .required("Email jest wymagany"),
  phone: Yup.string(),
  password: Yup.string()
    .min(8, "Hasło musi zawierać co najmniej 8 znaków")
    .required("Hasło jest wymagane"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Hasła muszą być zgodne")
    .required("Potwierdzenie hasła jest wymagane"),
  specialization: Yup.array()
    .min(1, "Wymagana jest co najmniej jedna specjalizacja")
    .required("Specjalizacja jest wymagana"),
  qualifications: Yup.array()
    .min(1, "Wymagana jest co najmniej jedna kwalifikacja")
    .required("Kwalifikacja jest wymagana"),
  experience: Yup.number()
    .positive("Doświadczenie musi być liczbą dodatnią")
    .required("Doświadczenie jest wymagane"),
  bio: Yup.string().required("Bio jest wymagane"),
  consultationFee: Yup.number()
    .positive("Opłata musi być liczbą dodatnią")
    .required("Opłata za konsultację online jest wymagana"),
  offlineConsultationFee: Yup.number()
    .positive("Opłata musi być liczbą dodatnią")
    .required("Opłata za konsultację stacjonarną jest wymagana"),
  // profilePicture: Yup.mixed().when('$isEditMode', {
  //   is: true,
  //   then: () => Yup.mixed(), // no validation
  //   otherwise: () => Yup.mixed().required("Zdjęcie profilowe jest wymagane"),
  // }),
});


export default function AddDoctorForm({ isOpen, onClose, onAddDoctor, initialData, isEditMode }) {
  console.log("doctors",initialData)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? "Edytuj Lekarza" : "Dodaj Nowego Lekarza"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <Formik
          initialValues={{
            firstName: initialData?.name?.first || "",
            lastName: initialData?.name?.last || "",
            email: initialData?.email || "",
            phone: initialData?.phone || "",
            password: "",
            confirmPassword: "",
            department: initialData?.department || "",
            specialization: normalizeSpecs(initialData?.specializations),
            qualifications: initialData?.qualifications || [],
            experience: initialData?.experience || "",
            bio: initialData?.bio || "",
            consultationFee: initialData?.onlineConsultationFee || "",
            offlineConsultationFee: initialData?.offlineConsultationFee || "",
            profilePicture: null, // Always null initially, we handle preview separately
          }}
          validationSchema={DoctorSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              // Always map specialization to array of ids for backend
              const submitValues = {
                ...values,
                specialization: (values.specialization || []).map(spec => spec.id),
              };
              await onAddDoctor(submitValues, resetForm, onClose);
              setSubmitting(false);
            } catch (error) {
              setSubmitting(false);
              console.error("Błąd podczas przesyłania formularza:", error);
            }
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left column */}
                <div className="flex-1 space-y-6">
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
                        className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-2 cursor-pointer"
                      >
                        <input
                          id="profilePicture"
                          name="profilePicture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                        />
                        <User size={16} className="text-white" />
                      </label>
                    </div>
                  </div>
                  {errors.profilePicture && touched.profilePicture && (
                    <div className="text-red-500 text-xs text-center">
                      {errors.profilePicture}
                    </div>
                  )}

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

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Numer Telefonu
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Hasło*
                      </label>
                      <Field
                        type="password"
                        name="password"
                        id="password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Potwierdź Hasło*
                      </label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="experience"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Doświadczenie (lata)*
                      </label>
                      <div className="relative">
                        <Field
                          type="number"
                          name="experience"
                          id="experience"
                          min="0"
                          className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                        <Clock
                          size={16}
                          className="absolute left-3 top-3 text-gray-400"
                        />
                      </div>
                      <ErrorMessage
                        name="experience"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="consultationFee"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Opłata za konsultację online*
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">PLN</span>
                        </div>
                        <Field
                          type="number"
                          name="consultationFee"
                          id="consultationFee"
                          className="w-full pl-14 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          min="0"
                        />
                      </div>
                      <ErrorMessage
                        name="consultationFee"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="offlineConsultationFee"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Opłata za konsultację stacjonarną*
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">PLN</span>
                      </div>
                      <Field
                        type="number"
                        name="offlineConsultationFee"
                        id="offlineConsultationFee"
                        className="w-full pl-14 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        min="0"
                      />
                    </div>
                    <ErrorMessage
                      name="offlineConsultationFee"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
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
                    <ErrorMessage
                      name="bio"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
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
          )}
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