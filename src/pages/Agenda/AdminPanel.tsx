/**
 * Painel de administração da Agenda dos Jovens
 *
 * Abas:
 *  1. Avisos   – publicar e remover avisos (Firestore, tempo real)
 *  2. Temas    – gerenciar temas festivos: escolher santo, datas, forçar/resetar
 */
import React, { useEffect, useRef, useState } from 'react';
import type { AgendaNotice, NoticeOrigin, AgendaAdminEvent, AgendaCategory } from '../../types/agenda.types';
import { NOTICE_ORIGIN_LABELS, CATEGORY_LABELS } from '../../types/agenda.types';
import type { FeastTheme, SaintKey, MarianInvocation, ActiveTheme } from '../../types/theme.types';
import { SAINT_DISPLAY_NAMES } from '../../types/theme.types';
import { useSwipeDown } from './useSwipeDown';
import { addAgendaNotice, deleteAgendaNotice, addAdminEvent, deleteAdminEvent } from '../../services/agenda.service';
import {
  addFeastTheme,
  updateFeastTheme,
  deleteFeastTheme,
  forceTheme,
  clearForcedTheme,
} from '../../services/theme.service';
import { pad } from './agendaUtils';

// ─── Tipos e constantes locais ────────────────────────────────────────────────

const SAINT_KEYS: SaintKey[] = [
  'terezinha', 'jose', 'carlo', 'frassati',
  'nossa_senhora', 'joana', 'inacio',
];

const MARIAN_INVOCATIONS: { key: MarianInvocation; label: string }[] = [
  { key: 'aparecida', label: 'Nossa Senhora Aparecida' },
  { key: 'fatima',    label: 'Nossa Senhora de Fátima' },
  { key: 'carmo',     label: 'Nossa Senhora do Carmo' },
  { key: 'imaculada', label: 'Imaculada Conceição' },
  { key: 'assuncao',  label: 'Assunção de Maria' },
  { key: 'outro',     label: 'Outra invocação' },
];

interface AdminPanelProps {
  open: boolean;
  displayName: string;
  notices: AgendaNotice[];
  adminEvents: AgendaAdminEvent[];
  allThemes: FeastTheme[];
  activeTheme: ActiveTheme | null;
  onClose: () => void;
  onSignOut: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatExpiry(exp?: string): string {
  if (!exp) return '';
  const [y, m, d] = exp.split('-');
  return `vence ${pad(Number(d))}/${pad(Number(m))}/${y}`;
}

function formatDateBR(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${pad(Number(d))}.${pad(Number(m))}.${y}`;
}

function themeLabel(t: FeastTheme): string {
  if (t.saintKey === 'nossa_senhora' && t.marianInvocation) {
    const inv = MARIAN_INVOCATIONS.find((i) => i.key === t.marianInvocation);
    return inv?.label ?? t.name;
  }
  return t.name || SAINT_DISPLAY_NAMES[t.saintKey];
}

// ─── Componente principal ─────────────────────────────────────────────────────

const AdminPanel: React.FC<AdminPanelProps> = ({
  open,
  displayName,
  notices,
  adminEvents,
  allThemes,
  activeTheme,
  onClose,
  onSignOut,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useSwipeDown(dialogRef, onClose);

  const [tab, setTab] = useState<'notices' | 'events' | 'themes'>('notices');
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Campos do formulário de aviso ──────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [origin, setOrigin] = useState<NoticeOrigin | ''>('');
  const [expiresAt, setExpiresAt] = useState('');

  // ── Campos do formulário de evento ────────────────────────────────────────
  const [evTitle, setEvTitle] = useState('');
  const [evCat, setEvCat] = useState<AgendaCategory>('jovens');
  const [evDate, setEvDate] = useState('');
  const [evTime, setEvTime] = useState('');
  const [evTimeEnd, setEvTimeEnd] = useState('');
  const [evPlace, setEvPlace] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evVisible, setEvVisible] = useState(true);

  // ── Campos do formulário de tema ───────────────────────────────────────────
  const [thSaint, setThSaint] = useState<SaintKey>('terezinha');
  const [thName, setThName] = useState('');
  const [thSubtitle, setThSubtitle] = useState('');
  const [thNovenaStart, setThNovenaStart] = useState('');
  const [thFeastDate, setThFeastDate] = useState('');
  const [thEndDate, setThEndDate] = useState('');
  const [thPriority, setThPriority] = useState(false);
  const [thCrestUrl, setThCrestUrl] = useState('');
  const [thInvocation, setThInvocation] = useState<MarianInvocation | ''>('');

  // ── Abertura / fechamento do dialog ───────────────────────────────────────
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) { if (!dialog.open) dialog.showModal(); }
    else { if (dialog.open) dialog.close(); }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const flash = (msg: string, ok = true) => {
    setStatus({ msg, ok });
    setTimeout(() => setStatus(null), 4000);
  };

  // ── Handlers de eventos ───────────────────────────────────────────────────
  const resetEventForm = () => {
    setEvTitle(''); setEvCat('jovens'); setEvDate(''); setEvTime('');
    setEvTimeEnd(''); setEvPlace(''); setEvDesc(''); setEvVisible(true);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim() || !evDate) return;
    setLoading(true);
    try {
      await addAdminEvent({
        title: evTitle.trim().slice(0, 100),
        g: evCat,
        date: evDate,
        time: evTime || undefined,
        timeEnd: evTimeEnd || undefined,
        place: evPlace.trim().slice(0, 80) || undefined,
        desc: evDesc.trim().slice(0, 800) || undefined,
        visible: evVisible,
      });
      resetEventForm();
      flash('Evento adicionado.');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      console.error('[AdminPanel] Erro ao adicionar evento:', code, err);
      if (code === 'permission-denied') {
        flash('Sem permissão. Faça logout e entre novamente.', false);
      } else {
        flash('Não foi possível salvar. Verifique a conexão.', false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, t: string) => {
    if (!confirm(`Remover o evento "${t}"?`)) return;
    setDeleting(id);
    try {
      await deleteAdminEvent(id);
      flash('Evento removido.');
    } catch {
      flash('Sem permissão para remover.', false);
    } finally {
      setDeleting(null);
    }
  };

  // ── Handlers de avisos ────────────────────────────────────────────────────
  const resetNoticeForm = () => {
    setTitle(''); setText(''); setUrgent(false); setOrigin(''); setExpiresAt('');
  };

  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await addAgendaNotice({
        title: title.trim().slice(0, 80),
        text: text.trim().slice(0, 500) || undefined,
        urgent,
        origin: origin || undefined,
        expiresAt: expiresAt || undefined,
      });
      resetNoticeForm();
      flash('Aviso publicado.');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      const msg  = (err as { message?: string })?.message ?? '';
      console.error('[AdminPanel] Erro ao publicar aviso:', code, msg, err);
      if (code === 'permission-denied') {
        flash('Sem permissão. Faça logout e entre novamente.', false);
      } else {
        flash('Não foi possível publicar. Verifique a conexão.', false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string, t: string) => {
    if (!confirm(`Apagar "${t}"?`)) return;
    setDeleting(id);
    try {
      await deleteAgendaNotice(id);
    } catch {
      flash('Sem permissão para apagar.', false);
    } finally {
      setDeleting(null);
    }
  };

  // ── Handlers de temas ─────────────────────────────────────────────────────
  const resetThemeForm = () => {
    setThSaint('terezinha'); setThName(''); setThSubtitle('');
    setThNovenaStart(''); setThFeastDate(''); setThEndDate('');
    setThPriority(false); setThCrestUrl(''); setThInvocation('');
  };

  const handleAddTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thNovenaStart || !thFeastDate) {
      flash('Preencha as datas da novena e da festa.', false);
      return;
    }
    setLoading(true);
    try {
      const payload: Omit<FeastTheme, 'id'> = {
        saintKey: thSaint,
        name: thName.trim() || SAINT_DISPLAY_NAMES[thSaint],
        subtitle: thSubtitle.trim(),
        noveenaStart: thNovenaStart,
        feastDate: thFeastDate,
        endDate: thEndDate || thFeastDate,
        priority: thPriority,
        forced: false,
        crestUrl: thCrestUrl.trim() || undefined,
        marianInvocation: (thSaint === 'nossa_senhora' && thInvocation) ? thInvocation : undefined,
      };
      await addFeastTheme(payload);
      resetThemeForm();
      flash('Tema salvo.');
    } catch {
      flash('Erro ao salvar tema.', false);
    } finally {
      setLoading(false);
    }
  };

  const handleForceTheme = async (id: string) => {
    const customIds = allThemes.filter((t) => !t.id.startsWith('__')).map((t) => t.id);
    try {
      // Só temas customizados podem ser forçados via Firestore
      if (!customIds.includes(id)) {
        flash('Apenas temas customizados podem ser forçados. Recrie o tema abaixo para forçá-lo.', false);
        return;
      }
      await forceTheme(id, customIds);
      flash(`Tema forçado com sucesso.`);
    } catch {
      flash('Erro ao forçar tema.', false);
    }
  };

  const handleClearForced = async () => {
    const customIds = allThemes.filter((t) => !t.id.startsWith('__')).map((t) => t.id);
    try {
      await clearForcedTheme(customIds);
      flash('Voltou ao automático.');
    } catch {
      flash('Erro ao resetar tema.', false);
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (id.startsWith('__')) { flash('Temas padrão não podem ser removidos.', false); return; }
    if (!confirm('Remover este tema customizado?')) return;
    setDeleting(id);
    try {
      await deleteFeastTheme(id);
      flash('Tema removido.');
    } catch {
      flash('Erro ao remover tema.', false);
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePriority = async (t: FeastTheme) => {
    if (t.id.startsWith('__')) { flash('Edite a prioridade apenas em temas customizados.', false); return; }
    try {
      await updateFeastTheme(t.id, { priority: !t.priority });
      flash('Prioridade atualizada.');
    } catch {
      flash('Erro ao atualizar prioridade.', false);
    }
  };

  // Verifica se algum tema está forçado
  const hasForced = allThemes.some((t) => t.forced);

  return (
    <dialog
      ref={dialogRef}
      className="ag-dialog"
      aria-label="Painel da coordenação"
      onCancel={(e) => { e.preventDefault(); onClose(); }}
    >
      <div className="ag-drag-handle" aria-hidden="true" />
      <button className="ag-dialog-close" onClick={onClose} aria-label="Fechar">×</button>

      <div className="ag-dialog-body" style={{ paddingTop: 48 }}>
        {/* ── Cabeçalho ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h2 style={{ fontSize: 20 }}>Coordenação</h2>
          <button className="ag-btn-link" style={{ fontSize: 13 }} onClick={onSignOut}>Sair</button>
        </div>

        {displayName && (
          <p style={{ color: 'var(--ag-mute)', fontSize: 12, marginBottom: 12 }}>
            {displayName}
          </p>
        )}

        {/* ── Abas ──────────────────────────────────────────────────────── */}
        <div className="ag-panel-tabs" role="tablist" style={{ marginBottom: 16 }}>
          <button
            role="tab"
            className={`ag-panel-tab${tab === 'notices' ? ' active' : ''}`}
            aria-selected={tab === 'notices'}
            onClick={() => setTab('notices')}
          >
            Avisos
          </button>
          <button
            role="tab"
            className={`ag-panel-tab${tab === 'events' ? ' active' : ''}`}
            aria-selected={tab === 'events'}
            onClick={() => setTab('events')}
          >
            Eventos
          </button>
          <button
            role="tab"
            className={`ag-panel-tab${tab === 'themes' ? ' active' : ''}`}
            aria-selected={tab === 'themes'}
            onClick={() => setTab('themes')}
          >
            Temas
          </button>
        </div>

        {/* ── Status flash ──────────────────────────────────────────────── */}
        {status && (
          <div role="status" aria-live="polite" className={`ag-status ${status.ok ? 'ok' : 'err'}`} style={{ marginBottom: 8 }}>
            {status.msg}
          </div>
        )}

        {/* ════════════════════ ABA: AVISOS ════════════════════════════════ */}
        {tab === 'notices' && (
          <>
            <form className="ag-form" onSubmit={handleAddNotice} noValidate>
              <label className="ag-label">
                Título
                <input
                  type="text"
                  className="ag-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  required
                />
              </label>

              <div className="ag-two-col">
                <label className="ag-label">
                  Origem
                  <select
                    className="ag-select"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value as NoticeOrigin | '')}
                  >
                    <option value="">— sem origem —</option>
                    {(Object.keys(NOTICE_ORIGIN_LABELS) as NoticeOrigin[]).map((k) => (
                      <option key={k} value={k}>{NOTICE_ORIGIN_LABELS[k]}</option>
                    ))}
                  </select>
                </label>

                <label className="ag-checkbox-label" style={{ alignSelf: 'flex-end', paddingBottom: 2 }}>
                  <input
                    type="checkbox"
                    checked={urgent}
                    onChange={(e) => setUrgent(e.target.checked)}
                  />
                  Urgente
                </label>
              </div>

              <label className="ag-label">
                Texto
                <textarea
                  className="ag-textarea"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </label>

              <label className="ag-label">
                Vencimento (opcional)
                <input
                  type="date"
                  className="ag-input"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </label>

              <button type="submit" className="ag-btn" disabled={loading}>
                {loading ? 'Publicando...' : 'Publicar aviso'}
              </button>
            </form>

            {notices.length === 0 && (
              <p style={{ color: 'var(--ag-mute)', fontSize: 14, marginTop: 8 }}>Nenhum aviso ativo.</p>
            )}
            {notices.map((n) => (
              <div className="ag-item-row" key={n.id}>
                <div style={{ minWidth: 0 }}>
                  <div className="ag-item-label">
                    {n.urgent && <span style={{ color: 'var(--ag-wine)', fontWeight: 700, marginRight: 4 }}>●</span>}
                    {n.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                    {n.origin && (
                      <span className="ag-notice-origin" data-origin={n.origin}>
                        {NOTICE_ORIGIN_LABELS[n.origin]}
                      </span>
                    )}
                    {n.expiresAt && (
                      <span style={{ fontSize: 11, color: 'var(--ag-mute)' }}>
                        {formatExpiry(n.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="ag-btn-ghost"
                  onClick={() => handleDeleteNotice(n.id, n.title)}
                  disabled={deleting === n.id}
                  aria-label={`Apagar aviso ${n.title}`}
                >
                  {deleting === n.id ? '...' : 'Apagar'}
                </button>
              </div>
            ))}
          </>
        )}

        {/* ════════════════════ ABA: EVENTOS ══════════════════════════════ */}
        {tab === 'events' && (
          <>
            <form className="ag-form" onSubmit={handleAddEvent} noValidate>
              <label className="ag-label">
                Título *
                <input
                  type="text"
                  className="ag-input"
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  maxLength={100}
                  required
                />
              </label>

              <div className="ag-two-col">
                <label className="ag-label">
                  Categoria
                  <select
                    className="ag-select"
                    value={evCat}
                    onChange={(e) => setEvCat(e.target.value as AgendaCategory)}
                  >
                    {(Object.entries(CATEGORY_LABELS).filter(([k]) => k !== 'all') as [AgendaCategory, string][]).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="ag-label">
                  Data *
                  <input
                    type="date"
                    className="ag-input"
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="ag-two-col">
                <label className="ag-label">
                  Horário início
                  <input
                    type="time"
                    className="ag-input"
                    value={evTime}
                    onChange={(e) => setEvTime(e.target.value)}
                  />
                </label>
                <label className="ag-label">
                  Horário fim
                  <input
                    type="time"
                    className="ag-input"
                    value={evTimeEnd}
                    onChange={(e) => setEvTimeEnd(e.target.value)}
                  />
                </label>
              </div>

              <label className="ag-label">
                Local
                <input
                  type="text"
                  className="ag-input"
                  value={evPlace}
                  onChange={(e) => setEvPlace(e.target.value)}
                  maxLength={80}
                  placeholder="Ex: Salão Paroquial"
                />
              </label>

              <label className="ag-label">
                Descrição
                <textarea
                  className="ag-textarea"
                  value={evDesc}
                  onChange={(e) => setEvDesc(e.target.value)}
                  rows={3}
                  maxLength={800}
                />
              </label>

              <label className="ag-checkbox-label">
                <input
                  type="checkbox"
                  checked={evVisible}
                  onChange={(e) => setEvVisible(e.target.checked)}
                />
                Visível na agenda pública
              </label>

              <button type="submit" className="ag-btn" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Salvando...' : 'Adicionar evento'}
              </button>
            </form>

            {adminEvents.length === 0 ? (
              <p style={{ color: 'var(--ag-mute)', fontSize: 14, marginTop: 12 }}>
                Nenhum evento criado aqui ainda.
              </p>
            ) : (
              <>
                <h3 style={{ marginTop: 20, marginBottom: 8, fontSize: 14 }}>Eventos criados</h3>
                {adminEvents.map((ev) => (
                  <div className="ag-item-row" key={ev.id}>
                    <div style={{ minWidth: 0 }}>
                      <div className="ag-item-label">
                        {!ev.visible && (
                          <span style={{ color: 'var(--ag-mute)', fontWeight: 400, fontSize: 11, marginRight: 4 }}>[oculto]</span>
                        )}
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ag-mute)', marginTop: 2 }}>
                        {ev.date}{ev.time ? ` • ${ev.time}${ev.timeEnd ? `–${ev.timeEnd}` : ''}` : ''}{ev.place ? ` • ${ev.place}` : ''}
                      </div>
                    </div>
                    <button
                      className="ag-btn-ghost"
                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                      disabled={deleting === ev.id}
                      aria-label={`Remover evento ${ev.title}`}
                    >
                      {deleting === ev.id ? '...' : 'Remover'}
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ════════════════════ ABA: TEMAS ═════════════════════════════════ */}
        {tab === 'themes' && (
          <>
            {/* Tema ativo agora */}
            <div style={{ background: 'var(--theme-tint)', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: 'var(--ag-mute)', marginBottom: 2 }}>Tema ativo agora</p>
              <p style={{ fontWeight: 700, color: 'var(--theme-primary)', fontSize: 14 }}>
                {activeTheme
                  ? `${themeLabel(activeTheme.theme)}${activeTheme.isNovena ? ` – dia ${activeTheme.novenaDay ?? '?'} de 9` : activeTheme.isFeast ? ' – Dia da festa' : ''}`
                  : 'Santa Terezinha (padrão)'}
              </p>
              {hasForced && (
                <button
                  className="ag-btn-link"
                  style={{ fontSize: 12, marginTop: 4 }}
                  onClick={handleClearForced}
                >
                  Voltar ao automático
                </button>
              )}
            </div>

            {/* Lista de temas */}
            {allThemes.map((t) => {
              const isDefault = t.id.startsWith('__');
              return (
                <div className="ag-item-row" key={t.id} style={{ alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="ag-item-label" style={{ fontSize: 13 }}>
                      {t.forced && <span style={{ color: 'var(--theme-primary)', marginRight: 4 }}>★</span>}
                      {themeLabel(t)}
                      {isDefault && <span style={{ color: 'var(--ag-mute)', fontWeight: 400, fontSize: 11, marginLeft: 4 }}>(padrão)</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ag-mute)', marginTop: 2 }}>
                      Novena: {formatDateBR(t.noveenaStart)} → Festa: {formatDateBR(t.feastDate)}
                      {t.priority && <span style={{ marginLeft: 6, color: 'var(--theme-primary)' }}>• prioridade</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {!isDefault && (
                      <button
                        className="ag-btn-ghost"
                        style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => handleForceTheme(t.id)}
                        disabled={t.forced}
                        aria-label={`Forçar tema ${themeLabel(t)}`}
                      >
                        {t.forced ? 'Ativo' : 'Forçar'}
                      </button>
                    )}
                    {!isDefault && (
                      <button
                        className="ag-btn-ghost"
                        style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => handleTogglePriority(t)}
                        aria-label={`Alternar prioridade de ${themeLabel(t)}`}
                      >
                        {t.priority ? 'Prioridade: sim' : 'Prioridade: não'}
                      </button>
                    )}
                    {!isDefault && (
                      <button
                        className="ag-btn-ghost"
                        style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => handleDeleteTheme(t.id)}
                        disabled={deleting === t.id}
                        aria-label={`Remover tema ${themeLabel(t)}`}
                      >
                        {deleting === t.id ? '...' : 'Remover'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Formulário: novo tema customizado */}
            <h3 style={{ marginTop: 20, marginBottom: 10, fontSize: 14 }}>
              Adicionar / substituir tema
            </h3>
            <form className="ag-form" onSubmit={handleAddTheme} noValidate>
              <label className="ag-label">
                Santo
                <select
                  className="ag-select"
                  value={thSaint}
                  onChange={(e) => setThSaint(e.target.value as SaintKey)}
                >
                  {SAINT_KEYS.map((k) => (
                    <option key={k} value={k}>{SAINT_DISPLAY_NAMES[k]}</option>
                  ))}
                </select>
              </label>

              {thSaint === 'nossa_senhora' && (
                <label className="ag-label">
                  Invocação
                  <select
                    className="ag-select"
                    value={thInvocation}
                    onChange={(e) => setThInvocation(e.target.value as MarianInvocation | '')}
                  >
                    <option value="">— selecione —</option>
                    {MARIAN_INVOCATIONS.map((inv) => (
                      <option key={inv.key} value={inv.key}>{inv.label}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="ag-label">
                Nome (ex: "Novena de São José")
                <input
                  type="text"
                  className="ag-input"
                  value={thName}
                  onChange={(e) => setThName(e.target.value)}
                  maxLength={80}
                  placeholder={SAINT_DISPLAY_NAMES[thSaint]}
                />
              </label>

              <label className="ag-label">
                Frase de apoio
                <input
                  type="text"
                  className="ag-input"
                  value={thSubtitle}
                  onChange={(e) => setThSubtitle(e.target.value)}
                  maxLength={120}
                />
              </label>

              <div className="ag-two-col">
                <label className="ag-label">
                  Início da novena
                  <input
                    type="date"
                    className="ag-input"
                    value={thNovenaStart}
                    onChange={(e) => setThNovenaStart(e.target.value)}
                    required
                  />
                </label>
                <label className="ag-label">
                  Dia da festa
                  <input
                    type="date"
                    className="ag-input"
                    value={thFeastDate}
                    onChange={(e) => setThFeastDate(e.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="ag-label">
                Fim do tema (opcional — padrão: dia da festa)
                <input
                  type="date"
                  className="ag-input"
                  value={thEndDate}
                  onChange={(e) => setThEndDate(e.target.value)}
                />
              </label>

              <label className="ag-label">
                URL do brasão (PNG ou SVG, opcional)
                <input
                  type="url"
                  className="ag-input"
                  value={thCrestUrl}
                  onChange={(e) => setThCrestUrl(e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <label className="ag-checkbox-label">
                <input
                  type="checkbox"
                  checked={thPriority}
                  onChange={(e) => setThPriority(e.target.checked)}
                />
                Prioridade (vence conflito de datas em empate)
              </label>

              <button type="submit" className="ag-btn" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? 'Salvando...' : 'Salvar tema'}
              </button>
            </form>

            <p style={{ fontSize: 11, color: 'var(--ag-mute)', marginTop: 8 }}>
              Os temas padrão são automáticos. Adicione um tema customizado para sobrescrever datas ou adicionar novos.
            </p>
          </>
        )}
      </div>
    </dialog>
  );
};

export default AdminPanel;
