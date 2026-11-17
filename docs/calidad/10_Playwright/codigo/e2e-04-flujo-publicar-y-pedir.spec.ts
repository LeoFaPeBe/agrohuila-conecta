import { expect, test } from '@playwright/test';
import { createUser, loginUI, unique } from './helpers';

/**
 * E2E-04 · FLUJO PRINCIPAL (parte 1): autenticarse -> publicar producto -> comprador busca -> envía pedido.
 * SWR-AUTH-001, SWR-PROD-001, SWR-SRCH-006, SWR-ORD-002, SWR-ORD-003.
 */
test('E2E-04 productor publica un producto y un comprador lo pide', async ({ page, request }) => {
  const producer = await createUser(request, 'PRODUCER', 'La Plata');
  const buyer = await createUser(request, 'BUYER', 'Neiva');
  const productName = `Lulo E2E ${unique()}`;

  // 1. El productor inicia sesión y publica el producto desde la interfaz
  await loginUI(page, producer.email);
  await page.getByRole('link', { name: 'Mis productos', exact: true }).click();
  await page.getByLabel('Nombre del producto').fill(productName);
  await page.getByLabel('Categoría').selectOption({ label: 'Frutas' });
  await page.getByLabel('Descripción').fill('Lulo de clima frío, cosecha de la semana');
  await page.getByLabel('Precio unitario (COP)').fill('4500');
  await page.getByLabel('Cantidad disponible').fill('30');
  await page.getByLabel('URL de la imagen').fill('/productos/producto.svg');
  await page.getByRole('button', { name: 'Publicar producto' }).click();
  await expect(page.getByText('Producto publicado correctamente')).toBeVisible();
  await expect(page.getByRole('cell', { name: productName, exact: true })).toBeVisible();
  await page.getByRole('button', { name: /cerrar sesión/i }).click();

  // 2. El comprador busca el producto y lo agrega al carrito
  await loginUI(page, buyer.email);
  await page.getByRole('link', { name: 'Catálogo', exact: true }).click();
  await page.getByLabel('Buscar').fill(productName);
  await page.getByLabel('Municipio').selectOption('La Plata');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();
  const card = page.getByRole('article', { name: productName });
  await expect(card).toBeVisible();
  await card.getByLabel(/cantidad de/i).fill('3');
  await card.getByRole('button', { name: 'Agregar al carrito' }).click();
  await expect(card.getByRole('status')).toHaveText('Agregado al carrito');

  // 3. Envía el pedido
  await page.getByRole('link', { name: /^carrito$/i }).click();
  await expect(page.getByText(`Pedido para: ${producer.fullName}`)).toBeVisible();
  await page.getByRole('button', { name: 'Enviar pedido' }).click();
  await expect(page.getByText(/se crearon 1 pedido\(s\) en estado pendiente/i)).toBeVisible();

  // 4. Lo ve en "Mis pedidos" como Pendiente
  await page.getByRole('link', { name: 'Mis pedidos', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: productName });
  await expect(row).toContainText('Pendiente');
  await expect(row).toContainText('$ 13.500');
});
