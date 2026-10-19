import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'green' | 'purple' | 'gold' | 'danger' | 'warning' | 'info';

const TONE: Record<BadgeTone, string> = {
  neutral: 'border-line bg-raised text-fg-muted',
  green: 'border-green/30 bg-green/10 text-green',
  purple: 'border-purple/40 bg-purple/10 text-purple',
  gold: 'border-gold/40 bg-gold/10 text-gold',
  danger: 'border-danger/40 bg-danger/10 text-danger',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  info: 'border-info/40 bg-info/10 text-info',
};

export function Badge({ tone = 'neutral', icon, children }: { tone?: BadgeTone; icon?: ReactNode; children?: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-display text-label font-bold uppercase tracking-[0.08em] whitespace-nowrap [&_svg]:size-3.5 ${TONE[tone]}`}>
      {icon}
      {children}
    </span>
  );
}
