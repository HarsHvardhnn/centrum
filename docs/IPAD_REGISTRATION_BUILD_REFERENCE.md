# iPad Registration Module — Build Reference

> Living document for development. Update as decisions are made or scope changes.
>
> **Repos:** `centrum` (frontend + kiosk UI + PDF HTML templates) · `centrum-be` (API, sessions, PDF generation, storage)
>
> **Last updated:** 2026-05-30

---

## 1. Product summary (what we are building)

A **tablet kiosk registration flow** inside CM7med:

1. Reception creates a visit (unchanged existing flow).
2. Reception chooses **Manual** or **Register via iPad**.
3. System generates a **6-digit PIN** linked to that `visit_id`.
4. Patient opens the kiosk page on iPad, enters PIN, fills one dynamic form, signs documents.
5. On **Complete registration**, system saves patient data, generates signed PDFs, attaches them to the patient/visit record.

Manual registration is **not changed**. iPad is an additional option only.

---

## 2. Locked client decisions (2026-05-30)

| # | Topic | Decision |
|---|--------|----------|
| 1 | **Patient types for v1** | **Adult only (18+)**. Minor templates (&lt;16, 16–18) + Figma coming within ~2 days. |
| 2 | **Existing PESEL in database** | **Allow sign-only** for now (not full stop). Reception can hand iPad back for signing; kiosk does not run full new-patient registration independently for existing patients. |
| 3 | **PESEL scope** | **Poland patients only** on iPad flow. International patients stay on existing manual / complete-registration path. |
| 4 | **Signed PDF delivery** | **Both** — auto-attach to patient documents in CM7med **and** reception download button. |
| 5 | **Signature method** | **Canvas / touch signature** on screen (no third-party e-sign provider for v1). |
| 6 | **PIN** | **6 digits**. Expiry measured in **hours** (default dev value: **2 hours**, env-configurable until client confirms exact number). |
| 7 | **Minor &lt;16 main contact** | **Ask user** to pick primary guardian — **deferred** (minors not in v1). |
| 8 | **Doctor office signing + optional docs scope** | **Skip for now** — architecture should allow later; not in first delivery slice unless re-scoped. |

---

## 3. Still pending from client

| Item | Blocks | Notes |
|------|--------|-------|
| Minor HTML templates (&lt;16, 16–18) | Minor kiosk forms + PDFs | Expected within 2 days with Figma |
| Figma kiosk UI | Visual polish | Can build functional UI first, align to Figma later |
| Filled sample adult PDF | QA reference | Blank template received |
| Exact PIN expiry hours | Config only | Using `KIOSK_SESSION_EXPIRY_HOURS=2` default |
| Optional docs in v1 | Doc 3 scope | Deferred per decision #8 |
| Legal approval of generated PDFs | Go-live | Dev can proceed with provided template |

---

## 4. v1 build scope (adult, Poland, PESEL)

### In scope

- Reception: start / monitor / cancel iPad session; show PIN
- Kiosk: PIN entry → adult registration form → consents → signature → complete
- PESEL validation + age detection (18+ for adult path)
- Existing PESEL → **sign-only mode** (no full registration form)
- Mandatory adult documents (Docs 1 & 2 from template)
- Canvas signature embedded in PDF
- Structured data saved to DB + PDF to `patient.documents[]` + reception download
- Session security (PIN, expiry, single visit binding)
- Integration with existing `POST /api/appointments/:visitId/complete-registration`

### Out of scope (v1)

- Minor patient forms (&lt;16, 16–18)
- International (non-PESEL) patients on kiosk
- Optional authorization documents (Doc 3 in template) — **deferred**
- Doctor office procedure consent signing
- HL7 / FHIR export
- Full version-correction UI (design models now; UI later)

---

## 5. Adult document template

**Source file:** `centrum/public/IPAD/CM7-dokumenty-pusty-szablon.html`

### Documents in template

| # | Document | Mandatory for adult v1 | Notes |
|---|----------|------------------------|-------|
| 1 | Zgoda na przetwarzanie danych osobowych | **Yes** | Patient grid + 3 consent checkboxes + signature |
| 2 | Oświadczenie pacjenta — zgoda na badanie/świadczenie | **Yes** | Inline name + PESEL + signature |
| 3 | Upoważnienie osoby bliskiej (health info + medical docs) | **No (deferred)** | Expandable optional section in PRD; skip in v1 |

### Doc 1 — merge fields

| Template label | Kiosk / DB field |
|----------------|------------------|
| Imię i nazwisko | `firstName` + `lastName` |
| Nr PESEL | `pesel` → `govtId` |
| Data urodzenia | derived from PESEL or `dateOfBirth` |
| Adres zamieszkania | `street` + `zipCode` + `city` + `province` (combined for single line in template, split in form) |
| Numer telefonu | `phoneCode` + `phone` |
| Adres e-mail | `email` |
| Checkbox: organizacja świadczeń | `consentHealthcare` — **required** |
| Checkbox: kampanie prozdrowotne | `consentHealthCampaigns` — optional |
| Checkbox: newsletter marketing | `consentMarketing` — optional |
| data | signature date (auto) |
| podpis pacjenta | canvas signature image |

### Doc 2 — merge fields

| Template | Field |
|----------|-------|
| Imię i nazwisko (inline) | `firstName` + `lastName` |
| PESEL (inline) | `pesel` |
| data | signature date |
| podpis pacjenta | same patient signature |

### Doc 3 — deferred

Template supports up to 3 authorized persons. Implement when optional docs are in scope.

### PDF generation approach

- Convert HTML template to server-side template with placeholder injection (Handlebars/EJS).
- Reuse existing Puppeteer pipeline (`visit-card.js` pattern).
- Embed signature PNG in `.sig-img-area` before PDF render.
- Upload final PDF to Cloudinary; store in `patient.documents[]` with `documentType: 'consent_form'`.
- Store `templateVersion: "1.0.0"` (adult blank template as received).

---

## 6. Patient type detection (PESEL)

Reuse / extend `centrum-be/utils/peselValidation.js`:

```
PESEL entered
  → validate format + checksum (soft warning)
  → derive dateOfBirth, age
  → age >= 18  → adult path (v1)
  → age 16–17  → minor16 path (later)
  → age < 16   → minor path (later)
```

**v1 kiosk:** if age &lt; 18, show message: *"Rejestracja na tablecie dostępna obecnie tylko dla pacjentów pełnoletnich. Przekaż urządzenie do rejestracji."* and end session (or hand off to reception).

---

## 7. Existing PESEL behavior (sign-only)

When `GET check-pesel` finds existing patient:

1. Kiosk shows: patient already registered.
2. Session mode switches to `sign_only` (not full `registration`).
3. Patient can sign mandatory documents; data pre-filled from existing patient record.
4. Reception assigns visit to existing patient via existing flow.
5. **No new patient created** via kiosk.

Differs from original PRD (which said stop entirely). Client chose sign-only for now.

---

## 8. Poland-only / PESEL-only on kiosk

- Kiosk form shows PESEL as primary identifier.
- No international document fields on kiosk in v1.
- International patients: reception uses existing manual registration + `complete-registration` with `isInternationalPatient: true`.

---

## 9. Adult kiosk form fields

Single dynamic form; v1 shows all sections (no minor conditionals).

| Field | Required | Maps to patient model |
|-------|----------|----------------------|
| PESEL | Yes | `govtId` |
| First name | Yes | `name.first` |
| Last name | Yes | `name.last` |
| Date of birth | Display (from PESEL) | `dateOfBirth` |
| Street | Yes | `address` |
| Postal code | Yes | `pinCode` |
| City | Yes | `city` |
| Voivodeship | Yes | `state` |
| Phone country code | Yes | `phoneCode` |
| Phone number | Yes | `phone` |
| Email | TBD optional | `email` |
| Consent: healthcare services | Yes (checked) | `consents[]` / `smsConsentAgreed` |
| Consent: health campaigns | No | `consents[]` |
| Consent: marketing newsletter | No | `consents[]` |
| Patient signature | Yes | `SignatureRecord` + embedded in PDF |

Use same phone country code component as `CompleteRegistrationModal.jsx` (`PHONE_COUNTRY_CODES`).

---

## 10. Session model

### RegistrationSession (new MongoDB collection)

```js
{
  visitId,              // ObjectId — required, indexed
  pinHash,              // bcrypt of 6-digit PIN
  pinExpiresAt,         // createdAt + KIOSK_SESSION_EXPIRY_HOURS
  status,               // see statuses below
  mode,                 // 'full_registration' | 'sign_only'
  patientType,          // 'adult' | 'minor' | 'minor16' (v1: adult only)
  initiatedBy,          // receptionist userId
  formData,             // draft JSON (auto-saved)
  patientId,            // set after complete or when sign_only
  packageId,            // link to RegistrationDocumentPackage
  deviceInfo,           // user-agent, IP (audit)
  completedAt,
  cancelledAt
}
```

### Statuses

`pending` → `active` → `in_progress` → `ready_for_signature` → `completed` | `cancelled` | `expired`

### Security rules

- PIN: 6 numeric digits, cryptographically random.
- Max **5** failed PIN attempts → lock session for 15 minutes.
- One **active** session per visit at a time.
- Kiosk auth: short-lived **session token** (JWT) after PIN validation — scoped to single `sessionId` + `visitId`.
- No staff JWT required on kiosk routes.
- Session invalidated on complete or cancel.
- Kiosk idle timeout: return to PIN screen after **5 minutes** (dev default).

### Env vars (proposed)

```
KIOSK_SESSION_EXPIRY_HOURS=2
KIOSK_PIN_MAX_ATTEMPTS=5
KIOSK_SESSION_JWT_SECRET=<secret>
KIOSK_IDLE_TIMEOUT_MINUTES=5
```

---

## 11. Signature storage

Not a loose image file. Each signature is a **SignatureRecord** bound to document version:

```js
{
  signerRole: 'patient',       // 'guardian1' | 'guardian2' later
  signerName,
  signerPesel,
  signatureImageUrl,           // Cloudinary
  contentHashAtSign,           // SHA-256 of document HTML snapshot
  signedAt,
  deviceInfo,
  documentVersionId
}
```

Canvas capture on frontend → base64 PNG → backend uploads → hash computed → PDF rendered with embedded image.

---

## 12. API endpoints (new)

Base: `/api/kiosk/`

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/sessions` | Reception JWT | Create session for `visitId`, return plain PIN once |
| GET | `/sessions/:sessionId/status` | Reception JWT | Poll status for reception panel |
| POST | `/sessions/:sessionId/cancel` | Reception JWT | Cancel active session |
| POST | `/activate` | Public | Body: `{ pin }` → returns session token |
| GET | `/form` | Session token | Load form state + mode |
| PUT | `/form` | Session token | Auto-save draft |
| POST | `/check-pesel` | Session token | Validate PESEL, age, existing patient check |
| POST | `/complete` | Session token | Validate, sign, generate PDFs, complete-registration, close session |
| GET | `/documents/:packageId/download` | Reception JWT | Zip or multi-download signed PDFs |

Internal: `complete` calls existing complete-registration controller logic — do not duplicate patient creation.

---

## 13. Frontend structure (planned)

```
centrum/src/
  components/Kiosk/
    KioskApp.jsx
    PinEntryScreen.jsx
    AdultRegistrationForm.jsx
    SignOnlyScreen.jsx          # existing PESEL path
    SignaturePad.jsx
    ConsentCheckboxes.jsx
  components/admin/
    IpadSessionPanel.jsx        # PIN display + status in reception UI

centrum/src/routes.jsx          # add public route: /kiosk

centrum/public/IPAD/            # HTML templates (source for PDF generation)
centrum-be/templates/ipad/      # server-side rendered templates (copy/adapt from public/IPAD)
```

---

## 14. Reception UI integration points

| File | Change |
|------|--------|
| `ReceptionAppointmentForm.jsx` | After visit created: Manual \| iPad choice |
| `CompleteRegistrationModal.jsx` | Unchanged for manual path |
| Visit detail / appointment views | `IpadSessionPanel` — PIN, status, download docs, cancel |
| `appointmentHelper.js` | Add kiosk session API helpers |

---

## 15. PDF storage (both)

On complete:

1. Save structured `RegistrationDocument` records in DB.
2. Upload PDFs to Cloudinary.
3. Push each PDF into `patient.documents[]`:
   - `documentType: 'consent_form'`
   - `fileName`, `url`, `downloadUrl`, `mimeType: 'application/pdf'`, `isPdf: true`
4. Expose `GET /api/kiosk/documents/:packageId/download` for reception bulk download.

---

## 16. Versioning (design now, UI later)

- Signed documents are immutable.
- Correction flow: new version, old marked `replaced_by_new_version`, requires re-sign.
- Audit fields per version: `documentId`, `versionId`, `templateVersion`, `patientId`, `visitId`, timestamps, `initiatedBy`, `deviceInfo`, `previousVersionId`.
- UI for "Correct and regenerate" — **not v1**; model supports it.

---

## 17. Future architecture hook (not v1)

Same `RegistrationDocument` pattern should later support:

- `contextType: 'registration' | 'procedure' | 'examination'`
- Doctor-initiated session for existing patient + visit
- Patient reviews pre-filled doc → signs only

---

## 18. Build order

### Phase A — Backend foundation (start here)

1. `RegistrationSession` + `RegistrationDocument` models
2. PIN generation + session CRUD
3. Kiosk auth middleware (session token)
4. `check-pesel` endpoint (reuse `validatePesel`, age calc, existing patient lookup)
5. Adult HTML template → EJS/Handlebars in `centrum-be/templates/ipad/`

### Phase B — Kiosk frontend

1. `/kiosk` route + PIN screen
2. Adult registration form
3. Sign-only screen (existing PESEL)
4. Signature pad component
5. Complete flow + thank-you → reset to PIN

### Phase C — PDF + complete

1. Puppeteer PDF service for Docs 1 & 2
2. Signature embedding
3. Wire `complete` → `complete-registration` + `patient.documents[]`
4. Reception download endpoint

### Phase D — Reception panel

1. `IpadSessionPanel` in visit flow
2. Status polling
3. Download documents button

### Phase E — Later (when client delivers assets)

1. Minor &lt;16 template + form
2. Minor 16–18 template + dual signatures
3. Figma UI alignment
4. Optional Doc 3
5. Version correction UI

---

## 19. Defaults we are using until client confirms

| Setting | Default |
|---------|---------|
| PIN expiry | 2 hours |
| PIN attempts before lock | 5 |
| Kiosk idle reset | 5 minutes |
| Adult age threshold | 18 years |
| Email on adult form | Optional (match `CompleteRegistrationModal`) |
| Template version | `1.0.0` |

---

## 20. Reference links in codebase

| What | Where |
|------|-------|
| Adult blank HTML template | `centrum/public/IPAD/CM7-dokumenty-pusty-szablon.html` |
| PESEL validation | `centrum-be/utils/peselValidation.js` |
| Complete registration API | `centrum-be/controllers/appointmentController.js` → `complete-registration` |
| Complete registration FE | `centrum/src/components/admin/CompleteRegistrationModal.jsx` |
| Patient document storage | `centrum-be/models/user-entity/patient.js` → `documents[]` |
| Puppeteer PDF pattern | `centrum-be/controllers/visit-card.js` |
| Guardian/contact fields (minors later) | `centrum-be/docs/PATIENT_CONTACT_RELATIONSHIP_FIELDS.md` |
| Visit-only flow | `centrum/src/components/admin/ReceptionAppointmentForm.jsx` |

---

## 21. Implementation status

| Component | Path | Status |
|-----------|------|--------|
| RegistrationSession model | `centrum-be/models/registrationSession.js` | Done |
| RegistrationDocument model | `centrum-be/models/registrationDocument.js` | Done |
| PESEL age utils | `centrum-be/utils/peselAge.js` | Done |
| Kiosk session service | `centrum-be/services/kioskSessionService.js` | Done |
| PDF generation service | `centrum-be/services/registrationDocumentService.js` | Done (adult docs 1+2) |
| Kiosk API | `centrum-be/controllers/kioskController.js` | Done |
| Kiosk routes | `centrum-be/routes/kiosk-routes.js` | Done |
| Kiosk UI | `centrum/src/components/Kiosk/` | Done (adult v1) |
| Reception panel | `centrum/src/components/admin/IpadSessionPanel.jsx` | Done |
| Reception integration | `ReceptionAppointmentForm.jsx` | Done |

### API endpoints (live)

- `POST /api/kiosk/sessions` — reception starts session
- `GET /api/kiosk/sessions/:id/status` — poll status
- `POST /api/kiosk/sessions/:id/cancel` — cancel
- `POST /api/kiosk/activate` — patient enters PIN
- `GET/PUT /api/kiosk/form` — load/save draft
- `POST /api/kiosk/check-pesel` — PESEL + age + existing patient
- `POST /api/kiosk/complete` — sign, PDF, complete-registration
- `GET /api/kiosk/documents/:packageId/download` — reception download

### Kiosk URL

`https://<frontend-domain>/kiosk`

---

## 22. Change log

| Date | Change |
|------|--------|
| 2026-05-30 | Initial document. Client decisions locked. Adult-only v1. Template analyzed. |
| 2026-05-30 | Phase A–D implemented: backend session API, adult kiosk UI, PDF gen, reception panel. |
| 2026-05-30 | Phase 2: shared `puppeteerPdf` util, session-by-visit API, CompleteRegistrationModal iPad tab, kiosk UX (sex, auto-save, idle, back), voivodeship saved on complete-registration. |
| 2026-05-30 | E2E adult complete: separate PDFs per doc, signature Cloudinary upload, sign-only visit linking, appointment `registrationMethod: ipad_kiosk`, patient.documents + consents, 15mb JSON limit, multi-download, list badges. |
