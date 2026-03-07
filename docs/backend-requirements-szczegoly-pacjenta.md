# Backend requirements: "Szczegóły pacjenta" (Patient details) panel

The doctor’s visit view includes a right-side panel **"Szczegóły pacjenta"** (operational overview before a visit). The frontend expects the following from your APIs. No breaking changes are required if you already expose equivalent fields under different names; the list below is the target shape.

---

## 1. Patient details endpoint (right panel data)

**Current frontend call:**  
`GET /patients/det/reports/:patientId?appointmentId=:appointmentId`  
(Used by `doctorService.getPatientDetailsAndReports(patientId, appointmentId)`.)

**Response body** should be a single object (or nested under a key like `data`) with at least:

| Purpose | Required | Field names accepted (any one) | Example / notes |
|--------|----------|---------------------------------|------------------|
| Full name | Yes | `name` (string) **or** `name.first` + `name.last` | `"Jan Kowalski"` or `{ first: "Jan", last: "Kowalski" }` |
| PESEL | Yes | `pesel`, `PESEL`, `identificationNumber` | `"12345678910"`. If missing, UI shows "Brak PESEL – niezweryfikowany". |
| Phone | Yes | `phone`, `phoneNumber`, `telephone` | If missing or empty, UI shows label "Telefon:" with empty value. |
| Patient ID | Yes | `patientId`, `patient_id`, `id` | e.g. `"P-1765638964024"`. If missing, UI shows "Brak ID – niezweryfikowany". |
| Allergies | For "Profil medyczny" | `allergies`, `allergy` | String. If missing/empty, UI shows "Brak informacji". |
| Last visit date | For "Ostatnia wizyta" | `lastVisit`, `last_visit`, `previousVisit` | Displayed as-is (e.g. `"12.02.2026"` or `"05.01.2026, 16:00-16:20"`). If missing, UI shows "Pierwsza wizyta". |
| Last diagnosis (ICD-10) | For "Ostatnie rozpoznanie" | `lastDiagnosis`, `last_diagnosis`, `icd10`, `lastIcd10` | e.g. `"I10 – Nadciśnienie tętnicze"`. If missing, UI shows "Brak rozpoznania". |
| Medications | For "Leki przyjmowane na stałe" | `medications` (array of objects) | See table below. Only items with `status === "Aktywny"` or `"active"` are shown. |

**Medications** (each element of `medications`):

| Purpose | Field names accepted (any one) | Example |
|--------|--------------------------------|--------|
| Name | `name`, `nazwa` | `"Metformina 500 mg"` |
| Dosage | `dosage`, `dawkowanie` | `"500 mg"` (or combined with name) |
| Frequency | `frequency`, `czystotliwosc` | `"2× dziennie"`, `"1X RANO"` |
| Status (filter) | `status` | Only include or mark as `"Aktywny"` or `"active"` for display. Inactive medications are not shown. |

- Do **not** add fields that the UI no longer uses for this panel: email, avatar, blood pressure, pulse, weight, prescription ID, separate "Uwagi medyczne", or "Nie nagrane" placeholders. They can remain in the API for other screens; the frontend simply ignores them here.

---

## 2. Doctor appointments list (for list + current visit in panel)

**Current frontend call:**  
`GET /appointments/doctor/:doctorId?startDate=...&endDate=...&status=...&page=...&limit=...`  
(Used by `appointmentHelper.getDoctorAppointments(...)`.)

**Each appointment object** in the response array (or in `data` / `appointments`) should include at least:

| Purpose | Required | Field names accepted (any one) | Example / notes |
|--------|----------|--------------------------------|------------------|
| Appointment ID | Yes | `id` | Used for selection and loading patient details. |
| Patient ID | Yes | `patient_id`, `patientId` | Used to open patient details and "Przejdź do wizyty". |
| Patient name | Yes | `name` | Displayed in list and in panel header. |
| Status | Yes | `status` | `"booked"` or `"checkedIn"` (or `"checked_in"`). Used for list and for "Status wizyty" in panel. |
| Start time | Yes | `startTime`, `start_time` | e.g. `"10:00"`. Used in list "Czas" column and in panel "Godzina wizyty". |
| End time | Yes | `endTime`, `end_time` | e.g. `"10:20"`. |
| Visit date | For panel "Data wizyty" | `date`, `startDate`, `appointmentDate` | ISO date or date string so frontend can format as "Czwartek, 16.01.2026". |
| Consultation type | For panel "Typ wizyty" | `consultationType`, `visitType` | e.g. `"Konsultacja pierwszorazowa"`. If missing, UI shows "Brak informacji". |

---

## 3. Summary checklist for backend

- [ ] **GET patient details** (`/patients/det/reports/:patientId?appointmentId=...`):  
  Returns at least: name, PESEL (or equivalent), phone, patient ID, allergies, last visit, last diagnosis (ICD-10), and `medications` array with name, dosage, frequency, and status (only "Aktywny"/"active" shown).
- [ ] **GET doctor appointments** (`/appointments/doctor/:doctorId?...`):  
  Each appointment includes: `id`, `patient_id`, `name`, `status`, `startTime`/`start_time`, `endTime`/`end_time`, visit date (`date`/`startDate`/`appointmentDate`), and consultation type (`consultationType`/`visitType`) if available.

If your API already returns these (under the same or the alternative names above), no backend changes are required. If field names differ, either align the backend to one of the accepted names or inform the frontend team so they can add the mapping.
