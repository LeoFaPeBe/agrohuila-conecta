/**
 * Reglas de negocio del flujo principal (pedidos e inventario).
 * Funciones puras: no dependen de la base de datos ni de HTTP, por eso se prueban con pruebas unitarias.
 */

/** Resultado de una validación con motivo legible para el usuario. */
export type RuleResult = { ok: true } | { ok: false; code: string; message: string };

/**
 * SWR-ORD-002: antes de agregar un producto al pedido, la cantidad debe ser entera,
 * mayor que cero y no mayor que la cantidad disponible.
 */
export function validateItemQuantity(requested: number, available: number): RuleResult {
  if (!Number.isInteger(requested) || requested <= 0) {
    return { ok: false, code: 'INVALID_QUANTITY', message: 'La cantidad debe ser un número entero mayor que cero' };
  }
  if (requested > available) {
    return {
      ok: false,
      code: 'EXCEEDS_AVAILABLE',
      message: `La cantidad solicitada (${requested}) supera la disponible (${available})`,
    };
  }
  return { ok: true };
}

export interface CartLine {
  productId: string;
  producerId: string;
  quantity: number;
  unitPrice: number;
}

/**
 * SWR-ORD-004: cuando el carrito tiene productos de varios productores,
 * se crea un pedido separado para cada productor. Las líneas repetidas del mismo producto se suman.
 */
export function groupCartByProducer(lines: CartLine[]): Map<string, CartLine[]> {
  const groups = new Map<string, CartLine[]>();
  for (const line of lines) {
    const group = groups.get(line.producerId) ?? [];
    const same = group.find((l) => l.productId === line.productId);
    if (same) same.quantity += line.quantity;
    else group.push({ ...line });
    groups.set(line.producerId, group);
  }
  return groups;
}

/** Total del pedido en COP = suma de cantidad x precio unitario al momento del pedido (SWR-DATA-002). */
export function calculateOrderTotal(lines: Pick<CartLine, 'quantity' | 'unitPrice'>[]): number {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
}

export interface ConfirmationInput {
  status: 'PENDING' | 'CONFIRMED';
  producerId: string;
  items: { productName: string; quantity: number; available: number }[];
}

/**
 * SWR-ORD-006 + SWR-INV-003: un productor solo puede confirmar un pedido PENDIENTE dirigido a él,
 * y solo si hay cantidad disponible suficiente para TODOS los productos del pedido.
 * Bloque analizado en caja blanca (CB-01).
 */
export function evaluateConfirmation(order: ConfirmationInput, userId: string): RuleResult {
  if (order.producerId !== userId) {
    return { ok: false, code: 'NOT_OWNER', message: 'Solo el productor del pedido puede confirmarlo' };
  }
  if (order.status !== 'PENDING') {
    return { ok: false, code: 'NOT_PENDING', message: 'Solo se pueden confirmar pedidos en estado Pendiente' };
  }
  const missing = order.items.filter((i) => i.quantity > i.available);
  if (missing.length > 0) {
    const names = missing.map((i) => `${i.productName} (pedido ${i.quantity}, disponible ${i.available})`).join(', ');
    return { ok: false, code: 'INSUFFICIENT_STOCK', message: `No hay cantidad suficiente de: ${names}` };
  }
  return { ok: true };
}
