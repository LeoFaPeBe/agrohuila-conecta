import { expect, test } from '@playwright/test';

// E2E-02 · SWR-AUTH-002: credencial incorrecta muestra un mensaje que no revela qué dato falló.
test('E2E-02 contraseña incorrecta muestra mensaje genérico y no ingresa', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/correo electrónico/i).fill('comprador1@agrohuila.co');
  await page.getByLabel(/contraseña/i).fill('ClaveIncorrecta9');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText('Correo o contraseña incorrectos');
  await expect(page).toHaveURL(/\/login/);
});
