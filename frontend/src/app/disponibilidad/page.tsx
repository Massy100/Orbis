'use client';

import { useState } from 'react';

// =========================================================================
// COMPONENTE SIDEBAR
// =========================================================================
function Sidebar() {
  const menuItems = [
    { name: 'Panel', icon: ' ' },
    { name: 'Maestros', icon: '👥' },
    { name: 'Disponibilidad', icon: '📅', active: true },
    { name: 'Evaluaciones', icon: '📝' },
    { name: 'Documentos', icon: '📄' },
    { name: 'Resultados e informes', icon: '📊' },
    { name: 'Comunicaciones', icon: '✉️' },
    { name: 'Ajustes', icon: '⚙️' },
  ];

  // El sidebar es un componente aparte para mantener la claridad del código principal
  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 h-screen sticky top-0">
      <div className="flex flex-col items-center mb-10">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Logo_URL_Universidad_Rafael_Landívar.png" 
          alt="Logo URL" 
          width="90" 
          className="mb-3"
        />
        <span className="text-3xl font-black text-blue-900 tracking-widest mt-2">ORBIS</span>
      </div>

      <nav className="flex-grow space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.name}
            href="#"
            className={`flex items-center gap-3 p-3 rounded-lg text-sm transition-colors
              ${item.active 
                ? 'bg-blue-50 text-blue-800 font-semibold' 
                : 'text-gray-700 hover:bg-gray-50'}`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </a>
        ))}
      </nav>

      <button className="flex items-center gap-3 p-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 w-full mt-auto border-t border-gray-100 pt-6">
        <span className="text-lg">🚪</span>
        Finalizar sesión
      </button>
    </aside>
  );
}

// =========================================================================
// VISTA PRINCIPAL Y LÓGICA DEL CALENDARIO
// =========================================================================
export default function DisponibilidadPage() {
  // Estados para los filtros superiores
  const [docente1, setDocente1] = useState('');
  const [docente2, setDocente2] = useState('');
  const [docente3, setDocente3] = useState('');

  // Estados del Calendario Funcional
  const [currentDate, setCurrentDate] = useState(new Date());
  const [vistaCalendario, setVistaCalendario] = useState<'year' | 'month' | 'week'>('week');

  // Constantes de idioma
  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombresDiasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const horasDelDia = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];

  // ================= SIMULADOR DE EVENTOS (MOCKS) =================
  // Usamos formato de hora decimal (ej. 8:30am = 8.5) para calcular el alto y posición exactos
  const eventosSimulados = [
    { diaSemana: 2, inicio: 8.5, fin: 11.66, estado: 'ocupado', titulo: 'Evaluación de Terna' }, // Martes 8:30 a 11:40
    { diaSemana: 4, inicio: 9.0, fin: 13.0, estado: 'disponible', titulo: 'Horario Disponible' }, // Jueves 9:00 a 13:00
    { diaSemana: 5, inicio: 14.0, fin: 16.5, estado: 'disponible', titulo: 'Horario Disponible' }, // Viernes 14:00 a 16:30
    { diaSemana: 1, inicio: 10.25, fin: 12.0, estado: 'parcialmente', titulo: 'Revisión (Sujeto a cambios)' } // Lunes 10:15 a 12:00
  ];

  const coloresEstado = {
    disponible: 'bg-blue-600 border-blue-700 text-white shadow-md', // Azul ORBIS
    ocupado: 'bg-red-100 border-red-300 text-red-800 border-l-4 border-l-red-500', 
    parcialmente: 'bg-yellow-50 border-yellow-300 text-yellow-800 border-l-4 border-l-yellow-400'
  };

  // Función para formatear el decimal a hora legible (ej. 8.5 -> "8:30am")
  const formatTime = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')}${ampm}`;
  };

  // ================= LÓGICA DE NAVEGACIÓN =================
  const irAtras = () => {
    const nuevaFecha = new Date(currentDate);
    if (vistaCalendario === 'year') nuevaFecha.setFullYear(nuevaFecha.getFullYear() - 1);
    else if (vistaCalendario === 'month') nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
    else nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    setCurrentDate(nuevaFecha);
  };

  const irAdelante = () => {
    const nuevaFecha = new Date(currentDate);
    if (vistaCalendario === 'year') nuevaFecha.setFullYear(nuevaFecha.getFullYear() + 1);
    else if (vistaCalendario === 'month') nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
    else nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    setCurrentDate(nuevaFecha);
  };

  const irAHoy = () => setCurrentDate(new Date());

  const cambiarMesDesdeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setMonth(parseInt(e.target.value));
    setCurrentDate(nuevaFecha);
  };

  const cambiarAñoDesdeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setFullYear(parseInt(e.target.value));
    setCurrentDate(nuevaFecha);
  };

  // ================= CÁLCULOS DEL CALENDARIO =================
  const inicioDeSemana = new Date(currentDate);
  inicioDeSemana.setDate(currentDate.getDate() - currentDate.getDay()); 
  const diasDeLaSemana = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(inicioDeSemana);
    d.setDate(inicioDeSemana.getDate() + i);
    return d;
  });

  const primerDiaDelMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const inicioCuadricula = new Date(primerDiaDelMes);
  inicioCuadricula.setDate(primerDiaDelMes.getDate() - primerDiaDelMes.getDay()); 
  const diasDelMes = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(inicioCuadricula);
    d.setDate(inicioCuadricula.getDate() + i);
    return d;
  });

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-blue-800 text-white p-4 flex items-center gap-4 shadow-md">
          <h1 className="text-xl font-semibold">Disponibilidad docente</h1>
        </header>

        <main className="flex-1 p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-3xl font-light text-gray-800 mb-8">Disponibilidad</h2>

            {/* FILTROS Sincronizados */}
            <div className="mb-10">
              <label className="block text-sm font-medium text-gray-700 mb-3">Selección de docentes</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select value={docente1} onChange={(e) => setDocente1(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option value="">-- Seleccionar Docente 1 --</option>
                  <option value="1">MSc. Ing. Carlos Pérez</option>
                </select>
                <select value={docente2} onChange={(e) => setDocente2(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option value="">-- Seleccionar Docente 2 --</option>
                  <option value="2">Ing. Ana López</option>
                </select>
                <select value={docente3} onChange={(e) => setDocente3(e.target.value)} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                  <option value="">-- Seleccionar Docente 3 --</option>
                  <option value="3">Ing. Roberto Juárez</option>
                </select>
              </div>
              
              <div className="flex gap-4 w-full md:w-96">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                  <select value={currentDate.getMonth()} onChange={cambiarMesDesdeSelect} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    {nombresMeses.map((mes, index) => <option key={mes} value={index}>{mes}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                  <select value={currentDate.getFullYear()} onChange={cambiarAñoDesdeSelect} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    {Array.from({ length: 11 }).map((_, i) => <option key={i} value={2020 + i}>{2020 + i}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* UI DEL CALENDARIO FUNCIONAL */}
            {/* ================================================================= */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
              
              {/* Barra de Controles (Año/Mes/Semana, Botones de navegación) */}
              <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 gap-4 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-normal text-gray-700 capitalize w-48">
                    {vistaCalendario === 'year' ? currentDate.getFullYear() : `${nombresMeses[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  </h3>
                  <div className="flex shadow-sm rounded-md">
                    <button onClick={irAtras} className="px-3 py-1.5 border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 rounded-l-md font-bold">&lt;</button>
                    <button onClick={irAdelante} className="px-3 py-1.5 border-t border-b border-r border-gray-300 bg-white text-gray-600 hover:bg-gray-100 font-bold">&gt;</button>
                    <button onClick={irAHoy} className="px-4 py-1.5 border-t border-b border-r border-gray-300 bg-white text-gray-600 hover:bg-gray-100 rounded-r-md">Hoy</button>
                  </div>
                </div>
                
                <div className="flex shadow-sm rounded-md">
                  <button onClick={() => setVistaCalendario('year')} className={`px-4 py-1.5 border border-gray-300 text-sm capitalize ${vistaCalendario === 'year' ? 'bg-gray-200 text-gray-800 shadow-inner' : 'bg-white text-gray-600 hover:bg-gray-50'} rounded-l-md`}>Año</button>
                  <button onClick={() => setVistaCalendario('month')} className={`px-4 py-1.5 border-t border-b border-r border-gray-300 text-sm capitalize ${vistaCalendario === 'month' ? 'bg-gray-200 text-gray-800 shadow-inner' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Mes</button>
                  <button onClick={() => setVistaCalendario('week')} className={`px-4 py-1.5 border-t border-b border-r border-gray-300 text-sm capitalize ${vistaCalendario === 'week' ? 'bg-gray-200 text-gray-800 shadow-inner' : 'bg-white text-gray-600 hover:bg-gray-50'} rounded-r-md`}>Semana</button>
                </div>
              </div>

              {/* CONTENIDO DEL CALENDARIO SEGÚN LA VISTA */}
              <div className="p-0">
                {vistaCalendario === 'year' && (
                  /* --- VISTA ANUAL --- */
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                    {Array.from({ length: 12 }).map((_, mesIndex) => {
                      const primerDiaMes = new Date(currentDate.getFullYear(), mesIndex, 1);
                      const numDiasMes = new Date(currentDate.getFullYear(), mesIndex + 1, 0).getDate();
                      const diaSemanaInicio = primerDiaMes.getDay();

                      return (
                        <div key={mesIndex} className="border border-gray-100 rounded-lg p-4 shadow-sm bg-white hover:border-blue-300 transition-colors">
                          <h4 className="font-semibold text-gray-700 mb-3 text-center capitalize">{nombresMeses[mesIndex]}</h4>
                          <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-gray-400 mb-2 font-medium">
                            {nombresDiasCortos.map(d => <div key={d}>{d.charAt(0)}</div>)}
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-xs text-center text-gray-600">
                            {Array.from({ length: diaSemanaInicio }).map((_, i) => <div key={`empty-${i}`}></div>)}
                            {Array.from({ length: numDiasMes }).map((_, i) => (
                              <div key={i + 1} className="w-6 h-6 flex items-center justify-center hover:bg-blue-100 hover:text-blue-700 rounded-full cursor-pointer mx-auto transition-colors">
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {vistaCalendario === 'week' && (
                  /* --- VISTA SEMANAL FUNCIONAL Y PROPORCIONAL --- */
                  <div className="flex overflow-x-auto min-w-[800px]">
                    <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-white">
                      <div className="h-12 border-b border-gray-200"></div> 
                      <div className="h-10 text-[10px] text-gray-500 text-center flex justify-center items-center border-b border-gray-100 bg-gray-50">todo-día</div>
                      {horasDelDia.map(hora => (
                        <div key={hora} className="h-16 relative border-b border-gray-100">
                          <span className="absolute -top-2 right-2 text-xs text-gray-400">{hora}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-7">
                      {diasDeLaSemana.map((diaObj, index) => {
                        const esHoy = diaObj.toDateString() === new Date().toDateString();
                        
                        return (
                          <div key={index} className={`border-r border-gray-200 relative ${esHoy ? 'bg-blue-50/20' : ''}`}>
                            <div className={`h-12 border-b border-gray-200 flex flex-col items-center justify-center text-sm ${esHoy ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-600 bg-gray-50/30'}`}>
                              <span>{nombresDiasCortos[diaObj.getDay()]} {diaObj.getDate()}</span>
                            </div>
                            <div className="h-10 border-b border-gray-100"></div> 
                            
                            {/* Cuadrícula de horas y Eventos Dinámicos */}
                            <div className="relative" style={{ height: `${horasDelDia.length * 4}rem` }}>
                               {horasDelDia.map((_, i) => <div key={i} className="h-16 border-b border-gray-100"></div>)}

                               {/* Renderizado Matemático de Eventos */}
                               {eventosSimulados.filter(e => e.diaSemana === diaObj.getDay()).map((evento, idx) => (
                                 <div 
                                   key={idx}
                                   // Asignación de clases dinámicas basadas en el estado
                                   className={`absolute left-1 right-1 rounded p-1.5 text-xs cursor-pointer flex flex-col overflow-hidden transition-all hover:scale-[1.02] z-10 
                                     ${coloresEstado[evento.estado as keyof typeof coloresEstado]}`}
                                   style={{ 
                                     top: `${evento.inicio * 4}rem`, // Cada hora son 4rem (h-16)
                                     height: `${(evento.fin - evento.inicio) * 4}rem` 
                                   }}
                                 >
                                    <div className="font-semibold">{formatTime(evento.inicio)} - {formatTime(evento.fin)}</div>
                                    <div className="truncate mt-0.5">{evento.titulo}</div>
                                 </div>
                               ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {vistaCalendario === 'month' && (
                  /* --- VISTA MENSUAL --- */
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                      {nombresDiasCortos.map(dia => (
                        <div key={dia} className="py-2 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-0">{dia}</div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 auto-rows-[100px]">
                      {diasDelMes.map((diaObj, i) => {
                        const esEsteMes = diaObj.getMonth() === currentDate.getMonth();
                        const esHoy = diaObj.toDateString() === new Date().toDateString();

                        return (
                          <div key={i} className={`border-b border-r border-gray-200 p-1 relative hover:bg-gray-50 transition-colors ${!esEsteMes ? 'bg-gray-50 opacity-60' : ''} ${esHoy ? 'bg-blue-50/20' : ''}`}>
                            <span className={`text-sm p-1 block text-right ${esHoy ? 'text-blue-600 font-bold bg-blue-100 w-7 h-7 flex items-center justify-center rounded-full ml-auto' : 'text-gray-500'}`}>
                              {diaObj.getDate()}
                            </span>
                            
                            {/* Mostrar eventos si coincide el día de la semana */}
                            {esEsteMes && eventosSimulados.filter(e => e.diaSemana === diaObj.getDay()).slice(0, 2).map((ev, idx) => (
                              <div key={idx} className={`text-[10px] px-1.5 py-0.5 rounded truncate mt-1 cursor-pointer font-medium
                                ${ev.estado === 'disponible' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                {formatTime(ev.inicio)} - {ev.titulo}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón Final (Crear Excel) */}
            <div className="flex justify-end mt-8">
              <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm transition-colors">
                <span className="text-lg">📊</span>
                Crear Excel
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}