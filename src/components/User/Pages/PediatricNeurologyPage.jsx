import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaCalendar, FaShieldAlt, FaCheck, FaPhone } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { Brain, Activity, HeartPulse, Dumbbell, Baby, Bed, Calendar, Star } from "lucide-react";

const PediatricNeurologyPage = () => {
  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": "Konsultacja neurologiczna dla dzieci i młodzieży",
    "description": "Konsultacja neurologiczna dla dzieci i młodzieży w Centrum Medycznym 7. Prywatne wizyty bez skierowania. Neurolog dziecięcy lek. Anna Grabowska.",
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
    "medicalSpecialty": "Pediatric Neurology",
    "availableChannel": {
      "@type": "ServiceChannel",
      "serviceType": "Private consultation",
      "availableLanguage": "pl"
    }
  };

  const physicianData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": "lek. Anna Grabowska",
    "jobTitle": "Neurolog dziecięcy",
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
    "medicalSpecialty": "Pediatric Neurology",
    "url": "https://centrummedyczne7.pl/konsultacja-neurologiczna-dla-dzieci"
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Czy konsultacja neurologiczna dzieci odbywa się bez skierowania?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak. Przyjmujemy pacjentów prywatnie, bez skierowania."
        }
      },
      {
        "@type": "Question",
        "name": "Czy neurolog dziecięcy przyjmuje niemowlęta?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tak. Konsultacje obejmują niemowlęta, dzieci oraz młodzież."
        }
      },
      {
        "@type": "Question",
        "name": "Czy badanie neurologiczne dziecka boli?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nie. Badanie jest bezpieczne i bezbolesne."
        }
      },
      {
        "@type": "Question",
        "name": "Ile trwa konsultacja neurologiczna dzieci?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standardowa wizyta trwa około 30-40 minut."
        }
      },
      {
        "@type": "Question",
        "name": "Czy przed wizytą potrzebne są badania?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nie. W razie potrzeby neurolog dziecięcy zleci badania po konsultacji."
        }
      }
    ]
  };

  return (
    <>
      <MetaTags 
        title="Konsultacja neurologiczna dla dzieci i młodzieży – prywatnie, bez skierowania – CM7"
        description="Konsultacja neurologiczna dla dzieci i młodzieży w Centrum Medycznym 7. Prywatne wizyty bez skierowania. Neurolog dziecięcy lek. Anna Grabowska. Umów wizytę."
        path="/konsultacja-neurologiczna-dla-dzieci"
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
        <section className="bg-[#F7F9FA] pt-12 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20" aria-labelledby="hero-heading">
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

                {/* Main Heading - Full width on mobile */}
                <div className="w-[100vw] relative left-1/2 -translate-x-1/2 md:w-auto md:left-0 md:translate-x-0 mb-6">
                  <div className="px-4 md:px-0">
                    <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                      <span className="block text-teal-600">Konsultacja</span>
                      <span className="block text-teal-600">neurologiczna dla</span>
                      <span className="block text-teal-600">dzieci i młodzieży</span>
                      <span className="block text-gray-900">- prywatnie,</span>
                      <span className="block text-gray-900">bez skierowania</span>
                    </h1>
                  </div>
                </div>

                {/* Description H2 */}
                <div className="space-y-4 mb-6 text-gray-700 text-base md:text-lg leading-relaxed px-4 md:px-0">
                  <h2>
                    Zauważasz u dziecka niepokojące objawy, takie jak tiki nerwowe, bóle głowy, drżenia, napady, problemy ze snem lub opóźnienie rozwoju? Nie zwlekaj – konsultacja neurologiczna dzieci pozwala na rzetelną ocenę stanu zdrowia i dalsze pokierowanie postępowaniem.
                  </h2>
                  <h2>
                    W Centrum Medycznym 7 w Skarżysku-Kamiennej przyjmujemy dzieci i młodzież w ramach prywatnych konsultacji neurologicznych – bez skierowania. Z konsultacji korzystają również pacjenci z Kielc, Radomia, Starachowic i całego regionu.
                  </h2>
                  <h2>
                    Neurolog dziecięcy lek. Anna Grabowska zapewnia dokładny wywiad, badanie neurologiczne oraz jasne omówienie dalszych kroków – w atmosferze bezpieczeństwa i zrozumienia dla dziecka i rodziców.
                  </h2>
                </div>

                {/* Price Box */}
                <div className="bg-primary-lighter rounded-lg px-6 py-4 mb-6 flex items-center justify-between mx-4 md:mx-0">
                  <span className="text-gray-800 font-medium text-sm md:text-base">Cena:</span>
                  <span className="text-teal-700 font-bold text-xl md:text-2xl">300 zł</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 px-4 md:px-0">
                  <button 
                    onClick={() => window.location.href = '/?lekarz=688887149cc810a1bd1d8589&openAppointment=true#appointment-section'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base md:text-lg"
                  >
                    Umów wizytę
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
                <div className="flex items-center gap-2 px-4 md:px-0">
                  {/* Five Stars */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-base fill-yellow-400" />
                    ))}
                  </div>
                  {/* Rating Text */}
                  <span className="text-gray-900 font-semibold text-base">5.0</span>
                  {/* Link Text */}
                  <a 
                    href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-900 font-normal text-base ml-1 cursor-pointer hover:text-teal-600"
                  >
                    Zobacz opinie Google
                  </a>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <img
                    src="/assets/static-assets/Konsultacja-neurologiczna-dla-dzieci.png"
                    alt="Konsultacja neurologiczna dla dzieci - Centrum Medyczne 7"
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
          
          {/* Section 2: When to Schedule Consultation */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="when-to-schedule-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="when-to-schedule-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Kiedy warto umówić dziecko na konsultację neurologiczną?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Introductory Text */}
              <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                Na konsultację neurologiczną dzieci warto zgłosić się, gdy u dziecka występują lub nawracają:
              </p>

              {/* Two-column Bullet List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 sm:mb-8">
                {/* Left Column */}
                <ul className="space-y-3 sm:space-y-4" role="list">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">tiki nerwowe u dzieci (mruganie, ruchy twarzy, barków)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">bóle głowy u dzieci lub migreny</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">napady drgawkowe lub podejrzenie padaczki</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">drżenia kończyn, zaburzenia koordynacji</span>
                  </li>
                </ul>

                {/* Right Column */}
                <ul className="space-y-3 sm:space-y-4" role="list">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">zaburzenia snu</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">opóźnienie rozwoju psychoruchowego</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">wzmożone lub obniżone napięcie mięśniowe</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">niepokojące zmiany w zachowaniu lub rozwoju dziecka</span>
                  </li>
                </ul>
              </div>

              {/* Light Teal Box - Concluding Statement */}
              <div className="bg-primary-lightest rounded-lg p-6 md:p-8 mt-6">
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  Wczesna konsultacja z neurologiem dziecięcym pozwala na szybką diagnostykę i właściwe ukierunkowanie dalszego postępowania.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How Does Consultation Look Like */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="consultation-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="consultation-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Jak wygląda konsultacja neurologiczna dzieci?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Box */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm">
                {/* First Paragraph */}
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                  Konsultacja neurologiczna dzieci rozpoczyna się od dokładnego wywiadu z rodzicami oraz omówienia obserwowanych objawów rozwoju dziecka. Następnie neurolog dziecięcy przeprowadza badanie neurologiczne dostosowane do wieku dziecka.
                </p>

                {/* Second Paragraph */}
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                  W razie potrzeby lekarz może zalecić dalszą diagnostykę lub obserwację. Zakres konsultacji zawsze dopasowany jest do wieku dziecka i zgłaszanych dolegliwości.
                </p>

                {/* Inner Light Teal Box */}
                <div className="bg-teal-50 rounded-lg p-6 md:p-8 mt-6">
                  <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                    Wizyta przebiega w spokojnej atmosferze i nie powinna powodować stresu u dziecka.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Doctor Info */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="doctor-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="doctor-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Konsultację prowadzi neurolog dziecięcy
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Light Gray Doctor Card */}
              <div className="bg-gray-100 rounded-lg p-6 md:p-8 lg:p-10">
                <div className="flex flex-col items-center gap-6 md:gap-8">
                  {/* Doctor Image/Icon - Centered */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-2 rounded-full shadow-md mb-4">
                      <img
                        src="https://res.cloudinary.com/dca740eqo/image/upload/v1756246783/hospital_app/images/fe0qqfuyacegrbhelktu.jpg"
                        alt="lek. Anna Grabowska - Neurolog dziecięcy"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/assets/static-assets/mikel_doctor.png";
                        }}
                      />
                    </div>
                  </div>

                  {/* Doctor Info - Centered */}
                  <div className="flex flex-col items-center text-center max-w-3xl">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      lek. Anna Grabowska
                    </h3>
                    <p className="text-teal-600 text-lg md:text-xl font-medium mb-4 sm:mb-6">
                      Neurolog dziecięcy
                    </p>

                    {/* Practice Description */}
                    <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                      Doświadczona specjalistka zajmująca się diagnostyką i leczeniem chorób układu nerwowego u dzieci i młodzieży. W swojej praktyce klinicznej skupia się na indywidualnym podejściu do dziecka, rzetelnej diagnostyce oraz jasnej komunikacji z rodzicami.
                    </p>

                    {/* Service Area */}
                    <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                      Przyjmuje dzieci z całego regionu województwa świętokrzyskiego, mazowieckiego, w tym pacjentów ze Skarżyska-Kamiennej, Kielc, Radomia i okolicznych miejscowości.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Problems to Report */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="problems-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="problems-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Z jakimi problemami zgłosić się na konsultację neurologiczną dzieci?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                  Kliknij, aby dowiedzieć się więcej
                </p>
              </div>

              {/* Problems Grid - 2x3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {/* Card 1: Tiki nerwowe u dzieci */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-teal-50 rounded-full p-4 mb-4">
                      <Brain className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                    </div>
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg lg:text-xl">
                      Tiki nerwowe u dzieci
                    </h3>
                  </div>
                </div>

                {/* Card 2: Bóle głowy u dzieci */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-teal-50 rounded-full p-4 mb-4">
                      <Activity className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                    </div>
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg lg:text-xl">
                      Bóle głowy u dzieci
                    </h3>
                  </div>
                </div>

                {/* Card 3: Padaczka u dzieci */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-teal-50 rounded-full p-4 mb-4">
                      <HeartPulse className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                    </div>
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg lg:text-xl">
                      Padaczka u dzieci
                    </h3>
                  </div>
                </div>

                {/* Card 4: Zaburzenia napięcia mięśniowego */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-teal-50 rounded-full p-4 mb-4">
                      <Dumbbell className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                    </div>
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg lg:text-xl">
                      Zaburzenia napięcia mięśniowego
                    </h3>
                  </div>
                </div>

                {/* Card 5: Opóźnienie rozwoju psychoruchowego */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-teal-50 rounded-full p-4 mb-4">
                      <Baby className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                    </div>
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg lg:text-xl">
                      Opóźnienie rozwoju psychoruchowego
                    </h3>
                  </div>
                </div>

                {/* Card 6: Zaburzenia snu u dzieci */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-teal-50 rounded-full p-4 mb-4">
                      <Bed className="w-8 h-8 md:w-10 md:h-10 text-teal-600" />
                    </div>
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg lg:text-xl">
                      Zaburzenia snu u dzieci
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: FAQ */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="faq-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-8 sm:mb-12">
                <h2 
                  id="faq-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Najczęściej zadawane pytania przed konsultacją neurologiczną dzieci
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4 sm:space-y-6">
                {/* FAQ Item 1 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 md:mb-3">
                    Czy konsultacja neurologiczna dzieci odbywa się bez skierowania?
                  </h3>
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                    Tak. Przyjmujemy pacjentów prywatnie, bez skierowania.
                  </p>
                </div>

                {/* FAQ Item 2 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 md:mb-3">
                    Czy neurolog dziecięcy przyjmuje niemowlęta?
                  </h3>
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                    Tak. Konsultacje obejmują niemowlęta, dzieci oraz młodzież.
                  </p>
                </div>

                {/* FAQ Item 3 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 md:mb-3">
                    Czy badanie neurologiczne dziecka boli?
                  </h3>
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                    Nie. Badanie jest bezpieczne i bezbolesne.
                  </p>
                </div>

                {/* FAQ Item 4 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 md:mb-3">
                    Ile trwa konsultacja neurologiczna dzieci?
                  </h3>
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                    Standardowa wizyta trwa około 30-40 minut.
                  </p>
                </div>

                {/* FAQ Item 5 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 md:mb-3">
                    Czy przed wizytą potrzebne są badania?
                  </h3>
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed">
                    Nie. W razie potrzeby neurolog dziecięcy zleci badania po konsultacji.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Contact/CTA */}
          <section className="bg-[#F7F9FA] py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="contact-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="contact-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Neurolog dziecięcy blisko Ciebie – Skarżysko- Kamienna, Kielce, Radom i okolice
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Card */}
              <div className="bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10 mb-6 sm:mb-8">
                <div className="space-y-4 sm:space-y-6">
                  {/* Paragraph 1 */}
                  <p className="text-left text-gray-800 text-base md:text-lg leading-relaxed">
                    Choć Centrum Medyczne 7 znajduje się w Skarżysku-Kamiennej, z konsultacji neurologicznych dzieci korzystają również pacjenci z Kielc, Radomia, Starachowic, Ostrowca i okolic.
                  </p>

                  {/* Paragraph 2 */}
                  <p className="text-left text-gray-800 text-base md:text-lg leading-relaxed">
                    Rodzice doceniają łatwy dojazd z każdego miejsca w Polsce, brak kolejek oraz możliwość szybkiej rejestracji online.
                  </p>

                  {/* Paragraph 3 */}
                  <p className="text-left text-gray-800 text-base md:text-lg leading-relaxed">
                    Szukasz neurologa dziecięcego? Umów się na wizytę już dziś!
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <button
                  onClick={() => window.location.href = '/?lekarz=688887149cc810a1bd1d8589&openAppointment=true#appointment-section'}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg"
                >
                  Umów wizytę u neurologa dziecięcego
                </button>
              </div>
            </div>
          </section>

          {/* Section 8: Trusted by Parents */}
          <section className="bg-[#F0F7F7] py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="trust-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="trust-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 sm:mb-8"
                >
                  Zaufali nam rodzice z całego regionu
                </h2>

                {/* Main Content Paragraph */}
                <p className="text-center text-gray-800 text-base md:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-10">
                  Naszym priorytetem są bezpieczeństwo dziecka, dokładna diagnostyka oraz jasna komunikacja z rodzicami. Rodzice doceniają profesjonalne podejście, spokojną atmosferę oraz indywidualne traktowanie każdego nowego pacjenta. Na konsultacje neurologiczne dzieci w CM7 zgłaszają się rodzice m.in. ze <strong>Skarżyska-Kamiennej, Radomia, Kielc, Starachowic i Szydłowca</strong>. Centrum Medyczne 7 oraz lek. Anna Grabowska posiadają bardzo dobre opinie w publicznie dostępnych wizytówkach Google.
                </p>

                {/* Three CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8 sm:mb-10">
                  {/* Button 1: Zadzwoń teraz */}
                  <button
                    onClick={() => window.location.href = 'tel:+48797097487'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2 w-full sm:w-auto"
                  >
                    <FaPhone className="text-teal-600 w-5 h-5 scale-x-[-1]" />
                    Zadzwoń teraz
                  </button>

                  {/* Button 2: Umów wizytę online */}
                  <button
                    onClick={() => window.location.href = '/?lekarz=688887149cc810a1bd1d8589&openAppointment=true#appointment-section'}
                    className="bg-white hover:bg-gray-50 text-teal-600 border-2 border-teal-600 font-semibold px-6 py-3 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Calendar className="w-5 h-5" />
                    Umów wizytę online
                  </button>

                  {/* Button 3: Zobacz opinie Google */}
                  <a
                    href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-gray-50 text-teal-600 border-2 border-teal-600 font-semibold px-6 py-3 rounded-lg text-base md:text-lg transition-colors shadow-md hover:shadow-lg flex items-center gap-2 w-full sm:w-auto"
                  >
                    <Star className="w-5 h-5" />
                    Zobacz opinie Google
                  </a>
                </div>

                {/* Google Rating Display */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 w-6 h-6 md:w-7 md:h-7" />
                    ))}
                  </div>
                  <p className="text-gray-500 text-base md:text-lg font-light">
                    5.0 ocena w Google
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

export default PediatricNeurologyPage;

