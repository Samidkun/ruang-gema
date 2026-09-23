# PLAN — Ruang Gema Studio (P5)

> Required: multi-task, multi-layer, subagent execution planned.
> Every task traces to an EARS criterion id. Dependency order, not importance.

## Global constraints (verbatim from HANDOFF §8)

- PHP 8.5 · Laravel 11 · PostgreSQL 16 · Node 24 · React 19 · Vite · TS 5.x ·
  TanStack Query v5 · Playwright.
- Money: integer IDR. Time: UTC store / Asia/Jakarta render.
- Slot unique per `(room_id, start_at)` where `status <> 'cancelled'`.
- Hold TTL 15 min. DP 50%. `per_page` ≤ 50.
- **Never** write production code without a failing test first.

## Dependency graph & waves

```
Wave 1 (independent)          Wave 2 (needs W1)            Wave 3 (needs W2)
─────────────────────         ──────────────────           ─────────────────
T1 schema + migrations        T3 contract tests            T6 booking-form screen
T2 factory bootstrap          T4 services (hold/pay/cancel) T7 success screen
                              T5 public endpoints          T8 admin dashboard
                                                           T9 frontend client+zod
                                                           T10 E2E Playwright
```

## Tasks

- [ ] **T1 — Schema + migrations** · AC-1..AC-12 (foundation)
  - Acceptance: `rooms`, `bookings`, `payments` migrate up+down; partial unique
    index on `(room_id, start_at)` where `status <> 'cancelled'` exists.
  - Verify: `php artisan migrate:fresh` then `migrate:rollback` — both green.
  - Files: `backend/database/migrations/*`.
- [ ] **T2 — Factory bootstrap** · P3.5
  - Acceptance: pre-commit (lint + secret scan), CI workflow, `.env.example`,
    Playwright scaffold present.
  - Verify: `bash scripts/bootstrap.sh --check`.
  - Files: `backend/.env.example`, `.github/workflows/ci.yml`, `.githooks/*`.
- [ ] **T3 — Contract tests (RED)** · AC-4,5,7,8,9,11,12
  - Acceptance: each contract test fails for the right reason before impl.
  - Verify: `php artisan test --filter=ContractTest` → RED.
  - Files: `backend/tests/Feature/ContractTest.php`.
- [ ] **T4 — Services** · AC-4,5,8,9,10,12
  - Acceptance: `BookingService::create` inserts and maps 23505 → SLOT_TAKEN;
    `settlePayment` is idempotent; `cancel` enforces the state machine.
  - Verify: `php artisan test --filter=BookingServiceTest` → GREEN.
  - Files: `backend/app/Services/BookingService.php`, `app/Jobs/ExpireHolds.php`.
- [ ] **T5 — Public + admin endpoints** · AC-4,6,7,11
  - Acceptance: 9 endpoints return the exact envelope; admin routes 401/403
    unauthenticated with no data in the body.
  - Verify: `php artisan test --filter=ContractTest` → GREEN.
  - Files: `backend/routes/api.php`, `app/Http/Controllers/Api/*`, `Requests/*`.
- [ ] **T6 — booking-form screen** · AC-3, AC-4, AC-10
  - Acceptance: 1:1 transplant from `preview/mockup/booking-form.html`; slots
    aria-disabled when taken; 409 shows inline error naming the hour and preserves
    name/phone; hold countdown renders mm:ss.
  - Verify: Playwright `booking-form.spec.ts`.
  - Files: `frontend/src/screens/BookingForm.tsx`, `src/components/ui/TimeGrid.tsx`.
- [ ] **T7 — booking-success screen** · AC-5, AC-6
  - Acceptance: unpaid/paying/paid/payment-failed states; code + WIB time + DP
    shown; copy-code action.
  - Verify: Playwright `booking-success.spec.ts`.
  - Files: `frontend/src/screens/BookingSuccess.tsx`.
- [ ] **T8 — admin-dashboard screen** · AC-7, AC-11
  - Acceptance: owner-only; room×hour timeline; paginated; empty state teaches.
  - Verify: Playwright `admin.spec.ts` + feature test for 403.
  - Files: `frontend/src/screens/AdminDashboard.tsx`.
- [ ] **T9 — frontend client + zod guard** · contract
  - Acceptance: `client.ts` parses every response with the zod schema; a drifted
    field throws.
  - Verify: `vitest` contract test against a captured backend fixture.
  - Files: `frontend/src/api/client.ts`, `src/types/api.ts`.
- [ ] **T10 — E2E suite** · AC-1..AC-12
  - Acceptance: one Playwright spec per AC id, driving the real UI.
  - Verify: `npx playwright test` → green against a running stack.
  - Files: `frontend/e2e/*.spec.ts`.

## Self-review of this plan

- Coverage: every AC id appears in ≥1 task. ✓
- Placeholder scan: none. ✓
- Type consistency: types come from `docs/planning/p2-architecture-contracts.md`
  §2 — single source, no re-declaration. ✓
- Every task traces to a criterion id. ✓
