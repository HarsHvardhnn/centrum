import React from "react";
import MetaTags from '../../UtilComponents/MetaTags';
import { FaStar, FaCalendar, FaShieldAlt, FaCheck, FaPhone } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";

const AlcoholImplantPage = () => {
  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "name": "Wszywka alkoholowa - chirurgiczna implantacja disulfiramu (Esperal)",
    "description": "Chirurgiczna implantacja disulfiramu (Esperal) w Centrum Medycznym 7. Profesjonalne wszywki alkoholowe. Pomoc w leczeniu uzależnienia od alkoholu.",
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
    "medicalSpecialty": "Addiction Medicine",
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
    "medicalSpecialty": "Addiction Medicine",
    "url": "https://centrummedyczne7.pl/implantacja-wszywki-alkoholowej"
  };

  return (
    <>
      <MetaTags 
        title="Wszywka alkoholowa (Esperal) – Skarżysko-Kamienna, Kielce, Radom – CM7"
        description="Chirurgiczna implantacja disulfiramu (Esperal) w Centrum Medycznym 7. Profesjonalne wszywki alkoholowe. Pomoc w leczeniu uzależnienia od alkoholu. Umów konsultację."
        path="/implantacja-wszywki-alkoholowej"
      />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(physicianData)}
      </script>
      
      <main className="min-h-screen bg-white">
        {/* Hero Section - First Section */}
        <section className="bg-[#F7F9FA] pt-24 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20" aria-labelledby="hero-heading">
          <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8 xl:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 xl:gap-16">
              {/* Left Side - Text Content */}
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0">
                {/* Location Tag */}
                <div className="mb-4 px-4 md:px-0">
                  <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                    Skarżysko-Kamienna, woj. świętokrzyskie
                  </span>
                </div>

                {/* Main Heading */}
                <h2 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6 px-4 md:px-0">
                  <span className="block text-teal-600">Wszywka alkoholowa –</span>
                  <span className="block text-gray-900 font-bold">chirurgiczna</span>
                  <span className="block text-gray-900 font-bold">implantacja disulfiramu</span>
                  <span className="block text-gray-900 font-bold">(Esperal)</span>
                </h2>

                {/* Description Paragraphs */}
                <div className="space-y-4 mb-6 text-gray-700 text-base md:text-lg leading-relaxed px-4 md:px-0">
                  <p>
                    Chirurgiczna implantacja disulfiramu (Esperal) wykonywana przez lekarza, po kwalifikacji medycznej.
                  </p>
                  <p>
                    Leczenie uzależnienia od alkoholu jest procesem złożonym, wymagającym świadomego zaangażowania pacjenta oraz wsparcia medycznego i terapeutycznego. Jedną z metod wspomagających leczenie alkoholizmu oraz utrzymanie abstynencji jest wszywka alkoholowa.
                  </p>
                  <p>
                    Zabieg wykonywany jest przez doświadczonego chirurga, w warunkach ambulatoryjnych, po wcześniejszej kwalifikacji medycznej. Przyjmujemy pacjentów prywatnie, bez skierowania.
                  </p>
                </div>

                {/* Price Box */}
                <div className="bg-primary-lighter rounded-lg px-6 py-4 mb-6 flex items-center justify-between mx-4 md:mx-0">
                  <span className="text-gray-800 font-medium text-sm md:text-base">Cena:</span>
                  <span className="text-primary font-bold text-sm md:text-xl">od 1500 zł</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 px-4 md:px-0">
                  <button 
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base md:text-lg"
                  >
                    Umów konsultację
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
                <div className="px-4 md:px-0">
                <a
                  href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skarżysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dziecięcy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {/* Five Stars */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-base fill-yellow-400" />
                    ))}
                  </div>
                  {/* Rating Text */}
                  <span className="text-gray-900 font-semibold text-base">5.0</span>
                  {/* Link Text */}
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
                    src="/assets/static-assets/Implantacja _section1.png"
                    alt="Wszywka alkoholowa - Centrum Medyczne 7"
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
          
          {/* Section 2: Introduction */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="introduction-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="introduction-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Wszywka alkoholowa-wprowadzenie
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* First Paragraph */}
              <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                Wszywka alkoholowa nie stanowi samodzielnego leczenia uzależnienia, lecz może być elementem kompleksowego programu terapeutycznego u wybranych, współpracujących pacjentów. Zabieg polega na podskórnym wszczepieniu preparatu, który w przypadku spożycia alkoholu wywołuje reakcję disulfiramową o działaniu zniechęcającym do dalszego picia.
              </p>

              {/* Highlighted Information Box */}
              <div className="bg-teal-50 rounded-lg p-6 md:p-8">
                <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed text-left">
                  Wszywka alkoholowa może być rozważana jako element wspomagający leczenie uzależnienia od alkoholu dla pacjentów po wcześniejszej kwalifikacji medycznej i świadomej zgodzie.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: When to Consider */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="when-to-consider-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="when-to-consider-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Kiedy rozważyć wszywkę alkoholową?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Box */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm">
                {/* Introductory Text */}
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-6">
                  Wszywka alkoholowa (Disulfiram-Esperal) może być rozważana jako element leczenia u osób, które
                </p>

                {/* Two-column Bullet List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  {/* Left Column */}
                  <ul className="space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">są świadome problemu alkoholowego</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">podejmują próbę przerwania ciągu alkoholowego</span>
                    </li>
                  </ul>

                  {/* Right Column */}
                  <ul className="space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">mają trudności z utrzymaniem abstynencji</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">poszukują dodatkowego wsparcia w początkowej fazie leczenia</span>
                    </li>
                  </ul>
                </div>

                {/* Concluding Statement */}
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  Decyzja o zastosowaniu wszywki alkoholowej zawsze wymaga indywidualnej konsultacji lekarskiej oraz świadomej zgody pacjenta.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: What is Disulfiram */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="what-is-disulfiram-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="what-is-disulfiram-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Czym jest Disulfiram (Esperal)?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* First Paragraph */}
              <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                Disulfiram, znany również pod historyczną nazwą handlową Esperal, jest substancją leczniczą stosowaną jako środek wspomagający leczenie uzależnienia od alkoholu. Jego mechanizm działania polega na trwałym hamowaniu dehydrogenazy aldehydu octowego, enzymu odpowiedzialnego za metabolizm alkoholu.
              </p>

              {/* Second Paragraph */}
              <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                Po spożyciu alkoholu dochodzi do nagromadzenia aldehydu octowego w organizmie, co wywołuje tzw. reakcję disulfiramową. Objawy tej reakcji mogą obejmować m.in. nudności, wymioty, zaczerwienienie skóry, kołatanie serca, duszność oraz silne złe samopoczucie.
              </p>

              {/* Highlighted Box - Third Paragraph */}
              <div className="bg-gray-100 rounded-lg p-6 md:p-8">
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  Działanie to ma charakter awersyjny i służy wspieraniu abstynencji alkoholowej.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Effectiveness and Limitations */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="effectiveness-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="effectiveness-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Skuteczność i ograniczenia metody
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Box */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm">
                {/* Introductory Paragraph */}
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                  Dane medyczne wskazują, że disulfiram może być pomocny w czasowym utrzymaniu abstynencji u wybranych pacjentów. Forma implantacyjna, czyli wszywka alkoholowa, nie powinna być traktowana jako samodzielna metoda leczenia alkoholizmu.
                </p>

                {/* Sub-heading */}
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg font-bold mb-4">
                  Eksperci podkreślają, że:
                </p>

                {/* Bulleted List */}
                <ul className="space-y-3 sm:space-y-4" role="list">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">skuteczność wszywki zależy od współpracy pacjenta</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">najlepsze efekty osiąga się w połączeniu z terapią uzależnień</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg">metoda ta budzi kontrowersje przy niewłaściwej kwalifikacji pacjenta</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 6: How Does Procedure Look Like */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="procedure-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="procedure-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Jak wygląda zabieg implantacji disulfiramu?
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Box */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm">
                {/* Sub-heading */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Implantacja disulfiramu (esperalu) w Skarżysku-Kamiennej:
                </h3>

                {/* Two-column Bullet List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  {/* Left Column */}
                  <ul className="space-y-3 sm:space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">wykonywana jest wyłącznie przez lekarza</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">trwa zazwyczaj około 30 minut</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">przeprowadzana jest w znieczuleniu miejscowym</span>
                    </li>
                  </ul>

                  {/* Right Column */}
                  <ul className="space-y-3 sm:space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">polega na umieszczeniu jałowych tabletek disulfiramu podpowięziowo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">standardowo implantuje się 8-10 tabletek, rozmieszczonych „gwiaździście"</span>
                    </li>
                  </ul>
                </div>

                {/* Light Teal Box with Instructions */}
                <div className="bg-teal-50 rounded-lg p-6 md:p-8">
                  <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                    Pacjent nie powinien spożywać alkoholu przez co najmniej 12-48 godzin przed zabiegiem. Po zabiegu możliwy jest powrót do codziennych aktywności zgodnie z zaleceniami lekarza.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Contraindications and Safety */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="contraindications-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="contraindications-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Przeciwwskazania i bezpieczeństwo
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Box - Contraindications */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Zabieg implantacji disulfiramu nie może być wykonany u pacjentów z:
                </h3>

                {/* Two-column Bullet List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <ul className="space-y-3 sm:space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">aktualnym spożyciem alkoholu lub ekspozycją na alkohol</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">ciężkimi chorobami układu krążenia</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">istotnymi zaburzeniami psychicznymi</span>
                    </li>
                  </ul>

                  {/* Right Column */}
                  <ul className="space-y-3 sm:space-y-4" role="list">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">nadwrażliwością na disulfiram lub pochodne tiokarbaminianów</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-2 h-2 bg-teal-600 rounded-full mt-2"></span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg">ciążą</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Light Teal Box - Special Precautions */}
              <div className="bg-teal-50 rounded-lg p-6 md:p-8">
                <p className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  Szczególnej ostrożności wymagają pacjenci z chorobami wątroby, nerek, padaczką, cukrzycą oraz chorobami układu oddechowego. Każdy pacjent przed zabiegiem przechodzi kwalifikację lekarską, a lekarz może odmówić wykonania zabiegu, jeśli istnieją przeciwwskazania.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: Adverse Effects and Risks */}
          <section className="bg-[#E5E7EB] py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="adverse-effects-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="adverse-effects-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Działania niepożądane i ryzyko spożycia alkoholu
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Box with Border */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 lg:p-10">
                {/* Red/Pink Background Box */}
                <div className="bg-red-50 rounded-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
                  {/* Introductory Sentence */}
                  <p className="text-red-800 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4 font-medium">
                    Spożycie alkoholu podczas terapii disulfiramem może prowadzić do ciężkiej reakcji disulfiramowej, a w skrajnych przypadkach do:
                  </p>

                  {/* Two-column Bullet List with Red Triangles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Left Column */}
                    <ul className="space-y-2 sm:space-y-3" role="list">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 text-red-600 text-xs sm:text-sm mt-1">▲</span>
                        <span className="text-red-800 text-xs sm:text-sm md:text-base">zaburzeń rytmu serca</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 text-red-600 text-xs sm:text-sm mt-1">▲</span>
                        <span className="text-red-800 text-xs sm:text-sm md:text-base">drgawek</span>
                      </li>
                    </ul>

                    {/* Right Column */}
                    <ul className="space-y-2 sm:space-y-3" role="list">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 text-red-600 text-xs sm:text-sm mt-1">▲</span>
                        <span className="text-red-800 text-xs sm:text-sm md:text-base">niewydolności krążeniowo-oddechowej</span>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <span className="flex-shrink-0 text-red-600 text-xs sm:text-sm mt-1">▲</span>
                        <span className="text-red-800 text-xs sm:text-sm md:text-base">śpiączki</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Additional Information Paragraph */}
                <p className="text-left text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed">
                  Disulfiram może również powodować działania niepożądane niezależne od alkoholu, w tym zaburzenia neurologiczne, uszkodzenie wątroby czy reakcje skórne. Pacjent musi być o tym szczegółowo poinformowany i pozostawać pod kontrolą lekarza.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9: Removal of Alcohol Implant */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="removal-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="removal-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Usunięcie wszywki alkoholowej
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Box */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10">
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  Usunięcie wszywki alkoholowej możliwe jest wyłącznie w warunkach medycznych i wymaga interwencji chirurgicznej. Nie ma możliwości samodzielnego usunięcia zaimplantowanego disulfiramu.
                </p>
              </div>
            </div>
          </section>

          {/* Section 10: Location and Availability */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="location-availability-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="location-availability-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Lokalizacja i dostępność
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* White Content Box */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 border border-gray-200">
                {/* First Paragraph */}
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6">
                  Zabieg implantacji disulfiramu (wszywka alkoholowa) wykonywany jest w Centrum Medycznym 7.
                </p>

                {/* Second Paragraph */}
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
                  Z naszych usług korzystają pacjenci ze Skarżyska-Kamiennej, a także z Szydłowca, Kielc, Radomia, Starachowic, Warszawy i okolicznych województw.
                </p>

                {/* Call-to-Action Button */}
                <div className="text-center">
                  <button 
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm sm:text-base md:text-lg"
                  >
                    Umów konsultację
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: Doctor Info */}
          <section className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="doctor-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="doctor-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Konsultacje i zabiegi implantacji wszywki alkoholowej (Esperalu) wykonuje
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Light Gray Doctor Card */}
              <div className="bg-gray-100 rounded-lg p-6 md:p-8 lg:p-10">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
                  {/* Right Side - Doctor Info (First on mobile, second on desktop) */}
                  <div className="flex-1 order-1 md:order-2">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      lek. Michał Szczubkowski
                    </h3>
                    <p className="text-teal-600 text-lg md:text-xl font-medium mb-6">
                      Chirurg z wieloletnim doświadczeniem
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

                  {/* Left Side - Image and Button (Second on mobile, first on desktop) */}
                  <div className="flex-shrink-0 flex flex-col items-center w-full md:w-auto order-2 md:order-1">
                    {/* Doctor Image with White Padding and Shadow */}
                    <div className="bg-white p-2 rounded-full shadow-md mb-0 md:mb-6 mx-auto">
                      <img
                        src="/assets/static-assets/mikel_doctor.png"
                        alt="lek. Michał Szczubkowski - Chirurg"
                        className="w-48 h-48 md:w-56 md:h-56 rounded-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    {/* CTA Button - Hidden on mobile, shown on desktop */}
                    <a
                      href="/lekarze/michal-szczubkowski"
                      className="hidden md:block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center"
                    >
                      Zobacz Chirurga
                    </a>
                  </div>
                </div>
                
                {/* CTA Button - Mobile only, at the end */}
                <div className="mt-6 md:hidden">
                  <a
                    href="/lekarze/michal-szczubkowski"
                    className="block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center"
                  >
                    Zobacz Chirurga
                  </a>
                </div>
              </div>
            </div>
          </section>

{/* Section 12: Location/Service Area */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="location-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="location-heading"
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3"
                >
                  Wszywka alkoholowa blisko Ciebie – Skarżysko-Kamienna, Kielce, Radom
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Content Block - White Card */}
              <div className="bg-white rounded-lg p-6 md:p-8 lg:p-10 shadow-sm max-w-4xl mx-auto">
                <div className="space-y-4 sm:space-y-6 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  <p>
                    Choć Centrum Medyczne 7 mieści się w Skarżysku-Kamiennej, z usług implantacji wszywek alkoholowych regularnie korzystają pacjenci z całego regionu – m.in. z <strong>Kielc, Radomia, Starachowic, Szydłowca, Ostrowca</strong> i okolicznych miejscowości.
                  </p>
                  
                  <p>
                    Pacjenci doceniają dogodny dojazd, wygodną rejestrację online oraz brak kolejek. Zabiegi wykonywane są przez doświadczonych chirurgów z dbałością o bezpieczeństwo i komfort pacjenta.
                  </p>
                </div>

                {/* Call to Action */}
                <div className="mt-6 sm:mt-8 text-center">
                  <button
                    onClick={() => window.location.href = '/?lekarz=6877dbf8635211ff3ec6322d&openAppointment=true#appointment-section'}
                    className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm sm:text-base md:text-lg"
                  >
                    Umów konsultację
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Final Section: Summary for Patients */}
          <section className="bg-primary-lightest py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2" aria-labelledby="summary-heading">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
              <div className="text-center mb-6 sm:mb-8">
                <h2 
                  id="summary-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3"
                >
                  Podsumowanie dla pacjentów
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto"></div>
              </div>

              {/* Three Paragraphs */}
              <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  Wszywka alkoholowa (chirurgiczna implantacja disulfiramu) jest metodą pomocniczą, stosowaną u wybranych pacjentów jako element kompleksowego leczenia uzależnienia od alkoholu.
                </p>
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  Zabieg wymaga kwalifikacji lekarskiej, świadomej zgody pacjenta oraz ścisłego przestrzegania zaleceń ze względu na ryzyko poważnych reakcji po spożyciu alkoholu i możliwe interakcje lekowe.
                </p>
                <p className="text-left text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                  Centrum Medyczne 7 zapewnia profesjonalną opiekę medyczną w zakresie leczenia uzależnień.
                </p>
              </div>

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
              <div className="flex items-center justify-center gap-2">
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

export default AlcoholImplantPage;

