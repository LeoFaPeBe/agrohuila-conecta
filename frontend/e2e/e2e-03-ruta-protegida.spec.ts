import { expect, test } from '@playwright/test';

// E2E-03 · Ruta protegida: sin sesión, /pedidos redirige al login y luego regresa a la ruta pedida.
test('E2E-03 acceder a /pedidos sin sesión redirige al login', async ({ page }) => {
  await page.goto('/pedidos');
  await expect(page).toHaveURL(/\/login\?next=%2Fpedidos/);

  await page.getByLabel(/correo electrónico/i).fill('productor1@agrohuila.co');
  await page.getByLabel(/contraseña/i).fill('Prueba123!');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/pedidos$/);
  await expect(page.getByRole('heading', { name: 'Pedidos recibidos' })).toBeVisible();
});
