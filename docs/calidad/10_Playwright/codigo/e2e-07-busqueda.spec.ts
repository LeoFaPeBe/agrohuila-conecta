import { expect, test } from '@playwright/test';
import { loginUI } from './helpers';

/** E2E-07 · SWR-SRCH-006: búsqueda combinando categoría y municipio sobre los datos del seed. */
test('E2E-07 filtrar Frutas de Garzón muestra solo la cholupa', async ({ page }) => {
  await loginUI(page, 'comprador1@agrohuila.co');
  await page.goto('/catalogo');
  await page.getByLabel('Categoría').selectOption({ label: 'Frutas' });
  await page.getByLabel('Municipio').selectOption('Garzón');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('article', { name: 'Cholupa' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Granadilla' })).toHaveCount(0);
  for (const card of await page.getByRole('article').all()) {
    await expect(card).toContainText('Garzón');
  }
});
