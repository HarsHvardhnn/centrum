import React from "react";
import { FaCircle } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HospitalCareSection = () => {
  // Settings for the slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    adaptiveHeight: true,
    fade: true,
  };

  // Array of images from about_us folder
  const images = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col md:flex-row items-start max-w-5xl mx-auto p-4 md:p-6 mt-4 md:mt-10">
      <div className="w-full md:w-2/5 md:mr-6 mb-6 md:mb-0">
        <div className="slider-container relative w-full h-[250px] md:h-[384px]">
          <Slider {...settings}>
            {images.map((num) => (
              <div key={num} className="slider-item">
                <img
                  src={`/images/about_us/${num}.jpg`}
                  alt={`Centrum Medyczne ${num}`}
                  className="w-full h-[250px] md:h-96 object-cover rounded-sm shadow-md"
                />
              </div>
            ))}
          </Slider>
        </div>

        <style jsx>{`
          .slick-dots {
            bottom: 10px;
          }
          .slick-dots li button:before {
            color: white;
            opacity: 0.8;
          }
          .slick-dots li.slick-active button:before {
            color: white;
            opacity: 1;
          }
          .slick-prev,
          .slick-next {
            z-index: 1;
          }
          .slick-prev {
            left: 10px;
          }
          .slick-next {
            right: 10px;
          }
          .slick-slider {
            height: 100%;
          }
          .slick-list, .slick-track {
            height: 100%;
          }
        `}</style>
      </div>

      <div className="md:w-3/5 md:pl-4 text-gray-800">
        <h2 className="text-main font-serif font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
          Profesjonalna Opieka Zdrowotna dla Ciebie i Twojej Rodziny
        </h2>

        <div className="grid grid-cols-2 gap-y-4 gap-x-6 mt-8 mb-8">
          <div className="flex items-start gap-2">
            <FaCircle className="text-teal-600 text-xs mt-1.5" />
            <p className="text-gray-700">Indywidualne podejście do pacjenta</p>
          </div>
          <div className="flex items-start gap-2">
            <FaCircle className="text-teal-600 text-xs mt-1.5" />
            <p className="text-gray-700">Nowoczesna opieka medyczna</p>
          </div>
          <div className="flex items-start gap-2">
            <FaCircle className="text-teal-600 text-xs mt-1.5" />
            <p className="text-gray-700">Specjaliści z doświadczeniem</p>
          </div>
          <div className="flex items-start gap-2">
            <FaCircle className="text-teal-600 text-xs mt-1.5" />
            <p className="text-gray-700">Nowoczesne metody leczenia</p>
          </div>
          <div className="flex items-start gap-2">
            <FaCircle className="text-teal-600 text-xs mt-1.5" />
            <p className="text-gray-700">
              Wiedza oparta na nauce i doświadczeniu
            </p>
          </div>
          <div className="flex items-start gap-2">
            <FaCircle className="text-teal-600 text-xs mt-1.5" />
            <p className="text-gray-700">Polecana klinika w Świętokrzyskim</p>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed mb-3">
          Centrum Medyczne 7 to nowoczesna klinika i przychodnia, mieszcząca się
          w województwie świętokrzyskim, w Skarżysku-Kamiennej.
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          Oferujemy kompleksową opiekę zdrowotną opartą na doświadczeniu, wiedzy
          i indywidualnym podejściu do każdego pacjenta.
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          W naszej klinice pracuje m.in. doświadczony specjalista z zakresu
          chirurgii i proktologii – lek. Michał Szczubkowski, znany i ceniony w
          mieście za profesjonalizm oraz skuteczność leczenia.
        </p>
        <p className="text-gray-600 leading-relaxed mb-3">
          Zadbaj o siebie – wybierz nowoczesną opiekę w Centrum Medyczne 7 w
          Skarżysku-Kamiennej.
        </p>
      </div>
    </div>
  );
};

export default HospitalCareSection;
