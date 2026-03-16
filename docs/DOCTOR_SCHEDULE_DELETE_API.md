# Doctor schedule – delete APIs

## 1. Delete entire schedule (existing)

- **Method:** `DELETE`
- **Path:** `/api/schedule/schedule/id/:scheduleId`
- **Use when:** User removes the whole day (e.g. "Usuń na stałe" in Edit modal or from calendar/list).

---

## 2. Delete schedule by doctor + date (existing)

- **Method:** `DELETE`
- **Path:** (as used by frontend when `_id` is not available)
- **Use when:** Fallback when schedule document has no `_id`.

---

## 3. Delete a single time block

- **Method:** `DELETE`
- **Path:** `/api/schedule/schedule/id/:scheduleId/blocks/:blockIndex`
- **Parameters:**
  - `scheduleId` – schedule document `_id` (from GET list or Edit modal).
  - `blockIndex` – 0-based index of the block in `timeBlocks` (0 = first, 1 = second, …).

**Behaviour:**

- Removes only the block at that index from `timeBlocks`.
- If other blocks remain: schedule is updated and the response returns `remainingBlocks`.
- If that was the last block: the schedule document is deleted and the response includes `scheduleDeleted: true`.

**Example:** Schedule has 13:00–15:00 and 16:00–17:00.  
`DELETE .../schedule/id/<id>/blocks/0` removes 13:00–15:00 and keeps 16:00–17:00.

**200 responses:**

| Case              | Response shape (example)                          |
|-------------------|---------------------------------------------------|
| Block removed     | `{ success: true, remainingBlocks: [...] }`       |
| Schedule deleted  | `{ success: true, scheduleDeleted: true }`       |

**Errors:** 4xx/5xx as usual (e.g. invalid `scheduleId`, `blockIndex` out of range).

---

## Summary table

| Action                  | Endpoint                                      | When to use                          |
|-------------------------|-----------------------------------------------|--------------------------------------|
| Delete whole day        | `DELETE /api/schedule/schedule/id/:scheduleId`| "Usuń na stałe" (entire schedule)    |
| Delete one time period  | `DELETE /api/schedule/schedule/id/:scheduleId/blocks/:blockIndex` | Remove single block in Edit modal |

---

## Frontend brief (implemented)

**Edit Schedule modal:**

- Each time block is shown as e.g. *"09:00 – 17:00 (Aktywny) [Usuń blok]"*.
- **Usuń blok** (when editing an existing schedule):
  - Confirm: *"Czy na pewno usunąć ten blok czasowy? Operacja jest nieodwracalna."*
  - Request: `DELETE /api/schedule/schedule/id/{scheduleId}/blocks/{blockIndex}` (`blockIndex` = position in `timeBlocks`).
  - On 200:
    - If `scheduleDeleted === true`: close modal, refetch schedule list, show success.
    - Else: update local `timeBlocks` from `remainingBlocks` and re-render (modal stays open).

**Where to show delete:**

- **Delete whole day:** "Usuń na stałe" at bottom of Edit modal (and from calendar/list) – uses full schedule delete.
- **Delete one time period:** "Usuń blok" next to each block in Edit modal – uses block delete endpoint above.
