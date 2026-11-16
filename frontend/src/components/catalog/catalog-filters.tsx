'use client';

import { FormEvent, useState } from 'react';
import { Category } from '@/lib/types';
import { Button } from '../ui/button';
import { SelectField, TextField } from '../ui/field';

export interface CatalogFilterValues {
  q: string;
  categoryId: string;
  municipality: string;
  minPrice: string;
  maxPrice: string;
}

export const EMPTY_FILTERS: CatalogFilterValues = { q: '', categoryId: '', municipality: '', minPrice: '', maxPrice: '' };

/** SWR-SRCH-006: combinar palabra clave, categoría, municipio y rango de precio. */
export function CatalogFilters({
  categories,
  municipalities,
  onSearch,
}: {
  categories: Category[];
  municipalities: string[];
  onSearch: (f: CatalogFilterValues) => void;
}) {
  const [f, setF] = useState<CatalogFilterValues>(EMPTY_FILTERS);
  const [error, setError] = useState('');
  const set = (k: keyof CatalogFilterValues) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (f.minPrice && f.maxPrice && Number(f.minPrice) > Number(f.maxPrice)) {
      setError('El precio mínimo no puede ser mayor que el máximo');
      return;
    }
    setError('');
    onSearch(f);
  }

  return (
    <form onSubmit={submit} role="search" className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <div className="xl:col-span-2">
        <TextField label="Buscar" placeholder="Ej: café, aguacate…" value={f.q} onChange={set('q')} />
      </div>
      <SelectField label="Categoría" value={f.categoryId} onChange={set('categoryId')}>
        <option value="">Todas</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </SelectField>
      <SelectField label="Municipio" value={f.municipality} onChange={set('municipality')}>
        <option value="">Todos</option>
        {municipalities.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </SelectField>
      <TextField label="Precio mínimo" inputMode="numeric" value={f.minPrice} onChange={set('minPrice')} error={error || undefined} />
      <TextField label="Precio máximo" inputMode="numeric" value={f.maxPrice} onChange={set('maxPrice')} />
      <div className="flex gap-3 xl:col-span-6">
        <Button type="submit">Buscar</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setF(EMPTY_FILTERS);
            setError('');
            onSearch(EMPTY_FILTERS);
          }}
        >
          Limpiar filtros
        </Button>
      </div>
    </form>
  );
}
