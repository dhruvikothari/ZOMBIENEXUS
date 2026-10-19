import { Dna, Swords } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

function Tile({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-lg border border-line bg-panel-2 p-4">
      <span aria-hidden className="mt-0.5 text-purple">
        {icon}
      </span>
      <div>
        <h2 className="font-display text-h3 text-fg">{title}</h2>
        <p className="mt-1 text-fg-muted">{children}</p>
      </div>
    </div>
  );
}

export function AvengersHeader() {
  return (
    <Card glow="purple" className="p-6 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:items-center">
        <div>
          <p className="text-label font-display font-medium uppercase tracking-[0.08em] text-purple">
            NPC opponents / DNA donors
          </p>
          <h1 className="mt-2 font-display text-h1 font-bold text-fg sm:text-display">
            Heroes to fight.
            <br />
            <span className="text-gold">Genes to steal.</span>
          </h1>
          <p className="mt-3 max-w-prose text-fg-muted">
            Avengers live in their own contract. They are NPCs: opponents for your army and DNA donors for your
            zombies. Anyone can summon a new one.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <Tile icon={<Swords size={20} />} title="Battle">
            Win to level up your zombie. Lose and it only rests. Higher power means worse odds.
          </Tile>
          <Tile icon={<Dna size={20} />} title="Infect">
            Feed a ready zombie to an Avenger to splice the genes. The child is a hero zombie with DNA ending in 99.
          </Tile>
        </div>
      </div>
    </Card>
  );
}
