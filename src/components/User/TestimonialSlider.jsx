import React from "react";
import Slider from "react-slick";
import { IoMdQuote } from "react-icons/io";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import testimonialsData from "../../utils/UserSideData/testimonialsData";

const TestimonialSlider = () => {
  const settings = {
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    arrows: false,
  };
  return (
    <div className="bg-[url('/images/testimonials.jpg')] bg-cover bg-no-repeat bg-center relative mx-auto p-6 bg-teal-800 text-white rounded-lg">
      <div className="absolute inset-0 bg-main bg-opacity-70"></div>

      <Slider {...settings}>
        {testimonialsData.map((testimonial) => (
          <div key={testimonial.id} className="text-center p-6 h-60 md:h-80 ">
            <IoMdQuote className="text-4xl md:text-5xl mx-auto mb-2 md:mb-4 text-gray-300" />
            <p className="text-lg md:text-2xl max-w-md md:max-w-2xl mx-auto">
              {testimonial.text}
            </p>
            <p className="text-lg md:text-2xl w-fit mx-auto mt-4 md:mt-6 px-6 md:px-10 border-t border-white py-2 md:py-3">
              {testimonial.name}
            </p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TestimonialSlider;
