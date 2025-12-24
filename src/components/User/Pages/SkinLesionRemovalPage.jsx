import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaPhone, FaCalendar, FaShieldAlt, FaCheck } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";

const SkinLesionRemovalPage = () => {
  return (
    <>
      <MetaTags 
        title="Usuwanie zmian skórnych – Skarżysko-Kamienna, Kielce, Radom – CM7"
        description="Chirurgiczne usuwanie zmian skórnych w Centrum Medycznym 7. Profesjonalne usuwanie znamion, brodawek, kaszaków i innych zmian skórnych. Umów wizytę."
        path="/usuwanie-zmian-skornych"
      />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section - First Section */}
        <section className="bg-[#F7F9FA] pt-24 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 xl:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 xl:gap-16">
              {/* Left Side - Text Content */}
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0">
                {/* Teal Pill Tag */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                    Prywatnie, bez skierowania
                  </span>
                </div>

                {/* Main Heading */}
                <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6">
                  <span className="block text-teal-600">Usuwanie zmian skórnych</span>
                  <span className="block text-teal-600">Skarżysko-Kamienna,</span>
                  <span className="block text-gray-900">Kielce, Radom</span>
                  <span className="block text-gray-900">– chirurgiczne usuwanie</span>
                  <span className="block text-gray-900">znamion i zmian skórnych</span>
                </h1>

                {/* Description Paragraph */}
                <div className="mb-4 sm:mb-6 text-gray-700 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
                  <p>
                    Profesjonalne chirurgiczne usuwanie zmian skórnych: znamion, brodawek, kaszaków i innych zmian. Zabiegi wykonywane przez doświadczonych chirurgów w Centrum Medycznym 7.
                  </p>
                </div>

                {/* Feature Items */}
                <div className="mb-4 sm:mb-6">
                  {/* First Row - Two items side by side */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                        <FaCheck className="text-teal-600 text-base sm:text-lg" />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">Prywatnie, bez skierowania</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                        <FaShieldAlt className="text-teal-600 text-base sm:text-lg" />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">Dyskrecja i komfort</span>
                    </div>
                  </div>
                  {/* Second Row - Third item centered */}
                  <div className="flex justify-center sm:justify-start">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                        <IoLocationOutline className="text-teal-600 text-base sm:text-lg" />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">Pacjenci z całego woj. świętokrzyskiego</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition-colors text-sm sm:text-base md:text-lg">
                    Umów się na wizytę
                  </button>
                  <a
                    href="/lekarze/michal-szczubkowski"
                    className="bg-white border-2 border-teal-600 text-teal-600 font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg text-center"
                  >
                    Zobacz Chirurga
                  </a>
                </div>

                {/* Google Rating */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Five Stars */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-sm sm:text-base fill-yellow-400" />
                    ))}
                  </div>
                  {/* Rating Text */}
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">5.0 ocena w Google</span>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <img
                    src="/assets/static-assets/Usuwanie-zmian-skórnych.png"
                    alt="Usuwanie zmian skórnych - Centrum Medyczne 7"
                    className="w-full h-auto object-contain rounded-t-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16" role="main">
          
          {/* Section 2: When to Visit */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="when-to-visit-heading">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="when-to-visit-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Kiedy warto zgłosić się na chirurgiczne usuwanie zmian skórnych?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              <p className="text-left text-gray-700 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                Jeśli zauważasz poniższe objawy lub masz niepokojące dolegliwości - nie zwlekaj z wizytą:
              </p>

              {/* Symptoms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="bg-white rounded-lg p-6">
                  <ul className="space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">zmiana kształtu, koloru lub rozmiaru znamienia</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">swędzenie, pieczenie lub ból w okolicy zmiany</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">krwawienie lub sączenie ze zmiany</span>
                    </li>
                  </ul>
                </div>

                {/* Right Column */}
                <div className="bg-white rounded-lg p-6">
                  <ul className="space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">znamię w miejscu narażonym na urazy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">zmiany estetyczne powodujące dyskomfort</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">podejrzenie zmiany nowotworowej</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Info Box */}
              <div className="bg-white rounded-lg p-6 md:p-8">
                <p className="text-gray-800 text-base md:text-lg leading-relaxed text-left font-semibold">
                  Wczesna diagnostyka i usunięcie podejrzanych zmian skórnych pozwala na skuteczne leczenie i zapobieganie powikłaniom.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How Does Procedure Look Like */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="procedure-heading">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="procedure-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Jak wygląda zabieg?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Main Content Box */}
              <div className="bg-primary-lightest rounded-lg p-6 md:p-8 lg:p-10 shadow-sm">
                {/* First Paragraph */}
                <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                  Zabieg usuwania zmian skórnych wykonywany jest w znieczuleniu miejscowym, co zapewnia pełny komfort podczas procedury. Chirurg precyzyjnie usuwa zmianę wraz z odpowiednim marginesem zdrowych tkanek, co jest istotne dla prawidłowego gojenia i ewentualnej diagnostyki histopatologicznej.
                </p>

                {/* Second Paragraph */}
                <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                  Po zabiegu zakładane są szwy, które są usuwane po około 7-14 dniach, w zależności od lokalizacji zmiany. Większość zabiegów trwa od 15 do 30 minut i można wrócić do codziennych aktywności tego samego dnia.
                </p>

                {/* Highlighted Info Box */}
                <div className="bg-white rounded-lg p-6 md:p-8 mt-6">
                  <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed font-semibold">
                    Wszystkie usunięte zmiany są kierowane do badania histopatologicznego, co pozwala na potwierdzenie rozpoznania i wykluczenie zmian nowotworowych.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Doctor Info */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="doctor-heading">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 sm:mb-8">
                <h2 
                  id="doctor-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Lekarz specjalista CM7 – Chirurg
                </h2>
              </div>

              {/* Doctor Card - White with shadow */}
              <div className="bg-white rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-10 items-start">
                  {/* Left Side - Image */}
                  <div className="flex-shrink-0">
                    <img
                      src="/assets/static-assets/mikel_doctor.png"
                      alt="lek. Michał Szczubkowski - Chirurg"
                      className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Right Side - Doctor Info */}
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      lek. Michał Szczubkowski
                    </h3>
                    <p className="text-teal-600 text-lg sm:text-xl md:text-2xl font-medium mb-4 sm:mb-6">
                      Chirurg
                    </p>

                    {/* Biography */}
                    <div className="space-y-4 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                      <p>
                        Doświadczony chirurg z wieloletnią praktyką w zakresie chirurgii ogólnej i usuwania zmian skórnych. Specjalizuje się w precyzyjnym usuwaniu znamion, brodawek, kaszaków i innych zmian skórnych z zachowaniem estetyki i bezpieczeństwa.
                      </p>
                      <p>
                        Indywidualne podejście do każdego pacjenta oraz nowoczesne techniki chirurgiczne pozwalają na skuteczne i bezpieczne usuwanie zmian skórnych z minimalnym ryzykiem powikłań.
                      </p>
                    </div>

                    {/* Action Buttons - Side by side */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <a
                        href="/lekarze/michal-szczubkowski"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors text-center text-sm sm:text-base"
                      >
                        Zobacz Chirurga
                      </a>
                      <a
                        href="#appointment-section"
                        className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-50 transition-colors text-center text-sm sm:text-base"
                      >
                        Umów się na wizytę
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Types of Skin Lesions */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="lesions-heading">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="lesions-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Z jakimi zmianami skórnymi zgłosić się do chirurga?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto mb-4 sm:mb-6"></div>
                <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                  Kliknij, by dowiedzieć się więcej:
                </p>
              </div>

              {/* Lesions Grid - 2 rows x 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Lesion Cards */}
                <button className="bg-gray-100 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center gap-3 group">
                  <span className="text-teal-600 text-2xl font-bold group-hover:text-teal-700">+</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Znamiona barwnikowe</span>
                </button>

                <button className="bg-gray-100 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center gap-3 group">
                  <span className="text-teal-600 text-2xl font-bold group-hover:text-teal-700">+</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Brodawek</span>
                </button>

                <button className="bg-gray-100 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center gap-3 group">
                  <span className="text-teal-600 text-2xl font-bold group-hover:text-teal-700">+</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Kaszaków</span>
                </button>

                <button className="bg-gray-100 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center gap-3 group">
                  <span className="text-teal-600 text-2xl font-bold group-hover:text-teal-700">+</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Tłuszczaków</span>
                </button>

                <button className="bg-gray-100 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center gap-3 group">
                  <span className="text-teal-600 text-2xl font-bold group-hover:text-teal-700">+</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Naczyniaków</span>
                </button>

                <button className="bg-gray-100 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center gap-3 group">
                  <span className="text-teal-600 text-2xl font-bold group-hover:text-teal-700">+</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Torbieli</span>
                </button>

                <button className="bg-gray-100 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center gap-3 group">
                  <span className="text-teal-600 text-2xl font-bold group-hover:text-teal-700">+</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Błoniaków</span>
                </button>

                <button className="bg-gray-100 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center justify-center gap-3 group">
                  <span className="text-teal-600 text-2xl font-bold group-hover:text-teal-700">+</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Innych zmian skórnych</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 6: FAQ */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="faq-heading">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="faq-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Najczęściej zadawane pytania o usuwaniu zmian skórnych
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* FAQ Item 1 */}
                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy usuwanie zmian skórnych boli?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Zabieg wykonywany jest w znieczuleniu miejscowym, więc jest bezbolesny. Możliwe jest jedynie lekkie uczucie ukłucia podczas podawania znieczulenia.
                  </p>
                </div>

                {/* FAQ Item 2 */}
                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Jak długo trwa zabieg?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Większość zabiegów usuwania zmian skórnych trwa od 15 do 30 minut, w zależności od rozmiaru i lokalizacji zmiany.
                  </p>
                </div>

                {/* FAQ Item 3 */}
                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy po zabiegu zostanie blizna?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Chirurg wykonuje zabieg z dbałością o estetykę, a blizna jest zwykle minimalna i z czasem staje się mniej widoczna. Wszystkie usunięte zmiany są kierowane do badania histopatologicznego.
                  </p>
                </div>

                {/* FAQ Item 4 */}
                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Kiedy można wrócić do normalnej aktywności?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Większość pacjentów może wrócić do codziennych aktywności tego samego dnia. Należy unikać intensywnego wysiłku fizycznego przez kilka dni po zabiegu.
                  </p>
                </div>

                {/* FAQ Item 5 */}
                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy potrzebne jest skierowanie?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Nie, skierowanie nie jest wymagane. Przyjmujemy pacjentów prywatnie, bez skierowania od lekarza rodzinnego.
                  </p>
                </div>

                {/* FAQ Item 6 */}
                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy usunięta zmiana jest badana?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Tak, wszystkie usunięte zmiany są kierowane do badania histopatologicznego, co pozwala na potwierdzenie rozpoznania i wykluczenie zmian nowotworowych.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Location/Service Area */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="location-heading">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="location-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Usuwanie zmian skórnych blisko Ciebie – Skarżysko-Kamienna, Kielce, Radom
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Content Block - White Card */}
              <div className="bg-primary-lightest rounded-lg p-6 md:p-8 lg:p-10 shadow-sm max-w-4xl mx-auto">
                <div className="space-y-4 sm:space-y-6 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  <p>
                    Choć Centrum Medyczne 7 mieści się w Skarżysku-Kamiennej, z usług chirurgicznego usuwania zmian skórnych regularnie korzystają pacjenci z całego regionu – m.in. z <strong>Kielc, Radomia, Starachowic, Szydłowca, Ostrowca</strong> i okolicznych miejscowości.
                  </p>
                  
                  <p>
                    Pacjenci doceniają dogodny dojazd, wygodną rejestrację online oraz brak kolejek. Zabiegi wykonywane są przez doświadczonych chirurgów z dbałością o estetykę i bezpieczeństwo.
                  </p>
                </div>

                {/* Call to Action */}
                <div className="mt-6 sm:mt-8 text-center">
                  <a
                    href="#appointment-section"
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm sm:text-base md:text-lg"
                  >
                    Umów się na wizytę
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Final Section: Trusted by Patients */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="trusted-heading">
            <div className="max-w-6xl mx-auto text-center">
              <h2 
                id="trusted-heading"
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
              >
                Zaufali nam pacjenci z całego regionu
              </h2>

              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 max-w-4xl mx-auto">
                Naszym priorytetem jest zrozumienie, dyskrecja i skuteczność leczenia. Chirurgiczne usuwanie zmian skórnych w CM7 wybierają pacjenci m.in. z Radomia, Kielc, Starachowic i Szydłowca. Chirurg Michał Szczubkowski oraz Centrum Medyczne 7 posiadają wysokie oceny w Google i ZnanyLekarz.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                {/* Call Button - Teal */}
                <button
                  onClick={() => window.location.href = "tel:797097487"}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                >
                  <FaPhone className="text-white" />
                  Zadzwoń teraz
                </button>

                {/* Book Appointment Button - White with Teal Border */}
                <a
                  href="#appointment-section"
                  className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base text-center"
                >
                  <FaCalendar className="text-teal-600" />
                  Umów wizytę online
                </a>

                {/* Google Reviews Button - White with Teal Border */}
                <a
                  href="https://share.google/BzJ9Tr3GTdOFZuw6C"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base text-center"
                >
                  <FaStar className="text-teal-600" />
                  Zobacz opinie Google
                </a>
              </div>

              {/* Rating Display */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                {/* Five Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-lg sm:text-xl fill-yellow-400" />
                  ))}
                </div>
                {/* Rating Text */}
                <span className="text-gray-900 font-semibold text-base sm:text-lg">5.0 ocena w Google</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default SkinLesionRemovalPage;

