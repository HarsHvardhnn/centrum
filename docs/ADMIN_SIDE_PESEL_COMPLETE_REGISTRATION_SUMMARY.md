# Admin-side PESEL & Complete registration – summary of implementation

This document summarizes the **admin-side** frontend implementation for the PESEL and “Complete registration” flow (sections A–E from the frontend spec). The backend already supports the APIs; this repo is the admin app.

---

## 1. What was already implemented (before this pass)

- **PESEL utils** (`src/utils/peselUtils.js`): `normalizePesel` (digits only, max 11), `getPeselChecksumWarning`, `validatePeselChecksum`.
- **Patient by PESEL** (`src/helpers/patientHelper.js`): `getPatientByPesel(pesel)` → GET `/api/patients/by-pesel?pesel=...`.
- **Complete registration API** (`src/helpers/appointmentHelper.js`): `completeRegistration(visitId, data)` → POST `/api/appointments/:visitId/complete-registration`.
- **ReceptionAppointmentForm**: Step 1 “Typ wizyty” with “Pierwsza wizyta” / “Kolejna wizyta”; first-time creates visit only (no PESEL), then in-modal “Zakończ rejestrację” with PESEL, duplicate check, “Załaduj dane istniejącego pacjenta”, and `peselWarning` handling.
- **CompleteRegistrationModal**: Used from PatientList for visits without patient; PESEL digits-only, max 11, checksum warning, by-pesel check, “Załaduj dane istniejącego pacjenta”, `peselWarning` on response.
- **DemographicForm**: PESEL field with `normalizePesel` in onChange, maxLength 11, optional checksum warning.
- **DetailsForm**: Contact person PESEL fields with `normalizePesel`, maxLength 11.
- **PatientList**: Shows “Zakończ rejestrację” and opens `CompleteRegistrationModal` when `!(appointment.patient?.id || appointment.patient?._id)`.

---

## 2. Changes made in this pass

### D. Reception “first visit” – third option: “Wizyta bez pacjenta (recepcja)”

**File: `src/components/admin/ReceptionAppointmentForm.jsx`**

1. **New visit type option (Step 1 – Patient information)**  
   - Added a third radio: **“Wizyta bez pacjenta (recepcja)”** with `value="visit-only"`.  
   - When selected, a short note is shown: *„Utwórz wizytę bez pacjenta. Pacjent zostanie dodany później przez „Zakończ rejestrację” z listy wizyt.”*  
   - No patient search and no new-patient form are shown for this option.

2. **Step 1 validation**  
   - Introduced `isVisitOnly = appointmentData.visitType === "visit-only"`.  
   - `canProceedToNextStep()` for step 1: if `isVisitOnly`, the user can proceed without selecting or entering any patient data.

3. **Submit logic**  
   - `canSubmitVisit` now allows submit when `isVisitOnly` (in addition to existing first-time / re-visit logic).  
   - When `isVisitOnly`, the payload sent to POST `/appointments/reception` **does not include** any patient fields (`patientId`, `firstName`, `lastName`, PESEL, etc.); only visit data (doctor, date, time, services, flags).  
   - Backend is expected to create a **visit only** (no patient).

4. **After visit creation**  
   - When the response is successful and `(isFirstTimeVisit || isVisitOnly) && visitId`, the form shows the same **“Zakończ rejestrację”** in-modal step (PESEL + patient data).  
   - For **visit-only**, first/last name and other fields are empty; the user must fill them in this step before clicking “Zakończ rejestrację”.  
   - Success toast for visit-only: *„Wizyta utworzona. Wprowadź PESEL i dane pacjenta, aby zakończyć rejestrację.”*

No new routes or API calls were added; only the reception form behaviour and submit/Complete registration flow were extended to support “visit only” as a third choice.

---

## 3. Checklist vs spec (admin side only)

| Id | Spec item | Status |
|----|-----------|--------|
| **A1** | PESEL input: digits only, max 11 | ✅ `peselUtils.normalizePesel` + `maxLength={11}` in ReceptionAppointmentForm, CompleteRegistrationModal, DemographicForm, DetailsForm |
| **A2** | PESEL checksum: warning only; do not block “Zakończ rejestrację” | ✅ `getPeselChecksumWarning` shown in modal/forms; backend `peselWarning` shown after submit |
| **B1** | Visit without patient: show “Complete registration” with PESEL and “Zakończ rejestrację” | ✅ PatientList opens CompleteRegistrationModal when no patient; ReceptionAppointmentForm shows in-modal step after visit-only/first-time creation |
| **B2** | “Zakończ rejestrację” calls POST `complete-registration` with pesel + required data | ✅ ReceptionAppointmentForm + CompleteRegistrationModal |
| **B3** | On success, refresh/ show PATIENT_ID; show `peselWarning` if present | ✅ Toast success; `peselWarning` in toast.warning |
| **C1** | When 11 digits, GET `/api/patients/by-pesel?pesel=...` | ✅ ReceptionAppointmentForm + CompleteRegistrationModal (use `patientService.getPatientByPesel`) |
| **C2** | If exists: show message + “Załaduj dane istniejącego pacjenta” | ✅ Both components |
| **C3** | On button click, load `response.patient` into form | ✅ handleLoadExistingPatient / handleLoadExisting |
| **C4** | “Zakończ rejestrację” with existing patient still calls `complete-registration` (no duplicate) | ✅ Same API call with loaded data |
| **D1** | Reception first visit: first request creates visit only (no patientId, no PESEL) | ✅ First-time sends only basic data; visit-only sends no patient data |
| **D2** | After visit creation, complete registration in visit detail or next step | ✅ In-modal step in ReceptionAppointmentForm; from list via CompleteRegistrationModal |
| **E1** | Display `peselWarning` from response without blocking success | ✅ toast.warning(response.peselWarning) after success |

---

## 4. Files touched in this pass

| File | Change |
|------|--------|
| `src/components/admin/ReceptionAppointmentForm.jsx` | Added “Wizyta bez pacjenta (recepcja)” option; `isVisitOnly`; step 1 allow proceed when visit-only; submit allows visit-only and sends no patient data; after success show Complete registration for both first-time and visit-only. |

---

## 5. Where to test

- **Create visit (reception):** e.g. **Dodaj wizytę** → `/appointment/create` or the page that opens `ReceptionAppointmentForm` (e.g. from Lista pacjentów or Historia wizyt, depending on routing).
- **Step 1:** Choose **“Wizyta bez pacjenta (recepcja)”** → no patient form → next step: doctor + slot → services → submit → visit created → “Zakończ rejestrację” modal with PESEL and patient fields (empty); fill and submit to complete registration.
- **First visit / Kolejna wizyta:** Unchanged; first visit still creates visit only then in-modal Complete registration; re-visit links existing patient.
- **List:** For visits without patient, use **“Zakończ rejestrację”** on the list to open `CompleteRegistrationModal`.

User-side (section F) is out of scope for this admin summary; see `USER_SIDE_PESEL_BOOKING_CHANGES_SUMMARY.md` if applicable.
