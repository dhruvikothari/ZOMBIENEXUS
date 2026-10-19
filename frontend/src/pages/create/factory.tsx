import type { CSSProperties, ReactNode } from 'react';

// Keyframes live here because index.css belongs to another area. Rendered once by CreatePage.
const CSS = `
@keyframes fz-rise{0%{transform:translateY(0) scale(.7);opacity:0}15%{opacity:.7}100%{transform:translateY(-380px) scale(1);opacity:0}}
@keyframes fz-flow{to{stroke-dashoffset:-24}}
@keyframes fz-blink{0%,100%{opacity:1}50%{opacity:.35}}
.fz-bubble{animation:fz-rise var(--t) linear var(--d) infinite}
.fz-busy .fz-bubble{animation-duration:calc(var(--t) * .45)}
.fz-flow{animation:fz-flow 1s linear infinite}
.fz-blink{animation:fz-blink 1.6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.fz-bubble,.fz-flow,.fz-blink{animation:none}.fz-bubble{opacity:.35}}
`;

export function FactoryStyles() {
  return <style>{CSS}</style>;
}

const BUBBLES = [
  { l: '12%', s: 6, d: -1, t: 5.2 },
  { l: '24%', s: 10, d: -3.4, t: 7 },
  { l: '38%', s: 5, d: -0.6, t: 4.6 },
  { l: '52%', s: 8, d: -4.1, t: 6.2 },
  { l: '66%', s: 12, d: -2.2, t: 7.8 },
  { l: '78%', s: 6, d: -5, t: 5.6 },
  { l: '88%', s: 9, d: -1.8, t: 6.6 },
];

const TONE = { green: 'var(--color-green)', gold: 'var(--color-gold)', purple: 'var(--color-purple)' };

export function Lamp({ on, tone = 'green' }: { on: boolean; tone?: keyof typeof TONE }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-2 w-2 rounded-full ${on ? 'fz-blink' : 'bg-fg-faint'}`}
      style={on ? { background: TONE[tone], boxShadow: `0 0 8px ${TONE[tone]}` } : undefined}
    />
  );
}

type VatProps = {
  label: string;
  tone?: keyof typeof TONE;
  busy?: boolean;
  minHeight?: number;
  className?: string;
  children: ReactNode;
};

// Specimen vat: glass tube, bubbling liquid, pipe on top, hazard-striped base. Pure CSS/SVG.
export function Vat({ label, tone = 'green', busy = false, minHeight = 300, className = '', children }: VatProps) {
  const vars = { '--tone': TONE[tone] } as CSSProperties;
  return (
    <div className={`relative mx-auto w-full max-w-[22rem] ${busy ? 'fz-busy' : ''} ${className}`} style={vars}>
      <svg aria-hidden viewBox="0 0 352 32" preserveAspectRatio="none" className="relative -mb-px block h-8 w-full">
        <path d="M56 32V14Q56 6 64 6H288Q296 6 296 14V32" fill="none" stroke="var(--color-line-strong)" strokeWidth="8" vectorEffect="non-scaling-stroke" />
        <path
          d="M56 32V14Q56 6 64 6H288Q296 6 296 14V32"
          fill="none"
          stroke="var(--tone)"
          strokeWidth="2"
          strokeDasharray="6 6"
          opacity={busy ? 1 : 0.35}
          className={busy ? 'fz-flow' : undefined}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative z-10 mx-6 flex h-7 items-center justify-between rounded-t-xl border border-b-0 border-line-strong bg-raised px-3">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
          <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
        </span>
        <span className="font-display text-label uppercase tracking-[0.08em] text-fg-muted">{label}</span>
        <Lamp on tone={tone} />
      </div>
      <div
        className="relative overflow-hidden rounded-t-md border border-line-strong"
        style={{
          minHeight,
          background:
            'linear-gradient(to bottom, rgb(0 0 0 / 0.3), transparent 35%), linear-gradient(to top, color-mix(in oklab, var(--tone) 24%, transparent), transparent 75%), var(--color-panel)',
          boxShadow: 'inset 0 0 44px color-mix(in oklab, var(--tone) 16%, transparent)',
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {BUBBLES.map((b) => (
            <span
              key={b.l}
              className="fz-bubble absolute bottom-0 rounded-full border border-fg/30"
              style={{ left: b.l, width: b.s, height: b.s, '--d': `${b.d}s`, '--t': `${b.t}s` } as CSSProperties}
            />
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-3 left-3 w-2 rounded-full"
          style={{ background: 'linear-gradient(to bottom, rgb(255 255 255 / 0.14), transparent)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-6 right-0 w-3 opacity-40"
          style={{ background: 'repeating-linear-gradient(to bottom, var(--color-fg-faint) 0 1px, transparent 1px 16px)' }}
        />
        <div className="relative z-10 flex items-end justify-center px-6 pt-6 pb-3" style={{ minHeight }}>
          {children}
        </div>
      </div>
      <div
        aria-hidden
        className="mx-2 h-4 rounded-b-xl border border-t-0 border-line-strong"
        style={{
          background:
            'repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-gold) 55%, transparent) 0 8px, var(--color-raised) 8px 16px)',
        }}
      />
    </div>
  );
}
