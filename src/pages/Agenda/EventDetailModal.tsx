/**
 * Modal de detalhe de evento
 */
import React, { useEffect, useRef } from 'react';
import type { AgendaEvent } from '../../types/agenda.types';
import { CATEGORY_LABELS } from '../../types/agenda.types';
import { formatWhen, getCatVar } from './agendaUtils';
import { useSwipeDown } from './useSwipeDown';

// ─── Helpers "Adicionar ao calendário" ───────────────────────────────────────

function toICSDate(dateStr: string, timeStr?: string): string {
  // Retorna string no formato YYYYMMDDTHHmmss (local) ou YYYYMMDD (all-day)
  const [y, m, d] = dateStr.split('-');
  if (!timeStr) return `${y}${m}${d}`;
  const [hh, mm] = timeStr.split(':');
  return `${y}${m}${d}T${hh}${mm}00`;
}

function buildGoogleCalendarUrl(event: AgendaEvent): string {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const start = toICSDate(event.date, event.time);
  // Se tiver hora: evento de 1h. Se all-day: passa só a data
  const end = event.time
    ? (() => {
        const [hh, mm] = event.time.split(':').map(Number);
        const endMin = mm + 60;
        const endH = hh + Math.floor(endMin / 60);
        return toICSDate(event.date, `${String(endH % 24).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`);
      })()
    : toICSDate(event.date);
  const params = new URLSearchParams({
    text: event.title,
    dates: `${start}/${end}`,
    ...(event.place ? { location: event.place } : {}),
    ...(event.desc  ? { details: event.desc }   : {}),
  });
  return `${base}&${params}`;
}

function downloadICS(event: AgendaEvent): void {
  const start = toICSDate(event.date, event.time);
  const end = event.time
    ? (() => {
        const [hh, mm] = event.time.split(':').map(Number);
        const endMin = mm + 60;
        const endH = hh + Math.floor(endMin / 60);
        return toICSDate(event.date, `${String(endH % 24).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`);
      })()
    : toICSDate(event.date);
  const allDay = !event.time;
  const dtStart = allDay ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`;
  const dtEnd   = allDay ? `DTEND;VALUE=DATE:${end}`     : `DTEND:${end}`;
  const uid = `${event.id}@gjstaterezinha`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GJ Santa Terezinha//Agenda//PT',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    dtStart,
    dtEnd,
    `SUMMARY:${event.title}`,
    ...(event.place ? [`LOCATION:${event.place}`] : []),
    ...(event.desc  ? [`DESCRIPTION:${event.desc.replace(/\n/g, '\\n')}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

interface EventDetailModalProps {
  event: AgendaEvent | null;
  onClose: () => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useSwipeDown(dialogRef, onClose);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (event) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [event]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleBackdrop = (e: MouseEvent) => {
      if (e.target === dialog) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    dialog.addEventListener('click', handleBackdrop);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      dialog.removeEventListener('click', handleBackdrop);
    };
  }, [onClose]);

  const catColor = event ? getCatVar(event.g) : 'var(--ag-outros)';
  const catLabel = event ? (CATEGORY_LABELS[event.g] ?? 'Outros') : '';

  return (
    <dialog ref={dialogRef} className="ag-dialog" aria-label={event?.title ?? 'Detalhe do evento'}>
      <div className="ag-drag-handle" aria-hidden="true" />
      <button
        className="ag-dialog-close"
        onClick={onClose}
        aria-label="Fechar"
      >
        ×
      </button>

      {event && (
        <>
          {event.art_url ? (
            <img
              className="ag-event-art"
              src={event.art_url}
              alt={`Arte do evento ${event.title}`}
            />
          ) : (
            <div
              className="ag-event-art-placeholder"
              style={{ '--cat-color': catColor } as React.CSSProperties}
            />
          )}

          <div className="ag-dialog-body">
            <div
              className="ag-event-cat"
              style={{ color: catColor, fontWeight: 700, marginBottom: 2 }}
            >
              {catLabel}
            </div>
            <h2>{event.title}</h2>

            <dl className="ag-dl">
              <dt>Quando</dt>
              <dd>{formatWhen(event.date, event.time)}</dd>

              {event.place && (
                <>
                  <dt>Onde</dt>
                  <dd>{event.place}</dd>
                </>
              )}
            </dl>

            {event.desc && (
              <p className="ag-event-desc">{event.desc}</p>
            )}

            <div className="ag-add-cal">
              <span className="ag-add-cal-label">Adicionar ao calendário</span>
              <div className="ag-add-cal-btns">
                <a
                  href={buildGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ag-cal-btn"
                >
                  {/* Google Calendar icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M8 13h2v2H8z" fill="currentColor"/>
                  </svg>
                  Google
                </a>
                <button
                  onClick={() => downloadICS(event)}
                  className="ag-cal-btn"
                >
                  {/* Apple/ICS icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M12 13v4M10 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Apple / Outlook
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
};

export default EventDetailModal;
