import type { ReactNode } from 'react';

type Glow = 'none' | 'green' | 'gold' | 'purple';

const GLOW: Record<Glow, string> = {
  none: '',
  green: 'shadow-glow-green',
  gold: 'shadow-glow-gold',
  purple: 'shadow-glow-purple',
};

const HOVER_GLOW: Record<Glow, string> = {
  none: 'hover:shadow-glow-green',
  green: 'hover:shadow-glow-green',
  gold: 'hover:shadow-glow-gold',
  purple: 'hover:shadow-glow-purple',
};

export function Card({ glow = 'none', interactive = false, className, children }: { glow?: Glow; interactive?: boolean; className?: string; children?: ReactNode }) {
  const cls = ['glass', GLOW[glow], interactive ? `glass-interactive ${HOVER_GLOW[glow]}` : '', className ?? ''].filter(Boolean).join(' ');
  return <div className={cls}>{children}</div>;
}
