const RPW_MARKERS = [
  "alprazolam",
  "bromazepam",
  "chlordiazepoxid",
  "clobazam",
  "clonazepam",
  "clorazepat",
  "diazepam",
  "estazolam",
  "flunitrazepam",
  "flurazepam",
  "lorazepam",
  "lormetazepam",
  "medazepam",
  "midazolam",
  "nitrazepam",
  "oxazepam",
  "prazepam",
  "temazepam",
  "tetrazepam",
  "triazolam",
  "zolpidem",
  "zopiclon",
  "zaleplon",
  "methylphenidat",
  "metylofenidat",
  "dexmethylphenidat",
  "lisdexamfetamin",
  "dextroamfetamin",
  "amfetamin",
  "modafinil",
  "phenobarbital",
  "fenobarbital",
  "ketamin",
  "fentanyl",
  "oxycodon",
  "oksycodon",
  "hydromorphon",
  "hydromorfon",
  "morphin",
  "morfin",
  "methadon",
  "metadon",
  "buprenorfin",
  "tapentadol",
  "pethidin",
  "petydyn",
  "xanax",
  "mozarin",
  "zomiren",
  "afobam",
  "relanium",
  "rivotril",
  "stilnox",
  "imovane",
  "concerta",
  "medikinet",
  "equasym",
  "kinecteen",
  "targin",
  "oxycontin",
  "durogesic",
  "suboxone",
  "bunondol",
];

function haystack(row) {
  return [
    row?.name,
    row?.substance,
    row?.activeSubstance,
    row?.latinName,
  ]
    .map((part) => String(part || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    .join(" ");
}

export function inferredRpw(row) {
  const text = haystack(row);
  if (!text.trim()) return false;
  return RPW_MARKERS.some((marker) => text.includes(marker));
}

export function classifyDrug(row) {
  if (row?.isRpw === true || row?.isRpw === 1 || row?.isRpw === "true" || row?.isRpw === "1") return "Rpw";
  const raw = String(row?.kdlek || row?.category || row?.prescriptionType || "").trim().toLowerCase();
  if (raw === "rpw" || inferredRpw(row)) return "Rpw";
  if (raw === "rpz") return "Rpz";
  if (raw === "rp") return "Rp";
  if (raw === "otc") return "OTC";
  return inferredRpw(row) ? "Rpw" : "";
}
