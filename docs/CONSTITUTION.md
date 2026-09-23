# CONSTITUTION — Ruang Gema Studio

> Immutable principles. Every later gate (P7 spec-quality, E0, E9) evaluates
> against these. Amending one is a recorded decision, not a silent edit.

**Tier:** T1 (client, ada pembayar) · **Team:** solo (1) · **Ceremony:** L

## 1. Correctness
1. **The database is the source of truth.** The UI never invents derived state.
2. **No double-booking, ever.** A slot is unique per (room, start_time). Enforced
   by a DB constraint, not only by application code.
3. **Money is integer rupiah.** Never float. Never cents-of-a-float.
4. **Time is stored UTC, rendered Asia/Jakarta.** DST is irrelevant here but the
   rule holds: one storage zone, one render zone.

## 2. Testing
5. **No production code without a failing test first.** RED → GREEN → refactor.
6. **Every test must be provably able to fail.** Revert the fix, require RED.
7. **Contract tests at the API boundary.** A field rename on one side fails a
   test; it does not ship.

## 3. Security
8. **Validate at every trust boundary.** The API never trusts the client.
9. **No plaintext secrets.** Not in code, not in git, not in logs.
10. **Auth is server-verified on every protected route.** The frontend hiding a
    button is not access control.

## 4. Architecture
11. **Contracts before implementation.** No side is built before its boundary is
    written (P2.5).
12. **Diagrams are generated from the source** (schema/contract), never hand-drawn.
13. **Surgical changes.** Every changed line traces to a criterion.

## 5. Design
14. **Tokens come from `DESIGN.md`.** No invented colors, fonts, or radii.
15. **Anti-slop is a contract.** A screen without a signature bet is a defect.
16. **Every state exists**: empty, loading, error, success — where applicable.

## 6. Process
17. **The handoff is frozen.** Mid-build changes are recorded amendments.
18. **Evidence before assertions.** No completion claim without a fresh command.
19. **YAGNI.** Features not in an acceptance criterion are not built.
