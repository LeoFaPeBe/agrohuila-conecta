/**
 * CAJA BLANCA — CB-01: evaluateConfirmation (SWR-ORD-006 + SWR-INV-003).
 * Decisiones del código:
 *   D1: order.producerId !== userId   -> NOT_OWNER
 *   D2: order.status !== 'PENDING'    -> NOT_PENDING
 *   D3: existe algún item con quantity > available -> INSUFFICIENT_STOCK
 *   Camino restante -> ok
 * Cada prueba fuerza un camino distinto.
 */
import { ConfirmationInput, evaluateConfirmation } from './order-rules';

const base = (): ConfirmationInput => ({
  status: 'PENDING',
  producerId: 'P1',
  items: [
    { productName: 'Café', quantity: 10, available: 50 },
    { productName: 'Aguacate', quantity: 5, available: 5 },
  ],
});

describe('CB-01 evaluateConfirmation', () => {
  test('Camino 1 (D1 verdadera): otro productor no puede confirmar', () => {
    const r = evaluateConfirmation(base(), 'P2');
    expect(r).toEqual(expect.objectContaining({ ok: false, code: 'NOT_OWNER' }));
  });

  test('Camino 2 (D2 verdadera): un pedido ya confirmado no se vuelve a confirmar', () => {
    const order = { ...base(), status: 'CONFIRMED' as const };
    const r = evaluateConfirmation(order, 'P1');
    expect(r).toEqual(expect.objectContaining({ ok: false, code: 'NOT_PENDING' }));
  });

  test('Camino 3 (D3 verdadera): inventario insuficiente en un producto', () => {
    const order = base();
    order.items[0].available = 9; // pide 10, hay 9 -> frontera inferior
    const r = evaluateConfirmation(order, 'P1');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe('INSUFFICIENT_STOCK');
      expect(r.message).toContain('Café');
    }
  });

  test('Camino 4 (todas falsas): confirma; frontera cantidad == disponible es válida', () => {
    const r = evaluateConfirmation(base(), 'P1'); // Aguacate pide 5 y hay 5
    expect(r).toEqual({ ok: true });
  });

  test('Orden de evaluación: si no es dueño, NO revela el estado del pedido', () => {
    const order = { ...base(), status: 'CONFIRMED' as const };
    const r = evaluateConfirmation(order, 'P2');
    expect(r).toEqual(expect.objectContaining({ code: 'NOT_OWNER' }));
  });
});
