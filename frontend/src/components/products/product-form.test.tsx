/** Pruebas RTL del formulario de publicación de productos. SWR-PROD-001 y SWR-PROD-003. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ProductForm } from './product-form';

const categories = [
  { id: 1, name: 'Café' },
  { id: 2, name: 'Frutas' },
];

async function fillValid() {
  await userEvent.type(screen.getByLabelText(/nombre del producto/i), 'Café especial');
  await userEvent.selectOptions(screen.getByLabelText(/categoría/i), '1');
  await userEvent.type(screen.getByLabelText(/descripción/i), 'Café de altura, proceso lavado');
  await userEvent.type(screen.getByLabelText(/precio unitario/i), '18000');
  await userEvent.type(screen.getByLabelText(/cantidad disponible/i), '120');
  await userEvent.type(screen.getByLabelText(/url de la imagen/i), '/productos/cafe.svg');
}

describe('ProductForm', () => {
  test('RTL-05 muestra error si el nombre está vacío', async () => {
    const onSubmit = vi.fn();
    render(<ProductForm categories={categories} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /publicar producto/i }));
    expect(screen.getByText(/el nombre es obligatorio/i)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('RTL-06 frontera: precio 0 se rechaza (SWR-PROD-003)', async () => {
    const onSubmit = vi.fn();
    render(<ProductForm categories={categories} onSubmit={onSubmit} />);
    await fillValid();
    await userEvent.clear(screen.getByLabelText(/precio unitario/i));
    await userEvent.type(screen.getByLabelText(/precio unitario/i), '0');
    await userEvent.click(screen.getByRole('button', { name: /publicar producto/i }));
    expect(screen.getByText(/el precio debe ser un entero mayor que cero/i)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('RTL-21 regresión DEF-03: cantidad mayor a 1.000.000 se rechaza en el formulario', async () => {
    const onSubmit = vi.fn();
    render(<ProductForm categories={categories} onSubmit={onSubmit} />);
    await fillValid();
    await userEvent.clear(screen.getByLabelText(/cantidad disponible/i));
    await userEvent.type(screen.getByLabelText(/cantidad disponible/i), '3000000000');
    await userEvent.click(screen.getByRole('button', { name: /publicar producto/i }));
    expect(screen.getByText(/la cantidad no puede superar 1\.000\.000/i)).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('RTL-07 datos válidos envían el producto con números y muestran mensaje de éxito', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProductForm categories={categories} onSubmit={onSubmit} />);
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: /publicar producto/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Café especial',
      description: 'Café de altura, proceso lavado',
      unit: 'kg',
      price: 18000,
      quantity: 120,
      imageUrl: '/productos/cafe.svg',
      categoryId: 1,
    });
    expect(await screen.findByText(/producto publicado correctamente/i)).toBeVisible();
  });

  test('RTL-08 si el servidor rechaza, muestra el mensaje del servidor', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('La categoría seleccionada no existe'));
    render(<ProductForm categories={categories} onSubmit={onSubmit} />);
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: /publicar producto/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('La categoría seleccionada no existe');
  });
});
