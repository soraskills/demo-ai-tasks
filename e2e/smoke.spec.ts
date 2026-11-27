import { test, expect } from '@playwright/test';

// Test technique (sans ID de spec) : l'appli se charge.
test('l’application se charge', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Créneau' })).toBeVisible();
});
