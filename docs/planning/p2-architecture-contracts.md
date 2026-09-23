# P2.5 — System Architecture & Interface Contracts

**Tier:** T1 · Stack: **Laravel 11 API + React/TS (Vite)**, two separate apps.

## 1. Layers and responsibilities

| Layer | Responsibility | Watch for (adversarial findings) |
|---|---|---|
| **Frontend** (`frontend/`) | React 19 + Vite + TS. Routing via `react-router`. Server state via TanStack Query (cache + optimistic hold). Local UI state only for form inputs. **No business rules** — price and availability are server-derived. | God components; price computed client-side (A3 — forbidden); gating admin by hiding a button (A6 — forbidden). |
| **Backend** (`backend/`) | Laravel 11, route → controller → **service** → repository/Eloquent. Validation in FormRequest at the boundary. **Transactions begin in the service**, never the controller. Uniform JSON error envelope. | Business logic in controllers; N+1 on the admin grid; validation only in the controller. |
| **Database** | PostgreSQL 16. `rooms`, `bookings`, `payments`. Money `integer` (IDR). Time `timestamptz` (UTC). Slot uniqueness enforced by a DB constraint, not app code alone. Expand-and-contract migrations. | Missing unique index (A1); float money; naive timestamps (A4). |

**The seam is real:** two apps, one contract. This is what makes the P2.5 contract
test the load-bearing artifact — a field rename on the backend must fail a test,
not silently break the UI.

## 2. Interface contract (written BEFORE either side)

**Base:** `/api` · **Format:** JSON · **Auth:** Laravel Sanctum session cookie for
`/api/admin/*`; public routes are unauthenticated.

**Uniform envelope** (every response):
```jsonc
// success
{ "success": true,  "data": <payload>, "meta": { "page": 1, "per_page": 20, "total": 42 } }
// error
{ "success": false, "error": { "code": "SLOT_TAKEN", "message": "Slot 19.00–20.00 baru saja diambil.", "fields": { "start_at": ["..."] } } }
```

### Endpoints

| Method | Path | Auth | Request | Response `data` | Errors |
|---|---|---|---|---|---|
| GET | `/api/rooms` | public | `?page` | `Room[]` | — |
| GET | `/api/rooms/:id/availability` | public | `?date=YYYY-MM-DD` | `{ date, room_id, slots: Slot[] }` | 404, 422 (bad date) |
| POST | `/api/bookings` | public | `{ room_id, start_at (ISO-8601 UTC), duration_hours, name, phone }` | `Booking` (status `pending`, `hold_expires_at`, `booking_code`) | **409 SLOT_TAKEN**, 422 validation |
| GET | `/api/bookings/:code` | public | — | `Booking` (public fields only) | 404 |
| POST | `/api/bookings/:code/cancel` | public | — | `Booking` | 404, **409 ILLEGAL_TRANSITION** |
| POST | `/api/bookings/:code/pay` | public | `{}` (no amount — A3/A8) | `{ payment_id, redirect_url }` | 404, 409 |
| POST | `/api/payments/webhook` | signature | `{ payment_id, status, amount_idr, signature }` | `{ ok: true }` | 401 bad signature; **idempotent** (A2) |
| GET | `/api/admin/bookings` | **auth+role** | `?date&room_id&page` | `Booking[]` | **401/403** (A6) |
| POST | `/api/admin/bookings/:id/cancel` | **auth+role** | `{ reason }` | `Booking` | 401/403, 409 |

### Types (exact — same names both sides)

```ts
type Room = { id: number; name: string; capacity: number; size_label: string;
              description: string; price_idr: number; features: string[] };

type Slot = { start_at: string; end_at: string; available: boolean;
              price_idr: number };

type Booking = { id: number; booking_code: string; room_id: number;
                 room_name: string; start_at: string; end_at: string;
                 duration_hours: number; total_idr: number; dp_idr: number;
                 status: 'pending' | 'paid' | 'cancelled';
                 hold_expires_at: string | null;
                 customer_name: string; customer_phone: string;
                 created_at: string };

type ApiError = { code: string; message: string; fields?: Record<string,string[]> };
```

**Error codes (closed set):** `VALIDATION_FAILED`, `SLOT_TAKEN`,
`ILLEGAL_TRANSITION`, `NOT_FOUND`, `UNAUTHENTICATED`, `FORBIDDEN`,
`BAD_SIGNATURE`, `RATE_LIMITED`.

## 3. Enforcement mechanism

- **Shared types** — `frontend/src/types/api.ts` mirrors the contract above.
- **Contract test (backend)** — `backend/tests/Feature/ContractTest.php` asserts the
  exact JSON shape of every endpoint against a fixture, including error codes. A
  field rename fails it.
- **Contract test (frontend)** — `frontend/src/api/__tests__/contract.test.ts`
  validates a captured backend fixture against the TS types at runtime (zod).
- **CI gate** — both run; either red blocks merge. This is the "72 green tests,
  broken UI" guard from the SOP.

## 4. State machine (booking)

```
pending --pay(ok)--> paid
pending --cancel--> cancelled
pending --hold TTL expires--> cancelled   (scheduled job)
paid    --cancel--> cancelled             (refund recorded, mock)
cancelled --> (terminal)
```
Any other transition → **409 ILLEGAL_TRANSITION** (A10).

## Rulings

- **R1** Auth = session cookie (Sanctum), not JWT. Reason: T1, single owner
  account; cookies are revocable server-side and simpler to secure.
- **R2** Booking id exposed publicly = opaque `booking_code` (ULID); numeric `id`
  is admin-only. Reason: A5 (IDOR).
- **R3** Owner login is a modal on `/admin`, not a separate screen. Reason: it is
  a gate, not a destination.
- **R4** Owner settings limited to: change password, set per-room price. Reason:
  YAGNI — nothing else traces to an AC.
- **R5** Payment is a **mock gateway** (internal route) with a signed webhook.
  Reason: exercise the real flow (idempotency, signature, reconciliation) without
  a real PSP or money.
- **R6** Hold TTL = 15 minutes. Reason: long enough to pay, short enough that an
  abandoned hold does not strand a prime evening slot.
