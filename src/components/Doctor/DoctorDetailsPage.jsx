import React from "react";
import Calendar from "./SingleDoctor/Calendar";
import { GoDotFill } from "react-icons/go";
import { IoIosStar } from "react-icons/io";
import { FiThumbsUp } from "react-icons/fi";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaPlus, FaArrowLeftLong } from "react-icons/fa6";

const doctorData = {
  profilePic: "/images/doc1.jfif",
  name: "Mr. Doctor Name",
  rating: 4.7,
  qualification: "MDS - Periodontology and Oral Implantology, BDS",
  specialization: "Oral And Maxillofacial Surgeon, Dentist",
  experience: "18 Years Experience Overall (9 years as specialist)",
  votes: 250,
  location: "Sylhet, Bangladesh",
  hospital: "United Hospital Limited",
  hospitalRating: 5,
  waitTime: "Max 15 mins wait",
  price: "$220",
  times: [
    "09:00 am",
    "09:30 am",
    "10:00 am",
    "10:30 am",
    "11:00 am",
    "11:30 am",
    "01:00 pm",
    "01:30 pm",
    "02:00 pm",
    "02:30 pm",
    "03:00 pm",
    "03:30 pm",
    "04:00 pm",
    "04:30 pm",
  ],
  biography:
    "Jacob Jones, PPCNP, is a pediatric nurse practitioner who was born and raised in the Maryland and Washington, D.C., area. She attended Elon University in North Carolina, where she completed undergraduate studies with a B.A. in psychology and triple minor degrees in neuroscience, anthropology and African-American studies. Allergy and Immunology.",
  education: [
    {
      institute: "Chattagram International Dental College & Hospital",
      degree: "MDS - Periodontology and Oral Implantology, BDS",
      duration: "1998 - 2003",
    },
    {
      institute: "US Dental Medical University",
      degree: "Oral And Maxillofacial Surgeon, Dentist",
      duration: "2003-2005",
    },
  ],
  experienceList: [
    {
      workplace: "Ibn Sina Specialized Hospital",
      duration: "2010 - Present (15 years)",
    },
    {
      workplace: "Dhaka Dental College and Hospital",
      duration: "2007 - 2010 (3 years)",
    },
    {
      workplace: "Smile Dental Care",
      duration: "2005 - 2007 (3 years)",
    },
  ],
  achievements: [
    {
      title: "Best Dentist Award 2021",
      date: "July 2019",
      description:
        "Dr. Friedman and his team are the proud recipients of the New Jersey Top Dentist award for 2019...",
    },
    {
      title: "The Dental Professional of The Year Award",
      date: "May 2010",
      description:
        "Nicole Elang and Devon Trute are finalists for the Student Dentist of the year...",
    },
  ],
  services: [
    "Tooth cleaning",
    "Root Canal Therapy",
    "Implants",
    "Surgical Extractions",
    "Fissure Sealants",
    "Composite Bonding",
    "Orthodontics",
    "Tooth extractions",
    "Wisdom tooth removal",
  ],
  specializations: [
    "Dental Care",
    "Children Care",
    "Oral and Maxillofacial Surgery",
    "Orthodontics",
    "Periodontist Dentistry",
    "Prosthodontics",
  ],
};

const DoctorCard = ({ data }) => (
  <div className="text-center p-4 w-full shadow rounded-lg flex flex-col gap-2">
    <div className="relative inline-block w-fit mx-auto rounded-full">
      <img
        src={data.profilePic}
        alt="Doctor"
        className="mx-auto size-28 border border-white shadow-md object-cover rounded-full p-0.5"
      />
      <RiVerifiedBadgeFill className="absolute bottom-2 right-2 text-blue-500 text-xl" />
    </div>

    <h2 className="text-lg font-semibold">{data.name}</h2>
    <p className="text-sm font-medium text-gray-700 bg-[#e6f4f4] rounded w-fit mx-auto px-3 py-1 flex gap-2 items-center">
      <IoIosStar className="text-[#deae37] " />
      {data.rating}
    </p>
    <p className="text-sm">{data.qualification}</p>
    <p className="text-sm">{data.specialization}</p>
    <p className="text-sm">{data.experience}</p>
    <p className="mt-4 font-medium text-sm flex items-center justify-center gap-2">
      <FiThumbsUp className="text-lg" />
      98% ({data.votes} votes)
    </p>
    <p className="font-medium mb-4 text-sm flex items-center justify-center gap-2">
      <MdOutlineVerifiedUser className="text-lg" />
      Medical Registration Verified
    </p>
    <button className="w-full font-medium text-[#99d1d1] underline">
      Share your Feedback
    </button>
  </div>
);

const AvailableTime = ({ data }) => (
  <div className="p-4 mt-4 shadow rounded-lg flex flex-col gap-2">
    <h3 className="text-lg font-semibold pb-2 border-b">Available Time</h3>
    <p className="font-semibold">{data.hospital}</p>
    <div className="flex justify-between text-sm font-medium items-center">
      <div className="flex w-full gap-4 items-center">
        <p className="text-gray-700 bg-[#e6f4f4] rounded px-3 py-1 flex gap-2 items-center">
          {data.hospitalRating}
          <IoIosStar className="text-[#deae37]" />
        </p>
        <p>{data.waitTime}</p>
      </div>
      <p className="text-right">{data.price}</p>
    </div>
    <p className="text-sm mb-4">{data.location}</p>
    <Calendar />
    <div className="grid grid-cols-3 gap-2 mt-2">
      {data.times.map((time, i) => (
        <span
          key={i}
          className="rounded py-2.5 text-sm text-center hover:bg-[#80c5c5] shadow cursor-pointer"
        >
          {time}
        </span>
      ))}
    </div>
    <button className="mt-4 py-2 px-4 rounded-lg text-white w-fit mx-auto bg-[#80c5c5] flex items-center justify-center gap-2">
      <FaPlus />
      Book Appointment
    </button>
  </div>
);

const DoctorBackground = ({ data }) => (
  <div className="p-4 space-y-6">
    <section>
      <h3 className="text-lg font-semibold mb-2">Biography</h3>
      <p className="text-sm text-gray-700">{data.biography}</p>
    </section>
    <section className="grid md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Education</h3>
        {data.education.map((edu, idx) => (
          <div key={idx} className="flex items-start gap-2 mb-4">
            <GoDotFill className="text-teal-600 " />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm">{edu.institute}</p>
              <p className="text-sm text-gray-600">{edu.degree}</p>
              <p className="text-sm text-gray-500">{edu.duration}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Work & Experience</h3>
        {data.experienceList.map((exp, idx) => (
          <div key={idx} className="flex items-start gap-2 mb-4">
            <GoDotFill className="text-teal-600" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-sm">{exp.workplace}</p>
              <p className="text-sm text-gray-500">{exp.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <hr />

    <section className="border-b pb-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Achievements</h3>
        <div className="flex gap-4">
          {data.achievements.map((ach, idx) => (
            <div key={idx} className="flex w-full items-start gap-4 mb-4">
              <GoDotFill className="text-teal-600 size-6" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-sm">{ach.title}</p>
                <p className="text-sm  font-medium">{ach.date}</p>
                <p className="text-sm text-gray-600">{ach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <section>
      <h3 className="text-lg font-semibold mb-4">Services</h3>
      <div className="flex flex-wrap gap-2">
        {data.services.map((service, idx) => (
          <span
            key={idx}
            className="border bg-white text-sm px-4 py-1 rounded-full"
          >
            {service}
          </span>
        ))}
      </div>
    </section>
    <section>
      <h3 className="text-lg font-semibold mb-4">Specializations</h3>
      <div className="flex flex-wrap gap-2">
        {data.specializations.map((spec, idx) => (
          <span
            key={idx}
            className="border bg-white text-sm px-4 py-1 rounded-full"
          >
            {spec}
          </span>
        ))}
      </div>
    </section>
  </div>
);

export default function DoctorDetailPage() {
  return (
    <>
      <h1 className="text-[#80c5c5] font-medium flex items-center gap-2 p-6 text-sm">
        <FaArrowLeftLong className="font-normal"/>
        Doctor Appointment / {doctorData.name}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        <div className="md:col-span-1 space-y-4">
          <DoctorCard data={doctorData} />
          <AvailableTime data={doctorData} />
        </div>
        <div className="md:col-span-2">
          <DoctorBackground data={doctorData} />
        </div>
      </div>
    </>
  );
}
