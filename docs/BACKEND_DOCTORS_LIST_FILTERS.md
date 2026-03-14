# Backend prompt: Doctors list (GET /docs) – filter support

Use this in your **backend repo** so the **Lista lekarzy** (List of doctors) filters work on **http://localhost:5173/lekarze**. The frontend sends all filter values as query parameters; the backend should apply them and return only doctors that match.

---

## API reference (quick list for backend)

**Endpoint:** `GET /docs`

**Query parameters the frontend sends** (only non-empty values; all optional):

| Query param      | Type   | Example values / format | When sent |
|------------------|--------|--------------------------|-----------|
| `search`         | string | Free text                | Header "Szukaj lekarza" or filter "Imię specjalisty" (debounced ~400 ms). |
| `specialization` | string | `Kardiolog`, `Dermatolog`, `Neurolog`, `Pediatra` | Filter "Filtruj według specjalisty". |
| `date`           | string | `YYYY-MM-DD` (e.g. `2026-03-11`) | Filter "Filtruj według wizyty" → data. |
| `status`         | string | `Zaplanowane`, `Anulowane`, `Zakończone` | Filter "Filtruj według wizyty" → status. |
| `visitType`      | string | `Konsultacja`, `Zabieg`, `Kontrola` | Filter "Filtruj według wizyty" → typ wizyty. |
| `availability`   | string | `true` (only when checked) | Filter "Pokaż tylko dostępnych Lekarzy". |
| `experience`     | string | (not currently in UI; reserved) | — |
| `department`     | string | (not currently in UI; reserved) | — |

**Example request:**

```
GET /docs?search=jan&specialization=Kardiolog&date=2026-03-11&status=Zaplanowane&visitType=Konsultacja&availability=true
```

**Response shape (unchanged):** `{ doctors: [ ... ] }` — same as current list endpoint.

**Backend:** Implement filtering for each param above (see sections below). You may map Polish status/visitType to your enums (e.g. Zaplanowane → booked, Anulowane → cancelled, Zakończone → completed; Konsultacja/Zabieg/Kontrola as needed).

---

## 1. Endpoint to extend

**GET `/docs`** (or equivalent “list all doctors” endpoint used by the admin/Lista lekarzy page.)

**Current behaviour (typical):** Returns all doctors, possibly with optional `specialization` (and maybe `experience`, `department`) query params.

**Required behaviour:** Support the query parameters below and filter the list accordingly.

---

## 2. Query parameters the frontend sends

The frontend calls:

```
GET /docs?search=...&specialization=...&date=...&status=...&visitType=...&availability=true&experience=...&department=...
```

Only non-empty values are sent. All are optional.

| Parameter        | Type    | Description |
|------------------|---------|-------------|
| `search`         | string  | Text search: filter doctors whose **name** (first/last) or **email** contains this string (case-insensitive). |
| `specialization` | string  | Filter by doctor’s specialization. Exact match or “primary” specialization (e.g. `Kardiolog`, `Neurolog`, `Pediatra`, `Dermatolog`). |
| `date`           | string  | **Date (YYYY-MM-DD).** Filter to doctors who have **at least one appointment** on this date. If not implemented yet, ignore and return all doctors (no date filter). |
| `status`         | string  | **Appointment status** for the given date (or “any” if no date). E.g. `booked`, `completed`, `cancelled`, or Polish: `Zarezerwowana`, `Zakończona`, `Anulowana`. Filter to doctors who have at least one appointment with this status (and optionally on `date` if provided). If not implemented, ignore. |
| `visitType`      | string  | **Visit type** (e.g. `Konsultacja`, `Zabieg`, `Kontrola` or backend enum). Filter to doctors who have at least one appointment of this type (and optionally on `date` / `status` if provided). If not implemented, ignore. |
| `availability`   | string  | When `"true"`, return only doctors who are **available** (e.g. have availability/schedule for the selected period, or a simple “is available” flag). If not implemented, ignore. |
| `experience`     | string/number | Filter by years of experience (exact or range – backend decides). |
| `department`     | string  | Filter by department. |

---

## 3. Response shape (unchanged)

The frontend expects the same response as today:

```json
{
  "doctors": [
    {
      "id": "...",
      "_id": "...",
      "name": { "first": "...", "last": "..." },
      "email": "...",
      "specializations": ["Kardiolog"],
      "specialty": "Kardiolog",
      "bio": "...",
      "image": "...",
      "date": "2025-03-11T00:00:00.000Z",
      "status": "Dostępny",
      "available": true,
      "visitType": "Konsultacja"
    }
  ]
}
```

- `doctors`: array of doctor objects (same shape as current list).
- For **date/status/visitType**: if the backend filters by “has appointment on date / with status / with visit type”, the returned doctor objects can stay as they are; no need to add appointment details to each doctor in this response.

---

## 4. Implementation notes (for backend)

1. **search**  
   Apply to doctor’s `name.first`, `name.last`, and `email` (case-insensitive substring or full-text, as you prefer).

2. **specialization**  
   Match against `specializations` array or primary `specialty` (e.g. if `specialization=Kardiolog`, include doctors that have “Kardiolog” in specializations).

3. **date**  
   If you have an appointments collection/table: return doctors that have at least one appointment where `date` (or appointment date) equals the given `date` (YYYY-MM-DD). If you don’t have this relation yet, you can omit this filter and return all doctors (frontend will still work).

4. **status**  
   When filtering by appointments (e.g. with `date`), restrict to appointments with the given `status`. Map Polish labels to your enum if needed (e.g. Zarezerwowana → booked, Anulowana → cancelled).

5. **visitType**  
   Same idea: when filtering by appointments, restrict to appointments with the given `visitType` (or map from Polish: Konsultacja, Zabieg, Kontrola).

6. **availability**  
   When `availability=true`, exclude doctors who are not available (e.g. no schedule, or “unavailable” flag). Definition of “available” is up to the backend (e.g. “has shifts in the next 30 days” or “is marked available today”).

7. **Combining filters**  
   All provided query params should be ANDed: e.g. `specialization=Kardiolog` + `date=2025-03-11` → doctors who are cardiologists **and** have at least one appointment on 2025-03-11.

---

## 5. Frontend behaviour (for reference)

- **Lista lekarzy** uses **GET `/docs`** with the query params above.
- On “Zastosuj filtry” (Apply filters), the frontend sends the current filter values (specialization, date, status, visit type, availability) plus the current search text.
- On “Resetuj” (Reset), the frontend sends no filters (only optional `search` if the user typed in the search box).
- Search is debounced (~400 ms); changing the search term triggers a new GET with updated `search` param.

---

## 6. Summary checklist for backend

- [ ] **GET `/docs`** accepts optional query params: `search`, `specialization`, `date`, `status`, `visitType`, `availability`, `experience`, `department`.
- [ ] **search**: filter by doctor name (first/last) and email.
- [ ] **specialization**: filter by doctor’s specialization(s).
- [ ] **date** (optional): filter to doctors that have at least one appointment on this date.
- [ ] **status** (optional): when filtering by appointments, filter by appointment status.
- [ ] **visitType** (optional): when filtering by appointments, filter by visit type.
- [ ] **availability** (optional): when `"true"`, return only available doctors.
- [ ] Response shape unchanged: `{ doctors: [ ... ] }`.

Once these are implemented, the Lista lekarzy filters (specialist, date, status, visit type, availability, search) will work end-to-end.
