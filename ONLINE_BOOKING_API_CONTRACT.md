# Online Booking API Contract – POST /appointments/book

This document describes the frontend payload changes for **online registration** and the backend behaviour expected for `POST /appointments/book`.

---

## Endpoint

- **Method:** `POST`
- **Path:** `appointments/book` (or `/appointments/book` depending on base URL)
- **Content-Type:** `application/json`

---

## Core Principle

- **Online booking must never create a new PATIENT_ID.**
- Online booking may:
  - Create VISIT_ID
  - Set `booking_source = ONLINE`
  - Link VISIT_ID to an existing PATIENT_ID when PESEL is provided and exists in the database

---

## Always Sent (unchanged)

| Field | Type | Description |
|-------|------|-------------|
| `date` | string | Date of appointment (YYYY-MM-DD) |
| `department` | string | Department ID |
| `doctor` | string | Doctor ID |
| `email` | string | Patient email |
| `gender` | string | male / female / other |
| `message` | string | Optional message |
| `name` | string | Patient name |
| `phone` | string | Full phone with country code |
| `time` | string | Slot start time |
| `consultationType` | string | "offline" or "online" |
| `smsConsentAgreed` | boolean | |
| `privacyPolicyAgreed` | boolean | |
| `medicalDataProcessingAgreed` | boolean | (for online) |
| `teleportationConfirmed` | boolean | (for online) |
| `contactConsentAgreed` | boolean | (for online) |
| `address` | string | (for online) |
| `dateOfBirth` | string | (for online, YYYY-MM-DD) |
| `recaptchaToken` | string | |
| `consent` | boolean | `true` |

---

## Changes to Request Payload

### 1. PESEL (`govtId`)

- **Before:** Always sent when provided; required for online consultation.
- **After:** Optional. Sent **only** when:
  - `isInternationalPatient` is **false** (or not sent), and
  - User has entered a PESEL value
- **Field:** `govtId` (string, optional)

### 2. International Patient Path

When the user selects “I do not have a PESEL number (international patient)”:

| Field | Type | Description |
|-------|------|-------------|
| `isInternationalPatient` | boolean | `true` |
| `documentCountry` | string | Country of document issuance |
| `documentType` | string | One of: `"Passport"`, `"ID Card"`, `"Residence Card"`, `"Other"` |
| `documentNumber` | string | Document number |
| `internationalPatientDocumentKey` | string | Format: `"country|documentType|documentNumber"` (e.g. `"Germany|Passport|AB123456"`) |

- When `isInternationalPatient === true`, `govtId` is **not** sent.
- When `isInternationalPatient === false` and user provides PESEL, `govtId` is sent; document fields are **not** sent.

---

## Backend Logic After "Confirm Appointment"

### Always

1. Create **VISIT_ID**
2. Set **`booking_source = ONLINE`**

### If PESEL is provided (`govtId` present)

1. Check if a patient with this PESEL exists in the database.
2. **If PESEL exists:**
   - Do **not** create a new PATIENT_ID
   - Link VISIT_ID to the existing PATIENT_ID
3. **If PESEL does not exist:**
   - Do **not** create PATIENT_ID online
   - Store PESEL in the visit record as **pending verification**
   - Set visit status to **"To be completed"**
   - PATIENT_ID is created only when staff clicks **"Complete registration"**

### If PESEL is not provided

- When `isInternationalPatient === true` (document path):
  - Create VISIT_ID only
  - **PATIENT_ID = NULL**
  - Store `documentCountry`, `documentType`, `documentNumber`, `internationalPatientDocumentKey` on the visit for later completion
  - Set visit status to **"To be completed"**
  - Patient data is completed at reception (Complete Registration flow)

- When user leaves PESEL empty and is not international:
  - Same as above: VISIT_ID only, PATIENT_ID = NULL, status "To be completed"

---

## Business Outcomes

- Patients can book regardless of name, surname, or phone differences
- No blocking on duplicate contact data (email/phone)
- Valid PESEL → visit is linked to existing patient
- No PATIENT_ID created online; only via "Complete registration" at reception

---

## Example Payloads

### With PESEL (link to existing patient if exists)

```json
{
  "date": "2025-02-20",
  "department": "...",
  "doctor": "...",
  "name": "Jan Kowalski",
  "email": "jan@example.com",
  "phone": "+48123456789",
  "time": "10:00",
  "consultationType": "online",
  "govtId": "90010112345",
  "address": "ul. Example 1, 00-001 Warszawa",
  "dateOfBirth": "1990-01-01",
  ...
}
```

### International patient (no PESEL)

```json
{
  "date": "2025-02-20",
  "department": "...",
  "doctor": "...",
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "+491234567890",
  "time": "10:00",
  "consultationType": "online",
  "isInternationalPatient": true,
  "documentCountry": "Germany",
  "documentType": "Passport",
  "documentNumber": "AB123456",
  "internationalPatientDocumentKey": "Germany|Passport|AB123456",
  "address": "...",
  "dateOfBirth": "1985-05-15",
  ...
}
```

### No PESEL, not international (empty identification)

```json
{
  ...
  "consultationType": "online",
  "address": "...",
  "dateOfBirth": "..."
}
```

(No `govtId`, no `isInternationalPatient`, no document fields.)
