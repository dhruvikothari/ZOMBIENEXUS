import { describe, expect, it } from 'vitest';
import { formatDna, formatDuration, formatEth, isReady, shortAddress, timeAgo } from '@/lib/format';

describe('format', () => {
  it('shortAddress', () => {
    expect(shortAddress('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1')).toBe('0x90F8…c9C1');
    expect(shortAddress('0x12')).toBe('0x12');
  });

  it('formatEth truncates and trims', () => {
    expect(formatEth(0n)).toBe('0');
    expect(formatEth(10n ** 18n)).toBe('1');
    expect(formatEth(1_000_000_000_000_000n)).toBe('0.001');
    expect(formatEth(1_999_999_999_999_999_999n)).toBe('1.9999');
    expect(formatEth(1n)).toBe('<0.0001');
  });

  it('formatDna groups of 4 with thin spaces, zero padded', () => {
    expect(formatDna(2521625881949400n)).toBe('2521 6258 8194 9400');
    expect(formatDna(981397381800200n)).toBe('0981 3973 8180 0200');
  });

  it('formatDuration', () => {
    expect(formatDuration(93600)).toBe('1d 2h');
    expect(formatDuration(86400)).toBe('1d 0h');
    expect(formatDuration(3 * 3600 + 12 * 60)).toBe('3h 12m');
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(-5)).toBe('0s');
  });

  it('timeAgo uses the supplied chain time, not Date.now()', () => {
    const chainNow = 4_000_000_000; // far from wall clock
    expect(timeAgo(chainNow, chainNow)).toBe('just now');
    expect(timeAgo(chainNow - 30, chainNow)).toBe('30s ago');
    expect(timeAgo(chainNow - 300, chainNow)).toBe('5m ago');
    expect(timeAgo(chainNow - 7200, chainNow)).toBe('2h ago');
    expect(timeAgo(chainNow - 3 * 86400, chainNow)).toBe('3d ago');
  });

  it('isReady compares readyTime to chain head time', () => {
    expect(isReady({ readyTime: 100 }, 100)).toBe(true);
    expect(isReady({ readyTime: 101 }, 100)).toBe(false);
    expect(isReady({ readyTime: 0 }, null)).toBe(false);
  });
});
