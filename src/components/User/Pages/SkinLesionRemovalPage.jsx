import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaCalendar, FaShieldAlt, FaCheck, FaArrowRight, FaPhone } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";

const SkinLesionRemovalPage = () => {
  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": "Chirurgiczne usuwanie zmian skórnych",
    "description": "Chirurgiczne usuwanie zmian skórnych w Centrum Medycznym 7. Profesjonalne usuwanie znamion, brodawek, kaszaków i innych zmian skórnych.",
    "provider": {
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
    "medicalSpecialty": "Dermatologic Surgery",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceType": "Private consultation",
      "availableLanguage": "pl"
    }
  };

  const physicianData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "lek. Michał Szczubkowski",
    "jobTitle": "Chirurg",
    "worksFor": {
      "@type": "MedicalBusiness",
      "name": "Centrum Medyczne 7",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Skarżysko-Kamienna",
        "addressRegion": "świętokrzyskie",
        "addressCountry": "PL"
      }
    },
    "medicalSpecialty": "Dermatologic Surgery",
    "url": "https://centrummedyczne7.pl/usuwanie-zmian-skornych"
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Czy usuwanie zmian skórnych boli?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zabieg wykonywany jest w znieczuleniu miejscowym, więc jest bezbolesny. Możliwe jest jedynie lekkie uczucie ukłucia podczas podawania znieczulenia."
        }
      },
      {
        "@type": "Question",
        "name": "Jak długo trwa zabieg?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Większość zabiegów usuwania zmian skórnych trwa od 15 do 30 minut, w zależności od rozmiaru i lokalizacji zmiany."
        }
      },
      {
        "@type": "Question",
        "name": "Czy po zabiegu zostanie blizna?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Chirurg wykonuje zabieg z dbałością o estetykę, a blizna jest zwykle minimalna i z czasem staje się mniej widoczna. Wszystkie usunięte zmiany są kierowane do badania histopatologicznego."
        }
      },
      {
        "@type": "Question",
        "name": "Kiedy można wrócić do normalnej aktywności?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Większość pacjentów może wrócić do codziennych aktywności tego samego dnia. Należy unikać intensywnego wysiłku fizycznego przez kilka dni po zabiegu."
        }
      },
      {
        "@type": "Question",
        "name": "Czy potrzebne jest skierowanie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nie, skierowanie nie jest wymagane. Przyjmujemy pacjentów prywatnie, bez skierowania od lekarza rodzinnego."
        }
      },
      {
        "@type": "Question",
        "name": "Czy usunięta zmiana jest badana?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, wszystkie usunięte zmiany są kierowane do badania histopatologicznego, co pozwala na potwierdzenie rozpoznania i wykluczenie zmian nowotworowych."
        }
      }
    ]
  };

  return (
    <>
      <MetaTags 
        title="Usuwanie zmian skórnych – Skarżysko-Kamienna, Kielce, Radom – CM7"
        description="Chirurgiczne usuwanie zmian skórnych w Centrum Medycznym 7. Profesjonalne usuwanie znamion, brodawek, kaszaków i innych zmian skórnych. Umów wizytę."
        path="/usuwanie-zmian-skornych"
      />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(physicianData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>
      
      <main className="min-h-screen bg-white">
        {/* Hero Section - First Section */}
        <section className="bg-[#F7F9FA] pt-24 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8 xl:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 xl:gap-16">
              {/* Left Side - Text Content */}
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0">
                {/* Teal Pill Tag */}
                <div className="mb-4 px-4 md:px-0">
                  <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                    Prywatnie, bez skierowania
                  </span>
                </div>

                {/* Main Heading */}
                <h2 id="hero-heading" className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6 px-4 md:px-0">
                  <span className="block text-teal-600">Usuwanie zmian</span>
                  <span className="block">
                    <span className="text-teal-600">skórnych – </span>
                    <span className="text-gray-900">chirurgiczne,</span>
                  </span>
                  <span className="block text-gray-900">z oceną</span>
                  <span className="block text-gray-900">histopatologiczną,</span>
                  <span className="block text-gray-900">Skarżysko-Kamienna</span>
                </h2>

                {/* Description Paragraphs */}
                <div className="space-y-4 mb-6 text-gray-700 text-base md:text-lg leading-relaxed px-4 md:px-0">
                  <p>
                    Masz niepokojące znamię, kaszak, włókniak lub inną zmianę skórną? Zdiagnozuj ją w Centrum Medycznym 7 w woj. świętokrzyskim, gdzie wykonujemy chirurgiczne usuwanie zmian skórnych w bezpiecznych warunkach ambulatoryjnych.
                  </p>
                  <p>
                    Zabieg wykonywany jest przez doświadczonego chirurga, po konsultacji i kwalifikacji medycznej. Każda usunięta zmiana skórna jest rutynowo kierowana do badania histopatologicznego, co zapewnia rzetelną ocenę i bezpieczeństwo pacjenta.
                  </p>
                  <p>
                    Przyjmujemy pacjentów prywatnie, bez skierowania. Z naszych usług korzystają pacjenci ze Skarżyska-Kamiennej oraz okolicznych miejscowości, m.in. z Kielc, Starachowic i Radomia.
                  </p>
                </div>

                {/* Price Box */}
                <div className="bg-primary-lighter rounded-lg px-6 py-4 mb-6 flex items-center justify-between mx-4 md:mx-0">
                  <span className="text-gray-800 font-medium text-sm md:text-base">CENA:</span>
                  <span className="text-teal-700 font-bold text-xl md:text-2xl">od 500 zł</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 px-4 md:px-0">
                  <button 
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition-colors text-sm sm:text-base md:text-lg"
                  >
                    Umów wizytę
                  </button>
                  <button
                    onClick={() => window.location.href = "tel:+48797097487"}
                    className="bg-white border-2 border-teal-600 text-teal-600 font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg text-center"
                  >
                    <FaPhone className="text-teal-600 w-5 h-5 scale-x-[-1]" />
                    Zadzwoń teraz
                  </button>
                </div>

                {/* Google Rating */}
                <div className="px-4 md:px-0">
                <a
                  href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skarżysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dziecięcy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-wrap items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {/* Five Stars */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-sm sm:text-base fill-yellow-400" />
                    ))}
                  </div>
                  {/* Rating Text */}
                  <span className="text-gray-900 font-semibold text-sm sm:text-base">5.0</span>
                  {/* Link Text */}
                  <span className="text-gray-900 font-normal text-sm sm:text-base ml-1 hover:text-teal-600">
                    Zobacz opinie Google
                  </span>
                </a>
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
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="when-to-visit-heading">
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
                Jeśli zauważysz niepokojącą zmianę na skórze lub zmianę wyglądu pieprzyka, nie odkładaj konsultacji chirurgicznej.
              </p>

              {/* Symptoms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-6 mb-8">
                {/* Left Column */}
                <div className="bg-gray-100 rounded-t-lg md:rounded-lg p-6">
                  <ul className="space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">zmiana kształtu, koloru lub wielkości pieprzyka</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">krwawienie, sączenie lub bolesność zmiany skórnej</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">szybki wzrost znamienia lub guzka pod skórą</span>
                    </li>
                  </ul>
                </div>

                {/* Right Column */}
                <div className="bg-gray-100 rounded-b-lg md:rounded-lg p-6">
                  <ul className="space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">kaszaki, tłuszczaki, brodawki do usunięcia</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">zmiany skórne drażnione przez odzież lub golenie</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-base sm:text-lg md:text-xl">podejrzenie zmiany wymagającej oceny histopatologiczne</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Info Box */}
              <div className="bg-teal-50 rounded-lg p-6 md:p-8">
                <p className="text-gray-800 text-base md:text-lg leading-relaxed text-left">
                  Wczesne chirurgiczne usunięcie zmiany skórnej i jej badanie histopatologiczne pozwala na dokładną diagnostykę i zwiększa bezpieczeństwo pacjenta.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How Does Procedure Look Like */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-teal-50 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="procedure-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
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
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-md">
                {/* First Paragraph */}
                <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 text-left">
                  Podczas wizyty chirurg przeprowadza szczegółowy wywiad medyczny oraz ocenę zmiany skórnej. Następnie, po kwalifikacji, wykonywany jest zabieg chirurgicznego usunięcia zmiany skórnej w znieczuleniu miejscowym.
                </p>

                {/* Second Paragraph */}
                <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 text-left">
                  Każda usunięta zmiana — niezależnie od tego, czy jest to pieprzyk, znamię, kaszak lub inna zmiana skórna — przekazywana jest do badania histopatologicznego.
                </p>

                {/* Highlighted Info Box */}
                <div className="bg-teal-50 rounded-lg p-6 md:p-8 mt-6">
                  <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed text-center">
                    Zabieg usuwania zmian skórnych jest krótki, wykonywany w znieczuleniu miejscowym i zazwyczaj nie powoduje bólu. Całość odbywa się w warunkach ambulatoryjnych, z zachowaniem pełnego bezpieczeństwa i komfortu pacjenta.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Doctor Info */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="doctor-heading">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="doctor-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Zabiegi chirurgicznego usuwania zmian skórnych wykonuje doświadczony chirurg
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Doctor Card - Light gray with shadow */}
              <div className="bg-gray-50 rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 shadow-md">
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-10 items-start">
                  {/* Right Side - Doctor Info (First on mobile, second on desktop) */}
                  <div className="flex-1 order-1 md:order-2">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      lek. Michał Szczubkowski
                    </h3>
                    <p className="text-teal-600 text-lg sm:text-xl md:text-2xl font-medium mb-4 sm:mb-6">
                      Specjalista Chirurg Ogólnej
                    </p>

                    {/* Biography */}
                    <div className="space-y-4 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                      <p>
                        Lek. Michał Szczubkowski jest chirurgiem z wieloletnim doświadczeniem w diagnostyce i chirurgicznym usuwaniu zmian skórnych.
                      </p>
                      <p>
                        Wykonuje zabiegi usuwania znamion, pieprzyków, kaszaków oraz innych zmian skórnych wymagających oceny specjalisty.
                      </p>
                      <p>
                        Każdy zabieg poprzedzony jest kwalifikacją lekarską, a usunięte zmiany rutynowo przekazywane są do badania histopatologicznego.
                      </p>
                      <p>
                        W swojej praktyce stawia na precyzję, bezpieczeństwo pacjenta oraz leczenie zgodne z aktualnymi standardami chirurgii ambulatoryjnej.
                      </p>
                    </div>
                  </div>

                  {/* Left Side - Image and Button (Second on mobile, first on desktop) */}
                  <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto order-2 md:order-1">
                    <img
                      src="/assets/static-assets/mikel_doctor.png"
                      alt="lek. Michał Szczubkowski - Chirurg"
                      className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full object-cover mb-0 md:mb-4 border-4 border-white shadow-md"
                      loading="lazy"
                    />
                    {/* CTA Button - Hidden on mobile, shown on desktop */}
                    <a
                      href="/lekarze/michal-szczubkowski"
                      className="hidden md:block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors text-center text-sm sm:text-base w-full md:w-auto"
                    >
                      Zobacz Chirurga
                    </a>
                  </div>
                </div>
                
                {/* CTA Button - Mobile only, at the end */}
                <div className="mt-6 md:hidden">
                  <a
                    href="/lekarze/michal-szczubkowski"
                    className="block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors text-center text-sm sm:text-base w-full"
                  >
                    Zobacz Chirurga
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Types of Skin Lesions */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-teal-50 py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="lesions-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="lesions-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Z jakimi zmianami skórnymi zgłosić się do chirurga?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto mb-4 sm:mb-6"></div>
                <p className="text-gray-700 text-sm sm:text-base md:text-lg">
                  Kliknij, aby dowiedzieć się więcej o danym rodzaju zmiany i możliwościach leczenia chirurgicznego.
                </p>
              </div>

              {/* Lesions Grid - 2 rows x 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Lesion Cards */}
                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow flex items-center gap-3 group">
                  <FaArrowRight className="text-gray-800 text-lg flex-shrink-0" />
                  <span className="text-gray-800 text-base md:text-lg text-left">Znamiona (pieprzyki)</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow flex items-center gap-3 group">
                  <FaArrowRight className="text-gray-800 text-lg flex-shrink-0" />
                  <span className="text-gray-800 text-base md:text-lg text-left">Kaszaki (torbiele)</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow flex items-center gap-3 group">
                  <FaArrowRight className="text-gray-800 text-lg flex-shrink-0" />
                  <span className="text-gray-800 text-base md:text-lg text-left">Brodawki skórne</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow flex items-center gap-3 group">
                  <FaArrowRight className="text-gray-800 text-lg flex-shrink-0" />
                  <span className="text-gray-800 text-base md:text-lg text-left">Guzki podskórne</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow flex items-center gap-3 group">
                  <FaArrowRight className="text-gray-800 text-lg flex-shrink-0" />
                  <span className="text-gray-800 text-base md:text-lg text-left">Zmiany barwnikowe</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow flex items-center gap-3 group">
                  <FaArrowRight className="text-gray-800 text-lg flex-shrink-0" />
                  <span className="text-gray-800 text-base md:text-lg text-left">Zmiany rosnące</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow flex items-center gap-3 group">
                  <FaArrowRight className="text-gray-800 text-lg flex-shrink-0" />
                  <span className="text-gray-800 text-base md:text-lg text-left">Zmiany bolesne</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow flex items-center gap-3 group">
                  <FaArrowRight className="text-gray-800 text-lg flex-shrink-0" />
                  <span className="text-gray-800 text-base md:text-lg text-left">Zmiany krwawiące</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 6: FAQ */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="faq-heading">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="faq-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Najczęściej zadawane pytania o wycinaniu zmian skórnych
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* FAQ Item 1 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy usuwanie zmian skórnych jest bezpieczne?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Tak. Chirurgiczne usuwanie zmian skórnych wykonywane przez doświadczonego chirurga jest procedurą bezpieczną. Każdy zabieg poprzedza kwalifikacja lekarska.
                  </p>
                </div>

                {/* FAQ Item 2 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy każdy usunięty pieprzyk trafia do histopatologii?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Tak. W Centrum Medyczne 7 wszystkie usunięte zmiany skórne standardowo przekazywane są do badania histopatologicznego, co pozwala na jednoznaczną ocenę charakteru zmiany.
                  </p>
                </div>

                {/* FAQ Item 3 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy usuwanie pieprzyka boli?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Zabieg wykonywany jest w znieczuleniu miejscowym. Pacjent może odczuwać jedynie niewielki dyskomfort podczas podania znieczulenia, natomiast samo usunięcie zmiany jest bezbolesne.
                  </p>
                </div>

                {/* FAQ Item 4 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy po usunięciu zmiany zostaje blizna?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    W przypadku chirurgicznego usuwania zmiany może pozostać niewielka blizna. Chirurg dobiera technikę tak, aby była ona jak najmniej widoczna, a pacjent otrzymuje zalecenia.
                  </p>
                </div>

                {/* FAQ Item 5 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy trzeba się specjalnie przygotować do zabiegu?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Nie. W większości przypadków nie jest wymagane specjalne przygotowanie. Podczas konsultacji chirurg poinformuje pacjenta o ewentualnych zaleceniach indywidualnych.
                  </p>
                </div>

                {/* FAQ Item 6 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Kiedy otrzymam wynik badania histopatologicznego?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Wynik badania histopatologicznego dostępny jest zazwyczaj po kilkunastu dniach. Lekarz omawia wynik z pacjentem i – jeśli to konieczne – zaleca dalsze postępowanie.
                  </p>
                </div>

                {/* FAQ Item 7 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy mogę usunąć kilka zmian skórnych podczas jednej wizyty?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Tak, w wielu przypadkach możliwe jest usunięcie kilku zmian podczas jednej wizyty. Decyzję podejmuje lekarz po ocenie zmian w trakcie konsultacji.
                  </p>
                </div>

                {/* FAQ Item 8 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy w CM7 usuwamy tylko pieprzyki, czy także inne zmiany skórne?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    W Centrum Medyczne 7 usuwamy różne rodzaje zmian skórnych, m.in. znamiona (pieprzyki), kaszaki, brodawki, inne podejrzane zmiany wymagające oceny histopatologicznej.
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
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3"
                >
                  Usuwanie zmian skórnych blisko Ciebie – Skarżysko-Kamienna, Kielce, Radom
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Content Block - White Card */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm max-w-4xl mx-auto">
                <div className="space-y-4 sm:space-y-6 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed text-left">
                  <p>
                    Choć Centrum Medyczne 7 znajduje się w Skarżysku-Kamiennej, z zabiegów chirurgicznego usuwania zmian skórnych z oceną histopatologiczną korzystają pacjenci z całego regionu – m.in. z Kielc, Radomia, Starachowic, Szydłowca czy Ostrowca Świętokrzyskiego.
                  </p>
                  
                  <p>
                    Pacjenci wybierają naszą placówkę ze względu na doświadczonego chirurga, standard przekazywania każdej usuniętej zmiany do badania histopatologicznego, dogodny dojazd oraz możliwość szybkiej rejestracji online bez skierowania.
                  </p>
                </div>

                {/* Call to Action */}
                <div className="mt-6 sm:mt-8 text-center">
                  <button
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm sm:text-base md:text-lg"
                  >
                    Umów wizytę u Chirurga
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Final Section: Trusted by Patients */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="trusted-heading">
            <div className="max-w-6xl mx-auto text-center px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
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
                  onClick={() => window.location.href = "tel:+48797097487"}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                >
                  <FaPhone className="text-white w-5 h-5 scale-x-[-1]" />
                  Zadzwoń teraz
                </button>

                {/* Book Appointment Button - White with Teal Border */}
                <button
                  onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                  className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base text-center"
                >
                  <FaCalendar className="text-teal-600" />
                  Umów wizytę online
                </button>

                {/* Google Reviews Button - White with Teal Border */}
                <a
                  href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
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
                <span className="text-gray-500 font-light text-base sm:text-lg">5.0 ocena w Google</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default SkinLesionRemovalPage;

