/**
 * Agenda dos Jovens – Paróquia Santa Terezinha do Menino Jesus
 *
 * Página pública completa com:
 * - Hero animado com logo e botão de acesso
 * - Bloco "Próximo encontro"
 * - Avisos (com destaque urgente)
 * - Filtros por categoria + toggle Lista/Calendário
 * - Lista de próximos eventos agrupada por mês
 * - Calendário mensal com pontos coloridos
 * - Aniversariantes do mês
 * - Modal de detalhe do evento
 * - Login seguro (Firebase Auth)
 * - Painel Admin (Eventos, Avisos, Aniversários)
 */

import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import logoHoriz from '../../assets/logotipo_jovens_hor_branco.svg';
import './agenda.css';

import type {
  AgendaEvent,
  AgendaNotice,
  AgendaBirthday,
  AgendaFilter,
  AgendaView,
} from '../../types/agenda.types';
import { CATEGORY_LABELS, WEEKDAYS, MONTHS, NOTICE_ORIGIN_LABELS } from '../../types/agenda.types';
import {
  fetchAgendaEvents,
  fetchAgendaBirthdays,
  subscribeAgendaNotices,
} from '../../services/agenda.service';
import { useAuth } from '../../contexts/AuthContext';
import { useNovena } from '../../hooks/useNovena';
import { useFeastTheme } from '../../hooks/useFeastTheme';

import { pad, todayStr, parseDate, formatWhen, getCatVar } from './agendaUtils';
import EventDetailModal from './EventDetailModal';
import LoginModal from './LoginModal';
import AdminPanel from './AdminPanel';
import NovenaSection from './NovenaSection';
import HeroDecoration from './HeroDecoration';
import CrestPlate from './CrestPlate';

// ─── Helpers locais ───────────────────────────────────────────────────────────

const FILTER_ITEMS: [AgendaFilter, string][] = Object.entries(CATEGORY_LABELS) as [AgendaFilter, string][];

const matchesFilter = (event: AgendaEvent, filter: AgendaFilter): boolean =>
  filter === 'all' || event.g === filter;

// ─── EventCard memoizado ──────────────────────────────────────────────────────

interface EventCardProps {
  event: AgendaEvent;
  today: string;
  onOpen: (e: AgendaEvent) => void;
}

const EventCard = memo<EventCardProps>(({ event, today, onOpen }) => {
  const d = parseDate(event.date);
  const catColor = getCatVar(event.g);
  const isToday = event.date === today;
  return (
    <button
      className={`ag-event-card${isToday ? ' today-event' : ''}`}
      style={{ '--cat-color': catColor } as React.CSSProperties}
      onClick={() => onOpen(event)}
      aria-label={`Ver detalhes: ${event.title}${isToday ? ' — hoje' : ''}`}
    >
      <div className="ag-event-day">
        {d.getDate()}
        <small>{WEEKDAYS[d.getDay()]}</small>
      </div>
      <div>
        <div className="ag-event-cat">{CATEGORY_LABELS[event.g] ?? 'Outros'}</div>
        <h3>{event.title}</h3>
        {(event.time || event.place) && (
          <div className="ag-event-meta">
            {[event.time, event.place].filter(Boolean).join(' – ')}
          </div>
        )}
      </div>
      {event.art_url && (
        <img className="ag-thumb" src={event.art_url} alt="" aria-hidden="true" />
      )}
    </button>
  );
});
EventCard.displayName = 'EventCard';

// ─── Mapa de nomes dos santos para o logotipo temático ───────────────────────
const SAINT_LINE_NAMES: Record<string, string> = {
  terezinha:    'Santa Terezinha',
  jose:         'São José',
  carlo:        'São Carlo Acutis',
  frassati:     'Pier Giorgio Frassati',
  nossa_senhora:'Nossa Senhora',
  joana:        "Santa Joana d'Arc",
  inacio:       'Santo Inácio de Loyola',
};

// ─── Componente principal ─────────────────────────────────────────────────────

const AgendaPage: React.FC = () => {
  const { user, signIn, signOut, resetPassword } = useAuth();

  // ── Dados ──────────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [notices, setNotices] = useState<AgendaNotice[]>([]);
  const [birthdays, setBirthdays] = useState<AgendaBirthday[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  // isAdmin derivado direto do role já resolvido pelo AuthContext — sem fetch extra
  const isAdmin = user?.role === 'admin' || user?.role === 'coordinator';

  // ── Tema Festivo ───────────────────────────────────────────────────────────
  const { activeTheme, dataTema, allThemes } = useFeastTheme();

  // ── Novena ─────────────────────────────────────────────────────────────────
  const {
    novenas, loading: novenaLoading,
    novenaDateSet: novenaDateSetFromApi,
    novenaCalItems,
    loadCompleta, toggleDay: toggleNovenaDay,
  } = useNovena();

  // ── Estado de navegação ────────────────────────────────────────────────────
  const today = todayStr();
  const now = new Date();
  const [filter, setFilter] = useState<AgendaFilter>('all');
  const [showNovenas, setShowNovenas] = useState(false);
  const [view, setView] = useState<AgendaView>('list');
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-based
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // ── Modais ─────────────────────────────────────────────────────────────────
  const [detailEvent, setDetailEvent] = useState<AgendaEvent | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // ── Carregar eventos (Sheets) e aniversariantes (Calendar) ────────────────
  useEffect(() => {
    setDataLoading(true);
    Promise.all([fetchAgendaEvents(), fetchAgendaBirthdays()])
      .then(([evs, bds]) => { setEvents(evs); setBirthdays(bds); })
      .catch((err) => { console.error('[Agenda] Erro ao carregar dados:', err); })
      .finally(() => setDataLoading(false));
  }, []);

  // ── Subscription de avisos do Firestore (tempo real) ──────────────────────
  useEffect(() => {
    const unsub = subscribeAgendaNotices((data) => setNotices(data));
    return unsub;
  }, []);

  // ── Dados derivados ────────────────────────────────────────────────────────
  // novenaDateSet e novenaCalItems vêm do hook (API /datas?ano=) — cobre o ano inteiro
  const novenaDateSet = novenaDateSetFromApi;

  const upcomingFiltered = events
    .filter((e) => e.visible && e.date >= today && matchesFilter(e, filter))
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')));

  const nextEvent = upcomingFiltered[0] ?? null;

  const sortedNotices = [...notices].sort(
    (a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0)
  );

  // ── Calendário ─────────────────────────────────────────────────────────────
  const calMonthStr = `${calYear}-${pad(calMonth + 1)}`;
  const calFiltered = events.filter(
    (e) => e.visible && e.date.startsWith(calMonthStr) && matchesFilter(e, filter)
  );
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstWeekday = new Date(calYear, calMonth, 1).getDay();

  const prevMonth = () => {
    setSelectedDay(null);
    setCalMonth((m) => { if (m === 0) { setCalYear((y) => y - 1); return 11; } return m - 1; });
  };
  const nextMonth = () => {
    setSelectedDay(null);
    setCalMonth((m) => { if (m === 11) { setCalYear((y) => y + 1); return 0; } return m + 1; });
  };

  const toggleDay = useCallback((d: number) => {
    setSelectedDay((prev) => (prev === d ? null : d));
  }, []);

  // Eventos a mostrar na lista do calendário
  const calListEvents = calFiltered
    .filter((e) => !selectedDay || +e.date.slice(8) === selectedDay)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));

  // Itens de novena a mostrar na lista do calendário — expandidos por dia, filtrados pelo mês visível
  const calNovenaItems = React.useMemo(() => {
    // Só mostra se o checkbox está ativo E um dia foi selecionado no calendário
    if (!showNovenas || !selectedDay) return [];
    const items: { slug: string; nome: string; dateStr: string }[] = [];
    for (const n of novenaCalItems) {
      const start = new Date(n.inicio + 'T00:00:00');
      const end   = new Date(n.fim   + 'T00:00:00');
      for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        if (!dateStr.startsWith(calMonthStr)) continue;
        if (+dateStr.slice(8) !== selectedDay) continue;
        items.push({ slug: `${n.slug}-${dateStr}`, nome: n.nome, dateStr });
      }
    }
    // Deduplica por dateStr+nome (API pode ter 2 slugs pra mesma novena)
    const seen = new Set<string>();
    return items.filter((i) => {
      const key = `${i.dateStr}-${i.nome}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [novenaCalItems, calMonthStr, selectedDay, filter]);

  // Aniversariantes do mês (usa mês do calendário se visão = 'calendar', senão mês atual)
  const bdMonth = view === 'calendar' ? calMonth : now.getMonth();
  const bdFiltered = birthdays
    .filter((b) => b.m === bdMonth + 1)
    .sort((a, b) => a.d - b.d);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const scrollToContent = () => {
    // Rola suavemente até logo abaixo do hero ao mudar filtro
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFilterChange = (f: AgendaFilter) => {
    setFilter(f);
    setSelectedDay(null);
    // Não rola ao mudar filtro — mantém posição do usuário
  };

  const handleViewChange = (v: AgendaView) => {
    setView(v);
    scrollToContent();
  };

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    setPanelOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setPanelOpen(false);
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  const isThemeActive = !!(activeTheme && (activeTheme.isNovena || activeTheme.isFeast));

  // Título e subtítulo do hero
  const heroTitle = isThemeActive
    ? activeTheme!.theme.name
    : 'Agenda dos jovens';
  const heroSubtitle = isThemeActive
    ? activeTheme!.theme.subtitle
    : (() => {
        const d = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        return d.charAt(0).toUpperCase() + d.slice(1);
      })();

  // Etiqueta-contador no hero
  const counter = (() => {
    if (!activeTheme) return null;
    if (activeTheme.isFeast) return { label: 'Hoje é a festa', isFeast: true };
    if (activeTheme.isNovena && activeTheme.novenaDay !== null)
      return { label: `Dia ${activeTheme.novenaDay} de 9 da novena`, isFeast: false };
    // Antes da novena: faltam N dias
    const start = new Date(activeTheme.theme.noveenaStart + 'T00:00:00');
    const diff = Math.round((start.getTime() - new Date().setHours(0,0,0,0)) / 86_400_000);
    if (diff > 0) return { label: `Faltam ${diff} dia${diff !== 1 ? 's' : ''} para a novena`, isFeast: false };
    return null;
  })();

  return (
    <div className="agenda-root" data-tema={dataTema}>
      {/* ═══════════════════ HERO ══════════════════════════════════════════ */}
      <header className="ag-hero">
        {/* Background real + decoração SVG (aria-hidden) */}
        {isThemeActive && <HeroDecoration saintKey={activeTheme!.theme.saintKey} />}

        {/* ── Identidade: brasão + texto real do logotipo ─────────────── */}
        <div className={`ag-hero-identity${isThemeActive ? '' : ' is-default'}`}>
          <div className="ag-hero-identity-left">
            {isThemeActive ? (
              <>
                <CrestPlate
                  saintKey={activeTheme!.theme.saintKey}
                  crestUrl={activeTheme!.theme.crestUrl}
                />
                <div className="ag-logo-text">
                  <span className="ag-logo-text-grupo">Grupo de Jovens</span>
                  <span className="ag-logo-text-jovens">Jovens</span>
                  <span className="ag-logo-text-sta">Sta. Terezinha</span>
                  <span className="ag-logo-text-saint">
                    {SAINT_LINE_NAMES[activeTheme!.theme.saintKey] ?? ''}
                  </span>
                </div>
              </>
            ) : (
              <img
                src={logoHoriz}
                alt="Grupo de Jovens – Sta. Terezinha"
                className="ag-logo"
              />
            )}
          </div>
          {/* Botão de acesso sempre à direita */}
          <button
            className={`ag-login-btn${user ? '' : ' is-ghost'}`}
            onClick={() => {
              if (user && isAdmin) setPanelOpen(true);
              else setLoginOpen(true);
            }}
            aria-label={user && isAdmin ? 'Abrir painel de administração' : 'Acesso da coordenação'}
          >
            {user && isAdmin ? 'Painel' : 'Adm'}
          </button>
        </div>

        {/* ── Título e frase ──────────────────────────────────────────── */}
        <div className="ag-headline">
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
          {/* Etiqueta-contador da novena/festa */}
          {counter && (
            <div className={`ag-theme-counter${counter.isFeast ? ' is-feast' : ''}`}
              aria-live="polite">
              <span className="ag-theme-counter-dot" aria-hidden="true" />
              {counter.label}
            </div>
          )}
        </div>
      </header>

      {/* FeastBanner removido — as informações estão integradas no hero */}

      {/* ═══════════════════ MAIN ══════════════════════════════════════════ */}
      <main className="ag-main" ref={mainRef}>

        {/* ─── Próximo encontro ──────────────────────────────────────────── */}
        {dataLoading ? (
          <div className="ag-skeleton-next" />
        ) : nextEvent ? (
          <button
            className={`ag-next${nextEvent.art_url ? '' : ' no-art'}`}
            style={{
              '--cat-color': getCatVar(nextEvent.g),
              ...(nextEvent.art_url
                ? { backgroundImage: `url(${nextEvent.art_url})` }
                : {}),
            } as React.CSSProperties}
            onClick={() => setDetailEvent(nextEvent)}
            aria-label={`Próximo encontro: ${nextEvent.title}`}
          >
            <div className="ag-next-in">
              <small>Próximo encontro</small>
              <h2>{nextEvent.title}</h2>
              <div className="ag-next-when">
                {formatWhen(nextEvent.date, nextEvent.time)}
                {nextEvent.place ? ` – ${nextEvent.place}` : ''}
              </div>
            </div>
          </button>
        ) : (
          <div
            className="ag-next no-art"
            style={{ '--cat-color': 'var(--ag-crisma)' } as React.CSSProperties}
          >
            <div className="ag-next-in">
              <small>Próximo encontro</small>
              <h2>Nada marcado por enquanto</h2>
              <div className="ag-next-when">
                Volte em breve, a coordenação publica novidades aqui.
              </div>
            </div>
          </div>
        )}

        {/* ─── Avisos ────────────────────────────────────────────────────── */}
        {sortedNotices.length > 0 && (
          <>
            <div className="ag-sec">
              <h2>Avisos</h2>
            </div>
            {sortedNotices.map((n) => (
              <div key={n.id} className={`ag-notice${n.urgent ? ' urgent' : ''}`}>
                {n.origin && (
                  <span className="ag-notice-origin" data-origin={n.origin}>
                    {NOTICE_ORIGIN_LABELS[n.origin]}
                  </span>
                )}
                <h3>{n.title}</h3>
                {n.text && <p>{n.text}</p>}
              </div>
            ))}
          </>
        )}

        {/* ─── Barra sticky: filtros + toggle ────────────────────────────── */}
        <div className="ag-bar">
          <div className="ag-tabs" role="tablist" aria-label="Filtrar por categoria">
            {FILTER_ITEMS.map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                className={`ag-tab${filter === key ? ' active' : ''}`}
                style={{ '--tab-color': getCatVar(key) } as React.CSSProperties}
                onClick={() => handleFilterChange(key)}
              >
                {label}
              </button>
            ))}
            {/* Checkbox Novenas — separado dos filtros de categoria */}
            <label className="ag-tab-novena-check" aria-label="Mostrar novenas no calendário">
              <input
                type="checkbox"
                checked={showNovenas}
                onChange={(e) => setShowNovenas(e.target.checked)}
              />
              Novenas
            </label>
          </div>
          <div className="ag-view-toggle" role="group" aria-label="Modo de visualização">
            <button
              className={`ag-seg${view === 'list' ? ' active' : ''}`}
              onClick={() => handleViewChange('list')}
              aria-pressed={view === 'list'}
            >
              Próximos
            </button>
            <button
              className={`ag-seg${view === 'calendar' ? ' active' : ''}`}
              onClick={() => handleViewChange('calendar')}
              aria-pressed={view === 'calendar'}
            >
              Mês
            </button>
          </div>
        </div>

        {/* ─── Conteúdo: Lista ou Calendário ─────────────────────────────── */}
        {dataLoading ? (
          <>
            <div className="ag-skeleton" />
            <div className="ag-skeleton" style={{ opacity: 0.7 }} />
            <div className="ag-skeleton" style={{ opacity: 0.4 }} />
          </>
        ) : view === 'list' ? (
          /* ── LISTA ─────────────────────────────────────────────────────── */
          upcomingFiltered.length === 0 ? (
            <p className="ag-empty">
              {'Nenhum evento nesta categoria. Escolha outra aba para ver mais.'}
            </p>
          ) : (
            (() => {
              const groups: { key: string; label: string; events: AgendaEvent[] }[] = [];
              upcomingFiltered.forEach((ev) => {
                const k = ev.date.slice(0, 7);
                const d = parseDate(ev.date);
                const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
                const grp = groups.find((g) => g.key === k);
                if (grp) grp.events.push(ev);
                else groups.push({ key: k, label, events: [ev] });
              });
              return groups.map((grp) => (
                <React.Fragment key={grp.key}>
                  <h2 className="ag-month-heading">{grp.label}</h2>
                  {grp.events.map((ev) => <EventCard key={ev.id} event={ev} today={today} onOpen={setDetailEvent} />)}
                </React.Fragment>
              ));
            })()
          )
        ) : (
          /* ── CALENDÁRIO ────────────────────────────────────────────────── */
          <>
            <div className="ag-cal-nav">
              <button
                className="ag-nav-btn"
                onClick={prevMonth}
                aria-label="Mês anterior"
              >
                ‹
              </button>
              <h2 style={{ textTransform: 'capitalize' }}>
                {MONTHS[calMonth]} {calYear}
              </h2>
              <button
                className="ag-nav-btn"
                onClick={nextMonth}
                aria-label="Próximo mês"
              >
                ›
              </button>
            </div>

            <div
              className="ag-cal-grid"
              role="grid"
              aria-label={`Calendário de ${MONTHS[calMonth]} ${calYear}`}
            >
              {/* Cabeçalho dias da semana */}
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="ag-dow" role="columnheader" aria-label={wd}>
                  {wd}
                </div>
              ))}

              {/* Células vazias iniciais */}
              {Array.from({ length: firstWeekday }, (_, i) => (
                <button key={`empty-${i}`} className="ag-day" disabled aria-hidden="true" />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calMonthStr}-${pad(dayNum)}`;
                const dayEvents = calFiltered.filter((e) => +e.date.slice(8) === dayNum);
                const hasBd = birthdays.some(
                  (b) => b.m === calMonth + 1 && b.d === dayNum
                );
                const isToday = dateStr === today;
                const isSelected = selectedDay === dayNum;
                const isNovenaDay = showNovenas && novenaDateSet.has(dateStr);
                const isFrassatiFeast = activeTheme?.theme.saintKey === 'frassati' && dateStr === activeTheme.theme.feastDate;

                const classes = [
                  'ag-day',
                  isToday ? 'today' : '',
                  isSelected ? 'selected' : '',
                  hasBd ? 'has-birthday' : '',
                  isNovenaDay ? 'novena-event' : '',
                  isFrassatiFeast ? 'frassati-feast' : '',
                ].filter(Boolean).join(' ');

                return (
                  <button
                    key={dayNum}
                    className={classes}
                    onClick={() => toggleDay(dayNum)}
                    aria-label={`${dayNum} de ${MONTHS[calMonth]}${dayEvents.length ? `, ${dayEvents.length} evento(s)` : ''}${hasBd ? ', aniversário' : ''}`}
                    aria-pressed={isSelected}
                  >
                    {dayNum}
                    {dayEvents.length > 0 && (
                      <span className="ag-dots" aria-hidden="true">
                        {dayEvents.slice(0, 3).map((ev) => (
                          <span
                            key={ev.id}
                            className="ag-dot"
                            style={{ '--dot-color': getCatVar(ev.g) } as React.CSSProperties}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lista do dia selecionado / todos do mês */}
            {calListEvents.length === 0 && calNovenaItems.length === 0 ? (
              <p className="ag-empty">
                {selectedDay
                  ? 'Sem eventos neste dia.'
                  : 'Sem eventos neste período.'}
              </p>
            ) : (
              <>
                {calNovenaItems.map((n) => (
                  <div key={n.slug} className="ag-novena-cal-item">
                    <div className="ag-novena-cal-icon" aria-hidden="true">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3a1 1 0 0 0-1 1v8"/><path d="M7 4a1 1 0 0 0-1 1v7"/><path d="M5 6a1 1 0 0 0-1 1v5.5"/>
                        <path d="M5 6c0-1-1-2-2-2S2 5 2 6v5c0 3.31 2.69 6 6 6h2"/>
                        <path d="M15 3a1 1 0 0 1 1 1v8"/><path d="M17 4a1 1 0 0 1 1 1v7"/><path d="M19 6a1 1 0 0 1 1 1v5.5"/>
                        <path d="M19 6c0-1 1-2 2-2s1 1 1 2v5c0 3.31-2.69 6-6 6h-2"/>
                        <path d="M10 11V4a1 1 0 0 1 2 0v7"/><path d="M14 11V4a1 1 0 0 0-2 0v7"/>
                        <path d="M10 17v2c0 1.1.9 2 2 2s2-.9 2-2v-2"/>
                      </svg>
                    </div>
                    <div className="ag-novena-cal-info">
                      <span className="ag-novena-cal-label">Novena</span>
                      <span className="ag-novena-cal-name">{n.nome}</span>
                    </div>
                  </div>
                ))}
                {calListEvents.map((ev) => <EventCard key={ev.id} event={ev} today={today} onOpen={setDetailEvent} />)}
              </>
            )}
          </>
        )}

        {/* ─── Aniversariantes do mês ────────────────────────────────────── */}
        <div className="ag-birthdays">
          <div className="ag-sec" style={{ margin: '0 0 12px' }}>
            <h2 style={{ fontSize: 18 }}>
              Aniversariantes de {MONTHS[bdMonth]}
            </h2>
          </div>

          {bdFiltered.length === 0 ? (
            <p className="ag-empty" style={{ padding: '8px 0' }}>
              Nenhum aniversário cadastrado neste mês.
            </p>
          ) : (
            <ul className="ag-bd-list" role="list">
              {bdFiltered.map((b) => {
                const isTodayBd =
                  b.d === now.getDate() && b.m === now.getMonth() + 1;
                const initials = b.name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w: string) => w[0].toUpperCase())
                  .join('');
                return (
                  <li
                    key={b.id}
                    className={`ag-bd-item${isTodayBd ? ' today-bd' : ''}`}
                    aria-label={`${b.name}${isTodayBd ? ' – aniversário hoje' : ''}`}
                  >
                    <span className="ag-bd-day">{pad(b.d)}</span>
                    <span className="ag-bd-avatar" aria-hidden="true">
                      {isTodayBd ? (
                        /* ícone de bolinho SVG */
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M12 6c-.55 0-1-.45-1-1V3.5C11 2.67 11.67 2 12.5 2S14 2.67 14 3.5c0 .47-.26.88-.65 1.1L12 6z" fill="currentColor"/>
                          <rect x="3" y="9" width="18" height="4" rx="2" fill="currentColor" opacity=".35"/>
                          <rect x="5" y="13" width="14" height="7" rx="1.5" fill="currentColor"/>
                          <path d="M8 9V7.5C8 6.67 8.67 6 9.5 6S11 6.67 11 7.5V9M13 9V7.5C13 6.67 13.67 6 14.5 6S16 6.67 16 7.5V9" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                          <circle cx="8.5" cy="16.5" r="1" fill="white" opacity=".6"/>
                          <circle cx="12" cy="15" r="1" fill="white" opacity=".6"/>
                          <circle cx="15.5" cy="16.5" r="1" fill="white" opacity=".6"/>
                        </svg>
                      ) : initials}
                    </span>
                    <span className="ag-bd-name">{b.name}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ─── Lema do tema Inácio ────────────────────────────────────────── */}
        {activeTheme?.theme.saintKey === 'inacio' && (
          <p className="ag-tema-footer">Ad maiorem Dei gloriam — Para a maior glória de Deus</p>
        )}

        {/* ─── Rodapé ────────────────────────────────────────────────────── */}
        <footer className="ag-footer">
          <p>Paróquia Santa Terezinha do Menino Jesus</p>
          <a
            href="https://www.instagram.com/juventude_terezinha/"
            target="_blank"
            rel="noopener noreferrer"
            className="ag-instagram-link"
            aria-label="Siga o Grupo de Jovens no Instagram"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            @gjstaterezinha
          </a>
          <p style={{ marginTop: 8, fontSize: 11 }}>
            {user && isAdmin
              ? <button className="ag-btn-link" style={{ fontSize: 11 }} onClick={() => setPanelOpen(true)}>Painel da coordenação</button>
              : <button className="ag-btn-link" style={{ fontSize: 11 }} onClick={() => setLoginOpen(true)}>Área da coordenação</button>
            }
          </p>
        </footer>
      </main>

      {/* ═══════════════════ NOVENA FAB + SHEET ═══════════════════════════ */}
      {!novenaLoading && novenas.length > 0 && (
        <NovenaSection
          states={novenas}
          onToggleDay={toggleNovenaDay}
          onLoadCompleta={loadCompleta}
        />
      )}

      {/* ═══════════════════ MODAIS ════════════════════════════════════════ */}
      <EventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
      />

      {/* LoginModal sempre montado para responder imediatamente ao clique */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
        signIn={signIn}
        resetPassword={resetPassword}
      />

      {/* AdminPanel sempre montado quando o usuário está logado (admin ou não),
          para evitar flickering enquanto checkIsAgendaAdmin resolve */}
      {!!user && (
        <AdminPanel
          open={panelOpen}
          displayName={user?.displayName ?? ''}
          notices={notices}
          allThemes={allThemes}
          activeTheme={activeTheme}
          onClose={() => setPanelOpen(false)}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
};

export default AgendaPage;
