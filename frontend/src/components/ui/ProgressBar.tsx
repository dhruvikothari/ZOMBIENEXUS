type Tone = 'green' | 'purple' | 'gold' | 'danger' | 'warning' | 'info';

const FILL: Record<Tone, string> = {
  green: 'bg-green shadow-[0_0_10px_var(--color-green-glow)]',
  purple: 'bg-purple',
  gold: 'bg-gold',
  danger: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
};

export function ProgressBar({ value, tone = 'green', label, decorative = false }: { value: number; tone?: Tone; label: string; decorative?: boolean }) {
  const pct = Math.min(100, Math.max(0, value));
  const a11y = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'progressbar', 'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(pct) } as const);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-raised" {...a11y}>
      <div className={`h-full rounded-full transition-[width] duration-500 ease-out-expo ${FILL[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
