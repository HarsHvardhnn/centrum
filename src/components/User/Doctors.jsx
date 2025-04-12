import React from "react";
import Slider from "react-slick";
import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import doctorsData from "../../utils/UserSideData/doctorsData";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Doctors() {
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

  return (
    <section className="py-16 px-6 bg-white text-center">
      <h3 className="md:text-xl font-bold text-neutral-800">TRUSTED CARE</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mt-2 mb-8 sm:mb-12">
        Our Doctors
      </h2>

      <div className="max-w-sm md:max-w-6xl mx-auto overflow-clip">
        <Slider {...settings}>
          {doctorsData.map((doctor) => (
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

                  <div className="flex justify-center gap-4 mt-3">
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
                  </div>
                </div>

                <button className="bg-main text-white font-semibold text-lg py-3 w-full hover:bg-teal-700 transition-all">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
