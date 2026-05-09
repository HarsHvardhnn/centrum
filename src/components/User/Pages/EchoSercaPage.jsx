import React from "react";
import { FaPhone, FaStar } from "react-icons/fa";
import MetaTags from "../../UtilComponents/MetaTags";

const PAGE_PATH = "/uslugi/echo-serca-skarzysko";
const APPOINTMENT_URL = "/#appointment-section";
const REGISTRATION_TEL = "tel:+48797127487";
const GOOGLE_MAPS_REVIEWS_URL =
  "https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu";

const schemaGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": "https://centrummedyczne7.pl/#medicalclinic",
      name: "Centrum Medyczne 7",
      url: "https://centrummedyczne7.pl",
      telephone: "+48 797 127 487",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Skarżysko-Kamienna",
        addressRegion: "świętokrzyskie",
        addressCountry: "PL",
      },
      medicalSpecialty: ["Cardiovascular", "Radiologic"],
      availableService: {
        "@id": "https://centrummedyczne7.pl/uslugi/echo-serca-skarzysko#echo-serca",
      },
    },
    {
      "@type": ["MedicalProcedure", "MedicalTest"],
      "@id": "https://centrummedyczne7.pl/uslugi/echo-serca-skarzysko#echo-serca",
      name: "Echo serca (USG serca)",
      alternateName: ["Echokardiografia", "USG serca"],
      description:
        "Echo serca (USG serca) – badanie diagnostyczne serca wykonywane w Skarżysku-Kamiennej przez lekarza kardiologa.",
      bodyLocation: "Serce",
      procedureType: "DiagnosticProcedure",
      url: "https://centrummedyczne7.pl/uslugi/echo-serca-skarzysko",
      provider: {
        "@id": "https://centrummedyczne7.pl/#medicalclinic",
      },
    },
  ],
};

const EchoSercaPage = () => {
  return (
    <>
      <MetaTags
        title="Echo serca Skarżysko-Kamienna – USG serca (echokardiografia)"
        description="Echo serca (USG serca) Skarżysko-Kamienna – badanie prywatne u kardiologa, bez skierowania. Umów wizytę online lub zadzwoń. Centrum Medyczne 7"
        path={PAGE_PATH}
        ogTitle="Echo serca Skarżysko-Kamienna – USG serca (echokardiografia)"
        ogDescription="Echo serca (USG serca) Skarżysko-Kamienna – badanie prywatne u kardiologa, bez skierowania. Umów wizytę online lub zadzwoń. Centrum Medyczne 7"
        ogImage="/section1_new_service.png"
        twitterTitle="Echo serca Skarżysko-Kamienna – USG serca (echokardiografia)"
        twitterDescription="Echo serca (USG serca) Skarżysko-Kamienna – badanie prywatne u kardiologa, bez skierowania. Umów wizytę online lub zadzwoń. Centrum Medyczne 7"
        twitterImage="/section1_new_service.png"
      />
      <script type="application/ld+json">{JSON.stringify(schemaGraph)}</script>

      <main className="min-h-screen" style={{ backgroundColor: '#F7F9FA' }}>
        <section className="pt-24 md:pt-32 lg:pt-36 pb-12 md:pb-16" style={{ backgroundColor: '#F7F9FA' }} aria-labelledby="echo-serca-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10 xl:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-10">
              <div className="w-full lg:w-1/2">
                <h1
                  id="echo-serca-heading"
                  className="text-3xl sm:text-[42px] lg:text-[54px] leading-[1.05] font-bold mb-6"
                >
                  <span className="block text-teal-600">Echo serca (USG serca)</span>
                  <span className="block text-teal-600">Skarżysko-Kamienna</span>
                  <span className="block text-gray-900">prywatnie, bez kolejki</span>
                </h1>

                <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8 max-w-xl">
                  Echo serca (echokardiografia) wykonywane prywatnie w Skarżysku-Kamiennej przez
                  kardiologa. Centrum Medyczne 7 oferuje kompleksową diagnostykę kardiologiczną obejmującą
                  ocenę budowy serca, pracy zastawek oraz kurczliwości mięśnia sercowego z wykorzystaniem
                  nowoczesnego aparatu USG. Badania przeprowadzane są przez lekarza z doświadczeniem w
                  diagnostyce chorób serca, takich jak nadciśnienie tętnicze, niewydolność serca czy wady
                  zastawkowe.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = APPOINTMENT_URL;
                    }}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base"
                  >
                    Umów Echo serca
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = REGISTRATION_TEL;
                    }}
                    className="bg-white border-2 border-teal-600 text-teal-600 font-semibold py-3 px-6 rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-base"
                  >
                    <FaPhone className="w-4 h-4 scale-x-[-1]" aria-hidden />
                    Zadzwoń teraz
                  </button>
                </div>

                <a
                  href={GOOGLE_MAPS_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="inline-flex items-center gap-0.5 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </span>
                  <span className="font-semibold">5.0</span>
                  <span className="underline underline-offset-2">Zobacz opinie Google</span>
                </a>
              </div>

              <div className="w-full lg:w-1/2">
                <img
                  src="/section1_new_service.png"
                  alt="Badanie echo serca (USG serca) wykonywane pacjentowi"
                  className="w-full h-auto object-cover rounded-xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Echo serca – kiedy wykonać badanie? */}
        <section className="py-12 md:py-16 bg-white" aria-labelledby="kiedy-wykonac-heading">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 id="kiedy-wykonac-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Echo serca – kiedy wykonać badanie?
            </h2>
            <div className="w-12 h-0.5 bg-teal-600 mb-6"></div>

            <div className="text-gray-900 text-sm md:text-base leading-relaxed space-y-4 mb-8">
              <p>
                Badanie echo serca (echokardiografia) jest nieinwazyjną metodą diagnostyczną wykorzystującą fale ultradzwiękowe do oceny struktury i funkcji serca. Pozwala na szczegółową analizę komór sercowych, zastawek, osierdzia oraz przeszłości klinicznej serca. Echo serca jest podstawowym badaniem w diagnostyce chorób układu sercowo-naczyniowego i powinno być wykonywane w przypadku wystąpienia objawów sugerujących problemy kardiologiczne.
              </p>
              
              <p>
                Jeśli zastanawiasz się, czy badanie jest dla Ciebie odpowiednie, <a 
                  href="/aktualnosci/echo-serca-kiedy-wykonac-badanie"
                  className="text-teal-600 font-bold underline hover:text-teal-700 transition-colors"
                >sprawdź kiedy wykonać badanie echo serca</a>.
              </p>
            </div>

            {/* Grid of 4 sections */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Objaw kardiologiczne */}
              <div className="bg-teal-50 rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Objawy kardiologiczne</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Ból w klatce piersiowej</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Duszność wysiłkowa i spoczynkowa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Kołatania serca i arytmie</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Obrzęki kończyn dolnych</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Zmniejszona tolerancja wysiłku</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Omdlenia i zawroty głowy</span>
                  </li>
                </ul>
              </div>

              {/* Wskazania diagnostyczne */}
              <div className="bg-teal-50 rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Wskazania diagnostyczne</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Podejrzenie wad zastawkowych</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Ocena frakcji skurczowej serca</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Diagnostyka kardiomiopatii</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Kontrola po zawale serca</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Wykrywanie płynu w osierdziu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Ocena nadciśnienia płucnego</span>
                  </li>
                </ul>
              </div>

              {/* Choroby współistniejące */}
              <div className="bg-teal-50 rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Choroby współistniejące</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Nadciśnienie tętnicze</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Cukrzyca</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Choroby autoimmunologiczne</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Zaburzenia rytmu serca</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Choroby nerek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Hiperkolesterolemia</span>
                  </li>
                </ul>
              </div>

              {/* Profilaktyka i kontrola */}
              <div className="bg-teal-50 rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Profilaktyka i kontrola</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Rodzinna historia chorób serca</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Kontrola u sportowców</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Badania przed operacją</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Ocena po chemioterapii</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Kontrola wad wrodzonych</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>Profilaktyka po 50. roku życia</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Card */}
            <div className="rounded-xl p-6 md:p-8 text-white" style={{ backgroundColor: '#2D9B9BCC' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Echo serca (USG serca) z konsultacją lekarską
                  </h3>
                  <p className="text-white text-sm md:text-base leading-relaxed mb-6">
                    W Centrum Medycznym 7 echo serca (USG serca, echokardiografia) może być wykonane jako samodzielne badanie lub w ramach konsultacji kardiologicznej. Podczas wizyty lekarz przeprowadzi ocenę kliniczną pacjenta, analizę wyników badania oraz omówia budowę i funkcję serca, w tym pracę zastawek i kurczliwość mięśnia sercowego. Konsultacja kardiologiczna z echo serca pozwala na kompleksową ocenę układu sercowo-naczyniowego oraz szybkie wdrożenie odpowiedniego postępowania terapeutycznego zgodnie z aktualną wiedzą.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "tel:+48797127487";
                    }}
                    className="bg-white text-teal-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                  >
                    Umów konsultację z echo serca
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Zalety badania echo serca w Centrum Medycznym 7 */}
        <section className="py-12 md:py-16 bg-[#E8F5F3]" aria-labelledby="zalety-heading">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 id="zalety-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
              Zalety badania echo serca w Centrum Medycznym 7
            </h2>
            <div className="w-12 h-0.5 bg-teal-600 mb-12 mx-auto"></div>

            {/* Grid of 6 benefit cards - 3 columns, 2 rows */}
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Bez kolejki */}
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Bez kolejki</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Natychmiastowe wykonanie badania bez długiego oczekiwania
                </p>
              </div>

              {/* Nowoczesny sprzęt */}
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Nowoczesny sprzęt</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Najnowocześniejsze aparaty USG kardiologiczne wysokiej rozdzielczości
                </p>
              </div>

              {/* Opieka lekarska */}
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Opieka lekarska</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Indywidualne podejście i nowoczesna diagnostyka serca
                </p>
              </div>

              {/* Bezbolesne badanie */}
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Bezbolesne badanie</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Całkowicie nieinwazyjne i bezpieczne dla pacjenta
                </p>
              </div>

              {/* Szczegółowa analiza */}
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Szczegółowa analiza</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Kompleksowa ocena struktury i funkcji serca z opisem
                </p>
              </div>

              {/* Bez skierowania */}
              <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Bez skierowania</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Możliwość wykonania badania prywatnie bez skierowania
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Cennik badań echo serca Skarżysko-Kamienna */}
        <section className="py-12 md:py-16 bg-white" aria-labelledby="cennik-heading">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 id="cennik-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Cennik badań echo serca Skarżysko-Kamienna
            </h2>
            <div className="w-12 h-0.5 bg-teal-600 mb-8"></div>

            <p className="text-gray-900 text-sm md:text-base leading-relaxed mb-12">
              Poniższe ceny obejmują wykonanie badania echo serca (echokardiografia), analizę wyniku oraz opis lekarki. Oferujemy zakres świadczeń zalety od wykonanie wizerunku badania (samodzielne echo serca) lub pakiet echo + konsultacja z zakresu kardiologii oraz wykonanie innych pokrewnych badań kwalifikacja lekarskiej. W przypadku samodzielnego badania echo serca wykonane jest opis badania wraz z weiściem diagnostycznym. Szczegółowe zalecenia terapeutyczne ustaline są podczas konsultacji lekarskiej.
            </p>

            {/* Price Cards */}
            <div className="space-y-6 mb-12">
              {/* Echo serca (USG serca) */}
              <div className="rounded-xl p-6 flex justify-between items-start" style={{ backgroundColor: '#E5E7EB' }}>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold mb-2" style={{ color: '#008C8C' }}>
                    Echo serca (USG serca)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Kompleksowe badanie echokardiograficzne z analizą struktury i funkcji serca
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl md:text-3xl font-bold text-teal-600">250 zł</span>
                </div>
              </div>

              {/* Echo serca + konsultacja z zakresu kardiologii + EKG spoczynkowe */}
              <div className="rounded-xl p-6 flex justify-between items-start" style={{ backgroundColor: '#E5E7EB' }}>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold mb-2" style={{ color: '#008C8C' }}>
                    Echo serca + konsultacja z zakresu kardiologii + EKG spoczynkowe
                  </h3>
                  <p className="text-sm text-gray-600">
                    Badanie echokardiograficzne wraz z konsultacją lekarską z zakresu kardiologii oraz wykonaniem EKG spoczynkowego.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl md:text-3xl font-bold text-teal-600">350 zł</span>
                </div>
              </div>
            </div>

            {/* W cenie badania */}
            <div className="bg-[#E8F5F3] rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">W cenie badania</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 font-medium">Badanie echokardiograficzne</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 font-medium">Analiza wyniku</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 font-medium">Opis badania</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-600 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 font-medium">Zalecenia lekarskie</span>
                </div>
              </div>
            </div>

            {/* Information box */}
            <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Informacja prawna:</strong> Przedstawione ceny mają charakter orientacyjny i na standwich oferuj handlowo w rozumieniu art. 66 § 1 Kodeksu Cywilnego. Ostateczna cena usługi medycznej ustalana jest indywidualnie podczas konsultacji lekarskiej, z uwagi na stan stanu zdrowia pacjenta oraz zakres niezbędnych usług diagnostycznych.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Umów badanie echo serca – pacjenci z Skarżyska-Kamiennej i okolic */}
        <section className="py-12 md:py-16" style={{ backgroundColor: '#F7F9FA' }} aria-labelledby="umow-badanie-heading">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 id="umow-badanie-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Umów badanie echo serca – pacjenci z Skarżyska-Kamiennej i okolic
            </h2>
            <div className="w-12 h-0.5 bg-teal-600 mb-8"></div>

            <p className="text-gray-900 text-sm md:text-base leading-relaxed mb-12 max-w-4xl">
              Centrum Medyczne 7 w Skarżysku-Kamiennej zapewnia profesjonalne badania echo serca dla pacjentów z całego regionu świętokrzyskiego prywatne, w tym z Kielc, Starachowic, Radomia, Ostrowca Świętokrzyskiego oraz starachowickich miejscowości. Oferujemy wszyscy kliników z doświadczymi partnerami oraz kostymie godnie przyjęć dostosowane do twoich pacjentów.
            </p>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Contact Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Poradnia Kardiologiczna Skarżysko- kontakt</h3>
                
                <div className="space-y-4">
                  {/* Telefon */}
                  <a href="tel:+48797127487" className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-teal-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Telefon</h4>
                      <p className="text-xs text-gray-600 hover:text-teal-600 transition-colors">+48 797-127-487</p>
                    </div>
                  </a>

                  {/* Email */}
                  <a href="mailto:kontakt@centrummedyczne7.pl" className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-teal-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Email</h4>
                      <p className="text-xs text-gray-600 hover:text-teal-600 transition-colors">kontakt@centrummedyczne7.pl</p>
                    </div>
                  </a>

                  {/* Adres */}
                  <a href="https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu" target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:bg-teal-50 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Adres</h4>
                      <p className="text-xs text-gray-600 hover:text-teal-600 transition-colors">ul. Powstańców Warszawy 7/1.5, Skarżysko-Kamienna</p>
                    </div>
                  </a>

                  {/* Godziny pracy */}
                  <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">Godziny pracy</h4>
                      <p className="text-xs text-gray-600">Pn-Pt: 15:00-20:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card - Appointment Booking */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Umów wizytę w Centrum Medyczne 7</h3>
                
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = APPOINTMENT_URL;
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Umów badanie echo serca online
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "tel:+48797127487";
                    }}
                    className="w-full bg-white border-2 border-teal-600 text-teal-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-teal-50 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Zadzwoń i umów wizytę
                  </button>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Dlaczego echo serca Centrum Medyczne 7 ?</h4>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-xs text-gray-700">
                      <svg className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Badania bez kolejki - wizyty zarezerwuj z dnia na dzień</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-700">
                      <svg className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Badanie usg serca (echo serca) bez skierowania, prywatnie</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-700">
                      <svg className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Doświadczeni partnerzy dla pacjentów</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-700">
                      <svg className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Indywidualne podejście do każdego pacjenta</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-700">
                      <svg className="w-3 h-3 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Nowoczesny sprzęt kardiologiczny</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Echo serca dla pacjentów z regionu świętokrzyskiego */}
        <section className="py-12 md:py-16 bg-white" aria-labelledby="region-heading">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 id="region-heading" className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Echo serca dla pacjentów z regionu świętokrzyskiego
            </h2>
            <div className="w-12 h-0.5 bg-teal-600 mb-8"></div>

            <p className="text-gray-900 text-sm md:text-base leading-relaxed mb-12 max-w-4xl">
              Centrum Medyczne 7 w Skarżysku-Kamiennej obsługuje pacjentów z całego województwa świętokrzyskiego oraz sąsiednich regionów. Dzięki dogodnej lokalizacji i dostępności komunikacyjnej nasza placówka jest łatwo dostępna dla mieszkańców wielu miast i miejscowości. Oferujemy profesjonalne badania echo serca z możliwością szybkiego umówienia wizyty i elastycznymi godzinami przyjęć.
            </p>

            {/* City Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Echo serca Kielce */}
              <div className="bg-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Echo serca Kielce</h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Badania dla mieszkańców Kielc i powiatu kieleckiego. Dogodny dojazd drogą krajową nr 42, czas przejazdu około 30 minut.
                </p>
                <button 
                  type="button"
                  className="text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors flex items-center gap-1"
                >
                  Umów badanie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Echo serca Radom */}
              <div className="bg-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Echo serca Radom</h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Profesjonalne badania kardiologiczne dla pacjentów z Radomia. Łatwy dojazd drogą krajową nr 42, czas przejazdu około 40 minut.
                </p>
                <a 
                  href="https://cm7zdrowie.pl/echo-serca-radom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors flex items-center gap-1"
                >
                  Umów badanie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Echo serca Starachowice */}
              <div className="bg-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Echo serca Starachowice</h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Badania echo serca dla mieszkańców Starachowic. Dogodna lokalizacja przy głównej trasie, czas przejazdu około 20 minut.
                </p>
                <a 
                  href="https://cm7zdrowie.pl/echo-serca-starachowice"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors flex items-center gap-1"
                >
                  Umów badanie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Echo serca Ostrowiec Świętokrzyski */}
              <div className="bg-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Echo serca Ostrowiec Świętokrzyski</h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Kompleksowa diagnostyka kardiologiczna dla pacjentów z Ostrowca Świętokrzyskiego i okolic.
                </p>
                <a 
                  href="https://cm7zdrowie.pl/echo-ostrowiec-swietokrzyski"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors flex items-center gap-1"
                >
                  Umów badanie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Echo serca Końskie */}
              <div className="bg-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Echo serca Końskie</h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Badania USG serca dla mieszkańców Końskiego i powiatu końskiego. Szybki dojazd drogą wojewódzką.
                </p>
                <a 
                  href="https://cm7zdrowie.pl/echo-serca-konskie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors flex items-center gap-1"
                >
                  Umów badanie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Echo serca Suchedniów */}
              <div className="bg-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Echo serca Suchedniów</h3>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  Profesjonalne badania kardiologiczne dla pacjentów z Suchedniowa i okolicznych miejscowości.
                </p>
                <a 
                  href="https://cm7zdrowie.pl/suchedniow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 font-semibold text-sm hover:text-teal-700 transition-colors flex items-center gap-1"
                >
                  Umów badanie
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default EchoSercaPage;
