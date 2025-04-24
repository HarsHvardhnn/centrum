import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import doctorService from "../../helpers/doctorHelper";
import { DEPARTMENTS } from "../../utils/departments";
import { apiCaller } from "../../utils/axiosInstance";
import { toast } from "sonner";

export default function BookAppointment({ page }) {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState(DEPARTMENTS);
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
    doctor: "",
    department: "",
    message: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    gender: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Invalid phone number")
      .required("Required"),
    date: Yup.date().required("Required"),
    time: Yup.string().required("Required"),
    doctor: Yup.string().required("Required"),
    department: Yup.string().required("Required"),
    message: Yup.string().min(10, "Too short").required("Required"),
  });

  // Fetch all departments when component mounts
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getAllDoctors();

        // Extract unique departments from doctors
        const uniqueDepartments = [
          ...new Set(
            response.data
              .map((doctor) => doctor.department)
              .filter((department) => department && department.trim() !== "")
          ),
        ];

        setDepartments(uniqueDepartments);
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Fetch doctors based on selected department
  const handleDepartmentChange = async (e, setFieldValue) => {
    const selectedDepartment = e.target.value;
    setFieldValue("department", selectedDepartment);

    // Reset doctor selection when department changes
    setFieldValue("doctor", "");

    if (selectedDepartment) {
      try {
        setLoading(true);
        const response = await doctorService.getAllDoctors({
          department: selectedDepartment,
        });

        setDoctors(response.doctors);
      } catch (error) {
        console.error(
          `Error fetching doctors for department ${selectedDepartment}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    } else {
      setDoctors([]);
    }
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
      toast.success("Appointment booked successfully!");
    } catch (error) {
      console.error("Error booking appointment:", error);

      // Set error status and show error message
      const errorMessage =
        error.response?.data?.message ||
        "Failed to book appointment. Please try again.";
      setSubmitStatus({ success: false, error: errorMessage });
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      className={` px-4 flex justify-center items-center ${
        page === "home"
          ? "bg-[url('/images/appointmentbg.PNG')] py-12 lg:px-16 bg-cover bg-center bg-no-repeat"
          : "bg-white"
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
          <h2 className="text-3xl md:text-4xl pt-10 font-serif font-bold text-gray-800">
            Book an Appointment
          </h2>
          <p className="text-neutral-800 mt-2 text-base md:text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            placerat scelerisque tortor ornare ornare.
          </p>
        </div>

        <div className={`${page === "home" ? "md:w-1/2 w-full" : "w-full"} `}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, isSubmitting }) => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-main-lighter rounded-md border border-main-light p-4">
                {/* Show success or error message if available */}
                {submitStatus.success && (
                  <div className="col-span-1 md:col-span-2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Appointment booked successfully!
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
                    placeholder="Name"
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
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
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
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
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <div>
                  <Field
                    name="phone"
                    type="text"
                    placeholder="Phone"
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>

                <div>
                  <Field
                    name="date"
                    type="date"
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
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
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
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
                    name="department"
                    onChange={(e) => handleDepartmentChange(e, setFieldValue)}
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
                  >
                    <option value="">Select Department</option>
                    {departments.map((department, index) => (
                      <option key={index} value={department}>
                        {department}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="department"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <div>
                  <Field
                    as="select"
                    name="doctor"
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
                    disabled={!doctors.length}
                  >
                    <option value="">
                      {loading
                        ? "Loading doctors..."
                        : doctors.length === 0
                        ? "Select Department First"
                        : "Select Doctor"}
                    </option>
                    {doctors.map((doctor) => (
                      <option
                        key={doctor._id || doctor.id}
                        value={doctor._id || doctor.id}
                      >
                        {doctor.name.first && doctor.name.last
                          ? `${doctor.name.first} ${doctor.name.last}`
                          : doctor.name}
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
                    placeholder="Message"
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded h-24"
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
                  className="col-span-1 md:col-span-2 bg-main text-white uppercase rounded-md py-3 font-bold hover:bg-teal-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
}
