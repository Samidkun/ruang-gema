import { test, expect } from '@playwright/test';
import { uniqueDate, uniquePhone } from './helpers';

/**
 * AC-4 — 409 SLOT_TAKEN shows an inline error naming the hour and PRESERVES the
 * user's typed input.
 *
 * The race is modelled realistically: the page loads while the slot is still
 * free (so the user can select it), then ANOTHER band takes it via the API
 * before the user submits. That is exactly the AC-4 scenario.
 */
test.describe('AC-4 booking conflict', () => {
  test('duplicate slot → inline error names the hour and keeps name + phone', async ({ page, request }) => {
    const date = uniqueDate();

    // 1. Load the page first, so the grid shows 19.00 as free.
    await page.goto('/booking');
    await page.getByLabel('Tanggal:').fill(date);
    await expect(page.locator('[data-od-id="slot-19"]')).toBeEnabled();

    // 2. Another band takes the slot (race).
    const first = await request.post('/api/bookings', {
      data: {
        room_id: 1,
        start_at: `${date}T19:00:00+07:00`,
        duration_hours: 1,
        name: 'Band Pertama',
        phone: uniquePhone(),
      },
    });
    expect(first.status(), await first.text()).toBe(201);

    // 3. The user (still seeing a free slot) submits.
    await page.locator('[data-od-id="slot-19"]').click();
    await page.locator('[data-od-id="input-name"]').fill('Band Kedua');
    await page.locator('[data-od-id="input-phone"]').fill('081200000002');
    await page.getByRole('button', { name: /Tahan slot/i }).click();

    // 4. Conflict alert appears, names the hour, and the input is preserved.
    const alert = page.locator('[data-od-id="alert-slot-taken"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('19');
    await expect(alert).toContainText('diambil');

    await expect(page.locator('[data-od-id="input-name"]')).toHaveValue('Band Kedua');
    await expect(page.locator('[data-od-id="input-phone"]')).toHaveValue('081200000002');
  });
});

/**
 * AC-12 — client sends no price; the server owns the amount.
 */
test.describe('AC-12 price is server-derived', () => {
  test('booking request contains no price/amount fields', async ({ page }) => {
    let sentBody = '';
    await page.route('**/api/bookings', async (route) => {
      if (route.request().method() === 'POST') sentBody = route.request().postData() ?? '';
      await route.continue();
    });

    await page.goto('/booking');
    await page.getByLabel('Tanggal:').fill(uniqueDate());
    await page.locator('[data-od-id="input-name"]').fill('Cek Harga');
    await page.locator('[data-od-id="input-phone"]').fill(uniquePhone());
    await page.getByRole('button', { name: /Tahan slot/i }).click();
    await page.waitForTimeout(1500);

    expect(sentBody).not.toMatch(/price|amount|total_idr|dp_idr/i);
    expect(sentBody).toContain('room_id');
  });
});
