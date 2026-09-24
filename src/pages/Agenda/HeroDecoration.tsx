/**
 * HeroDecoration
 *
 * Camada visual do hero temático. Dois níveis:
 *  1. .ag-hero-bg  → imagem de fundo real (quando disponível) com overlay gradiente
 *  2. .ag-hero-deco → SVG inline de fallback ou detalhe adicional sobre a imagem
 *
 * Imagens reais disponíveis:
 *  - terezinha: SantaTerezinhaCarmeloBackGround.jpg (1376×768)
 *  - frassati:  PierGiorgioMontanhaNuvensBackGround.jpg (1024×1024)
 *
 * Os outros temas usam só o SVG inline até que as imagens sejam fornecidas.
 */

import React, { memo } from 'react';
import type { SaintKey } from '../../types/theme.types';

// ─── Imports de imagens de background ────────────────────────────────────────
import bgTerezinha from '../../assets/SantaTerezinhaCarmeloBackGround.jpg';
import bgFrassati  from '../../assets/PierGiorgioMontanhaNuvensBackGround.jpg';

const BG_MAP: Partial<Record<SaintKey, string>> = {
  terezinha: bgTerezinha,
  frassati:  bgFrassati,
};

interface HeroDecorationProps {
  saintKey: SaintKey;
}

// ─── SVGs por tema ────────────────────────────────────────────────────────────

/** São José – régua de carpinteiro na borda inferior + lírio discreto */
const DecoJose: React.FC = () => (
  <svg className="ag-hero-deco" viewBox="0 0 400 200"
    preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <rect x="0" y="178" width="400" height="7" fill="rgba(255,255,255,0.10)" />
    {Array.from({ length: 51 }, (_, i) => {
      const x = i * 8;
      const isLong = i % 5 === 0;
      return <line key={i} x1={x} y1={178} x2={x} y2={isLong ? 162 : 171}
        stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round" />;
    })}
    {/* Lírio estilizado no canto direito */}
    <g transform="translate(360, 30)" opacity="0.18">
      <path d="M10 60 C10 60 4 45 10 35 C10 35 8 20 15 12 C15 12 12 25 18 30 C18 30 22 18 26 14 C26 14 20 28 24 36 C30 26 28 13 28 13 C34 20 30 36 28 38 C34 34 38 20 38 20 C40 34 33 46 26 52 C26 52 24 58 24 64" stroke="white" strokeWidth="1.5" fill="none"/>
      <ellipse cx="15" cy="8" rx="4" ry="7" fill="white" />
      <ellipse cx="25" cy="5" rx="4" ry="7" fill="white" />
    </g>
  </svg>
);

/** São Carlo Acutis – raios de custódia + grade de pontos */
const DecoCarlo: React.FC = () => (
  <svg className="ag-hero-deco" viewBox="0 0 400 200"
    preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
    {/* Grade de pontos (pixel/tela) */}
    {Array.from({ length: 13 }, (_, row) =>
      Array.from({ length: 26 }, (_, col) => (
        <circle key={`${row}-${col}`} cx={col * 16} cy={row * 16} r={1.5}
          fill="rgba(255,255,255,0.08)" />
      ))
    )}
    {/* 12 raios saindo do canto superior direito */}
    {Array.from({ length: 12 }, (_, i) => {
      const angle = (90 + i * 8.5) * (Math.PI / 180);
      const len = 200;
      return <line key={i} x1={400} y1={0}
        x2={400 + Math.cos(angle) * len} y2={Math.sin(angle) * len}
        stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeLinecap="round" />;
    })}
  </svg>
);

/** Santa Joana d'Arc – estandarte no canto direito + faixa chama */
const DecoJoana: React.FC = () => (
  <svg className="ag-hero-deco" viewBox="0 0 400 200"
    preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
    {/* Faixa chama */}
    <path d="M262 0 L272 0 L272 165 L262 165 Z" fill="rgba(255,120,40,0.45)" />
    {/* Estandarte com corte em V na base */}
    <path d="M272 0 L400 0 L400 160 L368 143 L336 160 L304 143 L272 160 Z"
      fill="rgba(255,255,255,0.07)" />
    {/* Borda dourada do estandarte */}
    <path d="M272 0 L272 160 L304 143 L336 160 L368 143 L400 160 L400 0"
      fill="none" stroke="rgba(184,137,43,0.45)" strokeWidth="1.5" />
    {/* Flor-de-lis no estandarte */}
    <g transform="translate(330,32)" opacity="0.30">
      <circle cx="6" cy="0" r="3" fill="white" />
      <path d="M6 3 C6 3 1 8 2 14 C2 14 5 10 6 14 C7 10 10 14 10 14 C11 8 6 3 6 3Z" fill="white" />
      <path d="M0 10 C0 10 4 8 6 11 C8 8 12 10 12 10 C10 5 6 7 6 7 C6 7 2 5 0 10Z" fill="white" />
      <line x1="6" y1="14" x2="6" y2="22" stroke="white" strokeWidth="1.5" />
    </g>
  </svg>
);

/** Nossa Senhora – coroa de 12 estrelas de 4 pontas */
const DecoNossaSenhora: React.FC = () => {
  const star4 = (cx: number, cy: number, r: number, key: string) => {
    const pts = Array.from({ length: 8 }, (_, i) => {
      const a = (i * 45 - 90) * (Math.PI / 180);
      const radius = i % 2 === 0 ? r : r * 0.38;
      return `${cx + Math.cos(a) * radius},${cy + Math.sin(a) * radius}`;
    }).join(' ');
    return <polygon key={key} points={pts} data-role="star" opacity="0.70" />;
  };
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (-20 + i * 19) * (Math.PI / 180);
    const cx = 330 + Math.cos(angle) * 68;
    const cy = 105 + Math.sin(angle) * 68;
    const r = 5 + (i % 3) * 2;
    return star4(cx, cy, r, String(i));
  });
  return (
    <svg className="ag-hero-deco" viewBox="0 0 400 200"
      preserveAspectRatio="xMaxYMid slice" aria-hidden="true"
      style={{ fill: 'var(--accent-dark, #E3C25B)' }}>
      {stars}
    </svg>
  );
};

/** Santo Inácio – monograma IHS com raios + três chamas */
const DecoInacio: React.FC = () => (
  <svg className="ag-hero-deco" viewBox="0 0 400 200"
    preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
    {/* Monograma IHS com raios no canto direito */}
    <g transform="translate(340,20)" opacity="0.18">
      {/* Círculo com raios */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * 36) * (Math.PI / 180);
        return <line key={i} x1={Math.cos(a)*14} y1={Math.sin(a)*14}
          x2={Math.cos(a)*24} y2={Math.sin(a)*24}
          stroke="white" strokeWidth="1.5" />;
      })}
      <circle cx="0" cy="0" r="13" fill="none" stroke="white" strokeWidth="1.5" />
      <text x="0" y="5" textAnchor="middle" fill="white"
        style={{ font: '700 13px/1 Chakra Petch, system-ui, sans-serif' }}>IHS</text>
    </g>
    {/* Três chamas angulosas subindo da base */}
    <path d="M285 200 L297 200 L294 152 L305 172 L308 148 L300 164 L294 152 Z"
      fill="rgba(240,146,94,0.28)" />
    <path d="M313 200 L331 200 L327 132 L341 158 L344 126 L335 148 L326 132 Z"
      fill="rgba(240,146,94,0.28)" />
    <path d="M351 200 L367 200 L364 148 L376 168 L380 144 L370 162 L362 148 Z"
      fill="rgba(240,146,94,0.28)" />
  </svg>
);

/** Santa Terezinha – pétalas de rosa flutuando (animação CSS controlada) */
const DecoTerezinha: React.FC = () => (
  <svg className="ag-hero-deco" viewBox="0 0 400 200"
    preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
    {[
      { x: 245, y: 35,  w: 16, h: 26, cl: 'petal' },
      { x: 305, y: 18,  w: 11, h: 18, cl: 'petal' },
      { x: 355, y: 58,  w: 20, h: 32, cl: 'petal' },
      { x: 382, y: 22,  w: 9,  h: 15, cl: 'petal' },
      { x: 268, y: 95,  w: 13, h: 21, cl: 'petal' },
      { x: 335, y: 115, w: 17, h: 27, cl: 'petal' },
      { x: 392, y: 90,  w: 9,  h: 15, cl: 'petal' },
      { x: 285, y: 150, w: 18, h: 29, cl: 'petal' },
      { x: 362, y: 158, w: 13, h: 21, cl: 'petal' },
    ].map((p, i) => (
      <path key={i} className={p.cl}
        d={`M${p.x} ${p.y - p.h/2} L${p.x + p.w/2} ${p.y} L${p.x} ${p.y + p.h/2} L${p.x - p.w/2} ${p.y} Z`}
        fill="rgba(236,214,217,0.28)" />
    ))}
  </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const HeroDecoration = memo<HeroDecorationProps>(({ saintKey }) => {
  const bgUrl = BG_MAP[saintKey];

  return (
    <>
      {/* Imagem de background real com overlay (se disponível) */}
      {bgUrl && (
        <div
          className="ag-hero-bg"
          style={{ backgroundImage: `url(${bgUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Decoração SVG inline */}
      {saintKey === 'terezinha'     && <DecoTerezinha />}
      {saintKey === 'jose'          && <DecoJose />}
      {saintKey === 'carlo'         && <DecoCarlo />}
      {/* Frassati: imagem já tem as montanhas, não precisa do SVG inline */}
      {saintKey === 'nossa_senhora' && <DecoNossaSenhora />}
      {saintKey === 'joana'         && <DecoJoana />}
      {saintKey === 'inacio'        && <DecoInacio />}
    </>
  );
});

HeroDecoration.displayName = 'HeroDecoration';
export default HeroDecoration;
