import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import doctorService from "../../helpers/doctorHelper";
import { useNavigate } from "react-router-dom";

export default function Doctors({
  setSelectedDoctorId,
  setSelectedDepartment,
}) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getAllDoctors();

        // Transform the API response to match the component's expected format
        const transformedDoctors = response.doctors.map((doctor) => ({
          id: doctor._id || doctor.id,
          name:
            doctor.name.first && doctor.name.last
              ? `${doctor.name.first} ${doctor.name.last}`
              : doctor.name, // Handle both object and string format
          department:
            doctor.department ||
            (doctor.specializations && doctor.specializations[0]) ||
            "",
          image: doctor.image || "https://via.placeholder.com/400x500",
          experience: doctor.experience || "",
          social: {
            linkedin: "#",
            facebook: "#",
            instagram: "#",
          },
          consultationFee: doctor.consultationFee,
        }));

        setDoctors(transformedDoctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  if (loading) {
    return (
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-main font-serif">
          Loading Doctors...
        </h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-2xl font-bold text-red-500">{error}</h2>
      </section>
    );
  }

  return (
    <section className="py-16 px-6 bg-white text-center">
      <h3 className="md:text-xl font-bold text-neutral-800">TRUSTED CARE</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 sm:mb-12">
        Our Doctors
      </h2>

      <div className="max-w-sm md:max-w-6xl mx-auto overflow-clip">
        {doctors.length > 0 ? (
          <Slider {...settings}>
            {doctors.map((doctor) => (
              <div key={doctor.id} className="px-4">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-80 md:h-96 object-cover"
                  />
                  <div className="bg-[#DEE2CF] text-main py-6 px-6">
                    <h4 className="text-lg font-semibold">{doctor.name}</h4>
                    <p className="text-xl font-bold uppercase">
                      {doctor.department}
                    </p>
                    {doctor.experience && (
                      <p className="text-sm mt-1">
                        Experience: {doctor.experience}
                      </p>
                    )}
                    {doctor.consultationFee && (
                      <p className="text-sm font-medium mt-1">
                        Fee: ${doctor.consultationFee}
                      </p>
                    )}

                    {/* <div className="flex justify-center gap-4 mt-3">
                      {doctor.social.linkedin && (
                        <a
                          href={doctor.social.linkedin}
                          className="text-white p-2 bg-main rounded-full hover:bg-teal-700"
                        >
                          <FaLinkedinIn className="text-sm" />
                        </a>
                      )}
                      {doctor.social.facebook && (
                        <a
                          href={doctor.social.facebook}
                          className="text-white p-2 bg-main rounded-full hover:bg-teal-700"
                        >
                          <FaFacebookF className="text-sm" />
                        </a>
                      )}
                      {doctor.social.instagram && (
                        <a
                          href={doctor.social.instagram}
                          className="text-white p-2 bg-main rounded-full hover:bg-teal-700"
                        >
                          <FaInstagram className="text-sm" />
                        </a>
                      )}
                    </div> */}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDepartment(doctor.department);
                      console.log("selecting doctor id", doctor);
                      setSelectedDoctorId(doctor.id);
                      navigate("/user");
                    }}
                    className="bg-main text-white font-semibold text-lg py-3 w-full hover:bg-teal-700 transition-all"
                  >
                    Book Appointment{" "}
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-xl text-gray-600">
            No doctors available at the moment.
          </p>
        )}
      </div>
    </section>
  );
}
