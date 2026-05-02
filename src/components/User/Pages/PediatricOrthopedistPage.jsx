import React from "react";
import { Link } from "react-router-dom";
import MetaTags from "../../UtilComponents/MetaTags";
import {
  FaStar,
  FaPhone,
  FaCheck,
  FaExclamationTriangle,
  FaCalendarAlt,
} from "react-icons/fa";
import { cm7PostalAddressLd } from '../../../data/cm7PostalAddressLd';

const PAGE_PATH = "/ortopeda-dzieciecy-skarzysko";
const META_TITLE = "Ortopeda dziecięcy Skarżysko – prywatnie, bez skierowania";
const META_DESCRIPTION =
  "Ortopeda dziecięcy Skarżysko – konsultacje dla dzieci i niemowląt. Diagnostyka wad postawy i rozwoju układu ruchu, w tym USG bioderek.";
const HERO_IMAGE = "/section1_newpage.png";
const PEDIATRIC_ORTHOPEDIST_DOCTOR_ID = "69a6177223a657890e846729";
const APPOINTMENT_URL = `/?lekarz=${PEDIATRIC_ORTHOPEDIST_DOCTOR_ID}&openAppointment=true#appointment-section`;
const ORTHOPEDA_SERVICE_URL = "https://centrummedyczne7.pl/uslugi/ortopeda-skarzysko";
const REGISTRATION_TEL = "tel:+48797127487";
const DOCTOR_PHOTO = "/lukas.png";
const GOOGLE_MAPS_REVIEWS_URL =
  "https://www.google.com/maps/place/Centrum+Medyczne+7+%7C+Przychodnia+Specjalistyczna+Skar%C5%BCysko-Kamienna+%7C+Chirurg,+Proktolog,+Neurolog+dzieci%C4%99cy/@51.1191214,20.864972,17z/data=!4m8!3m7!1s0x471839d944445df7:0x28ce2724c759c930!8m2!3d51.1191214!4d20.864972!9m1!1b1!16s%2Fg%2F11xfrlnfp0?entry=ttu&g_ep=EgoyMDI1MDkwMy4wIKXMDSoASAFQAw%3D%3D";

/** Strona ortopedy dla dorosłych */
const ADULT_ORTHOPEDICS_SERVICE_PATH = "https://www.centrummedyczne7.pl/ortopeda-skarzysko";

const SECTION3_VISIT_REASONS_LEFT = [
  "Dziecko utyka, skraca krok lub oszczędza jedną kończynę",
  "Nawracające bóle nóg (szczególnie wieczorem lub w nocy)",
  "Widoczne zniekształcenie stopy lub kolan",
  "Podejrzenie skoliozy, asymetria barków",
  "Ograniczone odwodzenie uda u niemowlęcia",
];

const SECTION3_VISIT_REASONS_RIGHT = [
  "Ból kolana u dziecka, ból biodra, ból stopy lub pięty",
  "Szybkie męczenie się podczas chodzenia",
  "Płaskostopie i nierównomierne ścieranie obuwia",
  "Uraz sportowy lub przeciążenie treningowe",
];

const SECTION3_URGENT_REASONS = [
  "Nagły silny ból stawu",
  "Obrzęk lub zaczerwienienie",
  "Brak możliwości obciążenia kończyny",
  "Ból z towarzyszącą gorączką",
];

const SECTION5_USG_DETECT_ITEMS = [
  "Dysplazję stawu biodrowego",
  "Niedojrzałość stawu biodrowego",
  "Niestabilność biodra",
  "Nieprawidłowe ukształtowanie panewki",
];

const SECTION6_SCOPE_ITEMS = [
  "Ocena rozwoju układu ruchu u niemowlęcia i małego dziecka",
  "Kontrola bioder (w tym USG bioderek)",
  "Diagnostyka bólu kończyn u dziecka",
  "Wykrywanie i prowadzenie wad postawy",
  "Konsultacje w kierunku skoliozy i asymetrii tułowia",
  "Płaskostopie i dolegliwości stóp",
  "Koślawość/szpotawość kończyn dolnych",
  "Urazy sportowe i przeciążenia",
  "Bóle wzrostowe i bóle nóg w nocy",
  "Kontrola po złamaniach i skręceniach",
];

/** City labels for grid; hyphens → U+2011 so names stay on one line */
const SECTION8_CITY_LABELS = [
  "Skarżysko-Kamienna",
  "Kielce",
  "Radom",
  "Starachowice",
  "Suchedniów",
  "Szydłowiec",
  "Wierzbica",
  "Ostrowiec Świętokrzyski",
  "Końskie",
  "Bodzentyn",
  "Zagnańsk",
  "Wąchock",
  "Bliżyn",
  "Mirzec",
  "Łączna",
  "Stąporków",
  "Ćmielów",
  "Kunów",
  "Iłża",
  "Pionki",
  "Pawłów",
  "Opatów",
  "Jastrząb",
  "Busko-Zdrój",
  "Sandomierz",
];

const formatCityNoBreak = (label) => label.replace(/-/g, "\u2011");
const slugifyCityForCm7Zdrowie = (city) =>
  city
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCityOrthopedicsUrl = (city) =>
  `https://cm7zdrowie.pl/ortopeda-dzieciecy-${slugifyCityForCm7Zdrowie(city)}/`;

const NBH = "\u2011";

const SECTION9_FAQ = [
  {
    q: `Czy w Skarżysku${NBH}Kamiennej przyjmuje ortopeda dziecięcy?`,
    a: `Tak. Ortopeda dziecięcy przyjmuje w Centrum Medycznym 7 w Skarżysku${NBH}Kamiennej.`,
  },
  {
    q: "Gdzie w Skarżysku zrobić USG bioderek?",
    a: "USG bioderek wykonasz w Centrum Medycznym 7, ul. Powstańców Warszawy 7/1.5.",
  },
  {
    q: "Czy potrzebne jest skierowanie do ortopedy dziecięcego w Skarżysku?",
    a: "Nie. Konsultacje z ortopedą dziecięcym w Centrum Medyczne 7 odbywają się prywatnie.",
  },
  {
    q: "Czy ortopeda dziecięcy przyjmuje pacjentów z Kielc, Starachowic czy Radomia?",
    a: "Tak. Ortopeda dziecięcy w Centrum Medyczne 7 przyjmuje pacjentów z całego regionu.",
  },
  {
    q: "Czy bóle nóg w nocy u dzieci wymagają konsultacji ortopedycznej?",
    a: "Tak, szczególnie jeśli są jednostronne\u00A0lub nawracające.",
  },
  {
    q: `Ile kosztuje wizyta u ortopedy dziecięcego w Skarżysku${NBH}Kamiennej?`,
    a: "Konsultacja ortopedy dziecięcego odbywa się prywatnie, zgodnie z aktualnym cennikiem na stronie.",
  },
  {
    q: "W jakim wieku wykonać USG bioderek u niemowlęcia?",
    a: "USG bioderek wykonuje się najczęściej między 4. a 8. tygodniem życia, zgodnie z zaleceniami lekarza.",
  },
  {
    q: "Jak przygotować dziecko do wizyty u ortopedy dziecięcego w Skarżysku?",
    a: "Wizyta nie wymaga specjalnego przygotowania. Warto zabrać wcześniejszą dokumentację medyczną i wyniki badań, jeśli były wykonywane.",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SECTION9_FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
};

const PediatricOrthopedistPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: "Konsultacje ortopedyczne dla dzieci – ortopeda dziecięcy Skarżysko",
    description: META_DESCRIPTION,
    provider: {
      "@type": "MedicalBusiness",
      name: "Centrum Medyczne 7",
      address: {
        ...cm7PostalAddressLd,
        addressRegion: "świętokrzyskie",
      },
      telephone: "797-127-487",
      url: "https://centrummedyczne7.pl",
    },
    medicalSpecialty: "Orthopedic",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceType: "Private consultation",
      availableLanguage: "pl",
    },
  };

  const physicianStructuredData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: "lek. Łukasz Dubiel",
    jobTitle: "Ortopeda dziecięcy",
    worksFor: {
      "@type": "MedicalBusiness",
      name: "Centrum Medyczne 7",
      address: {
        ...cm7PostalAddressLd,
        addressRegion: "świętokrzyskie",
      },
      telephone: "+48797127487",
    },
    medicalSpecialty: "Orthopedic",
    url: `https://centrummedyczne7.pl${PAGE_PATH}`,
  };

  const proceduresGraphStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalBusiness",
        name: "Centrum Medyczne 7",
        address: {
          ...cm7PostalAddressLd,
          streetAddress: "ul. Powstańców Warszawy 7/1.5",
        },
        telephone: "+48 797 127 487",
      },
      {
        "@type": "MedicalProcedure",
        name: "Konsultacja ortopedy dziecięcego",
        procedureType: "Orthopedic consultation",
        bodyLocation: "układ ruchu",
        provider: {
          "@type": "MedicalBusiness",
          name: "Centrum Medyczne 7",
          address: {
            ...cm7PostalAddressLd,
            streetAddress: "ul. Powstańców Warszawy 7/1.5",
          },
        },
        areaServed: "Skarżysko-Kamienna",
        offers: {
          "@type": "Offer",
          price: "300",
          priceCurrency: "PLN",
        },
      },
      {
        "@type": "MedicalProcedure",
        name: "USG bioderek u niemowląt",
        procedureType: "Ultrasound hip examination",
        bodyLocation: "staw biodrowy",
        provider: {
          "@type": "MedicalBusiness",
          name: "Centrum Medyczne 7",
        },
        areaServed: "Skarżysko-Kamienna",
      },
    ],
  };

  return (
    <>
      <MetaTags
        title={META_TITLE}
        description={META_DESCRIPTION}
        path={PAGE_PATH}
        ogTitle={META_TITLE}
        ogDescription={META_DESCRIPTION}
        ogImage={HERO_IMAGE}
        twitterTitle={META_TITLE}
        twitterDescription={META_DESCRIPTION}
        twitterImage={HERO_IMAGE}
      />
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(physicianStructuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(proceduresGraphStructuredData)}</script>
      <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>

      <main className="min-h-screen bg-white">
        <section
          className="bg-[#F7F9FA] pt-16 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20"
          aria-labelledby="hero-heading"
        >
          <div className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8 xl:px-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 xl:gap-16">
              <div className="flex-1 w-full lg:w-1/2 pt-4 lg:pt-0">
                <div className="mb-4 px-4 md:px-0">
                  <span className="inline-flex items-center gap-1.5 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-teal-600 rounded-full" aria-hidden />
                    Poradnia ortopedyczna dla dzieci
                  </span>
                </div>

                <h1
                  id="hero-heading"
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-6 px-4 md:px-0"
                >
                  <span className="block text-teal-600">Ortopeda dziecięcy</span>
                  <span className="block text-teal-600">Skarżysko</span>
                  <span className="block text-gray-900">– prywatnie, USG bioderek niemowląt</span>
                </h1>

                <div className="space-y-4 mb-6 text-gray-700 text-base md:text-lg leading-relaxed px-4 md:px-0">
                  <p>
                    Szukasz ortopedy dziecięcego w Skarżysku prywatnie? W{" "}
                    <Link to="/" className="text-teal-700 hover:text-teal-800 underline underline-offset-2">
                      Centrum Medycznym 7
                    </Link>{" "}
                    oferujemy
                    konsultacje ortopedyczne dla dzieci – diagnostykę wad postawy, skoliozy, płaskostopia
                    oraz USG bioderek u niemowląt. Doświadczony ortopeda dziecięcy w Skarżysku prowadzi
                    diagnostykę oraz leczenie schorzeń narządu ruchu u dzieci i młodzieży – bez skierowania.
                    Oferujemy szybkie terminy wizyt, dostępne w zależności od aktualnego grafiku.
                  </p>
                  <p>
                    Z konsultacji ortopedy dziecięcego w naszej poradni ortopedycznej dla dzieci korzystają
                    pacjenci z całego województwa świętokrzyskiego, w tym m.in. ze Starachowic,
                    Suchedniowa, Szydłowca, Kielc oraz Radomia.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-3 sm:gap-4 mb-6 px-4 md:px-0">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = APPOINTMENT_URL;
                    }}
                    className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base md:text-lg text-center whitespace-nowrap w-full sm:w-auto"
                  >
                    Umów wizytę - ortopeda dziecięcy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = REGISTRATION_TEL;
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-white border-2 border-teal-600 text-teal-600 font-semibold py-3 px-4 sm:px-6 rounded-lg hover:bg-teal-50 transition-colors text-sm sm:text-base md:text-lg whitespace-nowrap w-full sm:w-auto"
                  >
                    <FaPhone className="text-teal-600 w-4 h-4 sm:w-5 sm:h-5 shrink-0 scale-x-[-1]" aria-hidden />
                    Zadzwoń: 797 127 487
                  </button>
                </div>

                <div className="px-4 md:px-0">
                  <a
                    href={GOOGLE_MAPS_REVIEWS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-wrap items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <span className="flex items-center gap-0.5" aria-hidden>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm sm:text-base fill-yellow-400" />
                      ))}
                    </span>
                    <span className="text-gray-900 font-semibold text-sm sm:text-base">5.0</span>
                    <span className="text-gray-900 font-normal text-sm sm:text-base hover:text-teal-600">
                      Zobacz opinie pacjentów w Google
                    </span>
                  </a>
                </div>
              </div>

              <div className="flex-1 w-full lg:w-1/2 flex justify-center lg:justify-end items-center px-4 md:px-0">
                <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                  <img
                    src={HERO_IMAGE}
                    alt="Ortopeda dziecięcy z dzieckiem podczas konsultacji – Centrum Medyczne 7, Skarżysko-Kamienna"
                    className="w-full h-auto object-contain rounded-2xl shadow-sm"
                    loading="eager"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: lek. Łukasz Dubiel */}
        <section
          className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="doctor-section-heading"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2
                id="doctor-section-heading"
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 px-2"
              >
                <a
                  href="https://centrummedyczne7.pl/lekarze/lukasz-dubiel"
                  className="hover:text-teal-700 transition-colors"
                >
                  lek. Łukasz Dubiel - ortopeda dziecięcy Skarżysko
                </a>
              </h2>
              <div className="w-20 sm:w-24 h-1 bg-teal-600 mx-auto" aria-hidden />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-start">
              {/* Doctor card */}
              <div className="bg-gray-50 rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <img
                  src={DOCTOR_PHOTO}
                  alt="lek. Łukasz Dubiel – ortopeda dziecięcy, Centrum Medyczne 7"
                  className="w-full max-h-[min(70vh,480px)] object-cover object-top rounded-t-xl"
                  loading="lazy"
                />
                <div className="p-6 sm:p-8 text-center space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">lek. Łukasz Dubiel</h3>
                  <a
                    href={ORTHOPEDA_SERVICE_URL}
                    className="block cursor-pointer text-teal-600 font-medium text-base sm:text-lg pb-4 hover:text-teal-700 underline-offset-2 hover:underline"
                  >
                    Ortopeda dziecięcy
                  </a>
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = ORTHOPEDA_SERVICE_URL;
                      }}
                      className="w-full inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Umów wizytę online
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = REGISTRATION_TEL;
                      }}
                      className="w-full inline-flex items-center justify-center bg-white border-2 border-teal-600 text-teal-600 font-semibold py-3 px-4 rounded-lg hover:bg-teal-50 transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Rejestracja: 797 127 487
                    </button>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="text-left space-y-4 sm:space-y-5 text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                  Specjalista ortopedii i traumatologii narządu ruchu
                </h3>
                <p>
                  Lek. Łukasz Dubiel jest specjalistą ortopedii, traumatologii narządu ruchu oraz medycyny
                  sportowej. Prywatnie przyjmuje pacjentów w Centrum Medycznym 7 w Skarżysku-Kamiennej, a
                  zawodowo współpracuje także ze szpitalami na terenie Kielc.
                </p>
                <p>
                  Ukończył studia na Uniwersytecie Medycznym im. Karola Marcinkowskiego w Poznaniu w 2010 roku.
                  Doświadczenie zawodowe zdobywał w placówkach na terenie województwa świętokrzyskiego – m.in.
                  w Kielcach, Busku-Zdroju oraz Staszowie.
                </p>
                <p>
                  W praktyce z dziećmi koncentruje się na diagnostyce i leczeniu wad postawy, skolioz,
                  płaskostopia oraz – co jest szczególnie ważne dla rodziców niemowląt – na wczesnej
                  ultrasonograficznej ocenie bioderek pod kątem dysplazji stawu biodrowego (USG bioderek).
                </p>
                <p>
                  Konsultacje ortopedyczne dla dzieci i młodzieży odbywają się w Centrum Medycznym 7 w
                  Skarżysku-Kamiennej przy ul. Powstańców Warszawy 7/1.5. Zapisy na wizytę możliwe są
                  telefonicznie lub online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Kiedy zgłosić się do ortopedy */}
        <section
          className="bg-[#F7F9FA] py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="when-visit-heading"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <h2
              id="when-visit-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-left leading-tight mb-2"
            >
              <span className="block">Ortopeda dziecięcy Skarżysko-Kamienna – kiedy</span>
              <span className="block">zgłosić się z dzieckiem do ortopedy?</span>
            </h2>
            <div className="w-[5.5rem] sm:w-24 h-1 bg-teal-600 mb-6" aria-hidden />

            <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-4xl">
              W ortopedii dziecięcej czas ma kluczowe znaczenie, ponieważ w okresie wzrostu wiele
              nieprawidłowości narządu ruchu może szybko się utrwalić. W przypadku utrzymujących się
              dolegliwości lub niepokojących objawów warto skonsultować dziecko z ortopedą dziecięcym w
              Skarżysku w Centrum Medycznym 7.
            </p>

            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 md:p-10 mb-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">
                Najczęstsze powody wizyty u ortopedy dziecięcego:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <ul className="space-y-4" role="list">
                  {SECTION3_VISIT_REASONS_LEFT.map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center mt-0.5"
                        aria-hidden
                      >
                        <FaCheck className="text-white w-3 h-3" />
                      </span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-4" role="list">
                  {SECTION3_VISIT_REASONS_RIGHT.map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center mt-0.5"
                        aria-hidden
                      >
                        <FaCheck className="text-white w-3 h-3" />
                      </span>
                      <span className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border-l-4 border-teal-600 bg-[#E8F5F5] p-6 sm:p-8 md:p-10 shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                Kiedy potrzebna jest pilna konsultacja z ortopedą dziecięcym?
              </h3>
              <ul className="space-y-3 sm:space-y-4" role="list">
                {SECTION3_URGENT_REASONS.map((text) => (
                  <li key={text} className="flex items-start gap-3">
                    <FaExclamationTriangle
                      className="flex-shrink-0 text-teal-600 w-6 h-6 sm:w-7 sm:h-7 mt-0.5"
                      aria-hidden
                    />
                    <span className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed pt-0.5">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: Diagnostyka, leczenie, cennik */}
        <section
          className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="diagnostics-heading"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <h2
              id="diagnostics-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-left leading-tight mb-2"
            >
              Ortopeda dziecięcy – diagnostyka i leczenie
            </h2>
            <div className="w-[5.5rem] sm:w-24 h-1 bg-teal-600 mb-6 sm:mb-8" aria-hidden />

            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4">
              Konsultacja ortopedyczna dziecięca (prywatnie, bez skierowania)
            </h3>
            <div className="space-y-4 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-4xl">
              <p>
                Konsultacja ortopedyczna dziecięca w Centrum Medycznym 7 obejmuje szczegółowy wywiad z
                rodzicem oraz badanie dziecka z uwzględnieniem wieku i zgłaszanych dolegliwości. Lekarz
                ocenia układ ruchu, postawę ciała oraz – w razie potrzeby – zleca dalszą diagnostykę lub
                zaleca obserwację.
              </p>
              <p>
                Na podstawie badania ortopeda dziecięcy omawia z rodziną rozpoznanie i możliwe dalsze kroki,
                w tym leczenie zachowawcze, rehabilitację lub skierowanie na badania uzupełniające. Wizyta
                odbywa się w spokojnej atmosferze dostosowanej do wieku pacjenta.
              </p>
            </div>

            <div className="rounded-xl sm:rounded-2xl bg-[#F0F7F6] p-5 sm:p-6 md:p-8 mb-10 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6">
              <div className="text-left">
                <p className="font-bold text-gray-900 text-base sm:text-lg md:text-xl">
                  <a
                    href="https://centrummedyczne7.pl/uslugi/konsultacja-ortopedy-dzieciecego"
                    className="hover:text-teal-700 transition-colors"
                  >
                    Konsultacja ortopedy dziecięcego
                  </a>
                </p>
                <p className="text-gray-800 text-base sm:text-lg mt-1">300 zł</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = APPOINTMENT_URL;
                }}
                className="shrink-0 inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
              >
                Umów wizytę
              </button>
            </div>

            <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4">
              <a
                href="https://www.centrummedyczne7.pl/uslugi/usg-bioderek"
                className="hover:text-teal-700 transition-colors"
              >
                USG bioderek u niemowląt
              </a>{" "}
              (diagnostyka dysplazji stawu biodrowego)
            </h3>
            <div className="space-y-4 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-4xl">
              <p>
                USG bioderek u niemowląt pozwala na wczesne wykrycie dysplazji stawu biodrowego –
                schorzenia, które leczone od początku daje najlepsze rokowania. Badanie jest
                nieinwazyjne, nie powoduje bólu i może zostać wykonane u kilkutygodniowego dziecka.
              </p>
              <p>
                W CM7 wykorzystujemy nowoczesny aparat ultrasonograficzny Samsung HS40, który zapewnia
                wysoką jakość obrazu i precyzyjną ocenę anatomii stawu biodrowego. Termin i konieczność
                badania ustala lekarz po konsultacji, zgodnie ze wskazaniami medycznymi.
              </p>
            </div>

            <div className="rounded-xl sm:rounded-2xl bg-[#F0F7F6] p-5 sm:p-6 md:p-8 mb-8 sm:mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-8">
              <div className="text-left max-w-xl">
                <p className="font-bold text-gray-900 text-base sm:text-lg md:text-xl">
                  <a
                    href="https://www.centrummedyczne7.pl/uslugi/usg-bioderek"
                    className="hover:text-teal-700 transition-colors"
                  >
                    USG bioderek u niemowląt
                  </a>
                </p>
                <p className="text-gray-600 text-sm sm:text-base mt-2 leading-relaxed">
                  W ramach konsultacji, zgodnie ze wskazaniami medycznymi
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = APPOINTMENT_URL;
                  }}
                  className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
                >
                  Umów wizytę
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = REGISTRATION_TEL;
                  }}
                  className="inline-flex items-center justify-center bg-white border-2 border-teal-600 text-teal-600 font-semibold py-3 px-6 rounded-lg hover:bg-teal-50 transition-colors text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
                >
                  Zadzwoń: 797 127 487
                </button>
              </div>
            </div>

            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-4xl">
              Podane ceny mają charakter informacyjny i nie stanowią oferty handlowej. Aktualne informacje
              cenowe dostępne są{" "}
              <a href="/uslugi" className="text-gray-600 underline underline-offset-2 hover:text-teal-600">
                tutaj
              </a>
              .
            </p>
          </div>
        </section>

        {/* Section 5: USG bioderek Skarżysko */}
        <section
          className="bg-[#F7F9FA] py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="usg-bioderka-heading"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <h2
              id="usg-bioderka-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-left leading-tight mb-2"
            >
              <span className="block">USG bioderek Skarżysko – kiedy wykonać badanie</span>
              <span className="block">i dlaczego jest tak ważne?</span>
            </h2>
            <div className="w-[5.5rem] sm:w-24 h-1 bg-teal-600 mb-6 sm:mb-8" aria-hidden />

            <div className="space-y-4 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-4xl">
              <p>
                USG bioderek u niemowląt to podstawowe badanie przesiewowe, które pozwala ocenić rozwój
                stawów biodrowych i wcześnie wykryć m.in. dysplazję czy niedojrzałość stawu. Im wcześniej
                zostaną rozpoznane nieprawidłowości, tym skuteczniejsze bywa leczenie i większa szansa na
                prawidłowy rozwój układu ruchu dziecka.
              </p>
              <p className="font-bold text-gray-900">
                Najczęściej zalecany termin badania: między 4. a 8. tygodniem życia.
              </p>
            </div>

            <div className="rounded-xl sm:rounded-2xl bg-[#F0F7F6] p-6 sm:p-8 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5">
                    Co wykrywa USG bioderek?
                  </h3>
                  <ul className="space-y-3 sm:space-y-4" role="list">
                    {SECTION5_USG_DETECT_ITEMS.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <FaCheck
                          className="flex-shrink-0 text-teal-600 w-4 h-4 sm:w-[18px] sm:h-[18px] mt-1"
                          aria-hidden
                        />
                        <span className="text-gray-800 text-sm sm:text-base md:text-lg leading-relaxed">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5">
                    Przebieg badania
                  </h3>
                  <div className="space-y-4 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
                    <p>
                      Badanie trwa kilka minut i nie powoduje bólu. Jest całkowicie bezpieczne dla
                      niemowlęcia i nie wymaga specjalnego przygotowania.
                    </p>
                    <p>
                      Wykonywane jest przez doświadczonego ortopedę dziecięcego z użyciem nowoczesnego
                      sprzętu ultrasonograficznego.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Poradnia – zakres konsultacji */}
        <section
          className="bg-white py-8 sm:py-12 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="clinic-scope-heading"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
            <h2
              id="clinic-scope-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-left leading-tight mb-1"
            >
              <a
                href="https://cm7zdrowie.pl/poradnia-ortopedyczna-dla-dzieci/"
                className="hover:text-teal-700 transition-colors"
              >
                <span className="block">Poradnia ortopedyczna dla dzieci</span>
                <span className="block mt-1">{`w${"\u00A0"}Skarżysku${"\u2011"}Kamiennej`}</span>
              </a>
            </h2>
            <div className="w-[4.5rem] sm:w-24 h-1 bg-teal-600 mb-6 sm:mb-8" aria-hidden />

            <div className="space-y-4 sm:space-y-5 text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10 max-w-4xl">
              <p>
                Poradnia ortopedyczna dla dzieci w Skarżysku-Kamiennej zajmuje się diagnostyką i leczeniem
                schorzeń narządu ruchu u niemowląt, dzieci i młodzieży. Szczególny zakres opieki obejmuje
                diagnostykę dysplazji stawów biodrowych u niemowląt z wykorzystaniem badania USG bioderek.
              </p>
              <p>
                Prowadzimy diagnostykę i leczenie wad postawy, skoliozy, płaskostopia oraz zaburzeń osi
                kończyn. Konsultacje obejmują również urazy oraz dolegliwości bólowe narządu ruchu u dzieci
                i młodzieży.
              </p>
              <p>
                Zakres poradni obejmuje szerokie spektrum problemów z zakresu ortopedii i traumatologii
                dziecięcej. W trakcie wizyty wykonywane jest badanie ortopedyczne, ocena postawy i chodu
                oraz – w razie wskazań – USG bioderek.
              </p>
              <p>
                Każda konsultacja ortopedyczna obejmuje szczegółowy wywiad, badanie kliniczne oraz ocenę
                rozwoju układu ruchu dziecka. W zależności od wskazań lekarz dobiera dalsze postępowanie
                diagnostyczne lub zalecenia, dostosowane indywidualnie do wieku oraz etapu rozwoju
                pacjenta.
              </p>
            </div>

            <div className="rounded-xl sm:rounded-2xl bg-[#f0f9f8] p-6 sm:p-8 md:p-10">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-5 sm:mb-6">
                Zakres konsultacji ortopedycznej obejmuje:
              </h3>
              <ul className="space-y-3 sm:space-y-3.5" role="list">
                {SECTION6_SCOPE_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <FaCheck
                      className="flex-shrink-0 text-teal-600 w-4 h-4 mt-0.5 sm:mt-1"
                      aria-hidden
                    />
                    <span className="text-slate-600 text-sm sm:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 7: Medycyna sportowa */}
        <section
          className="bg-[#F7F9FA] py-10 sm:py-14 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="sports-medicine-heading"
        >
          <div className="max-w-3xl mx-auto px-6 sm:px-8 md:px-10 text-center">
            <h2
              id="sports-medicine-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3"
            >
              Medycyna sportowa Skarżysko – leczenie kontuzji, urazów i kwalifikacja do sportu
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-teal-600 mx-auto mb-8 sm:mb-10" aria-hidden />

            <div className="bg-white rounded-xl shadow-md shadow-gray-200/80 p-6 sm:p-8 md:p-10 text-left">
              <div className="space-y-4 sm:space-y-5 text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                <p>
                  Konsultacje w poradni medycyny sportowej w Skarżysku obejmują leczenie kontuzji
                  sportowych, urazów i przeciążeń narządu ruchu oraz{" "}
                  <a
                    href="https://centrummedyczne7.pl/uslugi/kwalifikacja-do-uprawiania-sportu"
                    className="text-teal-700 hover:text-teal-800 underline underline-offset-2"
                  >
                    kwalifikację do uprawiania sportu
                  </a>
                  .
                </p>
                <p>
                  Lekarz medycyny sportowej przeprowadza diagnostykę dolegliwości związanych z aktywnością
                  fizyczną, ocenę zdolności do treningu oraz przygotowanie do powrotu do sportu po urazach.
                </p>
                <p>
                  Z konsultacji korzystają pacjenci ze Skarżyska-Kamiennej oraz okolicznych miast –
                  <a
                    href="https://cm7zdrowie.pl/medycyna-sportowa-starachowice/"
                    className="text-teal-700 hover:text-teal-800 underline underline-offset-2"
                  >
                    Starachowic
                  </a>
                  , Kielce,{" "}
                  <a
                    href="https://cm7zdrowie.pl/medycyna-sportowa-radom/"
                    className="text-teal-700 hover:text-teal-800 underline underline-offset-2"
                  >
                    Radomia
                  </a>{" "}
                  i całego województwa świętokrzyskiego. Oferujemy szybkie
                  terminy wizyt oraz kompleksowe podejście do leczenia urazów sportowych i przeciążeń.
                </p>
              </div>
              <div className="flex justify-center mt-8 sm:mt-10">
                <a
                  href="https://cm7zdrowie.pl/medycyna-sportowa-skarzysko/"
                  className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors text-sm sm:text-base text-center"
                >
                  Medycyna sportowa - zobacz więcej
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Region – miasta */}
        <section
          className="bg-[#E8F5F3] py-10 sm:py-14 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="region-cities-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
            <h2
              id="region-cities-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center leading-tight mb-2 max-w-4xl mx-auto"
            >
              <span className="block">Ortopeda dla pacjentów z wielu miast regionu</span>
              <span className="block mt-1">
                {"– "}
                {`Skarżysko${"\u00A0"}i${"\u00A0"}okolice`}
              </span>
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-teal-600 mx-auto mb-6 sm:mb-8" aria-hidden />

            <p className="text-center text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed mb-8 sm:mb-10 max-w-3xl mx-auto">
              Do Centrum Medycznego 7 w Skarżysku{"\u2011"}Kamiennej zgłaszają się pacjenci szukający
              ortopedy z wielu miast i miejscowości regionu świętokrzyskiego czy mazowieckiego, m.in.:
            </p>

            <ul
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 list-none p-0 m-0 mb-8 sm:mb-10"
              role="list"
            >
              {SECTION8_CITY_LABELS.map((city) => (
                <li key={city}>
                  <a
                    href={getCityOrthopedicsUrl(city)}
                    className="bg-white rounded-xl border border-[#E5E7EB] px-2 py-3 sm:px-3 sm:py-4 text-center flex flex-col items-center justify-center min-h-[4.5rem] sm:min-h-[5rem] hover:border-teal-300 hover:bg-teal-50 transition-colors"
                  >
                    <span className="block text-xs sm:text-sm font-medium text-[#4B5563] leading-tight">
                      Ortopeda
                    </span>
                    <span className="block text-xs sm:text-sm font-medium text-[#4B5563] mt-1 leading-snug whitespace-nowrap">
                      {formatCityNoBreak(city)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-7 md:p-8">
              <p className="text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed text-left">
                Poradnia ortopedyczna dla dzieci Centrum Medyczne 7 mieści się w Skarżysku
                {"\u2011"}
                Kamiennej i przyjmuje pacjentów z całego regionu, w tym z Kielc, Radomia, Starachowic oraz
                okolicznych miejscowości. Lokalizacja zapewnia dogodny dojazd z trasy S7, a bezpośrednio przy
                wejściu do przychodni dostępny jest bezpłatny parking dla pacjentów, co ułatwia wizytę
                rodzinom z dziećmi.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: FAQ */}
        <section
          className="bg-white py-10 sm:py-14 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="faq-heading"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10">
            <h2
              id="faq-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center leading-tight mb-2"
            >
              Najczęściej wyszukiwane pytania (FAQ)
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-teal-600 mx-auto mb-8 sm:mb-10" aria-hidden />

            <dl className="space-y-3 sm:space-y-4 m-0">
              {SECTION9_FAQ.map((item) => (
                <div
                  key={item.q}
                  className="rounded-xl bg-slate-50 border border-slate-100/80 px-5 py-4 sm:px-6 sm:py-5"
                >
                  <dt className="text-sm sm:text-base font-bold text-gray-900 leading-snug m-0">
                    {item.q}
                  </dt>
                  <dd className="text-sm sm:text-base text-slate-600 leading-relaxed m-0 mt-2 sm:mt-2.5">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Section 10: CTA – umów wizytę */}
        <section
          className="bg-[#2D9B9B] py-12 sm:py-16 md:py-20 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="cta-booking-heading"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
            <h2
              id="cta-booking-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-5 sm:mb-6"
            >
              <span className="block">Umów wizytę – ortopeda dziecięcy</span>
              <span className="block mt-1">Skarżysko prywatnie</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-white/95 leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
              <span className="block">
                Jeżeli potrzebny jest ortopeda dziecięcy prywatnie w Skarżysku-Kamiennej
              </span>
              <span className="block mt-1">
                lub chcesz wykonać USG bioderek, zapraszamy do Centrum Medycznego 7.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12">
              <a
                href={REGISTRATION_TEL}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 sm:py-3.5 text-[#2D9B9B] font-semibold text-sm sm:text-base shadow-sm hover:bg-[#E8F5F3] transition-colors"
              >
                <FaPhone className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 scale-x-[-1]" aria-hidden />
                Rejestracja: 797 127 487
              </a>
              <a
                href={APPOINTMENT_URL}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white bg-transparent px-5 py-3 sm:py-3.5 text-white font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors"
              >
                <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" aria-hidden />
                Rezerwacja online
              </a>
            </div>

            <address className="not-italic text-xs sm:text-sm text-white/90 leading-relaxed space-y-0.5">
              <a
                href="https://www.centrummedyczne7.pl/kontakt"
                className="inline-block hover:text-white underline underline-offset-2"
              >
                <p className="m-0">Centrum Medyczne 7</p>
                <p className="m-0">ul. Powstańców Warszawy 7/1.5</p>
                <p className="m-0">Skarżysko-Kamienna, świętokrzyskie</p>
              </a>
            </address>
          </div>
        </section>

        {/* Section 11: Ortopeda dla dorosłych */}
        <section
          className="bg-white py-10 sm:py-14 md:py-16 w-screen relative left-1/2 -translate-x-1/2"
          aria-labelledby="adult-orthopedics-heading"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10">
            <h2
              id="adult-orthopedics-heading"
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center leading-tight mb-2"
            >
              <a
                href={ADULT_ORTHOPEDICS_SERVICE_PATH}
                className="hover:text-teal-700 transition-colors"
              >
                <span className="block">Ortopeda Skarżysko –</span>
                <span className="block mt-1">konsultacja dla dorosłych</span>
              </a>
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-teal-600 mx-auto mb-8 sm:mb-10" aria-hidden />

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
              <div className="text-left text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed space-y-4 sm:space-y-5 max-w-2xl mx-auto">
                <p className="m-0">
                  W Centrum Medycznym 7 w Skarżysku{"\u2011"}Kamiennej działa{" "}
                  <a
                    href="https://cm7zdrowie.pl/poradnia-ortopedyczna-skarzysko/"
                    className="text-teal-700 hover:text-teal-800 underline underline-offset-2"
                  >
                    poradnia ortopedyczna
                  </a>
                  , w której przyjmuje również ortopeda dla dorosłych. Konsultacje obejmują ocenę stanu
                  narządu ruchu oraz diagnostykę dolegliwości ortopedycznych.
                </p>
                <p className="m-0">
                  Na stronie znajdziesz szczegółowe informacje dotyczące konsultacji ortopedycznych dla
                  dorosłych, zakresu wizyt oraz dostępnych terminów.
                </p>
              </div>
              <div className="flex justify-center mt-8 sm:mt-10">
                <a
                  href={ADULT_ORTHOPEDICS_SERVICE_PATH}
                  className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors text-sm sm:text-base text-center"
                >
                  Ortopeda Skarżysko - zobacz
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PediatricOrthopedistPage;
