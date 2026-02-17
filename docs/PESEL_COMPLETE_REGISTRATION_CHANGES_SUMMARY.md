# Summary: Admin-side PESEL and Complete registration changes

This document summarizes the **admin-side** frontend changes implemented for PESEL handling and the “Complete registration” flow. The backend already supports the APIs used below. User-side (public booking, patient portal) was **not** implemented in this repo as requested.

---

## 1. New files

| File | Purpose |
|------|--------|
| **`src/utils/peselUtils.js`** | PESEL helpers: `normalizePesel(value)` (digits only, max 11), `validatePeselChecksum(pesel)`, `getPeselChecksumWarning(pesel)` for optional non-blocking checksum warning. |
| **`src/components/admin/CompleteRegistrationModal.jsx`** | Reusable modal for “Zakończ rejestrację”: PESEL input (digits, max 11), GET by-pesel, “Pacjent już istnieje” + “Załaduj dane istniejącego pacjenta”, form fields, POST complete-registration, display of `peselWarning` from response (toast). |

---

## 2. API helpers

| File | Change |
|------|--------|
| **`src/helpers/patientHelper.js`** | Added **`getPatientByPesel(pesel)`** → GET `/api/patients/by-pesel?pesel=<11 digits>`. Returns `{ exists, patientId?, patient? }`. |
| **`src/helpers/appointmentHelper.js`** | Added **`completeRegistration(visitId, data)`** → POST `/api/appointments/:visitId/complete-registration` with `pesel`, `firstName`, `lastName`, `dateOfBirth`, `phone`, `email`, `sex`, `smsConsentAgreed`, `consents`. |

---

## 3. PESEL input behaviour (Section A)

- **`src/components/SubComponentForm/DemographicForm.jsx`**
  - PESEL (`govtId`): input restricted to **digits only** via `normalizePesel` in `handleChange`; **`maxLength={11}`**; `inputMode="numeric"`.
  - **Optional checksum warning**: when length is 11, `getPeselChecksumWarning(formData.govtId)` is shown below the field (amber text). Submission is **not** blocked.
- **`src/components/admin/ReceptionAppointmentForm.jsx`**
  - In the “Complete registration” phase (after visit-only creation), PESEL input uses `normalizePesel`, `maxLength={11}`, and shows the same checksum warning when invalid.
- **`src/components/SubComponentForm/DetailsForm.jsx`**
  - Contact person 1 & 2 PESEL fields: **digits only** via `normalizePesel` in `handleChange`, **`maxLength={11}`**, `inputMode="numeric"`.

---

## 4. Complete registration flow in visit context (Sections B, C, E)

- **ReceptionAppointmentForm (first-time flow)**  
  - After creating a **visit only** (no PESEL, no `patientId`), the modal switches to a **“Zakończ rejestrację”** view:
    - PESEL (required, digits, max 11), optional checksum warning.
    - When 11 digits: **GET `/api/patients/by-pesel`**; if **`exists: true`**: show *„Pacjent o podanym numerze PESEL już istnieje w systemie.”* and button **„Załaduj dane istniejącego pacjenta”**.
    - On “Załaduj…”: form is prefilled from `response.patient` (name, email, phone, dateOfBirth, sex).
    - **“Zakończ rejestrację”** → **POST `/api/appointments/:visitId/complete-registration`** with normalized PESEL and form data.
    - On success: if response has **`peselWarning`**, it is shown via **toast.warning**; success toast and close. No block on invalid checksum.
- **CompleteRegistrationModal**
  - Used from **PatientList** when a visit has **no patient** (`appointment.patient` null/missing).
  - Same behaviour: by-pesel check, “Załaduj dane istniejącego pacjenta”, complete-registration POST, `peselWarning` in toast.
  - Prefills from `appointment.registrationData` when available.
  - On success, parent refetches the appointments list.

---

## 5. Reception “first visit” = visit only, then complete registration (Section D)

- **`src/components/admin/ReceptionAppointmentForm.jsx`**
  - **Step 1 – First-time:** PESEL and “Płeć” are **no longer required** for “Dalej”. Only **first name** and **last name** are required for the first submit.
  - **First submit (first-time):** Sends **no** `patientId` and **no** `pesel`. Sends only: `firstName`, `lastName`, optional `email`, optional `phone`, optional `dob`, optional `sex`, plus appointment fields (`doctorId`, `date`, `startTime`, `endTime`, etc.) to **POST `/appointments/reception`**. Backend creates **visit only**.
  - **After success:** Modal shows the **“Zakończ rejestrację”** view with the new visit’s ID; user enters PESEL and required data and clicks “Zakończ rejestrację” → **POST `/api/appointments/:visitId/complete-registration`**. PATIENT_ID is created only after this call.

---

## 6. PatientList: visits without patient

- **`src/components/Patients/PatientList.jsx`**
  - **State:** `showCompleteRegModal`.
  - **When `appointment.patient` is null/missing:**
    - Patient column shows **“Pacjent niezweryfikowany”** (or registration name from `appointment.registrationData` if present) and **“Brak ID (zakończ rejestrację)”**.
    - Row / card click opens **CompleteRegistrationModal** instead of navigating to patient details.
    - Dropdown shows **“Zakończ rejestrację”** instead of “Zobacz szczegóły”; Check-in, “Wystaw rachunek”, “Edytuj pacjenta” are shown only when `appointment.patient` exists.
  - **CompleteRegistrationModal** is rendered with `selectedAppointment`; on success, **`fetchAppointments(pagination.page)`** is called to refresh the list.
  - Applied in both the **card layout** and the **table layout** (Pacjent column, dropdown items, optional chaining for `appointment.patient?.phoneNumber`, `appointment.patient?.age`).

---

## 7. Checklist (admin side only)

| Id | Description | Done |
|----|-------------|------|
| A1 | PESEL input: digits only, max 11 | ✅ DemographicForm, ReceptionAppointmentForm (complete-reg phase), DetailsForm |
| A2 | PESEL checksum: show warning when invalid; do not block “Zakończ rejestrację” | ✅ FE warning in DemographicForm & Reception; backend `peselWarning` shown in toast |
| B1 | Visit detail: when no patient, show “Complete registration” section | ✅ In ReceptionAppointmentForm (after visit created); in PatientList via CompleteRegistrationModal |
| B2 | “Zakończ rejestrację” calls POST `complete-registration` with `pesel` and required data | ✅ |
| B3 | On success, refresh so PATIENT_ID appears; show `peselWarning` if present | ✅ Toast for peselWarning; list refetch in PatientList |
| C1 | When 11 digits, call GET `/api/patients/by-pesel` | ✅ |
| C2 | If `exists: true`, show message and “Załaduj dane istniejącego pacjenta” | ✅ |
| C3 | On button click, load `response.patient` into form | ✅ |
| C4 | “Zakończ rejestrację” with existing patient still calls `complete-registration` (backend links visit) | ✅ |
| D1 | Reception first visit: first request creates visit only (no `patientId`, no PESEL) | ✅ |
| D2 | After visit creation, complete registration via `complete-registration` (same modal or list modal) | ✅ |
| E1 | Display `peselWarning` from response without blocking success | ✅ Toast after success |

---

## 8. Files touched (list)

- **New:** `src/utils/peselUtils.js`, `src/components/admin/CompleteRegistrationModal.jsx`
- **Modified:**  
  `src/helpers/patientHelper.js`,  
  `src/helpers/appointmentHelper.js`,  
  `src/components/SubComponentForm/DemographicForm.jsx`,  
  `src/components/SubComponentForm/DetailsForm.jsx`,  
  `src/components/admin/ReceptionAppointmentForm.jsx`,  
  `src/components/Patients/PatientList.jsx`

---

## 9. User-side (not done in this repo)

Per instructions, **user-side** (Section F) was **not** implemented here:

- Public online booking: assume visit-only response, optional “Rejestracja online” label.
- Patient portal: Patient ID read-only; “Pacjent niezweryfikowany” when absent.

Those belong in the user-facing / public frontend repo if applicable.
