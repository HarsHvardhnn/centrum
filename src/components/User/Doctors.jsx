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
    <section className="py-12 px-6 bg-white text-center">
      <h3 className=" text-xl font-bold text-neutral-800">TRUSTED CARE</h3>
      <h2 className="text-4xl font-bold text-main font-serif mt-2 mb-16">Our Doctors</h2>

      <Slider {...settings} className="max-w-6xl mx-auto">
        {doctorsData.map((doctor) => (
          <div key={doctor.id} className="px-4">
            <div className="bg-white rounded-lg overflow-hidden">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-full h-96 object-cover bg-black"
              />

              <div className="bg-main-light text-main py-6 px-6">
                <h4 className="text-lg">{doctor.name}</h4>
                <p className="text-xl font-bold uppercase">
                  {doctor.department}
                </p>

                <div className="flex justify-center gap-4 mt-3">
                  <a
                    href={doctor.social.linkedin}
                    className=" text-main-light p-1.5 bg-main rounded-full"
                  >
                    <FaLinkedinIn className="text-sm"/>
                  </a>
                  <a
                    href={doctor.social.facebook}
                    className=" text-main-light p-1.5 bg-main rounded-full"
                  >
                    <FaFacebookF className="text-sm"/>
                  </a>
                  <a
                    href={doctor.social.instagram}
                    className=" text-main-light p-1.5 bg-main rounded-full"
                  >
                    <FaInstagram className="text-sm"/>
                  </a>
                </div>
              </div>

              <button className="bg-main text-white font-semibold text-lg py-3 w-full">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
}
