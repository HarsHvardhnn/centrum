# Update Patient – Document Fields (Edit Modal)

This document describes how the **Settings → Edit Patient** modal sends document-related fields when updating a patient, so the backend can accept and persist them.

## Summary

- **Dane dokumentu tożsamości** in the edit patient modal are now **editable** (same as in create patient).
- **isInternationalPatient** remains **non-editable** in edit mode (checkbox disabled).
- On save, the frontend sends the same document fields as for create, via **PUT `/patients/:id`**.

---

## Request

- **Method:** `PUT`
- **URL:** `/patients/:id`
- **Content-Type:** `multipart/form-data`
- **Body:** `FormData` with all updated patient fields (including document fields when present).

---

## Document-related form fields sent

When the user edits an international patient and saves, the frontend includes these keys in the `FormData` (only when the value is defined):

| Form key | Type | Description |
|----------|------|-------------|
| `documentCountry` | string | Kraj wydania dokumentu |
| `documentType` | string | Typ dokumentu (e.g. passport, id card) |
| `documentNumber` | string | Numer dokumentu |
| `documentDateOfBirth` | string | Data urodzenia z dokumentu (date string) |
| `documentExpiryDate` | string | Data ważności dokumentu (date string) |
| `citizenship` | string | Obywatelstwo |
| `internationalPatientDocumentKey` | string | Composite key for duplicate check (see below) |

Other existing fields (e.g. `address`, `pinCode`, `city`, `isInternationalPatient`, `consents`, `documents`, etc.) are sent as before per current `updatePatient` payload.

---

## `internationalPatientDocumentKey`

- **When sent:** Only when the patient is international **and** all three are non-empty: `documentCountry`, `documentType`, `documentNumber`.
- **Format:** Single string: `"documentCountry|documentType|documentNumber"` (trimmed, pipe-separated).
- **Example:** `"Polska|Paszport|ABC123456"`.
- **Purpose:** Backend can use it for duplicate detection; if another patient has the same key, you may return `409` with `existingPatientId` (same as in create flow). On update, backend may allow the same key when it belongs to the current patient.

---

## Frontend flow (for reference)

1. **Settings.jsx – `handleAddPatient` (edit path)**  
   Builds `patientData = { ...formData, phoneCode, mobileNumber, phone }`.  
   If `formData.isInternationalPatient` and document country/type/number are set, adds:
   `patientData.internationalPatientDocumentKey = [documentCountry, documentType, documentNumber].join("|")`.

2. **patientHelper.js – `updatePatient(patientId, patientData)`**  
   Builds `FormData` and appends only keys that are present in `patientData` (e.g. `documentCountry`, `documentType`, `documentNumber`, `documentDateOfBirth`, `documentExpiryDate`, `citizenship`, `internationalPatientDocumentKey`).  
   Also appends `files` from `patientData.documents` and `documentsToDelete` if provided.

3. **DemographicForm.jsx**  
   Document section is shown when `formData.isInternationalPatient` is true. In edit mode, all document fields (country, type, number, dates, citizenship) are editable; only the “Pacjent międzynarodowy” checkbox stays disabled.

---

## Backend incorporation checklist

- [ ] **PUT `/patients/:id`** accepts optional multipart/form-data fields:  
  `documentCountry`, `documentType`, `documentNumber`, `documentDateOfBirth`, `documentExpiryDate`, `citizenship`, `internationalPatientDocumentKey`.
- [ ] Persist these on the patient record (same shape as used in complete-registration / create patient).
- [ ] If using `internationalPatientDocumentKey` for uniqueness: on update, allow the same key for the **current** patient; return 409 + `existingPatientId` only when the key belongs to a **different** patient.
- [ ] **GET `/patients/:id`** continues to return these fields so the edit modal can prefill and display them (already required for the modal).
