import { expect, test } from '@playwright/test';

test('admin girer ve ürün ekler', async ({ page }) => {
  const sku = `E2E-${Date.now()}`;
  const name = `E2E Kahve ${sku}`;

  await page.goto('/login');
  // SSR sayfası hydrate olmadan doldurulursa React alanı sıfırlar; değer kalıcı olana dek tekrar dene.
  const email = page.getByLabel('E-posta');
  const password = page.getByRole('textbox', { name: 'Şifre' });
  await expect(async () => {
    await email.fill('admin@ako.local');
    await password.fill('Admin123!');
    await expect(email).toHaveValue('admin@ako.local', { timeout: 500 });
  }).toPass();
  await page.getByRole('button', { name: 'Giriş yap' }).click();

  await expect(page).not.toHaveURL(/\/login/);
  await page.goto('/products');
  await page.getByRole('button', { name: 'Yeni ürün' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'SKU' }).fill(sku);
  await dialog.getByRole('textbox', { name: 'Ad', exact: true }).fill(name);
  await dialog.getByRole('spinbutton', { name: 'Fiyat' }).fill('199');
  await dialog.getByRole('spinbutton', { name: 'Stok' }).fill('5');
  await dialog.getByRole('button', { name: 'Kaydet' }).click();

  await page.getByRole('textbox', { name: 'Ürünlerde ara' }).fill(sku);
  await page.keyboard.press('Enter');
  try {
    await expect(page.getByText(name)).toBeVisible();
  } finally {
    // Test verisi geride kalmasın (geliştirme veritabanında "E2E Kahve" ürünleri birikiyordu). Oturum çerezi
    // sayfayla aynı olduğundan BFF üzerinden silinir.
    const found = await page.request.get(`/api/products?search=${encodeURIComponent(sku)}`);
    const items = ((await found.json()) as { items?: { id: string; sku: string }[] }).items ?? [];
    for (const product of items.filter((p) => p.sku === sku)) {
      await page.request.delete(`/api/admin/products/${product.id}`);
    }
  }
});
