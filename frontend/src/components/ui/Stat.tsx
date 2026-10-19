import type { ReactNode } from 'react';

export function Stat({ label, value, icon, hint }: { label: string; value: ReactNode; icon?: ReactNode; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-line bg-raised p-3 sm:p-4" title={hint}>
      {icon && (
        <span className="text-green [&_svg]:size-4" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="truncate font-display text-h2 leading-none font-bold tabular-nums">{value}</span>
      <span className="font-display text-label font-medium uppercase tracking-[0.08em] text-fg-muted">{label}</span>
      {hint && <span className="text-label text-fg-muted">{hint}</span>}
    </div>
  );
}
