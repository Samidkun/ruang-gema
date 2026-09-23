import { test, expect } from '@playwright/test';

/**
 * AC-2 — Room list: skeleton first, then name/size/price per room (list-detail).
 */
test.describe('AC-2 Service list', () => {
  test('renders each room with size and "Rp …/jam" price', async ({ page }) => {
    await page.goto('/ruangan');

    // List pane appears with the 4 seeded rooms.
    const list = page.locator('[data-od-id="rooms-list-container"]');
    await expect(list).toBeVisible();

    for (const name of ['Studio A', 'Studio B', 'Studio C', 'Studio D']) {
      await expect(list.getByText(name, { exact: true })).toBeVisible();
    }

    // AC-2 price format is exactly "Rp 150.000/jam" (dot thousands separator).
    await expect(list.getByText('Rp 150.000/jam')).toBeVisible();
    await expect(list.getByText('Rp 90.000/jam')).toBeVisible();
  });

  test('selecting a room updates the detail pane', async ({ page }) => {
    await page.goto('/ruangan');
    await page.locator('[data-od-id="rooms-list-container"]').getByText('Studio D', { exact: true }).click();

    const detail = page.locator('[data-od-id="room-detail-pane"]');
    await expect(detail.getByRole('heading', { level: 2 })).toHaveText('Studio D');
    await expect(detail.getByText('Rp 250.000')).toBeVisible();
  });
});
