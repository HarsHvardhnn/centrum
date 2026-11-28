export const NFZ_BRANCHES = [
  { code: "01", label: "01 - Dolnośląski Oddział Wojewódzki NFZ" },
  { code: "02", label: "02 - Kujawsko-Pomorski Oddział Wojewódzki NFZ" },
  { code: "03", label: "03 - Lubelski Oddział Wojewódzki NFZ" },
  { code: "04", label: "04 - Lubuski Oddział Wojewódzki NFZ" },
  { code: "05", label: "05 - Łódzki Oddział Wojewódzki NFZ" },
  { code: "06", label: "06 - Małopolski Oddział Wojewódzki NFZ" },
  { code: "07", label: "07 - Mazowiecki Oddział Wojewódzki NFZ" },
  { code: "08", label: "08 - Opolski Oddział Wojewódzki NFZ" },
  { code: "09", label: "09 - Podkarpacki Oddział Wojewódzki NFZ" },
  { code: "10", label: "10 - Podlaski Oddział Wojewódzki NFZ" },
  { code: "11", label: "11 - Pomorski Oddział Wojewódzki NFZ" },
  { code: "12", label: "12 - Śląski Oddział Wojewódzki NFZ" },
  { code: "13", label: "13 - Świętokrzyski Oddział Wojewódzki NFZ" },
  { code: "14", label: "14 - Warmińsko-Mazurski Oddział Wojewódzki NFZ" },
  { code: "15", label: "15 - Wielkopolski Oddział Wojewódzki NFZ" },
  { code: "16", label: "16 - Zachodniopomorski Oddział Wojewódzki NFZ" },
];

export const REFERRAL_TYPES = [
  { value: "specialist_clinic", label: "Do poradni specjalistycznej" },
  { value: "diagnostic_exam", label: "Do pracowni diagnostycznej" },
  { value: "hospital_treatment", label: "Na pobyt w szpitalu" },
  { value: "vaccination", label: "Na szczepienie" },
  { value: "rehabilitation", label: "Na rehabilitację" },
];

export const COMMON_ICD9 = [
  { code: "88.721", name: "Echokardiografia serca" },
  { code: "89.41", name: "Badanie wysiłkowe serca" },
  { code: "89.501", name: "Holter EKG 24h" },
  { code: "89.502", name: "Holter RR" },
  { code: "89.522", name: "EKG spoczynkowe" },
  { code: "87.440", name: "RTG klatki piersiowej" },
  { code: "88.761", name: "USG jamy brzusznej" },
  { code: "45.13", name: "Gastroskopia diagnostyczna" },
  { code: "45.23", name: "Kolonoskopia diagnostyczna" },
  { code: "89.371", name: "Spirometria" },
  { code: "89.141", name: "Badanie EEG" },
  { code: "93.1", name: "Ćwiczenia lecznicze" },
];

export const ANATOMICAL_SITES = [
  { value: "", label: "Strona ciała: brak" },
  { value: "left", label: "Strona: lewa" },
  { value: "right", label: "Strona: prawa" },
  { value: "both", label: "Strona: obie" },
];

export const SITE_LABELS = { left: "lewa", right: "prawa", both: "obie" };

export const RESORT_HINTS = {
  specialist_clinic: "Poradnie: kody 1xxx",
  diagnostic_exam: "Pracownie diagnostyczne i zabiegowe: kody 7xxx",
  hospital_treatment: "Oddziały szpitalne: kody 4xxx",
  vaccination: "Punkty szczepień, poradnie POZ i szczepień",
  rehabilitation: "Poradnie i pracownie rehabilitacyjne oraz fizjoterapii",
};

export const PURPOSE_HINTS = {
  specialist_clinic: "Po co kierujesz? np. konsultacja i ustalenie leczenia, kontrola po zabiegu",
  diagnostic_exam: "Jakie badanie i co ma wykluczyć/potwierdzić? np. TK głowy – wykluczenie zmian ogniskowych",
  hospital_treatment: "Cel pobytu: np. planowa operacja, diagnostyka, leczenie zaostrzenia",
  rehabilitation: "Zlecone zabiegi, przeciwwskazania, ocena funkcjonalna (np. skala Rankina)",
  vaccination: "Jaka szczepionka / przeciw czemu, dawka, ewentualne uwagi",
};
