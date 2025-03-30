import React from "react";
import Slider from "react-slick";
import testimonialsData from "../../utils/UserSideData/testimonialsData";
import { FaStar } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaRegUserCircle } from "react-icons/fa";

export default function Testimonial() {
  const settings = {
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    arrows: false
  };

  return (
    <section className="bg-[#e3f3f3] py-28 px-6 flex justify-center">
      <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-8">
        <div className="w-full md:w-1/2 text-left">
          <h3 className="text-[54px] font-bold text-gray-900 leading-normal">
            What <span className="text-teal-600">Our Patients<br/></span> Say About
            Us
          </h3>
          <p className="text-neutral-700 mt-4 text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sem velit
            viverra amet faucibus.
          </p>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex -space-x-2">
              <FaRegUserCircle className="text-5xl rounded-full bg-teal-100"/>
              <FaRegUserCircle className="text-5xl rounded-full bg-teal-100"/>
              <FaRegUserCircle className="text-5xl rounded-full bg-teal-100"/>
              <FaRegUserCircle className="text-5xl rounded-full bg-teal-100"/>
              <FaRegUserCircle className="text-5xl rounded-full bg-teal-100"/>
              <FaRegUserCircle className="text-5xl rounded-full bg-teal-100"/>
              <FaRegUserCircle className="text-5xl rounded-full bg-teal-100"/>
            </div>
            <p className="text-neutral-900 text-lg font-bold">100+ Reviews</p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <Slider {...settings}>
            {testimonialsData.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white shadow-lg rounded-2xl p-12 h-80 border border-neutral-400"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FaRegUserCircle className="text-5xl"/>
                    <div>
                      <h4 className="font-semibold text-lg text-neutral-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-neutral-600 text-sm">
                        {testimonial.date}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex mt-2 text-yellow-500">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <FaStar className="text-3xl" key={i} />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-neutral-900 text-xl mt-10">{testimonial.text}</p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
