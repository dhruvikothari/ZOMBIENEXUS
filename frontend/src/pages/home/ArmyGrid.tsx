import { AnimatePresence, motion } from 'motion/react';
import { Swords } from 'lucide-react';
import { Link } from 'react-router';
import { ZombieCard } from '@/components/art/ZombieCard';
import { Button, buttonClass } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { isReady } from '@/lib/format';
import type { Zombie } from '@/lib/types';
import { EASE } from './rise';

export function ArmyGrid({ zombies, headTs }: { zombies: Zombie[]; headTs: number | null }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3" aria-label="Your zombies">
      <AnimatePresence mode="popLayout" initial>
        {zombies.map((z, i) => {
          const ready = isReady(z, headTs);
          return (
            <motion.li
              key={z.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.36, delay: Math.min(i, 8) * 0.05, ease: EASE }}
            >
              <ZombieCard
                zombie={z}
                headTs={headTs}
                actions={
                  <div className="grid w-full grid-cols-2 gap-2">
                    <Link to={`/zombie/${z.id}`} className={buttonClass('primary', 'md', true)}>
                      Details
                    </Link>
                    {ready ? (
                      <Link
                        to={`/battle?mode=avengers&zombie=${z.id}`}
                        className={`${buttonClass('secondary', 'md', true)} gap-2`}
                      >
                        <Swords size={16} aria-hidden /> Battle
                      </Link>
                    ) : (
                      <Button
                        fullWidth
                        variant="secondary"
                        icon={<Swords size={16} aria-hidden />}
                        disabled
                        title="Still cooling down"
                      >
                        Battle
                      </Button>
                    )}
                  </div>
                }
              />
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}

export function ArmySkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} rounded="xl" className="h-[540px]" />
      ))}
    </div>
  );
}
