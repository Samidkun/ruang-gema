# LEDGER — Ruang Gema Studio (E0)

> Progress lives here, not in context. Keyed by criterion id.

**Handoff:** `docs/HANDOFF.md` (frozen 2026-09-23, E0 PASS) · **Tier:** T1 · **Ceremony:** L

| AC | Statement (short) | Task | Test file | Status |
|----|-------------------|------|-----------|--------|
| AC-1 | Landing: name/address/hours/link in one 390px viewport | T6 | `e2e/landing.spec.ts` | ✅ web (screen 1) |
| AC-2 | Room list: skeletons → name/size/price | T5,T6 | `e2e/service-list.spec.ts` | ✅ web (screen 2) |
| AC-3 | Date select → slots; taken aria-disabled | T5,T6 | `e2e/booking-form.spec.ts` | ✅ web (screen 3) |
| AC-4 | 409 SLOT_TAKEN → inline error names hour + input preserved | T3,T4,T5,T6 | `ContractTest` + `e2e/booking-form.spec.ts` | ✅ backend+web |
| AC-5 | Duplicate webhook → one settled payment, booking paid | T3,T4,T5 | `ContractTest::test_webhook_idempotent` | ✅ backend |
| AC-6 | Confirmation shows code/room/WIB/DP; no PII leak | T5,T7 | `ContractTest` + `e2e/booking-success.spec.ts` | ✅ web (screen 4) |
| AC-7 | Unauthenticated admin → 401/403, no data | T3,T5,T8 | `ContractTest::test_admin_requires_auth` | ✅ backend+web |
| AC-8 | Concurrent same-slot → 1×201, rest 409 | T3,T4 | `ConcurrencyTest` | ✅ backend |
| AC-9 | Cancel paid → cancelled+refund; 2nd cancel 409 | T3,T4,T5 | `ContractTest::test_cancel_state_machine` | ✅ backend+web (modal) |
| AC-10 | Hold countdown mm:ss; TTL expiry cancels + frees | T4,T6 | `HoldExpiryTest` + unit | ✅ backend |
| AC-11 | Lists paginated, per_page ≤ 50 | T3,T5 | `ContractTest::test_pagination` | ✅ backend+web |
| AC-12 | Client amount ignored; price server-derived | T3,T4 | `ContractTest::test_forged_amount_ignored` | ✅ backend+web |

## Baseline (E1)

- [x] Worktree/branch created (feat/booking-mvp)
- [x] Baseline test suite runs (22 passed, 101 assertions)

## Environment

- PHP 8.5 ✓ · Composer ✓ · Node 26 (pin 24 for tooling) ✓ · Docker ✓
- PostgreSQL: **not running** — must start before T1.
