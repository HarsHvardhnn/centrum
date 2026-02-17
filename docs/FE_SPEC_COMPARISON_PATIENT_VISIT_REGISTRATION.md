# Frontend spec comparison: Patient / Visit / Registration

This document compares the **current frontend** behaviour and UX with the **SPECIFICATION – PATIENT / VISIT / REGISTRATION LOGIC (FOR IMPLEMENTATION)**. It aligns with the backend comparison in the backend repo (`docs/SPEC_COMPARISON_PATIENT_VISIT_REGISTRATION.md`) and lists concrete FE changes and API assumptions.

---

## 1. Patient vs Visit

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| Visit can exist **without** a patient; PATIENT_ID only after PESEL + “Complete registration”. | **Reception – First visit:** FE sends all new-patient data (firstName, lastName, email, phone, dob, sex, **PESEL**) together with the appointment in a **single** API call (`createReceptionAppointment`). Backend is assumed to create both visit and patient in one go. | FE **always** creates/edits a patient in step with the visit for first-time reception. There is no “visit only” then “complete registration” later. |
| Reception – Follow-up: select existing patient → create visit, assign to patient. | **Reception – Re-visit:** User selects existing patient via `PatientSearchField`; submit sends `patientId: selectedPatient._id` with appointment. | Aligned for follow-up. |
| Online: only create a visit (no patient account yet). | No distinct “online booking” flow in FE that creates visit-without-patient. | FE does not implement “online = visit only”. |

**Summary:** The frontend assumes **patient and visit are created together** for first-time reception (and that the backend creates a patient when given PESEL + demographics). It does not support visit-only creation or deferred “Complete registration” that creates PATIENT_ID later.

---

## 2. Identifiers (UX)

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| **Hospital ID:** deprecated – remove from UI and logic. | **DemographicForm.jsx:** “ID Szpitala” (`hospId`) is shown as read-only. **PatientDetails.jsx:** “ID szpitala” in “Dane identyfikacyjne”. **patientHelper.js:** sends `hospId` in create/update. | Remove Hospital ID from all UI and stop sending/using in forms. |
| **Patient ID (PATIENT_ID):** must be **read-only**; never user-editable. | **DemographicForm.jsx:** Label “ID Pacjenta” is used for the **editable** field `otherHospitalIds` (placeholder “Wprowadź ID pacjenta”) – this is a different concept (other hospitals’ IDs). **PatientDetails.jsx / PatientProfile / Dashboard / PatientList:** show `patientId` or `patient_id` as display-only. | (1) Do not use “ID Pacjenta” for an editable field. (2) Where PATIENT_ID is shown, ensure it is read-only and system-generated. (3) Clarify in UI: system PATIENT_ID vs “other hospital IDs” if both exist. |
| When PATIENT_ID **does not** exist: show message *„Identyfikator pacjenta zostanie utworzony po zakończeniu rejestracji pacjenta w systemie.”* | No such message. All views that show “ID pacjenta” assume a value exists (e.g. `patient.patient_id`, `patientData.patientId`). | Add conditional copy: when visit/context has no PATIENT_ID, show the spec message instead of an empty or broken field. |
| When PATIENT_ID **exists:** show as read-only text. | Where patient ID is displayed (e.g. PatientDetails, PatientList, Dashboard table), it is read-only. Editable “ID” in DemographicForm is otherHospitalIds, not PATIENT_ID. | Once PATIENT_ID is clearly separated, show it only as read-only. |

---

## 3. Visit registration flows

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| **Online:** Only create a visit (no patient). Next to visit status, show **„Rejestracja online”** when `booking_source = ONLINE`. | No `booking_source` in FE. No label “Rejestracja online” next to visit status. | (1) Use `booking_source` from API when available. (2) When `booking_source === 'ONLINE'` (or equivalent), show “Rejestracja online” next to status. |
| **Reception – Follow-up:** Select existing patient → create visit, assign to patient. No extra label (booking_source = RECEPTION). | Implemented: re-visit path selects patient and sends `patientId`. | Aligned. |
| **Reception – First visit:** Enter basic data (phone optional); **create visit only**; no patient until “Complete registration” with PESEL. | First-time reception requires: first name, last name, PESEL, sex (email/phone optional). On submit, FE sends all of this and expects backend to create both visit and patient. | Spec expects: create **visit only** with basic data (no PESEL required at this step); patient is created only when staff performs “Complete registration” with PESEL. FE currently requires patient data (including PESEL) at first save. |

---

## 4. UI tabs (Dane podstawowe, Zgody)

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| **Dane podstawowe** and **Zgody** must **always** be visible for scheduled, cancelled, no-show, online and reception, in **visit context** (by VISIT_ID). | **PatientStepForm.jsx:** Tabs are “Dane Podstawowe”, “Skierowanie”, “Adres”, “Zgody”, “Szczegóły”, “Notatki”. They are used in: (1) Settings “Add/Edit Patient” modal, (2) PatientList “Add Patient” modal. Both are **patient-centric** (create/edit patient), not explicitly visit-centric (by VISIT_ID). | Ensure a **visit-context** view exists (e.g. when opening an appointment/visit) where **Dane podstawowe** and **Zgody** are always visible regardless of status (scheduled, cancelled, no-show, online, reception). If any tab is currently hidden based on visit/patient state, align with spec so these two tabs are never hidden in visit context. |

---

## 5. PESEL

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| Input: digits only, **max 11 characters**, no extra characters after 11 digits. | **DemographicForm.jsx:** Validation: 11 digits, digits only; no `maxLength` on input. **ReceptionAppointmentForm.jsx:** PESEL required for first-time; no `maxLength` or input restriction. | Add `maxLength={11}` and restrict to digits only (e.g. strip non-digits, block non-numeric input). |
| After 11 digits: optional **checksum** check; if invalid show **warning**: “Warning: the PESEL number may be invalid.” Do **not** block registration. | No checksum validation or warning. | Add optional PESEL checksum validation; on invalid checksum show warning text only (no block). |
| **First-visit (reception):** If PESEL already exists: show informational message *„Pacjent o podanym numerze PESEL już istnieje w systemie.”* and button **[ Załaduj dane istniejącego pacjenta ]**; only after click reload form with existing patient (PESEL/identity may be locked); on “Zakończ rejestrację” assign visit to existing patient, do not create duplicate. | No duplicate-PESEL check or “load existing patient” flow. First-time submit sends PESEL and expects backend to create patient. | (1) Before or on “Complete registration”, call API to check if PESEL exists. (2) If exists: show message + button “Załaduj dane istniejącego pacjenta”. (3) On click: load existing patient into form (lock PESEL/identity as needed). (4) On “Zakończ rejestrację”: assign visit to existing patient (no new patient creation). |

---

## 6. “Complete registration” / “Zakończ rejestrację”

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| This action is what **creates PATIENT_ID** (after valid PESEL). PATIENT_ID only after this click. | **SubStepForm.jsx:** Last step button label is “Zakończ rejestrację”; it calls `onComplete()` (e.g. `markStepAsCompleted`), which in Settings/PatientList triggers **full** patient create/update. So “Zakończ rejestrację” is the final step of the **full** patient form, not a dedicated “complete registration” action that only creates PATIENT_ID. **Reception:** No separate “Complete registration” step; first-time submit creates appointment with all patient data in one request. | (1) In **visit context**, introduce a dedicated “Zakończ rejestrację” action that: collects PESEL (+ required identity data), calls backend “complete registration” (or equivalent), and only then creates PATIENT_ID. (2) Reception first-time should support: create **visit only** (basic data, no PESEL required), then later from visit detail “Zakończ rejestrację” to create patient and assign visit. |

---

## 7. Unverified status

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| Where PATIENT_ID is normally shown, if it **does not** exist yet, display **“Pacjent niezweryfikowany”**. After PATIENT_ID is created, show normal read-only Patient ID. | No “Pacjent niezweryfikowany” anywhere. All UIs that show patient ID assume it exists (e.g. `patient.patient_id`, `patientData.patientId`). | In every place that displays PATIENT_ID (e.g. PatientDetails, PatientList, Dashboard, Billing), if the current visit/patient has no PATIENT_ID, show “Pacjent niezweryfikowany” instead of empty or undefined. |

---

## 8. Cancellation / no-show

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| No PESEL → no PATIENT_ID → no patient account. Visit stays as VISIT_ID with status cancelled/no-show; basic data and consents still accessible. UI must not assume a “patient” record for every cancelled/no-show visit. | **Dashboard / PatientList:** Navigation and actions use `patient.patient_id`, `patient._id`, `selectedAppointment?.patient?.id`. Check-in, billing, reschedule, “Zobacz szczegóły” assume patient exists. If backend returns visit-only (no patient), links like `/szczegoly-pacjenta/${patient.patient_id}` and `patientId={selectedAppointment?.patient_id}` can break or show wrong state. | (1) All visit-detail and list UIs must support **visit without patient** (optional `patient` / `patient_id`). (2) For cancelled/no-show visits without PATIENT_ID: allow access to basic data and consents by VISIT_ID; do not require patient_id for opening visit context. (3) Hide or disable actions that require PATIENT_ID (e.g. “Zobacz szczegóły pacjenta”, billing that requires patient) when PATIENT_ID is missing, or route to visit-only view. |

---

## 9. Patient list

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| List must show **only** patients who have **PATIENT_ID** (completed registration). No visit-only persons, no cancelled/no-show without PATIENT_ID. Columns: patient full name, PATIENT_ID, date/time of **first completed visit**, physician of first visit. | **PatientList.jsx** (and Dashboard): Data comes from **appointments** (`getAllAppointments`), not from a dedicated “patients” API. Rows are appointments with embedded patient; columns include patient name, status, doctor, date, etc. There is no separate “patient list” filtered by “has PATIENT_ID” or “first completed visit”. **patientHelper.js:** `getPatients`, `getSimpliefiedPatientsList` exist but are not necessarily filtered by PATIENT_ID. | (1) When backend supports it, use or request a **patient list** endpoint that returns only entities with PATIENT_ID (completed registration). (2) Plan FE columns: full name, PATIENT_ID, date/time of first completed visit, physician of first visit. (3) Do not show visit-only or pre-registration persons in this list. |

---

## 10. Patient source field

| Spec requirement | Current FE | Gap |
|------------------|------------|-----|
| Remove “patient source” field from UX (or use only for something important for dashboard). | **ReceptionAppointmentForm.jsx:** `patientSource` state and input “Źródło pacjenta”. **AddAppointmentForm.jsx:** `patientSource` in form and submit. **Step1.jsx:** “Źródło pacjenta” required. **PatientSelectionStep.jsx:** patientSource input. All send `patientSource` in submission. | Remove or repurpose “patient source” from all appointment/registration forms and submission payloads unless product explicitly keeps it for dashboard/reporting. |

---

## 11. API assumptions (FE → backend)

The frontend currently assumes the following. These should be updated when the backend implements the spec (see backend `SPEC_COMPARISON_PATIENT_VISIT_REGISTRATION.md`).

| Assumption | Where it appears | Required change |
|------------|------------------|------------------|
| **Reception first-time:** One request creates both appointment and patient (patient required with PESEL). | ReceptionAppointmentForm submit: `firstName`, `lastName`, `pesel`, `sex`, etc. and no separate “visit only” or “complete registration” call. | Support: (1) Create **visit only** (basic data, no PESEL); (2) Optional “complete registration” endpoint that creates PATIENT_ID and assigns visit to patient. |
| **Appointment/visit always has a patient.** | Dashboard, PatientList, CheckinModal, BillingConfirmationModal, RescheduleModal: use `patient_id`, `patient.id`, `patient?.name` without null checks for “visit only”. | Treat `patient` / `patient_id` as optional; handle visit-only in list and detail (e.g. show “Pacjent niezweryfikowany”, visit-scoped tabs). |
| **Patient list = appointments list** (with embedded patient). | PatientList and Dashboard use `getAllAppointments`; no dedicated “patients with PATIENT_ID” list. | Use new or updated patient list API that returns only PATIENT_ID holders, with first completed visit and physician. |
| **No `booking_source`.** | No FE usage. | Consume `booking_source` from appointment/visit and show “Rejestracja online” when ONLINE. |
| **No “complete registration” endpoint.** | Only full patient create/update and reception appointment create. | Use new endpoint for “complete registration” (PESEL + identity → create PATIENT_ID, assign visit). |
| **PESEL uniqueness:** not checked before submit. | No duplicate-PESEL check or “load existing patient” flow. | Use API to check PESEL existence and, if exists, load existing patient and assign visit instead of creating duplicate. |

---

## 12. Concrete FE changes (checklist)

Use this list to align the frontend with the spec once the backend supports visit-without-patient, `booking_source`, “Complete registration”, and filtered patient list.

### Identifiers
- [ ] **Remove Hospital ID** from UI: DemographicForm (ID Szpitala), PatientDetails (“ID szpitala”), and any other labels; remove from form submit (patientHelper create/update) and from SubStepFormContext defaults if no longer needed.
- [ ] **Patient ID (PATIENT_ID):**  
  - [ ] Where system PATIENT_ID is shown: make it read-only; never use “ID Pacjenta” for an editable field (keep “other hospital IDs” separate if needed).  
  - [ ] When PATIENT_ID **does not** exist: show *„Identyfikator pacjenta zostanie utworzony po zakończeniu rejestracji pacjenta w systemie.”*  
  - [ ] When PATIENT_ID exists: show as read-only text.
- [ ] **Unverified:** In every place that displays PATIENT_ID (PatientDetails, PatientList, Dashboard, Billing, PatientProfile), if no PATIENT_ID: show **“Pacjent niezweryfikowany”**.

### PESEL
- [ ] **Input:** Digits only, **max 11 characters** (e.g. `maxLength={11}`, strip non-digits on input) in DemographicForm and ReceptionAppointmentForm (and AddAppointmentForm if used for new patient).
- [ ] **Checksum:** After 11 digits, optional PESEL checksum; if invalid show **warning** only: “Warning: the PESEL number may be invalid.” Do not block registration.
- [ ] **Duplicate PESEL (reception first-visit):** Before/on “Complete registration”: check if PESEL exists; if yes: show *„Pacjent o podanym numerze PESEL już istnieje w systemie.”* and button **[ Załaduj dane istniejącego pacjenta ]**; on click load existing patient and lock PESEL/identity; on “Zakończ rejestrację” assign visit to existing patient (no duplicate).

### Visit registration flows
- [ ] **Reception – First visit:** Support “visit only” creation (basic data, phone optional, **no PESEL required**). Then from visit detail, “Zakończ rejestrację” with PESEL to create PATIENT_ID and assign visit.
- [ ] **Online:** When backend exposes `booking_source = ONLINE`, show label **„Rejestracja online”** next to visit status (in PatientList, Dashboard, and any visit card).

### Complete registration
- [ ] **Visit context:** Add dedicated “Zakończ rejestrację” step/button that: collects PESEL (+ required identity), calls backend “complete registration”, then shows PATIENT_ID. Do not create PATIENT_ID on first save of basic data.

### UI tabs
- [ ] **Visit context (by VISIT_ID):** Ensure **Dane podstawowe** and **Zgody** are **always** visible for scheduled, cancelled, no-show, online and reception. Remove or adjust any logic that hides these tabs based on visit/patient state.

### Cancellation / no-show
- [ ] **Visit without patient:** All list and detail views must support optional `patient` / `patient_id`. For cancelled/no-show without PATIENT_ID: allow opening visit by VISIT_ID; show basic data and consents; do not require patient_id for visit context; hide or adapt actions that need PATIENT_ID (e.g. link to patient details, billing).

### Patient list
- [ ] When backend supports it: switch (or add) **patient list** to an API that returns only patients with PATIENT_ID. Columns: full name, PATIENT_ID, date/time of **first completed visit**, physician of first visit. Exclude visit-only and pre-registration.

### Patient source
- [ ] **Remove** “patient source” field from: ReceptionAppointmentForm, AddAppointmentForm, Step1, PatientSelectionStep (or repurpose only for dashboard). Remove from submission payloads unless explicitly kept for reporting.

### API usage
- [ ] Use new/updated endpoints: visit-only creation (reception first-time), complete-registration, PESEL-exists check, patient list filtered by PATIENT_ID.
- [ ] Consume `booking_source` from appointment/visit and handle optional `patient` / `patient_id` in all appointment/visit responses.

---

## References
- **Spec:** SPECIFICATION – PATIENT / VISIT / REGISTRATION LOGIC (FOR IMPLEMENTATION) (PDF/spec).
- **Backend comparison:** `docs/SPEC_COMPARISON_PATIENT_VISIT_REGISTRATION.md` in the backend repo (API and data model changes).
