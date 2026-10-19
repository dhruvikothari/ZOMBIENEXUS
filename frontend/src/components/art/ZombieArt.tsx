import { useId, type CSSProperties, type ReactNode } from 'react';
import { SKIN, decodeDna, levelTier, rarityOf, type Traits } from '@/lib/dna';

/** Linear mix of two #rrggbb colours, t = 0..1. */
export function mix(a: string, b: string, t: number): string {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = (i: number) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t).toString(16).padStart(2, '0');
  return `#${c(0)}${c(1)}${c(2)}`;
}

const AURA: [string, string][] = [
  ['#39FF88', '#1FA85A'],
  ['#8E7CC3', '#CBB8FF'],
  ['#2DE0C8', '#5CC8FF'],
  ['#FF8A3D', '#FFD27A'],
  ['#C07CFF', '#5CC8FF'],
];

const HEADS = [
  'M100 44 C128 44 148 66 148 96 C148 124 128 142 100 142 C72 142 52 124 52 96 C52 66 72 44 100 44Z',
  'M58 58 Q58 44 72 44 L128 44 Q142 44 142 58 L142 112 Q142 142 112 144 L88 144 Q58 142 58 112Z',
  'M100 28 C128 28 143 56 143 90 C143 116 134 130 124 138 L112 146 L88 146 L76 138 C66 130 57 116 57 90 C57 56 72 28 100 28Z',
  'M100 42 C113 38 124 43 130 50 C142 48 151 62 147 76 C155 90 151 106 143 116 C141 134 123 145 107 142 C94 148 80 145 70 139 C54 135 47 117 54 105 C46 91 50 75 58 67 C58 53 72 42 86 46 C91 43 95 42 100 42Z',
];
const EAR_X = [52, 58, 57, 50];
const TORSO = 'M22 240 L22 204 C22 174 42 160 72 153 L128 153 C158 160 178 174 178 204 L178 240Z';

type P = { r: (n: string) => string; skin: string; skinD: string; aura: [string, string]; t: Traits };

function Stitch({ x1, y1, x2, y2, n = 4, color = '#2a2420' }: { x1: number; y1: number; x2: number; y2: number; n?: number; color?: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * 3.6;
  const ny = (dx / len) * 3.6;
  return (
    <g stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {Array.from({ length: n }, (_, i) => {
        const f = (i + 0.5) / n;
        const cx = x1 + dx * f;
        const cy = y1 + dy * f;
        return <line key={i} x1={cx - nx} y1={cy - ny} x2={cx + nx} y2={cy + ny} />;
      })}
    </g>
  );
}

/* ---------------------------------------------------------------- aura */
function Aura({ p }: { p: P }) {
  const [c1, c2] = p.aura;
  return (
    <g>
      <circle cx="100" cy="124" r="100" fill={p.r('aura')} />
      {p.t.aura === 0 && (
        <g fill="none" stroke={c2} strokeWidth="1.4">
          {[[38, 72, 7], [162, 86, 5], [30, 148, 4], [170, 158, 8], [148, 36, 3.5], [54, 36, 4.5], [20, 108, 3]].map(([x, y, rad]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r={rad} fill={c1} fillOpacity="0.18" />
              <circle cx={x - rad * 0.3} cy={y - rad * 0.3} r={rad * 0.25} fill="#fff" fillOpacity="0.7" stroke="none" />
            </g>
          ))}
        </g>
      )}
      {p.t.aura === 1 && (
        <g filter={p.r('blur')}>
          <ellipse cx="46" cy="76" rx="36" ry="14" fill={c1} fillOpacity="0.55" />
          <ellipse cx="156" cy="100" rx="34" ry="16" fill={c2} fillOpacity="0.4" />
          <ellipse cx="52" cy="176" rx="34" ry="14" fill={c2} fillOpacity="0.35" />
          <ellipse cx="152" cy="190" rx="38" ry="14" fill={c1} fillOpacity="0.5" />
          <ellipse cx="100" cy="30" rx="44" ry="12" fill={c1} fillOpacity="0.4" />
        </g>
      )}
      {p.t.aura === 2 && (
        <g fill="none">
          <circle cx="100" cy="120" r="98" stroke={c1} strokeWidth="1" strokeOpacity="0.6" />
          <circle cx="100" cy="120" r="88" stroke={c1} strokeWidth="2.4" strokeDasharray="2 9" strokeLinecap="round" />
          <circle cx="100" cy="120" r="76" stroke={c2} strokeWidth="1.6" strokeOpacity="0.8" />
          <circle cx="100" cy="120" r="66" stroke={c1} strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="14 6" />
          {[0, 90, 180, 270].map((a) => (
            <circle key={a} cx={100 + 88 * Math.cos((a * Math.PI) / 180)} cy={120 + 88 * Math.sin((a * Math.PI) / 180)} r="3.4" fill={c2} />
          ))}
        </g>
      )}
      {p.t.aura === 3 && (
        <g>
          <g filter={p.r('soft')} fillOpacity="0.55">
            <path d="M26 206 C14 164 44 150 36 108 C58 134 66 114 58 74 C84 108 86 140 78 168 Z" fill={c1} />
            <path d="M174 206 C186 164 156 150 164 108 C142 134 134 114 142 74 C116 108 114 140 122 168 Z" fill={c1} />
          </g>
          {[[44, 60, 2.6], [158, 52, 2.2], [24, 128, 2], [176, 124, 2.8], [66, 24, 1.8], [138, 22, 2.4], [36, 180, 1.8], [166, 184, 2.2]].map(([x, y, rad]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={rad} fill={c2} filter={p.r('glow')} />
          ))}
        </g>
      )}
      {p.t.aura === 4 && (
        <g fill="none" strokeLinecap="round">
          <path d="M100 120 C100 100 125 95 135 112 C148 135 120 160 92 150 C58 138 52 92 82 68 C112 44 156 62 164 100 C172 142 140 186 98 184" stroke={c1} strokeWidth="3" strokeOpacity="0.85" />
          <path d="M100 120 C100 100 125 95 135 112 C148 135 120 160 92 150 C58 138 52 92 82 68 C112 44 156 62 164 100 C172 142 140 186 98 184" stroke={c2} strokeWidth="2" strokeOpacity="0.7" transform="rotate(180 100 120)" />
          <circle cx="100" cy="120" r="3" fill="#fff" fillOpacity="0.6" stroke="none" />
        </g>
      )}
    </g>
  );
}

/* ---------------------------------------------------------------- clothes (clipped to torso) */
function Clothes({ p }: { p: P }) {
  const { skinD } = p;
  switch (p.t.clothes) {
    case 0:
      return (
        <>
          <path d="M60 152 L78 152 Q100 188 122 152 L140 152 L147 198 L154 240 L46 240 L53 198Z" fill="#5E6573" />
          <path d="M60 152 L78 152 Q100 188 122 152 L140 152 L147 198 L154 240 L46 240 L53 198Z" fill={p.r('rib')} />
          <path d="M78 152 Q100 188 122 152" fill="none" stroke="#3B414D" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M70 204 l9 -7 l4 11 l-7 9z" fill={skinD} />
          <path d="M118 218 l11 -9 l4 13 l-9 7z" fill={skinD} />
          <path d="M72 238 l5 -9 l6 9 l7 -8 l6 8 l8 -9 l5 9 l8 -8 l6 8 l7 -7 l6 8z" fill={skinD} fillOpacity="0.9" />
          <ellipse cx="90" cy="224" rx="18" ry="8" fill="#2a1d15" fillOpacity="0.35" />
          <Stitch x1={124} y1={180} x2={136} y2={196} n={3} color="#262a33" />
        </>
      );
    case 1:
      return (
        <>
          <path d={TORSO} fill="#2B2F3A" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x="0" y={158 + i * 14} width="200" height="7" fill="#C8574A" />
          ))}
          <path d="M78 152 Q100 182 122 152Z" fill={p.r('neck')} />
          <path d="M77 151 Q100 186 123 151" fill="none" stroke="#1c1f27" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M36 196 L48 206 L40 216z" fill={skinD} fillOpacity="0.55" />
        </>
      );
    case 2:
      return (
        <>
          <path d={TORSO} fill="#E8EDF2" />
          <path d="M82 152 L118 152 L110 240 L90 240Z" fill="#2E8C8A" />
          <path d="M82 152 L118 152 L100 190Z" fill="#256F6E" />
          <path d="M82 152 L66 156 L86 208 L98 192Z" fill="#D2DAE3" stroke="#aab4c0" strokeWidth="1" />
          <path d="M118 152 L134 156 L114 208 L102 192Z" fill="#D2DAE3" stroke="#aab4c0" strokeWidth="1" />
          <rect x="128" y="198" width="24" height="22" rx="2" fill="#DAE1E8" stroke="#aab4c0" />
          <line x1="140" y1="190" x2="140" y2="204" stroke="#3A82D6" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="104" cy="226" r="2.4" fill="#aab4c0" />
          <path d="M44 190 C46 210 46 226 44 240 M156 190 C154 210 154 226 156 240" stroke="#b6c0cc" strokeWidth="1.2" fill="none" />
          <ellipse cx="62" cy="228" rx="9" ry="5" fill="#7A2A2A" fillOpacity="0.4" />
        </>
      );
    case 3:
      return (
        <>
          <path d={TORSO} fill="#2A2522" />
          <path d="M84 152 L116 152 L108 240 L92 240Z" fill="#8A8F99" />
          <path d="M84 152 L116 152 L100 182Z" fill="#6c717a" />
          <path d="M84 152 L56 158 L70 212 L98 180Z" fill="#3E322C" stroke="#17120f" strokeWidth="1.4" />
          <path d="M116 152 L144 158 L130 212 L102 180Z" fill="#3E322C" stroke="#17120f" strokeWidth="1.4" />
          <line x1="100" y1="184" x2="100" y2="240" stroke="#B9A06A" strokeWidth="2.4" strokeDasharray="2 2.2" />
          <rect x="30" y="160" width="26" height="9" rx="3" fill="#1b1613" transform="rotate(-14 43 164)" />
          <rect x="144" y="160" width="26" height="9" rx="3" fill="#1b1613" transform="rotate(14 157 164)" />
          {[[66, 176], [134, 176], [78, 198], [122, 198]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill="#C9B27A" />
          ))}
          <path d="M122 212 L150 204" stroke="#B9A06A" strokeWidth="1.6" strokeDasharray="2 2" />
          <path d="M34 196 Q54 176 76 172" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    case 4:
      return (
        <>
          <path d={TORSO} fill="#59647A" />
          <path d="M54 214 L146 214 L156 240 L44 240Z" fill="#4A5468" stroke="#323a49" strokeWidth="1.4" />
          <line x1="100" y1="214" x2="100" y2="240" stroke="#323a49" strokeWidth="1.2" />
          <ellipse cx="100" cy="160" rx="34" ry="15" fill="#3E4655" />
          <ellipse cx="100" cy="158" rx="22" ry="9" fill={p.r('neck')} />
          <path d="M88 168 L85 200 M112 168 L115 196" stroke="#E8ECF1" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <circle cx="85" cy="202" r="2.6" fill="#C7CDD6" />
          <circle cx="115" cy="198" r="2.6" fill="#C7CDD6" />
          <path d="M30 188 Q36 220 34 240 M170 188 Q164 220 166 240" fill="none" stroke="#3a4352" strokeWidth="2" />
        </>
      );
    default:
      return (
        <>
          <path d={TORSO} fill="#222C48" />
          <path d="M82 152 L118 152 L100 208Z" fill="#EEF1F5" />
          <path d="M82 152 L62 160 L82 220 L100 208Z" fill="#2E3A5C" stroke="#141a2c" strokeWidth="1.4" />
          <path d="M118 152 L138 160 L118 220 L100 208Z" fill="#2E3A5C" stroke="#141a2c" strokeWidth="1.4" />
          <path d="M94 158 L106 158 L104 168 L96 168Z" fill="#B02A37" />
          <path d="M96 168 L104 168 L109 206 L100 216 L91 206Z" fill="#B02A37" />
          <path d="M100 172 L100 210" stroke="#fff" strokeOpacity="0.2" strokeWidth="2" />
          <path d="M134 190 L148 190 L141 182Z" fill="#fff" />
          <circle cx="104" cy="224" r="2" fill="#0f1424" />
        </>
      );
  }
}

/* ---------------------------------------------------------------- eyes */
const EYE_X = [78, 122];
const EYE_Y = 96;

function OneEye({ p, side }: { p: P; side: 1 | -1 }) {
  // Base drawing is the left eye (outer corner toward -x); the right eye is mirrored.
  const { skin, skinD } = p;
  switch (p.t.eyes) {
    case 0:
      return (
        <>
          <ellipse cx="0" cy="0" rx="13" ry="13" fill={skinD} fillOpacity="0.35" />
          <ellipse cx="0" cy="0" rx="10" ry="11" fill="#090B0A" />
          <ellipse cx="0" cy="1" rx="7" ry="8" fill={p.r('hollow')} />
          <circle cx="-3" cy="-4" r="1.5" fill="#fff" fillOpacity="0.5" />
        </>
      );
    case 1:
      return side === 1 ? (
        <>
          <ellipse cx="0" cy="0" rx="11.5" ry="11.5" fill={p.r('eyeball')} stroke={skinD} strokeWidth="1.4" />
          <path d="M-10 -2 L-4 0 M-8 6 L-3 3 M8 -6 L4 -3" stroke="#C0392B" strokeOpacity="0.65" strokeWidth="0.9" fill="none" />
          <circle cx="1" cy="1" r="5.6" fill="#A8CC3A" />
          <circle cx="1" cy="1" r="2.8" fill="#10140a" />
          <circle cx="-1" cy="-1.5" r="1.4" fill="#fff" />
        </>
      ) : (
        <>
          <ellipse cx="0" cy="1" rx="8" ry="6.4" fill="#E8E2A0" stroke={skinD} strokeWidth="1.4" />
          <circle cx="-1.5" cy="2" r="3.4" fill="#7A2E2E" />
          <circle cx="-1.5" cy="2" r="1.5" fill="#120808" />
          <path d="M-9 -4 Q0 -9 9 -3" fill="none" stroke={skinD} strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
    case 2:
      return (
        <g transform="rotate(14)">
          <ellipse cx="0" cy="0" rx="12" ry="7.5" fill="#06100b" />
          <g filter={p.r('glow')}>
            <path d="M-10 0 Q0 -6 10 0 Q0 5 -10 0Z" fill="#39FF88" />
          </g>
          <path d="M-7 0 Q0 -2.4 7 0 Q0 2 -7 0Z" fill="#E9FFF2" />
        </g>
      );
    case 3:
      return (
        <>
          <ellipse cx="0" cy="1" rx="11" ry="8" fill={mix(skin, '#000000', 0.38)} />
          <path d="M-5.6 -4 L5.6 6 M5.6 -4 L-5.6 6" stroke="#1c1714" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M-9 -1 L-6 1 M9 -1 L6 1" stroke="#1c1714" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case 4:
      return (
        <>
          <ellipse cx="0" cy="1" rx="10.5" ry="8.5" fill={p.r('eyeball')} stroke={skinD} strokeWidth="1.2" />
          <circle cx="1" cy="3" r="5" fill="#9DBB4B" />
          <circle cx="1" cy="3.4" r="2.2" fill="#0d1008" />
          <circle cx="-0.6" cy="1.6" r="1" fill="#fff" fillOpacity="0.85" />
          <g clipPath={p.r('eyeclip')}>
            <path d="M-14 -14 L14 -14 L14 -5 L-14 2Z" fill={mix(skin, '#000000', 0.3)} />
          </g>
          <path d="M-12 1.6 L12 -5" stroke={skinD} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M-9 11 Q0 15 9 11" fill="none" stroke={skinD} strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    default:
      return (
        <>
          <ellipse cx="0" cy="0" rx="9.6" ry="8.4" fill={p.r('eyeball')} stroke={skinD} strokeWidth="1.2" />
          <circle cx="1.5" cy="0.6" r="4.4" fill="#E0B53A" />
          <circle cx="1.5" cy="0.6" r="2" fill="#140f06" />
          <circle cx="0" cy="-1.6" r="1" fill="#fff" />
        </>
      );
  }
}

function Eyes({ p }: { p: P }) {
  return (
    <g>
      {EYE_X.map((x, i) => (
        <g key={x} transform={`translate(${x} ${EYE_Y}) scale(${i === 0 ? 1 : -1} 1)`}>
          <OneEye p={p} side={i === 0 ? 1 : -1} />
        </g>
      ))}
      {p.t.eyes === 5 && (
        <g>
          <ellipse cx="100" cy="75" rx="7.4" ry="6.6" fill={p.skinD} fillOpacity="0.4" />
          <g filter={p.r('glow')}>
            <ellipse cx="100" cy="75" rx="5.8" ry="5.2" fill="#FFD65C" />
          </g>
          <ellipse cx="100" cy="75" rx="1.3" ry="4" fill="#2a1a00" />
        </g>
      )}
    </g>
  );
}

/* ---------------------------------------------------------------- mouth */
const MOUTH_CLIPS = [
  '',
  'M78 124 Q100 120 122 124 Q122 142 100 144 Q78 142 78 124Z',
  'M84 126 Q100 124 118 128 Q116 138 100 139 Q86 138 84 126Z',
  'M76 122 Q100 128 124 122 Q120 144 100 144 Q80 144 76 122Z',
  '',
];

function Mouth({ p }: { p: P }) {
  const { skinD } = p;
  const d = MOUTH_CLIPS[p.t.mouth];
  const cid = p.r('mouthclip').slice(5, -1);
  const teeth = '#EFE8C8';
  return (
    <g>
      {d && (
        <clipPath id={cid}>
          <path d={d} />
        </clipPath>
      )}
      {p.t.mouth === 0 && (
        <g>
          <path d="M80 128 Q100 132 120 128" fill="none" stroke="#2a1d1a" strokeWidth="2.6" strokeLinecap="round" />
          {Array.from({ length: 7 }, (_, i) => {
            const x = 86 + i * 4.7;
            const y = 130 - 2 * ((x - 100) / 20) ** 2;
            return <line key={i} x1={x} y1={y - 5} x2={x} y2={y + 5} stroke="#2a1d1a" strokeWidth="1.5" strokeLinecap="round" />;
          })}
        </g>
      )}
      {p.t.mouth === 1 && (
        <g>
          <path d={d} fill="#1a0b0d" stroke={skinD} strokeWidth="1.4" />
          <g clipPath={`url(#${cid})`}>
            <ellipse cx="100" cy="142" rx="14" ry="6" fill="#7A2430" />
            <path d="M78 124 L86 124 L88 134 L93 124 L99 124 L101 136 L106 124 L112 124 L115 132 L119 124 L122 124 L122 120 L78 120Z" fill={teeth} stroke="#8a7f5a" strokeWidth="0.6" />
            <path d="M84 146 L89 136 L94 146 L100 135 L106 146 L111 137 L116 146Z" fill={teeth} stroke="#8a7f5a" strokeWidth="0.6" />
          </g>
        </g>
      )}
      {p.t.mouth === 2 && (
        <g>
          <path d={d} fill="#1a0b0d" stroke={skinD} strokeWidth="1.4" />
          <g clipPath={`url(#${cid})`}>
            <rect x="95" y="124" width="6" height="9" rx="1" fill={teeth} />
            <rect x="102" y="125" width="6" height="8" rx="1" fill={teeth} />
            <ellipse cx="104" cy="140" rx="11" ry="5" fill="#8A2D3C" />
          </g>
          <path d="M112 137 C114 145 110 151 111 158" fill="none" stroke="#D2F5DD" strokeOpacity="0.8" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="111" cy="160" rx="2.8" ry="3.6" fill="#D2F5DD" fillOpacity="0.85" />
          <circle cx="110" cy="159" r="0.9" fill="#fff" />
        </g>
      )}
      {p.t.mouth === 3 && (
        <g>
          <path d={d} fill="#1a0b0d" stroke={skinD} strokeWidth="1.4" />
          <g clipPath={`url(#${cid})`}>
            <path d="M84 138 Q100 148 116 138 L116 146 L84 146Z" fill="#7A2430" fillOpacity="0.8" />
            {[0, 1, 3, 4, 5].map((i) => (
              <rect key={i} x={79 + i * 7.6} y="122" width="6.4" height="10" rx="1.4" fill={teeth} stroke="#8a7f5a" strokeWidth="0.5" />
            ))}
            {[0, 1, 2, 4].map((i) => (
              <rect key={i} x={86 + i * 7} y="135" width="6" height="7" rx="1.2" fill={mix(teeth, '#000000', 0.25)} />
            ))}
          </g>
        </g>
      )}
      {p.t.mouth === 4 && (
        <g fill="none" strokeLinecap="round">
          <path d="M82 138 Q100 122 118 138" stroke="#2a1d1a" strokeWidth="3.4" />
          <path d="M84 135 Q100 120 116 135" stroke={mix(p.skin, '#ffffff', 0.25)} strokeOpacity="0.55" strokeWidth="1.4" />
          <path d="M78 134 L82 140 M122 134 L118 140" stroke={skinD} strokeWidth="1.6" />
          <path d="M96 144 Q100 146 104 144" stroke={skinD} strokeOpacity="0.7" strokeWidth="1.6" />
        </g>
      )}
    </g>
  );
}

/* ---------------------------------------------------------------- accessories */
function Accessory({ p }: { p: P }) {
  switch (p.t.accessory) {
    case 0:
      return (
        <g stroke="#2b2118" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.8">
          <path d="M90 46 Q88 38 92 33 M100 44 Q101 35 98 29 M110 46 Q113 39 109 34 M80 50 Q76 44 78 39" />
        </g>
      );
    case 1:
      return (
        <g>
          <path d="M52 72 C50 32 76 22 100 22 C124 22 150 32 148 72 L148 74 Q100 58 52 74Z" fill={p.r('helmet')} stroke="#1f2a1d" strokeWidth="2" />
          <path d="M60 52 C68 34 84 28 100 28" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
          <path d="M52 66 Q100 52 148 66" fill="none" stroke="#2e3b2c" strokeWidth="4" />
          <line x1="100" y1="22" x2="100" y2="54" stroke="#2e3b2c" strokeWidth="3" />
          <rect x="46" y="44" width="108" height="9" rx="4.5" fill="#222a22" />
          {[80, 120].map((x) => (
            <g key={x}>
              <circle cx={x} cy="48.5" r="13" fill="#38433a" stroke="#14180f" strokeWidth="2" />
              <circle cx={x} cy="48.5" r="9.4" fill={p.r('lens')} />
              <path d={`M${x - 6} ${44} Q${x - 2} ${40} ${x + 3} ${41}`} fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          ))}
        </g>
      );
    case 2:
      return (
        <g>
          <path d="M54 66 C54 38 76 24 100 24 C124 24 146 38 146 66 Q100 58 54 66Z" fill={p.r('hat')} stroke="#050607" strokeWidth="2" />
          <path d="M30 66 Q50 48 66 58 L134 58 Q150 48 170 66 Q100 80 30 66Z" fill={p.r('hat')} stroke="#050607" strokeWidth="2" />
          <path d="M34 66 Q100 78 166 66" fill="none" stroke="#C9A24C" strokeWidth="2" />
          <path d="M70 36 Q86 28 100 28" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
          <g transform="translate(100 46)" fill="#E9E2CF">
            <ellipse cx="0" cy="-2" rx="6.6" ry="6" />
            <rect x="-3.4" y="2.6" width="6.8" height="4" rx="1" />
            <circle cx="-2.6" cy="-2.4" r="1.6" fill="#0b0c0e" />
            <circle cx="2.6" cy="-2.4" r="1.6" fill="#0b0c0e" />
            <path d="M-11 6 L11 -10 M11 6 L-11 -10" stroke="#E9E2CF" strokeWidth="2.2" strokeLinecap="round" transform="scale(0.9)" />
          </g>
        </g>
      );
    case 3:
      return (
        <g>
          <path d="M54 68 C52 42 76 32 106 32 C132 32 150 46 146 68 Q100 58 54 68Z" fill={p.r('cap')} stroke="#1d150e" strokeWidth="2" />
          <path d="M104 62 Q150 56 170 72 Q140 76 106 70Z" fill={mix('#8A6A44', '#000000', 0.2)} stroke="#1d150e" strokeWidth="2" />
          <path d="M60 50 Q74 38 96 37" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" />
          <path d="M70 40 Q100 52 140 42 M60 54 Q100 66 148 54" fill="none" stroke="#00000033" strokeWidth="1" />
          <circle cx="104" cy="33" r="3" fill="#6b4f33" stroke="#1d150e" strokeWidth="1.2" />
        </g>
      );
    case 4:
      return (
        <g>
          <path d="M52 74 C52 42 76 33 100 33 C124 33 148 42 148 74 Q100 58 52 74Z" fill="#C0392B" stroke="#4a130e" strokeWidth="2" />
          <path d="M52 70 Q100 54 148 70" fill="none" stroke="#7a1f16" strokeWidth="3" />
          <g fill="#fff" fillOpacity="0.8">
            {[[72, 52], [88, 44], [108, 44], [126, 52], [80, 62], [100, 58], [120, 62]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />
            ))}
          </g>
          <path d="M140 66 Q166 60 176 80 Q160 74 146 76Z" fill="#C0392B" stroke="#4a130e" strokeWidth="1.8" />
          <path d="M142 72 Q160 84 164 102 Q150 92 140 78Z" fill="#A72F23" stroke="#4a130e" strokeWidth="1.8" />
          <circle cx="142" cy="72" r="5" fill="#8f2a1f" stroke="#4a130e" strokeWidth="1.6" />
          <path d="M64 46 Q76 38 92 36" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <path d="M50 100 C50 22 150 22 150 100" fill="none" stroke="#14171d" strokeWidth="9" strokeLinecap="round" />
          <path d="M50 100 C50 22 150 22 150 100" fill="none" stroke="#3a414f" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 0" />
          {[50, 150].map((x) => (
            <g key={x}>
              <rect x={x - 11} y="80" width="22" height="40" rx="10" fill={p.r('cup')} stroke="#0b0d11" strokeWidth="2" />
              <rect x={x - 6} y="87" width="12" height="26" rx="6" fill="#1b1f27" />
              <rect x={x - 6} y="87" width="12" height="26" rx="6" fill="none" stroke={p.aura[0]} strokeWidth="1.4" strokeOpacity="0.9" />
              <path d={`M${x - 8} 86 Q${x - 8} 82 ${x - 2} 82`} fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
        </g>
      );
  }
}

/* ---------------------------------------------------------------- hero overlay */
const HEX_OUT = '100,177 113,184.5 113,199.5 100,207 87,199.5 87,184.5';
const HEX_IN = '100,183 107.8,187.5 107.8,196.5 100,201 92.2,196.5 92.2,187.5';

function HeroOverlay({ p, headPath }: { p: P; headPath: string }) {
  return (
    <g data-layer="hero-overlay">
      {[false, true].map((flip) => (
        <g key={String(flip)} transform={flip ? 'translate(200 0) scale(-1 1)' : undefined}>
          <path d="M22 204 C20 174 40 158 72 152 L84 158 C68 168 60 184 58 210Z" fill={p.r('gold')} stroke="#6b4f12" strokeWidth="1.4" />
          <path d="M30 202 C30 180 44 166 66 160 L72 166 C58 174 50 188 48 206Z" fill={p.r('violet')} stroke="#2a2148" strokeWidth="1.2" />
          <path d="M26 186 C30 170 44 160 66 154" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="42" cy="190" r="2.4" fill="#FFE9A6" stroke="#6b4f12" strokeWidth="0.8" />
        </g>
      ))}
      <polygon points={HEX_OUT} fill={p.r('gold')} stroke="#6b4f12" strokeWidth="1.4" strokeLinejoin="round" />
      <polygon points={HEX_IN} fill={p.r('violet')} stroke="#2a2148" strokeWidth="1" strokeLinejoin="round" />
      <g filter={p.r('glow')}>
        <circle cx="100" cy="192" r="3.4" fill="#FFE9A6" />
      </g>
      <path
        fillRule="evenodd"
        fill={p.r('gold')}
        stroke="#6b4f12"
        strokeWidth="1.6"
        strokeLinejoin="round"
        d="M54 88 Q54 80 64 80 L136 80 Q146 80 146 88 L146 102 Q142 118 126 114 Q112 110 100 118 Q88 110 74 114 Q58 118 54 102 Z M63 97 Q78 85 93 97 Q78 108 63 97Z M107 97 Q122 85 137 97 Q122 108 107 97Z"
      />
      <path d="M58 90 Q58 84 66 84 L134 84" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M96 84 L100 100 L104 84" fill={p.r('violet')} stroke="#2a2148" strokeWidth="1.2" strokeLinejoin="round" />
      {[[59, 94], [141, 94]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="1.8" fill="#FFE9A6" stroke="#6b4f12" strokeWidth="0.6" />
      ))}
      <path d={headPath} fill="none" stroke={p.r('rim')} strokeWidth="2.4" strokeLinejoin="round" />
    </g>
  );
}

/* ---------------------------------------------------------------- component */
export function ZombieArt({ dna, level = 1, size = 160, animated = false, label }: { dna: bigint; level?: number; size?: number; animated?: boolean; label?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const t = decodeDna(dna);
  const tier = levelTier(level);
  const rarity = rarityOf(dna);
  const hero = t.species === 'hero';
  const skin = SKIN[t.skin];
  const skinL = mix(skin, '#ffffff', 0.3);
  const skinD = mix(skin, '#0a140e', 0.5);
  const aura = AURA[t.aura];
  const r = (n: string) => `url(#${uid}-${n})`;
  const p: P = { r, skin, skinD, aura, t };
  const head = HEADS[t.head];
  const earX = EAR_X[t.head];
  const glowVars = { '--color-green-glow': `${mix(aura[0], '#000000', 0.1)}66` } as CSSProperties;
  const auraOpacity = [0.22, 0.35, 0.6, 0.85][tier];
  const aria = `${label ? `${label}, ` : ''}${rarity} zombie, level ${level}`;

  const stop = (o: number, c: string, a = 1): ReactNode => <stop offset={o} stopColor={c} stopOpacity={a} />;

  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      role="img"
      aria-label={aria}
      className={animated ? 'animate-float' : undefined}
      data-head={t.head}
      data-skin={t.skin}
      data-eyes={t.eyes}
      data-mouth={t.mouth}
      data-clothes={t.clothes}
      data-accessory={t.accessory}
      data-aura={t.aura}
      data-species={t.species}
      data-tier={tier}
    >
      <defs>
        <radialGradient id={`${uid}-aura`} cx="0.5" cy="0.5" r="0.5">
          {stop(0, aura[0], 0.55)}
          {stop(0.55, aura[0], 0.16)}
          {stop(1, aura[0], 0)}
        </radialGradient>
        <radialGradient id={`${uid}-skin`} cx="0.36" cy="0.3" r="0.9">
          {stop(0, skinL)}
          {stop(0.5, skin)}
          {stop(1, skinD)}
        </radialGradient>
        <linearGradient id={`${uid}-neck`} x1="0" y1="0" x2="0" y2="1">
          {stop(0, mix(skin, '#000000', 0.45))}
          {stop(1, mix(skin, '#000000', 0.2))}
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0">
          {stop(0, skinD)}
          {stop(0.5, skin)}
          {stop(1, skinD)}
        </linearGradient>
        <linearGradient id={`${uid}-shade`} x1="0" y1="0" x2="1" y2="0">
          {stop(0, '#000', 0.5)}
          {stop(0.3, '#000', 0)}
          {stop(0.7, '#000', 0.05)}
          {stop(1, '#000', 0.55)}
        </linearGradient>
        <linearGradient id={`${uid}-rib`} x1="0" y1="0" x2="1" y2="0">
          {stop(0, '#000', 0.2)}
          {stop(0.5, '#fff', 0.08)}
          {stop(1, '#000', 0.2)}
        </linearGradient>
        <linearGradient id={`${uid}-facedark`} x1="0" y1="0" x2="0" y2="1">
          {stop(0.45, '#000', 0)}
          {stop(1, '#000', 0.4)}
        </linearGradient>
        <radialGradient id={`${uid}-hl`} cx="0.5" cy="0.5" r="0.5">
          {stop(0, '#fff', 0.34)}
          {stop(1, '#fff', 0)}
        </radialGradient>
        <radialGradient id={`${uid}-hollow`} cx="0.5" cy="0.4" r="0.7">
          {stop(0, '#1d2e25')}
          {stop(1, '#020403')}
        </radialGradient>
        <radialGradient id={`${uid}-eyeball`} cx="0.4" cy="0.35" r="0.8">
          {stop(0, '#FBFBF0')}
          {stop(0.7, '#E2E4C6')}
          {stop(1, '#B9BC94')}
        </radialGradient>
        <radialGradient id={`${uid}-lens`} cx="0.35" cy="0.3" r="0.9">
          {stop(0, '#BFF3FF')}
          {stop(0.55, '#3FA7C9')}
          {stop(1, '#12425A')}
        </radialGradient>
        <linearGradient id={`${uid}-helmet`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, '#7E8F6C')}
          {stop(1, '#38452F')}
        </linearGradient>
        <linearGradient id={`${uid}-hat`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, '#2C3038')}
          {stop(1, '#0A0B0E')}
        </linearGradient>
        <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, '#9C7A52')}
          {stop(1, '#5A4128')}
        </linearGradient>
        <linearGradient id={`${uid}-cup`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, '#4A5262')}
          {stop(1, '#161a22')}
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, '#FFE9A6')}
          {stop(0.45, '#F2C14E')}
          {stop(1, '#8A6A1F')}
        </linearGradient>
        <linearGradient id={`${uid}-violet`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, '#B8A9E8')}
          {stop(0.5, '#8E7CC3')}
          {stop(1, '#3A2F66')}
        </linearGradient>
        <linearGradient id={`${uid}-rim`} gradientUnits="userSpaceOnUse" x1="50" y1="40" x2="150" y2="146">
          {stop(0, hero ? '#FFE9A6' : '#ffffff', 0.95)}
          {stop(0.45, hero ? '#F2C14E' : '#ffffff', 0.12)}
          {stop(0.7, aura[0], 0.18)}
          {stop(1, aura[0], hero ? 0.9 : 0.7)}
        </linearGradient>
        <linearGradient id={`${uid}-fadeg`} gradientUnits="userSpaceOnUse" x1="0" y1="198" x2="0" y2="238">
          {stop(0, '#fff')}
          {stop(1, '#000')}
        </linearGradient>
        <mask id={`${uid}-fade`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240">
          <rect width="200" height="240" fill={r('fadeg')} />
        </mask>
        <clipPath id={`${uid}-eyeclip`}>
          <ellipse cx="0" cy="1" rx="10.5" ry="8.5" />
        </clipPath>
        <clipPath id={`${uid}-torso`}>
          <path d={TORSO} />
        </clipPath>
        <clipPath id={`${uid}-head`}>
          <path d={head} />
        </clipPath>
        <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <filter id={`${uid}-blur`} x="-50%" y="-80%" width="200%" height="260%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* 1 aura */}
      <g opacity={auraOpacity}>
        <g className={animated ? 'animate-pulse-glow' : undefined} style={glowVars}>
          <Aura p={p} />
        </g>
      </g>

      {/* 2 body + clothes */}
      <g mask={r('fade')}>
        {t.clothes === 4 && <path d="M54 164 C46 118 66 94 100 92 C134 94 154 118 146 164Z" fill="#46506A" stroke="#2b3342" strokeWidth="1.6" />}
        <path d="M82 118 L118 118 L122 164 Q100 176 78 164Z" fill={r('neck')} />
        <path d={TORSO} fill={r('body')} />
        <g clipPath={r('torso')}>
          <Clothes p={p} />
          <rect x="0" y="140" width="200" height="100" fill={r('shade')} />
          <path d="M22 204 C22 174 42 160 72 153" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
          <path d="M178 204 C178 174 158 160 128 153" fill="none" stroke={aura[0]} strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
        </g>
        <ellipse cx="100" cy="150" rx="40" ry="13" fill="#000" fillOpacity="0.4" filter={r('soft')} />
      </g>

      {/* 3 head */}
      <ellipse cx={earX} cy="100" rx="8" ry="12" fill={skinD} />
      <ellipse cx={200 - earX} cy="100" rx="8" ry="12" fill={skinD} />
      <path d={head} fill={r('skin')} />
      <g clipPath={r('head')}>
        <ellipse cx="80" cy="70" rx="38" ry="28" fill={r('hl')} />
        <rect x="40" y="20" width="120" height="130" fill={r('facedark')} />
        <ellipse cx="78" cy="109" rx="13" ry="4.4" fill={skinD} fillOpacity="0.32" />
        <ellipse cx="122" cy="109" rx="13" ry="4.4" fill={skinD} fillOpacity="0.32" />
        <ellipse cx="64" cy="124" rx="9" ry="15" fill={skinD} fillOpacity="0.18" />
        <ellipse cx="136" cy="124" rx="9" ry="15" fill={skinD} fillOpacity="0.18" />
        <circle cx="128" cy="62" r="11" fill={skinD} fillOpacity="0.18" />
        <circle cx="70" cy="82" r="6" fill={skinD} fillOpacity="0.14" />
        <path d="M100 100 L94 116 Q100 121 106 116Z" fill={skinD} fillOpacity="0.3" />
        <circle cx="97" cy="116" r="1.3" fill={skinD} />
        <circle cx="103" cy="116" r="1.3" fill={skinD} />
        <path d="M60 78 Q64 70 72 66 M140 80 Q136 72 130 68" fill="none" stroke="#6b4a8c" strokeOpacity="0.35" strokeWidth="1.2" />
        <Stitch x1={58} y1={112} x2={72} y2={126} n={4} />
        {t.head === 3 && <Stitch x1={92} y1={44} x2={62} y2={72} n={5} />}
        {t.head === 3 && <Stitch x1={146} y1={92} x2={136} y2={116} n={3} />}
        {t.head === 2 && <Stitch x1={122} y1={40} x2={134} y2={62} n={3} />}
        {t.head < 2 && <Stitch x1={120} y1={58} x2={134} y2={72} n={3} />}
      </g>
      <path d={head} fill="none" stroke={skinD} strokeWidth="2.4" strokeLinejoin="round" />
      <path d={head} fill="none" stroke={r('rim')} strokeWidth="1.6" strokeLinejoin="round" />

      {/* 4 face */}
      <Eyes p={p} />
      <Mouth p={p} />

      {/* 5 accessory */}
      <Accessory p={p} />

      {/* 6 hero overlay */}
      {hero && <HeroOverlay p={p} headPath={head} />}

      {/* 7 level glow */}
      {tier > 0 && (
        <g opacity={[0, 0.25, 0.4, 0.55][tier]}>
          <g className={tier === 3 ? 'animate-pulse-glow' : undefined} style={glowVars}>
            <path d={head} fill="none" stroke={aura[0]} strokeWidth="9" filter={r('blur')} />
            <ellipse cx="100" cy="238" rx="80" ry="12" fill={aura[0]} filter={r('blur')} />
          </g>
        </g>
      )}
    </svg>
  );
}
