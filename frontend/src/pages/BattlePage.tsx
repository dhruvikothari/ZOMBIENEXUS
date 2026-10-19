import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useReducedMotion } from 'motion/react';
import { Shield, Skull, Swords } from 'lucide-react';
import { StatusBanner } from '@/components/layout/StatusBanner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { TxStepper } from '@/components/ui/TxStepper';
import { useBlockTime } from '@/lib/chain';
import { BATTLE_GAS_LIMIT, fetchZombie, parseReceipt, zombieWrite } from '@/lib/contracts';
import { formatDuration, isReady } from '@/lib/format';
import { useAvengers, useZombies } from '@/lib/hooks';
import { PVP_WIN_CHANCE, winChance } from '@/lib/roster';
import type { AppError } from '@/lib/types';
import { useWallet } from '@/lib/wallet';
import { useTx } from '@/lib/tx';
import { Arena, type ArenaPhase } from './battle/Arena';
import { Odds } from './battle/Odds';
import { AvengerPicker, RivalPicker, ZombiePicker } from './battle/Pickers';
import { ResultPanel } from './battle/ResultPanel';
import { isAvenger, opponentName, parseId, readOutcome, type BattleResult, type Fight, type Mode } from './battle/result';

const TABS = [
  { id: 'avengers', label: 'vs Avengers', icon: <Shield /> },
  { id: 'zombies', label: 'vs Zombies', icon: <Skull /> },
];

export default function BattlePage() {
  const { status, address, deployment } = useWallet();
  const [params, setParams] = useSearchParams();
  const tx = useTx();
  const headTs = useBlockTime();
  const zombiesQ = useZombies();
  const avengersQ = useAvengers();
  const reduced = useReducedMotion();
  const arenaRef = useRef<HTMLDivElement>(null);
  const [fight, setFight] = useState<Fight | null>(null);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const mode: Mode = params.get('mode') === 'zombies' ? 'zombies' : 'avengers';
  const me = status === 'ready' && address ? address.toLowerCase() : null;

  const allZombies = zombiesQ.data;
  const mine = useMemo(() => (me ? (allZombies ?? []).filter((z) => z.owner.toLowerCase() === me) : []), [allZombies, me]);
  const rivals = useMemo(
    () =>
      (allZombies ?? [])
        .filter((z) => z.owner.toLowerCase() !== me)
        .sort((a, b) => Number(b.name === 'The Warden') - Number(a.name === 'The Warden') || a.id - b.id),
    [allZombies, me],
  );
  const avengers = avengersQ.data ?? [];

  const zId = parseId(params.get('zombie'));
  const zombie = mine.find((z) => z.id === zId) ?? mine.find((z) => isReady(z, headTs)) ?? null;
  const aId = parseId(params.get('avenger'));
  const tId = parseId(params.get('target'));
  const opponent = mode === 'avengers' ? (avengers.find((a) => a.id === aId) ?? avengers[0] ?? null) : (rivals.find((z) => z.id === tId) ?? rivals[0] ?? null);

  const odds = !opponent ? null : isAvenger(opponent) ? (zombie ? winChance(zombie.level, opponent.power) : null) : PVP_WIN_CHANCE;
  const zombieReady = !!zombie && isReady(zombie, headTs);

  const blocked =
    status !== 'ready'
      ? 'Connect MetaMask on Ganache 1337 to battle.'
      : mine.length === 0
        ? 'Create a zombie first. Every address gets one free zombie.'
        : !zombie
          ? 'All your zombies are cooling down.'
          : !zombieReady
            ? headTs === null
              ? 'Waiting for chain time…'
              : `${zombie.name} is cooling down for ${formatDuration(zombie.readyTime - headTs)}.`
            : !opponent
              ? 'Pick an opponent.'
              : null;

  const st = tx.state.status;
  const phase: ArenaPhase = localError
    ? 'error'
    : result
      ? 'clash'
      : st === 'awaiting-signature'
        ? 'signing'
        : st === 'pending' || st === 'confirmed'
          ? 'pending'
          : st === 'reverted' || st === 'failed' || st === 'rejected'
            ? 'error'
            : 'idle';
  const errorMessage = localError ?? tx.state.error?.message ?? null;

  function setQuery(update: (p: URLSearchParams) => void) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        update(next);
        return next;
      },
      { replace: true },
    );
  }

  function clearBattle() {
    setFight(null);
    setResult(null);
    setLocalError(null);
    tx.reset();
  }

  function pick(key: string, id: number) {
    if (tx.busy) return;
    clearBattle();
    setQuery((p) => p.set(key, String(id)));
  }

  function changeMode(id: string) {
    if (tx.busy) return;
    clearBattle();
    setQuery((p) => {
      p.set('mode', id);
      p.delete('avenger');
      p.delete('target');
    });
  }

  async function startBattle() {
    if (!deployment || !zombie || !opponent || blocked || tx.busy) return;
    const snap: Fight = { mode, zombie, opponent, odds: odds ?? PVP_WIN_CHANCE };
    clearBattle();
    setFight(snap);
    // Pin the choice in the URL so the selection survives the post-battle refetch (the zombie is cooling down afterwards).
    setQuery((p) => {
      p.set('zombie', String(zombie.id));
      p.set(isAvenger(opponent) ? 'avenger' : 'target', String(opponent.id));
    });
    arenaRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });

    const receipt = await tx.run(`Battle: ${zombie.name} vs ${opponentName(opponent)}`, (signer) => {
      const c = zombieWrite(deployment, signer);
      return isAvenger(opponent)
        ? c.attackAvenger(zombie.id, opponent.id, { gasLimit: BATTLE_GAS_LIMIT })
        : c.attack(zombie.id, opponent.id, { gasLimit: BATTLE_GAS_LIMIT });
    });
    if (!receipt) return;

    const outcome = readOutcome(parseReceipt(deployment, receipt), mode);
    if (!outcome) {
      setLocalError('The transaction confirmed but its receipt has no battle event.');
      return;
    }
    const hash = receipt.hash;
    setResult({ ...outcome, after: null, hash });
    fetchZombie(deployment, zombie.id)
      .then((after) => setResult((r) => (r && r.hash === hash ? { ...r, after } : r)))
      .catch(() => undefined); // result panel keeps its skeleton; the event-derived verdict above is already shown
  }

  const oddsCaption = mode === 'avengers' ? 'Win chance' : 'Win chance (fixed PvP)';
  const label =
    phase === 'signing' ? 'Confirm in MetaMask…' : phase === 'pending' ? 'Battle transaction pending…' : 'Battle';
  const load = (q: { data: unknown; error: AppError | null; refetch: () => void }) => ({ initial: q.data === null && !q.error, error: q.data === null ? q.error : null, onRetry: q.refetch });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <h1 className="sr-only">Battle arena</h1>
      <StatusBanner />
      <p className="max-w-2xl text-fg-muted">
        Pick a ready zombie and an opponent. The verdict is decided on-chain; the arena only replays what the receipt says.
      </p>

      <Tabs tabs={TABS} value={mode} onChange={changeMode}>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,1fr)] xl:gap-6">
          <div className="order-1 min-w-0">
            <ZombiePicker
              zombies={mine}
              load={load(zombiesQ)}
              connected={status === 'ready'}
              selectedId={zombie?.id ?? null}
              headTs={headTs}
              locked={tx.busy}
              onSelect={(id) => pick('zombie', id)}
            />
          </div>

          <div className="order-3 min-w-0 xl:order-2">
            <Card className="flex h-full flex-col items-center justify-center gap-5 p-5" glow={phase === 'idle' && !blocked ? 'green' : 'none'}>
              <Odds percent={odds} caption={oddsCaption} />
              <Button size="lg" fullWidth icon={<Swords />} loading={tx.busy} disabled={!!blocked || tx.busy} onClick={startBattle}>
                {label}
              </Button>
              {blocked && !tx.busy && (
                <p className="text-center text-sm text-fg-muted" role="status">
                  {blocked}
                </p>
              )}
              {st !== 'idle' && (
                <div className="w-full">
                  <TxStepper state={tx.state} compact />
                </div>
              )}
            </Card>
          </div>

          <div className="order-2 min-w-0 xl:order-3">
            {mode === 'avengers' ? (
              <AvengerPicker
                avengers={avengers}
                load={load(avengersQ)}
                selectedId={opponent?.id ?? null}
                zombieLevel={zombie?.level ?? null}
                locked={tx.busy}
                onSelect={(id) => pick('avenger', id)}
              />
            ) : (
              <RivalPicker zombies={rivals} load={load(zombiesQ)} selectedId={opponent?.id ?? null} locked={tx.busy} onSelect={(id) => pick('target', id)} />
            )}
          </div>
        </div>
      </Tabs>

      <div ref={arenaRef} className="scroll-mt-24">
        <Arena
          zombie={fight?.zombie ?? zombie}
          opponent={fight?.opponent ?? opponent}
          phase={phase}
          won={result?.won ?? null}
          message={errorMessage}
        />
      </div>

      {fight && result && <ResultPanel fight={fight} result={result} headTs={headTs} onAgain={clearBattle} />}
    </div>
  );
}
