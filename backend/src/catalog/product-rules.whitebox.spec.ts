/**
 * CAJA BLANCA — CB-02: validateProductInput (SWR-PROD-001 + SWR-PROD-003).
 * Ramas del precio: no entero | <= 0 | > MAX_PRICE | válido.
 * Ramas de la cantidad: no entera | < 0 | válida.
 * Modo parcial (edición): los campos ausentes no se validan.
 */
import { MAX_PRICE, ProductInput, validateProductInput } from './product-rules';

const valid = (): ProductInput => ({
  name: 'Café especial',
  description: 'Café de altura',
  unit: 'kg',
  price: 18000,
  quantity: 10,
  imageUrl: 'https://picsum.photos/seed/cafe/400/300',
  categoryId: 1,
});

describe('CB-02 validateProductInput', () => {
  test('publicación completa y válida no tiene errores', () => {
    expect(validateProductInput(valid())).toEqual([]);
  });

  test.each([
    [0, 'El precio debe ser mayor que cero'],
    [-1, 'El precio debe ser mayor que cero'],
    [1500.5, 'El precio debe ser un número entero en pesos (COP)'],
    [MAX_PRICE + 1, 'El precio supera el máximo permitido'],
  ])('rama de precio inválido: %p', (price, expected) => {
    expect(validateProductInput({ ...valid(), price })).toContain(expected);
  });

  test('frontera del precio: 1 y MAX_PRICE son válidos', () => {
    expect(validateProductInput({ ...valid(), price: 1 })).toEqual([]);
    expect(validateProductInput({ ...valid(), price: MAX_PRICE })).toEqual([]);
  });

  test('frontera de la cantidad: 0 es válido y -1 no', () => {
    expect(validateProductInput({ ...valid(), quantity: 0 })).toEqual([]);
    expect(validateProductInput({ ...valid(), quantity: -1 })).toContain('La cantidad disponible no puede ser negativa');
  });

  test('cantidad decimal se rechaza', () => {
    expect(validateProductInput({ ...valid(), quantity: 2.5 })).toContain('La cantidad disponible debe ser un número entero');
  });

  test('campos obligatorios vacíos producen un error por cada campo', () => {
    const errors = validateProductInput({});
    expect(errors).toHaveLength(7);
  });

  test('modo parcial: solo valida los campos enviados', () => {
    expect(validateProductInput({ price: 20000 }, true)).toEqual([]);
    expect(validateProductInput({ price: 0 }, true)).toEqual(['El precio debe ser mayor que cero']);
  });

  test('URL de imagen: http(s) o ruta propia válidas; texto suelto se rechaza', () => {
    expect(validateProductInput({ ...valid(), imageUrl: '/productos/cafe.svg' })).toEqual([]);
    expect(validateProductInput({ ...valid(), imageUrl: 'foto.jpg' })).toContain(
      'Debe indicar la URL de una imagen del producto (http, https o /ruta)',
    );
  });
});
