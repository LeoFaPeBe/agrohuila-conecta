/**
 * Validaciones del lado del cliente (retroalimentación inmediata al usuario).
 * El backend vuelve a validar todo: estas reglas NO reemplazan la validación del servidor.
 */
export interface ProductFormValues {
  name: string;
  description: string;
  unit: string;
  price: string;
  quantity: string;
  imageUrl: string;
  categoryId: string;
}

export function validateProductForm(v: ProductFormValues): Partial<Record<keyof ProductFormValues, string>> {
  const errors: Partial<Record<keyof ProductFormValues, string>> = {};
  if (v.name.trim().length < 3) errors.name = 'El nombre es obligatorio (mínimo 3 caracteres)';
  else if (v.name.trim().length > 120) errors.name = 'El nombre no puede superar 120 caracteres';
  if (!v.description.trim()) errors.description = 'La descripción es obligatoria';
  if (!v.unit.trim()) errors.unit = 'La unidad de medida es obligatoria';
  if (!v.categoryId) errors.categoryId = 'Seleccione una categoría';
  const price = Number(v.price);
  if (v.price.trim() === '' || !Number.isInteger(price) || price <= 0) errors.price = 'El precio debe ser un entero mayor que cero';
  const qty = Number(v.quantity);
  if (v.quantity.trim() === '' || !Number.isInteger(qty) || qty < 0) errors.quantity = 'La cantidad debe ser un entero mayor o igual a cero';
  else if (qty > 1_000_000) errors.quantity = 'La cantidad no puede superar 1.000.000';
  if (!/^(https?:\/\/\S+|\/\S+\.(svg|png|jpe?g|webp))$/i.test(v.imageUrl.trim())) errors.imageUrl = 'Ingrese la URL de una imagen (http, https o /ruta)';
  return errors;
}

export function validateLogin(email: string, password: string): { email?: string; password?: string } {
  const errors: { email?: string; password?: string } = {};
  if (!email.trim()) errors.email = 'El correo es obligatorio';
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Ingrese un correo válido';
  if (!password) errors.password = 'La contraseña es obligatoria';
  return errors;
}
