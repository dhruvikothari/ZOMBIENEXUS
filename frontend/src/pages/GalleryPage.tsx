import { motion } from 'motion/react';
import { Crown } from 'lucide-react';
import { AvengerFront } from '@/components/art/AvengerCard';
import { ZombieFront } from '@/components/art/ZombieCard';
import { Badge } from '@/components/ui/Badge';
import { TRAIT_NAMES, decodeDna, dnaString, rarityOf } from '@/lib/dna';
import { ROSTER, heroName, powerOf } from '@/lib/roster';

const ZOMBIES: { name: string; dna: bigint; level: number }[] = [
  ['Rotfang', '2521625881949400', 2],
  ['Grimjaw', '2729772995698500', 1],
  ['Mossbelly', '9343918324261100', 5],
  ['Duskwalker', '8887902053609700', 8],
  ['The Warden', '5861794999842000', 3],
  ['Thunderrot', '6212148620395099', 2],
  ['Bonechill', '5403569476888700', 1],
  ['Ashgrin', '6279290754456800', 4],
  ['Hollowmaw', '0981397381800200', 6],
  ['Vexbone', '8448425644938400', 10],
  ['Duskhulk', '6679918540149499', 7],
  ['Mossking', '9343918324261199', 12],
].map(([name, dna, level]) => ({ name: name as string, dna: BigInt(dna as string), level: level as number }));

const reveal = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, delay: Math.min(i, 12) * 0.04, ease: [0.16, 1, 0.3, 1] as const },
});

function ZombieTile({ name, dna, level, index }: { name: string; dna: bigint; level: number; index: number }) {
  const t = decodeDna(dna);
  const rarity = rarityOf(dna);
  const rows: [string, string][] = [
    ['Species', t.species === 'hero' ? 'Hero' : 'Zombie'],
    ['Accessory', TRAIT_NAMES.accessory[t.accessory]],
    ['Clothes', TRAIT_NAMES.clothes[t.clothes]],
    ['Mouth', TRAIT_NAMES.mouth[t.mouth]],
    ['Eyes', TRAIT_NAMES.eyes[t.eyes]],
    ['Skin', TRAIT_NAMES.skin[t.skin]],
    ['Head', TRAIT_NAMES.head[t.head]],
    ['Aura', TRAIT_NAMES.aura[t.aura]],
  ];
  return (
    <motion.li {...reveal(index)} className="flex min-w-0 flex-col" data-testid="gallery-zombie">
      <ZombieFront dna={dna} level={level} id={index} name={name} animated />
      <div className="glass mt-3 flex-1 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate font-display text-h3 font-bold">{name}</h3>
          <Badge tone={rarity === 'hero' ? 'purple' : rarity === 'rare' ? 'gold' : 'neutral'} icon={rarity === 'hero' ? <Crown size={12} aria-hidden="true" /> : undefined}>
            {rarity[0].toUpperCase() + rarity.slice(1)}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-fg-muted">
          Level {level} <span aria-hidden="true">·</span> DNA
        </p>
        <p className="break-all font-mono text-label text-fg">{dnaString(dna)}</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-line pt-3 text-label leading-snug">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-fg-muted">{k}</dt>
              <dd className="text-right text-fg">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.li>
  );
}

function AvengerTile({ index }: { index: number }) {
  const h = ROSTER[index];
  const power = powerOf(h.genes);
  return (
    <motion.li {...reveal(index + 12)} className="flex min-w-0 flex-col" data-testid="gallery-avenger">
      <AvengerFront genes={h.genes} id={index} animated />
      <div className="glass mt-3 flex-1 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 truncate font-display text-h3 font-bold">{heroName(h.genes)}</h3>
          <Badge tone="purple">Power {power}</Badge>
        </div>
        <p className="mt-1 text-xs text-fg-muted">Genes</p>
        <p className="break-all font-mono text-label text-fg">{h.genes.toString()}</p>
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-label text-fg-muted">
          <span>Palette</span>
          {[h.color, h.accent].map((c) => (
            <span key={c} className="h-3.5 w-3.5 rounded-full border border-line-strong" style={{ background: c }} title={c} />
          ))}
          <span className="ml-auto">Roster {index}</span>
        </div>
      </div>
    </motion.li>
  );
}

const LEGEND: { dot: string; title: string; hint: string }[] = [
  { dot: 'var(--color-green-dim)', title: 'Common', hint: 'the default frame' },
  { dot: 'var(--color-gold)', title: 'Rare', hint: 'top digit pair is 90 or more' },
  { dot: 'linear-gradient(135deg, var(--color-purple), var(--color-gold))', title: 'Hero', hint: 'DNA ends in 99' },
];

export default function GalleryPage() {
  return (
    <div className="relative mx-auto max-w-7xl py-8 lg:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72" style={{ background: 'radial-gradient(60% 100% at 50% 0%, var(--color-green-glow), transparent 70%)', opacity: 0.35 }} />

      <header className="max-w-2xl">
        <p className="font-display text-label font-medium uppercase tracking-[0.08em] text-green">Gallery</p>
        <h1 className="mt-2 font-display text-h1 font-bold sm:text-display">Sixteen digits. One zombie.</h1>
        <p className="mt-3 text-fg-muted">
          Every creature below is drawn straight from its DNA: each pair of digits picks a head, skin, eyes, mouth, clothes, accessory or aura. Nothing is stored and nothing is fetched. The six Avengers are the roster the contract
          can mint.
        </p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-fg-muted">
          {LEGEND.map((l) => (
            <li key={l.title} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.dot }} aria-hidden="true" />
              <span>
                <span className="font-medium text-fg">{l.title}</span> {l.hint}
              </span>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green shadow-glow-green" aria-hidden="true" />
            <span>Aura glows stronger at levels 2, 5 and 10</span>
          </li>
        </ul>
      </header>

      <section className="mt-10 lg:mt-12" aria-labelledby="gallery-zombies">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 id="gallery-zombies" className="font-display text-h2 font-bold">
            Zombies
          </h2>
          <span className="text-xs text-fg-muted">{ZOMBIES.length} specimens</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6 xl:grid-cols-4">
          {ZOMBIES.map((z, i) => (
            <ZombieTile key={z.name} {...z} index={i} />
          ))}
        </ul>
      </section>

      <section className="mt-14 lg:mt-16" aria-labelledby="gallery-avengers">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 id="gallery-avengers" className="font-display text-h2 font-bold">
            Avengers
          </h2>
          <span className="text-xs text-fg-muted">{ROSTER.length} heroes</span>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-6">
          {ROSTER.map((h) => (
            <AvengerTile key={h.index} index={h.index} />
          ))}
        </ul>
      </section>
    </div>
  );
}
