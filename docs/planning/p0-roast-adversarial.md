# P0 — Prompt Roast, Classify & Adversarial Stress-Test

**Date:** 2026-09-23 · **Tier:** T1 · **Ceremony:** L

## P0a — Prompt Roast (score 7/12 → name gaps, ask, wait)

| Axis | Score | Note |
|---|---|---|
| Goal | 2 | clear: exercise 3 axes (mockup / design system / backend) |
| Context | 1 | "studio/klinik" underspecified |
| Scope | 1 | "full T1" ok; screen count not given |
| Success test | 2 | the SOP's own gates |
| Constraints | 1 | stack unspecified |
| Ambiguity | 0 | clinic vs studio is a **tier** difference |
| **Total** | **7/12** | 6–9 → gaps named, questions asked, waited |

**False premise caught:** "studio/klinik" treated as equivalent. They are not —
a clinic is a regulated domain (health data) → **T2**, mandating threat model,
encryption at rest, and a retention policy. A studio is ordinary business data →
**T1**. This changes every downstream gate. Resolved: **studio, T1.**

## P0b — Classify

**Architectural** (new project, multi-layer) + ceremony **L**, because three L
triggers fire at once: **auth**, **payments**, **migrations**. All gates on,
P0.5 adversarial included.

## P0.5 — Adversarial Stress-Test (adjudicated)

Each finding is **kept (→ design decision)** or **rejected (with reason)**. The
pass produces findings; it does not auto-apply them.

| # | Attack | Verdict | Resolution (→ design decision) |
|---|--------|---------|-------------------------------|
| A1 | **Race on slot booking** — two users submit the same (room, start) at once; both "check then insert" succeed | KEEP | Unique DB constraint `UNIQUE(room_id, start_at)` + insert-and-catch-409. Contract test fires N concurrent writes, requires exactly one 201 and N−1 × 409. |
| A2 | **Payment webhook replay** — the mock gateway webhook fires twice | KEEP | `payments.idempotency_key` UNIQUE; second webhook is a no-op returning 200. |
| A3 | **Client-controlled price** — the booking form posts an amount the client picked | KEEP | Price is **derived server-side** from `service.price_idr`. A posted amount is ignored. Criterion AC-5 asserts it. |
| A4 | **Time-zone slip** — slot stored local, rendered local, double-book across a TZ change | KEEP | Store UTC (`timestamptz`), render Asia/Jakarta. Criterion asserts a UTC input renders WIB. |
| A5 | **IDOR on booking** — user A reads user B's booking by guessing an id | KEEP | Bookings are looked up by an opaque `booking_code` (ULID), and by id only for the owning session. AC-6 + auth criterion. |
| A6 | **Admin route by URL** — visitor hits `/admin` directly | KEEP | Server-side role check on every `/api/admin/*` route; the frontend never gates. AC-7. |
| A7 | **Slot enumeration / scraping** — enumerate all future bookings | REJECT | Availability is *meant* to be public (that is the product). Only the **booker's PII** is protected, which A5 covers. Recorded as an accepted, intended exposure. |
| A8 | **Payment amount tampering on confirm** — client confirms with a smaller amount | KEEP | Confirmation reads the server-side payment record; the client cannot send an amount at all. |
| A9 | **Migration irreversibility** — a schema change that drops a column | KEEP | Expand-and-contract only; every migration has a tested `down()`. |
| A10 | **Cancel-after-pay refund race** — cancel and refund issued concurrently | KEEP | Cancel is idempotent + a state machine (`pending → paid → cancelled`); illegal transitions 409. |
| A11 | **Unbounded list** — `/api/bookings` returns every row forever | KEEP | Pagination mandatory on every list (cursor or page). AC-7 asserts page size. |
| A12 | **Email enumeration on login** | REJECT | Single admin account, no public login. Not applicable — recorded as N/A with reason. |

**Unresolved → Rulings:** none. All 12 adjudicated.

**Verdict:** the design is sound *with* A1–A6, A8–A11 built in. These become
acceptance criteria, not good intentions. A1, A2, A3, A5 are the four that a
"green suite" would otherwise miss — they are the E9 adversarial probes.
