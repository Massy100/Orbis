'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout';
import "./availability.css";
import { ChevronLeft, ChevronRight, User as UserIcon, Clock } from 'lucide-react';
import { useAvailability } from '@/src/app/hooks/use-availability';
import GLOBAL_API_URL from '@/src/app/services/global-api-url'; // ✅ importar igual que los demás

interface Teacher {
  id: number;
  name: string;
}

interface AvailabilityEvent {
  docenteId: string | number;
  diaSemana: number | string;
  inicio: number | string;
  fin: number | string;
}

const PALETAS = [
  { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' },
  { bg: '#f0fdf4', border: '#10b981', text: '#065f46' },
  { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
];

const DAY_NAME_MAP: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, miércoles: 3,
  jueves: 4, viernes: 5, sabado: 6, sábado: 6,
};

const parseDay = (day: string | number): number => {
  if (typeof day === 'number') return day === 7 ? 0 : day;
  const num = parseInt(day, 10);
  if (!isNaN(num)) return num === 7 ? 0 : num;
  return DAY_NAME_MAP[day?.toLowerCase()] ?? -1;
};

export default function AvailabilityPage() {
  const { teachers, loading } = useAvailability();

  const [localEvents, setLocalEvents]   = useState<AvailabilityEvent[]>([]);
  const [teacherAreas, setTeacherAreas] = useState<Record<string, string>>({});
  const [slots, setSlots]               = useState<string[]>(['', '', '']);
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [vistaCalendario, setVista]     = useState('week');
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [activeEvent, setActiveEvent]   = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectEvents = async () => {
      try {
        // ✅ Usar GLOBAL_API_URL igual que todos los demás servicios
        const url = GLOBAL_API_URL.endsWith('/') ? GLOBAL_API_URL.slice(0, -1) : GLOBAL_API_URL;

        const [tpRes, pRes, tRes, cRes] = await Promise.all([
          fetch(`${url}/teachers-periods/`),
          fetch(`${url}/periods/`),
          fetch(`${url}/teachers/`),
          fetch(`${url}/careers/`)
        ]);

        if (!tpRes.ok || !pRes.ok) return;

        const tpData = await tpRes.json();
        const pData  = await pRes.json();

        const tRaw = tRes.ok ? await tRes.json() : [];
        const cRaw = cRes.ok ? await cRes.json() : [];
        const tData = Array.isArray(tRaw) ? tRaw : (tRaw.results || []);
        const cData = Array.isArray(cRaw) ? cRaw : (cRaw.results || []);

        const careersMap: Record<string, string> = {};
        cData.forEach((c: any) => {
          careersMap[c.id] = c.name.replace('Ingeniería en ', '').replace('Ingeniería ', '');
        });

        const areasMap: Record<string, string> = {};
        tData.forEach((t: any) => {
          const careerId = typeof t.career === 'object' ? t.career?.id : t.career;
          areasMap[t.id] = careersMap[careerId] || 'Área General';
        });
        setTeacherAreas(areasMap);

        const periodsMap: Record<string, any> = {};
        pData.forEach((p: any) => {
          periodsMap[p.id] = p;
        });

        const mappedEvents: AvailabilityEvent[] = tpData.map((tp: any) => {
          const period = periodsMap[tp.schedule];
          if (!period) return null;
          return {
            docenteId: String(tp.teacher),
            diaSemana: parseDay(period.day),
            inicio: period.starttime,
            fin: period.endtime
          };
        }).filter(Boolean) as AvailabilityEvent[];

        setLocalEvents(mappedEvents);
      } catch (error) {
        console.error("Error al obtener datos directamente:", error);
      }
    };

    fetchDirectEvents();
  }, []);

  const nombresMeses      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const nombresDiasCortos = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const horasDelDia       = ['7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm'];

  const parseTimeToDecimal = (time: string | number): number => {
    if (typeof time === 'number') return time;
    if (!time || typeof time !== 'string') return 0;
    const [h, m] = time.split(':');
    return parseInt(h) + (parseInt(m) || 0) / 60;
  };

  const formatTime = (decimalHours: any) => {
    const hoursNum = typeof decimalHours === 'string' ? parseTimeToDecimal(decimalHours) : decimalHours;
    const hours    = Math.floor(hoursNum);
    const minutes  = Math.round((hoursNum - hours) * 60);
    const ampm     = hours >= 12 ? 'pm' : 'am';
    const display  = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
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
                  const eventosDia = localEvents.filter(e =>
                    Number(e.diaSemana) === diaObj.getDay() && slots.includes(String(e.docenteId))
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
                          const slotIndex = slots.indexOf(String(evento.docenteId));
                          if (slotIndex === -1) return null;
                          const theme = PALETAS[slotIndex];

                          const inicioDec = parseTimeToDecimal(evento.inicio);
                          const finDec    = parseTimeToDecimal(evento.fin);

                          const docenteName = teachers.find(t => String(t.id) === String(evento.docenteId))?.name || 'Docente';
                          const eventKey    = `${diaObj.toDateString()}-${evento.docenteId}-${evento.inicio}`;

                          const overlapping = arr.filter(o => {
                            const oIni = parseTimeToDecimal(o.inicio);
                            const oFin = parseTimeToDecimal(o.fin);
                            return inicioDec < oFin && finDec > oIni;
                          });

                          overlapping.sort((a, b) => parseTimeToDecimal(a.inicio) - parseTimeToDecimal(b.inicio));
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
                                top:             `calc(${(inicioDec - 7) * 3}rem + ${topOffsetPx}px)`,
                                height:          `${(finDec - inicioDec) * 3}rem`,
                                width:           isLifted ? '92%' : `${width}%`,
                                left:            isLifted ? '2%' : `${leftOffset}%`,
                                zIndex:          isLifted ? 100 : 10 + overlapIndex,
                                backgroundColor: theme.bg,
                                borderLeftColor: theme.border,
                                color:           theme.text,
                                boxShadow:       isLifted ? `0 8px 24px -4px ${theme.border}66` : undefined,
                                outline:         isLifted ? `2px solid ${theme.border}` : undefined,
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
                                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '2px' }}>
                                  <div className="event-teacher">{docenteName}</div>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.9 }}>
                                    {teacherAreas[String(evento.docenteId)] || 'Ingeniería'}
                                  </div>
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
            <div className="month-grid-container">
              <div className="month-header">
                {nombresDiasCortos.map(dia => <div key={dia} className="month-day-name">{dia}</div>)}
              </div>
              <div className="month-grid">
                {diasDelMes.map((diaObj, i) => {
                  const esEsteMes = diaObj.getMonth() === currentDate.getMonth();
                  const esHoy     = diaObj.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`month-cell ${esHoy ? 'today' : ''}`} style={{ opacity: esEsteMes ? 1 : 0.4 }}>
                      <span className="month-number">{diaObj.getDate()}</span>
                      <div className="month-events-preview">
                        {localEvents
                          .filter(e => Number(e.diaSemana) === diaObj.getDay() && slots.includes(String(e.docenteId)))
                          .slice(0, 2)
                          .map((ev, idx) => (
                            <div key={idx} className="month-event-dot" style={{ backgroundColor: PALETAS[slots.indexOf(String(ev.docenteId))]?.border }} />
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="export">
          <button>Crear Excel</button>
        </div>

      </div>
    </DashboardLayout>
  );
}