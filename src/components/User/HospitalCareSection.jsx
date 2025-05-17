import React from "react";
import { FaCircle } from "react-icons/fa";

const HospitalCareSection = () => {
  return (
    <div className="flex flex-col md:flex-row items-center max-w-5xl mx-auto p-6 mt-10">
      <div className="md:w-2/5">
        <img
          src="/images/a-doctor.jfif"
          alt="Lekarz"
          className="h-[470px] w-[400px] object-cover"
        />
      </div>

      <div className="md:w-3/5 md:pl-10 text-gray-800">
        <h4 className="font-semibold uppercase mb-2">
          WITAMY W CENTRUM MEDYCZNE 7
        </h4>
        <h2 className="text-main font-serif font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
           Profesjonalna Opieka Zdrowotna 
dla Ciebie i Twojej Rodziny
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:text-lg text-gray-700 mb-6">
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Indywidualne podejście do pacjenta
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Nowoczesna opieka medyczna
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Specjaliści z doświadczeniem
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Nowoczesne metody leczenia 
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Wiedza oparta na nauce i
            doświadczeniu
          </p>
          <p className="flex items-center gap-2">
            <FaCircle className="text-main text-[10px]" />
            Polecana klinika w Świętokrzyskim
          </p>
        </div>

        <p className="text-gray-600 leading-relaxed mb-1">
        Centrum Medyczne 7 to nowoczesna klinika i przychodnia, mieszcząca się w województwie świętokrzyskim, w
Skarżysku-Kamiennej.

        </p>
        <p  className="text-gray-600 leading-relaxed mb-1">
        Oferujemy kompleksową opiekę zdrowotną opartą na doświadczeniu, wiedzy i indywidualnym podejściu do każdego
        pacjenta
        </p>
        <p className="text-gray-600 leading-relaxed mb-1">
        W naszej klinice pracuje m.in. doświadczony specjalista z zakresu chirurgii i proktologi – lek. Michał Szczubkowski,
        znany i ceniony w mieście za profesjonalizm oraz skuteczność leczenia.
        </p>
        <p className="text-gray-600 leading-relaxed mb-1">
        Nasz zespół lekarzy świadczy fachowe konsultacje oraz zabiegi ambulatoryjne bez konieczności hospitalizacji.
        Zapewniamy bezpieczeństwo, skuteczność i wysoki standard opieki medycznej.
        </p>
        <p className="text-gray-600 leading-relaxed mb-1">
        Pacjenci doceniają nas za jakość obsługi, szybki dostęp do specjalistów oraz atmosferę opartą na zaufaniu. Centrum
        Medyczne 7 to sprawdzona klinika, której możesz powierzyć swoje zdrowie.
        </p>
        <p className="text-gray-600 leading-relaxed mb-1">
        Zadbaj o siebie – wybierz nowoczesną opiekę w Centrum Medyczne 7 w Skarżysku-Kamiennej.
        </p>
      </div>
    </div>
  );
};

export default HospitalCareSection;
