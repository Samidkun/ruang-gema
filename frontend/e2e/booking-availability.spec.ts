import { test, expect } from '@playwright/test';
import { uniqueDate, uniquePhone } from './helpers';

/**
 * AC-3 — selecting a date loads that day's slots, and a taken slot is rendered
 * disabled (aria-disabled) so it cannot be picked.
 */
test.describe('AC-3 availability grid', () => {
  test('taken slot is disabled and marked aria-disabled', async ({ page, request }) => {
    const date = uniqueDate();

    // Arrange: take the 15.00 WIB slot for Studio A.
    const created = await request.post('/api/bookings', {
      data: {
        room_id: 1,
        start_at: `${date}T15:00:00+07:00`,
        duration_hours: 1,
        name: 'Slot Terisi',
        phone: uniquePhone(),
      },
    });
    expect(created.status(), await created.text()).toBe(201);

    // Act: open the booking screen on that date.
    await page.goto('/booking');
    await page.getByLabel('Tanggal:').fill(date);

    // Assert: 15.00 is disabled + aria-disabled; a free hour is not.
    const taken = page.locator('[data-od-id="slot-15"]');
    await expect(taken).toBeDisabled();
    await expect(taken).toHaveAttribute('aria-disabled', 'true');

    const free = page.locator('[data-od-id="slot-16"]');
    await expect(free).toBeEnabled();
    await expect(free).toHaveAttribute('aria-disabled', 'false');
  });

  test('changing the date reloads availability for the new day', async ({ page, request }) => {
    const busyDay = uniqueDate();
    const freeDay = uniqueDate();

    await request.post('/api/bookings', {
      data: {
        room_id: 1,
        start_at: `${busyDay}T11:00:00+07:00`,
        duration_hours: 1,
        name: 'Hari Sibuk',
        phone: uniquePhone(),
      },
    });

    await page.goto('/booking');

    // Busy day: 11.00 disabled.
    await page.getByLabel('Tanggal:').fill(busyDay);
    await expect(page.locator('[data-od-id="slot-11"]')).toBeDisabled();

    // Free day: 11.00 available again.
    await page.getByLabel('Tanggal:').fill(freeDay);
    await expect(page.locator('[data-od-id="slot-11"]')).toBeEnabled();
  });
});
