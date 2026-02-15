import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaPhone, FaCalendar, FaExclamationTriangle, FaCheck, FaStethoscope, FaMapMarkerAlt, FaClock, FaHeartbeat } from "react-icons/fa";

const DiabeticFootPage = () => {
  return (
    <>
      <MetaTags 
        title="Leczenie stopy cukrzycowej – poradnia chirurgiczna Skarżysko"
        description="Objawy stopy cukrzycowej? Umów wizytę u doświadczonego chirurga w Skarżysku-Kamiennej. Leczenie ran i powikłań cukrzycowych bez skierowania."
        path="/leczenie-stopy-cukrzycowej"
        ogTitle="Leczenie stopy cukrzycowej – poradnia chirurgiczna Skarżysko"
        ogDescription="Objawy stopy cukrzycowej? Umów wizytę u doświadczonego chirurga w Skarżysku-Kamiennej. Leczenie ran i powikłań cukrzycowych bez skierowania."
        ogImage="/assets/static-assets/section1-newpage.png"
        twitterTitle="Leczenie stopy cukrzycowej – poradnia chirurgiczna Skarżysko"
        twitterDescription="Objawy stopy cukrzycowej? Umów wizytę u doświadczonego chirurga w Skarżysku-Kamiennej. Leczenie ran i powikłań cukrzycowych bez skierowania."
        twitterImage="/assets/static-assets/section1-newpage.png"
      />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section - Section 1 */}
        <section className="bg-[#F7F9FA] pt-16 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20" aria-labelledby="hero-heading">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 xl:gap-16">
              {/* Left Side - Text Content */}
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0">
                {/* Teal Pill Tag */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                    Specjalistyczna chirurgia naczyniowa i leczenie ran
                  </span>
                </div>

                {/* Main Heading */}
                <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-4">
                  <span className="block text-teal-600">Leczenie stopy cukrzycowej</span>
                  <span className="block text-gray-900 font-semibold">Poradnia stopy cukrzycowej Skarżysko-Kamienna</span>
                </h1>

                {/* Description */}
                <div className="space-y-4 mb-6 text-gray-700 text-base md:text-lg leading-relaxed">
                  <p>
                    Specjalistyczne leczenie stopy cukrzycowej w Skarżysku-Kamiennej, w województwie świętokrzyskim.
                  </p>
                  <p>
                    Nasza poradnia stopy cukrzycowej, prowadzona przez doświadczonego chirurga, oferuje chirurgiczne oczyszczanie ran, usuwanie tkanek martwiczych i profilaktykę powikłań – bez hospitalizacji.
                  </p>
                  <p>
                    Przyjmujemy pacjentów z Kielc, Radomia, Szydłowca, Suchedniowa oraz licznych miejscowości województwa świętokrzyskiego, mazowieckiego czy łódzkiego.
                  </p>
                </div>

                {/* Price Box */}
                <div className="bg-primary-lighter rounded-lg px-6 py-4 mb-6 flex items-center justify-between">
                  <span className="text-gray-800 font-medium text-sm md:text-base">Cena leczenia stopy cukrzycowej:</span>
                  <span className="text-teal-700 font-bold text-xl md:text-2xl">od 500 zł</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <button 
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base md:text-lg"
                  >
                    Umów wizytę u specjalisty
                  </button>
                  <button 
                    onClick={() => window.location.href = "tel:+48797097487"}
                    className="bg-white border-2 border-teal-600 text-teal-600 font-semibold py-3 px-6 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-base md:text-lg"
                  >
                    <FaPhone className="text-teal-600 w-5 h-5 scale-x-[-1]" />
                    Zadzwoń teraz
                  </button>
                </div>

                {/* Google Rating */}
                <div>
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
                    <span className="text-gray-900 font-semibold text-base">5.0</span>
                    <span className="text-gray-900 font-normal text-base ml-1 hover:text-teal-600">
                      Zobacz opinie Google
                    </span>
                  </a>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <img
                    src="/assets/static-assets/section1-newpage.png"
                    alt="Leczenie stopy cukrzycowej - Centrum Medyczne 7"
                    className="w-full h-auto object-contain rounded-t-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div role="main">
          {/* Section 2: What is Diabetic Foot */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="what-is-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="mb-6">
                <h2 
                  id="what-is-heading"
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3"
                >
                  <span className="block">Stopa cukrzycowa- co to jest i dlaczego wymaga</span>
                  <span className="block">leczenia?</span>
                </h2>
                <div className="w-12 h-1 bg-teal-600"></div>
              </div>

              <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-4">
                Stopa cukrzycowa to zespół objawów będący poważnym powikłaniem cukrzycy, który bez właściwego leczenia może prowadzić do amputacji kończyny. Zespół stopy diabetycznej rozwija się w wyniku długotrwałego podwyższonego poziomu glukozy we krwi, który uszkadza nerwy obwodowe (neuropatia cukrzycowa) oraz naczynia krwionośne (angiopatia diabetyczna), prowadząc do powstania trudno gojących się ran i owrzodzeń.
              </p>

              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                Leczenie stopy cukrzycowej Skarżysko-Kamienna
              </h3>

              <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-4">
                W naszej placówce opieramy się na międzynarodowych standardach i wieloletnim doświadczeniu naszego specjalisty chirurga. Stopa cukrzycowa dotyka ok. 15% pacjentów z cukrzycą w trakcie życia. Ryzyko amputacji można znacząco zmniejszyć dzięki wczesnej diagnozie i leczeniu chirurgicznemu.
              </p>

              {/* Bulleted List - Light grey background */}
              <div className="bg-gray-100 rounded-lg p-4 sm:p-6 mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  Główne przyczyny rozwoju stopy cukrzycowej:
                </h3>
                <ul className="space-y-3" role="list">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-3 h-3 rounded-full border-2 border-teal-600 bg-white mt-2"></span>
                    <div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">Neuropatia cukrzycowa</span>
                      <p className="text-gray-800 text-sm sm:text-base mt-1 ml-0">
                        – utrata czucia bólu, dotyku i temperatury na stopach, co zwiększa ryzyko urazów i opóźnia gojenie
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-3 h-3 rounded-full border-2 border-teal-600 bg-white mt-2"></span>
                    <div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">Angiopatia cukrzycowa</span>
                      <p className="text-gray-800 text-sm sm:text-base mt-1 ml-0">
                        – zaburzenia krążenia prowadzące do niedotlenienia tkanek.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-3 h-3 rounded-full border-2 border-teal-600 bg-white mt-2"></span>
                    <div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">Obniżona odporność</span>
                      <p className="text-gray-800 text-sm sm:text-base mt-1 ml-0">
                        – cukrzyca osłabia system immunologiczny, co zwiększa ryzyko zakażeń trudnych do leczenia
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-3 h-3 rounded-full border-2 border-teal-600 bg-white mt-1.5"></span>
                    <div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">Deformacje stóp</span>
                      <p className="text-gray-800 text-sm sm:text-base mt-1 ml-0">
                        – zmiany w budowie stopy sprzyjające powstawaniu ran w miejscach ucisku
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-4">
                Specjalista leczenia stopy cukrzycowej w naszej poradni stopy cukrzycowej w Skarżysku-Kamiennej podkreśla, że kluczowe dla skutecznej terapii są szybka diagnostyka i natychmiastowe rozpoczęcie leczenia. Nawet kilkudniowe opóźnienie może pogorszyć stan rany i zwiększyć ryzyko konieczności bardziej inwazyjnych zabiegów chirurgicznych.
              </p>

              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                Pacjenci z Kielc, Radomia, Suchedniowa, Szydłowca, Starachowic i okolicznych miejscowości woj. świętokrzyskiego oraz mazowieckiego często wybierają naszą poradnię stopy cukrzycowej ze względu na kompleksowe podejście do terapii. Decyduje o tym nowoczesna metoda leczenia ran cukrzycowych oraz dostępność specjalisty chirurgii lek. Michała Szczubkowskiego z wieloletnim doświadczeniem w leczeniu zespołu stopy cukrzycowej.
              </p>
            </div>
          </section>

          {/* Section 3: Symptoms of Diabetic Foot */}
          <section className="bg-teal-50 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="symptoms-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              {/* Title */}
              <div className="mb-6">
                <h2 
                  id="symptoms-heading"
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3"
                >
                  <span className="block">Objawy stopy cukrzycowej – jak wygląda i kiedy iść do</span>
                  <span className="block">lekarza?</span>
                </h2>
                <div className="w-12 h-1 bg-teal-600"></div>
              </div>

              {/* Two-column symptom cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Left: Early symptoms */}
                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    Wczesne objawy stopy cukrzycowej
                  </h3>
                  <ul className="space-y-3" role="list">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-orange-500 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Drętwienie, mrowienie lub palenie w stopach, szczególnie w nocy
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-orange-500 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Utrata czucia w palcach stóp, niemożność wyczucia temperatury
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-orange-500 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Suchość skóry, pękanie naskórka, nadmierne rogowacenie
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-orange-500 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Zimne stopy, osłabione tętno na tętnicach stopy
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-orange-500 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Zmiany kształtu paznokci, wrastające paznokcie
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-orange-500 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Deformacje palców (palce młotkowate, halluksy)
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Right: Advanced symptoms */}
                <div className="bg-white rounded-lg border-l-4 border-red-600 p-4 sm:p-6 shadow-md">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    Zaawansowane objawy stopy cukrzycowej
                  </h3>
                  <ul className="space-y-3" role="list">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-red-600 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Rany, owrzodzenia lub pęknięcia skóry, które nie goją się
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-red-600 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Zaczerwienienie, obrzęk, ciepłota wokół rany
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-red-600 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Ropna wydzielina z ran, nieprzyjemny zapach
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-red-600 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Ciemne przebarwienia, martwica tkanek
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-red-600 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Gorączka, dreszcze, złe samopoczucie
                      </span>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <FaExclamationTriangle className="flex-shrink-0 text-red-600 w-4 h-4 mt-0.5" aria-hidden />
                      <span className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Nasilający się ból stóp, ból spoczynkowy
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Warning box */}
              <div className="bg-red-50 rounded-lg border border-red-200 p-4 sm:p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">!</span>
                  </div>
                  <div className="text-red-700">
                    <p className="font-bold text-sm sm:text-base mb-2">
                      Pilne! Nie zwlekaj z wizytą u chirurga naczyniowego
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed mb-2">
                      Każdy z powyższych objawów u osoby z cukrzycą może oznaczać początek zespołu stopy diabetycznej.
                    </p>
                    <p className="text-sm sm:text-base leading-relaxed mb-2">
                      <span className="font-bold">Chirurg Skarżysko-Kamienna</span>
                      {' '}dostępny jest w trybie pilnym. Wczesne leczenie może zapobiec amputacji i ratować kończynę.
                    </p>
                    <p className="font-bold text-sm sm:text-base mt-2">
                      Nie czekaj – umów wizytę już dziś!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: How Visit Looks / Treatment Process */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="visit-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              {/* Title - underline under first line only, width ~ "Leczenie stopy cukrzycowej" */}
              <div className="mb-6">
                <h2 
                  id="visit-heading"
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3"
                >
                  <span className="block">Leczenie stopy cukrzycowej Skarżysko-Kamienna</span>
                  <span className="block">- jak wygląda wizyta u doświadczonego chirurga?</span>
                </h2>
                <div className="w-10 h-1 bg-teal-600"></div>
              </div>

              {/* Introductory paragraph */}
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-8">
                Leczenie stopy cukrzycowej Skarżysko-Kamienna, świętokrzyskie Leczenie stopy cukrzycowej w Centrum Medyczne 7 w Skarżysku-Kamiennej prowadzimy według indywidualnego planu, dostosowanego do lokalizacji ran i stopnia zaawansowania zmian. Nasz doświadczony chirurg stosuje metody zgodne z międzynarodowymi standardami leczenia stopy cukrzycowej.
              </p>

              {/* Two columns - light gray background blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {/* Left: Diagnostic stage */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    Etap diagnostyczny
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Szczegółowy wywiad medyczny</p>
                        <p className="text-gray-800 text-sm sm:text-base mt-0.5">Historia cukrzycy, poprzednie leczenie, występowanie powikłań</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Badanie kliniczne stóp</p>
                        <p className="text-gray-800 text-sm sm:text-base mt-0.5">Ocena czucia, krążenia, obecności ran, deformacji</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Badania dodatkowe</p>
                        <p className="text-gray-800 text-sm sm:text-base mt-0.5">RTG stóp, badania laboratoryjne, posiew z rany</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">4</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Plan leczenia</p>
                        <p className="text-gray-800 text-sm sm:text-base mt-0.5">Indywidualny program terapii chirurgicznej</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Surgical treatment stage */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    Etap leczenia chirurgicznego
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Oczyszczanie chirurgiczne</p>
                        <p className="text-gray-800 text-sm sm:text-base mt-0.5">Usunięcie tkanek martwiczych, oczyszczenie rany</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Leczenie zakażenia</p>
                        <p className="text-gray-800 text-sm sm:text-base mt-0.5">Antybiotykoterapia celowana, drenaż ropni</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Opatrunki specjalistyczne</p>
                        <p className="text-gray-800 text-sm sm:text-base mt-0.5">Nowoczesne opatrunki przyspieszające gojenie</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">4</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">Kontrole i modyfikacja</p>
                        <p className="text-gray-800 text-sm sm:text-base mt-0.5">Regularne wizyty, dostosowanie terapii</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom wide block - light teal background, NO underline on heading */}
              <div className="bg-teal-50 rounded-lg p-4 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Metody chirurgicznego leczenia stopy cukrzycowej - nowoczesne podejście bez hospitalizacji
                </h3>
                <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                  W naszej poradni stopy cukrzycowej w Skarżysku-Kamiennej zapewniamy nowoczesne leczenie ran trudno gojących się i zespołu stopy cukrzycowej. Oferujemy skuteczne metody chirurgicznego oczyszczania ran, prowadzone ambulatoryjnie - bez konieczności hospitalizacji. Każdy pacjent objęty jest indywidualnym planem leczenia, opracowanym przez doświadczonego chirurga lek. Michała Szczubkowskiego. Dzięki szybkiemu rozpoznaniu i precyzyjnym zabiegom, możliwe jest zatrzymanie postępu zmian cukrzycowych, uniknięcie amputacji oraz przyspieszenie gojenia.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Surgeon / Doctor */}
          <section className="bg-gray-100 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="surgeon-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              {/* Centered header - title, subtitle, underline */}
              <div className="text-center mb-8">
                <h2 id="surgeon-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  Chirurg Skarżysko-Kamienna
                </h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  - lek. Michał Szczubkowski
                </p>
                <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White card */}
              <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
                {/* Section 1: Specialist intro */}
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    Specjalista leczenia stopy cukrzycowej - Skarżysko-Kamienna, woj. świętokrzyskie
                  </h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-3">
                    Lek. Michał Szczubkowski to lekarz z wieloletnim doświadczeniem w leczeniu zespołu stopy cukrzycowej. Przyjmuje pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej oraz współpracuje z placówkami w regionie świętokrzyskim.
                  </p>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                    Lek. Szczubkowski specjalizuje się w leczeniu ran cukrzycowych, chirurgicznym oczyszczaniu owrzodzeń oraz zaawansowanych metodach terapeutycznych. Stosuje standardy zgodne z międzynarodowymi wytycznymi leczenia stopy diabetycznej.
                  </p>
                </div>

                {/* Section 2: Key competencies - light teal box with border */}
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                    Kluczowe kompetencje chirurga w leczeniu stopy cukrzycowej:
                  </h3>
                  <div className="bg-teal-50 rounded-lg p-4 sm:p-6 border border-teal-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-start gap-3">
                        <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                        <span className="text-gray-800 text-sm sm:text-base">Diagnostyka zaburzeń krążenia obwodowego</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                        <span className="text-gray-800 text-sm sm:text-base">Zabiegi rewaskularyzacyjne</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                        <span className="text-gray-800 text-sm sm:text-base">Ocena ryzyka amputacji i prognoza leczenia</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                        <span className="text-gray-800 text-sm sm:text-base">Chirurgia ran przewlekłych</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                        <span className="text-gray-800 text-sm sm:text-base">Planowanie strategii chirurgicznej</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                        <span className="text-gray-800 text-sm sm:text-base">Amputacje oszczędzające</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Clinic info */}
                <div className="mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    Poradnia leczenia stopy cukrzycowej – woj. świętokrzyskie, mazowieckie, lubelskie, łódzkie.
                  </h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-3">
                    Nasza poradnia leczenia stopy cukrzycowej przyjmuje pacjentów z Kielc, Radomia, Starachowic, Ostrowca Świętokrzyskiego, Szydłowca oraz innych miast i miejscowości województwa świętokrzyskiego, mazowieckiego, lubelskiego i łódzkiego.
                  </p>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                    Lek. Michał Szczubkowski współpracuje z zespołem specjalistów, zapewniając kompleksową opiekę nad pacjentami z zespołem stopy cukrzycowej. W razie potrzeby kieruje na dodatkową diagnostykę i koordynuje leczenie wielospecjalistyczne.
                  </p>
                </div>

                {/* Section 4: Specialist treatment details */}
                <div className="mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    Specjalista leczenia stopy cukrzycowej
                  </h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                    W Centrum Medycznym 7 przyjmujemy pacjentów zarówno w trybie planowym, jak i pilnym. Wczesna konsultacja u chirurga zajmującego się stopą cukrzycową może zapobiec poważnym powikłaniom. Umów wizytę i poznaj naszego specjalistę.
                  </p>
                </div>

                {/* CTA Button - centered */}
                <div className="text-center">
                  <a
                    href="/lekarze/michal-szczubkowski"
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                  >
                    Kliknij i poznaj naszego chirurga
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Visit Flow / Przebieg wizyty */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="visit-flow-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              {/* Header - left-aligned, underline at start */}
              <div className="mb-8">
                <h2 id="visit-flow-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Leczenie stopy cukrzycowej - przebieg wizyty
                </h2>
                <div className="w-24 h-1 bg-teal-600"></div>
              </div>

              {/* Six step blocks */}
              <div className="space-y-4 mb-8">
                {/* Step 1 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200 border-l-4 border-l-teal-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Rejestracja i wywiad wstępny</h3>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Pierwsza wizyta rozpoczyna się od szczegółowego wywiadu medycznego. Chirurg zbiera informacje o przebiegu cukrzycy, wcześniejszych powikłaniach i stosowanym leczeniu. Na tym etapie oceniane jest m.in. ryzyko rozwoju stopy cukrzycowej oraz potrzeba specjalistycznych zabiegów. Pacjent powinien zabrać ze sobą aktualne wyniki badań i dokumentację.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 - with "Ważne" sub-section */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200 border-l-4 border-l-teal-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Badanie kliniczne stóp</h3>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-4">
                        Dokładne badanie stóp obejmuje ocenę czucia, krążenia, temperatury skóry oraz obecność ran i deformacji. To kluczowy element diagnostyki stopy cukrzycowej, który pozwala wykryć pierwsze objawy neuropatii i niedokrwienia.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <p className="font-bold text-gray-900 text-sm sm:text-base mb-1">Ważne:</p>
                        <p className="text-gray-800 text-sm sm:text-base leading-relaxed italic">
                          Badanie jest bezbolesne i nie wymaga specjalnego przygotowania. Zaleca się zabranie wygodnego obuwia na zmianę.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200 border-l-4 border-l-teal-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Diagnostyka i zlecenie badań</h3>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        W zależności od stanu klinicznego chirurg może zlecić dodatkowe badania: RTG stóp (przy podejrzeniu zmian kostnych), posiew z rany, badania krwi (morfologia, CRP) oraz inne testy wspomagające diagnostykę ran trudno gojących się. To pozwala dokładnie określić zaawansowanie zmian i dobrać optymalną metodę leczenia.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200 border-l-4 border-l-teal-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Opracowanie planu leczenia</h3>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Na podstawie wyników badań chirurg opracowuje indywidualny plan leczenia stopy cukrzycowej. Uwzględnia on m.in. zakres i częstotliwość zabiegów, dobór opatrunków, profilaktykę zakażeń oraz plan wizyt kontrolnych. Pacjent otrzymuje zalecenia dotyczące pielęgnacji stóp i opieki w warunkach domowych.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200 border-l-4 border-l-teal-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Zabiegi chirurgiczne i opatrunki</h3>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Zabiegi wykonujemy w warunkach ambulatoryjnych – bez potrzeby hospitalizacji. Chirurg lek. Michał Szczubkowski oczyszcza rany, usuwa tkanki martwicze, wykonuje nacięcia w przypadku ropni i stosuje nowoczesne opatrunki przyspieszające gojenie. Wszystko odbywa się w gabinecie zabiegowym, najczęściej z zastosowaniem znieczulenia miejscowego.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200 border-l-4 border-l-teal-600">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">6</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Wizyty kontrolne i modyfikacja terapii</h3>
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                        Regularne wizyty kontrolne pozwalają ocenić postępy gojenia ran cukrzycowych i w razie potrzeby dostosować leczenie. Chirurg naczyniowy monitoruje efekty terapii, zmienia opatrunki i podejmuje działania zapobiegające amputacji. Częstotliwość wizyt zależy od zaawansowania zmian – zwykle od kilku dni do tygodnia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Banner - teal background */}
              <div className="bg-teal-600 rounded-lg p-6 sm:p-8 text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Gotowy na pierwszą wizytę?
                </h3>
                <p className="text-white text-sm sm:text-base mb-6 max-w-2xl mx-auto">
                  Umów się na konsultację z chirurgiem specjalizującym się w leczeniu stopy cukrzycowej już dziś
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-white text-teal-600 font-semibold px-6 py-3 rounded-lg border-2 border-teal-600 hover:bg-teal-50 transition-colors w-full sm:w-auto"
                  >
                    Umów wizytę online
                  </button>
                  <a
                    href="tel:+48797097487"
                    className="bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg border-2 border-white hover:bg-teal-800 transition-colors w-full sm:w-auto text-center"
                  >
                    Zadzwoń: 797-097-487
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Benefits of Quick Treatment */}
          <section className="bg-teal-50 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="benefits-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              {/* Main heading - left-aligned, underline below first line */}
              <div className="mb-6">
                <h2 id="benefits-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  <span className="block">Jakie korzyści daje szybkie leczenie stopy cukrzycowej</span>
                  <span className="block">u chirurga?</span>
                </h2>
                <div className="w-24 h-1 bg-teal-600"></div>
              </div>

              {/* Introductory paragraph - left-aligned, teal highlight on phrase */}
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-8">
                Szybka konsultacja u specjalisty i właściwe <span className="text-teal-600 font-medium">leczenie stopy cukrzycowej Skarżysko-Kamienna</span> może zapobiec martwicy i zakażeniom. Wczesne rozpoczęcie terapii u chirurga znacząco zwiększa szanse na zachowanie kończyny i powrót do pełnej sprawności.
              </p>

              {/* Three benefit cards - white, centered content within cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {/* Card 1: Uniknięcie amputacji - location pin icon */}
                <div className="bg-white rounded-lg p-6 shadow-md text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-4">
                    <FaMapMarkerAlt className="text-white w-6 h-6" aria-hidden />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-3">
                    Uniknięcie amputacji
                  </h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed text-center">
                    Wczesna interwencja chirurgiczna zmniejsza ryzyko rozległej martwicy i konieczności amputacji kończyny.
                  </p>
                </div>

                {/* Card 2: Skrócenie czasu leczenia - clock icon */}
                <div className="bg-white rounded-lg p-6 shadow-md text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-4">
                    <FaClock className="text-white w-6 h-6" aria-hidden />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-3">
                    Skrócenie czasu leczenia
                  </h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed text-center">
                    Szybkie oczyszczenie rany i wdrożenie odpowiedniej terapii może przyspieszyć proces gojenia nawet o 50%.
                  </p>
                </div>

                {/* Card 3: Lepsza jakość życia - heart monitor/ECG icon */}
                <div className="bg-white rounded-lg p-6 shadow-md text-center">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-4">
                    <FaHeartbeat className="text-white w-6 h-6" aria-hidden />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-3">
                    Lepsza jakość życia
                  </h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed text-center">
                    Zachowanie sprawności kończyny pozwala na samodzielność i aktywność w codziennym życiu.
                  </p>
                </div>
              </div>

              {/* Bottom section - white background, two columns */}
              <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
                {/* Sub-heading - NO underline */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                  Konkretne korzyści wczesnego leczenia stopy cukrzycowej:
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left column: Korzyści medyczne */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                        <FaCheck className="text-white w-4 h-4" aria-hidden />
                      </div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg">Korzyści medyczne</h4>
                    </div>
                    <ul className="space-y-2" role="list">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Redukcja ryzyka amputacji o 70-85%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Szybsze gojenie ran (średnio 6-12 tygodni)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Zmniejszenie ryzyka zakażeń systemowych</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Zapobieganie powikłaniom kostnym</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Lepsza kontrola bólu</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right column: Korzyści dla pacjenta */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                        <FaCheck className="text-white w-4 h-4" aria-hidden />
                      </div>
                      <h4 className="font-bold text-gray-900 text-base sm:text-lg">Korzyści dla pacjenta</h4>
                    </div>
                    <ul className="space-y-2" role="list">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Zachowanie pełnej sprawności ruchowej</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Współpraca z rodziną i bliskimi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Wspieranie w codziennych zadaniach</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Wspieranie w aktywnościach społecznych</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-700 flex-shrink-0">&gt;</span>
                        <span className="text-gray-800 text-sm sm:text-base">Wspieranie w pracy i zajęciach</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Scope of Services */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="scope-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              {/* Main heading - centered */}
              <div className="text-center mb-6">
                <h2 id="scope-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Zakres usług leczenia stopy cukrzycowej
                </h2>
                <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Descriptive paragraph - left-aligned */}
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-8">
                W Centrum Medycznym 7 w Skarżysku-Kamiennej oferujemy kompleksowe usługi leczenia stopy cukrzycowej, zapewniamy kompleksowe leczenie stopy cukrzycowej – od diagnostyki, przez zabiegi chirurgiczne, po opiekę pooperacyjną. Cena terapii zaczyna się od 500 zł, jednak każdy przypadek jest inny – zakres usług i koszt leczenia ustalane są indywidualnie po konsultacji z chirurgiem naczyniowym.
              </p>

              {/* Services list - light teal box, NO left border */}
              <div className="bg-teal-50 rounded-lg p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                  Opieka nad pacjentem i leczenie ran stopy cukrzycowej
                </h3>
                <ul className="space-y-4" role="list">
                  <li className="flex items-start gap-3">
                    <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                    <span className="text-gray-800 text-sm sm:text-base">Zaopatrzenie i oczyszczanie ran cukrzycowych</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                    <span className="text-gray-800 text-sm sm:text-base">Specjalistyczne opatrunki i leczenie ran trudno gojących się</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                    <span className="text-gray-800 text-sm sm:text-base">Wizyty kontrolne i monitorowanie procesu gojenia</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaStethoscope className="text-teal-600 w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden />
                    <span className="text-gray-800 text-sm sm:text-base">Edukacja pacjenta i profilaktyka powikłań stopy cukrzycowej</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 9: Trusted by Patients */}
          <section className="bg-teal-50 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="trusted-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24 text-center">
              <h2 id="trusted-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Zaufali nam pacjenci z całego regionu
              </h2>

              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4 max-w-3xl mx-auto">
                Naszym priorytetem jest skuteczność terapii, bezpieczeństwo i indywidualne podejście do każdego pacjenta.
              </p>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-8 max-w-3xl mx-auto">
                Chirurg Michał Szczubkowski oraz Centrum Medyczne 7 cieszą się wysokimi ocenami w Google i ZnanyLekarz.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => window.location.href = "tel:+48797097487"}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FaPhone className="text-white w-5 h-5 scale-x-[-1]" />
                  Zadzwoń teraz
                </button>
                <button
                  onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                  className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FaCalendar className="text-teal-600" />
                  Umów wizytę online
                </button>
                <a
                  href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FaStar className="text-teal-600" />
                  Zobacz opinie Google
                </a>
              </div>

              {/* Google Rating */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xl fill-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-500 font-light text-base sm:text-lg">5.0 ocena w Google</span>
              </div>
            </div>
          </section>

          {/* Section 10: FAQ */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="faq-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-8">
                <h2 id="faq-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Najczęściej zadawane pytania przed wizytą u chirurga w poradni leczenia stopy cukrzycowej
                </h2>
                <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Czy potrzebuję skierowania na wizytę w poradni stopy cukrzycowej?</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">Nie, przyjmujemy pacjentów prywatnie – bez skierowania. Można umówić wizytę bezpośrednio online lub telefonicznie.</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Czy leczenie stopy cukrzycowej odbywa się bez hospitalizacji?</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">Tak. Wszystkie zabiegi i konsultacje przeprowadzamy ambulatoryjnie, bez konieczności pozostania w szpitalu.</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Z jakich miast przyjmowani są pacjenci w poradni leczenia stopy cukrzycowej?</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">Leczymy pacjentów nie tylko ze Skarżyska-Kamiennej, ale także z Kielc, Radomia, Starachowic, Szydłowca, Końskich i innych miejscowości woj. świętokrzyskiego i mazowieckiego.</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Ile kosztuje leczenie stopy cukrzycowej?</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">Cena leczenia stopy cukrzycowej w Centrum Medyczne 7 zaczyna się od 500 zł. Dokładny koszt ustalany jest po konsultacji i zależy od zakresu leczenia.</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Czy mogę umówić pilną wizytę w przypadku pogorszenia stanu rany?</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">Tak. W przypadkach nagłych możliwa jest wizyta w trybie przyspieszonym. Skontaktuj się z rejestracją pod numerem 797-097-487.</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Czy w województwie świętokrzyskim jest poradnia leczenia stopy cukrzycowej?</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">Tak, poradnia leczenia stopy cukrzycowej działa w Skarżysku-Kamiennej. W Centrum Medycznym 7 przyjmujemy pacjentów z całego województwa świętokrzyskiego.</p>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">Gdzie znajduje się poradnia leczenia stopy cukrzycowej w Skarżysku-Kamiennej?</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed">Poradnia mieści się w Centrum Medycznym 7 przy ul. Powstańców Warszawy 7/1.5. Leczenie prowadzi doświadczony chirurg lek. Michał Szczubkowski bez potrzeby skierowania.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: Treatment close to you / Regional reach */}
          <section className="bg-gray-100 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="regional-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-8">
                <h2 id="regional-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Leczenie stopy cukrzycowej blisko Ciebie – Skarżysko-Kamienna, Kielce, Radom i okolice
                </h2>
                <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md">
                <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-4">
                  Choć Centrum Medyczne 7 mieści się w Skarżysku-Kamiennej, z naszej poradni stopy cukrzycowej regularnie korzystają pacjenci z całego regionu – m.in. z Kielc, Radomia, Starachowic, Szydłowca, Ostrowca Świętokrzyskiego, Końskich, Buska Zdrój i wielu okolicznych miejscowości województwa świętokrzyskiego, mazowieckiego, łódzkiego.
                </p>
                <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-4">
                  Pacjenci doceniają dogodny dojazd, wygodną rejestrację online oraz brak kolejek.
                </p>
                <p className="font-bold text-gray-900 text-sm sm:text-base leading-relaxed mb-6">
                  Szukasz zaufanego chirurga specjalizującego się w leczeniu stopy cukrzycowej? Umów się na wizytę już dziś.
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Kliknij i umów wizytę u chirurga
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 12: Contact and location - last section */}
          <section className="bg-teal-5image.png0 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="contact-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <h2 id="contact-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8">
                Poradnia leczenia stopy cukrzycowej – kontakt i lokalizacja
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left card: Adres poradni */}
                <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">Adres poradni</h3>
                  <div className="space-y-1 mb-6">
                    <p className="font-bold text-gray-900">Centrum Medyczne 7</p>
                    <p className="text-gray-800">ul. Powstańców Warszawy 7/1.5</p>
                    <p className="text-gray-800">26-110 Skarżysko-Kamienna</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="tel:+48797097487"
                      className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-3 rounded-lg transition-colors"
                    >
                      <FaPhone className="text-white w-4 h-4 scale-x-[-1]" aria-hidden />
                      Zadzwoń teraz
                    </a>
                    <button
                      onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                      className="inline-flex items-center justify-center gap-2 bg-white border-2 border-teal-600 text-teal-600 font-semibold px-5 py-3 rounded-lg hover:bg-teal-50 transition-colors"
                    >
                      <FaCalendar className="text-teal-600 w-4 h-4" aria-hidden />
                      Umów wizytę
                    </button>
                  </div>
                </div>

                {/* Right card: Obsługiwane regiony */}
                <div className="bg-white rounded-lg p-6 sm:p-8 shadow-md">
                  <h3 className="font-bold text-gray-900 text-lg mb-4">Obsługiwane regiony</h3>
                  <p className="text-gray-800 text-sm sm:text-base leading-relaxed mb-6">
                    Przyjmujemy pacjentów z Kielc, Radomia, Opoczna, Piotrkowa Trybunalskiego, Przysuchy, Szydłowca oraz okolicznych miejscowości województwa świętokrzyskiego.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Kielce', 'Radom', 'Starachowice', 'Opoczno'].map((city) => (
                      <div key={city} className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-teal-600 w-4 h-4 flex-shrink-0" aria-hidden />
                        <span className="text-gray-800">{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default DiabeticFootPage;
