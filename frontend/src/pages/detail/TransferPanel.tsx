import { useState } from 'react';
import { ZeroAddress, isAddress } from 'ethers';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ActionBox, type PanelProps } from './ActionBox';
import { useZombieAction } from './useZombieAction';

export function TransferPanel({ zombie, onDone }: PanelProps) {
  const { tx, gate, act, address } = useZombieAction(onDone);
  const [to, setTo] = useState('');
  const [confirming, setConfirming] = useState(false);
  const target = to.trim();

  let error: string | undefined;
  if (target !== '') {
    if (!isAddress(target)) error = 'Enter a valid 0x address.';
    else if (target.toLowerCase() === ZeroAddress) error = 'Cannot transfer to the zero address.';
    else if (target.toLowerCase() === address?.toLowerCase()) error = 'You already own this zombie.';
  }

  async function confirm() {
    setConfirming(false);
    if (!address) return;
    if (await act(`Transfer #${zombie.id}`, (c) => c.transferFrom(address, target, zombie.id))) setTo('');
  }

  return (
    <ActionBox
      icon={<Send size={20} aria-hidden />}
      title="Transfer"
      description="Send this zombie to another address. You will be asked to confirm first."
      tx={tx.state}
      hint={gate}
    >
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setConfirming(true);
        }}
      >
        <Input
          label="Recipient address"
          mono
          value={to}
          placeholder="0x…"
          autoComplete="off"
          spellCheck={false}
          error={error}
          onChange={(e) => {
            setTo(e.target.value);
            tx.reset();
          }}
        />
        <Button type="submit" fullWidth variant="secondary" loading={tx.busy} disabled={!!gate || target === '' || !!error}>
          Review transfer
        </Button>
      </form>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Confirm transfer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={<Send size={16} aria-hidden />} onClick={() => void confirm()}>
              Transfer #{zombie.id}
            </Button>
          </>
        }
      >
        <p className="text-fg-muted">
          Transfer #{zombie.id} to <span className="break-all font-mono text-[0.8125rem] text-fg">{target}</span>? This
          cannot be undone.
        </p>
      </Modal>
    </ActionBox>
  );
}
