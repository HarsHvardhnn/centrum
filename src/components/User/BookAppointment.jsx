import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

export default function BookAppointment() {
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
    <section className="py-12 px-6 flex justify-center items-center bg-[url('/images/appointmentbg.PNG')] bg-cover bg-center bg-no-repeat relative">
      <div className="absolute inset-0 bg-white bg-opacity-70"></div>

      <div className="max-w-6xl p-8 rounded-lg flex gap-8 relative z-10">
        <div className="w-1/2 flex flex-col justify-center">
          <h2 className="text-4xl font-serif font-bold text-gray-800">
            Book an Appointment
          </h2>
          <p className="text-neutral-800 mt-2 text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            placerat scelerisque tortor ornare ornare. Convallis felis vitae
            tortor augue. Velit nascetur proin massa in. Consequat faucibus
            porttitor enim et.{" "}
          </p>
        </div>

        <div className="w-1/2">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {() => (
              <Form className="grid grid-cols-2 bg-main-lighter rounded-md border border-main-light">
                <div>
                  <Field
                    name="name"
                    type="text"
                    placeholder="Name"
                    className="p-4 rounded-tl-md outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main"
                  />
                  <ErrorMessage name="name" component="div" className="error" />
                </div>
                <div>
                  <Field
                    as="select"
                    name="gender"
                    className="p-4 rounded-tl-md outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main"
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Field>
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="error"
                  />
                </div>

                <div>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="p-4 outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="error"
                  />
                </div>
                <div>
                  <Field
                    name="phone"
                    type="text"
                    placeholder="Phone"
                    className="p-4 outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main"
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="error"
                  />
                </div>

                <div>
                  <Field
                    name="date"
                    type="date"
                    className="p-4 outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main"
                  />
                  <ErrorMessage name="date" component="div" className="error" />
                </div>
                <div>
                  <Field
                    name="time"
                    type="time"
                    className="p-4 outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main"
                  />
                  <ErrorMessage name="time" component="div" className="error" />
                </div>

                <div>
                  <Field
                    as="select"
                    name="doctor"
                    className="p-4 outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main"
                  >
                    <option value="">Select Doctor</option>
                    <option value="Dr. Smith">Dr. Smith</option>
                    <option value="Dr. Jane">Dr. Jane</option>
                  </Field>
                  <ErrorMessage
                    name="doctor"
                    component="div"
                    className="error"
                  />
                </div>
                <div>
                  <Field
                    as="select"
                    name="department"
                    className="p-4 outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main"
                  >
                    <option value="">Select Department</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Cardiology">Cardiology</option>
                  </Field>
                  <ErrorMessage
                    name="department"
                    component="div"
                    className="error"
                  />
                </div>

                <div className="col-span-2 h-48">
                  <Field
                    as="textarea"
                    name="message"
                    placeholder="Message"
                    className="p-4 outline-none w-full bg-main-lighter border-b border-r border-main-light text-main placeholder:text-main h-48"
                  />
                  <ErrorMessage
                    name="message"
                    component="div"
                    className="error"
                  />
                </div>

                <button
                  type="submit"
                  className="col-span-2 bg-main uppercase rounded-b-md text-white py-3 font-bold hover:bg-teal-700"
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
