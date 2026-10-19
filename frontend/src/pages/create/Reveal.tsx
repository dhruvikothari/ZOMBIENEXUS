import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ZombieArt } from '@/components/art/ZombieArt';

const EASE = [0.16, 1, 0.3, 1] as const;

// Create reveal: scale .8 -> 1 with a green glow burst, 700 ms.
export function CreateReveal({ dna, size, label }: { dna: bigint; size: number; label: string }) {
  return (
    <div className="relative">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 m-auto h-40 w-40 rounded-full"
        style={{ background: 'radial-gradient(circle, var(--color-green) 0%, transparent 68%)' }}
        initial={{ opacity: 0.9, scale: 0.3 }}
        animate={{ opacity: 0, scale: 2.8 }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: EASE }}>
        <ZombieArt dna={dna} level={1} size={size} animated label={label} />
      </motion.div>
    </div>
  );
}

// Infect reveal: a gold visor drops in, gold flash, then the real hero art (with its on-chain mask) takes over.
export function HeroReveal({ dna, size, label }: { dna: bigint; size: number; label: string }) {
  const reduce = useReducedMotion();
  const [hero, setHero] = useState(!!reduce);

  useEffect(() => {
    if (hero) return;
    const t = setTimeout(() => setHero(true), 520);
    return () => clearTimeout(t);
  }, [hero]);

  // Same traits without the "99" species pair = the zombie before the mask exists.
  const plain = dna - (dna % 100n);
  return (
    <div className="relative">
      <ZombieArt dna={hero ? dna : plain} level={1} size={size} animated label={label} />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 65%)' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.95, 0], scale: [0.5, 1.5, 2.2] }}
        transition={{ duration: 0.7, times: [0, 0.35, 1], delay: 0.45, ease: 'easeOut' }}
      />
      <motion.svg
        aria-hidden
        viewBox="0 0 100 30"
        className="pointer-events-none absolute left-1/2 top-[30%] w-[55%] -translate-x-1/2 drop-shadow-[0_0_8px_var(--color-gold)]"
        initial={{ y: -140, opacity: 0 }}
        animate={{ y: [-140, 0, 0, 0], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.1, times: [0, 0.4, 0.75, 1], ease: EASE }}
      >
        <path d="M4 6Q50-4 96 6L90 24Q50 32 10 24Z" className="fill-gold-dim stroke-gold" strokeWidth="2" />
        <path d="M22 13H42L38 19H24ZM58 13H78L76 19H62Z" className="fill-bg" />
      </motion.svg>
    </div>
  );
}
