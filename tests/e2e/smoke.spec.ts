import { expect, test } from '@playwright/test';

test('loads the static evolution sandbox and advances the WASM world', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'Avida Digital Evolution' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Star' })).toHaveAttribute(
    'href',
    'https://github.com/baditaflorin/avida-digital-evolution',
  );
  await expect(page.getByRole('link', { name: 'PayPal' })).toHaveAttribute(
    'href',
    'https://www.paypal.com/paypalme/florinbadita',
  );

  await expect(page.locator('#stat-population')).not.toHaveText('0', { timeout: 20_000 });
  await page.getByRole('button', { name: 'Step once' }).click();
  await expect(page.locator('#stat-update')).not.toHaveText('0');
  await expect(page.locator('#world')).toBeVisible();
  await expect(page.locator('#narrator-title')).not.toHaveText('Waiting for signal');
});
