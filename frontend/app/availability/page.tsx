'use client';

import { useState } from 'react';
import DashboardLayout from '../components/layout';
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
      <div className="flex flex-col h-full">

        {/* TEACHER SELECTION SLOTS */}
        <div className="mb-6 w-full">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
            <UserIcon size={16} className="text-blue-600" />
            Selección de docentes simultáneos
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={slot1} onChange={(e) => setSlot1(e.target.value)} className="bg-white text-gray-900 text-sm font-medium rounded-lg p-3 outline-none shadow-sm cursor-pointer" style={{ border: `2px solid ${configDocentes['1'].theme.border}` }}>
              <option value="">-- Docente 1 --</option>
              {teachersList.map(t => <option key={t.id} value={t.id} disabled={t.id === slot2 || t.id === slot3}>{t.name}</option>)}
            </select>
            <select value={slot2} onChange={(e) => setSlot2(e.target.value)} className="bg-white text-gray-900 text-sm font-medium rounded-lg p-3 outline-none shadow-sm cursor-pointer" style={{ border: `2px solid ${configDocentes['2'].theme.border}` }}>
              <option value="">-- Docente 2 --</option>
              {teachersList.map(t => <option key={t.id} value={t.id} disabled={t.id === slot1 || t.id === slot3}>{t.name}</option>)}
            </select>
            <select value={slot3} onChange={(e) => setSlot3(e.target.value)} className="bg-white text-gray-900 text-sm font-medium rounded-lg p-3 outline-none shadow-sm cursor-pointer" style={{ border: `2px solid ${configDocentes['3'].theme.border}` }}>
              <option value="">-- Docente 3 --</option>
              {teachersList.map(t => <option key={t.id} value={t.id} disabled={t.id === slot1 || t.id === slot2}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* CALENDAR NAVIGATION */}
        <div className="flex justify-end items-center mb-3 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-700 capitalize">
              {nombresMeses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm">
              <button onClick={irAtras} className="p-2 hover:bg-gray-50 border-r border-gray-200 text-gray-600 transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={irAdelante} className="p-2 hover:bg-gray-50 text-gray-600 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>
          
          <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm">
            <button onClick={() => setVistaCalendario('month')} className={`px-4 py-2 text-xs font-semibold transition-all ${vistaCalendario === 'month' ? 'bg-gray-100 text-blue-600 rounded-l-lg' : 'text-gray-500 hover:text-gray-700'}`}>Mes</button>
            <button onClick={() => setVistaCalendario('week')} className={`px-4 py-2 text-xs font-semibold border-l border-gray-200 transition-all ${vistaCalendario === 'week' ? 'bg-gray-100 text-blue-600 rounded-r-lg' : 'text-gray-500 hover:text-gray-700'}`}>Semana</button>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col mb-4 min-h-[500px]">
          {vistaCalendario === 'week' ? (
            <div className="flex overflow-x-auto min-w-[900px] flex-1">
              {/* Hour column */}
              <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-white">
                <div className="h-10 border-b border-gray-200"></div> 
                {horasDelDia.map(hora => (
                  <div key={hora} className="h-12 flex items-start justify-center pt-1 border-b border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{hora}</span>
                  </div>
                ))}
              </div>
              
              {/* Day columns */}
              <div className="flex-1 grid grid-cols-7">
                {diasDeLaSemana.map((diaObj, index) => {
                  const esHoy = diaObj.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={index} className={`border-r border-gray-200 relative ${esHoy ? 'bg-blue-50/20' : ''}`}>
                      {/* Day header */}
                      <div className={`h-10 border-b border-gray-200 flex flex-col items-center justify-center text-sm gap-0.5 ${esHoy ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-600 bg-gray-50/50'}`}>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{nombresDiasCortos[diaObj.getDay()]}</span>
                        <span className="text-lg font-bold text-gray-700">{diaObj.getDate()}</span>
                      </div>
                      
                      <div className="relative h-full">
                        {/* Hour grid lines */}
                        {horasDelDia.map((_, i) => (
                          <div key={i} className="h-12 border-b border-gray-100"></div>
                        ))}

                        {/* CASCADE EVENTS */}
                        {eventosSimulados
                          .filter(e => e.diaSemana === diaObj.getDay() && ([slot1, slot2, slot3].includes(e.docenteId)))
                          .map((evento, idx, arr) => {
                            const config = configDocentes[evento.docenteId as keyof typeof configDocentes];

                            // Unique key per event instance
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

                            // Is this event active (hovered or clicked)?
                            const isLifted = hoveredEvent === eventKey || activeEvent === eventKey;

                            return (
                              <div 
                                key={idx}
                                className="absolute rounded-md p-1.5 text-[10px] flex flex-col border-l-4 overflow-hidden cursor-pointer"
                                style={{ 
                                  top: `calc(${(evento.inicio - 8) * 3}rem + ${topOffsetPx}px)`, 
                                  height: `${(evento.fin - evento.inicio) * 3}rem`,
                                  // Lifted: expand to full width, full opacity, on top
                                  width: isLifted ? '92%' : `${width}%`,
                                  left: isLifted ? '2%' : `${leftOffset}%`,
                                  zIndex: isLifted ? 100 : 10 + overlapIndex, 
                                  // Normal state: slightly translucent so cascaded cards show through
                                  opacity: isLifted ? 1 : 0.70,
                                  backgroundColor: config.theme.bg,
                                  borderLeftColor: config.theme.border,
                                  color: config.theme.text,
                                  // Lifted state: prominent colored shadow + outline
                                  boxShadow: isLifted
                                    ? `0 8px 24px -4px ${config.theme.border}66, 0 2px 8px -2px ${config.theme.border}44`
                                    : '0 1px 3px rgba(0,0,0,0.07)',
                                  outline: isLifted ? `2px solid ${config.theme.border}` : 'none',
                                  outlineOffset: '1px',
                                  transform: isLifted ? 'scale(1.015)' : 'scale(1)',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={() => setHoveredEvent(eventKey)}
                                onMouseLeave={() => setHoveredEvent(null)}
                                // Click toggles "pinned" state; clicking again unpins
                                onClick={() => setActiveEvent(activeEvent === eventKey ? null : eventKey)}
                              >
                                <div className="font-extrabold uppercase leading-tight">Disponible</div>
                                <div className="font-semibold flex items-center gap-1 opacity-80 mt-0.5 leading-tight">
                                  <Clock size={10} />
                                  {formatTime(evento.inicio)} - {formatTime(evento.fin)}
                                </div>
                                {/* Show teacher name only when event is lifted */}
                                {isLifted && (
                                  <div className="font-bold mt-1 leading-tight truncate" style={{ opacity: 0.9 }}>
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
            /* --- MONTH VIEW --- */
            <div className="min-w-[900px] flex-1 flex flex-col">
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
                {nombresDiasCortos.map(dia => (
                  <div key={dia} className="py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider border-r border-gray-100 last:border-0">{dia}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {diasDelMes.map((diaObj, i) => {
                  const esEsteMes = diaObj.getMonth() === currentDate.getMonth();
                  const esHoy = diaObj.toDateString() === new Date().toDateString();

                  return (
                    <div key={i} className={`border-b border-r border-gray-100 p-1 relative hover:bg-gray-50 transition-colors flex flex-col justify-start ${!esEsteMes ? 'bg-gray-50 opacity-60' : ''} ${esHoy ? 'bg-blue-50/20' : ''}`}>
                      <span className={`text-sm p-1 font-bold flex justify-end ${esHoy ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                        <div className={esHoy ? 'bg-blue-100 w-7 h-7 flex items-center justify-center rounded-full shadow-sm' : ''}>
                          {diaObj.getDate()}
                        </div>
                      </span>
                      
                      <div className="mt-1 space-y-1">
                        {esEsteMes && eventosSimulados
                          .filter(e => e.diaSemana === diaObj.getDay() && ([slot1, slot2, slot3].includes(e.docenteId)))
                          .sort((a, b) => a.inicio - b.inicio)
                          .slice(0, 3) 
                          .map((ev, idx) => {
                            const config = configDocentes[ev.docenteId as keyof typeof configDocentes];
                            return (
                              <div 
                                key={idx} 
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm truncate cursor-pointer shadow-sm border-l-2"
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
            </div>
          )}
        </div>

        {/* EXPORT BUTTON */}
        <div className="flex justify-end pb-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-all hover:scale-[1.01] uppercase tracking-wide">
            Crear Excel
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}