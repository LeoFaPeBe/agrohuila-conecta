import { expect, test } from '@playwright/test';
import { createOrder, createProduct, createUser, loginUI } from './helpers';

/** E2E-06 · SWR-INV-003: no se confirma un pedido si ya no hay inventario suficiente. */
test('E2E-06 el segundo pedido no se puede confirmar si el inventario no alcanza', async ({ page, request }) => {
  const producer = await createUser(request, 'PRODUCER');
  const buyer = await createUser(request, 'BUYER');
  const product = await createProduct(request, producer.token, { quantity: 5 });
  const first = await createOrder(request, buyer.token, product.id, 4);
  const second = await createOrder(request, buyer.token, product.id, 4);

  await loginUI(page, producer.email);
  await page.goto('/pedidos');
  await page.getByRole('button', { name: `Confirmar pedido #${first.number}` }).click();
  await expect(page.getByText(`Pedido #${first.number} confirmado`)).toBeVisible();

  await page.getByRole('button', { name: `Confirmar pedido #${second.number}` }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'No hay cantidad suficiente' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: `#${second.number}` })).toContainText('Pendiente');
});
