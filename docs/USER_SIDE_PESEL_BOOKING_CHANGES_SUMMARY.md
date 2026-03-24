# Summary: User-side PESEL / booking changes (Section F)

This document summarizes the **user-side** frontend changes for public online booking (visit only, no patient) and patient portal Patient ID display. The backend already creates **visit only** for public booking and may return `booking_source: 'ONLINE'`. Admin-side changes (A–E) are **not** in this repo.

---

## 1. What was implemented

### F1. Public booking: do not assume a patient in the response

- **Backend behaviour:** POST to the public booking endpoint (e.g. `/appointments/book`) now creates only a **visit** (no patient account, no PATIENT_ID). The response contains the appointment (visit) with `_id`, optionally `booking_source: 'ONLINE'`, and possibly `registrationData`; `patient` may be null.
- **Frontend changes:**
  - **BookAppointment.jsx:** Success handler no longer assumes a patient. The response is treated as visit data: we store `lastBookedVisit` from `response.data?.appointment ?? response.data?.data ?? response.data` and do **not** use `response.data.patient` or Patient ID for the confirmation message.
  - **DoctorProfilePage.jsx:** Success handler does not use `response.patient`. We only use the appointment/visit from the response for optional “Rejestracja online” messaging.
  - **Doctors.jsx:** Same as above; no use of patient in the response.

Confirmation and success messages use only **visit** data (e.g. date, time, doctor).

---

### F2. Optional: show “Rejestracja online” on confirmation

- **BookAppointment.jsx:** After a successful booking we store the appointment in `lastBookedVisit`. The success message block now:
  - Shows the standard “Wizyta została pomyślnie zarezerwowana!”.
  - If `lastBookedVisit.booking_source === "ONLINE"`, shows the label **„Rejestracja online”**.
  - If visit data is present, shows date, time, and doctor from the visit (no Patient ID).
- **DoctorProfilePage.jsx:** On success, if the response appointment has `booking_source === "ONLINE"`, the toast text is: *"Wizyta została pomyślnie zarezerwowana! Rejestracja online."* Otherwise the standard success toast is shown.
- **Doctors.jsx:** Same toast logic as DoctorProfilePage when `booking_source === "ONLINE"`.

---

### F3. Patient portal: Patient ID read-only; “Pacjent niezweryfikowany” when absent

- **Profile.jsx (Auth/Profile):** In the read-only “Informacje Osobiste” section we added:
  - **ID pacjenta** (read-only):
    - If `profile.patientId` or `user?.patientId` is present, we display it (read-only).
    - If neither is present, we display **„Pacjent niezweryfikowany”** and the short message: *„Identyfikator pacjenta zostanie utworzony po zakończeniu rejestracji pacjenta w systemie (w przychodni).”*

No other user-side components were changed for Patient ID (e.g. MyAppointments, MyDetails do not show Patient ID and do not assume `appointment.patient` in a way that would break for visit-only data).

---

## 2. Files modified

| File | Change |
|------|--------|
| **src/components/User/BookAppointment.jsx** | Store `lastBookedVisit` from booking response (visit only). Success message uses visit data only; show “Rejestracja online” when `booking_source === 'ONLINE'`. No use of patient or Patient ID. |
| **src/components/User/Pages/DoctorProfilePage.jsx** | Success handler uses visit from response only; toast shows “Rejestracja online” when `booking_source === 'ONLINE'`. |
| **src/components/User/Doctors.jsx** | Same as DoctorProfilePage for success and “Rejestracja online” toast. |
| **src/components/Auth/Profile.jsx** | Added “ID pacjenta” (read-only): show `profile.patientId` or `user?.patientId`, or “Pacjent niezweryfikowany” with explanatory text. |

---

## 3. Checklist (user side)

| Id | Description | Done |
|----|-------------|------|
| F1 | Public booking: do not assume a patient in the response; use visit data only on confirmation | ✅ |
| F2 | Optional: show “Rejestracja online” on public booking confirmation when `booking_source === 'ONLINE'` | ✅ |
| F3 | Optional – patient portal: show Patient ID read-only; if absent, show “Pacjent niezweryfikowany” | ✅ |

---

## 4. API / backend assumptions

- Public booking POST returns an **appointment (visit)** object; it may include `booking_source: 'ONLINE'`. It does **not** create a patient or PATIENT_ID.
- Profile (or user) API may return `patientId` when the user has completed registration (PATIENT_ID exists); otherwise the portal shows “Pacjent niezweryfikowany”.

Admin-side items (PESEL input rules, Complete registration flow, duplicate PESEL, reception first visit, `peselWarning` display) are implemented in the **admin** repo, not in this user repo.
