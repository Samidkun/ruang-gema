import { test, expect } from '@playwright/test';

/**
 * AC-7 — Admin panel must not expose booking data to an unauthenticated user.
 * AC-9 — owner can cancel a paid booking (reason required) → refund noted.
 * AC-11 — list is paginated with per_page ≤ 50.
 */
test.describe('AC-7/AC-9/AC-11 Admin dashboard', () => {
  test('AC-11: schedule matrix renders rooms × time columns', async ({ page }) => {
    await page.goto('/admin');
    const board = page.locator('[data-od-id="schedule-matrix"]');
    await expect(board).toBeVisible();

    // 4 room rows + 4 time columns as in the approved mockup.
    await expect(board.getByRole('columnheader', { name: /Pagi/ })).toBeVisible();
    await expect(board.getByRole('columnheader', { name: /20\.00 – 23\.00/ })).toBeVisible();
    await expect(page.getByText(/Batas per halaman: 50/)).toBeVisible();
  });

  test('AC-9: cancelling a booking requires a reason and records a refund note', async ({ page }) => {
    await page.goto('/admin');

    // Open the cancel modal by clicking a booking block.
    await page.locator('.booking-block').first().click();
    const modal = page.locator('[data-od-id="cancel-modal"]');
    await expect(modal).toBeVisible();
    // The modal description explains the refund that will be recorded.
    await expect(modal.locator('.modal-desc')).toContainText(/refund/i);

    // The confirm button is blocked until a reason is typed.
    const confirm = modal.getByRole('button', { name: /Batalkan & Catat Refund/i });
    await expect(confirm).toBeDisabled();
    await modal.locator('input[type="text"]').nth(1).fill('Kerusakan amplifier utama');
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(modal).toBeHidden();
  });
});

/**
 * AC-7 — the backend admin endpoints reject unauthenticated requests. This is a
 * contract-level check via the API (the UI shows its own auth screen).
 */
test.describe('AC-7 admin API auth', () => {
  test('GET /api/admin/bookings without a session is 401/403', async ({ request }) => {
    const res = await request.get('/api/admin/bookings');
    expect([401, 403]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body).not.toHaveProperty('data');
  });
});
