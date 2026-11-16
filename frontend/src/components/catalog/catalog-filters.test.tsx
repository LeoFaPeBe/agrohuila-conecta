/** SWR-SRCH-006: combinación de filtros del catálogo. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CatalogFilters } from './catalog-filters';

const props = { categories: [{ id: 1, name: 'Café' }], municipalities: ['Pitalito', 'Garzón'] };

describe('CatalogFilters', () => {
  test('RTL-11 combina palabra, categoría, municipio y rango de precio', async () => {
    const onSearch = vi.fn();
    render(<CatalogFilters {...props} onSearch={onSearch} />);
    await userEvent.type(screen.getByLabelText(/buscar/i), 'café');
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), '1');
    await userEvent.selectOptions(screen.getByLabelText(/municipio/i), 'Pitalito');
    await userEvent.type(screen.getByLabelText(/precio mínimo/i), '1000');
    await userEvent.type(screen.getByLabelText(/precio máximo/i), '20000');
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
    expect(onSearch).toHaveBeenCalledWith({ q: 'café', categoryId: '1', municipality: 'Pitalito', minPrice: '1000', maxPrice: '20000' });
  });

  test('RTL-12 precio mínimo mayor que el máximo muestra error y no busca', async () => {
    const onSearch = vi.fn();
    render(<CatalogFilters {...props} onSearch={onSearch} />);
    await userEvent.type(screen.getByLabelText(/precio mínimo/i), '9000');
    await userEvent.type(screen.getByLabelText(/precio máximo/i), '1000');
    await userEvent.click(screen.getByRole('button', { name: /^buscar$/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/el precio mínimo no puede ser mayor que el máximo/i);
    expect(onSearch).not.toHaveBeenCalled();
  });
});
