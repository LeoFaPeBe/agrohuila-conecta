import { expect, test } from '@playwright/test';
import { createOrder, createProduct, createUser, loginUI } from './helpers';

/**
 * E2E-05 · FLUJO PRINCIPAL (parte 2): el productor confirma el pedido y el inventario se descuenta.
 * SWR-ORD-006, SWR-INV-002.
 */
test('E2E-05 productor confirma un pedido y la cantidad disponible baja', async ({ page, request }) => {
  const producer = await createUser(request, 'PRODUCER');
  const buyer = await createUser(request, 'BUYER');
  const product = await createProduct(request, producer.token, { quantity: 20 });
  const order = await createOrder(request, buyer.token, product.id, 6);

  await loginUI(page, producer.email);
  await page.getByRole('link', { name: 'Pedidos recibidos', exact: true }).click();
  await page.getByRole('button', { name: `Confirmar pedido #${order.number}` }).click();

  await expect(page.getByText(`Pedido #${order.number} confirmado. El inventario fue actualizado.`)).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: `#${order.number}` })).toContainText('Confirmado');

  await page.getByRole('link', { name: 'Mis productos', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: product.name })).toContainText('14 kg');
});
