export const ROSTER: { index: number; name: string; genes: bigint; color: string; accent: string }[] = [
  { index: 0, name: 'Iron Man', genes: 7319028465120486n, color: '#C8323C', accent: '#E3B341' },
  { index: 1, name: 'Captain America', genes: 1846203957461125n, color: '#2C4A8C', accent: '#C23B3B' },
  { index: 2, name: 'Thor', genes: 9902671358840708n, color: '#8A96A8', accent: '#B0302A' },
  { index: 3, name: 'Hulk', genes: 4471935026689137n, color: '#4E9A3A', accent: '#5B3A8C' },
  { index: 4, name: 'Black Widow', genes: 2638470915573364n, color: '#1B1D22', accent: '#D23B3B' },
  { index: 5, name: 'Hawkeye', genes: 5560218743309963n, color: '#6A3FA0', accent: '#1B1D22' },
];

export const heroIndex = (genes: bigint): number => Number(genes % 6n);

export const heroName = (genes: bigint): string => ROSTER[heroIndex(genes)].name;

export const powerOf = (genes: bigint): number => Number(genes % 10n) + 1;

export const winChance = (level: number, power: number): number =>
  Math.min(90, Math.max(10, 50 + 5 * level - 5 * power));

export const PVP_WIN_CHANCE = 71;

export function randomGenes(): bigint {
  const [hi, lo] = crypto.getRandomValues(new Uint32Array(2));
  return ((BigInt(hi) << 32n) | BigInt(lo)) % 10n ** 16n;
}
