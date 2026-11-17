import { expect, test } from '@playwright/test';
import { loginUI } from './helpers';

/** E2E-08 · Regresión DEF-07 (SWR-AUTH-007): un productor no puede usar el carrito aunque escriba la URL. */
test('E2E-08 el productor que entra a /carrito ve un aviso y no puede enviar pedidos', async ({ page }) => {
  await loginUI(page, 'productor1@agrohuila.co');
  await page.goto('/carrito');

  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText('Esta sección es solo para compradores.');
  await expect(page.getByRole('button', { name: 'Enviar pedido' })).toHaveCount(0);
});
