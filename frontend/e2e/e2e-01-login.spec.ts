import { expect, test } from '@playwright/test';

// E2E-01 · SWR-AUTH-001: inicio de sesión correcto con un usuario del seed.
test('E2E-01 el comprador inicia sesión y ve su dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/correo electrónico/i).fill('comprador1@agrohuila.co');
  await page.getByLabel(/contraseña/i).fill('Prueba123!');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: /hola, restaurante sabor opita/i })).toBeVisible();
  await expect(page.getByText('Pedidos pendientes')).toBeVisible();
});
