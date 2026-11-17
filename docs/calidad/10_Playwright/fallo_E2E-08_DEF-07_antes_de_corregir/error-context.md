# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-08-carrito-solo-comprador.spec.ts >> E2E-08 el productor que entra a /carrito ve un aviso y no puede enviar pedidos
- Location: e2e/e2e-08-carrito-solo-comprador.spec.ts:5:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByRole('alert').filter({ hasText: /\S/ })
Expected: "Esta sección es solo para compradores."
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" getByRole('alert').filter({ hasText: /\S/ }) with timeout 5000ms
  - waiting for getByRole('alert').filter({ hasText: /\S/ })

```

```yaml
- alert
- complementary:
  - link "AgroHuila Conecta AgroHuila Conecta":
    - /url: /dashboard
    - img "AgroHuila Conecta"
    - text: AgroHuila Conecta
  - paragraph: Menú
  - navigation "Menú principal":
    - list:
      - listitem:
        - link "Inicio":
          - /url: /dashboard
      - listitem:
        - link "Mis productos":
          - /url: /mis-productos
      - listitem:
        - link "Pedidos recibidos":
          - /url: /pedidos
      - listitem:
        - link "Catálogo":
          - /url: /catalogo
  - paragraph: Del campo huilense a su negocio
  - paragraph: Comercio directo, sin intermediarios.
- banner:
  - text: Finca El Mirador Productor · Pitalito
  - button "Cerrar sesión"
- main:
  - heading "Carrito" [level=1]
  - paragraph: Revise los productos antes de enviar su pedido
  - paragraph: Su carrito está vacío
  - text: Explore el catálogo y agregue productos.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { loginUI } from './helpers';
  3  | 
  4  | /** E2E-08 · Regresión DEF-07 (SWR-AUTH-007): un productor no puede usar el carrito aunque escriba la URL. */
  5  | test('E2E-08 el productor que entra a /carrito ve un aviso y no puede enviar pedidos', async ({ page }) => {
  6  |   await loginUI(page, 'productor1@agrohuila.co');
  7  |   await page.goto('/carrito');
  8  | 
> 9  |   await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toHaveText('Esta sección es solo para compradores.');
     |                                                                   ^ Error: expect(locator).toHaveText(expected) failed
  10 |   await expect(page.getByRole('button', { name: 'Enviar pedido' })).toHaveCount(0);
  11 | });
  12 | 
```