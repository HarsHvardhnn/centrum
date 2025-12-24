import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaCalendar, FaShieldAlt, FaCheck } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { Activity, Stethoscope, HeartPulse, GraduationCap, Briefcase, Star, ClipboardList, MessageCircle, FileText } from "lucide-react";
import phoneDialIcon from '../../../assets/phone_dial.png';

const MichalSzczubkowskiPage = () => {
  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "lek. Michał Szczubkowski",
    "jobTitle": "Chirurg, Proktolog",
    "worksFor": {
      "@type": "MedicalBusiness",
      "name": "Centrum Medyczne 7",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Skarżysko-Kamienna",
        "addressRegion": "świętokrzyskie",
        "addressCountry": "PL"
      },
      "telephone": "797-097-487",
      "url": "https://centrummedyczne7.pl"
    },
    "medicalSpecialty": ["Proctology", "General Surgery"],
    "url": "https://centrummedyczne7.pl/lekarze/michal-szczubkowski",
    "image": "https://centrummedyczne7.pl/assets/static-assets/doctor-image.png"
  };

  return (
    <>
      <MetaTags 
        title="lek. Michał Szczubkowski – Chirurg, Proktolog – Skarżysko-Kamienna – CM7"
        description="lek. Michał Szczubkowski – doświadczony chirurg i proktolog w Centrum Medycznym 7. Specjalizuje się w leczeniu chorób odbytu, hemoroidów i chirurgii ogólnej. Umów wizytę."
        path="/lekarze/michal-szczubkowski"
      />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      <main className="min-h-screen bg-white">
        {/* Hero Section - First Section */}
        <section className="bg-[#F7F9FA] pt-24 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8 xl:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 xl:gap-16">
              {/* Left Side - Text Content */}
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0">
                {/* Main Heading */}
                <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-4 sm:mb-6 px-4 md:px-0">
                  <span className="block text-gray-900">Lek. Michał</span>
                  <span className="block text-gray-900">Szczubkowski</span>
                </h1>

                {/* Specialization Tags */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 px-4 md:px-0">
                  <span className="inline-flex items-center bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm sm:text-base font-medium">
                    Chirurg ogólny
                  </span>
                  <span className="inline-flex items-center bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm sm:text-base font-medium">
                    Proktolog
                  </span>
                </div>

                {/* Description Text */}
                <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed mb-4 sm:mb-6 px-4 md:px-0">
                  Doświadczony Chirurg i Proktolog – konsultacje prywatne
                </p>

                {/* Location Text */}
                <div className="flex items-center gap-2 mb-6 sm:mb-8 px-4 md:px-0">
                  <IoLocationOutline className="text-teal-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-800 text-base sm:text-lg">
                    Przyjmuję pacjentów w Skarżysku-Kamiennej
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 px-4 md:px-0">
                  <button
                    onClick={() => window.location.href = '/#kontakt'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Umów wizytę
                  </button>
                  <button
                    onClick={() => window.location.href = 'tel:797097487'}
                    className="bg-white hover:bg-gray-50 text-teal-600 border-2 border-teal-600 font-semibold px-6 py-3 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <img src={phoneDialIcon} alt="Phone" className="w-5 h-5" />
                    Zadzwoń
                  </button>
                </div>

                {/* Google Rating */}
                <div className="flex items-center gap-2 sm:gap-3 px-4 md:px-0">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-base fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-900 font-medium text-base">
                    5.0 ocena w Google
                  </span>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <img
                    src="/assets/static-assets/doctor-image.png"
                    alt="lek. Michał Szczubkowski - Chirurg, Proktolog"
                    className="w-full h-auto object-contain rounded-t-2xl shadow-lg"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16" role="main">
          
          {/* Section 2: About the Doctor */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="about-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-left mb-6 sm:mb-8">
                <h2 
                  id="about-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  O lekarzu
                </h2>
              </div>

              {/* Content Paragraphs */}
              <div className="space-y-4 sm:space-y-6">
                {/* First Paragraph */}
                <p className="text-left text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                  Lek. <span className="font-semibold text-teal-700">Michał Szczubkowski</span> jest renomowanym lekarzem specjalistą w dziedzinie chirurgii ogólnej, związanym zawodowo z Oddziałem Chirurgii Szpitala Powiatowego im. Marii Skłodowskiej-Curie w Skarżysku-Kamiennej oraz z przychodnią Centrum Medyczne 7.
                </p>

                {/* Second Paragraph */}
                <p className="text-left text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                  Specjalizuje się w leczeniu przepuklin brzusznych i pachwinowych, chorób jelita grubego i odbytu, trudno gojących się ran oraz zespołu stopy cukrzycowej. W swojej praktyce stosuje nowoczesne metody diagnostyczne i terapeutyczne, realizując zarówno zabiegi planowe, jak i interwencje doraźne.
                </p>

                {/* Third Paragraph */}
                <p className="text-left text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                  W swojej pracy klinicznej kładzie szczególny nacisk na indywidualne podejście do każdego pacjenta, dokładną diagnostykę oraz transparentną komunikację. Pacjenci cenią go za profesjonalizm, empatię oraz umiejętność wyjaśnienia skomplikowanych zagadnień medycznych w zrozumiały sposób
                </p>

                {/* Fourth Paragraph */}
                <p className="text-left text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                  Oprócz praktyki klinicznej, lek. Michał Szczubkowski regularnie uczestniczy w konferencjach medycznych i szkoleniach, aby być na bieżąco z najnowszymi osiągnięciami w dziedzinie Chirurgii Ogólnej i Proktologii.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Location/Service Area */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="location-heading">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="location-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Gdzie przyjmuję pacjentów
                </h2>
              </div>

              {/* Light Green/Teal Box */}
              <div className="bg-primary-lightest rounded-lg p-6 md:p-8 lg:p-10">
                <div className="flex items-start gap-4 mb-4">
                  <IoLocationOutline className="text-teal-700 w-6 h-6 md:w-7 md:h-7 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-bold text-lg sm:text-xl md:text-2xl mb-2">
                      Centrum Medyczne 7
                    </h3>
                    <p className="text-gray-800 text-base sm:text-lg md:text-xl mb-1">
                      Powstańców Warszawy 7/1.5
                    </p>
                    <p className="text-gray-800 text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
                      26-110 Skarżysko-Kamienna
                    </p>
                    <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                      Przyjmuję pacjentów z licznych miejscowości, m.in. Kielce, Suchedniów, Szydłowiec, Starachowice, Jastrząb, Wierzbica, Mirów, Gąsawy, Radom, Stąporków.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Specializations */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="specializations-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-8 sm:mb-12">
                <h2 
                  id="specializations-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Specjalizacje
                </h2>
              </div>

              {/* Three Specialization Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {/* Card 1: Chirurgia ogólna */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="bg-teal-600 rounded-full p-4 mb-4">
                      <Activity className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                      Chirurgia ogólna
                    </h3>
                  </div>
                  <div className="space-y-3 mb-6">
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Kompleksowa diagnostyka i leczenie schorzeń wymagających interwencji chirurgicznej.
                    </p>
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Leczenie przepuklin, kamicy żółciowej, chorób tarczycy oraz innych schorzeń jamy brzusznej.
                    </p>
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Wykonuję zabiegi metodami klasycznymi oraz małoinwazyjnymi, dostosowując technikę do indywidualnych potrzeb pacjenta.
                    </p>
                  </div>
                  <a 
                    href="/proktolog"
                    className="text-teal-600 underline font-medium text-sm sm:text-base md:text-lg hover:text-teal-700"
                  >
                    Konsultacja chirurgiczna- szczegóły
                  </a>
                </div>

                {/* Card 2: Proktologia */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="bg-teal-600 rounded-full p-4 mb-4">
                      <Stethoscope className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                      Proktologia
                    </h3>
                  </div>
                  <div className="space-y-3 mb-6">
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Specjalistyczne leczenie chorób odbytu i odbytnicy w warunkach zapewniających pełną dyskrecję i komfort.
                    </p>
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Leczenie hemoroidów, szczelin odbytu, przetok, polipów oraz innych schorzeń obszaru anorektum.
                    </p>
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Stosuję nowoczesne metody diagnostyczne i terapeutyczne, w tym zabiegi małoinwazyjne.
                    </p>
                  </div>
                  <a 
                    href="/proktolog"
                    className="text-teal-600 underline font-medium text-sm sm:text-base md:text-lg hover:text-teal-700"
                  >
                    Konsultacja proktologiczna- szczegóły
                  </a>
                </div>

                {/* Card 3: Chirurgia naczyniowa */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="bg-teal-600 rounded-full p-4 mb-4">
                      <HeartPulse className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                      Chirurgia naczyniowa
                    </h3>
                  </div>
                  <div className="space-y-3 mb-6">
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Diagnostyka i leczenie chorób naczyń krwionośnych, w tym żylaków kończyn dolnych.
                    </p>
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Leczenie niewydolności żylnej, zakrzepicy, zmian miażdżycowych oraz innych schorzeń układu naczyniowego.
                    </p>
                    <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      Oferuję zarówno metody klasyczne, jak i nowoczesne techniki endowaskularne.
                    </p>
                  </div>
                  <a 
                    href="/proktolog"
                    className="text-teal-600 underline font-medium text-sm sm:text-base md:text-lg hover:text-teal-700"
                  >
                    Konsultacja chirurgiczna- szczegóły
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Price List */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="pricing-heading">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="pricing-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Cennik usług
                </h2>
              </div>

              {/* Disclaimer */}
              <p className="text-center text-gray-700 text-sm sm:text-base md:text-lg mb-8 sm:mb-12">
                Podane ceny mają charakter orientacyjny. Dokładny koszt leczenia ustalany jest po konsultacji w CM7 Skarżysko.
              </p>

              {/* Price Categories */}
              <div className="space-y-8 sm:space-y-12">
                {/* Category 1: Chirurgia ogólna */}
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Chirurgia ogólna
                  </h3>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja chirurgiczna</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">300 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Usunięcie chirurgiczne szwów</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 200 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Usunięcie znamienia/ tłuszczaka</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 400 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Leczenie chirurgiczne wzrastających paznokci</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 500 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Leczenie stopy cukrzycowej</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 500 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Implantacja wszywki alkoholowej (Disulfiram-Esperal)</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">2000 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Kwalifikacja do operacji chirurgicznej</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 300 zł</span>
                    </div>
                  </div>
                </div>

                {/* Category 2: Proktologia */}
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Proktologia
                  </h3>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja proktologiczna</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">300 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja proktologiczna z badaniem per rectum</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">350 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Zaopatrzenie drobnych ran i zmian okolicy odbytu</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 500 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Usunięcie polipa</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 500 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Operacja przetoki odbytu</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 3000 zł</span>
                    </div>
                  </div>
                </div>

                {/* Category 3: Inne */}
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Inne
                  </h3>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Poradnictwo żywieniowe w chorobach przewlekłych</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">300 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja przed terapia infuzyjną</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">od 400 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-teal-300 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja lekarska online</span>
                      <span className="text-gray-900 font-semibold text-base sm:text-lg md:text-xl ml-4">250 zł</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Experience and Qualifications */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="experience-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-8 sm:mb-12">
                <h2 
                  id="experience-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Doświadczenie i kwalifikacje
                </h2>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Education Section */}
                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="bg-teal-600 rounded-full p-2 flex-shrink-0">
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      Wykształcenie
                    </h3>
                  </div>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-12 bg-teal-600 flex-shrink-0 mt-1"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl font-semibold">
                          Uniwersytet Medyczny w Lublinie
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                          Wydział Lekarski
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-12 bg-teal-600 flex-shrink-0 mt-1"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl font-semibold">
                          Koloproktologia praktyczna
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                          Uniwersytet Jagielloński Collegium Medicum
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-8 bg-teal-600 flex-shrink-0 mt-1"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl font-semibold">
                          Specjalizacja z Chirurgii Ogólnej
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Experience Section */}
                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="bg-teal-600 rounded-full p-2 flex-shrink-0">
                      <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      Doświadczenie zawodowe
                    </h3>
                  </div>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-12 bg-teal-600 flex-shrink-0 mt-1"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl font-semibold">
                          Specjalista Chirurgii Ogólnej
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                          Szpital Powiatowy im. Marii Skłodowskiej-Curie w Skarżysku-Kamiennej
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-12 bg-teal-600 flex-shrink-0 mt-1"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl font-semibold">
                          Specjalista Chirurgii Ogólnej
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                          Szpital św. Leona w Opatowie
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-12 bg-teal-600 flex-shrink-0 mt-1"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl font-semibold">
                          Kształcenie Specjalizacyjne
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                          Uniwersytecki Szpital Kliniczny nr 4 w Lublinie
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses and Certificates Section */}
                <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="bg-teal-600 rounded-full p-2 flex-shrink-0">
                      <Star className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      Kursy i certyfikaty
                    </h3>
                  </div>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FaCheck className="text-teal-600 w-5 h-5 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl">
                          Szkolenie z terapii podciśnieniowej (VAC/NPWT) - leczenie ran przewlekłych, stopy cukrzycowej, odleżyn
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheck className="text-teal-600 w-5 h-5 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl">
                          Szkolenie z techniki T.I.M.E. - nowoczesne leczenie owrzodzeń i ran trudno gojących się
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheck className="text-teal-600 w-5 h-5 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl">
                          Kurs ultrasonografii jamy brzusznej - Roztoczańska Szkoła Ultrasonografii
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FaCheck className="text-teal-600 w-5 h-5 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-800 text-base sm:text-lg md:text-xl">
                          Szkolenie z żywienia dojelitowego i pozajelitowego oraz technik zakładania PEG/PEJ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: How Visit Proceeds */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="visit-process-heading">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 
                  id="visit-process-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Jak przebiega wizyta w CM7?
                </h2>
                <p className="text-gray-700 text-base sm:text-lg md:text-xl mt-4">
                  Każda wizyta jest przeprowadzana z dbałością o komfort i bezpieczeństwo pacjenta
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-8 sm:mt-12">
                {/* Step 1: Medical Interview */}
                <div className="flex flex-col items-center text-center">
                  <div className="bg-teal-600 rounded-full p-4 sm:p-5 mb-4">
                    <ClipboardList className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="w-12 h-0.5 bg-teal-600 mb-4"></div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    Wywiad medyczny
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Dokładne omówienie dolegliwości, historii choroby oraz dotychczasowego leczenia
                  </p>
                </div>

                {/* Step 2: Examination */}
                <div className="flex flex-col items-center text-center">
                  <div className="bg-teal-600 rounded-full p-4 sm:p-5 mb-4">
                    <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="w-12 h-0.5 bg-teal-600 mb-4"></div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    Badanie
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Szczegółowe badanie fizykalne oraz dodatkowe badania diagnostyczne w razie potrzeby
                  </p>
                </div>

                {/* Step 3: Diagnosis */}
                <div className="flex flex-col items-center text-center">
                  <div className="bg-teal-600 rounded-full p-4 sm:p-5 mb-4">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="w-12 h-0.5 bg-teal-600 mb-4"></div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    Rozpoznanie
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Jasne wyjaśnienie diagnozy oraz odpowiedzi na wszystkie pytania pacjenta
                  </p>
                </div>

                {/* Step 4: Treatment Plan */}
                <div className="flex flex-col items-center text-center">
                  <div className="bg-teal-600 rounded-full p-4 sm:p-5 mb-4">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="w-12 h-0.5 bg-teal-600 mb-4"></div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    Plan leczenia
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Ustalenie optymalnej metody leczenia dostosowanej do indywidualnych potrzeb
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Other Specialists */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="other-specialists-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-8 sm:mb-12">
                <h2 
                  id="other-specialists-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Inni specjaliści CM7
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Anna Grabowska Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 mb-4 rounded-lg overflow-hidden bg-primary-lightest flex items-center justify-center">
                        <img
                          src="https://res.cloudinary.com/dca740eqo/image/upload/v1756246783/hospital_app/images/fe0qqfuyacegrbhelktu.jpg"
                          alt="lek. Anna Grabowska - Neurolog dziecięcy"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = "/assets/static-assets/mikel_doctor.png";
                          }}
                        />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Lek. Anna Grabowska
                      </h3>
                      <p className="text-gray-700 text-base sm:text-lg md:text-xl mb-6">
                        Neurolog dziecięcy
                      </p>
                    </div>
                    <a
                      href="/lekarze/anna-grabowska"
                      className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg text-center text-base md:text-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Zobacz profil
                    </a>
                  </div>
                </div>

                {/* Michał Szczubkowski Card */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 mb-4 rounded-lg overflow-hidden bg-primary-lightest flex items-center justify-center">
                        <img
                          src="/assets/static-assets/doctor-image.png"
                          alt="lek. Michał Szczubkowski - Chirurg, Proktolog"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        Lek. Michał Szczubkowski
                      </h3>
                      <p className="text-gray-700 text-base sm:text-lg md:text-xl mb-6">
                        Chirurg, Proktolog
                      </p>
                    </div>
                    <a
                      href="/lekarze/michal-szczubkowski"
                      className="block w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg text-center text-base md:text-lg transition-colors shadow-md hover:shadow-lg"
                    >
                      Zobacz profil
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 9: Call to Action Banner */}
          <section className="bg-teal-600 py-12 sm:py-16 md:py-20 px-4 sm:px-6" aria-labelledby="cta-heading">
            <div className="max-w-4xl mx-auto text-center">
              <h2 
                id="cta-heading"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
              >
                <span className="block">Umów wizytę u doświadczonego</span>
                <span className="block">Chirurga, Proktologa w Skarżysku-Kamiennej</span>
              </h2>
              <p className="text-white text-base sm:text-lg md:text-xl mb-8 sm:mb-10">
                Profesjonalna opieka chirurgiczna i proktologiczna<br className="hidden sm:inline" /> na najwyższym poziomie
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
                <button
                  onClick={() => window.location.href = '/#kontakt'}
                  className="bg-white text-teal-600 font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
                >
                  Zarezerwuj termin
                </button>
                <button
                  onClick={() => window.location.href = 'tel:797097487'}
                  className="bg-teal-600 border-2 border-white text-white font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <img src={phoneDialIcon} alt="Phone" className="w-5 h-5" />
                  Zadzwoń
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
};

export default MichalSzczubkowskiPage;

