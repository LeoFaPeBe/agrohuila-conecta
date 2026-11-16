/**
 * Pruebas UNITARIAS de las reglas del flujo principal (pedidos).
 * Patrón Arrange -> Act -> Assert. No usan base de datos ni navegador.
 */
import { calculateOrderTotal, groupCartByProducer, MAX_ORDER_TOTAL, validateItemQuantity, validateOrderTotal } from './order-rules';

describe('validateItemQuantity — SWR-ORD-002', () => {
  test('UNIT-01 acepta una cantidad dentro de lo disponible (caso normal)', () => {
    // Arrange
    const requested = 10;
    const available = 50;
    // Act
    const result = validateItemQuantity(requested, available);
    // Assert
    expect(result.ok).toBe(true);
  });

  test('UNIT-02 rechaza cantidad cero (caso inválido)', () => {
    const result = validateItemQuantity(0, 50);
    expect(result).toEqual(expect.objectContaining({ ok: false, code: 'INVALID_QUANTITY' }));
  });

  test('UNIT-03 frontera: igual a lo disponible se acepta y uno más se rechaza', () => {
    const available = 40;
    const atLimit = validateItemQuantity(40, available);
    const overLimit = validateItemQuantity(41, available);
    expect(atLimit.ok).toBe(true);
    expect(overLimit).toEqual(expect.objectContaining({ ok: false, code: 'EXCEEDS_AVAILABLE' }));
  });

  test('UNIT-04 rechaza cantidades decimales', () => {
    const result = validateItemQuantity(1.5, 10);
    expect(result.ok).toBe(false);
  });
});

describe('groupCartByProducer — SWR-ORD-004', () => {
  test('UNIT-05 separa el carrito en un grupo por cada productor', () => {
    // Arrange
    const lines = [
      { productId: 'cafe', producerId: 'P1', quantity: 2, unitPrice: 18000 },
      { productId: 'cacao', producerId: 'P2', quantity: 1, unitPrice: 14000 },
      { productId: 'aguacate', producerId: 'P1', quantity: 3, unitPrice: 7500 },
    ];
    // Act
    const groups = groupCartByProducer(lines);
    // Assert
    expect(groups.size).toBe(2);
    expect(groups.get('P1')).toHaveLength(2);
    expect(groups.get('P2')).toHaveLength(1);
  });

  test('UNIT-06 suma las líneas repetidas del mismo producto', () => {
    const lines = [
      { productId: 'cafe', producerId: 'P1', quantity: 2, unitPrice: 18000 },
      { productId: 'cafe', producerId: 'P1', quantity: 3, unitPrice: 18000 },
    ];
    const groups = groupCartByProducer(lines);
    expect(groups.get('P1')).toEqual([{ productId: 'cafe', producerId: 'P1', quantity: 5, unitPrice: 18000 }]);
  });
});

describe('calculateOrderTotal — SWR-ORD-003 / SWR-DATA-002', () => {
  test('UNIT-07 calcula el total como suma de cantidad x precio unitario', () => {
    const total = calculateOrderTotal([
      { quantity: 2, unitPrice: 18000 },
      { quantity: 3, unitPrice: 7500 },
    ]);
    expect(total).toBe(58500);
  });

  test('UNIT-08 un pedido sin líneas tiene total cero', () => {
    expect(calculateOrderTotal([])).toBe(0);
  });
});

describe('validateOrderTotal — regresión DEF-04', () => {
  test('UNIT-15 frontera: el total máximo se acepta y un peso más se rechaza', () => {
    expect(validateOrderTotal(MAX_ORDER_TOTAL).ok).toBe(true);
    expect(validateOrderTotal(MAX_ORDER_TOTAL + 1)).toEqual(expect.objectContaining({ ok: false, code: 'TOTAL_TOO_HIGH' }));
  });

  test('UNIT-16 30 bultos de $100.000.000 superan el máximo (caso que causaba error 500)', () => {
    const total = calculateOrderTotal([{ quantity: 30, unitPrice: 100_000_000 }]);
    expect(validateOrderTotal(total).ok).toBe(false);
  });
});
