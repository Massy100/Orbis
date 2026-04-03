'use client';

import { useState } from 'react';
import DashboardLayout from '../components/layout';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Download, 
  User as UserIcon,
  Clock
} from 'lucide-react';

export default function AvailabilityPage() {
  // ================= STATES (Top 3 selected by default for demo) =================
  const [docente1, setDocente1] = useState('1'); // MSc. Ing. Carlos Pérez
  const [docente2, setDocente2] = useState('2'); // Ing. Ana López
  const [docente3, setDocente3] = useState('3'); // Ing. Roberto Juárez

  const [currentDate, setCurrentDate] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState<'month' | 'week'>('week');

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombresDiasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const horasDelDia = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];

  // ================= SAFE COLOR CONFIGURATION (Hexadecimal) =================
  const configDocentes = {
    '1': { 
      nombre: 'MSc. Ing. Carlos Pérez', 
      theme: { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' } // BLUE (ORBIS)
    },
    '2': { 
      nombre: 'Ing. Ana López', 
      theme: { bg: '#fef2f2', border: '#dc2626', text: '#b91c1c' } // RED (Contrasting)
    },
    '3': { 
      nombre: 'Ing. Roberto Juárez', 
      theme: { bg: '#f0fdf4', border: '#16a34a', text: '#15803d' } // GREEN
    }
  };

  // ================= MOCK DATA =================
  const eventosSimulados = [
    // OVERLAP: Two teachers on the same day at the same time (Tuesday)
    { docenteId: '1', diaSemana: 2, inicio: 8, fin: 10, titulo: 'Sistemas Operativos I' },
    { docenteId: '2', diaSemana: 2, inicio: 8, fin: 10, titulo: 'Sistemas Operativos I' },
    
    // Other standard events
    { docenteId: '1', diaSemana: 4, inicio: 11, fin: 13, titulo: 'Proyecto Final' },
    { docenteId: '2', diaSemana: 1, inicio: 14, fin: 16, titulo: 'Base de Datos II' },
    { docenteId: '3', diaSemana: 3, inicio: 9, fin: 11.5, titulo: 'Redes de Computadoras' },
  ];

  const formatTime = (hour: number) => {
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:00${ampm}`;
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

  // ================= CALCULATIONS =================
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">Gestión de Horarios</h2>
            <p className="text-gray-500 mt-1">Visualización comparativa de disponibilidad docente</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all shadow-sm">
            <Download size={18} />
            Exportar horarios
          </button>
        </div>

        {/* FILTERS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          <div className="lg:col-span-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <UserIcon size={16} className="text-blue-600" />
              Selección de docentes simultáneos
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select value={docente1} onChange={(e) => setDocente1(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Docente 1 --</option>
                <option value="1">MSc. Ing. Carlos Pérez</option>
                <option value="2">Ing. Ana López</option>
                <option value="3">Ing. Roberto Juárez</option>
              </select>
              <select value={docente2} onChange={(e) => setDocente2(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Docente 2 --</option>
                <option value="1">MSc. Ing. Carlos Pérez</option>
                <option value="2">Ing. Ana López</option>
                <option value="3">Ing. Roberto Juárez</option>
              </select>
              <select value={docente3} onChange={(e) => setDocente3(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">-- Docente 3 --</option>
                <option value="1">MSc. Ing. Carlos Pérez</option>
                <option value="2">Ing. Ana López</option>
                <option value="3">Ing. Roberto Juárez</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <CalendarIcon size={16} className="text-blue-600" />
              Mes de consulta
            </label>
            <select 
              value={currentDate.getMonth()} 
              onChange={(e) => {
                const d = new Date(currentDate);
                d.setMonth(parseInt(e.target.value));
                setCurrentDate(d);
              }} 
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 w-full"
            >
              {nombresMeses.map((mes, index) => <option key={mes} value={index}>{mes}</option>)}
            </select>
          </div>
        </div>

        {/* AESTHETIC & SAFE LEGEND (Inline colors) */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
          {[docente1, docente2, docente3].filter(id => id !== '').map(id => {
            const config = configDocentes[id as keyof typeof configDocentes];
            return (
              <div 
                key={id} 
                className="flex items-center gap-3 px-4 py-2 rounded-lg border-l-4 shadow-sm"
                style={{ backgroundColor: config.theme.bg, borderLeftColor: config.theme.border }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.theme.border }}></div>
                <span className="text-sm font-medium" style={{ color: config.theme.text }}>
                  {config.nombre}
                </span>
              </div>
            );
          })}
        </div>

        {/* CALENDAR */}
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
          <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-6">
              <h3 className="text-xl font-bold text-gray-800 capitalize">
                {nombresMeses[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={irAtras} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"><ChevronLeft size={20} /></button>
                <button onClick={irAdelante} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all"><ChevronRight size={20} /></button>
              </div>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setVistaCalendario('month')} 
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${vistaCalendario === 'month' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Mes
              </button>
              <button 
                onClick={() => setVistaCalendario('week')} 
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${vistaCalendario === 'week' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {vistaCalendario === 'week' ? (
              <div className="flex min-w-[900px]">
                <div className="w-20 flex-shrink-0 border-r border-gray-100 bg-gray-50/50">
                  <div className="h-14 border-b border-gray-200"></div>
                  {horasDelDia.map(hora => (
                    <div key={hora} className="h-20 flex items-start justify-center pt-2 border-b border-gray-50">
                      <span className="text-[11px] font-bold text-gray-400 uppercase">{hora}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-7">
                  {diasDeLaSemana.map((diaObj, index) => (
                    <div key={index} className="border-r border-gray-100 relative min-h-[800px]">
                      <div className="h-14 border-b border-gray-200 flex flex-col items-center justify-center bg-gray-50/30">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{nombresDiasCortos[diaObj.getDay()]}</span>
                        <span className="text-lg font-bold text-gray-700">{diaObj.getDate()}</span>
                      </div>
                      <div className="relative h-full">
                        {horasDelDia.map((_, i) => <div key={i} className="h-20 border-b border-gray-50"></div>)}
                        
                        {/* EVENT RENDERING WITH SAFE COLORS (HEX) AND OVERLAP SUPPORT (SIDE-BY-SIDE) */}
                        {eventosSimulados
                          .filter(e => e.diaSemana === diaObj.getDay() && ([docente1, docente2, docente3].includes(e.docenteId)))
                          .map((evento, idx, filtered) => {
                            const config = configDocentes[evento.docenteId as keyof typeof configDocentes];
                            const overlaps = filtered.filter(ov => ov.inicio === evento.inicio).length;
                            const width = overlaps > 1 ? `${90 / overlaps}%` : '92%';
                            const left = overlaps > 1 ? `${(filtered.indexOf(evento) % overlaps) * (100 / overlaps)}%` : '4%';

                            return (
                              <div 
                                key={idx}
                                className="absolute rounded-lg p-2.5 border-l-4 text-[10px] z-10 transition-all hover:scale-[1.02] cursor-default shadow-sm flex flex-col justify-between"
                                style={{ 
                                  top: `${(evento.inicio - 8) * 5}rem`, 
                                  height: `${(evento.fin - evento.inicio) * 5}rem`,
                                  width: width,
                                  left: left,
                                  margin: '2px',
                                  backgroundColor: config.theme.bg,
                                  borderLeftColor: config.theme.border,
                                  color: config.theme.text
                                }}
                              >
                                <div className="font-bold flex items-center gap-1">
                                  <Clock size={10} />
                                  {formatTime(evento.inicio)} - {formatTime(evento.fin)}
                                </div>
                                <div className="font-extrabold truncate uppercase mt-1">{evento.titulo}</div>
                                <div className="mt-auto opacity-70 font-semibold italic">{config.nombre}</div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* MONTHLY VIEW */
              <div className="min-w-[900px]">
                <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
                  {nombresDiasCortos.map(dia => (
                    <div key={dia} className="py-3 text-center text-[11px] font-bold text-gray-400 uppercase border-r border-gray-100 last:border-0">{dia}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-[120px]">
                  {diasDelMes.map((diaObj, i) => {
                    const esEsteMes = diaObj.getMonth() === currentDate.getMonth();
                    const esHoy = diaObj.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} className={`border-b border-r border-gray-100 p-2 relative hover:bg-gray-50 transition-all ${!esEsteMes ? 'opacity-30 bg-gray-50' : ''}`}>
                        <span className={`text-sm font-bold ${esHoy ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full ml-auto shadow-md' : 'text-gray-400 block text-right'}`}>
                          {diaObj.getDate()}
                        </span>
                        {esEsteMes && eventosSimulados
                          .filter(e => e.diaSemana === diaObj.getDay() && ([docente1, docente2, docente3].includes(e.docenteId)))
                          .slice(0, 3)
                          .map((ev, idx) => {
                            const config = configDocentes[ev.docenteId as keyof typeof configDocentes];
                            return (
                              <div 
                                key={idx} 
                                className="text-[9px] px-2 py-1 rounded-md truncate mt-1.5 font-bold border-l-2 shadow-sm"
                                style={{
                                  backgroundColor: config.theme.bg,
                                  borderLeftColor: config.theme.border,
                                  color: config.theme.text
                                }}
                              >
                                {formatTime(ev.inicio)} | {ev.titulo}
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}