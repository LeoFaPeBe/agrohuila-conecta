/**
 * CAJA BLANCA — CB-03: buildProductWhere (SWR-SRCH-006).
 * Decisiones: ¿hay q? ¿hay categoría? ¿hay municipio? ¿min > max? ¿hay min y/o max? ¿hay filtros (AND)?
 */
import { buildProductWhere, InvalidFilterError, normalizePage } from './search-filter';

describe('CB-03 buildProductWhere', () => {
  test('sin filtros: solo publicaciones activas y sin AND', () => {
    expect(buildProductWhere({})).toEqual({ active: true });
  });

  test('cadenas vacías o con espacios se ignoran', () => {
    expect(buildProductWhere({ q: '   ', municipality: '', categoryId: '' })).toEqual({ active: true });
  });

  test('combina palabra clave, categoría, municipio y rango de precio (SWR-SRCH-006)', () => {
    const where = buildProductWhere({ q: 'café', categoryId: '1', municipality: 'Pitalito', minPrice: '1000', maxPrice: '20000' });
    expect(where.AND).toHaveLength(4);
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { categoryId: 1 },
        { price: { gte: 1000, lte: 20000 } },
        { producer: { municipality: { equals: 'Pitalito', mode: 'insensitive' } } },
      ]),
    );
  });

  test('solo precio mínimo genera gte sin lte', () => {
    expect(buildProductWhere({ minPrice: 5000 }).AND).toEqual([{ price: { gte: 5000 } }]);
  });

  test('solo precio máximo genera lte sin gte', () => {
    expect(buildProductWhere({ maxPrice: 5000 }).AND).toEqual([{ price: { lte: 5000 } }]);
  });

  test('frontera: mínimo igual al máximo es válido', () => {
    expect(buildProductWhere({ minPrice: 7000, maxPrice: 7000 }).AND).toEqual([{ price: { gte: 7000, lte: 7000 } }]);
  });

  test('precio mínimo mayor que el máximo lanza error', () => {
    expect(() => buildProductWhere({ minPrice: 9000, maxPrice: 1000 })).toThrow(InvalidFilterError);
  });

  test('filtro numérico no válido lanza error', () => {
    expect(() => buildProductWhere({ categoryId: 'abc' })).toThrow('Los filtros numéricos deben ser números válidos');
  });

  test('normalizePage: valores inválidos vuelven a la página 1', () => {
    expect(normalizePage('3')).toBe(3);
    expect(normalizePage('0')).toBe(1);
    expect(normalizePage('x')).toBe(1);
    expect(normalizePage(undefined)).toBe(1);
  });
});
