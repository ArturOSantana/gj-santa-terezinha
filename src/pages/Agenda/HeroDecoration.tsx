/**
 * HeroDecoration
 *
 * Camada visual do hero temático. Três níveis:
 *  1. .ag-hero-bg     → imagem de fundo real (quando disponível) com overlay gradiente
 *  2. .ag-hero-tile   → textura SVG em mosaico sobre a cor --hero (via CSS)
 *  3. .ag-hero-motif  → motivo decorativo SVG posicionado no canto direito
 *
 * Imagens reais disponíveis:
 *  - terezinha: SantaTerezinhaCarmeloBackGround.jpg (1376×768)
 *  - frassati:  PierGiorgioMontanhaNuvensBackGround.jpg (1024×1024)
 */

import React, { memo } from 'react';
import type { SaintKey } from '../../types/theme.types';

// ─── Imagens de background foto ───────────────────────────────────────────────
import bgTerezinha from '../../assets/SantaTerezinhaCarmeloBackGround.jpg';
import bgFrassati  from '../../assets/PierGiorgioMontanhaNuvensBackGround.jpg';

// ─── Motifs (400×160, branco, opacidade aplicada via CSS) ────────────────────
import motifTeresinha from '../../assets/motif-teresinha.svg';
import motifJose      from '../../assets/motif-jose.svg';
import motifCarlo     from '../../assets/motif-carlo.svg';
import motifFrassati  from '../../assets/motif-frassati.svg';
import motifJoana     from '../../assets/motif-joana.svg';
import motifMaria     from '../../assets/motif-maria.svg';
import motifInacio    from '../../assets/motif-inacio.svg';

const MOTIF_MAP: Partial<Record<SaintKey, string>> = {
  terezinha:    motifTeresinha,
  jose:         motifJose,
  carlo:        motifCarlo,
  frassati:     motifFrassati,
  joana:        motifJoana,
  nossa_senhora: motifMaria,
  inacio:       motifInacio,
};

const BG_MAP: Partial<Record<SaintKey, string>> = {
  terezinha: bgTerezinha,
  frassati:  bgFrassati,
};

interface HeroDecorationProps {
  saintKey: SaintKey;
}

const HeroDecoration = memo<HeroDecorationProps>(({ saintKey }) => {
  const bgUrl    = BG_MAP[saintKey];
  const motifUrl = MOTIF_MAP[saintKey];

  return (
    <>
      {/* Imagem de background foto com overlay (se disponível) */}
      {bgUrl && (
        <div
          className="ag-hero-bg"
          style={{ backgroundImage: `url(${bgUrl})` }}
          aria-hidden="true"
        />
      )}

      {/* Motivo decorativo SVG — canto direito, opacidade via CSS */}
      {motifUrl && (
        <img
          className="ag-hero-motif"
          src={motifUrl}
          alt=""
          aria-hidden="true"
        />
      )}
    </>
  );
});

HeroDecoration.displayName = 'HeroDecoration';
export default HeroDecoration;
