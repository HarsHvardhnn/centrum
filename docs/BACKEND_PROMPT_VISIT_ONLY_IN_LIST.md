# Backend prompt: Include visit-only appointments in list APIs

Use this in your **backend repo** to fix list APIs so that **visit-only** (patient-less) appointments appear on the Patient list and History visit pages. The frontend already supports them; the lists are currently empty for visit-only because the backend only returns appointments that have a patient.

---

## 1. Which API to fix

The frontend uses **one** main endpoint for both:

- **Lista pacjentów** (Patient list) – e.g. `/pacjenci`
- **Historia wizyt** (Visit history / clinic) – e.g. `/klinika`

**Endpoint to check and fix:**

- **GET `/appointments/details/list`**

**Query parameters the frontend sends:**

| Parameter   | Description |
|------------|-------------|
| `page`     | Pagination page (default 1) |
| `limit`    | Page size (e.g. 10) |
| `sortBy`   | e.g. `"date"` |
| `sortOrder`| e.g. `"desc"` |
| `searchTerm` | Optional search text |
| `status`   | Optional: `"All"`, `"booked"`, `"completed"`, etc. |
| `startDate`| Optional; date range start |
| `endDate`  | Optional; date range end |
| `doctorId` | Optional; when user is doctor, filter by their ID |
| `isClinicIp`| Optional; when `true`, used for “Historia wizyt” (clinic view) |

---

## 2. Current problem

- **Current behaviour:** The list API only returns appointments that **have a patient** (e.g. `patientId` not null / JOIN with patients table).
- **Result:** Appointments created as **visit-only** (reception “Wizyta bez pacjenta” or first visit before “Zakończ rejestrację”) do **not** appear in the list, so staff cannot see them or use “Zakończ rejestrację”.

---

## 3. Required behaviour

**GET `/appointments/details/list`** should return **all** appointments that match the filters (date, status, doctor, etc.), including:

1. Appointments **with** a linked patient (current behaviour).
2. Appointments **without** a linked patient (visit-only), i.e. where:
   - `patientId` is null (or equivalent), and
   - Optional: some data may be in `registrationData` (e.g. first name, last name, phone from reception).

So:

- Do **not** filter out rows where `patientId IS NULL` (or equivalent).
- Do **not** require a JOIN to the patients table for a row to be returned.
- Return the same shape for both: appointment id, date, time, doctor, status, etc. For visit-only, `patient` can be `null` or absent.

---

## 4. Response shape the frontend expects

The frontend expects something like:

```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "_id": "...",
      "date": "...",
      "startTime": "...",
      "endTime": "...",
      "status": "booked",
      "doctor": { "id": "...", "name": "...", ... },
      "patient": null,
      "patient_id": null,
      "registrationData": { "firstName": "...", "lastName": "...", ... }
    },
    {
      "id": "...",
      "patient": { "id": "...", "_id": "...", "name": "...", "patientId": "..." },
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

Important:

- **Visit-only:** `patient` is `null` (or missing). Optional: `registrationData` for display.
- **With patient:** `patient` is the usual object (with `id` or `_id`, and optionally `patientId`).
- The frontend uses `!(appointment.patient?.id || appointment.patient?._id)` to show **“Zakończ rejestrację”** for visit-only and to open the Complete registration modal.

---

## 5. What to check in the backend

1. **Handler/controller** for **GET `/appointments/details/list`** (or the route that serves this URL).
2. **Query / repository** that builds the list:
   - Remove any condition that excludes appointments without a patient (e.g. `WHERE patient_id IS NOT NULL` or `INNER JOIN patients` that would drop visit-only rows).
   - Use a **LEFT JOIN** (or equivalent) to the patients table so that:
     - Appointments with a patient get patient data.
     - Appointments without a patient still appear, with patient fields as null.
3. **Serialization:** Ensure that when there is no patient, the API returns `patient: null` (or omits it) and does not throw or filter out the row.
4. **Filters:** Keep existing filters (date range, status, doctorId, isClinicIp, search, etc.) working for **all** appointments (with and without patient).

---

## 6. Optional: other list endpoints

If you have other endpoints that return “appointments for the patient list” or “appointments for clinic/history” (e.g. dashboard, reports), apply the same rule: **include visit-only appointments** (where patient is null) and return them with `patient: null` so the frontend can show “Zakończ rejestrację”.

---

## 7. Summary

| Item | Action |
|------|--------|
| **API** | **GET `/appointments/details/list`** |
| **Change** | Return appointments **with and without** a linked patient; do not exclude rows where patient is null. |
| **Response** | For visit-only, `patient` should be `null` (or absent). Same pagination and filters as today. |
| **Frontend** | Already handles `patient === null` and shows “Zakończ rejestrację” for those rows. |

Once the list API returns visit-only appointments, they will appear on the Patient list and History visit pages and staff can complete registration from there.

**Update (backend contract implemented):** The backend now returns `isVisitOnly` on each appointment. The frontend uses **Option A** (`appointment.isVisitOnly === true`) with a fallback to `!(appointment.patient?.id || appointment.patient?._id)` for backwards compatibility. Display name uses `registrationData?.name` or `firstName`/`lastName` when present.

---

## 8. FE integration: how patient-less appointments work

### Creating a visit-only appointment (already done on FE)

- **Endpoint:** **POST `/appointments/reception`**
- **When:** User chooses “Wizyta bez pacjenta (recepcja)” and submits the form.
- **Body (visit-only):** The frontend sends **only visit data**. It does **not** send any of: `patientId`, `firstName`, `lastName`, `email`, `phone`, `dob`, `sex`, `pesel`.

  Example shape (visit-only):

  ```json
  {
    "date": "2025-02-18",
    "doctorId": "...",
    "startTime": "09:00",
    "endTime": "09:30",
    "duration": 30,
    "consultationType": "offline",
    "message": "",
    "smsConsentAgreed": true,
    "persistSmsConsent": false,
    "isBackdated": false,
    "customDuration": null,
    "overrideConflicts": false,
    "createdBy": "receptionist",
    "customStartTime": null,
    "customEndTime": null,
    "selectedSlot": { ... },
    "metadata": { "visitType": "visit-only", ... },
    "services": [ ... ],
    "isWalkin": false,
    "needsAttention": false,
    "markAsArrived": false,
    "isInternational": false,
    "patientSource": ""
  }
  ```

  **No** `patientId`, **no** `firstName`, **no** `lastName`, **no** `pesel`, etc.

- **Backend:** Should create an appointment row with **no** linked patient (e.g. `patient_id = null`). Optional: store minimal data in something like `registrationData` if you support it.

### Listing appointments (what backend must do)

- **Endpoint:** **GET `/appointments/details/list`**
- **Frontend:** Already calls this for Lista pacjentów and Historia wizyt. It does **not** “send” patient-less appointments; it only **requests** the list.
- **Backend:** Must **return** all matching appointments, including those with **no** patient. For those, include the item in the `data` array with `patient: null` (or no `patient`).
- **FE:** No change needed. It already handles `appointment.patient === null` and shows “Zakończ rejestrację” for those rows.

### Summary for integration

| Flow | API | Who does what |
|------|-----|----------------|
| **Create visit-only** | POST `/appointments/reception` | FE sends body **without** patient fields. Backend creates appointment with no patient. |
| **List (see visit-only)** | GET `/appointments/details/list` | Backend **returns** visit-only appointments in the list with `patient: null`. FE already displays them and shows “Zakończ rejestrację”. |
| **Complete registration** | POST `/api/appointments/:visitId/complete-registration` | FE already implemented. Backend creates/links patient and returns success (and optional `peselWarning`). |
