import { formatEther } from 'ethers';
import type { Zombie } from '@/lib/types';

export function shortAddress(a: string): string {
  return a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

// Truncates (never rounds up); sub-precision non-zero amounts show as "<0.0001".
export function formatEth(wei: bigint, digits = 4): string {
  const [whole, frac = ''] = formatEther(wei).split('.');
  const trimmed = frac.slice(0, digits).replace(/0+$/, '');
  if (wei > 0n && whole === '0' && trimmed === '') return `<0.${'0'.repeat(Math.max(digits - 1, 0))}1`;
  return trimmed ? `${whole}.${trimmed}` : whole;
}

// 16 digits in groups of 4, separated by thin spaces.
export function formatDna(dna: bigint): string {
  return dna.toString().padStart(16, '0').replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// Both arguments are chain timestamps (seconds). Never Date.now().
export function timeAgo(ts: number, nowTs: number): string {
  const diff = nowTs - ts;
  if (diff < 5) return 'just now';
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function isReady(z: Pick<Zombie, 'readyTime'>, headTs: number | null): boolean {
  return headTs !== null && z.readyTime <= headTs;
}
