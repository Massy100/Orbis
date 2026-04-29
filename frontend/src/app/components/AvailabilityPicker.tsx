'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  X,
  CheckCircle
} from 'lucide-react';
import "@/src/app/styles/AvailabilityPicker.css";

interface AvailabilityPickerProps {
  onSave: (teacherNames: string[]) => void;
  onCancel: () => void;
  maxSelections?: number;
}

export default function AvailabilityPicker({ 
  onSave, 
  onCancel, 
  maxSelections = 1 
}: AvailabilityPickerProps) {
  
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(
    Array(maxSelections).fill('1')
  );
  
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 16)); 
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombresDiasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const horasDelDia = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];

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

  // -------------------------------- Handlers ----------------------------------
  
  const handleTeacherChange = (index: number, newId: string) => {
    const updatedIds = [...selectedTeacherIds];
    updatedIds[index] = newId;
    setSelectedTeacherIds(updatedIds);
  };

  const handleConfirm = () => {
    const selectedNames = selectedTeacherIds.map(
      id => configDocentes[id as keyof typeof configDocentes].nombre
    );
    onSave(selectedNames);
  };

  const formatTime = (decimalHours: number) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const irAtras = () => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setDate(nuevaFecha.getDate() - 7);
    setCurrentDate(nuevaFecha);
  };

  const irAdelante = () => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setDate(nuevaFecha.getDate() + 7);
    setCurrentDate(nuevaFecha);
  };

  const inicioDeSemana = new Date(currentDate);
  inicioDeSemana.setDate(currentDate.getDate() - currentDate.getDay()); 
  const diasDeLaSemana = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(inicioDeSemana);
    d.setDate(inicioDeSemana.getDate() + i);
    return d;
  });

  return (
    <div className="availability-overlay">
      <div className="availability-container">
        
        {/* HEADER DEL SELECTOR */}
        <div className="availability-header">
          <div className="header-left">
            <button className="btn-close-picker" onClick={onCancel}>
              <X size={20} />
            </button>
            <h2>Disponibilidad de Catedráticos</h2>
          </div>
          
          <div className="header-actions">
            {/* Contenedor de Selectores Dinámicos */}
            <div className="multi-teacher-selectors">
              {selectedTeacherIds.map((id, index) => (
                <div key={index} className="teacher-picker">
                  <UserIcon size={18} className="icon-blue" />
                  <select 
                    value={id} 
                    onChange={(e) => handleTeacherChange(index, e.target.value)}
                    className="select-teacher"
                  >
                    {teachersList.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button className="btn-confirm-main" onClick={handleConfirm}>
              <CheckCircle size={18} /> 
              {maxSelections > 1 ? 'Asignar' : 'Asignar Catedrático'}
            </button>
          </div>
        </div>

        {/* BARRA DE NAVEGACIÓN DE FECHAS */}
        <div className="calendar-navbar">
          <div className="nav-left">
            <span className="current-month">
              {nombresMeses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="nav-arrows">
              <button onClick={irAtras} className="arrow-btn"><ChevronLeft /></button>
              <button onClick={irAdelante} className="arrow-btn"><ChevronRight /></button>
            </div>
          </div>
          <div className="nav-right">
             <span className="badge">Vista Semanal</span>
          </div>
        </div>

        {/* CALENDARIO */}
        <div className="calendar-grid-wrapper">
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

                return (
                  <div key={index} className="day-column">
                    <div className={`day-header ${esHoy ? 'today' : ''}`}>
                      <span className="day-name">{nombresDiasCortos[diaObj.getDay()]}</span>
                      <span className="day-num">{diaObj.getDate()}</span>
                    </div>

                    <div className="day-body">
                      {horasDelDia.map((_, i) => <div key={i} className="grid-line" />)}

                      {eventosSimulados
                        .filter(e => 
                          e.diaSemana === diaObj.getDay() && 
                          selectedTeacherIds.includes(e.docenteId) // Muestra eventos de todos los seleccionados
                        )
                        .map((evento, idx) => {
                          const config = configDocentes[evento.docenteId as keyof typeof configDocentes];
                          const eventKey = `${diaObj.toDateString()}-${evento.docenteId}-${evento.inicio}`;
                          const isLifted = hoveredEvent === eventKey || activeEvent === eventKey;

                          return (
                            <div
                              key={idx}
                              className={`event-card ${isLifted ? 'lifted' : ''}`}
                              style={{
                                top: `${(evento.inicio - 8) * 3}rem`,
                                height: `${(evento.fin - evento.inicio) * 3}rem`,
                                backgroundColor: config.theme.bg,
                                borderLeft: `4px solid ${config.theme.border}`,
                                color: config.theme.text,
                                // Si hay varios docentes, reducimos un poco el ancho o usamos z-index para solapados
                                zIndex: activeEvent === eventKey ? 10 : 1
                              }}
                              onMouseEnter={() => setHoveredEvent(eventKey)}
                              onMouseLeave={() => setHoveredEvent(null)}
                              onClick={() => setActiveEvent(activeEvent === eventKey ? null : eventKey)}
                            >
                              <span className="event-label">{config.nombre.split(' ').pop()}</span>
                              <span className="event-time-text">
                                {formatTime(evento.inicio)} - {formatTime(evento.fin)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * AvailabilityPicker - Componente de selección de disponibilidad para Catedráticos.
 * * Este componente es versátil y se adapta a dos flujos principales:
 * 1. Evaluación Especial: Se requiere 1 catedrático (maxSelections={1}).
 * 2. Evaluación Comprensiva: Se requiere una terna de 3 catedráticos (maxSelections={3}).
 @param {Object} props
 * @param {(names: string[]) => void} props.onSave - Retorna un array con los nombres seleccionados.
 * @param {() => void} props.onCancel - Función para cerrar el modal.
 * @param {number} [props.maxSelections=1] - (Opcional) Define cuántos selectores mostrar.
 * * @example
 * // CASO 1: Evaluación Especial
 * <AvailabilityPicker 
 * maxSelections={1} 
 * onCancel={() => setShowAvailability(false)}
 * onSave={(names) => setForm({ ...form, tutor: names[0] })} 
 * />
  @example
 * // CASO 2: Evaluación Comprensiva
 * <AvailabilityPicker 
 * maxSelections={3} 
 * onCancel={() => setShowAvailability(false)}
 * onSave={(names) => setForm({ ...form, tutor: names.join(", ") })} 
 * />
 */
