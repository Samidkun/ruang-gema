# SPEC — Ruang Gema Studio (booking ruang rehearsal)

**Tier:** T1 · **Ceremony:** L · **Spec level:** spec-anchored (drift contract §6)
**Team:** solo (1) · **Date:** 2026-09-23

## §Goal

A band can see which rehearsal rooms are free at which hours, hold a slot, pay a
50% DP, and receive a confirmed booking code — without calling the studio. The
owner can see and manage the day's schedule. Exercises three axes end-to-end:
**UI mockup fidelity**, a **reusable design system**, and a **real backend**
(Postgres + REST contract + auth + mock payments).

## §Scope

**In:** 5 screens (P2.0 inventory), Laravel API, Postgres, Sanctum owner auth,
mock payment gateway with signed webhook, slot hold + expiry, admin dashboard.

**Out (stated exclusions, not gaps):** customer accounts/login, real PSP
integration, refunds to a real card, multi-tenant, SMS, i18n beyond Indonesian,
dark/light toggle (ships dark-only — a stated decision, P2 of DESIGN.md).

## §Acceptance Criteria (EARS; each names its verification)

```markdown
AC-1 (event)   WHEN a visitor opens `/`, THE landing page SHALL show the studio
               name, address, opening hours, and a link to check room
               availability, all within one viewport on a 390px-wide screen.
               Verify: Playwright (390px) — assert address text, hours text, and
               the "Lihat jadwal" link are all visible without scrolling.

AC-2 (state)   WHILE the room list is loading, THE page SHALL show skeleton rows;
               WHEN it resolves, THE page SHALL show each room's name, size, and
               price_idr formatted as "Rp 150.000/jam".
               Verify: Playwright — intercept `/api/rooms` with a delay; assert
               skeletons; then assert the formatted price text.

AC-3 (event)   WHEN a visitor selects a date on `booking-form`, THE page SHALL
               render only the slots for that date and SHALL mark taken slots as
               unavailable and non-selectable.
               Verify: Playwright — mock availability with one taken slot; assert
               the taken slot has aria-disabled and click does nothing.

AC-4 (unwanted) IF a submitted slot was taken between view and submit, THEN THE
               API SHALL respond 409 with code SLOT_TAKEN and THE page SHALL show
               an inline error naming the hour, SHALL refresh the grid, and SHALL
               preserve the visitor's name and phone input.
               Verify: contract test (409 + code) + Playwright — mock 409; assert
               the error text contains the hour and the name field still holds its
               value.

AC-5 (unwanted) IF the payment webhook is delivered more than once for the same
               payment, THEN exactly one payment SHALL be settled and THE booking
               SHALL remain `paid`; no double charge SHALL be recorded.
               Verify: feature test — POST the same signed webhook twice; assert
               one settled payment row and booking.status == 'paid'.

AC-6 (event)   WHEN a booking is settled, THE confirmation screen SHALL show the
               booking_code, the room, the local (Asia/Jakarta) time range, and
               the DP amount; AND GET /api/bookings/:code SHALL return the booking
               without exposing another customer's data.
               Verify: Playwright — assert code + WIB time rendered; feature test
               — unknown code → 404; another code never leaks a different phone.

AC-7 (state)   WHILE an unauthenticated request is made to any `/api/admin/*`
               route, THE API SHALL respond 401/403 and SHALL NOT include any
               booking data in the body.
               Verify: feature test — hit each admin route with no session and
               with a non-owner session; assert status and empty body.

AC-8 (event)   WHEN two bookings for the same (room_id, start_at) are submitted
               concurrently, THE API SHALL accept exactly one and reject the other
               with 409 SLOT_TAKEN; the store SHALL remain usable for later writes.
               Verify: feature test — fire N concurrent inserts; assert 1×201,
               N−1×409, then a subsequent normal booking still succeeds.

AC-9 (event)   WHEN the owner cancels a `paid` booking, THE API SHALL move it to
               `cancelled`, record a refund, and reject any later cancel with 409
               ILLEGAL_TRANSITION.
               Verify: feature test — cancel twice; assert second is 409.

AC-10 (state)  WHILE a slot is held (status `pending`), THE booking-form SHALL
               display a countdown from hold_expires_at, and WHEN the TTL passes
               without payment THE booking SHALL become `cancelled` and the slot
               SHALL become bookable again.
               Verify: feature test with time travel — assert the expiry job
               cancels the booking; unit test — countdown renders mm:ss.

AC-11 (state)  WHILE any list endpoint returns more than one page, THE response
               SHALL be paginated with `meta.per_page` ≤ 50 and SHALL never
               return the whole table.
               Verify: feature test — seed 120 bookings; assert per_page cap and
               that page 1 < total.

AC-12 (event)   WHEN the booking form is submitted, THE client SHALL NOT send a
               price or amount field, and IF one is sent, THEN THE API SHALL
               ignore it and derive total_idr from room.price_idr × duration.
               Verify: feature test — POST a forged total_idr; assert the stored
               value equals the server-derived one.
```

## §Spec-quality checklist

- [x] Every criterion EARS-shaped with a `Verify:` line.
- [x] Consistent with `CONSTITUTION.md` (no double-booking, integer money, UTC).
- [x] No contradictions; no duplicate requirements.
- [x] Every §Goal item has ≥1 criterion (UI: AC-1..3,6; backend: AC-4,5,8,9,12;
      auth: AC-7; ops: AC-10,11).
- [x] No criterion encodes an implementation choice — observable behaviour only.
- [x] Edge cases have criteria: empty (AC-2), error (AC-4), permission (AC-7),
      concurrency (AC-8), replay (AC-5).
- [x] Traces to the capability map — single capability (booking), no map needed
      (recorded as N/A with reason).

## §Drift contract (spec-anchored)

- **The spec is:** this file + the 12 `AC-*` ids.
- **The criteria live in:** `docs/spec.md` §Acceptance Criteria and the ledger
  `docs/LEDGER.md` (created in Phase 2, E0).
- **Same-commit rule:** any code change that adds/changes behaviour lands with its
  spec or test in the same commit. Divergence is a **blocking** condition.
- **Enforcement:** the drift gate at E2/E9 — every AC id must have a passing test
  proven able to fail.
