/** SWR-ORD-004 y SWR-ORD-006 desde la interfaz. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { order, product } from '@/test/utils';
import { CartView } from './cart-view';
import { OrdersTable } from './orders-table';

describe('OrdersTable', () => {
  test('RTL-16 el productor solo puede confirmar pedidos pendientes', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<OrdersTable mode="producer" orders={[order(), order({ id: 'o2', number: 8, status: 'CONFIRMED' })]} onConfirm={onConfirm} />);
    expect(screen.queryByRole('button', { name: /confirmar pedido #8/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /confirmar pedido #7/i }));
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: 'o1' }));
    expect(screen.getByText('Confirmado')).toBeVisible();
  });

  test('RTL-17 sin pedidos muestra el estado vacío del comprador', () => {
    render(<OrdersTable mode="buyer" orders={[]} />);
    expect(screen.getByText(/aún no ha realizado pedidos/i)).toBeVisible();
  });
});

describe('CartView', () => {
  test('RTL-18 avisa que se creará un pedido por cada productor (SWR-ORD-004)', async () => {
    const onSubmit = vi.fn();
    const lines = [
      { product: product(), quantity: 2 },
      { product: product({ id: 'p9', name: 'Cacao', price: 14000, producer: { id: 'u2', fullName: 'Asociación Cacaotera', municipality: 'Garzón' } }), quantity: 1 },
    ];
    render(<CartView lines={lines} onRemove={vi.fn()} onSubmit={onSubmit} submitting={false} />);
    expect(screen.getByText(/pedido para: finca el mirador/i)).toBeVisible();
    expect(screen.getByText(/pedido para: asociación cacaotera/i)).toBeVisible();
    expect(screen.getByText(/se crearán/i)).toHaveTextContent('Se crearán 2 pedido(s). Total: $ 50.000');
    await userEvent.click(screen.getByRole('button', { name: /enviar pedido/i }));
    expect(onSubmit).toHaveBeenCalled();
  });
});
