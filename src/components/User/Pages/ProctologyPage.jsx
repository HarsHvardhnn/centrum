import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaCalendar, FaShieldAlt, FaCheck, FaMapMarkerAlt } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import phoneDialIcon from '../../../assets/phone_dial.png';

const ProctologyPage = () => {
  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": "Konsultacja proktologiczna - leczenie hemoroidów i chorób odbytu",
    "description": "Proktolog w Skarżysku-Kamiennej. Leczenie hemoroidów i chorób odbytu. Prywatne konsultacje proktologiczne bez skierowania.",
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
    "medicalSpecialty": "Proctology",
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
    "jobTitle": "Chirurg, Proktolog",
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
    "medicalSpecialty": "Proctology",
    "url": "https://centrummedyczne7.pl/proktolog"
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Kiedy warto udać się do proktologa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Warto skonsultować się z proktologiem przy objawach takich jak krwawienie z odbytu, ból, świąd, pieczenie, guzki, problemy z wypróżnianiem lub uczucie niepełnego wypróżnienia."
        }
      },
      {
        "@type": "Question",
        "name": "Czy proktolog leczy hemoroidy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, leczenie hemoroidów to jedna z najczęstszych przyczyn wizyty u proktologa. Lekarz dobierze odpowiednią metodę leczenia - od farmakoterapii po małoinwazyjne zabiegi."
        }
      },
      {
        "@type": "Question",
        "name": "Ile kosztuje wizyta u proktologa w Skarżysku-Kamiennej?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cena standardowej konsultacji proktologicznej w naszej placówce to 300 zł. Koszt może się różnić w zależności od zakresu wizyty i ewentualnych dodatkowych zaleceń."
        }
      },
      {
        "@type": "Question",
        "name": "Czy proktolog w Skarżysku-Kamiennej przyjmuje prywatnie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, konsultacje proktologiczne w Centrum Medycznym 7 odbywają się wyłącznie prywatnie - bez potrzeby skierowania i bez kolejek."
        }
      },
      {
        "@type": "Question",
        "name": "Czy na wizytę u proktologa trzeba mieć skierowanie?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nie, w naszej placówce przyjmujemy pacjentów wyłącznie prywatnie - bez potrzeby posiadania skierowania od lekarza rodzinnego."
        }
      },
      {
        "@type": "Question",
        "name": "Czy do proktologa w Skarżysku-Kamiennej mogą zgłaszać się pacjenci z innych miast?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak, przyjmujemy pacjentów nie tylko ze Skarżyska-Kamiennej, ale również z Kielc, Radomia, Starachowic, Szydłowca, Końskich i całego województwa świętokrzyskiego czy mazowieckiego."
        }
      },
      {
        "@type": "Question",
        "name": "Czy proktolog przyjmuje prywatnie w województwie świętokrzyskim i mazowieckim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak - w woj. świętokrzyskim prywatne konsultacje proktologiczne oferuje m.in. Centrum Medyczne 7 w Skarżysku-Kamiennej. Przyjmujemy pacjentów z całego regionu: m.in. z Kielc, Ostrowca Świętokrzyskiego, Starachowic, Sandomierza, Końskich i Suchedniowa."
        }
      }
    ]
  };

  return (
    <>
      <MetaTags 
        title="Proktolog Skarżysko-Kamienna, świętokrzyskie – leczenie hemoroidów i chorób odbytu – CM7"
        description="Proktolog w Skarżysku-Kamiennej. Leczenie hemoroidów i chorób odbytu. Prywatne konsultacje proktologiczne bez skierowania. Umów wizytę u proktologa."
        path="/proktolog"
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
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0 px-4 md:px-0">
                {/* Teal Pill Tag */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                    Prywatnie, bez skierowania
                  </span>
                </div>

                {/* Main Heading */}
                <h2 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6">
                  <span className="block text-teal-600">Proktolog</span>
                  <span className="block text-teal-600">Skarżysko-Kamienna,</span>
                  <span className="block text-gray-900">świętokrzyskie</span>
                  <span className="block text-gray-900">– leczenie hemoroidów</span>
                  <span className="block text-gray-900">i chorób odbytu</span>
                </h2>

                {/* Description Paragraph */}
                <div className="mb-4 sm:mb-6 text-gray-700 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
                  <p>
                    Profesjonalna diagnostyka i leczenie chorób odbytu i odbytnicy. Konsultacje prywatne bez skierowania w Poradni Proktologicznej Centrum Medyczne 7.
                  </p>
                </div>

                {/* Feature Items */}
                <div className="mb-4 sm:mb-6 px-4 md:px-0">
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
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 px-4 md:px-0">
                  <button 
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg transition-colors text-sm sm:text-base md:text-lg"
                  >
                    Umów wizytę u Proktologa
                  </button>
                  <a
                    href="/lekarze/michal-szczubkowski"
                    className="bg-white border-2 border-teal-600 text-teal-600 font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg text-center"
                  >
                    Zobacz Proktologa
                  </a>
                </div>

                {/* Google Rating */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-4 md:px-0">
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
                    src="/assets/static-assets/proktolog_section_1.png"
                    alt="Proktolog Skarżysko-Kamienna - Centrum Medyczne 7"
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
          
          {/* Section 2: What is Proctology */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="what-is-proctology-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <h2 
                id="what-is-proctology-heading"
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6"
              >
                Czym zajmuje się proktolog?
              </h2>

              {/* Two Paragraphs */}
              <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                Proktolog to lekarz specjalista zajmujący się diagnostyką i leczeniem chorób odbytu, odbytnicy oraz okolicy okołoodbytowej. W naszej poradni proktologicznej w Skarżysku-Kamiennej oferujemy kompleksową opiekę medyczną w zakresie proktologii.
              </p>
              <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                Nasze doświadczenie w leczeniu chorób proktologicznych pozwala na skuteczną diagnostykę i terapię różnorodnych schorzeń. Zapewniamy profesjonalną opiekę medyczną w komfortowych warunkach, z poszanowaniem dyskrecji pacjenta.
              </p>

              {/* Sub-heading */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Najczęściej leczone schorzenia proktologiczne:
              </h3>

              {/* White Box with Two-column List */}
              <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  {/* Left Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mt-0.5">
                        <img 
                          src="/stethoscope.png" 
                          alt="" 
                          role="presentation"
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                        />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">hemoroidy (żylaki odbytu)</span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mt-0.5">
                        <img 
                          src="/stethoscope.png" 
                          alt="" 
                          role="presentation"
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                        />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">szczelina odbytu</span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mt-0.5">
                        <img 
                          src="/stethoscope.png" 
                          alt="" 
                          role="presentation"
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                        />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">przetoka okołoodbytowa</span>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mt-0.5">
                        <img 
                          src="/stethoscope.png" 
                          alt="" 
                          role="presentation"
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                        />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">ropień odbytu</span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mt-0.5">
                        <img 
                          src="/stethoscope.png" 
                          alt="" 
                          role="presentation"
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                        />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">krwawienie z odbytu</span>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mt-0.5">
                        <img 
                          src="/stethoscope.png" 
                          alt="" 
                          role="presentation"
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                        />
                      </div>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">zmiany zapalne i nowotworowe (diagnostyka)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Symptoms */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="symptoms-heading">
            <div className="max-w-6xl mx-auto">
              <h2 
                id="symptoms-heading"
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
              >
                Objawy, z którymi warto zgłosić się do proktologa
              </h2>

              <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                Nie ignoruj niepokojących objawów. Wczesna diagnostyka i leczenie chorób proktologicznych znacznie poprawia rokowanie i komfort życia.
              </p>

              {/* Symptoms Cards Grid - 2 columns, 3 rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
                {/* Card 1 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-600 rounded-sm transform rotate-45"></div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">ból i pieczenie odbytu</h3>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Uporczywy ból lub pieczenie w okolicy odbytu może wskazywać na różne schorzenia proktologiczne.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-600 rounded-full"></div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">krwawienie przy wypróżnianiu</h3>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Krew w stolcu lub na papierze toaletowym wymaga pilnej konsultacji proktologicznej.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-600 rounded-full"></div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">świąd okolicy odbytu</h3>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Przewlekły świąd może być objawem infekcji lub innych problemów proktologicznych.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-600 rounded-full"></div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">guzki lub obrzęk</h3>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Wyczuwalne guzki lub obrzęk w okolicy odbytu wymagają diagnostyki specjalistycznej.
                  </p>
                </div>

                {/* Card 5 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-600 rounded-full"></div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">uczucie niepełnego wypróżnienia</h3>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Stały dyskomfort i uczucie niepełnego opróżnienia jelit może wskazywać na problemy proktologiczne.
                  </p>
                </div>

                {/* Card 6 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-600 rounded-full"></div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">śluz lub ropa w kale</h3>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    Obecność śluzu lub ropy w stolcu może sygnalizować stan zapalny wymagający leczenia.
                  </p>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="mt-8 sm:mt-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Cennik usług-Poradnia Proktologiczna
                </h2>
                
                <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                  Podane ceny mają charakter orientacyjny. Dokładny koszt leczenia ustalany jest po konsultacji w CM7 Skarżysko.
                </p>

                <div className="mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-300">
                    Proktologia
                  </h3>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-200">
                    <a 
                      href="/konsultacja-proktologiczna"
                      className="text-gray-800 text-sm sm:text-base md:text-lg hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      Konsultacja proktologiczna
                    </a>
                    <span className="text-teal-700 font-bold text-lg sm:text-xl md:text-2xl">300 zł</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-200">
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">Konsultacja proktologiczna z badaniem per rectum</span>
                    <span className="text-teal-700 font-bold text-lg sm:text-xl md:text-2xl">350 zł</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-200">
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">Zaopatrzenie drobnych ran i zmian okolicy odbytu</span>
                    <span className="text-teal-700 font-bold text-lg sm:text-xl md:text-2xl">od 500 zł</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-200">
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">Usunięcie polipa</span>
                    <span className="text-teal-700 font-bold text-lg sm:text-xl md:text-2xl">od 500 zł</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">Operacja przetoki odbytu</span>
                    <span className="text-teal-700 font-bold text-lg sm:text-xl md:text-2xl">od 3000 zł</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Doctor Info */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="doctor-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="mb-6 sm:mb-8">
                <h2 
                  id="doctor-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Lekarz specjalista CM7 – Chirurg i Proktolog
                </h2>
              </div>

              {/* Doctor Card - White with shadow */}
              <div className="bg-white rounded-lg p-6 sm:p-8 md:p-10 lg:p-12 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-10 items-start">
                  {/* Left Side - Image */}
                  <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-start">
                    <img
                      src="/assets/static-assets/mikel_doctor.png"
                      alt="lek. Michał Szczubkowski - Proktolog"
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
                      Chirurg, Proktolog
                    </p>

                    {/* Biography */}
                    <div className="space-y-4 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                      <p>
                        Doświadczony lekarz specjalista chirurg z wieloletnią praktyką w zakresie proktologii. Specjalizuje się w diagnostyce i leczeniu chorób odbytu i odbytnicy, zapewniając pacjentom profesjonalną opiekę medyczną w atmosferze pełnej dyskrecji.
                      </p>
                      <p>
                        Indywidualne podejście do każdego pacjenta oraz nowoczesne metody diagnostyczne pozwalają na skuteczne leczenie nawet najbardziej delikatnych problemów proktologicznych.
                      </p>
                    </div>

                    {/* Action Buttons - Side by side */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <a
                        href="/lekarze/michal-szczubkowski"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors text-center text-sm sm:text-base"
                      >
                        Zobacz Proktologa
                      </a>
                      <button
                        onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                        className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-teal-50 transition-colors text-center text-sm sm:text-base"
                      >
                        Umów wizytę u Proktologa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Patient Trust */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="trust-heading">
            <div className="max-w-4xl mx-auto">
              <h2 
                id="trust-heading"
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
              >
                Zaufanie pacjentów z regionu
              </h2>

              <div className="space-y-4 sm:space-y-5 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                <p>
                  Nasza poradnia proktologiczna cieszy się zaufaniem pacjentów z całego województwa świętokrzyskiego. Wysokie oceny w Google oraz pozytywne opinie pacjentów potwierdzają jakość świadczonych przez nas usług medycznych w zakresie proktologii.
                </p>
                <p>
                  Dyskrecja, profesjonalizm i indywidualne podejście do każdego przypadku to podstawy naszej pracy. Pacjenci doceniają komfortowe warunki leczenia oraz możliwość szybkiego uzyskania pomocy medycznej bez długiego oczekiwania na wizytę.
                </p>
                <p>
                  Obsługujemy pacjentów z Skarżyska-Kamiennej, Kielc, Radomia, Starachowic, Szydłowca i okolicznych miejscowości, zapewniając im dostęp do specjalistycznej opieki proktologicznej na najwyższym poziomie.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Contact */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="contact-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="contact-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Proktolog Skarżysko-Kamienna - kontakt
                </h2>
              </div>

              {/* Two Cards Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Card - Address */}
                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Adres Poradni Proktologicznej
                  </h3>
                  <div className="space-y-2 mb-6 sm:mb-8">
                    <p className="text-gray-800 text-sm sm:text-base md:text-lg font-medium">
                      Centrum Medyczne 7
                    </p>
                    <p className="text-gray-800 text-sm sm:text-base md:text-lg">
                      ul. Powstańców Warszawy 7/1.5
                    </p>
                    <p className="text-gray-800 text-sm sm:text-base md:text-lg">
                      26-110 Skarżysko-Kamienna
                    </p>
                  </div>
                  
                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => window.location.href = "tel:+48797097487"}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <img src={phoneDialIcon} alt="Phone" className="w-5 h-5" />
                      Zadzwoń teraz
                    </button>
                    <button
                      onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                      className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base text-center"
                    >
                      Umów wizytę
                    </button>
                  </div>
                </div>

                {/* Right Card - Regions Served */}
                <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Obsługiwane regiony
                  </h3>
                  <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                    Przyjmujemy pacjentów z Kielc, Radomia, Starachowic, Ostrowca Świętokrzyskiego, Szydłowca oraz okolicznych miejscowości województwa świętokrzyskiego.
                  </p>
                  
                  {/* Cities List with Map Pin Icons - 2x2 Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FaMapMarkerAlt className="text-teal-600 flex-shrink-0" />
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">Kielce</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FaMapMarkerAlt className="text-teal-600 flex-shrink-0" />
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">Radom</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FaMapMarkerAlt className="text-teal-600 flex-shrink-0" />
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">Starachowice</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FaMapMarkerAlt className="text-teal-600 flex-shrink-0" />
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">Szydłowiec</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: FAQ - Last Section */}
          <section className="mb-12 sm:mb-16 md:mb-20 bg-white py-8 sm:py-12 md:py-16 px-4 sm:px-6" aria-labelledby="faq-heading">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="faq-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Najczęściej zadawane pytania o Proktologii i leczeniu hemoroidów
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                {/* FAQ Item 1 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Kiedy warto udać się do proktologa?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Warto skonsultować się z proktologiem przy objawach takich jak krwawienie z odbytu, ból, świąd, pieczenie, guzki, problemy z wypróżnianiem lub uczucie niepełnego wypróżnienia.
                  </p>
                </div>

                {/* FAQ Item 2 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy proktolog leczy hemoroidy?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Tak, leczenie hemoroidów to jedna z najczęstszych przyczyn wizyty u proktologa. Lekarz dobierze odpowiednią metodę leczenia - od farmakoterapii po małoinwazyjne zabiegi.
                  </p>
                </div>

                {/* FAQ Item 3 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Ile kosztuje wizyta u proktologa w Skarżysku-Kamiennej?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Cena standardowej konsultacji proktologicznej w naszej placówce to 300 zł. Koszt może się różnić w zależności od zakresu wizyty i ewentualnych dodatkowych zaleceń.
                  </p>
                </div>

                {/* FAQ Item 4 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy proktolog w Skarżysku-Kamiennej przyjmuje prywatnie?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Tak, konsultacje proktologiczne w Centrum Medycznym 7 odbywają się wyłącznie prywatnie - bez potrzeby skierowania i bez kolejek.
                  </p>
                </div>

                {/* FAQ Item 5 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy na wizytę u proktologa trzeba mieć skierowanie?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Nie, w naszej placówce przyjmujemy pacjentów wyłącznie prywatnie - bez potrzeby posiadania skierowania od lekarza rodzinnego.
                  </p>
                </div>

                {/* FAQ Item 6 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy do proktologa w Skarżysku-Kamiennej mogą zgłaszać się pacjenci z innych miast?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Tak, przyjmujemy pacjentów nie tylko ze Skarżyska-Kamiennej, ale również z Kielc, Radomia, Starachowic, Szydłowca, Końskich i całego województwa świętokrzyskiego czy mazowieckiego.
                  </p>
                </div>

                {/* FAQ Item 7 */}
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 md:p-8">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Czy proktolog przyjmuje prywatnie w województwie świętokrzyskim i mazowieckim?
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    Tak - w woj. świętokrzyskim prywatne konsultacje proktologiczne oferuje m.in. Centrum Medyczne 7 w Skarżysku-Kamiennej. Przyjmujemy pacjentów z całego regionu: m.in. z Kielc, Ostrowca Świętokrzyskiego, Starachowic, Sandomierza, Końskich i Suchedniowa.
                  </p>
                </div>
              </div>
            </div>
          </section>


        </div>
      </main>
    </>
  );
};

export default ProctologyPage;

