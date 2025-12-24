import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaPhone, FaCalendar } from "react-icons/fa";

const ProctologyTestPage = () => {
  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": "Konsultacja proktologiczna",
    "description": "Konsultacja proktologiczna prywatnie, bez skierowania w Centrum Medycznym 7. Umów wizytę u proktologa w Skarżysku-Kamiennej.",
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

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Czy konsultacja proktologiczna wymaga skierowania?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Nie. Przyjmujemy pacjentów prywatnie, bez skierowania."
        }
      },
      {
        "@type": "Question",
        "name": "Jak wygląda wizyta u proktologa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Wizyta rozpoczyna się od szczegółowego wywiadu medycznego, następnie lekarz przeprowadza badanie per rectam. Badanie jest bezpieczne, delikatne i nie powinno powodować bólu."
        }
      }
    ]
  };

  return (
    <>
      <MetaTags 
        title="Konsultacja proktologiczna – prywatnie, bez skierowania, świętokrzyskie – CM7"
        description="Konsultacja proktologiczna prywatnie, bez skierowania w Centrum Medycznym 7. Umów wizytę u proktologa w Skarżysku-Kamiennej."
        path="/uslugi-new-first/test"
      />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqStructuredData)}
      </script>
      
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
                <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                  <span className="block text-teal-600">Konsultacja</span>
                  <span className="block text-teal-600">proktologiczna –</span>
                  <span className="block text-black font-bold">prywatnie,</span>
                  <span className="block text-black font-bold">bez skierowania,</span>
                  <span className="block text-black font-normal text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">świętokrzyskie</span>
                </h1>

                {/* Description Paragraphs */}
                <div className="space-y-4 mb-6 text-gray-700 text-base md:text-lg leading-relaxed">
                  <p>
                    Zmagasz się z bólem, swędzeniem lub pieczeniem w okolicy odbytu? A może zauważyłeś krew podczas wypróżniania? <br />Nie zwlekaj – umów się na prywatną konsultację proktologiczną <br />w Centrum Medycznym 7 w Skarżysku-Kamiennej.
                  </p>
                  <p>
                    Proktolog lek. Michał Szczubkowski przeprowadzi dokładny wywiad, badanie oraz zaproponuje indywidualny plan leczenia – <br />w atmosferze pełnej dyskrecji i zrozumienia.
                  </p>
                  <p>
                    Konsultacja odbywa się zgodnie z aktualnymi standardami medycznymi oraz z zachowaniem pełnej poufności. <br />Nie wymagamy skierowania – przyjmujemy prywatnie.
                  </p>
                </div>

                {/* Price Box */}
                <div className="bg-primary-lighter   rounded-lg px-6 py-4 mb-6 flex items-center justify-between">
                  <span className="text-gray-800 font-medium text-base md:text-lg">Cena konsultacji proktologicznej:</span>
                  <span className="text-teal-700 font-bold text-2xl md:text-3xl">300 zł</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base md:text-lg">
                    Umów wizytę
                  </button>
                  <button 
                    onClick={() => window.location.href = "tel:797097487"}
                    className="bg-white border-2 border-teal-600 text-teal-600 font-semibold py-3 px-6 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-base md:text-lg"
                  >
                    <FaPhone className="text-teal-600" />
                    Zadzwoń teraz
                  </button>
                </div>

                {/* Google Rating */}
                <div className="flex items-center gap-2">
                  {/* Google Logo - Teal */}
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#14B8A6"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#14B8A6"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#14B8A6"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#14B8A6"/>
                    </svg>
                  </div>
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
                    href="https://share.google/BzJ9Tr3GTdOFZuw6C" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 font-medium text-base ml-1 cursor-pointer"
                  >
                    Zobacz opinie Google
                  </a>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center">
                <div className="relative w-full max-w-lg">
                  <img
                    src="/assets/static-assets/section_1_t.png"
                    alt="Konsultacja proktologiczna - Centrum Medyczne 7"
                    className="w-full h-auto object-contain rounded-t-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16" role="main">
          
          {/* Section 2: When to Visit Proctologist */}
          <section className="mb-16 md:mb-20" aria-labelledby="when-to-visit-heading">
            <div className="text-center mb-8">
              <h2 
                id="when-to-visit-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
              >
                Kiedy warto umówić się do proktologa?
              </h2>
              <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
            </div>

            <p className="text-left text-gray-700 text-base md:text-lg mb-8">
              Jeśli zauważasz poniższe objawy lub masz niepokojące dolegliwości - nie zwlekaj z wizytą:
            </p>

            {/* Symptoms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="bg-gray-100 rounded-lg p-6">
                <ul className="space-y-4" role="list">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-lg md:text-xl">krwawienie z odbytu</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-lg md:text-xl">świąd, pieczenie lub ból podczas wypróżniania</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-lg md:text-xl">wyczuwalne guzki w okolicy odbytu</span>
                  </li>
                </ul>
              </div>

              {/* Right Column */}
              <div className="bg-gray-100 rounded-lg p-6">
                <ul className="space-y-4" role="list">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-lg md:text-xl">uczucie niepełnego wypróżnienia</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-lg md:text-xl">problemy z trzymaniem stolca lub gazów</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-lg md:text-xl">podejrzenie hemoroidów, szczeliny odbytu lub innych zmian</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Info Box */}
            <div className="bg-teal-50 rounded-lg p-6 md:p-8">
              <p className="text-gray-800 text-base md:text-lg leading-relaxed text-left font-semibold">
                Objawy te często świadczą o problemach proktologicznych - ich wczesna diagnoza pozwala na szybsze i skuteczniejsze leczenie.
              </p>
            </div>
          </section>

          {/* Section 3: How Does a Visit Look Like */}
          <section className="mb-16 md:mb-20 bg-teal-50 py-12 md:py-16" aria-labelledby="visit-appearance-heading">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
              <div className="text-center mb-8">
                <h2 
                  id="visit-appearance-heading"
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Jak wygląda wizyta u proktologa?
                </h2>
                <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Main Content Box */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm">
                {/* First Paragraph */}
                <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-6">
                  Podczas wizyty lekarz przeprowadza szczegółowy wywiad medyczny, a następnie badanie fizykalne – najczęściej badanie per rectum (przez odbyt). W razie potrzeby może zlecić dodatkowe badania, takie jak anoskopia lub rektoskopia.
                </p>

                {/* Second Paragraph */}
                <p className="text-gray-800 text-base md:text-lg leading-relaxed mb-6">
                  Zakres badania zawsze dostosowywany jest do zgłoszonych objawów i stanu pacjenta.
                </p>

                {/* Highlighted Info Box */}
                <div className="bg-teal-50 rounded-lg p-6 md:p-8 mt-6">
                  <p className="text-gray-800 text-base md:text-lg leading-relaxed font-semibold">
                    Badanie per rectam trwa krótko, wykonywane jest delikatnie i nie powinno powodować bólu. Całość wizyty odbywa się w komfortowych warunkach i z pełnym poszanowaniem intymności pacjenta.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Doctor Info */}
          <section className="mb-16 md:mb-20" aria-labelledby="doctor-heading">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="text-center mb-8">
                <h2 
                  id="doctor-heading"
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Konsultacji proktologicznych udziela lek. Michał Szczubkowski
                </h2>
                <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Doctor Card */}
              <div className="bg-gray-100 rounded-lg p-6 md:p-8 lg:p-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                  {/* Left Side - Image and Button */}
                  <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                    {/* Doctor Image */}
                    <img
                      src="/assets/static-assets/mikel_doctor.png"
                      alt="lek. Michał Szczubkowski - Proktolog"
                      className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover mb-6"
                    />
                    {/* CTA Button - Below Image */}
                    <a
                      href="/lekarze/michal-szczubkowski"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center w-full md:w-auto"
                    >
                      Zobacz Proktologa
                    </a>
                  </div>

                  {/* Right Side - Doctor Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      lek. Michał Szczubkowski
                    </h3>
                    <p className="text-teal-600 text-lg md:text-xl font-medium mb-6">
                      Proktolog z wieloletnim doświadczeniem
                    </p>

                    {/* Biography */}
                    <div className="space-y-4 text-gray-800 text-base md:text-lg leading-relaxed">
                      <p>
                        Chirurg z wieloletnim doświadczeniem w leczeniu schorzeń proktologicznych. Ukończył liczne kursy i szkolenia z zakresu chirurgii kolorektalnej oraz diagnostyki chorób odbytu.
                      </p>
                      <p>
                        Specjalizuje się w nowoczesnym, małoinwazyjnym leczeniu m.in. hemoroidów, szczelin odbytu, przetok oraz innych dolegliwości tej okolicy.
                      </p>
                      <p>
                        Jest chirurgiem skupiającym się na praktycznym, klinicznym leczeniu schorzeń proktologicznych, z indywidualnym podejściem do każdego pacjenta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Symptoms Grid */}
          <section className="mb-16 md:mb-20 bg-teal-50 py-12 md:py-16" aria-labelledby="symptoms-heading">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="text-center mb-8">
                <h2 
                  id="symptoms-heading"
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Z jakimi objawami zgłosić się do proktologa?
                </h2>
                <div className="w-24 h-1 bg-teal-600 mx-auto mb-6"></div>
                <p className="text-gray-700 text-base md:text-lg">
                  Kliknij, by dowiedzieć się więcej:
                </p>
              </div>

              {/* Symptoms Grid - 2 rows x 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Symptom Cards */}
                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex items-center gap-3 group">
                  <span className="text-teal-600 text-xl font-bold group-hover:text-teal-700">→</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Ból odbytu</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex items-center gap-3 group">
                  <span className="text-teal-600 text-xl font-bold group-hover:text-teal-700">→</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Krwawienie z odbytu</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex items-center gap-3 group">
                  <span className="text-teal-600 text-xl font-bold group-hover:text-teal-700">→</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Guzki przy odbycie</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex items-center gap-3 group">
                  <span className="text-teal-600 text-xl font-bold group-hover:text-teal-700">→</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Świąd i pieczenie</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex items-center gap-3 group">
                  <span className="text-teal-600 text-xl font-bold group-hover:text-teal-700">→</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Trudności w wypróżnianiu</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex items-center gap-3 group">
                  <span className="text-teal-600 text-xl font-bold group-hover:text-teal-700">→</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Szczelina odbytu</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex items-center gap-3 group">
                  <span className="text-teal-600 text-xl font-bold group-hover:text-teal-700">→</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Hemoroidy</span>
                </button>

                <button className="bg-white rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow text-left flex items-center gap-3 group">
                  <span className="text-teal-600 text-xl font-bold group-hover:text-teal-700">→</span>
                  <span className="text-gray-800 text-base md:text-lg font-medium">Nietrzymanie stolca</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section 6: FAQ */}
          <section className="mb-16 md:mb-20" aria-labelledby="faq-heading">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
              <div className="text-center mb-8">
                <h2 
                  id="faq-heading"
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Najczęściej zadawane pytania przed wizytą u proktologa
                </h2>
                <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* FAQ Item 1 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Czy badanie proktologiczne boli?
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Badanie jest przeprowadzane delikatnie i profesjonalnie. Może wystąpić jedynie niewielki dyskomfort, ale nie powinno być bolesne. Lekarz zawsze informuje o każdym etapie badania.
                  </p>
                </div>

                {/* FAQ Item 2 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Czy trzeba się rozebrać podczas badania?
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Tak, badanie wymaga odsłonięcia okolicy odbytu. Pacjent otrzymuje jednorazową bieliznę medyczną, a badanie odbywa się z pełnym poszanowaniem intymności.
                  </p>
                </div>

                {/* FAQ Item 3 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Czy wizyta dotyczy również kobiet?
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Oczywiście. Problemy proktologiczne dotyczą zarówno mężczyzn, jak i kobiet. Lekarz ma doświadczenie w leczeniu pacjentów obojga płci.
                  </p>
                </div>

                {/* FAQ Item 4 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Czy potrzebna jest lewatywa przed wizytą?
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Nie, lewatywa nie jest wymagana. Wystarczy standardowa higiena osobista. W razie potrzeby lekarz poinformuje o szczególnych przygotowaniach.
                  </p>
                </div>

                {/* FAQ Item 5 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Jak się przygotować do wizyty?
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Przeprowadź standardową toaletę, unikaj ciężkostrawnych posiłków 2-3 godziny przed wizytą. Zabierz listę przyjmowanych leków i wcześniejsze wyniki badań.
                  </p>
                </div>

                {/* FAQ Item 6 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Ile trwa konsultacja proktologiczna?
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Standardowa konsultacja trwa około 30-40 minut, obejmując wywiad, badanie oraz omówienie wyników i dalszego postępowania.
                  </p>
                </div>

                {/* FAQ Item 7 */}
                <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Czy wymagane jest skierowanie?
                  </h3>
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    Nie, skierowanie nie jest wymagane. Przyjmujemy pacjentów prywatnie, bez skierowania od lekarza rodzinnego.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Location/Service Area */}
          <section className="mb-16 md:mb-20 bg-gray-50 py-12 md:py-16" aria-labelledby="location-heading">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="text-center mb-8">
                <h2 
                  id="location-heading"
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Proktolog blisko Ciebie –<br />
                  Skarżysko-Kamienna, Radom i okolice
                </h2>
                <div className="w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Content Block - White Card - Slightly offset to right */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm max-w-4xl mx-auto md:ml-auto md:mr-8 lg:mr-12">
                <div className="space-y-6 text-gray-800 text-base md:text-lg leading-relaxed">
                  <p>
                    Choć Centrum Medyczne 7 mieści się w Skarżysku-Kamiennej, z konsultacji proktologicznych regularnie korzystają pacjenci z całego regionu – m.in. z <strong>Radomia, Kielc, Starachowic, Szydłowca, Ostrowca</strong> i okolicznych miejscowości.
                  </p>
                  
                  <p>
                    Pacjenci doceniają dogodny dojazd, wygodną rejestrację online oraz brak kolejek.
                  </p>
                </div>

                {/* Call to Action */}
                <div className="mt-8">
                  <p className="text-gray-800 text-base md:text-lg font-medium mb-6 text-left">
                    Szukasz zaufanego proktologa? Umów się na wizytę już dziś.
                  </p>
                  <div className="text-center">
                    <a
                      href="#appointment-section"
                      className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      Umów wizytę u Proktologa
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final Section: Trusted by Patients */}
          <section className="bg-teal-50 py-12 md:py-16" aria-labelledby="trusted-heading">
            <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
              <h2 
                id="trusted-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              >
                Zaufali nam pacjenci z całego regionu
              </h2>

              <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8 max-w-4xl mx-auto">
                Naszym priorytetem jest zrozumienie, dyskrecja i skuteczność leczenia. Konsultacje proktologiczne w CM7 wybierają pacjenci m.in. z Radomia, Kielc, Starachowic i Szydłowca. Proktolog Michał Szczubkowski oraz Centrum Medyczne 7 posiadają wysokie oceny w Google i ZnanyLekarz.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                {/* Call Button - Teal */}
                <button
                  onClick={() => window.location.href = "tel:797097487"}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FaPhone className="text-white" />
                  Zadzwoń teraz
                </button>

                {/* Book Appointment Button - White with Teal Border */}
                <a
                  href="#appointment-section"
                  className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FaCalendar className="text-teal-600" />
                  Umów wizytę online
                </a>

                {/* Google Reviews Button - White with Teal Border */}
                <a
                  href="https://share.google/BzJ9Tr3GTdOFZuw6C"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-teal-600 text-teal-600 font-semibold px-6 py-3 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FaStar className="text-teal-600" />
                  Zobacz opinie Google
                </a>
              </div>

              {/* Rating Display */}
              <div className="flex items-center justify-center gap-2">
                {/* Five Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xl fill-yellow-400" />
                  ))}
                </div>
                {/* Rating Text */}
                <span className="text-gray-900 font-semibold text-lg">5.0 ocena w Google</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ProctologyTestPage;

