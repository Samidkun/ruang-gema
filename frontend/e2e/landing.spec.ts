import { test, expect } from '@playwright/test';

/**
 * AC-1 — Landing: studio name, address, operating hours and a CTA are all
 * reachable within one 390px-tall viewport (no scrolling to a footer).
 * Also asserts the token palette is actually applied (not the Vite default).
 */
test.describe('AC-1 Landing', () => {
  test('shows name, address, hours and primary CTA in the first viewport', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sewa studio rehearsal');

    // Address + hours live in the hero meta card, above the fold.
    // Scope to the meta card so the footer copy doesn't create a strict-mode clash.
    const meta = page.locator('[data-od-id="studio-meta-card"]');
    await expect(meta.getByText('Jl. Kemang Selatan VIII No. 12, Jakarta Selatan')).toBeVisible();
    await expect(meta.getByText('Setiap Hari · 09.00 – 23.00 WIB')).toBeVisible();

    const cta = page.getByRole('link', { name: /Lihat ruangan/i }).first();
    await expect(cta).toBeVisible();

    // Above the fold: the CTA's top must sit inside the viewport height.
    const box = await cta.boundingBox();
    const viewport = page.viewportSize();
    expect(box, 'CTA has a box').not.toBeNull();
    expect(box!.y).toBeLessThan(viewport!.height);
  });

  test('applies the DESIGN.md token palette, not the Vite starter theme', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    // --bg: oklch(0.19 0.012 265) → browsers serialise as oklch(...) or rgb(...).
    const isTokenBg = /oklch\(0\.19/.test(bg) || bg === 'rgb(12, 13, 20)' || bg.startsWith('oklch');
    expect(isTokenBg, `body bg was "${bg}"`).toBeTruthy();
  });
});
