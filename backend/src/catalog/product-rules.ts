/**
 * Reglas de validación de una publicación de producto.
 * SWR-PROD-001 (datos mínimos de la publicación) y SWR-PROD-003 (precio > 0, cantidad >= 0).
 * Bloque analizado en caja blanca (CB-02).
 */
export interface ProductInput {
  name?: string;
  description?: string;
  unit?: string;
  price?: number;
  quantity?: number;
  imageUrl?: string;
  categoryId?: number;
}

export const MAX_PRICE = 100_000_000; // COP

export function validateProductInput(input: ProductInput, partial = false): string[] {
  const errors: string[] = [];
  const required = (value: unknown) => !partial || value !== undefined;

  if (required(input.name) && (!input.name || input.name.trim().length < 3)) {
    errors.push('El nombre del producto es obligatorio (mínimo 3 caracteres)');
  }
  if (required(input.description) && (!input.description || input.description.trim().length === 0)) {
    errors.push('La descripción es obligatoria');
  }
  if (required(input.unit) && (!input.unit || input.unit.trim().length === 0)) {
    errors.push('La unidad de medida es obligatoria');
  }
  if (required(input.categoryId) && (!Number.isInteger(input.categoryId) || (input.categoryId as number) <= 0)) {
    errors.push('Debe seleccionar una categoría');
  }
  if (required(input.price)) {
    if (!Number.isInteger(input.price)) {
      errors.push('El precio debe ser un número entero en pesos (COP)');
    } else if ((input.price as number) <= 0) {
      errors.push('El precio debe ser mayor que cero');
    } else if ((input.price as number) > MAX_PRICE) {
      errors.push('El precio supera el máximo permitido');
    }
  }
  if (required(input.quantity)) {
    if (!Number.isInteger(input.quantity)) {
      errors.push('La cantidad disponible debe ser un número entero');
    } else if ((input.quantity as number) < 0) {
      errors.push('La cantidad disponible no puede ser negativa');
    }
  }
  // Se acepta una URL absoluta (http/https) o una ruta de imagen del propio sitio (/productos/cafe.svg)
  if (required(input.imageUrl) && !/^(https?:\/\/\S+|\/\S+\.(svg|png|jpe?g|webp))$/i.test(input.imageUrl ?? '')) {
    errors.push('Debe indicar la URL de una imagen del producto (http, https o /ruta)');
  }
  return errors;
}
