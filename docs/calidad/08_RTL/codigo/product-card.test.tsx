/** SWR-ORD-002 (cliente): no se puede agregar más cantidad de la disponible. */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { useCart } from '@/lib/cart-context';
import { product, renderWithProviders } from '@/test/utils';
import { ProductCard } from './product-card';

function CardWithCart() {
  const { add } = useCart();
  return <ProductCard product={product({ quantity: 10 })} onAdd={add} canBuy />;
}

describe('ProductCard', () => {
  test('RTL-13 cantidad mayor a la disponible muestra error y no agrega al carrito', async () => {
    renderWithProviders(<CardWithCart />);
    const qty = screen.getByLabelText(/cantidad de café especial/i);
    await userEvent.clear(qty);
    await userEvent.type(qty, '11');
    await userEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Solo hay 10 disponibles');
    expect(JSON.parse(localStorage.getItem('agrohuila.cart') ?? '[]')).toHaveLength(0);
  });

  test('RTL-14 frontera: exactamente la cantidad disponible se agrega correctamente', async () => {
    renderWithProviders(<CardWithCart />);
    const qty = screen.getByLabelText(/cantidad de café especial/i);
    await userEvent.clear(qty);
    await userEvent.type(qty, '10');
    await userEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/agregado al carrito/i);
  });

  test('RTL-15 el productor no ve el botón de compra', () => {
    renderWithProviders(<ProductCard product={product()} onAdd={() => null} canBuy={false} />);
    expect(screen.queryByRole('button', { name: /agregar al carrito/i })).not.toBeInTheDocument();
  });
});
