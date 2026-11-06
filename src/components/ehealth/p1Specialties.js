/**
 * Specjalizacje lekarzy i lekarzy dentystów (kod 4-cyfrowy) — załącznik nr 1 do rozporządzenia
 * Ministra Zdrowia (Dz.U. 2019 poz. 602), źródło wskazane w dokumentacji Medfile
 * (practitioner.qualifications). 83 pozycje; 0704, 0710 i 0730 dotyczą lekarzy i dentystów,
 * 0781–0786 tylko dentystów.
 */

const DENTAL_ONLY = new Set(["0781", "0782", "0783", "0784", "0785", "0786"]);
const DENTAL_SHARED = new Set(["0704", "0710", "0730"]);

export const SPECIALTIES = [
  {
    "code": "0731",
    "display": "alergologia"
  },
  {
    "code": "0701",
    "display": "anestezjologia i intensywna terapia"
  },
  {
    "code": "0732",
    "display": "angiologia"
  },
  {
    "code": "0733",
    "display": "audiologia i foniatria"
  },
  {
    "code": "0734",
    "display": "balneologia i medycyna fizykalna"
  },
  {
    "code": "0702",
    "display": "chirurgia dziecięca"
  },
  {
    "code": "0735",
    "display": "chirurgia klatki piersiowej"
  },
  {
    "code": "0736",
    "display": "chirurgia naczyniowa"
  },
  {
    "code": "0703",
    "display": "chirurgia ogólna"
  },
  {
    "code": "0737",
    "display": "chirurgia onkologiczna"
  },
  {
    "code": "0738",
    "display": "chirurgia plastyczna"
  },
  {
    "code": "0704",
    "display": "chirurgia szczękowo-twarzowa"
  },
  {
    "code": "0739",
    "display": "choroby płuc"
  },
  {
    "code": "0792",
    "display": "choroby płuc dzieci"
  },
  {
    "code": "0705",
    "display": "choroby wewnętrzne"
  },
  {
    "code": "0706",
    "display": "choroby zakaźne"
  },
  {
    "code": "0707",
    "display": "dermatologia i wenerologia"
  },
  {
    "code": "0740",
    "display": "diabetologia"
  },
  {
    "code": "0708",
    "display": "diagnostyka laboratoryjna"
  },
  {
    "code": "0741",
    "display": "endokrynologia"
  },
  {
    "code": "0799",
    "display": "endokrynologia ginekologiczna i rozrodczość"
  },
  {
    "code": "0796",
    "display": "endokrynologia i diabetologia dziecięca"
  },
  {
    "code": "0710",
    "display": "epidemiologia"
  },
  {
    "code": "0742",
    "display": "farmakologia kliniczna"
  },
  {
    "code": "0743",
    "display": "gastroenterologia"
  },
  {
    "code": "0797",
    "display": "gastroenterologia dziecięca"
  },
  {
    "code": "0709",
    "display": "genetyka kliniczna"
  },
  {
    "code": "0744",
    "display": "geriatria"
  },
  {
    "code": "0787",
    "display": "ginekologia onkologiczna"
  },
  {
    "code": "0745",
    "display": "hematologia"
  },
  {
    "code": "0788",
    "display": "hipertensjologia"
  },
  {
    "code": "0746",
    "display": "immunologia kliniczna"
  },
  {
    "code": "0801",
    "display": "intensywna terapia"
  },
  {
    "code": "0747",
    "display": "kardiochirurgia"
  },
  {
    "code": "0748",
    "display": "kardiologia"
  },
  {
    "code": "0762",
    "display": "kardiologia dziecięca"
  },
  {
    "code": "0793",
    "display": "medycyna lotnicza"
  },
  {
    "code": "0794",
    "display": "medycyna morska i tropikalna"
  },
  {
    "code": "0749",
    "display": "medycyna nuklearna"
  },
  {
    "code": "0750",
    "display": "medycyna paliatywna"
  },
  {
    "code": "0711",
    "display": "medycyna pracy"
  },
  {
    "code": "0712",
    "display": "medycyna ratunkowa"
  },
  {
    "code": "0713",
    "display": "medycyna rodzinna"
  },
  {
    "code": "0714",
    "display": "medycyna sądowa"
  },
  {
    "code": "0751",
    "display": "medycyna sportowa"
  },
  {
    "code": "0716",
    "display": "mikrobiologia lekarska"
  },
  {
    "code": "0752",
    "display": "nefrologia"
  },
  {
    "code": "0798",
    "display": "nefrologia dziecięca"
  },
  {
    "code": "0753",
    "display": "neonatologia"
  },
  {
    "code": "0717",
    "display": "neurochirurgia"
  },
  {
    "code": "0718",
    "display": "neurologia"
  },
  {
    "code": "0763",
    "display": "neurologia dziecięca"
  },
  {
    "code": "0789",
    "display": "neuropatologia"
  },
  {
    "code": "0719",
    "display": "okulistyka"
  },
  {
    "code": "0755",
    "display": "onkologia i hematologia dziecięca"
  },
  {
    "code": "0754",
    "display": "onkologia kliniczna"
  },
  {
    "code": "0720",
    "display": "ortopedia i traumatologia narządu ruchu"
  },
  {
    "code": "0721",
    "display": "otorynolaryngologia"
  },
  {
    "code": "0790",
    "display": "otorynolaryngologia dziecięca"
  },
  {
    "code": "0722",
    "display": "patomorfologia"
  },
  {
    "code": "0723",
    "display": "pediatria"
  },
  {
    "code": "0795",
    "display": "pediatria metaboliczna"
  },
  {
    "code": "0800",
    "display": "perinatologia"
  },
  {
    "code": "0724",
    "display": "położnictwo i ginekologia"
  },
  {
    "code": "0725",
    "display": "psychiatria"
  },
  {
    "code": "0756",
    "display": "psychiatria dzieci i młodzieży"
  },
  {
    "code": "0726",
    "display": "radiologia i diagnostyka obrazowa"
  },
  {
    "code": "0727",
    "display": "radioterapia onkologiczna"
  },
  {
    "code": "0728",
    "display": "rehabilitacja medyczna"
  },
  {
    "code": "0757",
    "display": "reumatologia"
  },
  {
    "code": "0758",
    "display": "seksuologia"
  },
  {
    "code": "0759",
    "display": "toksykologia kliniczna"
  },
  {
    "code": "0760",
    "display": "transfuzjologia kliniczna"
  },
  {
    "code": "0761",
    "display": "transplantologia kliniczna"
  },
  {
    "code": "0729",
    "display": "urologia"
  },
  {
    "code": "0791",
    "display": "urologia dziecięca"
  },
  {
    "code": "0730",
    "display": "zdrowie publiczne"
  },
  {
    "code": "0781",
    "display": "chirurgia stomatologiczna"
  },
  {
    "code": "0782",
    "display": "ortodoncja"
  },
  {
    "code": "0783",
    "display": "periodontologia"
  },
  {
    "code": "0784",
    "display": "protetyka stomatologiczna"
  },
  {
    "code": "0785",
    "display": "stomatologia dziecięca"
  },
  {
    "code": "0786",
    "display": "stomatologia zachowawcza z endodoncją"
  }
];

/** Dictionary rows allowed for a P1 role: LEK sees medical ones, LEKD dental ones; others none. */
export function specialtiesFor(role) {
  if (role === "LEKD") return SPECIALTIES.filter((s) => DENTAL_ONLY.has(s.code) || DENTAL_SHARED.has(s.code));
  if (role === "LEK") return SPECIALTIES.filter((s) => !DENTAL_ONLY.has(s.code));
  return [];
}

export function findSpecialty(code) {
  return SPECIALTIES.find((s) => s.code === String(code || "").trim()) || null;
}
