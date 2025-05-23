import React from "react";
import Slider from "react-slick";
import testimonialsData from "../../utils/UserSideData/testimonialsData";
import { FaStar, FaRegUserCircle } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Testimonial() {
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
    <section className="bg-[#e3f3f3] py-20 px-6 flex justify-center">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 text-center md:text-left">
          <h3 className="text-4xl md:text-[54px] font-bold text-gray-900 leading-tight">
            Co Mówią o Nas
          </h3>
          <span className="text-teal-600 text-4xl font-semibold block mb-2">Nasi Pacjenci</span>
          <p className="text-neutral-700 mt-4 text-lg">
            Zdrowie i zadowolenie pacjentów są dla nas najważniejsze.
          </p>

          <div className="flex flex-col items-center md:items-start gap-1 mt-6">
            <div className="flex -space-x-2 mb-1">
              {Array(7)
                .fill()
                .map((_, i) => (
                  <FaRegUserCircle
                    key={i}
                    className="text-4xl md:text-5xl rounded-full bg-teal-100"
                  />
                ))}
            </div>
            <span className="text-neutral-900 text-2xl font-bold">150+ Opinii</span>
            <a 
              href="https://www.google.com/maps/place/lek.+Michał+Szczubkowski+%7C+Chirurg+%7C+Proktolog+%7C+Leczenie+ran+przewlekłych/@51.1263237,20.876852,17z/data=!4m8!3m7!1s0x4718391f2a385e57:0x40e9db5b8218c35b!8m2!3d51.1263237!4d20.876852!9m1!1b1!16s%2Fg%2F11rcwlzvlw?entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-300 mt-2"
            >
              Sprawdź opinie

            </a>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <Slider {...settings}>
            {testimonialsData.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white shadow-lg rounded-2xl p-8 md:p-12 h-auto border border-neutral-400"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FaRegUserCircle className="text-5xl" />
                    <div>
                      <h4 className="font-semibold text-lg text-neutral-900">
                        {testimonial.name}
                      </h4>
                      <p className="text-neutral-600 text-sm">
                        {testimonial.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex mt-2 text-yellow-500">
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <FaStar className="text-2xl md:text-3xl" key={i} />
                    ))}
                  </div>
                </div>

                <p className="text-neutral-900 text-lg md:text-xl mt-6 md:mt-10">
                  {testimonial.text}
                </p>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
