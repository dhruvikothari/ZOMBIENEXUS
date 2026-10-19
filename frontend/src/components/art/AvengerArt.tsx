import { useId, type CSSProperties } from 'react';
import { ROSTER, heroIndex, powerOf } from '@/lib/roster';
import { mix } from '@/components/art/ZombieArt';

// Aura glow colour per roster index (storm blue for Thor, green for Hulk, etc.).
const AURA = ['#F2C14E', '#5C8CE0', '#BFE0FF', '#6CE04A', '#E8505B', '#A67BE0'];

type P = { r: (n: string) => string; main: string; acc: string; aura: string };

/* Shared pieces ------------------------------------------------------- */
const SHOULDERS = 'M16 224 L16 194 C16 168 42 156 74 152 L126 152 C158 156 184 168 184 194 L184 224Z';

function Face({ p, d }: { p: P; d: string }) {
  return <path d={d} fill={p.r('skin')} stroke="#7a4a2c" strokeOpacity="0.55" strokeWidth="1.6" strokeLinejoin="round" />;
}

/* Iron Man ------------------------------------------------------------ */
function IronMan({ p }: { p: P }) {
  const dark = mix(p.main, '#000000', 0.6);
  return (
    <>
      <rect x="86" y="132" width="28" height="26" fill="#2a2d35" />
      <path d={SHOULDERS} fill={p.r('main')} />
      <path d="M16 200 C18 172 40 160 66 154 L80 170 C58 176 42 190 38 216 L16 216Z" fill={p.r('main')} stroke={p.acc} strokeWidth="2" />
      <path d="M184 200 C182 172 160 160 134 154 L120 170 C142 176 158 190 162 216 L184 216Z" fill={p.r('main')} stroke={p.acc} strokeWidth="2" />
      <path d="M64 158 L136 158 L126 214 L74 214Z" fill={p.r('acc')} stroke="#6b4f12" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M74 172 L126 172 M78 196 L122 196" stroke="#6b4f12" strokeOpacity="0.6" strokeWidth="1.4" />
      <circle cx="100" cy="186" r="14" fill="#2b2110" stroke="#6b4f12" strokeWidth="1.4" />
      <path d="M100 176 L109 191 L91 191Z" fill="none" stroke="#BDF3FF" strokeOpacity="0.7" strokeWidth="1.4" strokeLinejoin="round" />
      <g filter={p.r('glow')}>
        <circle cx="100" cy="186" r="8" fill="#BDF3FF" />
      </g>
      <circle cx="100" cy="186" r="3.6" fill="#fff" />
      <path d="M22 196 C26 176 44 164 66 158" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
      {/* helmet */}
      <path d="M64 76 C64 46 82 34 100 34 C118 34 136 46 136 76 L136 108 C136 126 122 142 100 148 C78 142 64 126 64 108Z" fill={p.r('main')} stroke={dark} strokeWidth="2" strokeLinejoin="round" />
      <path d="M72 70 L128 70 L127 112 C125 128 114 140 100 144 C86 140 75 128 73 112Z" fill={p.r('acc')} stroke="#6b4f12" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M100 36 L100 70" stroke={dark} strokeWidth="2.6" />
      <path d="M72 74 Q100 82 128 74" fill="none" stroke="#6b4f12" strokeWidth="2" />
      <g filter={p.r('glow')} fill="#E8FBFF">
        <path d="M76 88 L96 92 L95 99 L78 96Z" />
        <path d="M124 88 L104 92 L105 99 L122 96Z" />
      </g>
      <path d="M100 100 L100 120 M96 118 L104 118" stroke="#6b4f12" strokeWidth="1.6" fill="none" />
      <path d="M88 126 H112 M91 131 H109 M94 136 H106" stroke="#6b4f12" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M76 104 L86 118 M124 104 L114 118" stroke="#6b4f12" strokeOpacity="0.7" strokeWidth="1.4" />
      <path d="M68 66 C70 50 82 40 96 38" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" strokeLinecap="round" />
      <path d="M78 76 L90 76" stroke="#fff" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

/* Captain America (round ringed shield, no star) ----------------------- */
function Captain({ p }: { p: P }) {
  const dark = mix(p.main, '#000000', 0.5);
  return (
    <>
      <rect x="86" y="130" width="28" height="28" fill="#B98660" />
      <path d={SHOULDERS} fill={p.r('main')} />
      <path d="M16 194 C16 168 42 156 74 152 L84 166 C60 172 44 186 40 214 L16 214Z" fill={mix(p.main, '#ffffff', 0.08)} />
      <path d="M184 194 C184 168 158 156 126 152 L116 166 C140 172 156 186 160 214 L184 214Z" fill={mix(p.main, '#ffffff', 0.08)} />
      <g>
        <rect x="16" y="190" width="168" height="9" fill={p.acc} />
        <rect x="16" y="199" width="168" height="9" fill="#F1F2F4" />
        <rect x="16" y="208" width="168" height="9" fill={p.acc} />
      </g>
      <path d="M80 156 L62 166 M120 156 L138 166" stroke="#161d33" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 152 Q100 168 124 152" fill="none" stroke="#161d33" strokeWidth="3" />
      {/* head */}
      <Face p={p} d="M66 78 C66 48 82 38 100 38 C118 38 134 48 134 78 L134 102 C134 128 118 146 100 148 C82 146 66 128 66 102Z" />
      <path d="M66 100 Q70 128 90 144 M134 100 Q130 128 110 144" fill="none" stroke="#7a4a2c" strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
      {[80, 120].map((x) => (
        <g key={x}>
          <path d={`M${x - 9} 98 Q${x} 90 ${x + 9} 98 Q${x} 105 ${x - 9} 98Z`} fill="#fff" stroke="#3a2415" strokeWidth="1.4" />
          <circle cx={x} cy="98" r="3.6" fill="#4F86D6" />
          <circle cx={x} cy="98" r="1.6" fill="#0c1020" />
          <path d={`M${x - 11} 91 Q${x} 85 ${x + 11} 91`} fill="none" stroke="#5a3a22" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      ))}
      <path d="M100 100 L96 116 Q100 119 104 116" fill="none" stroke="#7a4a2c" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M90 128 Q100 132 110 128" fill="none" stroke="#7a3a30" strokeWidth="2.4" strokeLinecap="round" />
      {/* cowl */}
      <path d="M62 108 C56 62 78 34 100 34 C122 34 144 62 138 108 L130 108 C130 90 124 84 118 84 L82 84 C76 84 70 90 70 108Z" fill={p.r('main')} stroke={dark} strokeWidth="2" strokeLinejoin="round" />
      <path d="M72 106 C72 90 78 86 84 86 L116 86 C122 86 128 90 128 106" fill="none" stroke="#F1F2F4" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 62 C72 44 84 34 98 32" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
      {/* shield */}
      <g>
        <circle cx="66" cy="198" r="42" fill="#5c6575" />
        <circle cx="66" cy="198" r="39" fill={p.acc} />
        <circle cx="66" cy="198" r="30" fill="#F1F2F4" />
        <circle cx="66" cy="198" r="22" fill={p.acc} />
        <circle cx="66" cy="198" r="14" fill={p.r('main')} />
        <path d="M30 184 A38 38 0 0 1 56 164" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="66" cy="198" r="42" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.2" />
      </g>
    </>
  );
}

/* Thor (hammer silhouette, storm aura) ---------------------------------- */
function Thor({ p }: { p: P }) {
  const steelD = mix(p.main, '#000000', 0.5);
  return (
    <>
      <path d="M8 224 L14 178 C28 154 58 148 76 150 L124 150 C142 148 172 154 186 178 L192 224Z" fill={p.r('acc')} />
      <path d="M30 168 C28 190 26 208 22 224 M170 168 C172 190 174 208 178 224 M52 158 C50 184 48 206 46 224 M148 158 C150 184 152 206 154 224" stroke="#000" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <rect x="86" y="130" width="28" height="28" fill="#C98F66" />
      <path d="M26 224 L26 196 C26 170 46 158 76 153 L124 153 C154 158 174 170 174 196 L174 224Z" fill={p.r('main')} />
      <path d="M76 153 L100 184 L124 153 L134 224 L66 224Z" fill="#2f3646" />
      <path d="M26 190 C28 168 48 158 74 154 L88 168 C62 174 48 188 46 212 L26 212Z" fill={p.r('main')} stroke={steelD} strokeWidth="2" />
      <path d="M174 190 C172 168 152 158 126 154 L112 168 C138 174 152 188 154 212 L174 212Z" fill={p.r('main')} stroke={steelD} strokeWidth="2" />
      {[[84, 178], [100, 192], [116, 178], [88, 204], [112, 204]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="7" fill={p.r('main')} stroke={steelD} strokeWidth="1.4" />
          <circle cx={x - 1.6} cy={y - 1.6} r="2" fill="#fff" fillOpacity="0.7" />
        </g>
      ))}
      <path d="M30 188 C34 172 50 164 70 160" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      {/* hair behind */}
      <path d="M60 80 C54 42 78 24 102 24 C128 24 148 44 142 80 L148 134 C150 152 142 162 134 168 L130 124 L70 124 L66 168 C58 162 50 152 52 134Z" fill={p.r('hair')} stroke="#7a5c18" strokeWidth="1.6" strokeLinejoin="round" />
      <Face p={p} d="M70 80 C70 56 84 48 100 48 C116 48 130 56 130 80 L130 104 C130 128 116 144 100 146 C84 144 70 128 70 104Z" />
      {[82, 118].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="98" rx="7" ry="4.6" fill="#fff" stroke="#3a2415" strokeWidth="1.2" />
          <circle cx={x} cy="98" r="3.2" fill="#4DA3E0" />
          <circle cx={x} cy="98" r="1.4" fill="#0a1220" />
          <path d={`M${x - 10} ${x < 100 ? 91 : 88} L${x + 10} ${x < 100 ? 88 : 91}`} stroke="#8a6a1f" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      ))}
      <path d="M100 100 L96 114 Q100 117 104 114" fill="none" stroke="#7a4a2c" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M70 108 C72 134 88 148 100 150 C112 148 128 134 130 108 C122 120 112 124 100 124 C88 124 78 120 70 108Z" fill="#C79A38" stroke="#7a5c18" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M92 130 Q100 133 108 130" fill="none" stroke="#5a2a20" strokeWidth="2" strokeLinecap="round" />
      <path d="M62 78 C70 40 128 36 140 78 C126 62 108 58 90 62 C78 66 68 72 62 78Z" fill={p.r('hair')} stroke="#7a5c18" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M72 56 C84 44 100 42 112 46" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.4" strokeLinecap="round" />
      {/* hammer */}
      <g>
        <path d="M156 192 L140 224" stroke="#3a2a20" strokeWidth="7" strokeLinecap="round" />
        <path d="M155 194 L141 222" stroke="#8a6a44" strokeWidth="2" strokeDasharray="3 3" />
        <g transform="rotate(-26 164 176)">
          <rect x="142" y="162" width="44" height="28" rx="4" fill={p.r('main')} stroke={steelD} strokeWidth="2" />
          <rect x="142" y="162" width="44" height="9" rx="4" fill="#fff" fillOpacity="0.28" />
          <rect x="148" y="176" width="32" height="3" fill={steelD} fillOpacity="0.5" />
        </g>
      </g>
    </>
  );
}

function Bolts({ p, power }: { p: P; power: number }) {
  return (
    <g filter={p.r('glow')} fill="none" stroke="#E4F2FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" opacity={0.35 + power * 0.06}>
      <path d="M22 28 L36 60 L26 62 L42 100" />
      <path d="M176 22 L162 54 L172 56 L156 96" />
      <path d="M10 120 L22 142 L14 144 L26 170" strokeWidth="1.8" />
      <path d="M190 124 L178 146 L186 148 L174 172" strokeWidth="1.8" />
    </g>
  );
}

/* Hulk ---------------------------------------------------------------- */
function Hulk({ p }: { p: P }) {
  const dark = mix(p.main, '#000000', 0.5);
  return (
    <>
      <path d="M6 224 L10 188 C14 164 40 150 70 148 C76 142 76 132 76 124 L124 124 C124 132 124 142 130 148 C160 150 186 164 190 188 L194 224Z" fill={p.r('main')} stroke={dark} strokeWidth="2" strokeLinejoin="round" />
      <path d="M100 150 L100 196 M62 176 C76 188 90 190 100 188 C110 190 124 188 138 176" fill="none" stroke={dark} strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M62 152 C54 166 56 180 66 188 M138 152 C146 166 144 180 134 188" fill="none" stroke={dark} strokeOpacity="0.5" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 196 C22 172 44 158 70 152" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 224 L10 204 L28 212 L40 200 L56 214 L70 204 L92 216 L100 206 L116 216 L134 204 L150 214 L164 200 L176 212 L190 202 L194 224Z" fill={p.acc} stroke="#2b1a46" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M74 70 C74 48 88 42 100 42 C112 42 126 48 126 70 L128 102 C128 122 116 136 100 138 C84 136 72 122 72 102Z" fill={p.r('main')} stroke={dark} strokeWidth="2" strokeLinejoin="round" />
      <path d="M72 66 C72 44 88 36 100 36 C112 36 128 44 128 66 C118 58 108 56 100 58 C92 56 82 58 72 66Z" fill="#2A2336" />
      <path d="M72 84 Q100 70 128 84 L128 94 Q100 82 72 94Z" fill={dark} />
      {[84, 116].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="98" rx="6.4" ry="4.4" fill="#E8FFDD" stroke={dark} strokeWidth="1.2" />
          <circle cx={x} cy="98.4" r="2.6" fill="#2d6b1d" />
          <circle cx={x} cy="98.4" r="1.1" fill="#07140a" />
        </g>
      ))}
      <path d="M100 100 L95 114 Q100 118 105 114" fill="none" stroke={dark} strokeOpacity="0.8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M82 120 Q100 130 118 120 L116 128 Q100 138 84 128Z" fill="#12200e" stroke={dark} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M86 123 Q100 130 114 123 L113 126 Q100 133 87 126Z" fill="#F1F2EA" />
      <path d="M78 74 C84 66 94 62 102 62" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="2.6" strokeLinecap="round" />
    </>
  );
}

/* Black Widow ----------------------------------------------------------- */
function Widow({ p }: { p: P }) {
  return (
    <>
      <rect x="88" y="130" width="24" height="28" fill="#C99673" />
      <path d="M34 224 L34 194 C34 170 54 158 78 153 L122 153 C146 158 166 170 166 194 L166 224Z" fill={p.r('main')} stroke="#34373f" strokeWidth="1.6" />
      <path d="M76 154 Q100 174 124 154" fill="none" stroke={p.acc} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M100 168 L100 200" stroke="#3a3d46" strokeWidth="1.6" />
      <path d="M44 184 C60 172 76 170 88 176 M156 184 C140 172 124 170 112 176" fill="none" stroke="#fff" strokeOpacity="0.12" strokeWidth="5" strokeLinecap="round" />
      <path d="M58 160 L70 214 M142 160 L130 214" stroke="#4a4e59" strokeWidth="3" strokeLinecap="round" />
      <rect x="34" y="204" width="132" height="12" fill="#2b2d34" stroke="#4a4e59" strokeWidth="1.2" />
      <path d="M91 196 L109 196 L103 205 L109 214 L91 214 L97 205Z" fill={p.acc} stroke="#5a1418" strokeWidth="1" strokeLinejoin="round" />
      {/* hair behind */}
      <path d="M58 82 C54 44 78 26 102 26 C130 26 146 50 142 84 C146 112 144 136 152 160 C130 154 128 136 128 118 L72 118 C72 136 70 154 48 160 C56 138 54 112 58 82Z" fill={p.r('hair')} stroke="#6a1a1e" strokeWidth="1.6" strokeLinejoin="round" />
      <Face p={p} d="M70 82 C70 58 84 50 100 50 C116 50 130 58 130 82 L130 104 C130 128 116 144 100 146 C84 144 70 128 70 104Z" />
      {[84, 116].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="99" rx="7" ry="4.2" fill="#fff" stroke="#3a2415" strokeWidth="1.2" />
          <circle cx={x} cy="99" r="3.2" fill="#4FA38A" />
          <circle cx={x} cy="99" r="1.3" fill="#0a1220" />
          <path d={`M${x - 9} 93 Q${x} 88 ${x + 9} 93`} fill="none" stroke="#4a2a1a" strokeWidth="2" strokeLinecap="round" />
          <path d={`M${x - 8} 97 Q${x} 92 ${x + 8} 97`} fill="none" stroke="#1b1d22" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      <path d="M100 102 L96 116 Q100 119 104 116" fill="none" stroke="#7a4a2c" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M90 128 Q100 134 110 128 Q100 130 90 128Z" fill={p.acc} stroke="#8a1f26" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M62 82 C66 46 122 34 142 84 C122 62 100 62 80 88 C74 94 66 94 62 82Z" fill={p.r('hair')} stroke="#6a1a1e" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M74 52 C86 40 104 38 118 44" fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}

/* Hawkeye (bow + arrow, visor) ------------------------------------------- */
function Hawkeye({ p }: { p: P }) {
  const dark = mix(p.main, '#000000', 0.55);
  return (
    <>
      <path d="M138 56 L156 24 M146 62 L170 36 M130 52 L142 18" stroke="#2a2330" strokeWidth="3" strokeLinecap="round" />
      <path d="M156 24 L150 36 L160 32Z M170 36 L162 46 L172 44Z M142 18 L136 30 L146 26Z" fill="#8E7CC3" />
      <rect x="86" y="130" width="28" height="28" fill="#C99673" />
      <path d={SHOULDERS} fill={p.r('main')} stroke={dark} strokeWidth="1.6" />
      <path d="M16 200 C18 172 40 160 66 154 L80 170 C58 176 44 190 40 216 L16 216Z" fill="#24202e" />
      <path d="M184 200 C182 172 160 160 134 154 L120 170 C142 176 156 190 160 216 L184 216Z" fill="#24202e" />
      <path d="M50 158 L152 222" stroke="#1b1d22" strokeWidth="11" strokeLinecap="round" />
      <path d="M54 158 L148 218" stroke="#3a3d46" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M80 154 L100 170 L120 154" fill="none" stroke={dark} strokeWidth="3" />
      {/* hood */}
      <path d="M62 80 C58 40 80 24 100 24 C120 24 142 40 138 80 L144 120 C132 110 126 104 124 102 L76 102 C74 104 68 110 56 120Z" fill={p.r('main')} stroke={dark} strokeWidth="2" strokeLinejoin="round" />
      <Face p={p} d="M76 100 L124 100 C124 126 114 142 100 146 C86 142 76 126 76 100Z" />
      <path d="M82 124 Q100 136 118 124 C116 138 108 144 100 146 C92 144 84 138 82 124Z" fill="#7a4a2c" fillOpacity="0.28" />
      <path d="M92 124 Q100 128 110 122" fill="none" stroke="#7a3a30" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M100 102 L97 116 Q100 118 103 116" fill="none" stroke="#7a4a2c" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
      {/* visor */}
      <path d="M68 82 Q100 74 132 82 L130 102 Q100 96 70 102Z" fill="#14121a" stroke={dark} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M74 90 Q100 84 126 90 L125 97 Q100 92 75 97Z" fill={p.r('lens')} />
      <path d="M78 90 L92 88" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 52 C72 38 84 28 98 26" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      {/* bow and arrow */}
      <path d="M44 62 C10 112 10 184 44 232" fill="none" stroke="#2c1d14" strokeWidth="6" strokeLinecap="round" />
      <path d="M44 62 C14 112 14 184 44 232" fill="none" stroke="#7a5638" strokeOpacity="0.6" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M44 62 L44 232" stroke="#E8ECF1" strokeOpacity="0.7" strokeWidth="1.2" />
      <path d="M44 176 L168 146" stroke="#c9ced8" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M168 146 L157 139 L158 152Z" fill="#E8ECF1" />
      <path d="M48 175 L38 166 M48 175 L36 176 M52 174 L44 164" stroke={p.acc === '#1B1D22' ? '#A67BE0' : p.acc} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

const HEROES = [IronMan, Captain, Thor, Hulk, Widow, Hawkeye];

export function AvengerArt({ genes, size = 160, animated = false }: { genes: bigint; size?: number; animated?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const idx = heroIndex(genes);
  const power = powerOf(genes);
  const hero = ROSTER[idx];
  const aura = AURA[idx];
  const r = (n: string) => `url(#${uid}-${n})`;
  const p: P = { r, main: hero.color, acc: hero.accent, aura };
  const Hero = HEROES[idx];
  const glowVars = { '--color-green-glow': `${aura}66` } as CSSProperties;
  // Black Widow's suit is near black: lift the gradient so the shading still reads.
  const base = idx === 4 ? '#3A3D47' : hero.color;
  const stop = (o: number, c: string, a = 1) => <stop offset={o} stopColor={c} stopOpacity={a} />;

  return (
    <svg
      viewBox="0 0 200 240"
      width={size}
      height={size * 1.2}
      role="img"
      aria-label={`${hero.name}, power ${power} of 10`}
      className={animated ? 'animate-float' : undefined}
      data-hero={idx}
      data-power={power}
    >
      <defs>
        <radialGradient id={`${uid}-aura`} cx="0.5" cy="0.5" r="0.5">
          {stop(0, aura, 0.6)}
          {stop(0.55, aura, 0.18)}
          {stop(1, aura, 0)}
        </radialGradient>
        <linearGradient id={`${uid}-main`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, mix(base, '#ffffff', 0.28))}
          {stop(0.5, base)}
          {stop(1, mix(base, '#000000', 0.5))}
        </linearGradient>
        <linearGradient id={`${uid}-acc`} x1="0" y1="0" x2="1" y2="1">
          {stop(0, mix(hero.accent, '#ffffff', 0.35))}
          {stop(0.5, hero.accent)}
          {stop(1, mix(hero.accent, '#000000', 0.5))}
        </linearGradient>
        <radialGradient id={`${uid}-skin`} cx="0.38" cy="0.3" r="0.9">
          {stop(0, '#F5D2B0')}
          {stop(0.55, '#E0AE86')}
          {stop(1, '#B07A55')}
        </radialGradient>
        <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="1" y2="1">
          {idx === 2 ? stop(0, '#F0CF6A') : stop(0, '#E8505B')}
          {idx === 2 ? stop(1, '#B88F2E') : stop(1, '#8F1F28')}
        </linearGradient>
        <radialGradient id={`${uid}-lens`} cx="0.3" cy="0.3" r="0.9">
          {stop(0, '#E0C8FF')}
          {stop(0.6, '#8E5CD6')}
          {stop(1, '#3A1E66')}
        </radialGradient>
        <linearGradient id={`${uid}-fadeg`} gradientUnits="userSpaceOnUse" x1="0" y1="190" x2="0" y2="216">
          {stop(0, '#fff')}
          {stop(1, '#000')}
        </linearGradient>
        <mask id={`${uid}-fade`} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="240">
          <rect width="200" height="240" fill={r('fadeg')} />
        </mask>
        <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g opacity={0.3 + power * 0.06}>
        <g className={animated ? 'animate-pulse-glow' : undefined} style={glowVars}>
          <circle cx="100" cy="120" r="104" fill={r('aura')} />
          {idx === 2 && <Bolts p={p} power={power} />}
        </g>
      </g>

      <g mask={r('fade')}>
        <Hero p={p} />
      </g>

      <g aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <rect
            key={i}
            x={28.2 + i * 14.6}
            y="224"
            width="12.2"
            height="6"
            rx="2"
            fill={i < power ? aura : '#ffffff'}
            fillOpacity={i < power ? 1 : 0.14}
            filter={i < power ? r('glow') : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
