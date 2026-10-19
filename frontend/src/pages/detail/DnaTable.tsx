import { Dna } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TRAIT_NAMES, decodeDna, dnaPair, rarityOf, type Traits } from '@/lib/dna';

// Reading order of the 16 digits: pair 7 (digits 1-2) first, pair 0 (digits 15-16) last.
const ROWS: { pair: number; trait: string; variant: (t: Traits) => string }[] = [
  { pair: 7, trait: 'Aura', variant: (t) => TRAIT_NAMES.aura[t.aura] },
  { pair: 6, trait: 'Head', variant: (t) => TRAIT_NAMES.head[t.head] },
  { pair: 5, trait: 'Skin', variant: (t) => TRAIT_NAMES.skin[t.skin] },
  { pair: 4, trait: 'Eyes', variant: (t) => TRAIT_NAMES.eyes[t.eyes] },
  { pair: 3, trait: 'Mouth', variant: (t) => TRAIT_NAMES.mouth[t.mouth] },
  { pair: 2, trait: 'Clothes', variant: (t) => TRAIT_NAMES.clothes[t.clothes] },
  { pair: 1, trait: 'Accessory', variant: (t) => TRAIT_NAMES.accessory[t.accessory] },
  { pair: 0, trait: 'Species', variant: (t) => (t.species === 'hero' ? 'Hero overlay' : 'Standard zombie') },
];

const RARITY_NOTE = {
  common: 'Common: the aura pair is below 90 and the DNA does not end in 99.',
  rare: 'Rare: the aura pair is 90 or higher.',
  hero: 'Hero: the DNA ends in 99, which only an Avenger infection produces.',
};

export function DnaTable({ dna }: { dna: bigint }) {
  const traits = decodeDna(dna);
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <Dna size={20} className="text-green" aria-hidden />
        <h2 className="font-display text-h3 font-bold">DNA breakdown</h2>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Each pair of DNA digits and the trait it selects</caption>
          <thead>
            <tr className="border-b border-line text-label font-display uppercase tracking-[0.08em] text-fg-muted">
              <th scope="col" className="py-2 pr-3 font-medium">Pair</th>
              <th scope="col" className="hidden py-2 pr-3 font-medium sm:table-cell">Digits</th>
              <th scope="col" className="py-2 pr-3 font-medium">Trait</th>
              <th scope="col" className="py-2 font-medium">Variant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ROWS.map((r) => (
              <tr key={r.pair}>
                <td className="py-2.5 pr-3">
                  <span className="inline-block min-w-9 rounded-md bg-raised px-2 py-0.5 text-center font-mono text-[0.8125rem] text-green">
                    {String(dnaPair(dna, r.pair)).padStart(2, '0')}
                  </span>
                </td>
                <td className="hidden py-2.5 pr-3 font-mono text-[0.8125rem] text-fg-muted sm:table-cell">
                  {15 - 2 * r.pair}-{16 - 2 * r.pair}
                </td>
                <td className="py-2.5 pr-3 text-fg-muted">{r.trait}</td>
                <td className="py-2.5 font-medium">{r.variant(traits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-label text-fg-muted">{RARITY_NOTE[rarityOf(dna)]}</p>
    </Card>
  );
}
