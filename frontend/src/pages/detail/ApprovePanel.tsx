import { useState } from 'react';
import { isAddress } from 'ethers';
import { UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ActionBox, type PanelProps } from './ActionBox';
import { useZombieAction } from './useZombieAction';

export function ApprovePanel({ zombie, onDone }: PanelProps) {
  const { tx, gate, act } = useZombieAction(onDone);
  const [to, setTo] = useState('');
  const target = to.trim();
  const invalid = target !== '' && !isAddress(target);

  async function submit() {
    if (await act(`Approve #${zombie.id}`, (c) => c.approve(target, zombie.id))) setTo('');
  }

  return (
    <ActionBox
      icon={<UserCheck size={20} aria-hidden />}
      title="Approve"
      description="Let another address transfer this zombie for you. The approval clears when the zombie moves."
      tx={tx.state}
      hint={gate}
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Input
          label="Approved address"
          mono
          value={to}
          placeholder="0x…"
          autoComplete="off"
          spellCheck={false}
          error={invalid ? 'Enter a valid 0x address.' : undefined}
          onChange={(e) => {
            setTo(e.target.value);
            tx.reset();
          }}
        />
        <Button type="submit" fullWidth variant="secondary" loading={tx.busy} disabled={!!gate || target === '' || invalid}>
          Approve address
        </Button>
      </form>
    </ActionBox>
  );
}
