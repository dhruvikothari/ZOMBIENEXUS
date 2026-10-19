import { parseEther } from 'ethers';
import { ChevronsUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ActionBox, type PanelProps } from './ActionBox';
import { useZombieAction } from './useZombieAction';

const FEE = parseEther('0.001');

export function LevelUpPanel({ zombie, onDone }: PanelProps) {
  const { tx, gate, act } = useZombieAction(onDone);
  return (
    <ActionBox
      icon={<ChevronsUp size={20} aria-hidden />}
      title="Level up"
      description="Fee 0.001 ETH. The contract lets any address level any zombie (original rule)."
      tx={tx.state}
      hint={gate}
    >
      <Button
        fullWidth
        loading={tx.busy}
        disabled={!!gate}
        onClick={() => act(`Level up #${zombie.id}`, (c) => c.levelUp(zombie.id, { value: FEE }))}
      >
        Level up for 0.001 ETH
      </Button>
    </ActionBox>
  );
}
