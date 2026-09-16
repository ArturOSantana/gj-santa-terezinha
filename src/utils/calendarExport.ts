import { Event } from '../types';
import { EVENT_CATEGORIES, ACTIVITY_TYPES } from './constants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Gera um arquivo .ics (iCalendar) completo contendo múltiplos eventos
 */
export function generateFullCalendarICS(events: Event[], calendarName: string = 'GJ Santa Terezinha - Calendário'): void {
  const pad = (n: number) => String(n).padStart(2, '0');

  const toICSDate = (date: Date, time?: string): string => {
    const [h = '00', m = '00'] = (time ?? '00:00').split(':');
    const y = date.getFullYear();
    const mo = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    return `${y}${mo}${d}T${h}${m}00`;
  };

  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const vevents = events.map((evt) => {
    const dateObj = evt.date instanceof Date ? evt.date : new Date(evt.date);
    const dtStart = toICSDate(dateObj, evt.startTime);
    const dtEnd = evt.endTime ? toICSDate(dateObj, evt.endTime) : (evt.startTime ? toICSDate(dateObj, evt.startTime) : `${dateObj.getFullYear()}${pad(dateObj.getMonth() + 1)}${pad(dateObj.getDate())}`);
    const uid = `${evt.id || Math.random().toString(36).substring(2)}@gjsantaterezinha`;
    const catLabel = EVENT_CATEGORIES[evt.category as keyof typeof EVENT_CATEGORIES]?.label || evt.category || '';
    const summary = evt.title.replace(/[\\,;]/g, (match) => `\\${match}`);
    const description = [
      evt.description || '',
      catLabel ? `Categoria: ${catLabel}` : '',
      evt.location ? `Local: ${evt.location}` : '',
    ].filter(Boolean).join('\\n').replace(/\n/g, '\\n');

    const lines = [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      description ? `DESCRIPTION:${description}` : '',
      evt.location ? `LOCATION:${evt.location.replace(/[\\,;]/g, (match) => `\\${match}`)}` : '',
      catLabel ? `CATEGORIES:${catLabel}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].filter(Boolean);

    return lines.join('\r\n');
  });

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GJ Santa Terezinha//Calendário Oficial//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:America/Sao_Paulo',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calendario-gj-santa-terezinha-${format(new Date(), 'yyyy-MM')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Gera uma janela de impressão/PDF de alta fidelidade e estética refinada ("Santa Terezinha")
 */
export function printBeautifulCalendar(events: Event[], title: string = 'Calendário Oficial — Grupo de Jovens Santa Terezinha'): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para visualizar ou imprimir o calendário.');
    return;
  }

  // Ordena os eventos por data
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return timeA - timeB;
  });

  // Agrupa eventos por Mês/Ano
  const grouped: Record<string, Event[]> = {};
  sortedEvents.forEach((evt) => {
    const d = evt.date instanceof Date ? evt.date : new Date(evt.date);
    const key = format(d, "MMMM 'de' yyyy", { locale: ptBR });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(evt);
  });

  const monthsHtml = Object.entries(grouped).map(([monthYear, evts]) => {
    const eventCardsHtml = evts.map((evt) => {
      const d = evt.date instanceof Date ? evt.date : new Date(evt.date);
      const day = format(d, 'dd');
      const weekDay = format(d, 'EEEE', { locale: ptBR });
      const cat = EVENT_CATEGORIES[evt.category as keyof typeof EVENT_CATEGORIES];
      const catColor = cat?.color || '#c15c71';
      const catLabel = cat?.label || evt.category || 'Geral';
      const actLabel = evt.activityType ? ACTIVITY_TYPES[evt.activityType as keyof typeof ACTIVITY_TYPES]?.label : null;

      return `
        <div class="event-card">
          <div class="date-badge">
            <span class="day">${day}</span>
            <span class="weekday">${weekDay.slice(0, 3).toUpperCase()}</span>
          </div>
          <div class="event-details">
            <div class="event-header">
              <h3 class="event-title">${evt.title}</h3>
              <div class="badges">
                <span class="badge" style="background-color: ${catColor}15; color: ${catColor}; border: 1px solid ${catColor}40;">
                  ${catLabel}
                </span>
                ${actLabel ? `<span class="badge badge-activity">${actLabel}</span>` : ''}
              </div>
            </div>
            ${evt.description ? `<p class="event-desc">${evt.description}</p>` : ''}
            <div class="event-meta">
              ${evt.startTime ? `
                <span class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  ${evt.startTime}${evt.endTime ? ` - ${evt.endTime}` : ''}
                </span>
              ` : ''}
              ${evt.location ? `
                <span class="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  ${evt.location}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="month-section">
        <div class="month-title-wrapper">
          <h2 class="month-title">${monthYear}</h2>
          <span class="month-count">${evts.length} ${evts.length === 1 ? 'evento' : 'eventos'}</span>
        </div>
        <div class="events-grid">
          ${eventCardsHtml}
        </div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #241019;
      --bg-soft: #2f1522;
      --rose: #c15c71;
      --rose-deep: #9a3450;
      --gold: #d3a34c;
      --gold-light: #f7efdd;
      --gold-border: rgba(211, 163, 76, 0.3);
      --ink: #1c0c15;
      --ink-dim: #5c453d;
      --sage: #7fa176;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #fbf8f2;
      color: var(--ink);
      line-height: 1.5;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .container {
      max-width: 860px;
      margin: 0 auto;
      padding: 32px 24px;
    }

    /* Top Action Bar (hidden on print) */
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-dark);
      padding: 14px 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .action-bar-brand {
      color: var(--gold-light);
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      letter-spacing: 0.08em;
    }
    .btn-print {
      background: linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(193, 92, 113, 0.4);
      transition: all 0.2s;
    }
    .btn-print:hover {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    /* Header Banner */
    .header-banner {
      background: linear-gradient(145deg, var(--bg-dark) 0%, var(--bg-soft) 100%);
      border: 1px solid var(--gold-border);
      border-radius: 20px;
      padding: 36px 28px;
      text-align: center;
      color: #fff;
      margin-bottom: 36px;
      position: relative;
      box-shadow: 0 10px 30px rgba(36, 16, 25, 0.08);
    }
    .header-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--gold);
      margin-bottom: 8px;
      border-bottom: 1px solid var(--gold);
      padding-bottom: 2px;
    }
    .header-title {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--gold-light);
      letter-spacing: 0.02em;
      margin-bottom: 8px;
    }
    .header-subtitle {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      color: #e2cad2;
      font-size: 1.05rem;
    }
    .header-meta {
      margin-top: 16px;
      font-size: 0.8rem;
      color: #d3a34c;
      opacity: 0.85;
    }

    /* Month Section */
    .month-section {
      margin-bottom: 36px;
      page-break-inside: avoid;
    }
    .month-title-wrapper {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      border-bottom: 2px solid var(--gold);
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .month-title {
      font-family: 'Cinzel', serif;
      font-size: 1.35rem;
      color: var(--bg-dark);
      text-transform: capitalize;
    }
    .month-count {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--rose-deep);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Events */
    .events-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .event-card {
      display: flex;
      align-items: stretch;
      background: #ffffff;
      border: 1px solid #e8dfd3;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      page-break-inside: avoid;
      transition: transform 0.15s;
    }
    .date-badge {
      background: linear-gradient(180deg, var(--bg-dark) 0%, var(--bg-soft) 100%);
      color: var(--gold-light);
      min-width: 72px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      flex-shrink: 0;
      border-right: 2px solid var(--gold);
    }
    .date-badge .day {
      font-family: 'Cinzel', serif;
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1;
    }
    .date-badge .weekday {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--gold);
      margin-top: 4px;
      letter-spacing: 0.05em;
    }
    .event-details {
      padding: 14px 18px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 4px;
    }
    .event-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--ink);
      line-height: 1.3;
    }
    .badges {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    .badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-activity {
      background: #efe2c4;
      color: #6b5347;
      border: 1px solid rgba(211, 163, 76, 0.4);
    }
    .event-desc {
      font-size: 0.85rem;
      color: var(--ink-dim);
      margin-top: 4px;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    .event-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-top: 6px;
    }
    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.8rem;
      color: var(--rose-deep);
      font-weight: 600;
    }
    .meta-item svg {
      stroke: var(--rose);
    }

    /* Footer */
    .calendar-footer {
      margin-top: 48px;
      text-align: center;
      padding: 24px;
      border-top: 1px dashed var(--gold);
      color: var(--ink-dim);
      font-size: 0.8rem;
    }
    .footer-quote {
      font-family: 'Playfair Display', Georgia, serif;
      font-style: italic;
      color: var(--rose-deep);
      font-size: 0.95rem;
      margin-bottom: 6px;
    }

    @media print {
      .action-bar { display: none !important; }
      body { background-color: #fff; }
      .container { padding: 0; max-width: 100%; }
      .header-banner { border-radius: 10px; margin-bottom: 24px; }
      .event-card { box-shadow: none; border-color: #ccc; }
    }
  </style>
</head>
<body>
  <div class="action-bar">
    <div class="action-bar-brand">GJ SANTA TEREZINHA</div>
    <button class="btn-print" onclick="window.print()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Imprimir / Salvar PDF
    </button>
  </div>

  <div class="container">
    <div class="header-banner">
      <span class="header-badge">Agenda Oficial</span>
      <h1 class="header-title">Grupo de Jovens Santa Terezinha</h1>
      <p class="header-subtitle">"Passarei o meu céu fazendo o bem sobre a terra."</p>
      <div class="header-meta">Documento gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</div>
    </div>

    ${monthsHtml || '<p style="text-align:center; padding: 40px; color: #888;">Nenhum evento agendado para o período.</p>'}

    <div class="calendar-footer">
      <p class="footer-quote">Santa Teresinha do Menino Jesus, rogai por nós!</p>
      <p>Paróquia Santa Terezinha • Grupo de Jovens</p>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
