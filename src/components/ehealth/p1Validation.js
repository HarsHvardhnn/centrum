/** Client-side twins of the backend P1 doctor checks (centrum-be/ehealth/doctorAccess.js). */

export function isValidPesel(pesel) {
  const v = String(pesel || "");
  if (!/^\d{11}$/.test(v)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(v[i]), 0);
  return (10 - (sum % 10)) % 10 === Number(v[10]);
}

/** Error text for a PWZ number given the P1 role, or "" when fine / empty. */
export function pwzError(npwz, role) {
  const v = String(npwz || "").trim().toUpperCase();
  if (!v) return "";
  if (role === "LEK" || role === "LEKD") {
    if (!/^\d{7}$/.test(v)) return "Numer PWZ lekarza musi mieć 7 cyfr";
    const sum = [1, 2, 3, 4, 5, 6].reduce((acc, w) => acc + w * Number(v[w]), 0);
    return sum % 11 === Number(v[0]) ? "" : "Numer PWZ ma nieprawidłową cyfrę kontrolną";
  }
  if (role === "PIEL") return /^\d{7}[PA]$/.test(v) ? "" : "Numer PWZ pielęgniarki/położnej to 7 cyfr i litera P lub A";
  return /^\d{4,7}$/.test(v) ? "" : "Numer PWZ musi mieć od 4 do 7 cyfr";
}

export const isDoctorRole = (role) => role === "LEK" || role === "LEKD";
