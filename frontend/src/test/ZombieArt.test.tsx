import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ZombieArt } from '@/components/art/ZombieArt';
import { decodeDna } from '@/lib/dna';

const HERO = 6212148620395099n;
const RARE = 9343918324261100n;
const COMMON = 2521625881949400n;

describe('ZombieArt', () => {
  afterEach(cleanup);

  it('renders an svg with role img and a label', () => {
    render(<ZombieArt dna={COMMON} level={5} label="Rotfang, common zombie, level 5" />);
    const svg = screen.getByRole('img');
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.getAttribute('aria-label')).toBeTruthy();
    expect(svg.getAttribute('viewBox')).toBe('0 0 200 240');
  });

  it.each([COMMON, RARE, HERO, 981397381800200n])('data attributes match decodeDna(%s)', (dna) => {
    render(<ZombieArt dna={dna} />);
    const svg = screen.getByRole('img');
    const t = decodeDna(dna);
    expect(svg.getAttribute('data-head')).toBe(String(t.head));
    expect(svg.getAttribute('data-skin')).toBe(String(t.skin));
    expect(svg.getAttribute('data-eyes')).toBe(String(t.eyes));
    expect(svg.getAttribute('data-mouth')).toBe(String(t.mouth));
    expect(svg.getAttribute('data-clothes')).toBe(String(t.clothes));
    expect(svg.getAttribute('data-accessory')).toBe(String(t.accessory));
    expect(svg.getAttribute('data-aura')).toBe(String(t.aura));
    expect(svg.getAttribute('data-species')).toBe(t.species);
  });

  it('hero overlay only for DNA ending in 99', () => {
    const { container, rerender } = render(<ZombieArt dna={HERO} />);
    expect(container.querySelector('[data-layer="hero-overlay"]')).not.toBeNull();
    expect(screen.getByRole('img').getAttribute('data-species')).toBe('hero');
    rerender(<ZombieArt dna={RARE} />);
    expect(container.querySelector('[data-layer="hero-overlay"]')).toBeNull();
    expect(screen.getByRole('img').getAttribute('data-species')).toBe('zombie');
    rerender(<ZombieArt dna={COMMON} />);
    expect(container.querySelector('[data-layer="hero-overlay"]')).toBeNull();
  });

  it('is deterministic for the same DNA', () => {
    const a = render(<ZombieArt dna={RARE} level={3} />).container.innerHTML;
    cleanup();
    const b = render(<ZombieArt dna={RARE} level={3} />).container.innerHTML;
    const noIds = (h: string) => h.replace(/r\d+-/g, 'r-'); // React useId prefix differs per mount
    expect(noIds(b)).toBe(noIds(a));
  });
});
