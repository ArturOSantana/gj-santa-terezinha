/**
 * CrestPlate
 *
 * Placa do brasão dentro da identidade temática do hero.
 * Renderiza o brasão real do santo sobre fundo --crest-bg.
 * Fallback: SVG com a cruz e a rosa da identidade do grupo.
 */

import React, { useState, memo } from 'react';
import type { SaintKey } from '../../types/theme.types';
import { SAINT_DISPLAY_NAMES } from '../../types/theme.types';

// ─── Brasões importados ───────────────────────────────────────────────────────
import crestTerezinha from '../../assets/StaTerezinhaBrasao.png';
import crestJose      from '../../assets/SaoJoseBrasao.png';
import crestCarlo     from '../../assets/CalosAcutisBrasao.png';
import crestFrassati  from '../../assets/PierGiorgioBrasao.png';
import crestJoana     from '../../assets/staJoanaBrasao.png';

const CREST_MAP: Partial<Record<SaintKey, string>> = {
  terezinha:    crestTerezinha,
  jose:         crestJose,
  carlo:        crestCarlo,
  frassati:     crestFrassati,
  joana:        crestJoana,
  // nossa_senhora e inacio: ainda faltam — usarão o fallback SVG
};

// ─── Fallback SVG (cruz + rosa) ───────────────────────────────────────────────

const FallbackCrest: React.FC = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* Hexágono azul-marinho */}
    <path d="M40 4 L70 20 L70 60 L40 76 L10 60 L10 20 Z" fill="#2E2C5A" />
    {/* Cruz */}
    <rect x="38.5" y="9" width="3" height="16" rx="1" fill="white" opacity="0.9" />
    <rect x="32" y="15" width="16" height="3" rx="1" fill="white" opacity="0.9" />
    {/* Rosa vermelha (losangos) */}
    <path d="M56 35 L61 41 L56 47 L51 41 Z" fill="#7A1424" />
    <path d="M51 30 L56 35 L51 41 L46 35 Z" fill="#7A1424" opacity="0.7" />
    {/* Silhueta genérica */}
    <ellipse cx="33" cy="38" rx="7" ry="9" fill="white" opacity="0.22" />
    <circle cx="33" cy="28" r="5" fill="white" opacity="0.28" />
  </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────

interface CrestPlateProps {
  saintKey: SaintKey;
  /** URL override do Firestore (quando admin faz upload) */
  crestUrl?: string;
  displayName?: string;
}

const CrestPlate = memo<CrestPlateProps>(({ saintKey, crestUrl, displayName }) => {
  const [imgError, setImgError] = useState(false);
  const name = displayName ?? SAINT_DISPLAY_NAMES[saintKey];
  // Prioridade: URL do Firestore > importado > fallback SVG
  const src = crestUrl ?? CREST_MAP[saintKey];
  const showFallback = !src || imgError;

  return (
    <div className="ag-crest-plate" role="img" aria-label={`Brasão de ${name}`}>
      {showFallback ? (
        <FallbackCrest />
      ) : (
        <img
          src={src}
          alt={`Brasão de ${name}`}
          onError={() => setImgError(true)}
          loading="eager"
          decoding="async"
        />
      )}
    </div>
  );
});

CrestPlate.displayName = 'CrestPlate';
export default CrestPlate;
