import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import { Product, Order } from '@/lib/types';

/** Monta un componente dentro de los proveedores reales de sesión y carrito. */
export function renderWithProviders(ui: ReactElement) {
  return render(
    <AuthProvider>
      <CartProvider>{ui}</CartProvider>
    </AuthProvider>,
  );
}

/** Simula una respuesta del backend reemplazando fetch (no se llama a la red real). */
export function mockFetchOnce(status: number, body: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  );
}

export const product = (over: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Café especial',
  description: 'Café de altura',
  unit: 'kg',
  price: 18000,
  quantity: 10,
  imageUrl: '/productos/cafe.svg',
  active: true,
  category: { id: 1, name: 'Café' },
  producer: { id: 'u1', fullName: 'Finca El Mirador', municipality: 'Pitalito' },
  ...over,
});

export const order = (over: Partial<Order> = {}): Order => ({
  id: 'o1',
  number: 7,
  status: 'PENDING',
  total: 36000,
  createdAt: '2026-11-16T15:00:00.000Z',
  confirmedAt: null,
  items: [{ id: 'i1', quantity: 2, unitPrice: 18000, product: { id: 'p1', name: 'Café especial', unit: 'kg', quantity: 10 } }],
  buyer: { id: 'b1', fullName: 'Restaurante Sabor Opita', municipality: 'Neiva' },
  producer: { id: 'u1', fullName: 'Finca El Mirador', municipality: 'Pitalito' },
  ...over,
});
