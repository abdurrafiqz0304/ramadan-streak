import { test, expect } from '@playwright/test';

test('homepage has title and basic elements', async ({ page }) => {
    await page.goto('/');

    // Expect a title
    await expect(page).toHaveTitle(/Ramadan/i);

    // Expect the page to have the brand name
    await expect(page.locator('.brand-name')).toHaveText('Ramadan');

    // Verify the Streak Section is present
    await expect(page.locator('.hero-label')).toHaveText('Streak Puasa ✨');

    // Verify there's at least one date picker button
    const days = page.locator('button:has-text("Hari")').first();
    await expect(days).toBeVisible();
});

test('checking fast updates the UI', async ({ page }) => {
    await page.goto('/');

    // Assuming it starts as unchecked if isolated storage
    const puasaButton = page.locator('button:has-text("✓ Puasa")');
    if (await puasaButton.isVisible()) {
        await puasaButton.click();
        await expect(page.locator('strong:has-text("Berpuasa ✓")')).toBeVisible();
    }
});
