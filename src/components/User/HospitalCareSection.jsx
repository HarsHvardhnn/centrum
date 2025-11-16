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

  // Array of images from Cloudinary
  const images = [
    {
      "url": "https://res.cloudinary.com/dca740eqo/image/upload/v1752646765/hospital_app/images/o4dcquip1vytxyeq2p5a.jpg",
      "public_id": "hospital_app/images/o4dcquip1vytxyeq2p5a",
      "originalName": "1_about us.jpg",
      "mimetype": "image/jpeg",
      "size": 15411,
      "uploadDate": "2025-07-16T06:19:30.990Z",
      "secure_url": "https://res.cloudinary.com/dca740eqo/image/upload/v1752646765/hospital_app/images/o4dcquip1vytxyeq2p5a.jpg"
    },
    {
      "url": "https://res.cloudinary.com/dca740eqo/image/upload/v1752646767/hospital_app/images/b2livnveykm8aophmq7p.jpg",
      "public_id": "hospital_app/images/b2livnveykm8aophmq7p",
      "originalName": "2_about us.jpg",
      "mimetype": "image/jpeg",
      "size": 22796,
      "uploadDate": "2025-07-16T06:19:30.990Z",
      "secure_url": "https://res.cloudinary.com/dca740eqo/image/upload/v1752646767/hospital_app/images/b2livnveykm8aophmq7p.jpg"
    },
    {
      "url": "https://res.cloudinary.com/dca740eqo/image/upload/v1752646767/hospital_app/images/ojw0xfou8jfgasachjxo.jpg",
      "public_id": "hospital_app/images/ojw0xfou8jfgasachjxo",
      "originalName": "3_about us.jpg",
      "mimetype": "image/jpeg",
      "size": 23547,
      "uploadDate": "2025-07-16T06:19:30.990Z",
      "secure_url": "https://res.cloudinary.com/dca740eqo/image/upload/v1752646767/hospital_app/images/ojw0xfou8jfgasachjxo.jpg"
    },
    {
      "url": "https://res.cloudinary.com/dca740eqo/image/upload/v1752646768/hospital_app/images/odfdmt6qwy97ismuos9n.jpg",
      "public_id": "hospital_app/images/odfdmt6qwy97ismuos9n",
      "originalName": "4_about us.jpg",
      "mimetype": "image/jpeg",
      "size": 20493,
      "uploadDate": "2025-07-16T06:19:30.990Z",
      "secure_url": "https://res.cloudinary.com/dca740eqo/image/upload/v1752646768/hospital_app/images/odfdmt6qwy97ismuos9n.jpg"
    }
  ];

  return (
    <div className="flex flex-col md:flex-row items-start max-w-5xl mx-auto p-4 md:p-6 mt-4 md:mt-10">
      <div className="w-full md:w-2/5 md:mr-6 mb-6 md:mb-0">
        <div className="slider-container relative w-full h-[250px] md:h-[384px]">
          <Slider {...settings}>
            {images.map((image, index) => (
              <div key={index} className="slider-item">
                <img
                  src={image.secure_url}
                  alt={`Centrum Medyczne ${image.originalName}`}
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
        <h1 className="text-main font-serif font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
          Zespół lekarzy z{'\u00A0'}doświadczeniem klinicznym w{'\u00A0'}Skarżysku-Kamiennej
        </h1>

        <div className="grid grid-cols-2 gap-y-4 gap-x-14 mt-8 mb-8">
          <div className="flex items-start gap-2 min-h-[48px]">
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-1.5"></div>
            <p className="text-gray-700">Lekarze z{'\u00A0'}doświadczeniem klinicznym</p>
          </div>
          <div className="flex items-start gap-2 min-h-[48px]">
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-1.5"></div>
            <p className="text-gray-700">Indywidualne podejście i{'\u00A0'}troska o{'\u00A0'}pacjenta</p>
          </div>
          <div className="flex items-start gap-2 min-h-[48px]">
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-1.5"></div>
            <p className="text-gray-700">Opieka zgodna z{'\u00A0'}aktualnymi wytycznymi medycznymi</p>
          </div>
          <div className="flex items-start gap-2 min-h-[48px]">
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-1.5"></div>
            <p className="text-gray-700">Komfortowe warunki wizyt i{'\u00A0'}jasna komunikacja</p>
          </div>
          <div className="flex items-start gap-2 min-h-[48px]">
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-1.5"></div>
            <p className="text-gray-700">Nowoczesne metody diagnostyki i{'\u00A0'}leczenia</p>
          </div>
          <div className="flex items-start gap-2 min-h-[48px]">
            <div className="w-2 h-2 bg-teal-600 rounded-full mt-1.5"></div>
            <p className="text-gray-700">Wysokie zaufanie pacjentów i{'\u00A0'}najwyższe oceny w{'\u00A0'}opiniach online</p>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed mb-3">
          Centrum Medyczne 7 to placówka prowadzona przez lekarzy z{'\u00A0'}doświadczeniem klinicznym,
          powstała z{'\u00A0'}myślą o{'\u00A0'}pacjentach z{'\u00A0'}województwa świętokrzyskiego, mazowieckiego i{'\u00A0'}okolic.
          Zapewniamy rzetelną diagnostykę, wysokie standardy leczenia i{'\u00A0'}indywidualną opiekę w{'\u00A0'}
          oparciu o{'\u00A0'}aktualną wiedzę medyczną.
        </p>

        <p className="text-gray-600 leading-relaxed mb-3">
          Nasza przychodnia powstała z{'\u00A0'}pasji do leczenia i{'\u00A0'}potrzeby stworzenia miejsca, w{'\u00A0'}którym
          pacjent jest wysłuchany, traktowany z{'\u00A0'}szacunkiem i{'\u00A0'}ma czas na spokojną konsultację ze
          specjalistą. Jako lekarze wiemy, jak ważne jest poczucie bezpieczeństwa i{'\u00A0'}możliwość
          szybkiego uzyskania pomocy — dlatego jeśli ktoś pilnie potrzebuje wizyty, zawsze staramy się
          znaleźć dla niego termin.
        </p>

        <p className="text-gray-600 leading-relaxed mb-3">
          Do CM7 trafiają pacjenci zarówno ze Skarżyska-Kamiennej, jak i{'\u00A0'}z{'\u00A0'}pobliskich miejscowości,
          w{'\u00A0'}tym z{'\u00A0'}Kielc, Radomia, Szydłowca, Starachowic i{'\u00A0'}Końskich. Wybierają nas, bo szukają opieki
          prowadzonej przez lekarzy, którym zależy nie tylko na skutecznym leczeniu, ale także na
          spokojnej rozmowie, jasnym wyjaśnieniu zaleceń i{'\u00A0'}partnerskim podejściu.
        </p>

        <p className="text-gray-600 leading-relaxed mb-3">
          Każdego dnia pracujemy tak, jak sami chcielibyśmy być leczeni — mądrze, uczciwie i{'\u00A0'}z
          empatią. To podejście widać również w{'\u00A0'}opiniach naszych pacjentów: wspierają nas, polecają
          dalej i{'\u00A0'}z{'\u00A0'}wdzięcznością dzielą się doświadczeniami w{'\u00A0'}Google. Zaufanie, jakim nas obdarzają,
          traktujemy jako największe wyróżnienie i{'\u00A0'}motywację do dalszej pracy.
        </p>
      </div>
    </div>
  );
};

export default HospitalCareSection;
