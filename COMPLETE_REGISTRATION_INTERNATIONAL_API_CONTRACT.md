# Complete Registration – International Patient API Contract

This document describes how the frontend sends data when completing registration **with "International patient (no PESEL)"** enabled in the **Complete Registration** modal. The backend should accept and validate these fields and create a PATIENT_ID without PESEL.

---

## Endpoint

- **Method:** `POST`
- **Path:** `/appointments/:visitId/complete-registration`
- **Content-Type:** `application/json` (same as existing complete-registration)

---

## When international patient is selected

The request body will include **`isInternationalPatient: true`** and **no `pesel`**. The backend must treat this as “create/link patient by document identification” instead of by PESEL.

---

## Field names and usage

### Required for creating PATIENT_ID (international mode)

| Field name | Type   | Description |
|------------|--------|-------------|
| `isInternationalPatient` | boolean | Always `true` when this path is used. |
| `firstName` | string | Patient first name. |
| `lastName` | string | Patient last name. |
| `dateOfBirth` | string | ISO date or `YYYY-MM-DD`. Required in international mode. |
| `documentCountry` | string | Country of document issuance (e.g. "Germany", "Poland"). |
| `documentType` | string | One of: `"Passport"`, `"ID Card"`, `"Residence Card"`, `"Other"`. |
| `documentNumber` | string | Document number. |
| `internationalPatientDocumentKey` | string | **Single key for duplicate check and storage.** Format: `"country|documentType|documentNumber"` (pipe-separated, trimmed). Example: `"Germany|Passport|AB123456"`. Backend should store this and use it for uniqueness and PATIENT_ID. |

### Optional (same as non-international)

| Field name | Type   | Description |
|------------|--------|-------------|
| `phone` | string | Full phone with country code. |
| `phoneCode` | string | E.g. "+48". |
| `mobileNumber` | string | Digits only. |
| `email` | string | |
| `sex` | string | "Male" / "Female" / "Others". |
| `street` | string | |
| `zipCode` | string | |
| `city` | string | |
| `smsConsentAgreed` | boolean | |
| `consents` | array | |

---

## Example request body (international)

```json
{
  "isInternationalPatient": true,
  "firstName": "Jan",
  "lastName": "Kowalski",
  "dateOfBirth": "1990-05-15",
  "documentCountry": "Germany",
  "documentType": "Passport",
  "documentNumber": "AB123456",
  "internationalPatientDocumentKey": "Germany|Passport|AB123456",
  "phone": "+48123456789",
  "phoneCode": "+48",
  "mobileNumber": "123456789",
  "email": "jan@example.com",
  "sex": "Male",
  "street": "ul. Example 1",
  "zipCode": "00-001",
  "city": "Warsaw",
  "smsConsentAgreed": true,
  "consents": []
}
```

---

## Backend behaviour

1. **When `isInternationalPatient === true`:**
   - Do **not** require `pesel`.
   - Require: `firstName`, `lastName`, `dateOfBirth`, `documentCountry`, `documentType`, `documentNumber` (and thus a valid `internationalPatientDocumentKey`).
   - Use `internationalPatientDocumentKey` as the unique document identifier: store it and use it for duplicate checks and for generating/maintaining PATIENT_ID.

2. **Duplicate document (recommended):**
   - If a patient already exists with the same `internationalPatientDocumentKey`, respond with **HTTP 409** and body e.g. `{ "existingPatientId": "<_id>", "message": "..." }` so the frontend can offer “link to existing patient” (same pattern as Create Patient modal).

3. **Success:**
   - Create the patient (or link visit to existing patient), create/assign PATIENT_ID, link the appointment to the patient, and return the same shape as the existing complete-registration success response.

4. **PESEL vs document:**
   - Do **not** require both PESEL and document identification in the same request. If `isInternationalPatient` is true, PESEL is not sent and must not be required.

---

## Summary for backend

- **Endpoint:** `POST /appointments/:visitId/complete-registration`
- **International flag:** `isInternationalPatient: true` (no `pesel`).
- **Document key field:** `internationalPatientDocumentKey` — string, format `"country|documentType|documentNumber"`. Store it and use it for validation and PATIENT_ID.
- **Minimum required (international):** `firstName`, `lastName`, `dateOfBirth`, `documentCountry`, `documentType`, `documentNumber` (and therefore `internationalPatientDocumentKey`).
- **Duplicate response:** 409 with `existingPatientId` in body when a patient with the same document key already exists.
