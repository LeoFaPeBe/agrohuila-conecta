import { formatCOP } from '@/lib/format';
import { Product } from '@/lib/types';
import { Badge, EmptyState } from '../ui/feedback';

/** Tabla de "Mis productos" (estilo BasicTable de TailAdmin). */
export function ProductsTable({ products, onEdit }: { products: Product[]; onEdit: (p: Product) => void }) {
  if (products.length === 0) {
    return <EmptyState title="Aún no tiene productos publicados">Use el formulario para publicar su primer producto.</EmptyState>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-y border-gray-100 text-xs text-gray-500">
          <tr>
            <th className="py-3 pr-4 font-medium">Producto</th>
            <th className="py-3 pr-4 font-medium">Categoría</th>
            <th className="py-3 pr-4 font-medium">Precio</th>
            <th className="py-3 pr-4 font-medium">Disponible</th>
            <th className="py-3 pr-4 font-medium">Estado</th>
            <th className="py-3 font-medium">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => (
            <tr key={p.id}>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt="" className="size-10 rounded-md object-cover" />
                  <span className="font-medium text-gray-800">{p.name}</span>
                </div>
              </td>
              <td className="py-3 pr-4 text-gray-600">{p.category.name}</td>
              <td className="py-3 pr-4 text-gray-600">
                {formatCOP(p.price)} / {p.unit}
              </td>
              <td className="py-3 pr-4 text-gray-600">
                {p.quantity} {p.unit}
              </td>
              <td className="py-3 pr-4">
                {!p.active ? <Badge color="gray">Inactivo</Badge> : p.quantity <= 5 ? <Badge color="warning">Stock bajo</Badge> : <Badge color="success">Activo</Badge>}
              </td>
              <td className="py-3 text-right">
                <button className="text-sm font-medium text-brand-500 hover:text-brand-700" onClick={() => onEdit(p)} aria-label={`Editar ${p.name}`}>
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
