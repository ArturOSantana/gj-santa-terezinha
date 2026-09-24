/**
 * FeastBanner
 *
 * Faixa exibida logo abaixo do hero durante novenas e no dia da festa.
 *
 * Durante a novena:  "Novena de São José – dia 3 de 9"
 * No dia da festa:   "Hoje é a festa de São José"
 *
 * Texto em theme-primary sobre theme-tint.
 * Toque/clique navega até o primeiro evento relacionado ao tema (via onNavigate).
 */

import React, { memo } from 'react';
import type { ActiveTheme } from '../../types/theme.types';

interface FeastBannerProps {
  active: ActiveTheme;
  /** Chamado ao clicar no banner – navega até o evento relevante */
  onNavigate?: () => void;
}

const FeastBanner = memo<FeastBannerProps>(({ active, onNavigate }) => {
  const { theme, isNovena, isFeast, novenaDay } = active;

  let text: string;
  if (isFeast) {
    text = `Hoje é a festa de ${theme.name.replace(/^(Novena|Festa)\s+(d[eao]s?\s+)?/i, '')}`;
  } else if (isNovena && novenaDay !== null) {
    text = `${theme.name} – dia ${novenaDay} de 9`;
  } else {
    return null;
  }

  const handleClick = () => onNavigate?.();

  return (
    <div
      className={`ag-feast-banner${isFeast ? ' is-feast' : ''}`}
      role={onNavigate ? 'button' : undefined}
      tabIndex={onNavigate ? 0 : undefined}
      onClick={onNavigate ? handleClick : undefined}
      onKeyDown={onNavigate ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); } : undefined}
      aria-label={onNavigate ? `${text} – toque para ver eventos` : undefined}
    >
      <div className="ag-feast-banner-inner">
        <span className="ag-feast-banner-dot" aria-hidden="true" />
        <span>{text}</span>
      </div>
    </div>
  );
});

FeastBanner.displayName = 'FeastBanner';
export default FeastBanner;
