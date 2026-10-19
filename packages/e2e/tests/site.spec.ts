import { expect, test } from '@playwright/test';

test('ürün listesi açılır ve dil değişince adres ile metin değişir', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Tüm ürünler' })).toBeVisible();
  await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();

  await page.getByRole('button', { name: 'Dil' }).click();
  await page.getByRole('link', { name: 'English' }).click();

  await expect(page).toHaveURL(/\/en\/products/);
  await expect(page.getByRole('heading', { name: 'All products' })).toBeVisible();
});
