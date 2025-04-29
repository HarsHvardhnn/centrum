import React, { useState, useEffect } from "react";
import Calendar from "./SingleDoctor/Calendar";
import { GoDotFill } from "react-icons/go";
import { IoIosStar } from "react-icons/io";
import { FiThumbsUp } from "react-icons/fi";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaPlus, FaArrowLeftLong } from "react-icons/fa6";
import ServicesPricingComponent from "./DoctorSpecialisations/ServicesPricingComponent";
import SpecializationsComponent from "./DoctorSpecialisations/SpecializationsComponent";
import { useNavigate, useParams } from "react-router-dom"; // or "react-router-dom" depending on your setup
import doctorService from "../../helpers/doctorHelper";
import { useLoader } from "../../context/LoaderContext";

// Doctor service import

export default function DoctorDetailPage() {
  const router = useParams();

  const navigate=useNavigate()
  const { showLoader, hideLoader } = useLoader();
  const [doctorData, setDoctorData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        // Get doctor ID from query params
        const doctorId = router.id;

        if (!doctorId) return; // Wait until we have the ID

        showLoader();
        const response = await doctorService.getDoctorById(doctorId);

        if (response.success && response.doctor) {
          // Transform the API data to match our component structure
          const transformedData = transformDoctorData(response.doctor);
          setDoctorData(transformedData);
        } else {
          setError("Failed to load doctor data");
        }
      } catch (err) {
        console.error("Error fetching doctor data:", err);
        setError("Error loading doctor data");
      } finally {
        hideLoader();
      }
    };

    fetchDoctorData();
  }, [router.id]); // Fixed dependency from router.query to router.id

  // Transform API response to match component data structure
  const transformDoctorData = (apiDoctor) => {
    console.log(
      "apiDoctor.specialization",
      apiDoctor.specialization.map((spec) => spec.name)
    );
    // console.log("")
    const fullName = `${apiDoctor.name.first} ${apiDoctor.name.last}`;

    // Create qualification string from the array
    const qualification = apiDoctor.qualifications
      ? apiDoctor.qualifications.join(", ")
      : "";

    // Create specialization string from the array
    const specialization = apiDoctor.specialization
      ? apiDoctor.specialization.map((spec) => spec.name).join(", ")
      : "";

    // Format experience
    const experienceText = apiDoctor.experience
      ? `${apiDoctor.experience} Years Experience Overall`
      : "";

    return {
      id: apiDoctor._id || apiDoctor.id, // Ensure we have the doctor ID
      profilePic: apiDoctor.profilePicture || "/images/default-doctor.png",
      name: fullName,
      rating: apiDoctor.averageRating || 0, // Default or calculate from reviews if available
      qualification: qualification,
      specialization: specialization,
      experience: experienceText,
      votes: apiDoctor.votes || 0, // Default or get from reviews if available
      location: "Location", // Add if available in API
      hospital: "Hospital", // Add if available in API
      hospitalRating: 5, // Default or calculate if available
      waitTime: "Max 15 mins wait", // Default or get from API if available
      price: `$${apiDoctor.consultationFee || 0}`,
      biography: apiDoctor.bio || "",
      education: [], // Empty array as it's not in the API response
      experienceList: [], // Empty array as it's not in the API response
      achievements: [], // Empty array as it's not in the API response
      services: [], // Empty array as it's not in the API response
      // specializations: apiDoctor.specialization || [], // Use the specialization array
    };
  };

  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!doctorData)
    return <div className="p-6 text-center">No doctor data available</div>;

  return (
    <>
      <h1 className="text-[#80c5c5] font-medium flex items-center gap-2 p-6 text-xl">
        <FaArrowLeftLong className="font-normal cursor-pointer" onClick={()=>{navigate("/doctors")}}/>
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

// Other components remain unchanged
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
    <p className="text-sm">{data.specialization || "General"}</p>
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

const AvailableTime = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!data || !data.id) return;

      try {
        setIsLoading(true);
        showLoader();

        // Format date as YYYY-MM-DD for API
        const formattedDate = selectedDate.toISOString().split("T")[0];

        console.log("date",selectedDate, formattedDate);
        const response = await doctorService.getDoctorAvailableSlots(
          data.id,
          formattedDate
        );

          setAvailableSlots(response.data.data || []);
        
      } catch (err) {
        console.error("Error fetching available slots:", err);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
        hideLoader();
      }
    };

    fetchAvailableSlots();
  }, [data, selectedDate]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Format time from 24h to 12h format
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "pm" : "am";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
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
      <Calendar onDateSelect={handleDateSelect} />

      {isLoading ? (
        <div className="text-center py-4">Loading available slots...</div>
      ) : availableSlots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {availableSlots.map((slot, i) => (
            <span
              key={i}
              className={`rounded py-2.5 text-sm text-center ${
                slot.available
                  ? "hover:bg-[#80c5c5] shadow cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {formatTime(slot.startTime)}
            </span>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">No available slots for this date</div>
      )}

      <button className="mt-4 py-2 px-4 rounded-lg text-white w-fit mx-auto bg-[#80c5c5] flex items-center justify-center gap-2">
        <FaPlus />
        Book Appointment
      </button>
    </div>
  );
};

const DoctorBackground = ({ data }) => {
  const [docData, setData] = useState(
    data || {
      services: [],
      specializations: [],
    }
  );

  // Helper function to determine if a section should be shown
  const shouldShowSection = (section) => {
    return section && section.length > 0;
  };

  return (
    <div className="p-4 space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2">Biography</h3>
        <p className="text-sm text-gray-700">{data.biography}</p>
      </section>

      {shouldShowSection(data.education) && (
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

          {shouldShowSection(data.experienceList) && (
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
          )}
        </section>
      )}

      <hr />

      {shouldShowSection(data.achievements) && (
        <section className="border-b pb-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">Achievements</h3>
            <div className="flex gap-4">
              {data.achievements.map((ach, idx) => (
                <div key={idx} className="flex w-full items-start gap-4 mb-4">
                  <GoDotFill className="text-teal-600 size-6" />
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-sm">{ach.title}</p>
                    <p className="text-sm font-medium">{ach.date}</p>
                    <p className="text-sm text-gray-600">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ServicesPricingComponent data={data} />
      <SpecializationsComponent data={data} />
    </div>
  );
};
