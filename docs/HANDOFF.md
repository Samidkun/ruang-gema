# HANDOFF.md — Ruang Gema Studio (Planning → Execution Contract)

> Produced by `sop-planning` (P6), consumed by `sop-execution` (E0).
> Every section filled or marked `N/A — <reason>`. **No TBD.**
> Frozen at handoff; changes are amendments recorded in §12.

---

## 1. Identity

| Field | Value |
|-------|-------|
| Project | Ruang Gema Studio — booking ruang rehearsal |
| Tier | **T1** (client, ada pembayar) |
| Ceremony level | **L** (auth + payments + migrations — three L triggers) |
| Spec level | **spec-anchored** |
| Team size | solo (1) |
| Stack | Backend: Laravel 11 (PHP 8.5) + PostgreSQL 16 · Frontend: React 19 + Vite + TS · Two separate apps |
| Constitution | `docs/CONSTITUTION.md` |
| Handoff date | 2026-09-23 |
| Frozen by | planning phase (pending human ACC — see §4a-ter) |

## 2. Goal & Scope

- **Goal (one sentence):** A band can see which rehearsal rooms are free at which
  hours, hold a slot, pay a 50% DP, and receive a confirmed booking code — without
  calling the studio; the owner can see and manage the day's schedule.
- **In scope:** 5 screens (§4a-bis), Laravel API, Postgres, Sanctum owner auth,
  mock payment gateway with signed webhook, slot hold + 15-min expiry, admin
  dashboard, E2E (Playwright), Docs (End-User Guide + Runbook), UAT, Retro.
- **Out of scope (explicit):** customer accounts/login, real PSP integration,
  real-card refunds, multi-tenant, SMS, i18n beyond Indonesian, light-mode toggle
  (ships dark-only — stated decision).
- **Definition of done (T1):** all 12 AC verified green; drift gate green; Docs +
  Playwright E2E present; UAT sign-off; retro written with DORA numbers.

## 2b. Boundaries

- **Always:** validate at the trust boundary; money as integer IDR; time stored
  UTC / rendered Asia/Jakarta; server derives price (never trust the client);
  surgical changes (every changed line traces to an AC).
- **Ask first:** any schema change after freeze; adding a dependency; changing a
  frozen contract field; any destructive migration.
- **Never:** write production code without a failing test; commit secrets; gate
  admin by hiding a button; store a client-supplied amount; downgrade the tier.

## 2c. Capability Map

`N/A — single capability (booking). Recorded as a Ruling (R7): the request does
not bundle independently testable capabilities.`

## 3. Prompt-Roast Result

- Six-axis score: **7 / 12** (Goal 2, Context 1, Scope 1, Success 2, Constraints 1,
  Ambiguity 0).
- Gaps named (if <10) and how answered: (a) studio-vs-clinic → **studio, T1**;
  (b) screen count → 5 (P2.0); (c) stack → Laravel API + React/TS separate;
  (d) payment → mock gateway.
- False premise checked against repo: **yes** — "studio/klinik" treated as
  equivalent was false; a clinic is a regulated domain (health data) → T2. Repo
  check also found `/mnt/data/dimas/components` is wine/dxvk, **not** a design
  system → decision is *establish*, not *extend*.
- **Assumptions surfaced** (expensive-to-reverse → Rulings §R1–R7): session-cookie
  auth; Postgres; mock payments; UTC storage; 5 screens.
- **Clarify gate (P1.5):** no material ambiguity open — **yes**.

## 4. Design Contract

**4a. `DESIGN.md` spine** (`DESIGN.md`, binding)
- Subject / audience / primary job: rehearsal studio, Jakarta Selatan; bands
  booking from a phone at night; primary job = see which room is free when, and
  book it.
- Voice: **presisi** dan **santai**.
- Token spine: `DESIGN.md` §4 (`--bg/--surface/--surface-2/--fg/--muted/--border/
  --border-strong/--accent/--accent-fg/--ok/--warn/--danger`, 3 font families,
  text/spacing/radius/shadow/motion scales). **Extend the file; do not invent.**
- **Signature bet:** *the time grid is the brand* — monospace tabular hour/price
  grid + a room×hour timeline on the primary screen, not generic cards.
- Knobs: DESIGN_VARIANCE 5 / VISUAL_DENSITY 7 / MOTION_INTENSITY 2 (reasons in
  `DESIGN.md` §6).
- **Anti-Slop Test:** "would you believe AI made this?" → **No** (justified in
  `DESIGN.md` §8).
- Banned-pattern check: no slop markers; no justified novelty beyond the
  signature bet.

**4a-bis. Screen Inventory (P2.0)**

| # | Screen id | Screen | Archetype | Primary job | Entry from | States | AC | Mockup | ACC |
|---|-----------|--------|-----------|-------------|------------|--------|----|--------|-----|
| 1 | `landing` | Landing | Guided Flow | Convince a band to check availability | direct / SEO | — | AC-1 | `preview/mockup/landing.html` | ☐ |
| 2 | `service-list` | Pilih ruangan | List-Detail | Compare rooms + hourly rates | `landing` | empty, loading, error | AC-2 | `preview/mockup/service-list.html` | ☐ |
| 3 | `booking-form` | Jadwal + data diri | Guided Flow | Pick a free slot and hold it | `service-list` | loading, error, slot-taken, pending | AC-3, AC-4, AC-10 | `preview/mockup/booking-form.html` | ☐ |
| 4 | `booking-success` | Konfirmasi & bayar | Guided Flow | Pay the DP and get the code | `booking-form` | unpaid, paying, paid, payment-failed | AC-5, AC-6 | `preview/mockup/booking-success.html` | ☐ |
| 5 | `admin-dashboard` | Jadwal harian (owner) | Executive Dashboard | See + manage the day's bookings | `/admin` direct | empty, loading, error, cancelled | AC-7, AC-11 | `preview/mockup/admin-dashboard.html` | ☐ |

- Flow: see `docs/planning/p2-screen-inventory-ux.md` §1 (entry points, primary
  goal, 7 steps, failure points).
- Screens deliberately excluded (with reason): customer login (guest checkout by
  phone + code); owner login (modal on `/admin`, Ruling R3); PSP hosted page
  (mock gateway is internal, Ruling R5).
- Screen-count sanity check: **passed** (every step covered / every screen
  reachable / no two-job screens).

**4a-ter. Mockup & approval gate (P2.1)**
- **Renderer used:** OpenDesign (project `ad322de6-4171-4e35-aaf4-d1de7a209250`),
  driven by this `DESIGN.md` + the P2.0 inventory.
- **Approved screens:** **none yet** — awaiting user ACC (this is the HARD GATE).
- **Screens NOT yet approved:** all 5. **Phase 2 SHALL NOT START until ACC.**

**4b. UI hygiene**
- Playbook loaded (one): `reference/new-work.md` (new interface).
- **Design system:** **establish** — tokens (`DESIGN.md` §4) + core components
  (Button, Card, Badge, Field, TimeGrid, DataTable) + naming convention.
- Figma involved? **N/A** — not used.
- States required: per §4a-bis, per screen (empty/loading/error/success/edge).
- UI detail checklist in scope: states, error pages (404/500), favicon+manifest,
  OG tags, theming (dark-only, decided), toast+confirm dialogs, inline form
  validation + disabled-while-pending, a11y (keyboard, focus ring, contrast
  ≥4.5:1, reduced-motion, one manual SR pass), responsive (390px, 44px targets).
- Excluded with reason: i18n (Indonesian only — stated), print stylesheet (no
  print use case).

**4c. UX floor (P2.4)**
- User flow + IA: `docs/planning/p2-screen-inventory-ux.md` §P2.0 §1 (holds).
- Nielsen's 10 — **weak ones named:** #1 visibility of status (hold countdown),
  #3 user control (cancel a held slot), #9 error recovery (name the taken hour).
- Microcopy rules: errors give the fix; empty states teach; CTAs specific; sentence
  case. (Binding for Phase 2.)
- UX coverage: onboarding **excluded** (guest checkout); settings **owner-only
  minimal** (R4); delete-confirm **included** (cancel booking); invite/share
  **included** (copy booking code); docs **included** (FAQ on landing).

**4d. Diagrams as code (P2.6)**
- ERD — `docs/diagrams/README.md` §1, generated from the migration.
- User flow — `docs/diagrams/README.md` §2, from 4c.
- Sequence — `docs/diagrams/README.md` §3, from the contract (create + pay).
- Architecture — `docs/diagrams/README.md` §4, from the layer map (P2.5).
- All in-repo, versioned, regenerated from source: **yes**.

## 5. Acceptance Criteria — EARS, binary-testable

Full statements + `Verify:` lines in `docs/spec.md` §Acceptance Criteria.

| Id | Pattern | Statement (short) | Verify |
|----|---------|-------------------|--------|
| AC-1 | event | Landing shows name/address/hours + availability link in one 390px viewport | Playwright 390px |
| AC-2 | state | Room list: skeletons → each room name/size/price "Rp X/jam" | Playwright (delayed mock) |
| AC-3 | event | Date select renders that date's slots; taken slots aria-disabled | Playwright |
| AC-4 | unwanted | Slot taken between view/submit → 409 SLOT_TAKEN + inline error naming hour + grid refresh + input preserved | contract + Playwright |
| AC-5 | unwanted | Duplicate webhook → exactly one settled payment, booking stays paid | feature (replay) |
| AC-6 | event | Confirmation shows code/room/WIB time/DP; `GET /bookings/:code` never leaks another's data | Playwright + feature |
| AC-7 | state | Unauthenticated `/api/admin/*` → 401/403, no booking data in body | feature |
| AC-8 | event | Concurrent same-slot → exactly one 201, rest 409; store still usable | feature (concurrency) |
| AC-9 | event | Cancel a paid booking → cancelled + refund; second cancel → 409 | feature |
| AC-10 | state | Held slot shows mm:ss countdown; TTL expiry cancels + frees the slot | feature (time travel) + unit |
| AC-11 | state | Every list paginated, `meta.per_page` ≤ 50, never whole table | feature (120 rows) |
| AC-12 | event | Client never sends an amount; a forged one is ignored, price server-derived | feature (forged amount) |

## 5b. Drift Contract

- Spec artifact path: `docs/spec.md`
- Criteria live in: `docs/spec.md` §Acceptance Criteria + `docs/LEDGER.md` (created
  at E0).
- Rule: spec + code land in the **same commit**; divergence is a **blocking** merge
  condition. Pure refactors state `spec: no change — <reason>`.
- Drift gate command: `bash scripts/drift-gate.sh` (wired into `local-ci.sh`, E9).

## 6. Feature Completeness (decided)

- **In scope (ticked):** validation at every boundary; pagination on all lists;
  seeders for dev+test; timezone (UTC store / WIB render); money as integer;
  expand-and-contract migrations; transactional email (booking code); background
  job (hold expiry); payments (idempotency + webhook); audit log (admin cancels);
  health endpoint; structured logging; error tracking hook; `.env.example`.
- **Deliberate exclusions (with reason):** file upload (no use case); search (4
  rooms); WebSocket (polling is enough at this scale); API versioning (single
  client, R5); CORS beyond the one origin (two apps, one origin in dev).
- **Security/reliability rows for T1:**
  - **STRIDE threat model:** `docs/planning/p0-roast-adversarial.md` §P0.5
    (A1–A12; spoofing → signed webhook; tampering → server-derived price;
    repudiation → audit log; disclosure → opaque code + role check; DoS → rate
    limit; elevation → server-side role).
  - **Security headers:** CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy —
    named as AC-adjacent criteria in E6.
  - **Secret scanning in CI:** gitleaks (P3.5 bootstrap).
  - **Dependency audit + license check in CI:** P3.5 bootstrap.
  - **SSRF:** N/A — no endpoint fetches a user-supplied URL.
  - **WCAG level:** **WCAG 2.2 AA**; axe-core in CI.
  - **SLO/error budget:** N/A — T1, not T2.

## 7. Interfaces & File Paths

- **Files to create (backend):** `backend/` Laravel app — `app/Models/{Room,Booking,
  Payment}.php`, `app/Services/BookingService.php`, `app/Http/Controllers/Api/*`,
  `app/Http/Requests/*`, `database/migrations/*`, `routes/api.php`,
  `tests/Feature/ContractTest.php`, `tests/Feature/ConcurrencyTest.php`.
- **Files to create (frontend):** `frontend/` Vite app — `src/screens/{Landing,
  ServiceList,BookingForm,BookingSuccess,AdminDashboard}.tsx`,
  `src/components/ui/{Button,Card,Badge,Field,TimeGrid,DataTable}.tsx`,
  `src/api/client.ts`, `src/types/api.ts`, `src/styles/tokens.css`.
- **Files to modify:** none yet (greenfield).
- **Interfaces between tasks (exact):** see §7b — the endpoint table + TS types are
  the interface. Task order: schema+migrations → contract tests → services →
  endpoints → frontend client → screens → E2E.
- **No "similar to Task N".**

## 7b. Interface Contracts

Full contract: `docs/planning/p2-architecture-contracts.md` §2–3.
- **Layers:** frontend (React, no business rules) / backend (Laravel route→
  controller→service→repo) / database (Postgres, constraint-enforced uniqueness).
- **Boundary:** 9 endpoints (rooms, availability, bookings CRUD-lite, pay, webhook,
  admin list, admin cancel) — shapes in §2 of that file.
- **Shared types:** `Room`, `Slot`, `Booking`, `ApiError` (identical names both
  sides).
- **Error envelope:** `{ success:false, error:{ code, message, fields? } }`;
  closed code set (8 codes).
- **Auth:** Sanctum session cookie for `/api/admin/*`; public routes unauthenticated;
  failure → 401/403 with the same envelope.
- **Enforcement:** shared TS types + backend `ContractTest.php` (exact JSON shape)
  + frontend zod runtime guard. Both in CI; either red blocks merge.

## 8. Constraints (verbatim)

- **Versions:** PHP **8.5**, Laravel **11**, PostgreSQL **16**, Node **24** (OD dev
  tooling requires ~24; app builds under 24), React **19**, Vite **latest**,
  TanStack Query **v5**, TypeScript **5.x**, Playwright **latest**.
- **Non-negotiables:** money integer IDR; UTC storage / Asia/Jakarta render; slot
  unique per (room, start_at) where status ≠ cancelled; hold TTL **15 min**;
  DP **50%**; per_page ≤ **50**.
- **Environment:** dev = two origins (Vite :5173, Laravel :8000) with CORS to the
  Vite origin; prod = single origin behind one reverse proxy. Node **v26 is
  present and breaks OD tooling** — pin Node 24 for tooling commands.

## 9. Plan Artifact

- Plan required? **yes** — multi-task, multi-layer, subagent execution planned.
- Path: `docs/plan.md` (written at P5).
- Global constraints section included verbatim: **yes**.

## 10. Factory Bootstrap

- Bootstrap run? **yes** (P3.5) — wiring `.env.example`, pre-commit (lint + secret
  scan), CI (lint→typecheck→test→audit→build), gitleaks, axe-core, Playwright
  scaffold, docs skeleton.
- Manual steps outstanding: (1) `gh` auth for remote/CI — none configured;
  (2) Postgres server not running — start via Docker (recorded).
- Result recorded: `docs/planning/p3.5-bootstrap.md`.

## 11. Accepted Risks

| Risk | Why accepted | Owner |
|------|--------------|-------|
| No git remote → CI never runs | Solo local project; `local-ci.sh` mirror used instead (SOP-sanctioned) | samid |
| Mock payment gateway, not a real PSP | Exercises the flow (idempotency/signature) without money; real PSP is a T2 concern | samid |
| Dark-mode only | Stated design decision; light mode is a non-goal | samid |

## 12. Amendments (changelog)

| Date | Change | Reason | Re-approved by |
|------|--------|--------|----------------|
| — | (none) | — | — |

## 13. P7 Readiness Gate

- [x] Tier + team + **ceremony level** written (§1)
- [x] **Spec level** declared (§1)
- [x] **Constitution** present (§1)
- [x] **Boundaries** recorded (§2b)
- [x] **Capability map** N/A with reason (§2c, R7)
- [x] Prompt-roast scored; gaps answered (§3)
- [x] False premise checked against repo (§3)
- [x] **Assumptions** surfaced; expensive ones are Rulings (§3)
- [x] **Clarify gate** passed (§3)
- [ ] Brainstorm approval obtained, in writing — **PENDING human ACC**
- [x] Design contract present; every state named (§4)
- [x] Acceptance criteria **EARS-shaped**, each with id + Verify (§5)
- [x] **Drift contract** recorded (§5b)
- [x] Feature Completeness walked; exclusions stated (§6)
- [x] Security/reliability rows for the tier named (§6)
- [x] Interfaces exact; no "similar to" (§7)
- [x] File paths listed (§7)
- [x] Constraints copied verbatim (§8)
- [x] No TBD/TODO anywhere
- [x] Factory bootstrap run or deferral stated (§10)
- [ ] Spec approved by the human — **PENDING human review**

**Frozen:** ☐ · **Handoff path:** `docs/HANDOFF.md` · **Seen by human:** ☐

---

## Rulings

- **R1** Auth = session cookie (Sanctum), not JWT. Reason: T1, single owner; cookies
  are revocable server-side.
- **R2** Public booking id = opaque `booking_code` (ULID); numeric `id` is
  admin-only. Reason: IDOR (A5).
- **R3** Owner login is a modal on `/admin`, not a screen. Reason: a gate, not a
  destination.
- **R4** Owner settings limited to change-password + per-room price. Reason: YAGNI.
- **R5** Payment is a mock gateway with a signed webhook. Reason: exercise the real
  flow without a real PSP.
- **R6** Hold TTL = 15 minutes. Reason: enough to pay, short enough not to strand a
  prime slot.
- **R7** No capability map. Reason: single capability (booking).
