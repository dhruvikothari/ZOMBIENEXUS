import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

export function Section({ icon, title, action, children }: { icon: ReactNode; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-display text-h3 font-bold">
          <span className="text-green [&_svg]:size-5" aria-hidden="true">
            {icon}
          </span>
          {title}
        </h2>
        {action}
      </header>
      {children}
    </Card>
  );
}

// Use inside a <dl>.
export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="shrink-0 font-display text-label font-medium uppercase tracking-[0.08em] text-fg-muted">{label}</dt>
      <dd className="flex min-w-0 sm:justify-end sm:text-right">{children}</dd>
    </div>
  );
}
