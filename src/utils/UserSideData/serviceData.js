import {
  FaHeartbeat,
  FaDna,
  FaTint,
  FaStethoscope,
  FaNotesMedical,
} from "react-icons/fa";

const servicesData = [
  {
    id: 1,
    title: "Free Checkup",
    icon: FaStethoscope,
    shortDescription: "Basic health checkup for all.",
    description: `Our free health checkups ensure that you stay on top of your health. We provide routine tests and screenings to detect any potential health issues early. Our free health checkups ensure that you stay on top of your health. We provide routine tests and screenings to detect any potential health issues early. Our free health checkups ensure that you stay on top of your health. We provide routine tests and screenings to detect any potential health issues early.`,
    images: ["/images/serviceimg1.jfif", "/images/serviceimg2.jfif"],
    bulletPoints: [
      "Regular health monitoring",
      "Consultation with experienced doctors",
      "Basic tests included",
    ],
  },
  {
    id: 2,
    title: "Cardiogram",
    icon: FaHeartbeat,
    shortDescription: "Heart health diagnostics.",
    description: `Our cardiogram services help diagnose heart conditions early, ensuring you get the best treatment possible. We use advanced ECG technology for accurate results. Our cardiogram services help diagnose heart conditions early, ensuring you get the best treatment possible. We use advanced ECG technology for accurate results. Our cardiogram services help diagnose heart conditions early, ensuring you get the best treatment possible. We use advanced ECG technology for accurate results.`,
    images: ["/images/serviceimg1.jfif", "/images/serviceimg2.jfif"],
    bulletPoints: [
      "Advanced ECG analysis",
      "Early detection of heart issues",
      "Expert cardiologist consultation",
    ],
  },
  {
    id: 3,
    title: "DNA Testing",
    icon: FaDna,
    shortDescription: "Genetic analysis services.",
    description: `Discover your genetic health risks with our advanced DNA testing services. We provide insights into hereditary diseases and personalized health recommendations. Discover your genetic health risks with our advanced DNA testing services. We provide insights into hereditary diseases and personalized health recommendations. Discover your genetic health risks with our advanced DNA testing services. We provide insights into hereditary diseases and personalized health recommendations.`,
    images: ["/images/serviceimg1.jfif", "/images/serviceimg2.jfif"],
    bulletPoints: [
      "Accurate genetic testing",
      "Personalized health insights",
      "Confidential and secure reports",
    ],
  },
  {
    id: 4,
    title: "Blood Bank",
    icon: FaTint,
    shortDescription: "Safe and secure blood donation.",
    description: `Our blood bank ensures a reliable supply of blood for those in need. We maintain the highest standards for storage and safety. Our blood bank ensures a reliable supply of blood for those in need. We maintain the highest standards for storage and safety. Our blood bank ensures a reliable supply of blood for those in need. We maintain the highest standards for storage and safety.`,
    images: ["/images/serviceimg1.jfif", "/images/serviceimg2.jfif"],
    bulletPoints: [
      "Safe and hygienic blood collection",
      "24/7 emergency availability",
      "Blood donation camps",
    ],
  },
  {
    id: 5,
    title: "Medical Consultation",
    icon: FaNotesMedical,
    shortDescription: "Expert medical advice.",
    description: `Get expert medical advice from our experienced doctors. We offer consultations in various specialties to address your health concerns effectively. Get expert medical advice from our experienced doctors. We offer consultations in various specialties to address your health concerns effectively. Get expert medical advice from our experienced doctors. We offer consultations in various specialties to address your health concerns effectively.`,
    images: ["/images/serviceimg1.jfif", "/images/serviceimg2.jfif"],
    bulletPoints: [
      "Consult top medical experts",
      "Personalized health plans",
      "Telemedicine options available",
    ],
  },
  {
    id: 6,
    title: "Free Consultation",
    icon: FaNotesMedical,
    shortDescription: "Expert medical advice.",
    description: `Get expert medical advice from our experienced doctors. We offer consultations in various specialties to address your health concerns effectively. Get expert medical advice from our experienced doctors. We offer consultations in various specialties to address your health concerns effectively. Get expert medical advice from our experienced doctors. We offer consultations in various specialties to address your health concerns effectively.`,
    images: ["/images/serviceimg1.jfif", "/images/serviceimg2.jfif"],
    bulletPoints: [
      "Consult top medical experts",
      "Personalized health plans",
      "Telemedicine options available",
    ],
  },
];

export default servicesData;
