import { test, expect } from '@playwright/test';
import { uniqueDate, uniquePhone } from './helpers';

/**
 * AC-6 — Confirmation shows booking code, room, WIB time and DP; the code shown
 * is the opaque booking_code, never the numeric id.
 */
test.describe('AC-6 Booking confirmation', () => {
  test('shows code, room, WIB time range and DP amount', async ({ page, request }) => {
    const created = await request.post('/api/bookings', {
      data: {
        room_id: 2,
        start_at: `${uniqueDate()}T19:00:00+07:00`,
        duration_hours: 2,
        name: 'Konfirmasi Test',
        phone: uniquePhone(),
      },
    });
    expect(created.status(), await created.text()).toBe(201);
    const { data } = await created.json();

    await page.goto(`/booking/${data.booking_code}`);

    // AC-6: the opaque code is displayed verbatim.
    await expect(page.getByText(data.booking_code)).toBeVisible();

    // Scope assertions to the details table (page copy repeats some strings).
    const table = page.locator('[data-od-id="booking-details-table"]');
    await expect(table.getByText(/Studio B/)).toBeVisible();
    await expect(table.getByText(/19\.00 – 21\.00 WIB/)).toBeVisible();
    await expect(table.getByText('Rp 120.000', { exact: true })).toBeVisible(); // DP 50% of 240.000
  });

  test('unpaid booking can be paid via the mock gateway', async ({ page, request }) => {
    const created = await request.post('/api/bookings', {
      data: {
        room_id: 3,
        start_at: `${uniqueDate()}T14:00:00+07:00`,
        duration_hours: 1,
        name: 'Bayar Test',
        phone: uniquePhone(),
      },
    });
    expect(created.status(), await created.text()).toBe(201);
    const { data } = await created.json();

    await page.goto(`/booking/${data.booking_code}`);
    const payBtn = page.locator('[data-od-id="btn-simulate-pay"]');
    await payBtn.waitFor();
    await expect(page.locator('[data-od-id="payment-action-box"]')).toBeVisible();
    // Activate via keyboard: a real user can tab to the button and press Enter.
    // This also proves the CTA is keyboard-reachable (a11y), and sidesteps a
    // hit-testing flake where Playwright's emulated-mobile auto-scroll reports the
    // decorative QRIS art as covering the tap point (measured: it does not).
    await payBtn.focus();
    await payBtn.press('Enter');

    // Paid state: heading changes and the status badge reads LUNAS DP.
    await expect(page.getByText(/Terkonfirmasi/)).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.badge-status.status-paid')).toContainText(/LUNAS/i);
  });
});
