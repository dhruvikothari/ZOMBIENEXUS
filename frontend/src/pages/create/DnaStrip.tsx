import { decodeDna, dnaString, TRAIT_NAMES } from '@/lib/dna';

// Index = DNA pair (0 = last two digits). Matches SPEC 4.3 trait table.
const TRAITS = [
  { label: 'Species', key: 'species', text: 'text-fg-muted', dot: 'bg-fg-muted' },
  { label: 'Accessory', key: 'accessory', text: 'text-gold', dot: 'bg-gold' },
  { label: 'Clothes', key: 'clothes', text: 'text-fg', dot: 'bg-fg' },
  { label: 'Mouth', key: 'mouth', text: 'text-danger', dot: 'bg-danger' },
  { label: 'Eyes', key: 'eyes', text: 'text-warning', dot: 'bg-warning' },
  { label: 'Skin', key: 'skin', text: 'text-green', dot: 'bg-green' },
  { label: 'Head', key: 'head', text: 'text-info', dot: 'bg-info' },
  { label: 'Aura', key: 'aura', text: 'text-purple', dot: 'bg-purple' },
] as const;

const pairAt = (s: string, k: number) => s.slice(2 * k, 2 * k + 2);

// Left to right = most to least significant, so display slot k is pair 7 - k.
export function DnaDigits({ dna, compare, large = false }: { dna: bigint | null; compare?: bigint; large?: boolean }) {
  const s = dna === null ? '-'.repeat(16) : dnaString(dna);
  const c = compare === undefined ? null : dnaString(compare);
  return (
    <p
      role="img"
      aria-label={dna === null ? 'No DNA yet' : `DNA ${s}`}
      className={`flex flex-wrap gap-x-2.5 gap-y-1 font-mono font-medium ${large ? 'text-2xl' : 'text-lg'}`}
    >
      {Array.from({ length: 8 }, (_, k) => {
        const i = 7 - k;
        const changed = c !== null && pairAt(c, k) !== pairAt(s, k);
        return (
          <span
            key={i}
            aria-hidden
            title={TRAITS[i].label}
            className={`${dna === null ? 'text-fg-faint' : TRAITS[i].text} ${changed ? 'underline decoration-2 underline-offset-4' : ''}`}
          >
            {pairAt(s, k)}
          </span>
        );
      })}
    </p>
  );
}

export function DnaLegend({ dna }: { dna: bigint | null }) {
  const t = dna === null ? null : decodeDna(dna);
  const s = dna === null ? null : dnaString(dna);
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
      {Array.from({ length: 8 }, (_, k) => {
        const i = 7 - k;
        const tr = TRAITS[i];
        let value = '--';
        if (t) {
          const v = t[tr.key];
          value = tr.key === 'species' ? (v === 'hero' ? 'Hero' : 'Walker') : TRAIT_NAMES[tr.key][v as number];
        }
        return (
          <div key={i} className="min-w-0">
            <dt className="flex items-center gap-1.5 font-display text-label uppercase tracking-[0.08em] text-fg-muted">
              <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${tr.dot}`} />
              {tr.label}
            </dt>
            <dd className="mt-1 truncate text-body text-fg">
              {value} <span className="font-mono text-label text-fg-muted">{s ? pairAt(s, k) : ''}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
