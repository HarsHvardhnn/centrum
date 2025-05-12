import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import doctorService from "../../helpers/doctorHelper";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";
import { useSpecializations } from "../../context/SpecializationContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function BookAppointment({
  page,
  selectedSpecialization = "",
  selectedDoctorId = "",
}) {
  console.log("selectedDoctorId", selectedDoctorId);
  const { specializations } = useSpecializations();
  console.log("specializations", specializations);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: null,
  });

  const initialValues = {
    name: "",
    gender: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    doctor: selectedDoctorId || "",
    specialization: selectedSpecialization || "",
    message: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Wymagane"),
    gender: Yup.string().required("Wymagane"),
    email: Yup.string().email("Nieprawidłowy email").required("Wymagane"),
    phone: Yup.string()
      .matches(/^\d{9}$|^\+48\d{9}$/, "Wprowadź 9-cyfrowy numer telefonu")
      .required("Wymagane"),
    date: Yup.date().required("Wymagane"),
    time: Yup.string().required("Wymagane"),
    doctor: Yup.string().required("Wymagane"),
    specialization: Yup.string().required("Wymagane"),
    message: Yup.string().min(10, "Za krótka wiadomość").required("Wymagane"),
  });

  // Fetch doctors for preselected specialization when component mounts
  useEffect(() => {
    if (selectedSpecialization) {
      fetchDoctorsForSpecialization(selectedSpecialization);
    }
  }, [selectedSpecialization]);

  const fetchDoctorsForSpecialization = async (specializationId) => {
    if (!specializationId) return;

    try {
      setLoading(true);
      const response = await doctorService.getAllDoctors({
        specialization: specializationId,
      });

      setDoctors(response.doctors || []);
    } catch (error) {
      console.error(
        `Error fetching doctors for specialization ${specializationId}:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors based on selected specialization
  const handleSpecializationChange = async (e, setFieldValue) => {
    const newSpecialization = e.target.value;
    setFieldValue("specialization", newSpecialization);

    // Reset doctor selection when specialization changes
    setFieldValue("doctor", "");

    if (newSpecialization) {
      fetchDoctorsForSpecialization(newSpecialization);
    } else {
      setDoctors([]);
    }
  };

  // Handle phone number change
  const handlePhoneChange = (value, data, event, formik) => {
    // Extract just the number part (remove +48 prefix if present)
    const numberOnly = value.replace(/^\+48/, '');
    formik.setFieldValue("phone", numberOnly);
  };

  // Updated handleSubmit function to use the apiCaller
  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      setSubmitting(true);
      setSubmitStatus({ success: false, error: null });

      // Format date and time if needed
      const formattedValues = {
        ...values,
        // You can add any additional formatting here if needed
        phone: values.phone.length === 9 ? `+48${values.phone}` : values.phone,
      };

      // Make API call to book appointment
      const response = await apiCaller(
        "POST",
        "/appointments/book",
        formattedValues
      );

      console.log("Appointment booked successfully:", response.data);
      setSubmitStatus({ success: true, error: null });
      resetForm();

      // Show success message to user
      toast.success("Wizyta została pomyślnie zarezerwowana!");
    } catch (error) {
      console.error("Błąd podczas rezerwacji wizyty:", error);

      // Set error status and show error message
      const errorMessage =
        error.response?.data?.message ||
        "Nie udało się zarezerwować wizyty. Spróbuj ponownie.";
      setSubmitStatus({ success: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className={`px-4 flex justify-center items-center ${
        page === "home"
          ? "bg-[url('/images/bookappointment.jpg')] py-12 lg:px-16 bg-cover bg-center bg-no-repeat"
          : "bg-[#f5f7fa]"
      }  relative`}
    >
      <div className="absolute inset-0 bg-white bg-opacity-70"></div>

      <div
        className={`max-w-6xl lg:p-6 md:p-8 rounded-lg flex ${
          page === "home" ? "flex-col md:flex-row" : "flex-col"
        } gap-6 md:gap-8 relative z-10 w-full`}
      >
        <div
          className={`${
            page === "home" ? "md:w-1/2" : "w-full"
          }  flex flex-col justify-center text-center md:text-left`}
        >
          <h2 className="text-3xl md:text-4xl pt-10 font-serif font-bold text-primary">
            Zarezerwuj wizytę
          </h2>
          <p className="text-neutral-800 mt-2 text-base md:text-lg">
          Wybierz dogodny termin i umów się na konsultację
 z naszym specjalistą. To szybkie, proste i wygodne
 — bez dzwonienia i kolejek.
          </p>
        </div>

        <div className={`${page === "home" ? "md:w-1/2 w-full" : "w-full"} `}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ setFieldValue, isSubmitting, values, errors, touched }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f5f7fa] rounded-md border border-[#062b47] p-4">
                {/* Show success or error message if available */}
                {submitStatus.success && (
                  <div className="col-span-1 md:col-span-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Wizyta została pomyślnie zarezerwowana!
                  </div>
                )}

                {submitStatus.error && (
                  <div className="col-span-1 md:col-span-2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {submitStatus.error}
                  </div>
                )}

                <div>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Imię i nazwisko"
                    className="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <div>
                  <Field
                    as="select"
                    name="gender"
                    className="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded appearance-none"
                  >
                    <option value="">Wybierz płeć</option>
                    <option value="male">Mężczyzna</option>
                    <option value="female">Kobieta</option>
                    <option value="other">Inna</option>
                  </Field>
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <div>
                  <div className="phone-input-container">
                    <PhoneInput
                      country={'pl'}
                      value={values.phone}
                      onChange={(value, data, event) => handlePhoneChange(value, data, event, { setFieldValue })}
                      inputProps={{
                        name: 'phone',
                        placeholder: '(+48) 123456789',
                      }}
                      containerClass="w-full"
                      inputClass="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded"
                      buttonClass="border-[#062b47]"
                      preferredCountries={['pl']}
                      disableDropdown={true}
                      disableCountryCode={true}
                      masks={{pl: '.........'}}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.phone}
                    </div>
                  )}
                </div>

                <div>
                  <Field
                    name="date"
                    type="date"
                    className="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded"
                  />
                  <ErrorMessage
                    name="date"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <div>
                  <Field
                    name="time"
                    type="time"
                    className="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded"
                  />
                  <ErrorMessage
                    name="time"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div>
                  <Field
                    as="select"
                    name="specialization"
                    onChange={(e) => handleSpecializationChange(e, setFieldValue)}
                    className="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded appearance-none"
                  >
                    <option value="">Wybierz specjalizację</option>
                    {specializations.map((spec) => (
                      <option key={spec._id} value={spec._id}>
                        {spec.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="specialization"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <div>
                  <Field
                    as="select"
                    name="doctor"
                    className="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded appearance-none"
                    disabled={!values.specialization}
                  >
                    <option value="">Wybierz lekarza</option>
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="doctor"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <Field
                    as="textarea"
                    name="message"
                    placeholder="Opisz swój problem"
                    className="p-3 outline-none w-full bg-white border border-[#062b47] text-[#062b47] placeholder:text-[#062b47] rounded resize-none h-32"
                  />
                  <ErrorMessage
                    name="message"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="col-span-1 md:col-span-2 bg-main text-white py-3 rounded hover:bg-main-dark transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Rezerwowanie..." : "Zarezerwuj wizytę"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      <style jsx>{`
        /* Safari-specific fixes */
        @media not all and (min-resolution:.001dpcm) { 
          @supports (-webkit-appearance:none) {
            select {
              background-image: url("data:image/svg+xml;utf8,<svg fill='%23062b47' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
              background-repeat: no-repeat;
              background-position-x: calc(100% - 10px);
              background-position-y: 50%;
              padding-right: 30px;
            }
            
            .phone-input-container .react-tel-input .form-control {
              width: 100% !important;
              height: auto !important;
              padding-left: 58px !important;
            }
            
            .phone-input-container .react-tel-input .flag-dropdown {
              background-color: white !important;
              border-color: #062b47 !important;
              border-right: 1px solid #062b47 !important;
            }
          }
        }
        
        /* Phone input style customizations */
        .phone-input-container .react-tel-input .form-control {
          width: 100% !important;
          height: 48px !important;
          font-size: 16px !important;
          border: 1px solid #062b47 !important;
          border-radius: 0.25rem !important;
          background-color: white !important;
          color: #062b47 !important;
        }
        
        .phone-input-container .react-tel-input .flag-dropdown {
          background-color: white !important;
          border-color: #062b47 !important;
          border-radius: 0.25rem 0 0 0.25rem !important;
        }
        
        .phone-input-container .react-tel-input .selected-flag {
          background-color: white !important;
          border-radius: 0.25rem 0 0 0.25rem !important;
        }
        
        .phone-input-container .react-tel-input .flag-dropdown.open {
          background-color: white !important;
          border-radius: 0.25rem 0 0 0 !important;
        }
      `}</style>
    </section>
  );
}
