import { ReactNode } from 'react';

/** Tarjeta de métrica basada en "EcommerceMetrics" de TailAdmin. */
export function StatCard({ label, value, icon, tone = 'brand' }: { label: string; value: string | number; icon: ReactNode; tone?: 'brand' | 'harvest' | 'coffee' }) {
  const tones = { brand: 'bg-brand-50 text-brand-600', harvest: 'bg-harvest-50 text-harvest-700', coffee: 'bg-coffee-50 text-coffee-700' };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <div className={`flex size-12 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
      <p className="mt-5 text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-title-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}
