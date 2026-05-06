'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout';
import "./availability.css";
import { ChevronLeft, ChevronRight, User as UserIcon, Clock } from 'lucide-react';
import { useAvailability } from '@/src/app/hooks/use-availability';

interface Teacher {
  id: number;
  name: string;
}

interface AvailabilityEvent {
  docenteId: string | number;
  diaSemana: number;
  inicio: number;
  fin: number;
}

const PALETAS = [
  { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' }, // AZUL (Slot 1)
  { bg: '#f0fdf4', border: '#10b981', text: '#065f46' }, // VERDE (Slot 2)
  { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' }, // NARANJA (Slot 3)
];

export default function AvailabilityPage() {
  const { teachers, events, loading } = useAvailability();

  const [slots, setSlots]                   = useState<string[]>(['', '', '']);
  const [currentDate, setCurrentDate]       = useState(new Date());
  const [vistaCalendario, setVista]         = useState('week');
  const [hoveredEvent, setHoveredEvent]     = useState<string | null>(null);
  const [activeEvent, setActiveEvent]       = useState<string | null>(null);

  useEffect(() => {
    if (teachers.length) {
      setSlots(teachers.slice(0, 3).map(t => String(t.id)));
    }
  }, [teachers]);

  const nombresMeses      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const nombresDiasCortos = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const horasDelDia       = ['7am', '8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm', '7pm', '8pm', '9pm'];

  const formatTime = (decimalHours: any) => {
    const hours   = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const ampm    = hours >= 12 ? 'pm' : 'am';
    const display = hours > 12 ? hours - 12 : hours;
    return `${display}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const irAtras = () => {
    const d = new Date(currentDate);
    vistaCalendario === 'month' ? d.setMonth(d.getMonth() - 1) : d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const irAdelante = () => {
    const d = new Date(currentDate);
    vistaCalendario === 'month' ? d.setMonth(d.getMonth() + 1) : d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const inicioDeSemana = new Date(currentDate);
  inicioDeSemana.setDate(currentDate.getDate() - currentDate.getDay());
  const diasDeLaSemana = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(inicioDeSemana);
    d.setDate(inicioDeSemana.getDate() + i);
    return d;
  });

  const diasDelMes = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
          <p>Cargando disponibilidad...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container">

        {/* SELECCIÓN DE DOCENTES */}
        <div className="teacher-section">
          <label className="teacher-label">
            <UserIcon size={16} />
            Selección de docentes simultáneos
          </label>

          <div className="teacher-grid">
            {slots.map((slotId, slotIndex) => {
              const theme = PALETAS[slotIndex];
              return (
                <select
                  key={slotIndex}
                  value={slotId}
                  onChange={(e) => {
                    const updated = [...slots];
                    updated[slotIndex] = e.target.value;
                    setSlots(updated);
                  }}
                  className="select"
                  style={{
                    border: `2px solid ${theme.border}`,
                    backgroundColor: theme.bg,
                    color: theme.text
                  }}
                >
                  <option value="">-- Docente {slotIndex + 1} --</option>
                  {teachers.map(t => (
                    <option
                      key={t.id}
                      value={String(t.id)}
                      disabled={slots.includes(String(t.id)) && String(t.id) !== slotId}
                    >
                      {t.name}
                    </option>
                  ))}
                </select>
              );
            })}
          </div>
        </div>

        {/* NAVBAR */}
        <div className="navbar">
          <div className="nav-left">
            <span className="month-text">
              {nombresMeses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="nav-buttons">
              <button onClick={irAtras}    className="nav-btn border"><ChevronLeft size={18} /></button>
              <button onClick={irAdelante} className="nav-btn"><ChevronRight size={18} /></button>
            </div>
          </div>
          <div className="view-toggle">
            <button
              onClick={() => setVista('month')}
              className={`toggle-btn ${vistaCalendario === 'month' ? 'toggle-active' : 'toggle-inactive'}`}
            >Mes</button>
            <button
              onClick={() => setVista('week')}
              className={`toggle-btn ${vistaCalendario === 'week' ? 'toggle-active' : 'toggle-inactive'}`}
            >Semana</button>
          </div>
        </div>

        {/* CALENDARIO */}
        <div className="calendar">
          {vistaCalendario === 'week' ? (
            <div className="week-container">
              <div className="hour-column">
                <div className="hour-header-spacer" />
                {horasDelDia.map(hora => (
                  <div key={hora} className="hour-cell">{hora}</div>
                ))}
              </div>

              <div className="day-grid">
                {diasDeLaSemana.map((diaObj, index) => {
                  const esHoy = diaObj.toDateString() === new Date().toDateString();
                  
                  // Forzamos String() para asegurar la coincidencia
                  const eventosDia = events.filter(e =>
                    e.diaSemana === diaObj.getDay() && slots.includes(String(e.docenteId))
                  );

                  return (
                    <div key={index} className="day-column">
                      <div className={`day-header ${esHoy ? 'today' : 'normal'}`}>
                        <span>{nombresDiasCortos[diaObj.getDay()]}</span>
                        <span className="day-number">{diaObj.getDate()}</span>
                      </div>

                      <div className="day-body">
                        {horasDelDia.map((_, i) => (
                          <div key={i} className="grid-line" />
                        ))}

                        {eventosDia.map((evento, idx, arr) => {
                          // Obtenemos el color basado en el Slot, no en el docente
                          const slotIndex = slots.indexOf(String(evento.docenteId));
                          if (slotIndex === -1) return null;
                          const theme = PALETAS[slotIndex];

                          const docenteName = teachers.find(t => String(t.id) === String(evento.docenteId))?.name || 'Docente';
                          const eventKey = `${diaObj.toDateString()}-${evento.docenteId}-${evento.inicio}`;

                          const overlapping = arr.filter(o =>
                            evento.inicio < o.fin && evento.fin > o.inicio
                          );
                          overlapping.sort((a, b) => a.inicio - b.inicio);
                          const overlapIndex = overlapping.indexOf(evento);

                          const leftOffset  = 2 + overlapIndex * 5;
                          const topOffsetPx = overlapIndex * 6;
                          const width       = 94 - overlapIndex * 4;
                          const isLifted    = hoveredEvent === eventKey || activeEvent === eventKey;

                          return (
                            <div
                              key={idx}
                              className={`event ${isLifted ? 'lifted' : 'normal'}`}
                              style={{
                                top:             `calc(${(evento.inicio - 7) * 3}rem + ${topOffsetPx}px)`,
                                height:          `${(evento.fin - evento.inicio) * 3}rem`,
                                width:           isLifted ? '92%' : `${width}%`,
                                left:            isLifted ? '2%' : `${leftOffset}%`,
                                zIndex:          isLifted ? 100 : 10 + overlapIndex,
                                backgroundColor: theme.bg,
                                borderLeftColor: theme.border,
                                color:           theme.text,
                                boxShadow:       isLifted
                                  ? `0 8px 24px -4px ${theme.border}66`
                                  : undefined,
                                outline: isLifted ? `2px solid ${theme.border}` : undefined,
                              }}
                              onMouseEnter={() => setHoveredEvent(eventKey)}
                              onMouseLeave={() => setHoveredEvent(null)}
                              onClick={() => setActiveEvent(activeEvent === eventKey ? null : eventKey)}
                            >
                              <div className="event-title">Disponible</div>
                              <div className="event-time">
                                <Clock size={10} />
                                {formatTime(evento.inicio)} - {formatTime(evento.fin)}
                              </div>
                              {isLifted && (
                                <div className="event-teacher">{docenteName}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              <div className="month-header">
                {nombresDiasCortos.map(dia => (
                  <div key={dia} className="month-day-name">{dia}</div>
                ))}
              </div>

              <div className="month-grid">
                {diasDelMes.map((diaObj, i) => {
                  const esEsteMes = diaObj.getMonth() === currentDate.getMonth();
                  const esHoy     = diaObj.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={i}
                      className={`month-cell ${esHoy ? 'today' : ''}`}
                      style={{ opacity: esEsteMes ? 1 : 0.6, background: !esEsteMes ? '#f9fafb' : undefined }}
                    >
                      <span className="month-number">{diaObj.getDate()}</span>
                      <div>
                        {esEsteMes && events
                          .filter(e =>
                            e.diaSemana === diaObj.getDay() && slots.includes(String(e.docenteId))
                          )
                          .sort((a, b) => a.inicio - b.inicio)
                          .slice(0, 3)
                          .map((ev, idx) => {
                            const slotIndex = slots.indexOf(String(ev.docenteId));
                            if (slotIndex === -1) return null;
                            const theme = PALETAS[slotIndex];

                            return (
                              <div
                                key={idx}
                                className="month-event"
                                style={{
                                  backgroundColor: theme.bg,
                                  borderLeftColor: theme.border,
                                  color:           theme.text,
                                }}
                              >
                                {formatTime(ev.inicio)}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="export">
          <button>Crear Excel</button>
        </div>

      </div>
    </DashboardLayout>
  );
}