/** Formatea un valor en pesos colombianos: 18000 -> "$ 18.000". */
export function formatCOP(value: number): string {
  return '$ ' + Math.round(value).toLocaleString('es-CO');
}

export const ROLE_LABEL = { PRODUCER: 'Productor', BUYER: 'Comprador' } as const;
export const STATUS_LABEL = { PENDING: 'Pendiente', CONFIRMED: 'Confirmado' } as const;

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}
