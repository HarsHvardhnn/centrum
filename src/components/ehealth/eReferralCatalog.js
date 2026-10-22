import { RESORT_CODE_ROWS, RESORT_SECTIONS } from "./resortCodeList";

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

const REHAB_NAME = /rehabilit|fizjoter|fizykoter|kinezyter|hydroter|krioter|balneoter|masa[żz]u leczn/i;

/** Which referral types a unit can be chosen for. A unit may fit more than one. */
function referralCategories([code, name, section]) {
  const categories = [];
  if (section === "0" || section === "1") categories.push("specialist_clinic");
  if (section === "7") categories.push("diagnostic_exam");
  if (section === "4" || section === "5") categories.push("hospital_treatment");
  if (section === "0" || /szczepie/i.test(name)) categories.push("vaccination");
  if (REHAB_NAME.test(name)) categories.push("rehabilitation");
  return categories;
}

export const RESORT_CODES = RESORT_CODE_ROWS.map((row) => {
  const [code, name, section] = row;
  return {
    code,
    name,
    section,
    group: RESORT_SECTIONS[section] || "",
    categories: referralCategories(row),
    full: `${code} - ${name}`,
  };
});

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
  { value: "", label: "Strona ciała: Brak" },
  { value: "left", label: "Strona: Lewa" },
  { value: "right", label: "Strona: Prawa" },
  { value: "both", label: "Strona: Lewa i prawa" },
];

export const RESORT_HINTS = {
  specialist_clinic: "Poradnie: kody 0xxx–1xxx (wg rozporządzenia MZ)",
  diagnostic_exam: "Pracownie diagnostyczne i zabiegowe: kody 7xxx",
  hospital_treatment: "Oddziały szpitalne i zakłady opiekuńcze: kody 4xxx–5xxx",
  vaccination: "Punkty szczepień, poradnie POZ i szczepień",
  rehabilitation: "Poradnie i pracownie rehabilitacyjne oraz fizjoterapii",
};
