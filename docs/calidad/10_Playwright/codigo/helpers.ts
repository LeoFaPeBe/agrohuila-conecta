import { APIRequestContext, expect, Page } from '@playwright/test';

export const API = process.env.E2E_API_URL ?? 'http://localhost:4000';
export const PASSWORD = 'Prueba123!';

/** Sufijo único por ejecución: cada prueba crea sus propios datos y no depende de otra ejecución. */
export const unique = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

export async function createUser(request: APIRequestContext, role: 'PRODUCER' | 'BUYER', municipality = 'Pitalito') {
  const id = unique();
  const email = `${role === 'PRODUCER' ? 'prod' : 'comp'}.${id}@e2e.co`;
  const fullName = role === 'PRODUCER' ? `Finca E2E ${id}` : `Tienda E2E ${id}`;
  const res = await request.post(`${API}/auth/register`, { data: { email, password: PASSWORD, fullName, role, municipality } });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return { email, fullName, token: body.accessToken as string, id: body.user.id as string };
}

export async function createProduct(request: APIRequestContext, token: string, data: Partial<Record<string, unknown>> = {}) {
  const res = await request.post(`${API}/products`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { name: `Producto E2E ${unique()}`, description: 'Creado por prueba E2E', unit: 'kg', price: 5000, quantity: 10, imageUrl: '/productos/producto.svg', categoryId: 1, ...data },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function createOrder(request: APIRequestContext, token: string, productId: string, quantity: number) {
  const res = await request.post(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` }, data: { items: [{ productId, quantity }] } });
  expect(res.ok()).toBeTruthy();
  return (await res.json())[0];
}

export async function loginUI(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login');
  await page.getByLabel(/correo electrónico/i).fill(email);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}
