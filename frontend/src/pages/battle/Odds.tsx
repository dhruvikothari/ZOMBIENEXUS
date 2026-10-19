const R = 44;
const C = 2 * Math.PI * R;

function toneOf(p: number): string {
  if (p >= 60) return 'text-green';
  if (p >= 40) return 'text-warning';
  return 'text-danger';
}

export function Odds({ percent, caption }: { percent: number | null; caption: string }) {
  const shown = percent ?? 0;
  return (
    <div className="flex flex-col items-center gap-2" role="img" aria-label={percent === null ? 'Win chance unknown' : `Win chance ${percent} percent`}>
      <div className={`relative size-32 ${percent === null ? 'text-fg-faint' : toneOf(shown)}`}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" strokeWidth="6" className="stroke-line" />
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className="stroke-current transition-[stroke-dashoffset] duration-[360ms] ease-out-expo"
            style={{ strokeDasharray: C, strokeDashoffset: C * (1 - shown / 100), filter: 'drop-shadow(0 0 6px currentColor)' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-3xl font-bold text-fg">{percent === null ? '—' : `${percent}%`}</span>
        </div>
      </div>
      <span className="font-display text-label uppercase tracking-[0.08em] text-fg-muted">{caption}</span>
    </div>
  );
}
