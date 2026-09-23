# LEDGER — Ruang Gema Studio (E0)

> Progress lives here, not in context. Keyed by criterion id.

**Handoff:** `docs/HANDOFF.md` (frozen 2026-09-23, E0 PASS) · **Tier:** T1 · **Ceremony:** L

| AC | Statement (short) | Task | Test file | Status |
|----|-------------------|------|-----------|--------|
| AC-1 | Landing: name/address/hours/link in one 390px viewport | T6 | `e2e/landing.spec.ts` | ☐ |
| AC-2 | Room list: skeletons → name/size/price | T5,T6 | `e2e/service-list.spec.ts` | ☐ |
| AC-3 | Date select → slots; taken aria-disabled | T5,T6 | `e2e/booking-form.spec.ts` | ☐ |
| AC-4 | 409 SLOT_TAKEN → inline error names hour + input preserved | T3,T4,T5,T6 | `ContractTest` + `e2e/booking-form.spec.ts` | ☐ |
| AC-5 | Duplicate webhook → one settled payment, booking paid | T3,T4,T5 | `ContractTest::test_webhook_idempotent` | ☐ |
| AC-6 | Confirmation shows code/room/WIB/DP; no PII leak | T5,T7 | `ContractTest` + `e2e/booking-success.spec.ts` | ☐ |
| AC-7 | Unauthenticated admin → 401/403, no data | T3,T5,T8 | `ContractTest::test_admin_requires_auth` | ☐ |
| AC-8 | Concurrent same-slot → 1×201, rest 409 | T3,T4 | `ConcurrencyTest` | ☐ |
| AC-9 | Cancel paid → cancelled+refund; 2nd cancel 409 | T3,T4,T5 | `ContractTest::test_cancel_state_machine` | ☐ |
| AC-10 | Hold countdown mm:ss; TTL expiry cancels + frees | T4,T6 | `HoldExpiryTest` + unit | ☐ |
| AC-11 | Lists paginated, per_page ≤ 50 | T3,T5 | `ContractTest::test_pagination` | ☐ |
| AC-12 | Client amount ignored; price server-derived | T3,T4 | `ContractTest::test_forged_amount_ignored` | ☐ |

## Baseline (E1)

- [ ] Worktree/branch created
- [ ] Baseline test suite runs; result recorded

## Environment

- PHP 8.5 ✓ · Composer ✓ · Node 26 (pin 24 for tooling) ✓ · Docker ✓
- PostgreSQL: **not running** — must start before T1.
