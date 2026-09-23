/**
 * Test fixtures. Dates/phones must be unique ACROSS RUNS too: the backend DB
 * persists between runs, so a fixed (date, room, hour) would collide on the
 * second run and turn a real test into a spurious 409.
 *
 * The old seed used `Date.now() % 100000`, which repeats every 100 seconds and
 * restarts `seq` at 1 each run — so two runs inside the same 100s window picked
 * identical dates. A seconds-resolution seed does not repeat across runs.
 */
let seq = 0;
const RUN_SEED = Math.floor(Date.now() / 1000);

export function uniqueDate(): string {
  seq += 1;
  const dayIndex = (RUN_SEED + seq * 13) % 10_950; // spread over ~30 years of days
  const base = new Date(Date.UTC(2030, 0, 1));
  base.setUTCDate(base.getUTCDate() + dayIndex);
  return base.toISOString().slice(0, 10);
}

export function uniquePhone(): string {
  const n = (Date.now() + seq) % 100_000_000;
  return '0812' + String(n).padStart(8, '0');
}
