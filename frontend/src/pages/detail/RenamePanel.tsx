import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ActionBox, type PanelProps } from './ActionBox';
import { useZombieAction } from './useZombieAction';

export function RenamePanel({ zombie, onDone }: PanelProps) {
  const { tx, gate, act } = useZombieAction(onDone);
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const lowLevel = zombie.level < 2;
  const hint = gate ?? (lowLevel ? `Reach level 2 to rename. This zombie is level ${zombie.level}.` : null);
  const valid = trimmed.length >= 1 && trimmed.length <= 32 && trimmed !== zombie.name;

  async function submit() {
    if (await act(`Rename #${zombie.id}`, (c) => c.changeName(zombie.id, trimmed))) setName('');
  }

  return (
    <ActionBox
      icon={<Pencil size={20} aria-hidden />}
      title="Rename"
      description="Unlocks at level 2. Names are 1 to 32 characters."
      tx={tx.state}
      hint={hint}
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Input
          label="New name"
          value={name}
          maxLength={32}
          disabled={lowLevel}
          autoComplete="off"
          placeholder={zombie.name}
          onChange={(e) => {
            setName(e.target.value);
            tx.reset();
          }}
        />
        <Button type="submit" fullWidth variant="secondary" loading={tx.busy} disabled={!!hint || !valid}>
          Rename zombie
        </Button>
      </form>
    </ActionBox>
  );
}
