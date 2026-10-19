import { useSyncExternalStore, type ReactNode } from 'react';
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'motion/react';
import { Skull, TriangleAlert } from 'lucide-react';
import { AvengerArt } from '@/components/art/AvengerArt';
import { ZombieArt } from '@/components/art/ZombieArt';
import type { Avenger, Zombie } from '@/lib/types';
import { isAvenger, opponentName } from './result';

export type ArenaPhase = 'idle' | 'signing' | 'pending' | 'clash' | 'error';
type Side = 'left' | 'right';
type Role = 'winner' | 'loser' | null;

const GREEN = 'rgb(57 255 136 / 0.35)';
const PURPLE = 'rgb(142 124 195 / 0.45)';
const RED = 'rgb(255 92 108 / 0.4)';

const CLASH_S = 1.4;
const IMPACT_S = 0.35;

const wideQuery = '(min-width: 640px)';
function subscribeWide(cb: () => void) {
  const m = window.matchMedia(wideQuery);
  m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
}
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(wideQuery).matches, () => true);

// Deterministic spark burst (no Math.random in render).
const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + (i % 2) * 0.18;
  const d = 80 + ((i * 37) % 80);
  return { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.75, color: ['var(--color-green)', '#fff', 'var(--color-gold)'][i % 3], s: 3 + (i % 3) };
});

const DUST = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 83) % 100}%`,
  top: `${15 + ((i * 47) % 65)}%`,
  delay: `${-(i * 0.7).toFixed(1)}s`,
  size: 2 + (i % 3),
}));

function Backdrop({ rightTint }: { rightTint: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 80% at 50% 0%, var(--color-panel-2) 0%, var(--color-bg) 72%)' }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(48% 70% at 20% 58%, color-mix(in oklab, ${GREEN} 45%, transparent), transparent 72%), radial-gradient(48% 70% at 80% 58%, color-mix(in oklab, ${rightTint} 40%, transparent), transparent 72%)` }} />
      {[20, 80].map((x) => (
        <div
          key={x}
          className="absolute top-0 h-full w-[42%] blur-sm"
          style={{
            left: `${x}%`,
            transform: 'translateX(-50%)',
            clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
            background: 'linear-gradient(to bottom, rgb(255 255 255 / 0.12), transparent 85%)',
          }}
        />
      ))}
      <div
        className="absolute inset-x-0 bottom-0 h-[42%] border-t border-white/5"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgb(255 255 255 / 0.05) 0 1px, transparent 1px 56px), linear-gradient(to bottom, rgb(255 255 255 / 0.03), rgb(0 0 0 / 0.55))',
          maskImage: 'linear-gradient(to top, black 30%, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent)',
        }}
      />
      {DUST.map((d, i) => (
        <span
          key={i}
          className="animate-float absolute rounded-full bg-white/25"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size, animationDelay: d.delay }}
        />
      ))}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0 / 0.6) 100%)' }} />
    </div>
  );
}

function Bar({ side, name, sub, tone, glowColor, role, phase, reduced }: { side: Side; name: string; sub: string; tone: string; glowColor: string; role: Role; phase: ArenaPhase; reduced: boolean }) {
  const drained = phase === 'clash' && role === 'loser';
  const glow = phase === 'clash' && role === 'winner';
  return (
    <div className={`min-w-0 ${side === 'right' ? 'text-right' : ''}`}>
      <p className="truncate font-display text-base font-bold text-fg sm:text-lg">{name}</p>
      <p className="truncate font-mono text-label text-fg-muted">{sub}</p>
      <div aria-hidden="true" className={`mt-2 h-2.5 overflow-hidden rounded-full border border-line bg-bg/70 ${side === 'right' ? 'rotate-180' : ''}`}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: tone }}
          initial={false}
          animate={{
            width: drained && !reduced ? '0%' : '100%',
            opacity: drained && reduced ? 0.15 : 1,
            boxShadow: glow ? `0 0 14px 2px ${glowColor}` : `0 0 0 0 ${glowColor}`,
          }}
          transition={drained ? { delay: reduced ? 0 : 0.6, duration: reduced ? 0.36 : 0.5, ease: 'easeOut' } : { duration: 0.2 }}
        />
      </div>
    </div>
  );
}

function Fighter({ side, phase, role, reduced, glow, children }: { side: Side; phase: ArenaPhase; role: Role; reduced: boolean; glow: string; children: ReactNode }) {
  const dir = side === 'left' ? 1 : -1;
  const clash = phase === 'clash' && role !== null;
  let animate: TargetAndTransition;
  if (reduced) {
    animate = { opacity: clash && role === 'loser' ? 0.45 : 1, transition: { duration: 0.36 } };
  } else if (clash) {
    const t: Transition = { duration: CLASH_S, times: [0, 0.25, 0.43, 1], ease: ['easeIn', 'linear', 'easeOut'] };
    animate =
      role === 'winner'
        ? { x: ['0%', `${dir * 35}%`, `${dir * 35}%`, '0%'], rotate: 0, scale: 1, opacity: 1, transition: t }
        : {
            x: ['0%', `${dir * 35}%`, `${dir * 35}%`, `${-dir * 12}%`],
            rotate: [0, 0, 0, -dir * 8],
            opacity: [1, 1, 1, 0.45],
            scale: [1, 1, 1, 0.95],
            transition: t,
          };
  } else {
    animate = { x: phase === 'signing' ? `${dir * 2}%` : '0%', rotate: 0, scale: phase === 'signing' ? 1.03 : 1, opacity: 1, transition: { duration: 0.2 } };
  }

  return (
    <div className="relative flex items-end justify-center pb-6" style={{ zIndex: role === 'winner' ? 20 : 10 }}>
      <motion.span
        className="absolute bottom-3 h-5 w-3/5 rounded-full blur-md"
        style={{ background: glow }}
        animate={{ opacity: phase === 'pending' && !reduced ? [0.4, 1, 0.4] : 0.7 }}
        transition={phase === 'pending' ? { duration: 1.2, repeat: Infinity } : { duration: 0.2 }}
        aria-hidden="true"
      />
      <motion.div
        className="relative"
        animate={animate}
        style={{ filter: `drop-shadow(0 0 22px ${glow})` }}
      >
        {phase === 'pending' && !reduced && (
          <motion.span
            className="absolute inset-[-12%] -z-10 rounded-full blur-2xl"
            style={{ background: glow }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            aria-hidden="true"
          />
        )}
        <div className="[-webkit-box-reflect:below_-6px_linear-gradient(transparent_62%,rgb(255_255_255/0.14))]">{children}</div>
      </motion.div>
    </div>
  );
}

function Empty({ label, size }: { label: string; size: number }) {
  return (
    <div className="grid place-items-center rounded-full border border-dashed border-line-strong text-fg-faint" style={{ width: size * 0.6, height: size * 0.6 }}>
      <div className="flex flex-col items-center gap-1 px-2 text-center">
        <Skull className="size-6" aria-hidden="true" />
        <span className="text-label">{label}</span>
      </div>
    </div>
  );
}

function Impact({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-[55%] z-30" aria-hidden="true">
      <motion.div
        className="absolute size-72 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, #fff 0%, rgb(57 255 136 / 0.6) 35%, transparent 70%)' }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 1, 0], scale: [0.3, 1.2, 1.6] }}
        transition={{ delay: IMPACT_S, duration: 0.45, times: [0, 0.27, 1], ease: 'easeOut' }}
      />
      <motion.div
        className="absolute size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-green"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0.9, 0], scale: [0.2, 3] }}
        transition={{ delay: IMPACT_S, duration: 0.6, ease: 'easeOut' }}
      />
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: s.s, height: s.s, background: s.color, boxShadow: `0 0 8px 2px ${s.color}` }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [1, 1, 0], x: s.x, y: s.y, scale: [1, 1, 0.2] }}
          transition={{ delay: IMPACT_S, duration: 0.55 + (i % 4) * 0.08, times: [0, 0.6, 1], ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function Banner({ phase, won, message, reduced }: { phase: ArenaPhase; won: boolean | null; message: string | null; reduced: boolean }) {
  const settled = phase === 'clash' && won !== null;
  if (!settled && phase !== 'error') return null;
  const delay = settled && !reduced ? 1 : 0;
  const initial = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3, y: 12 };
  const to = reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 };
  const transition: Transition = reduced ? { duration: 0.36 } : { type: 'spring', stiffness: 300, damping: 18, delay };
  return (
    <div className="pointer-events-none absolute inset-x-4 top-1/2 z-40 flex -translate-y-1/2 justify-center">
      <motion.div
        key={settled ? 'result' : 'error'}
        initial={initial}
        animate={to}
        transition={transition}
        role={settled ? 'status' : 'alert'}
        className={`max-w-md rounded-xl border bg-bg/80 px-6 py-3 text-center backdrop-blur-md ${
          settled ? (won ? 'border-green/60 shadow-glow-green' : 'border-danger/60') : 'border-danger/60'
        }`}
      >
        {settled ? (
          <span
            className={`block font-display text-4xl font-bold tracking-[0.12em] sm:text-5xl ${won ? 'text-green' : 'text-danger'}`}
            style={{ textShadow: `0 0 32px ${won ? 'var(--color-green-glow)' : 'rgb(255 92 108 / 0.5)'}` }}
          >
            {won ? 'VICTORY' : 'DEFEAT'}
          </span>
        ) : (
          <span className="flex items-start gap-2 text-left text-sm text-fg">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
            {message}
          </span>
        )}
      </motion.div>
    </div>
  );
}

const CAPTIONS: Record<ArenaPhase, string> = {
  idle: 'Fighters ready',
  signing: 'Confirm in MetaMask…',
  pending: 'Battle transaction pending…',
  clash: '',
  error: '',
};

export function Arena({
  zombie,
  opponent,
  phase,
  won,
  message,
}: {
  zombie: Zombie | null;
  opponent: Zombie | Avenger | null;
  phase: ArenaPhase;
  won: boolean | null;
  message: string | null;
}) {
  const reduced = !!useReducedMotion();
  const wide = useWide();
  const size = wide ? 230 : 140;
  const rightTint = opponent && isAvenger(opponent) ? PURPLE : RED;
  const rightBar = opponent && isAvenger(opponent) ? 'var(--color-purple)' : 'var(--color-danger)';
  const clash = phase === 'clash' && won !== null;
  const leftRole: Role = clash ? (won ? 'winner' : 'loser') : null;
  const rightRole: Role = clash ? (won ? 'loser' : 'winner') : null;
  const alive = phase !== 'clash';

  return (
    <section aria-label="Battle arena" className="relative isolate overflow-hidden rounded-2xl border border-line-strong bg-bg shadow-card">
      <Backdrop rightTint={rightTint} />
      <div className="relative z-10 grid grid-cols-2 gap-6 px-4 pt-4 sm:gap-16 sm:px-6 sm:pt-6">
        <Bar
          side="left"
          name={zombie?.name ?? 'Pick a zombie'}
          sub={zombie ? `#${zombie.id} · Lv ${zombie.level}` : '—'}
          tone="var(--color-green)"
          glowColor={GREEN}
          role={leftRole}
          phase={phase}
          reduced={reduced}
        />
        <Bar
          side="right"
          name={opponent ? opponentName(opponent) : 'Pick an opponent'}
          sub={opponent ? (isAvenger(opponent) ? `#${opponent.id} · Power ${opponent.power}` : `#${opponent.id} · Lv ${opponent.level}`) : '—'}
          tone={rightBar}
          glowColor={rightTint}
          role={rightRole}
          phase={phase}
          reduced={reduced}
        />
      </div>

      <motion.div
        className="relative z-10 grid h-[250px] grid-cols-2 sm:h-[350px]"
        animate={clash && !reduced ? { x: [0, -6, 6, -5, 5, -2, 0] } : { x: 0 }}
        transition={clash && !reduced ? { delay: IMPACT_S, duration: 0.25 } : { duration: 0.1 }}
      >
        <Fighter side="left" phase={phase} role={leftRole} reduced={reduced} glow={GREEN}>
          {zombie ? <ZombieArt dna={zombie.dna} level={zombie.level} size={size} animated={alive} label={`${zombie.name}, level ${zombie.level}`} /> : <Empty label="Pick a zombie" size={size} />}
        </Fighter>
        <Fighter side="right" phase={phase} role={rightRole} reduced={reduced} glow={rightTint}>
          {opponent ? (
            isAvenger(opponent) ? (
              <AvengerArt genes={opponent.genes} size={size} animated={alive} />
            ) : (
              <ZombieArt dna={opponent.dna} level={opponent.level} size={size} animated={alive} label={`${opponent.name}, level ${opponent.level}`} />
            )
          ) : (
            <Empty label="Pick an opponent" size={size} />
          )}
        </Fighter>

        <motion.div
          className="pointer-events-none absolute left-1/2 top-[48%] z-30 -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: clash || phase === 'error' ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          <div className="relative grid size-20 place-items-center sm:size-28">
            <motion.svg
              viewBox="0 0 100 100"
              className="absolute inset-0 size-full text-green"
              animate={{ rotate: phase === 'pending' && !reduced ? 360 : 0 }}
              transition={phase === 'pending' && !reduced ? { duration: 8, repeat: Infinity, ease: 'linear' } : { duration: 0.36 }}
            >
              <circle cx="50" cy="50" r="46" fill="rgb(11 13 16 / 0.7)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="6 8" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            </motion.svg>
            <span className="relative font-display text-3xl font-bold italic tracking-wider text-fg sm:text-4xl" style={{ textShadow: '0 0 18px var(--color-green-glow)' }}>
              VS
            </span>
          </div>
        </motion.div>

        {clash && <Impact key="impact" reduced={reduced} />}
      </motion.div>

      <p
        className="relative z-10 min-h-8 pb-3 text-center font-display text-label uppercase tracking-[0.08em] text-fg-muted"
        aria-live="polite"
      >
        {CAPTIONS[phase]}
      </p>

      <Banner phase={phase} won={won} message={message} reduced={reduced} />
    </section>
  );
}
