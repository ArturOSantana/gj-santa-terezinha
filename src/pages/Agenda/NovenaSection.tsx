/**
 * NovenaSection
 *
 * Botão flutuante fixo (canto inferior direito) que abre um sheet/dialog
 * com as novenas em andamento hoje. Usa o mesmo padrão visual do
 * EventDetailModal (ag-dialog + swipe-to-close no mobile).
 *
 * O estado open/closed NÃO é persistido — é apenas sessão.
 * O progresso (dias marcados) continua salvo no localStorage por slug.
 */

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import type { NovenaState } from '../../hooks/useNovena';
import type { NovenaDia } from '../../types/novena.types';
import { useSwipeDown } from './useSwipeDown';
import iconeNovena from '../../assets/iconeNovena.svg';

// ─── DayDot ───────────────────────────────────────────────────────────────────

interface DayDotProps {
  day: number;
  totalDias: number;
  isCurrent: boolean;
  isDone: boolean;
  onToggle: (day: number) => void;
}

const DayDot = memo<DayDotProps>(({ day, isCurrent, isDone, onToggle }) => (
  <button
    className={`ag-nov-dot${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}`}
    onClick={() => onToggle(day)}
    aria-label={`Dia ${day}${isDone ? ' — rezado' : ''}${isCurrent ? ' — hoje' : ''}`}
    aria-pressed={isDone}
    title={`Dia ${day}`}
  >
    {isDone ? (
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      <span>{day}</span>
    )}
  </button>
));
DayDot.displayName = 'DayDot';

// ─── DiaCard ──────────────────────────────────────────────────────────────────

interface DiaCardProps {
  diaData: NovenaDia;
  isCurrent: boolean;
  isDone: boolean;
  onToggle: (day: number) => void;
}

const DiaCard = memo<DiaCardProps>(({ diaData, isCurrent, isDone, onToggle }) => {
  const [expanded, setExpanded] = useState(isCurrent);
  return (
    <div className={`ag-nov-dia-card${isCurrent ? ' current' : ''}${isDone ? ' done' : ''}`}>
      <button
        className="ag-nov-dia-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={`ag-nov-dia-dot${isDone ? ' done' : ''}${isCurrent ? ' current' : ''}`}>
          {isDone ? (
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : diaData.dia}
        </span>
        <span className="ag-nov-dia-title">
          {isCurrent && <em className="ag-nov-hoje-badge">Hoje · </em>}
          {diaData.titulo}
        </span>
        <svg className={`ag-nov-chevron${expanded ? ' open' : ''}`} viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {expanded && (
        <div className="ag-nov-dia-body">
          {diaData.escritura && (
            <blockquote className="ag-nov-escritura">{diaData.escritura}</blockquote>
          )}
          <p className="ag-nov-oracao-txt">{diaData.oracao}</p>
          {diaData.meditacao && (
            <details className="ag-nov-meditacao">
              <summary>Meditação do dia</summary>
              <p>{diaData.meditacao}</p>
            </details>
          )}
          {!isDone && (
            <button
              className="ag-nov-mark-btn"
              onClick={() => onToggle(diaData.dia)}
              aria-label={`Marcar dia ${diaData.dia} como rezado`}
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Marcar como rezado
            </button>
          )}
        </div>
      )}
    </div>
  );
});
DiaCard.displayName = 'DiaCard';

// ─── NovenaCard (conteúdo de uma novena dentro do sheet) ──────────────────────

interface NovenaCardProps {
  state: NovenaState;
  onToggleDay: (slug: string, inicioMes: number, inicioDia: number, day: number) => void;
  onLoadCompleta: (slug: string) => void;
}

const NovenaCard: React.FC<NovenaCardProps> = ({ state, onToggleDay, onLoadCompleta }) => {
  const { hoje, progress, completa, loadingCompleta } = state;
  const isCompleted = progress.completedDays.length >= hoje.totalDias;
  const diaAtual = hoje.diaAtual;
  const conteudo = hoje.conteudoHoje;

  const [orExpanded, setOrExpanded] = useState(false);
  const hasTruncation = conteudo.oracao.length > 280;
  const preview = conteudo.oracao.slice(0, 280);

  const handleToggle = (day: number) =>
    onToggleDay(hoje.slug, hoje.inicioMes, hoje.inicioDia, day);

  return (
    <div className={`ag-nov-card${isCompleted ? ' completed' : ''}`}>

      {/* Nome */}
      <div className="ag-nov-header">
        <h3 className="ag-nov-name">{hoje.nome}</h3>
        {isCompleted && (
          <span className="ag-nov-badge-complete" aria-label="Novena completa">Completa</span>
        )}
      </div>

      {/* Trilha de bolinhas */}
      <div className="ag-nov-track" role="group" aria-label="Dias da novena">
        {Array.from({ length: hoje.totalDias }, (_, i) => {
          const day = i + 1;
          return (
            <DayDot
              key={day}
              day={day}
              totalDias={hoje.totalDias}
              isCurrent={day === diaAtual}
              isDone={progress.completedDays.includes(day)}
              onToggle={handleToggle}
            />
          );
        })}
      </div>

      <div className="ag-nov-divider" />

      {/* Oração inicial — única para toda a novena, exibida aberta */}
      {completa?.oracaoInicial && (
        <div className="ag-nov-oracao-fixa">
          <span className="ag-nov-oracao-fixa-label">Oração inicial</span>
          <p>{completa.oracaoInicial}</p>
        </div>
      )}

      {/* Dia atual */}
      <div className="ag-nov-today">
        <span className="ag-nov-day-label">Dia {diaAtual} de {hoje.totalDias}</span>
        <h4 className="ag-nov-day-title">{conteudo.titulo}</h4>

        {conteudo.escritura && (
          <blockquote className="ag-nov-escritura">{conteudo.escritura}</blockquote>
        )}

        <div className="ag-nov-prayer">
          <p>{orExpanded || !hasTruncation ? conteudo.oracao : preview + '…'}</p>
        </div>

        {hasTruncation && (
          <button
            className="ag-btn-link ag-nov-expand-btn"
            onClick={() => setOrExpanded((v) => !v)}
            aria-expanded={orExpanded}
          >
            {orExpanded ? 'Ver menos' : 'Ver oração completa'}
          </button>
        )}
      </div>

      {/* Oração final — única para toda a novena, exibida aberta */}
      {completa?.oracaoFinal && (
        <div className="ag-nov-oracao-fixa">
          <span className="ag-nov-oracao-fixa-label">Oração final</span>
          <p>{completa.oracaoFinal}</p>
        </div>
      )}

      {/* CTA: marcar hoje */}
      {!progress.completedDays.includes(diaAtual) && (
        <button
          className="ag-nov-cta"
          onClick={() => handleToggle(diaAtual)}
          aria-label={`Marcar dia ${diaAtual} como rezado`}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7 10l2.5 2.5L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Rezei hoje (Dia {diaAtual})
        </button>
      )}

      {/* Todos os dias */}
      {!completa ? (
        <button
          className="ag-btn-ghost ag-nov-expand-all-btn"
          onClick={() => onLoadCompleta(hoje.slug)}
          disabled={loadingCompleta}
        >
          {loadingCompleta ? 'Carregando…' : 'Ver todos os dias'}
        </button>
      ) : (
        <>
          <div className="ag-nov-divider" style={{ marginTop: 4 }} />

          <div className="ag-nov-dias-list">
            {completa.dias.map((dia) => (
              <DiaCard
                key={dia.dia}
                diaData={dia}
                isCurrent={dia.dia === diaAtual}
                isDone={progress.completedDays.includes(dia.dia)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── NovenaSection — FAB + Sheet ──────────────────────────────────────────────

interface NovenasSectionProps {
  states: NovenaState[];
  onToggleDay: (slug: string, inicioMes: number, inicioDia: number, day: number) => void;
  onLoadCompleta: (slug: string) => void;
}

const NovenaSection: React.FC<NovenasSectionProps> = ({ states, onToggleDay, onLoadCompleta }) => {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Conta total de dias já rezados em todas as novenas ativas
  const totalDone = states.reduce((acc, s) => acc + s.progress.completedDays.length, 0);
  const hasPending = states.some(
    (s) => !s.progress.completedDays.includes(s.hoje.diaAtual)
  );

  // Sincroniza estado React ↔ dialog nativo
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && el.open) {
      el.close();
      document.body.style.overflow = '';
    }
  }, [open]);

  // Fechar ao clicar no backdrop (fora do dialog)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      if (e.target === el) setOpen(false);
    };
    el.addEventListener('click', handleClick);
    return () => el.removeEventListener('click', handleClick);
  }, []);

  // Fechar ao pressionar Escape
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e: Event) => { e.preventDefault(); setOpen(false); };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, []);

  // Limpar overflow ao desmontar
  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  // Swipe para baixo fecha o sheet no mobile
  useSwipeDown(dialogRef, handleClose);

  if (states.length === 0) return null;

  return (
    <>
      {/* ── Botão flutuante (FAB) ─────────────────────────────────────────── */}
      <button
        className={`ag-nov-fab${hasPending ? ' pending' : ''}${open ? ' active' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Abrir novenas do dia"
        aria-expanded={open}
        title="Novena do dia"
      >
        <img src={iconeNovena} alt="" aria-hidden="true" className="ag-nov-fab-img" />
        {/* Ponto de notificação: dia ainda não marcado */}
        {hasPending && <span className="ag-nov-fab-dot" aria-hidden="true" />}
        {/* Contador de dias feitos (quando tem ao menos 1) */}
        {totalDone > 0 && (
          <span className="ag-nov-fab-count" aria-label={`${totalDone} dias rezados`}>
            {totalDone}
          </span>
        )}
      </button>

      {/* ── Sheet (dialog nativo) ─────────────────────────────────────────── */}
      <dialog
        ref={dialogRef}
        className="ag-dialog ag-nov-dialog"
        aria-label="Novenas em andamento"
      >
        <span className="ag-drag-handle" aria-hidden="true" />

        <button
          className="ag-dialog-close"
          onClick={handleClose}
          aria-label="Fechar novenas"
        >
          ×
        </button>

        <div className="ag-nov-sheet-body">
          {/* Cabeçalho do sheet */}
          <div className="ag-nov-sheet-header">
            <img src={iconeNovena} alt="" aria-hidden="true" className="ag-nov-sheet-img" />
            <div>
              <h2>{states.length === 1 ? 'Novena' : 'Novenas de hoje'}</h2>
              {states.length > 1 && (
                <p>{states.length} novenas em andamento</p>
              )}
            </div>
          </div>

          {/* Cards das novenas */}
          <div className="ag-nov-list">
            {states.map((s) => (
              <NovenaCard
                key={s.hoje.slug}
                state={s}
                onToggleDay={onToggleDay}
                onLoadCompleta={onLoadCompleta}
              />
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
};

export default NovenaSection;
