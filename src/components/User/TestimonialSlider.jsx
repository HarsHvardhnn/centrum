import React from "react";
import Slider from "react-slick";
import { IoMdQuote } from "react-icons/io";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import testimonialsData from "../../utils/UserSideData/testimonialsData";

const TestimonialSlider = () => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };
  return (
    <div className="bg-[url('/images/testimonialsliderbg.jfif')] bg-cover bg-no-repeat bg-center relative mx-auto p-6 bg-teal-800 text-white rounded-lg">
      <div className="absolute inset-0 bg-main bg-opacity-70"></div>

      <Slider {...settings}>
        {testimonialsData.map((testimonial) => (
          <div key={testimonial.id} className="text-center p-6 h-80 ">
            <IoMdQuote className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-2xl max-w-2xl mx-auto">{testimonial.text}</p>
            <p className="text-2xl w-fit mx-auto mt-6 px-10 border-t border-white py-3">{testimonial.name}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TestimonialSlider;
