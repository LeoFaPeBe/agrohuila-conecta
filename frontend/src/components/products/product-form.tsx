'use client';

import { FormEvent, useState } from 'react';
import { Category, Product } from '@/lib/types';
import { ProductFormValues, validateProductForm } from '@/lib/validation';
import { Button } from '../ui/button';
import { SelectField, TextArea, TextField } from '../ui/field';
import { Alert } from '../ui/feedback';

export interface ProductPayload {
  name: string;
  description: string;
  unit: string;
  price: number;
  quantity: number;
  imageUrl: string;
  categoryId: number;
}

/** SWR-PROD-001 + SWR-PROD-003: crear o editar una publicación. */
export function ProductForm({
  categories,
  initial,
  onSubmit,
  onCancel,
}: {
  categories: Category[];
  initial?: Product;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<ProductFormValues>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    unit: initial?.unit ?? 'kg',
    price: initial ? String(initial.price) : '',
    quantity: initial ? String(initial.quantity) : '',
    imageUrl: initial?.imageUrl ?? '',
    categoryId: initial ? String(initial.category.id) : '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k: keyof ProductFormValues) => (e: { target: { value: string } }) => setValues({ ...values, [k]: e.target.value });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    const v = validateProductForm(values);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        unit: values.unit.trim(),
        price: Number(values.price),
        quantity: Number(values.quantity),
        imageUrl: values.imageUrl.trim(),
        categoryId: Number(values.categoryId),
      });
      setSuccess(initial ? 'Publicación actualizada correctamente' : 'Producto publicado correctamente');
      if (!initial) setValues({ name: '', description: '', unit: 'kg', price: '', quantity: '', imageUrl: '', categoryId: '' });
    } catch (err) {
      setServerError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Nombre del producto" value={values.name} onChange={set('name')} error={errors.name} />
        <SelectField label="Categoría" value={values.categoryId} onChange={set('categoryId')} error={errors.categoryId}>
          <option value="">Seleccione…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>
      </div>
      <TextArea label="Descripción" value={values.description} onChange={set('description')} error={errors.description} />
      <div className="grid gap-4 md:grid-cols-3">
        <TextField label="Precio unitario (COP)" inputMode="numeric" value={values.price} onChange={set('price')} error={errors.price} />
        <TextField label="Cantidad disponible" inputMode="numeric" value={values.quantity} onChange={set('quantity')} error={errors.quantity} />
        <SelectField label="Unidad de medida" value={values.unit} onChange={set('unit')} error={errors.unit}>
          {['kg', 'arroba', 'bulto', 'unidad', 'canastilla'].map((u) => (
            <option key={u}>{u}</option>
          ))}
        </SelectField>
      </div>
      <TextField label="URL de la imagen" placeholder="https://…" value={values.imageUrl} onChange={set('imageUrl')} error={errors.imageUrl} />
      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {initial ? 'Guardar cambios' : 'Publicar producto'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
