import { useEffect, useState, type PointerEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { ChevronsUp, Crown, Skull, Timer, Trophy } from 'lucide-react';
import { ZombieArt } from '@/components/art/ZombieArt';
import { Badge } from '@/components/ui/Badge';
import { Stat } from '@/components/ui/Stat';
import { rarityOf } from '@/lib/dna';
import { formatDna, formatDuration, isReady } from '@/lib/format';
import type { Zombie } from '@/lib/types';

export type FrameTone = 'common' | 'rare' | 'hero' | 'avenger' | 'selected';

const FRAMES: Record<FrameTone, { bg: string; color: string; cls: string; shimmer: boolean }> = {
  common: { bg: 'color-mix(in oklab, var(--color-green-dim) 78%, transparent)', color: 'var(--color-green-dim)', cls: 'hover:shadow-glow-green', shimmer: false },
  rare: {
    bg: 'linear-gradient(110deg, var(--color-gold-dim) 0%, var(--color-gold) 32%, #fff1bd 50%, var(--color-gold) 68%, var(--color-gold-dim) 100%)',
    color: 'var(--color-gold)',
    cls: 'hover:shadow-glow-gold',
    shimmer: true,
  },
  hero: { bg: 'linear-gradient(135deg, var(--color-purple) 0%, var(--color-gold) 100%)', color: 'var(--color-gold)', cls: 'shadow-glow-gold', shimmer: false },
  avenger: { bg: 'linear-gradient(135deg, var(--color-purple-dim), var(--color-purple) 50%, var(--color-purple-dim))', color: 'var(--color-purple)', cls: 'hover:shadow-glow-purple', shimmer: false },
  selected: { bg: 'var(--color-green)', color: 'var(--color-green)', cls: 'shadow-glow-green', shimmer: false },
};

/** Pointer tilt: fine pointers only, never with reduced motion. */
export function useTilt() {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setFine(mq.matches);
    const on = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const enabled = fine && !reduce;
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  return {
    enabled,
    style: { rotateX: rx, rotateY: ry, transformPerspective: 900 },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const b = e.currentTarget.getBoundingClientRect();
      ry.set(((e.clientX - b.left) / b.width - 0.5) * 10);
      rx.set(-((e.clientY - b.top) / b.height - 0.5) * 10);
    },
    onPointerLeave: () => {
      rx.set(0);
      ry.set(0);
    },
  };
}

function Silhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 240" className="h-[125%] w-auto" fill={color} aria-hidden="true">
      <ellipse cx="100" cy="96" rx="54" ry="58" />
      <path d="M22 240 L22 204 C22 174 42 160 72 153 L128 153 C158 160 178 174 178 204 L178 240Z" />
    </svg>
  );
}

/** Rarity frame + deep panel + oversized faint silhouette. Shared by zombie and avenger cards and the gallery. */
export function ArtFrame({ tone, label, badge, children }: { tone: FrameTone; label: string; badge?: ReactNode; children: ReactNode }) {
  const f = FRAMES[tone];
  const tilt = useTilt();
  return (
    <motion.div
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      whileHover={tilt.enabled ? { y: -3 } : undefined}
      transition={{ duration: 0.2 }}
      style={{ ...tilt.style, background: f.bg, backgroundSize: f.shimmer ? '300% 100%' : undefined }}
      className={`rounded-2xl p-[2px] transition-shadow duration-200 ${f.cls} ${f.shimmer ? 'animate-shimmer' : ''}`}
      data-tone={tone}
    >
      <div
        className="relative overflow-hidden rounded-[26px] px-3 pb-4 pt-9"
        style={{ background: `radial-gradient(120% 75% at 50% 18%, color-mix(in oklab, ${f.color} 16%, var(--color-panel-2)) 0%, var(--color-panel) 58%, var(--color-bg) 100%)` }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.12] blur-md">
          <Silhouette color={f.color} />
        </div>
        {badge && <div className="absolute left-3 top-3 z-10">{badge}</div>}
        <div className="relative flex justify-center [&>svg]:h-auto [&>svg]:max-w-full">{children}</div>
        <p className="relative mt-2 text-center font-display text-label font-medium uppercase tracking-[0.08em]" style={{ color: f.color }}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}

export function ZombieFront({ dna, level, id, name, size = 190, animated = false }: { dna: bigint; level: number; id: number; name: string; size?: number; animated?: boolean }) {
  const rarity = rarityOf(dna);
  return (
    <ArtFrame
      tone={rarity}
      label={`${rarity.toUpperCase()} #${id}`}
      badge={
        rarity === 'hero' ? (
          <Badge tone="gold" icon={<Crown size={12} aria-hidden="true" />}>
            HERO
          </Badge>
        ) : undefined
      }
    >
      <ZombieArt dna={dna} level={level} size={size} animated={animated} label={name} />
    </ArtFrame>
  );
}

export function ZombieCard({ zombie, headTs, variant = 'grid', actions, to }: { zombie: Zombie; headTs: number | null; variant?: 'grid' | 'detail'; actions?: ReactNode; to?: string }) {
  const detail = variant === 'detail';
  const front = <ZombieFront dna={zombie.dna} level={zombie.level} id={zombie.id} name={zombie.name} size={detail ? 230 : 190} animated={detail} />;
  const ready = isReady(zombie, headTs);
  return (
    <article className={`flex min-w-0 flex-col ${detail ? 'md:flex-row md:items-center' : ''}`} data-testid="zombie-card" data-zombie-id={zombie.id}>
      <div className={detail ? 'md:w-[320px] md:shrink-0' : ''}>
        {to ? (
          <Link to={to} aria-label={`Open ${zombie.name}`} className="block rounded-2xl">
            {front}
          </Link>
        ) : (
          front
        )}
      </div>
      <div className={`glass relative z-10 mt-3 p-4 ${detail ? 'md:-ml-8 md:mt-0 md:flex-1 motion-safe:md:rotate-[2deg]' : ''}`}>
        <h3 className="truncate font-display text-h3 font-bold">{zombie.name}</h3>
        <p className="mt-1 break-all font-mono text-xs text-fg-muted">{formatDna(zombie.dna)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Level" value={zombie.level} icon={<ChevronsUp size={16} aria-hidden="true" />} />
          <Stat label="Wins" value={zombie.winCount} icon={<Trophy size={16} aria-hidden="true" />} />
          <Stat label="Losses" value={zombie.lossCount} icon={<Skull size={16} aria-hidden="true" />} />
          <Stat
            label="Ready"
            icon={<Timer size={16} aria-hidden="true" />}
            value={
              headTs === null ? (
                '...'
              ) : ready ? (
                <span className="text-green">Ready</span>
              ) : (
                <span className="text-warning">{formatDuration(zombie.readyTime - headTs)}</span>
              )
            }
          />
        </div>
        {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
      </div>
    </article>
  );
}
