import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Crown, Dna, Images, RefreshCw, Send, Swords, Wallet } from 'lucide-react';
import { Link } from 'react-router';
import { ZombieArt } from '@/components/art/ZombieArt';
import { Button, buttonClass } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { useHead } from '@/lib/chain';
import { rarityOf } from '@/lib/dna';
import { mapError } from '@/lib/errors';
import { useAvengers, useZombies } from '@/lib/hooks';
import { useWallet } from '@/lib/wallet';
import { EASE, rise } from './rise';

// Gallery DNAs (SPEC 6 /gallery): Mossbelly, Thunderrot, Duskwalker. Art only, no stats shown.
const TRIO = [
  { dna: 9343918324261100n, level: 5, tilt: '-rotate-6', lift: 'translate-y-6', delay: '-1.2s' },
  { dna: 6212148620395099n, level: 2, tilt: '', lift: 'scale-110', delay: '0s' },
  { dna: 8887902053609700n, level: 8, tilt: 'rotate-6', lift: 'translate-y-6', delay: '-3s' },
];

const FRAME = {
  common: { box: 'border-green-dim/70', text: 'text-green', label: 'Common' },
  rare: { box: 'border-gold/70 shadow-glow-gold', text: 'text-gold', label: 'Rare' },
  hero: { box: 'border-purple/70 shadow-glow-purple', text: 'text-gold', label: 'Hero' },
};

const FEATURES = [
  { icon: Dna, title: 'Mutate with Avenger DNA', text: 'Infect a zombie to spawn a gold-framed hero.' },
  { icon: Swords, title: 'Battle on-chain', text: 'Fight Avengers or rival zombies. Results are events.' },
  { icon: Send, title: 'Own and trade', text: 'Rename, approve and transfer between wallets.' },
];

const BACKDROP: CSSProperties = {
  backgroundImage:
    'radial-gradient(60% 80% at 88% 12%, rgb(142 124 195 / 0.22), transparent 60%), radial-gradient(55% 70% at 8% 95%, rgb(57 255 136 / 0.14), transparent 60%)',
};
const GRID: CSSProperties = {
  backgroundImage:
    'linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px)',
  backgroundSize: '44px 44px',
  maskImage: 'radial-gradient(ellipse at 70% 40%, black, transparent 70%)',
  WebkitMaskImage: 'radial-gradient(ellipse at 70% 40%, black, transparent 70%)',
};

function Trio() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] py-6">
      <div aria-hidden className="absolute inset-x-8 inset-y-4 animate-pulse-glow rounded-full bg-green/15 blur-3xl" />
      <div className="relative grid grid-cols-3 items-end gap-2 sm:gap-4">
        {TRIO.map((t, i) => {
          const frame = FRAME[rarityOf(t.dna)];
          return (
            <motion.div
              key={i}
              className={`${t.tilt} ${t.lift} ${i === 1 ? 'z-10' : ''}`}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: EASE }}
            >
              <div className="animate-float" style={{ animationDelay: t.delay }}>
                <div className={`rounded-2xl border bg-linear-to-b from-raised to-panel p-1.5 sm:p-2 ${frame.box}`}>
                  <div className="[&>svg]:h-auto! [&>svg]:w-full!">
                    <ZombieArt dna={t.dna} level={t.level} size={200} label={`${frame.label} zombie sample`} />
                  </div>
                  <p
                    className={`flex items-center justify-center gap-1 pb-1 pt-1.5 text-label font-display uppercase tracking-[0.08em] ${frame.text}`}
                  >
                    {i === 1 && <Crown size={12} aria-hidden />}
                    {frame.label}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function LiveStrip() {
  const zombies = useZombies();
  const avengers = useAvengers();
  const head = useHead();
  if (zombies.error || avengers.error) return null;
  const items = [
    { label: 'Zombies on chain', value: zombies.data?.length },
    { label: 'Avengers summoned', value: avengers.data?.length },
    { label: 'Latest block', value: head ? `#${head.blockNumber}` : undefined },
  ];
  return (
    <dl className="relative grid grid-cols-3 border-t border-line bg-bg/40">
      {items.map((it) => (
        <div key={it.label} className="px-4 py-4 text-center sm:px-8 sm:text-left">
          <dt className="text-label font-display uppercase tracking-[0.08em] text-fg-muted">{it.label}</dt>
          <dd className="mt-1 font-display text-h3 font-bold tabular-nums">
            {it.value === undefined ? <Skeleton rounded="md" className="mx-auto h-6 w-12 sm:mx-0" /> : it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function HeroPanel() {
  const { toast } = useToast();
  const { status, connect, switchNetwork, refresh } = useWallet();

  const run = (fn: () => Promise<void>) => () =>
    fn().catch((e: unknown) => toast({ kind: 'error', title: mapError(e).message }));

  const gallery = (variant: 'primary' | 'secondary') => (
    <Link to="/gallery" className={`${buttonClass(variant, 'lg')} gap-2.5`}>
      <Images size={18} aria-hidden /> Explore the Gallery
    </Link>
  );

  let cta: ReactNode;
  if (status === 'disconnected') {
    cta = (
      <>
        <Button size="lg" icon={<Wallet size={18} aria-hidden />} onClick={run(connect)}>
          Connect MetaMask
        </Button>
        {gallery('secondary')}
      </>
    );
  } else if (status === 'connecting') {
    cta = (
      <>
        <Button size="lg" loading disabled>
          Waiting for MetaMask…
        </Button>
        {gallery('secondary')}
      </>
    );
  } else if (status === 'wrong-network') {
    cta = (
      <>
        <Button size="lg" onClick={run(switchNetwork)}>
          Switch network
        </Button>
        {gallery('secondary')}
      </>
    );
  } else {
    cta = (
      <>
        {gallery('primary')}
        <Button size="lg" variant="secondary" icon={<RefreshCw size={16} aria-hidden />} onClick={run(refresh)}>
          Retry connection
        </Button>
      </>
    );
  }

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-line bg-panel/80 shadow-card">
      <div aria-hidden className="absolute inset-0 -z-10" style={BACKDROP} />
      <div aria-hidden className="absolute inset-0 -z-10" style={GRID} />

      <div className="grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:p-14">
        <div className="space-y-8">
          <div className="space-y-5">
            <motion.p
              {...rise(0)}
              className="inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-3 py-1 text-label font-display uppercase tracking-[0.08em] text-green"
            >
              <span aria-hidden className="size-1.5 animate-pulse-glow rounded-full bg-green" />
              Fully on-chain · Ganache 1337
            </motion.p>
            <motion.h1
              {...rise(1)}
              className="font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-[3.5rem] lg:text-[4rem]"
            >
              Raise your{' '}
              <span className="bg-linear-to-r from-green to-purple bg-clip-text text-transparent">undead army</span>{' '}
              on-chain.
            </motion.h1>
            <motion.p {...rise(2)} className="max-w-xl text-lg text-fg-muted">
              Turn a name into a zombie, mutate it with Avenger DNA, battle for levels and trade it. Every move is a
              real transaction on your local chain.
            </motion.p>
          </div>

          <motion.div {...rise(3)} className="flex flex-wrap gap-3">
            {cta}
          </motion.div>

          <motion.ul {...rise(4)} className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="space-y-1.5">
                <Icon size={18} className="text-green" aria-hidden />
                <p className="font-display text-sm font-semibold">{title}</p>
                <p className="text-sm text-fg-muted">{text}</p>
              </li>
            ))}
          </motion.ul>
        </div>

        <Trio />
      </div>

      <LiveStrip />
    </section>
  );
}
