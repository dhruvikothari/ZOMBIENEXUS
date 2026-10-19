import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { shortAddress } from '@/lib/format';

// Works for tx hashes too: anything long gets the 0x1234…abcd treatment.
export function Address({ address, short = true, copy = false }: { address: string; short?: boolean; copy?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the full value stays in the title.
    }
  }

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 align-middle">
      <span className={`font-mono text-[0.8125rem] ${short ? 'truncate' : 'break-all'}`} title={address}>
        {short ? shortAddress(address) : address}
      </span>
      {copy && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          className="relative inline-grid size-6 shrink-0 before:absolute before:-inset-2 before:content-[''] place-items-center rounded-md text-fg-muted transition-colors duration-200 hover:bg-raised hover:text-fg"
        >
          {copied ? <Check className="size-3.5 text-green" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        </button>
      )}
    </span>
  );
}
