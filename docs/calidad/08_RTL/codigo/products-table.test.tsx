import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { product } from '@/test/utils';
import { ProductsTable } from './products-table';

describe('ProductsTable', () => {
  test('RTL-09 lista vacía muestra el estado vacío', () => {
    render(<ProductsTable products={[]} onEdit={vi.fn()} />);
    expect(screen.getByText(/aún no tiene productos publicados/i)).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('RTL-10 con datos muestra una fila por producto, precio en COP y alerta de stock bajo', async () => {
    const onEdit = vi.fn();
    render(<ProductsTable products={[product(), product({ id: 'p2', name: 'Tomate chonto', quantity: 4, price: 3500 })]} onEdit={onEdit} />);
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // encabezado + 2
    expect(within(rows[2]).getByText(/stock bajo/i)).toBeVisible();
    expect(screen.getByText(/\$ 18\.000/)).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: /editar tomate chonto/i }));
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'p2' }));
  });
});
