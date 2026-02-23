# Spend NG – App Audit

Quick audit of what’s in place and what’s missing. Use this as a checklist for improvements.

**Already fixed:** (1) Add/Edit form awaits submit, shows “Saving…”, and displays errors in the modal. (2) Load error has a Retry button. (3) Expense log same-date sort uses stable string comparison for UUIDs. (4) Forgot password link and reset flow on auth screen. (5) Session expiry: auth errors trigger sign-out and “Session expired. Please sign in again.” (6) Delete modal shows error on failure and allows retry. (7) Import shows “Importing X of Y” and then “Imported N” or “Imported N of Y (Z failed)” for 5s. (8) Refresh button for the list. (9) Meta description in index.html. (10) Loading text has role="status" aria-live="polite"; charts have aria-label. (11) Delete failure feedback in modal. (12) Category filter in expense log (plus date filter). Bulk delete intentionally not implemented.

---

## What’s already solid

- **Auth:** Sign in / sign up / sign out, session persistence, auth state listener, SetupRequired when Supabase isn’t configured.
- **Data:** Supabase CRUD, RLS so each user only sees their own expenses, load + error state on initial fetch.
- **UI:** Dashboard totals, charts (category + monthly), filterable log, add/edit modal, custom delete confirmation, theme toggle, export (JSON/CSV/Excel), import (JSON/CSV/Excel).
- **Copy:** Footer says data is cloud-synced; no “stored in browser” left.
- **Security:** `.env` gitignored, anon key in frontend is correct with RLS; no RLS bypass.
- **A11y:** Labels on form fields, `aria-label` on icon buttons, `role="alert"` on errors.

---

## Gaps and recommendations

### 1. Add/Edit form – critical

- **Bug:** The form calls `onSubmit(payload)` but does **not** `await` it, then calls `onSuccess()` immediately. The modal closes before the API call finishes. If create/update fails, the user sees the modal close and gets no error.
- **Fix:** In `ExpenseForm`, make `handleSubmit` async, `await onSubmit(...)`, then call `onSuccess()`. Disable the submit button (or show “Saving…”) while the request is in flight. Show an error message in the modal if the request fails (parent can pass `onError` or return a success flag from `onSubmit`).
- **Extra:** Prevent double submit (disable button + loading state).

### 2. Form / CRUD error feedback

- **Add expense / Edit expense:** On API failure we only `console.error`. User gets no toast or inline error.
- **Delete:** On failure we log and leave the modal open; user has no explicit “Delete failed” message.
- **Recommendation:** Surface errors in the UI (e.g. inline under the form, or a small toast/banner). At minimum, keep the modal open on add/edit failure and show “Something went wrong. Try again.” with a way to retry or cancel.

### 3. Load error recovery

- **Current:** If the initial `fetchExpenses()` fails, we show `loadError.message` but there’s no “Retry” action.
- **Recommendation:** Add a “Retry” button next to the load error so the user can call `loadExpenses()` again without refreshing.

### 4. Auth – forgot password

- **Current:** No “Forgot password?” on the auth screen.
- **Recommendation:** Add a link that calls Supabase `resetPasswordForEmail(email)` and show “Check your email to reset your password.” Supabase sends the reset email if the feature is enabled in the dashboard.

### 5. Session expiry / re-auth

- **Current:** If the refresh token fails (e.g. long idle), Supabase may return auth errors on the next request; the app shows a generic load error.
- **Recommendation:** On 401 or auth error from the API, clear session and redirect to the sign-in screen with a message like “Session expired. Please sign in again.”

### 6. Expense log sort order

- **Current:** Sort uses `(b.id ?? 0) - (a.id ?? 0)` for same-date rows. IDs are UUIDs (strings), so this yields `NaN` and order is effectively unstable.
- **Fix:** Sort by `date` desc, then by `id` for stability, e.g. `(b.id ?? '').localeCompare(a.id ?? '')`.

### 7. Import UX

- **Large files:** Import runs one `createExpense()` per row with no progress. For 100+ rows it can feel stuck.
- **Recommendation:** Optionally show “Importing… 45 of 100” or a progress bar. After finish, show “Imported 12 expenses” (or “12 of 15” if some rows failed and we report partial success).

### 8. Refresh list

- **Current:** `loadExpenses` exists but isn’t exposed in the UI. User must refresh the page to see changes from another tab/device.
- **Recommendation:** Add a “Refresh” button (or pull-to-refresh on mobile) that calls `loadExpenses()`.

### 9. Meta / SEO

- **Current:** `index.html` has a title; no meta description.
- **Recommendation:** Add `<meta name="description" content="...">` for sharing and search. Optional: Open Graph tags if you want nice link previews.

### 10. Accessibility

- **Loading:** The “Loading…” and “Loading expenses…” text could use `role="status"` and `aria-live="polite"` so screen readers announce updates.
- **Charts:** Recharts may have limited a11y; consider `aria-label` on chart containers and a short summary (e.g. “Spending by category: Food 30%, Transport 20%…”).

### 11. Delete failure feedback

- **Current:** If `deleteExpense` fails we log and leave the modal open; user doesn’t see “Delete failed”.
- **Recommendation:** Show a short error in the delete modal (e.g. “Could not delete. Try again.”) and keep the Delete button available to retry.

### 12. Optional enhancements

- **Bulk delete:** Select multiple rows and delete in one go (e.g. “Delete selected”).
- **Categories filter:** In addition to date filter, filter by category in the log.
- **PWA:** Add a manifest + service worker so the app can be installed and used offline (with queue or “sync when back online”).
- **Tests:** No tests in the repo; consider a few unit tests for helpers and integration tests for critical flows (e.g. add expense, delete).

---

## Priority summary

| Priority | Item |
|----------|------|
| **P0**  | Form: await `onSubmit`, loading state, show add/edit errors in modal. |
| **P1**  | Load error: add Retry button. |
| **P1**  | Expense log: fix same-date sort (use id string). |
| **P2**  | Forgot password link + reset flow. |
| **P2**  | Delete failure message in modal. |
| **P2**  | Refresh button for expense list. |
| **P3**  | Import progress or summary; meta description; a11y tweaks. |
