# Backend: Additional vital parameters (Parametry życiowe – rozszerzenie)

Use this in your **backend** so the **patient details page** can persist and display the extra vital parameters: systolic/diastolic blood pressure, pulse, and oxygen saturation.

---

## 1. New fields to support

Add these four fields wherever you already store **vital parameters** (e.g. `weight`, `height`, `temperature`, `bloodPressure`). Prefer **numeric** (number) or **string**; frontend sends `null` when the user clears the field.

| Field name (camelCase)   | Polish label (UI)        | Unit / notes        |
|--------------------------|---------------------------|---------------------|
| `bloodPressureSystolic`  | Ciśnienie skurczowe      | mmHg                |
| `bloodPressureDiastolic` | Ciśnienie rozkurczowe    | mmHg                |
| `pulse`                  | Tętno                     | bpm                 |
| `oxygenSaturation`      | Saturacja                 | % (0–100)           |

Use these **exact** property names in JSON so the frontend can read/write them without changes.

---

## 2. APIs that must accept these fields (write)

### 2.1. Update appointment details

- **Endpoint:** `PUT /appointments/:appointmentId/details`
- **Body:** includes `patientData` (object). The frontend sends the full `patientData` object, including:
  - Existing: `weight`, `height`, `temperature`, `bloodPressure`, …
  - **New:** `bloodPressureSystolic`, `bloodPressureDiastolic`, `pulse`, `oxygenSaturation`
- **Backend:** Persist these four keys inside the appointment’s patient/vital data (or wherever you store `weight`/`height`/`temperature`). If your schema uses a nested object (e.g. `patientData.vitals`), add these four fields there and merge them on save.

No change to URL or method; only extend the accepted `patientData` shape and storage.

---

## 3. APIs that must return these fields (read)

The frontend needs these fields in two places: when loading the **patient** and when loading the **appointment**. Return them in the same shape you use for `weight`, `height`, `temperature`, `bloodPressure`.

### 3.1. Get patient details

- **Endpoint:** `GET /patients/details/:id`
- **Response:** The frontend expects `response.data.patientData` (or equivalent) to contain patient/vital data.
- **Action:** Include in that object:
  - `bloodPressureSystolic`
  - `bloodPressureDiastolic`
  - `pulse`
  - `oxygenSaturation`
  (plus existing fields like `weight`, `height`, `temperature`, `bloodPressure`).  
  Use `null` or omit if not set.

### 3.2. Get appointment by ID

- **Endpoint:** `GET /appointments/:appointmentId`
- **Response:** The frontend reads vital data from either:
  - `response.data.patient`, or  
  - `response.data.patientData`  
  (and merges with existing state).
- **Action:** In whichever object you use for per-appointment/visit vitals (e.g. `data.patient` or `data.patientData`), include:
  - `bloodPressureSystolic`
  - `bloodPressureDiastolic`
  - `pulse`
  - `oxygenSaturation`
  (and existing vitals like `weight`, `height`, `temperature`, `bloodPressure`).  
  Use `null` or omit if not set.

---

## 4. Example payloads (for reference)

**Frontend sends on save (PUT `/appointments/:id/details`):**

```json
{
  "patientData": {
    "weight": 82.5,
    "height": 178,
    "temperature": 36.6,
    "bloodPressure": null,
    "bloodPressureSystolic": 120,
    "bloodPressureDiastolic": 80,
    "pulse": 72,
    "oxygenSaturation": 98
  },
  "consultationData": { ... },
  "medications": [ ... ],
  "tests": [ ... ]
}
```

**Backend should return (e.g. GET `/appointments/:id` – patient/vital block):**

```json
{
  "data": {
    "patient": {
      "weight": 82.5,
      "height": 178,
      "temperature": 36.6,
      "bloodPressureSystolic": 120,
      "bloodPressureDiastolic": 80,
      "pulse": 72,
      "oxygenSaturation": 98
    }
  }
}
```

Same four keys should appear in `GET /patients/details/:id` inside the object the frontend uses as `patientData`.

---

## 5. Summary checklist

- [ ] **Storage:** Persist `bloodPressureSystolic`, `bloodPressureDiastolic`, `pulse`, `oxygenSaturation` (e.g. in appointment details or patient vitals, same place as `weight`/`height`/`temperature`).
- [ ] **PUT `/appointments/:id/details`:** Accept and store these four fields inside the request’s `patientData` (or nested vitals object).
- [ ] **GET `/patients/details/:id`:** Return these four fields in the response object used as `patientData`.
- [ ] **GET `/appointments/:id`:** Return these four fields in `data.patient` and/or `data.patientData` (whichever you use for vitals).

If your backend already stores `patientData` as a flexible object (e.g. JSON column) and returns it as-is, you may only need to ensure these keys are not stripped on read/write. Otherwise, add the four fields to your schema and to the above APIs so the UI can show and save them.
