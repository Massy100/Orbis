'use client';

import { useState } from 'react';
import DashboardLayout from '../components/layout';
import "./availability.css"
import { 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  Clock
} from 'lucide-react';

export default function AvailabilityPage() {
  // ================= STATES =================
  const [slot1, setSlot1] = useState('1'); 
  const [slot2, setSlot2] = useState('2'); 
  const [slot3, setSlot3] = useState('3'); 

  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 16)); 
  const [vistaCalendario, setVistaCalendario] = useState<'month' | 'week'>('week');

  // Track which event is hovered or clicked (active = brought to front)
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombresDiasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const horasDelDia = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];

  // ================= SAFE COLOR CONFIGURATION =================
  const configDocentes = {
    '1': { 
      nombre: 'MSc. Ing. Carlos Pérez', 
      theme: { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' }
    },
    '2': { 
      nombre: 'Ing. Ana López', 
      theme: { bg: '#f0fdf4', border: '#10b981', text: '#065f46' }
    },
    '3': { 
      nombre: 'Ing. Roberto Juárez', 
      theme: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' }
    }
  };

  const teachersList = [
    { id: '1', name: 'MSc. Ing. Carlos Pérez' },
    { id: '2', name: 'Ing. Ana López' },
    { id: '3', name: 'Ing. Roberto Juárez' }
  ];

  // ================= MOCK DATA =================
  const eventosSimulados = [
    { docenteId: '1', diaSemana: 2, inicio: 8, fin: 10 },
    { docenteId: '2', diaSemana: 2, inicio: 8, fin: 11 }, 
    { docenteId: '3', diaSemana: 2, inicio: 8.5, fin: 12 }, 
    
    { docenteId: '1', diaSemana: 3, inicio: 8, fin: 10 },
    { docenteId: '1', diaSemana: 3, inicio: 12, fin: 14 },

    { docenteId: '1', diaSemana: 4, inicio: 14, fin: 16 },
    { docenteId: '3', diaSemana: 4, inicio: 14, fin: 17 },

    { docenteId: '2', diaSemana: 5, inicio: 10, fin: 12 },
  ];

  const formatTime = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // ================= NAVIGATION =================
  const irAtras = () => {
    const nuevaFecha = new Date(currentDate);
    if (vistaCalendario === 'month') nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    else nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    setCurrentDate(nuevaFecha);
  };

  const irAdelante = () => {
    const nuevaFecha = new Date(currentDate);
    if (vistaCalendario === 'month') nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    else nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    setCurrentDate(nuevaFecha);
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

  return (
    <DashboardLayout>
      <div className="container">

        <div className="teacher-section">
          <label className="teacher-label">
            <UserIcon size={16} />
            Selección de docentes simultáneos
          </label>

          <div className="teacher-grid">
            <select
              value={slot1}
              onChange={(e) => setSlot1(e.target.value)}
              className="select"
              style={{ border: `2px solid ${configDocentes['1'].theme.border}` }}
            >
              <option value="">-- Docente 1 --</option>
              {teachersList.map(t => (
                <option key={t.id} value={t.id} disabled={t.id === slot2 || t.id === slot3}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={slot2}
              onChange={(e) => setSlot2(e.target.value)}
              className="select"
              style={{ border: `2px solid ${configDocentes['2'].theme.border}` }}
            >
              <option value="">-- Docente 2 --</option>
              {teachersList.map(t => (
                <option key={t.id} value={t.id} disabled={t.id === slot1 || t.id === slot3}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={slot3}
              onChange={(e) => setSlot3(e.target.value)}
              className="select"
              style={{ border: `2px solid ${configDocentes['3'].theme.border}` }}
            >
              <option value="">-- Docente 3 --</option>
              {teachersList.map(t => (
                <option key={t.id} value={t.id} disabled={t.id === slot1 || t.id === slot2}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="navbar">
          <div className="nav-left">
            <span className="month-text">
              {nombresMeses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>

            <div className="nav-buttons">
              <button onClick={irAtras} className="nav-btn border">
                <ChevronLeft size={18} />
              </button>
              <button onClick={irAdelante} className="nav-btn">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="view-toggle">
            <button
              onClick={() => setVistaCalendario('month')}
              className={`toggle-btn ${vistaCalendario === 'month' ? 'toggle-active' : 'toggle-inactive'}`}
            >
              Mes
            </button>
            <button
              onClick={() => setVistaCalendario('week')}
              className={`toggle-btn ${vistaCalendario === 'week' ? 'toggle-active' : 'toggle-inactive'}`}
            >
              Semana
            </button>
          </div>
        </div>

        <div className="calendar">
          {vistaCalendario === 'week' ? (
            <div className="week-container">

              {/* HOUR COLUMN */}
              <div className="hour-column">
                <div className="hour-header-spacer" />
                {horasDelDia.map(hora => (
                  <div key={hora} className="hour-cell">
                    {hora}
                  </div>
                ))}
              </div>

              {/* DAYS */}
              <div className="day-grid">
                {diasDeLaSemana.map((diaObj, index) => {
                  const esHoy = diaObj.toDateString() === new Date().toDateString();

                  return (
                    <div key={index} className="day-column">

                      {/* HEADER */}
                      <div className={`day-header ${esHoy ? 'today' : 'normal'}`}>
                        <span>{nombresDiasCortos[diaObj.getDay()]}</span>
                        <span className="day-number">{diaObj.getDate()}</span>
                      </div>

                      <div className="day-body">

                        {/* GRID */}
                        {horasDelDia.map((_, i) => (
                          <div key={i} className="grid-line" />
                        ))}

                        {/* EVENTS */}
                        {eventosSimulados
                          .filter(e =>
                            e.diaSemana === diaObj.getDay() &&
                            [slot1, slot2, slot3].includes(e.docenteId)
                          )
                          .map((evento, idx, arr) => {

                            const config = configDocentes[evento.docenteId as keyof typeof configDocentes];

                            const eventKey = `${diaObj.toDateString()}-${evento.docenteId}-${evento.inicio}`;

                            const overlappingEvents = arr.filter(o =>
                              (evento.inicio >= o.inicio && evento.inicio < o.fin) ||
                              (evento.fin > o.inicio && evento.fin <= o.fin) ||
                              (evento.inicio <= o.inicio && evento.fin >= o.fin)
                            );

                            overlappingEvents.sort((a, b) => a.inicio - b.inicio);
                            const overlapIndex = overlappingEvents.indexOf(evento);

                            const leftOffset = 2 + (overlapIndex * 5);
                            const topOffsetPx = overlapIndex * 6;
                            const width = 94 - (overlapIndex * 4);

                            const isLifted = hoveredEvent === eventKey || activeEvent === eventKey;

                            return (
                              <div
                                key={idx}
                                className={`event ${isLifted ? 'lifted' : 'normal'}`}
                                style={{
                                  top: `calc(${(evento.inicio - 8) * 3}rem + ${topOffsetPx}px)`,
                                  height: `${(evento.fin - evento.inicio) * 3}rem`,
                                  width: isLifted ? '92%' : `${width}%`,
                                  left: isLifted ? '2%' : `${leftOffset}%`,
                                  zIndex: isLifted ? 100 : 10 + overlapIndex,
                                  backgroundColor: config.theme.bg,
                                  borderLeftColor: config.theme.border,
                                  color: config.theme.text,
                                  boxShadow: isLifted
                                    ? `0 8px 24px -4px ${config.theme.border}66, 0 2px 8px -2px ${config.theme.border}44`
                                    : undefined,
                                  outline: isLifted ? `2px solid ${config.theme.border}` : undefined
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
                                  <div className="event-teacher">
                                    {config.nombre}
                                  </div>
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
              {/* MONTH HEADER */}
              <div className="month-header">
                {nombresDiasCortos.map(dia => (
                  <div key={dia} className="month-day-name">
                    {dia}
                  </div>
                ))}
              </div>

              {/* MONTH GRID */}
              <div className="month-grid">
                {diasDelMes.map((diaObj, i) => {
                  const esEsteMes = diaObj.getMonth() === currentDate.getMonth();
                  const esHoy = diaObj.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={i}
                      className={`month-cell ${esHoy ? 'today' : ''}`}
                      style={{
                        opacity: esEsteMes ? 1 : 0.6,
                        background: !esEsteMes ? '#f9fafb' : undefined
                      }}
                    >
                      <span className="month-number">
                        {diaObj.getDate()}
                      </span>

                      <div>
                        {esEsteMes && eventosSimulados
                          .filter(e =>
                            e.diaSemana === diaObj.getDay() &&
                            [slot1, slot2, slot3].includes(e.docenteId)
                          )
                          .sort((a, b) => a.inicio - b.inicio)
                          .slice(0, 3)
                          .map((ev, idx) => {
                            const config = configDocentes[ev.docenteId as keyof typeof configDocentes];

                            return (
                              <div
                                key={idx}
                                className="month-event"
                                style={{
                                  backgroundColor: config.theme.bg,
                                  borderLeftColor: config.theme.border,
                                  color: config.theme.text
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