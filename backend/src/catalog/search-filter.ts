/**
 * Construcción del filtro de búsqueda del catálogo.
 * SWR-SRCH-006: combinar palabra clave, categoría, municipio y rango de precio en una misma búsqueda.
 * SWR-SRCH-008 (apoyo): páginas de máximo 20 productos.
 * Bloque analizado en caja blanca (CB-03).
 */
export interface CatalogQuery {
  q?: string;
  categoryId?: string | number;
  municipality?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  page?: string | number;
}

export const PAGE_SIZE = 20;

export class InvalidFilterError extends Error {}

function toNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new InvalidFilterError('Los filtros numéricos deben ser números válidos');
  return n;
}

export function buildProductWhere(query: CatalogQuery) {
  const where: Record<string, unknown> = { active: true };
  const and: Record<string, unknown>[] = [];

  const q = query.q?.trim();
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  const categoryId = toNumber(query.categoryId);
  if (categoryId !== undefined) and.push({ categoryId });

  const municipality = query.municipality?.trim();
  if (municipality) {
    and.push({ producer: { municipality: { equals: municipality, mode: 'insensitive' } } });
  }

  const minPrice = toNumber(query.minPrice);
  const maxPrice = toNumber(query.maxPrice);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw new InvalidFilterError('El precio mínimo no puede ser mayor que el precio máximo');
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    and.push({ price: { ...(minPrice !== undefined && { gte: minPrice }), ...(maxPrice !== undefined && { lte: maxPrice }) } });
  }

  if (and.length > 0) where.AND = and;
  return where;
}

export function normalizePage(page: string | number | undefined): number {
  const n = Number(page);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}
