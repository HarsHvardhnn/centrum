import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaPhone, FaCheck, FaUserFriends, FaLaptopMedical, FaCalendar, FaInfoCircle, FaMapMarkerAlt } from "react-icons/fa";
import usgSection1 from '../../../assets/usg_section1.png';
import section4Usg from '../../../assets/section4__usg.jpg';
import section5Usg from '../../../assets/section5_usg.jpg';

const USG_RADIOLOGIST_DOCTOR_ID = '699311c1a74a047fccedede0';
const APPOINTMENT_URL = `/?lekarz=${USG_RADIOLOGIST_DOCTOR_ID}&openAppointment=true#appointment-section`;

const USG_PRICE_LIST = [
  { name: "USG jamy brzusznej (USG brzucha)", price: "200" },
  { name: "USG tarczycy", price: "200" },
  { name: "USG piersi", price: "250" },
  { name: "USG węzłów chłonnych", price: "200" },
  { name: "USG jąder", price: "200" },
  { name: "USG tkanek miękkich (blizna pooperacyjna, tłuszczak, kaszak, włókniak, guz podskórny)", price: "200" },
  { name: "USG ślinianek", price: "200" },
  { name: "USG pachwin (okolice pachwinowych)", price: "200" },
  { name: "USG powłok brzusznych (przepukliny brzuszne)", price: "200" },
  { name: "USG prostaty (przez powłoki brzuszne z oceną zalegania po mikcji)", price: "200" },
  { name: "USG nerek i pęcherza moczowego (USG układu moczowego)", price: "200" },
  { name: "USG wątroby i dróg żółciowych", price: "200" },
  { name: "USG trzustki", price: "200" },
  { name: "USG dzieci (od 7 roku życia)", price: "od 200" },
];

const USG_FAQ_ITEMS = [
  {
    question: "Czy na USG w Centrum Medyczne 7 trzeba mieć skierowanie?",
    answer: "Nie, w Centrum Medyczne 7 w Skarżysku-Kamiennej wszystkie badania USG wykonujemy prywatnie - bez skierowania od lekarza rodzinnego czy specjalisty.",
  },
  {
    question: "Ile kosztuje badanie USG w Skarżysku-Kamiennej?",
    answer: "Ceny badań USG w CM7 zaczynają się od 200 zł. Koszt zależy od rodzaju badania - szczegóły znajdziesz w naszym cenniku lub podczas rejestracji.",
  },
  {
    question: "Gdzie zrobić badanie USG tarczycy w Skarżysku-Kamiennej?",
    answer: "Badanie USG tarczycy można wykonać w Centrum Medyczne 7 w Skarżysku-Kamiennej, ul. Powstańców Warszawy 7/1.5.",
  },
  {
    question: "Czy można wykonać USG tego samego dnia?",
    answer: "Tak - oferujemy terminy z dnia na dzień, a w pilnych przypadkach możliwe jest wykonanie badania nawet tego samego dnia. Zalecamy kontakt telefoniczny z recepcją Centrum Medyczne 7.",
  },
  {
    question: "Czy radiolog opisuje wynik USG od razu?",
    answer: "Tak - w większości przypadków radiolog przekazuje wstępną informację zaraz po badaniu. Opis do dokumentacji medycznej otrzymasz już tego samego dnia.",
  },
  {
    question: "Gdzie zrobić USG prywatnie w Skarżysku-Kamiennej?",
    answer: "W Centrum Medyczne 7 przy ul. Powstańców Warszawy 7/1.5 w Skarżysku-Kamiennej wykonasz badania USG bez kolejek, bez skierowania i w komfortowych warunkach.",
  },
  {
    question: "Czy USG można zrobić prywatnie w woj. świętokrzyskim bez kolejek?",
    answer: "Tak - nasz gabinet USG w Skarżysku-Kamiennej przyjmuje prywatnie pacjentów z całego woj. świętokrzyskiego i mazowieckiego, bez skierowania i kolejek.",
  },
];

const USGSkarzyskoPage = () => {
  const priceListSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "Centrum Medyczne 7",
    "url": "https://centrummedyczne7.pl/usg-skarzysko-kamienna",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Cennik badań USG",
      "itemListElement": USG_PRICE_LIST.map((item) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "MedicalTest",
          "name": item.name,
        },
        "price": parseInt(item.price.startsWith("od") ? "200" : item.price, 10),
        "priceCurrency": "PLN",
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": USG_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };

  return (
    <>
      <MetaTags
        title="USG Skarżysko-Kamienna – prywatnie, bez skierowania"
        description="USG Skarżysko-Kamienna. USG tarczycy, trzustki, piersi, jamy brzusznej. Badania dla dzieci i dorosłych, bez skierowania, szybkie terminy."
        path="/usg-skarzysko-kamienna"
        ogTitle="USG Skarżysko-Kamienna – prywatnie, bez skierowania"
        ogDescription="USG Skarżysko-Kamienna. USG tarczycy, trzustki, piersi, jamy brzusznej. Badania dla dzieci i dorosłych, bez skierowania, szybkie terminy."
        ogImage="/assets/static-assets/usg_section1.png"
        twitterTitle="USG Skarżysko-Kamienna – prywatnie, bez skierowania"
        twitterDescription="USG Skarżysko-Kamienna. USG tarczycy, trzustki, piersi, jamy brzusznej. Badania dla dzieci i dorosłych, bez skierowania, szybkie terminy."
        twitterImage="/assets/static-assets/usg_section1.png"
      />
      <script type="application/ld+json">
        {JSON.stringify(priceListSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <main className="min-h-screen bg-white">
        {/* Hero Section - Section 1 */}
        <section className="bg-[#F7F9FA] pt-16 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 xl:gap-16">
              {/* Left Column - Text and CTAs */}
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0">
                {/* Main Heading - 4 lines, exact breaks */}
                <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6">
                  <span className="block text-teal-600">USG</span>
                  <span className="block text-teal-600">Skarżysko-Kamienna</span>
                  <span className="block text-gray-900 font-bold">prywatnie, bez kolejek,</span>
                  <span className="block text-gray-900 font-bold">dla dzieci i dorosłych.</span>
                </h1>

                {/* Descriptive paragraph - single block, regular weight */}
                <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-6">
                  Badania USG w Skarżysku-Kamiennej wykonujemy prywatnie, bez skierowania i z krótkimi terminami – często nawet z dnia na dzień. W Centrum Medycznym 7 wykonujemy badania USG dla pacjentów ze Skarżyska-Kamiennej oraz całego woj. świętokrzyskiego – z dogodnym dojazdem z Kielc, Radomia, Starachowic czy Ostrowca Świętokrzyskiego. Wykonujemy m.in. USG jamy brzusznej, USG tarczycy, USG piersi oraz USG Doppler naczyń. Badania realizują doświadczeni radiolodzy z praktyką kliniczną.
                </p>

                {/* Feature list with icons */}
                <ul className="space-y-3 mb-6" role="list">
                  <li className="flex items-center gap-3 text-gray-800 text-base md:text-lg">
                    <FaCheck className="text-teal-600 flex-shrink-0 w-5 h-5" />
                    <span>USG bez skierowania – prywatnie, z dnia na dzień</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-800 text-base md:text-lg">
                    <FaUserFriends className="text-teal-600 flex-shrink-0 w-5 h-5" />
                    <span>Badania dzieci, dorosłych i seniorów</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-800 text-base md:text-lg">
                    <FaLaptopMedical className="text-teal-600 flex-shrink-0 w-5 h-5" />
                    <span>Nowoczesny sprzęt + radiolodzy z doświadczeniem szpitalnym</span>
                  </li>
                </ul>

                {/* Call-to-Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <button
                    onClick={() => window.location.href = APPOINTMENT_URL}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base md:text-lg"
                  >
                    Umów badanie USG
                  </button>
                  <button
                    onClick={() => window.location.href = "tel:+48797127487"}
                    className="bg-white border-2 border-teal-600 text-teal-600 font-semibold py-3 px-6 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-base md:text-lg"
                  >
                    <FaPhone className="text-teal-600 w-5 h-5 scale-x-[-1]" />
                    797 127 487
                  </button>
                </div>

                {/* Google Rating */}
                <a
                  href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-base fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-900 text-base hover:text-teal-600">5.0 ocena w Google</span>
                </a>
              </div>

              {/* Right Column - Image */}
              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <img
                    src={usgSection1}
                    alt="Badanie USG w Centrum Medycznym 7 – Skarżysko-Kamienna"
                    className="w-full h-auto object-contain rounded-t-2xl"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: USG prywatnie - szybko i profesjonalnie */}
        <section className="bg-teal-50 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="usg-prywatnie-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12 text-left">
            <h2
              id="usg-prywatnie-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8"
            >
              <span className="block text-teal-600">USG prywatnie w Skarżysku-Kamiennej</span>
              <span className="block text-xl sm:text-2xl md:text-3xl mt-1 text-gray-900">- szybko i profesjonalnie</span>
            </h2>

            <div className="space-y-4 sm:space-y-5 text-gray-800 text-base md:text-lg leading-relaxed">
              <p>
                W Centrum Medyczne 7 wykonujemy pełny zakres badań USG – całkowicie prywatnie, bez skierowania i bez długiego oczekiwania. Oferujemy krótkie terminy – często z dnia na dzień – oraz komfortowe warunki badania w nowoczesnym gabinecie USG.
              </p>
              <p>
                Badania wykonują doświadczeni radiolodzy z praktyką kliniczną, którzy zapewniają rzetelną ocenę diagnostyczną oraz indywidualne podejście do pacjenta. Pracujemy zgodnie z aktualnymi standardami medycznymi, co przekłada się na trafność diagnozy i bezpieczeństwo badanych.
              </p>
              <p>
                Z naszych usług USG w Skarżysku-Kamiennej korzystają pacjenci z całego woj. świętokrzyskiego i mazowieckiego – m.in. z Kielc, Radomia, Starachowic, Suchedniowa, Bodzentyna, Szydłowca, Jastrzębia, Wąchocka i Ostrowca Świętokrzyskiego.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Zakres badań USG */}
        <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="zakres-badan-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            <h2
              id="zakres-badan-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-600 text-center mb-4 sm:mb-6"
            >
              Zakres badań USG
            </h2>
            <div className="text-center mb-8 sm:mb-10 space-y-2 text-gray-800 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              <p>
                Wszystkie badania wykonujemy prywatnie, bez skierowania i często z dnia na dzień.
              </p>
              <p>
                Z pełnym zakresem badań można zapoznać się w ofercie usług.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                { title: "USG jamy brzusznej", desc: "Diagnostyka wątroby, nerek, trzustki, śledziony i dróg moczowych." },
                { title: "USG piersi", desc: "Badanie ultrasonograficzne gruczołu piersiowego, uzupełniające diagnostykę." },
                { title: "USG tarczycy", desc: "Ocena gruczołu tarczowego, wielkości i echogeniczności, w tym guzków." },
                { title: "USG prostaty", desc: "Badanie gruczołu krokowego przez powłoki brzuszne lub przezodbytniczo (TRUS)." },
                { title: "USG węzłów chłonnych", desc: "Ocena węzłów chłonnych szyi, pachowych, pachwinowych i jamy brzusznej." },
                { title: "USG trzustki", desc: "Obrazowanie trzustki w ramach USG jamy brzusznej lub jako badanie celowane." },
                { title: "USG dzieci", desc: "Badania USG dla niemowląt i dzieci, m.in. bioder, jamy brzusznej, głowy." },
                { title: "USG jąder", desc: "Diagnostyka jąder, najądrzy i moszny; ocena zmian ogniskowych." },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-gray-50 rounded-lg p-4 sm:p-5 text-left"
                >
                  <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: Radiolog - lek. Dawid Dopierała */}
        <section className="bg-teal-50 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="radiolog-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            <h2
              id="radiolog-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8"
            >
              Radiolog Skarżysko-Kamienna – lek. Dawid Dopierała
            </h2>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 flex flex-col items-center justify-center p-6 sm:p-8">
                  <img
                    src={section4Usg}
                    alt="lek. Dawid Dopierała – radiolog, Centrum Medyczne 7"
                    className="w-full max-w-xs h-auto object-contain rounded-lg"
                    loading="lazy"
                  />
                  <button
                    onClick={() => window.location.href = APPOINTMENT_URL}
                    className="mt-6 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base"
                  >
                    Umów wizytę
                  </button>
                </div>
                <div className="md:w-3/5 p-6 sm:p-8 flex flex-col justify-center text-left">
                  <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1">
                    lek. Dawid Dopierała
                  </h3>
                  <p className="text-teal-600 text-sm sm:text-base font-medium mb-4">
                    Specjalista radiologii i diagnostyki obrazowej
                  </p>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                    Absolwent I Wydziału Lekarskiego Warszawskiego Uniwersytetu Medycznego. Doświadczenie zawodowe zdobywał m.in. w Świętokrzyskim Centrum Onkologii w Kielcach, uczestnicząc w procesie diagnostyki obrazowej pacjentów z chorobami o zróżnicowanym charakterze. W praktyce klinicznej zajmuje się wykonywaniem oraz interpretacją badań ultrasonograficznych, stanowiących istotny element współczesnej diagnostyki medycznej. W swojej pracy kładzie nacisk na precyzyjną analizę obrazu oraz rzetelną ocenę wyniku w kontekście klinicznym, zapewniając wysoki standard diagnostyczny.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-4xl mx-auto mt-6">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/5 flex flex-col items-center justify-center p-6 sm:p-8">
                  <img
                    src="/second_doctor_usg.png"
                    alt="lek. Jacek Posobkiewicz - radiolog, Centrum Medyczne 7"
                    className="w-full max-w-xs h-auto object-contain rounded-lg"
                    loading="lazy"
                  />
                  <button
                    onClick={() => window.location.href = APPOINTMENT_URL}
                    className="mt-6 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base"
                  >
                    Umów wizytę
                  </button>
                </div>
                <div className="md:w-3/5 p-6 sm:p-8 flex flex-col justify-center text-left">
                  <h3 className="text-gray-900 font-bold text-lg sm:text-xl mb-1">
                    <a
                      href="https://www.centrummedyczne7.pl/lekarze/jacek-posobkiewicz"
                      className="hover:text-teal-600 transition-colors"
                    >
                      lek. Jacek Posobkiewicz
                    </a>
                  </h3>
                  <p className="text-teal-600 text-sm sm:text-base font-medium mb-4">
                    Specjalista radiologii i diagnostyki obrazowej
                  </p>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                    Lekarz z wieloletnim doswiadczeniem w zakresie diagnostyki obrazowej, zajmujacy sie wykonywaniem oraz interpretacja badan ultrasonograficznych. W codziennej praktyce klinicznej kladzie nacisk na rzetelna ocene obrazu oraz precyzyjna analize badania w kontekscie zglaszanych dolegliwosci i wskazan medycznych. USG stanowi istotny element jego pracy diagnostycznej, pozwalajac na szybkie i nieinwazyjne rozpoznanie wielu schorzen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Sprzęt diagnostyczny */}
        <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="sprzet-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 xl:gap-16">
              {/* Left Column - Text */}
              <div className="flex-1 w-full lg:w-1/2">
                <h2
                  id="sprzet-heading"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
                >
                  Sprzęt diagnostyczny
                </h2>
                <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-6">
                  Badania realizowane są z wykorzystaniem nowoczesnego systemu ultrasonograficznego firmy Samsung najnowszej generacji, zapewniającego:
                </p>
                <ul className="space-y-3" role="list">
                  <li className="flex items-center gap-3 text-gray-800 text-base md:text-lg">
                    <FaCheck className="text-teal-600 flex-shrink-0 w-5 h-5" />
                    <span>wysoką jakość i rozdzielczość obrazu</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-800 text-base md:text-lg">
                    <FaCheck className="text-teal-600 flex-shrink-0 w-5 h-5" />
                    <span>dokładność pomiarów diagnostycznych</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-800 text-base md:text-lg">
                    <FaCheck className="text-teal-600 flex-shrink-0 w-5 h-5" />
                    <span>zaawansowane techniki obrazowania</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-800 text-base md:text-lg">
                    <FaCheck className="text-teal-600 flex-shrink-0 w-5 h-5" />
                    <span>ergonomiczne warunki badania dostosowane do potrzeb pacjenta</span>
                  </li>
                </ul>
              </div>
              {/* Right Column - Image */}
              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] shadow-lg rounded-lg overflow-hidden">
                  <img
                    src={section5Usg}
                    alt="Nowoczesny system ultrasonograficzny Samsung w Centrum Medycznym 7"
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Cennik usług USG */}
        <section className="bg-[#F8FAFC] py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="cennik-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            {/* Header - all centered */}
            <div className="mb-6 sm:mb-8 text-center">
              <h2
                id="cennik-heading"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2"
              >
                Cennik usług
              </h2>
              <p className="text-teal-600 text-xl sm:text-2xl md:text-3xl font-bold border-b-2 border-teal-600 pb-1 inline-block">
                USG
              </p>
            </div>
            <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-8 max-w-3xl mx-auto text-center">
              Aktualny cennik badań USG w Skarżysku-Kamiennej wykonywanych w Centrum Medycznym 7. Realizujemy szeroki zakres badań ultrasonograficznych dla dorosłych i dzieci od 7. roku życia.
            </p>

            {/* Price list table */}
            <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6 ring-1 ring-black/5">
              <table className="w-full text-left" role="table" aria-label="Cennik badań USG">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base" scope="col">Usługa</th>
                    <th className="py-3 px-4 sm:px-6 font-semibold text-sm sm:text-base text-right whitespace-nowrap" scope="col">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  {USG_PRICE_LIST.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 sm:px-6 text-gray-800 text-sm sm:text-base">
                        {row.name}
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-right text-teal-600 font-semibold text-sm sm:text-base whitespace-nowrap">
                        {row.price} zł
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Middle text - two lines, centered, between table and disclaimer */}
            <div className="text-center py-4 sm:py-5">
              <p className="text-[#4B5563] text-sm sm:text-base italic">
                * Badania wykonywane są również u dzieci od 7. roku życia.
              </p>
              <p className="text-[#4B5563] text-sm sm:text-base mt-1">
                W przypadku pacjentów niepełnoletnich wymagana jest obecność opiekuna prawnego.
              </p>
            </div>

            {/* Disclaimer box - light mint green, more rounded, stronger shadow */}
            <div className="flex gap-3 p-4 sm:p-5 rounded-2xl bg-teal-50/90 border border-teal-200 shadow-xl mb-8">
              <FaInfoCircle className="text-teal-600 flex-shrink-0 w-6 h-6 mt-0.5" aria-hidden="true" />
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed text-left">
                Podane ceny mają charakter informacyjny i nie stanowią oferty w rozumieniu art. 66 §1 Kodeksu cywilnego. Wiążące są wyłącznie ceny opublikowane na tej stronie w dniu rejestracji na wizytę. Centrum Medyczne 7 zastrzega sobie prawo do zmiany cennika.
              </p>
            </div>

            {/* CTA / Contact card - dark grey, more rounded, stronger shadow */}
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 sm:p-8 text-white text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
                Gabinet USG Skarżysko-Kamienna
              </h3>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl mx-auto">
                Skontaktuj się z recepcją, aby umówić badanie w gabinecie USG w Skarżysku-Kamiennej lub uzyskać szczegółowe informacje dotyczące dostępnych terminów oraz przygotowania do badania.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => window.location.href = "tel:+48797127487"}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FaPhone className="w-5 h-5 scale-x-[-1]" />
                  Zadzwoń teraz
                </button>
                <button
                  onClick={() => window.location.href = APPOINTMENT_URL}
                  className="bg-white text-teal-600 border-2 border-teal-600 font-semibold py-3 px-6 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FaCalendar className="w-5 h-5" />
                  Umów wizytę online
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: FAQ - Najczęściej zadawane pytania */}
        <section className="bg-[#FFFFFF] py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="faq-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10"
            >
              <span className="block text-gray-900">Najczęściej zadawane pytania przed wizytą</span>
              <span className="block mt-1">
                <span className="text-teal-600">u Radiologa</span>
                <span className="text-gray-900"> i </span>
                <span className="text-teal-600">badaniem USG</span>
              </span>
            </h2>

            <div className="space-y-4 sm:space-y-5 max-w-3xl mx-auto">
              {USG_FAQ_ITEMS.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#F8FAFC] rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 text-left"
                >
                  <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-3">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 8: CTA - Umów wizytę u Radiologa */}
        <section className="bg-[#008C8C] py-12 sm:py-16 md:py-20 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="cta-radiolog-heading">
          <div className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 text-center">
            <h2
              id="cta-radiolog-heading"
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3"
            >
              Umów wizytę u doświadczonego Radiologa w Skarżysku-Kamiennej
            </h2>
            <p className="text-white/95 font-normal text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto">
              USG w Skarżysku-Kamiennej – profesjonalna opieka i szybkie terminy
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
              <button
                type="button"
                onClick={() => window.location.href = APPOINTMENT_URL}
                className="bg-white text-[#008C8C] font-semibold py-3 px-8 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-base sm:text-lg min-h-[48px]"
              >
                Zarezerwuj termin
              </button>
              <button
                type="button"
                onClick={() => window.location.href = "tel:+48797127487"}
                className="bg-transparent text-white font-semibold py-3 px-8 rounded-lg border-2 border-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-base sm:text-lg min-h-[48px]"
              >
                <FaPhone className="w-5 h-5 scale-x-[-1] text-white shrink-0" aria-hidden />
                Zadzwoń
              </button>
            </div>
          </div>
        </section>

        {/* Section 9: Gabinet USG - kontakt */}
        <section className="py-10 sm:py-14 md:py-16 w-screen relative left-1/2 -translate-x-1/2" style={{ backgroundColor: '#F0F7F7' }} aria-labelledby="kontakt-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            <h2
              id="kontakt-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-10"
            >
              Gabinet USG Skarżysko-Kamienna – kontakt
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Left card: Prywatny Gabinet USG */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-teal-600 font-bold text-lg sm:text-xl mb-4">
                  Prywatny Gabinet USG
                </h3>
                <address className="text-gray-800 font-medium text-base leading-relaxed not-italic mb-6">
                  Centrum Medyczne 7<br />
                  ul. Powstańców Warszawy 7/1.5<br />
                  26-110 Skarżysko-Kamienna
                </address>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.location.href = "tel:+48797127487"}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2"
                  >
                    <FaPhone className="w-5 h-5 scale-x-[-1]" />
                    Zadzwoń teraz
                  </button>
                  <button
                    onClick={() => window.location.href = APPOINTMENT_URL}
                    className="bg-white text-teal-600 border-2 border-teal-600 font-semibold py-3 px-6 rounded-xl hover:bg-teal-50 transition-colors"
                  >
                    Umów wizytę
                  </button>
                </div>
              </div>

              {/* Right card: Obsługiwane regiony */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h3 className="text-black font-bold text-lg sm:text-xl mb-4">
                  Obsługiwane regiony
                </h3>
                <p className="text-gray-800 text-base leading-relaxed mb-5">
                  Przyjmujemy pacjentów prywatnie w Skarżysku-Kamiennej oraz z okolicznych miast: Kielc, Radomia, Starachowic, Szydłowca, Bodzentyna i Wierzbicy. Z naszej pracowni USG korzystają również mieszkańcy powiatu skarżyskiego, kieleckiego, starachowickiego i radomskiego.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="list">
                  {["Kielce", "Radom", "Starachowice", "Szydłowiec"].map((city) => (
                    <li key={city} className="flex items-center gap-2 text-gray-800 text-base">
                      <FaMapMarkerAlt className="text-teal-600 w-4 h-4 flex-shrink-0 fill-current" aria-hidden="true" />
                      <span>{city}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 10: Last CTA - dark background */}
        <section className="py-12 sm:py-16 md:py-20 w-screen relative left-1/2 -translate-x-1/2 text-center" style={{ backgroundColor: '#1A2332' }} aria-labelledby="last-cta-heading">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <h2
              id="last-cta-heading"
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4"
            >
              Prywatne badania <span className="inline-block pb-4 border-b-4 border-teal-500">USG w</span> Skarżysku-Kamiennej
            </h2>
            <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
              W Centrum Medycznym 7 wykonujemy badania USG prywatnie, bez skierowania i z krótkim czasem oczekiwania na termin. Zapewniamy rzetelną diagnostykę obrazową prowadzoną przez doświadczonego lekarza radiologa oraz nowoczesny sprzęt ultrasonograficzny. Gabinet USG w Skarżysku-Kamiennej oferuje szybkie terminy badań oraz jasne omówienie wyniku bezpośrednio po zakończeniu wizyty.
            </p>

            {/* Google rating */}
            <a
              href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-lg fill-yellow-400" />
                ))}
              </div>
              <span className="text-white font-semibold">5.0</span>
              <span className="text-gray-400 text-sm sm:text-base ml-1">Ocena Google</span>
            </a>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => window.location.href = APPOINTMENT_URL}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base sm:text-lg"
              >
                Umów wizytę online
              </button>
              <button
                onClick={() => window.location.href = "tel:+48797127487"}
                className="bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <FaPhone className="text-gray-900 w-5 h-5 scale-x-[-1]" />
                Zadzwoń: 797 127 487
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default USGSkarzyskoPage;
