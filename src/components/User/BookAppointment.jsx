import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function BookAppointment({ page }) {
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

  const handleSubmit = (values, { resetForm }) => {
    console.log("Form Data:", values);
    alert("Appointment booked successfully!");
    resetForm();
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
            {() => (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-main-lighter rounded-md border border-main-light p-4">
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
                    name="doctor"
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
                  >
                    <option value="">Select Doctor</option>
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. Jane">Dr. Jane</option>
                  </Field>
                  <ErrorMessage
                    name="doctor"
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
                <div>
                  <Field
                    as="select"
                    name="department"
                    className="p-3 outline-none w-full bg-main-lighter border border-main-light text-main placeholder:text-main rounded"
                  >
                    <option value="">Select Department</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Cardiology">Cardiology</option>
                  </Field>
                  <ErrorMessage
                    name="department"
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
                  className="col-span-1 md:col-span-2 bg-main text-white uppercase rounded-md py-3 font-bold hover:bg-teal-700 transition duration-300"
                >
                  Submit
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  );
}
