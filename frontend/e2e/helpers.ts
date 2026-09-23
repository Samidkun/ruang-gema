import { test, expect } from '@playwright/test';

/** Unique future dates per test so bookings never collide across runs. */
let seq = 0;
export function uniqueDate(): string {
  seq += 1;
  const base = new Date('2027-01-01T00:00:00Z');
  base.setUTCDate(base.getUTCDate() + (Date.now() % 100000) % 365 + seq);
  return base.toISOString().slice(0, 10);
}

export function uniquePhone(): string {
  return '0812' + String(Date.now() % 100000000).padStart(8, '0');
}
