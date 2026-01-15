import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaCalendar, FaShieldAlt, FaCheck, FaPhone, FaGraduationCap, FaBriefcase } from "react-icons/fa";
import { IoLocationOutline, IoLocation } from "react-icons/io5";
import { Activity, Stethoscope, HeartPulse, GraduationCap, Briefcase, Star, ClipboardList, MessageCircle, FileText } from "lucide-react";
import starIcon from '../../../assets/star.png';

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
        title="Lek. Michał Szczubkowski – chirurg, proktolog | Centrum Medyczne 7"
        description="Lek. Michał Szczubkowski – chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Leczenie chorób odbytu i schorzeń chirurgicznych."
        path="/lekarze/michal-szczubkowski"
        robots="index, follow"
        ogType="profile"
        ogTitle="Lek. Michał Szczubkowski – chirurg i proktolog | CM7"
        ogDescription="Chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej. Doświadczenie i indywidualne podejście."
        twitterTitle="Lek. Michał Szczubkowski – chirurg, proktolog | CM7"
        twitterDescription="Chirurg i proktolog przyjmujący pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej."
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
              {/* Mobile: Image First, Desktop: Text First */}
              {/* Image - Shown first on mobile, second on desktop */}
              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center order-1 lg:order-2 mb-6 lg:mb-0">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <img
                    src="/assets/static-assets/doctor-image.png"
                    alt="lek. Michał Szczubkowski - Chirurg, Proktolog"
                    className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] md:w-auto md:h-auto lg:w-full lg:h-auto object-cover rounded-full lg:rounded-t-lg lg:rounded-b-none shadow-lg mx-auto lg:mx-0 border-4 border-teal-100 lg:border-0"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Text Content - Shown second on mobile, first on desktop */}
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0 order-2 lg:order-1">
                {/* Main Heading */}
                <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-4 sm:mb-6 px-4 md:px-0 text-center lg:text-left">
                  <span className="block text-gray-900">Lek. Michał</span>
                  <span className="block text-gray-900">Szczubkowski</span>
                </h1>

                {/* Specialization Tags */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6 px-4 md:px-0 justify-center lg:justify-start">
                  <span className="inline-flex items-center bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm sm:text-base font-medium">
                    Chirurg ogólny
                  </span>
                  <span className="inline-flex items-center bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm sm:text-base font-medium">
                    Proktolog
                  </span>
                </div>

                {/* Description Text */}
                <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed mb-4 sm:mb-6 px-4 md:px-0 text-center lg:text-left">
                  Doświadczony Chirurg i Proktolog – konsultacje prywatne
                </p>

                {/* Location Text */}
                <div className="flex items-center gap-2 mb-6 sm:mb-8 px-4 md:px-0 justify-center lg:justify-start">
                  <IoLocation className="text-teal-600 w-5 h-5 flex-shrink-0" />
                  <span className="text-gray-800 text-base sm:text-lg">
                    Przyjmuję pacjentów w Skarżysku-Kamiennej
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 px-4 md:px-0 justify-center lg:justify-start">
                  <button
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    Umów wizytę
                  </button>
                  <button
                    onClick={() => window.location.href = 'tel:+48797097487'}
                    className="bg-white hover:bg-gray-50 text-teal-600 border-2 border-teal-600 font-semibold px-6 py-3 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaPhone className="text-teal-600 w-5 h-5 scale-x-[-1]" />
                    Zadzwoń
                  </button>
                </div>

                {/* Google Rating */}
                <a 
                  href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skarżysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dziecięcy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 sm:gap-3 px-4 md:px-0 justify-center lg:justify-start"
                >
                  {/* Google Logo */}
                  <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#14B8A6"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#14B8A6"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#14B8A6"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#14B8A6"/>
                    </svg>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-base fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-teal-600 font-medium text-base">
                    Zobacz opinie w Google
                  </span>
                </a>

                {/* ZnanyLekarz Rating */}
                <a 
                  href="https://www.znanylekarz.pl/michal-szczubkowski-2/chirurg-proktolog/skarzysko-kamienna#profile-reviews"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 sm:gap-2 px-4 md:px-0 justify-center lg:justify-start mt-2 opacity-80 hover:opacity-100 transition-opacity"
                >
                  {/* ZnanyLekarz Logo - using star.png */}
                  <div className="flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4">
                    <img src={starIcon} alt="ZnanyLekarz" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-xs sm:text-sm fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-teal-600 font-medium text-sm sm:text-base">
                    Zobacz opinie w ZnanyLekarz
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12" role="main">
          
          {/* Section 2: About the Doctor */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="about-heading">
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
                  Lek. <span className="font-semibold text-teal-700">Michał Szczubkowski</span> jest renomowanym lekarzem specjalistą&nbsp;w dziedzinie chirurgii ogólnej, związanym zawodowo z Oddziałem Chirurgii Szpitala Powiatowego im. Marii Skłodowskiej-Curie&nbsp;w Skarżysku-Kamiennej.
                </p>

                <p className="text-left text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                  Specjalizuje się&nbsp;w leczeniu przepuklin brzusznych&nbsp;i pachwinowych, chorób jelita grubego&nbsp;i odbytu, trudno gojących się ran oraz zespołu stopy cukrzycowej. W swojej praktyce stosuje nowoczesne metody diagnostyczne&nbsp;i terapeutyczne, realizując zarówno zabiegi planowe, jak&nbsp;i interwencje doraźne.
                </p>

                <p className="text-left text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                  W swojej pracy klinicznej kładzie szczególny nacisk na indywidualne podejście do każdego pacjenta, dokładną diagnostykę oraz transparentną komunikację. Pacjenci cenią go za profesjonalizm, empatię oraz umiejętność wyjaśnienia skomplikowanych zagadnień medycznych&nbsp;w zrozumiały sposób
                </p>

                <p className="text-left text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed">
                  Oprócz praktyki klinicznej, lek. Michał Szczubkowski regularnie uczestniczy&nbsp;w konferencjach medycznych&nbsp;i szkoleniach, aby być na bieżąco z najnowszymi osiągnięciami&nbsp;w dziedzinie Chirurgii Ogólnej&nbsp;i Proktologii.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Location/Service Area */}
          <section className="bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="location-heading">
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
              <div className="bg-primary-lightest rounded-lg p-6 md:p-8 lg:p-10 mb-4 sm:mb-6">
                <div className="flex items-start gap-4">
                  <IoLocationOutline className="text-teal-700 w-6 h-6 md:w-7 md:h-7 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-bold text-lg sm:text-xl md:text-2xl mb-2">
                      Centrum Medyczne 7
                    </h3>
                    <p className="text-gray-800 text-base sm:text-lg md:text-xl mb-1">
                      Powstańców Warszawy 7/1.5
                    </p>
                    <p className="text-gray-800 text-base sm:text-lg md:text-xl">
                      26-110 Skarżysko-Kamienna
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Area Text - Outside the box */}
              <p className="text-gray-800 text-base sm:text-lg md:text-xl leading-relaxed text-left">
                Przyjmuję pacjentów z licznych miejscowości, m.in. Kielce, Suchedniów, Szydłowiec, Starachowice, Jastrząb, Wierzbica, Mirów, Gąsawy, Radom, Stąporków.
              </p>
            </div>
          </section>

          {/* Section 4: Specializations */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="specializations-heading">
            <div className="max-w-7xl mx-auto pl-4 sm:pl-6 md:pl-8 lg:pl-10 xl:pl-12 2xl:pl-16 pr-4 sm:pr-6 md:pr-12 lg:pr-16 xl:pr-20 2xl:pr-24">
              <div className="text-left mb-8 sm:mb-12">
                <h2 
                  id="specializations-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Specjalizacje
                </h2>
              </div>

              {/* Three Specialization Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
                {/* Card 1: Chirurgia ogólna */}
                <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-md w-full">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="bg-teal-600 rounded-full p-4 flex-shrink-0">
                      <Activity className="w-10 h-10 text-white" />
                    </div>
                    <div className="w-full">
                      <a 
                        href="/proktolog"
                        className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-4 hover:text-teal-600 transition-colors block text-left"
                      >
                        Chirurgia ogólna
                      </a>
                    </div>
                  </div>
                  <div className="mb-6 space-y-3">
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Kompleksowa diagnostyka i leczenie schorzeń wymagających interwencji chirurgicznej.
                    </p>
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Leczenie przepuklin, kamicy żółciowej, chorób tarczycy oraz innych schorzeń jamy brzusznej.
                    </p>
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Wykonuję zabiegi metodami klasycznymi oraz małoinwazyjnymi, dostosowując technikę do indywidualnych potrzeb pacjenta.
                    </p>
                  </div>
                  <div className="text-left">
                    <a 
                      href="/proktolog"
                      className="text-teal-600 underline font-medium text-xs sm:text-sm md:text-base hover:text-teal-700 whitespace-nowrap"
                    >
                      Konsultacja chirurgiczna- szczegóły
                    </a>
                  </div>
                </div>

                {/* Card 2: Proktologia */}
                <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-md w-full">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="bg-teal-600 rounded-full p-4 flex-shrink-0">
                      <Stethoscope className="w-10 h-10 text-white" />
                    </div>
                    <div className="w-full">
                      <a 
                        href="/proktolog"
                        className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-4 hover:text-teal-600 transition-colors block text-left"
                      >
                        Proktologia
                      </a>
                    </div>
                  </div>
                  <div className="mb-6 space-y-3">
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Specjalistyczne leczenie chorób <span className="whitespace-nowrap">odbytu i</span> <span className="whitespace-nowrap">odbytnicy w</span> warunkach zapewniających pełną <span className="whitespace-nowrap">dyskrecję i</span> komfort.
                    </p>
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Leczenie hemoroidów, szczelin odbytu, przetok, polipów oraz innych schorzeń obszaru anorektum.
                    </p>
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Stosuję nowoczesne metody <span className="whitespace-nowrap">diagnostyczne i</span> <span className="whitespace-nowrap">terapeutyczne, w</span> tym zabiegi małoinwazyjne.
                    </p>
                  </div>
                  <div className="text-left">
                    <a 
                      href="/uslugi/konsultacja-proktologiczna"
                      className="text-teal-600 underline font-medium text-xs sm:text-sm md:text-base hover:text-teal-700 whitespace-nowrap"
                    >
                      Konsultacja proktologiczna- szczegóły
                    </a>
                  </div>
                </div>

                {/* Card 3: Chirurgia naczyniowa */}
                <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-md w-full">
                  <div className="flex flex-col items-start gap-4 mb-4">
                    <div className="bg-teal-600 rounded-full p-4 flex-shrink-0">
                      <HeartPulse className="w-10 h-10 text-white" />
                    </div>
                    <div className="w-full">
                      <a 
                        href="/proktolog"
                        className="text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-4 hover:text-teal-600 transition-colors block text-left"
                      >
                        Chirurgia naczyniowa
                      </a>
                    </div>
                  </div>
                  <div className="mb-6 space-y-3">
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Diagnostyka i leczenie chorób naczyń krwionośnych, w tym żylaków kończyn dolnych.
                    </p>
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Leczenie niewydolności żylnej, zakrzepicy, zmian miażdżycowych oraz innych schorzeń układu naczyniowego.
                    </p>
                    <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                      Oferuję zarówno metody klasyczne, jak i nowoczesne techniki endowaskularne.
                    </p>
                  </div>
                  <div className="text-left">
                    <a 
                      href="/proktolog"
                      className="text-teal-600 underline font-medium text-xs sm:text-sm md:text-base hover:text-teal-700 whitespace-nowrap"
                    >
                      Konsultacja chirurgiczna- szczegóły
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Price List */}
          <section className="bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="pricing-heading">
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
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja chirurgiczna</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">350 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Usunięcie chirurgiczne szwów</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 200 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <a href="/uslugi/usuwanie-zmian-skornych-z-badaniem-histopatologicznym" className="text-gray-800 text-base sm:text-lg md:text-xl flex-1 hover:text-teal-600 transition-colors cursor-pointer">Usunięcie znamienia/ tłuszczaka</a>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 400 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Leczenie chirurgiczne wzrastających paznokci</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 500 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Leczenie stopy cukrzycowej</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 500 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <a href="/uslugi/implantacja-wszywki-alkoholowej" className="text-gray-800 text-base sm:text-lg md:text-xl flex-1 hover:text-teal-600 transition-colors cursor-pointer">Implantacja wszywki alkoholowej (Disulfiram-Esperal)</a>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">2000 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Kwalifikacja do operacji chirurgicznej</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 300 zł</span>
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
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <a href="/uslugi/konsultacja-proktologiczna" className="text-gray-800 text-base sm:text-lg md:text-xl flex-1 hover:text-teal-600 transition-colors cursor-pointer">Konsultacja proktologiczna</a>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">300 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja proktologiczna z badaniem per rectum</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">350 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Zaopatrzenie drobnych ran i zmian okolicy odbytu</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 500 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Usunięcie polipa</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 500 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Operacja przetoki odbytu</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 3000 zł</span>
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
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Poradnictwo żywieniowe w chorobach przewlekłych</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">300 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja przed terapia infuzyjną</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">od 400 zł</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl flex-1">Konsultacja lekarska online</span>
                      <span className="text-teal-600 font-semibold text-base sm:text-lg md:text-xl ml-4">250 zł</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Experience and Qualifications */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="experience-heading">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-left mb-8 sm:mb-12">
                <h2 
                  id="experience-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Doświadczenie i kwalifikacje
                </h2>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Education Section */}
                <div className="md:bg-white md:rounded-lg md:shadow-md p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <FaGraduationCap className="w-6 h-6 md:w-7 md:h-7 text-teal-600 flex-shrink-0" />
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      Wykształcenie
                    </h3>
                  </div>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-0.5 md:w-1 h-auto bg-teal-600 flex-shrink-0 self-stretch min-h-[20px] md:min-h-[48px]"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
                          Uniwersytet Medyczny w Lublinie
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg mt-1">
                          Wydział Lekarski
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-0.5 md:w-1 h-auto bg-teal-600 flex-shrink-0 self-stretch min-h-[20px] md:min-h-[48px]"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
                          Koloproktologia praktyczna
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg mt-1">
                          Uniwersytet Jagielloński Collegium Medicum
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-0.5 md:w-1 h-auto bg-teal-600 flex-shrink-0 self-stretch min-h-[20px] md:min-h-[48px]"></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl font-semibold">
                          Specjalizacja z Chirurgii Ogólnej
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Experience Section */}
                <div className="md:bg-white md:rounded-lg md:shadow-md p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <FaBriefcase className="w-6 h-6 md:w-7 md:h-7 text-teal-600 flex-shrink-0" />
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      Doświadczenie zawodowe
                    </h3>
                  </div>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-4 md:space-y-6">
                    {/* Entry 1: Specjalista Chirurgii Ogólnej - Szpital Powiatowy */}
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-0.5 md:w-1 bg-teal-600 flex-shrink-0" style={{ minHeight: '100%', alignSelf: 'stretch' }}></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1">
                          Specjalista Chirurgii Ogólnej
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                          Szpital Powiatowy im. Marii Skłodowskiej-Curie w Skarżysku-Kamiennej
                        </p>
                      </div>
                    </div>
                    
                    {/* Entry 2: Specjalista Chirurgii Ogólnej - Szpital św. Leona */}
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-0.5 md:w-1 bg-teal-600 flex-shrink-0" style={{ minHeight: '100%', alignSelf: 'stretch' }}></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1">
                          Specjalista Chirurgii Ogólnej
                        </p>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                          Szpital św. Leona w Opatowie
                        </p>
                      </div>
                    </div>
                    
                    {/* Entry 3: Kształcenie Specjalizacyjne */}
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-0.5 md:w-1 bg-teal-600 flex-shrink-0" style={{ minHeight: '100%', alignSelf: 'stretch' }}></div>
                      <div className="flex-1">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1">
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
                <div className="md:bg-white md:rounded-lg md:shadow-md p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <FaStar className="w-6 h-6 md:w-7 md:h-7 text-teal-600 flex-shrink-0" />
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      Kursy i certyfikaty
                    </h3>
                  </div>
                  <div className="w-full h-0.5 bg-teal-600 mb-4 sm:mb-6"></div>
                  
                  <div className="space-y-2 md:space-y-4">
                    <div className="flex items-start gap-2 md:gap-3">
                      <FaCheck className="text-teal-600 w-4 h-4 md:w-5 md:h-5 mt-0.5 md:mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl md:whitespace-nowrap">
                          Szkolenie z terapii podciśnieniowej (VAC/NPWT) - leczenie ran przewlekłych, stopy cukrzycowej, odleżyn
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <FaCheck className="text-teal-600 w-4 h-4 md:w-5 md:h-5 mt-0.5 md:mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl md:whitespace-nowrap">
                          Szkolenie z techniki T.I.M.E. - nowoczesne leczenie owrzodzeń i ran trudno gojących się
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <FaCheck className="text-teal-600 w-4 h-4 md:w-5 md:h-5 mt-0.5 md:mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl md:whitespace-nowrap">
                          Kurs ultrasonografii jamy brzusznej - Roztoczańska Szkoła Ultrasonografii
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <FaCheck className="text-teal-600 w-4 h-4 md:w-5 md:h-5 mt-0.5 md:mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl md:whitespace-nowrap">
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
          <section className="bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="visit-process-heading">
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

              <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-8 sm:mt-12">
                {/* Step 1: Medical Interview */}
                <div className="flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center">
                  {/* Mobile: Numbered circle on left, Desktop: Icon centered */}
                  <div className="bg-teal-100 md:bg-teal-600 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 md:mb-4">
                    <span className="text-teal-600 md:text-white text-xl md:hidden font-bold">1</span>
                    <ClipboardList className="hidden md:block w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 md:flex-none md:w-full">
                    <div className="hidden md:block w-12 h-0.5 bg-teal-600 mb-4 mx-auto"></div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 text-left md:text-center">
                      Wywiad medyczny
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed text-left md:text-center">
                      <span className="md:hidden">Dokładne omówienie dolegliwości, historii choroby oraz dotychczasowego leczenia. Czas na wszystkie pytania i wątpliwości.</span>
                      <span className="hidden md:inline">Dokładne omówienie dolegliwości, historii choroby oraz dotychczasowego leczenia</span>
                    </p>
                  </div>
                </div>

                {/* Step 2: Examination */}
                <div className="flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center">
                  {/* Mobile: Numbered circle on left, Desktop: Icon centered */}
                  <div className="bg-teal-100 md:bg-teal-600 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 md:mb-4">
                    <span className="text-teal-600 md:text-white text-xl md:hidden font-bold">2</span>
                    <Stethoscope className="hidden md:block w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 md:flex-none md:w-full">
                    <div className="hidden md:block w-12 h-0.5 bg-teal-600 mb-4 mx-auto"></div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 text-left md:text-center">
                      Badanie
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed text-left md:text-center">
                      <span className="md:hidden">Przeprowadzenie niezbędnych badań fizykalnych oraz diagnostycznych, takich jak USG czy badanie proktologiczne, w zależności od wskazań.</span>
                      <span className="hidden md:inline">Szczegółowe badanie fizykalne oraz dodatkowe badania diagnostyczne w razie potrzeby</span>
                    </p>
                  </div>
                </div>

                {/* Step 3: Diagnosis */}
                <div className="flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center">
                  {/* Mobile: Numbered circle on left, Desktop: Icon centered */}
                  <div className="bg-teal-100 md:bg-teal-600 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 md:mb-4">
                    <span className="text-teal-600 md:text-white text-xl md:hidden font-bold">3</span>
                    <MessageCircle className="hidden md:block w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 md:flex-none md:w-full">
                    <div className="hidden md:block w-12 h-0.5 bg-teal-600 mb-4 mx-auto"></div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 text-left md:text-center">
                      <span className="md:hidden">Omówienie rozpoznania</span>
                      <span className="hidden md:inline">Rozpoznanie</span>
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed text-left md:text-center">
                      <span className="md:hidden">Szczegółowe wyjaśnienie diagnozy w zrozumiały sposób, omówienie przyczyn schorzenia i możliwych powikłań.</span>
                      <span className="hidden md:inline">Jasne wyjaśnienie diagnozy oraz odpowiedzi na wszystkie pytania pacjenta</span>
                    </p>
                  </div>
                </div>

                {/* Step 4: Treatment Plan */}
                <div className="flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center">
                  {/* Mobile: Numbered circle on left, Desktop: Icon centered */}
                  <div className="bg-teal-100 md:bg-teal-600 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0 md:mb-4">
                    <span className="text-teal-600 md:text-white text-xl md:hidden font-bold">4</span>
                    <FileText className="hidden md:block w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1 md:flex-none md:w-full">
                    <div className="hidden md:block w-12 h-0.5 bg-teal-600 mb-4 mx-auto"></div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3 text-left md:text-center">
                      Plan leczenia
                    </h3>
                    <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed text-left md:text-center">
                      <span className="md:hidden">Ustalenie indywidualnego planu terapeutycznego, omówienie dostępnych metod leczenia oraz wydanie zaleceń i recept.</span>
                      <span className="hidden md:inline">Ustalenie optymalnej metody leczenia dostosowanej do indywidualnych potrzeb</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Container for Sections 8 and 9 - Mobile order swap */}
          <div className="flex flex-col md:contents">
            {/* Section 9: Call to Action Banner */}
            <section className="bg-teal-600 py-12 sm:py-16 md:py-20 w-screen relative left-1/2 -translate-x-1/2 px-4 sm:px-6 order-1 md:order-2" aria-labelledby="cta-heading">
              <div className="max-w-4xl mx-auto text-center">
                <h2 
                  id="cta-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
                >
                  <span className="block">Umów wizytę u doświadczonego</span>
                  <span className="block">
                    Chirurga, Proktologa&nbsp;w Skarżysku-Kamiennej
                  </span>
                </h2>
                <p className="text-white text-base sm:text-lg md:text-xl mb-8 sm:mb-10">
                  Profesjonalna opieka chirurgiczna&nbsp;i proktologiczna<br className="hidden sm:inline" /> na najwyższym poziomie
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
                  >
                    Zarezerwuj termin
                  </button>
                  <button
                    onClick={() => window.location.href = 'tel:+48797127487'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 sm:px-10 sm:py-4 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto border-2 border-white"
                  >
                    <FaPhone className="text-white w-5 h-5 scale-x-[-1]" />
                    Zadzwoń
                  </button>
                </div>
              </div>
            </section>

            {/* Section 8: Other Specialists - Commented out */}
            {/*
            <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2 order-2 md:order-1" aria-labelledby="other-specialists-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-8 sm:mb-12">
                <h2 
                  id="other-specialists-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Inni specjaliści CM7
                </h2>
              </div>

              <div className="flex flex-col md:grid md:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex flex-row md:flex-col items-center md:items-center md:text-center gap-4 md:gap-0 md:mb-6">
                      <div className="w-20 h-20 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full md:rounded-lg overflow-hidden bg-primary-lightest flex items-center justify-center flex-shrink-0 md:mb-4">
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
                      <div className="flex-1 md:flex-none md:w-full">
                        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2 text-left md:text-center">
                          Lek. Anna Grabowska
                        </h3>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl mb-0 md:mb-6 text-left md:text-center">
                          Neurolog dziecięcy
                        </p>
                      </div>
                      <a
                        href="/lekarze/anna-grabowska"
                        className="bg-white text-teal-600 hover:bg-teal-50 font-semibold px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base lg:text-lg transition-colors shadow-sm hover:shadow-md md:w-full md:text-center md:block flex-shrink-0"
                      >
                        Zobacz profil
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex flex-row md:flex-col items-center md:items-center md:text-center gap-4 md:gap-0 md:mb-6">
                      <div className="w-20 h-20 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full md:rounded-lg overflow-hidden bg-primary-lightest flex items-center justify-center flex-shrink-0 md:mb-4">
                        <img
                          src="/assets/static-assets/doctor-image.png"
                          alt="lek. Michał Szczubkowski - Chirurg, Proktolog"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 md:flex-none md:w-full">
                        <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2 text-left md:text-center">
                          Lek. Michał Szczubkowski
                        </h3>
                        <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl mb-0 md:mb-6 text-left md:text-center">
                          Chirurg, Proktolog
                        </p>
                      </div>
                      <a
                        href="/lekarze/michal-szczubkowski"
                        className="bg-white text-teal-600 hover:bg-teal-50 font-semibold px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base lg:text-lg transition-colors shadow-sm hover:shadow-md md:w-full md:text-center md:block flex-shrink-0"
                      >
                        Zobacz profil
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
            */}
          </div>

        </div>
      </main>
    </>
  );
};

export default MichalSzczubkowskiPage;

