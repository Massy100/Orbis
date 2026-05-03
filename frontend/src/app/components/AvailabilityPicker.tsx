'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  User as UserIcon,
  X,
  CheckCircle
} from 'lucide-react';
import "@/src/app/styles/AvailabilityPicker.css";

interface Teacher {
  id: string;
  name: string;
}

interface AvailabilityPickerProps {
  onSave: (teacherNames: string[]) => void;
  onCancel: () => void;
  maxSelections?: number;
  teachers?: Teacher[]; 
}

export default function AvailabilityPicker({ 
  onSave, 
  onCancel, 
  maxSelections = 1,
  teachers: externalTeachers 
}: AvailabilityPickerProps) {
  
  const defaultTeachers = [
    { id: '1', name: 'MSc. Ing. Carlos Pérez' },
    { id: '2', name: 'Ing. Ana López' },
    { id: '3', name: 'Ing. Roberto Juárez' }
  ];
  
  const teachersList = externalTeachers || defaultTeachers;
  
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(() => {
    const initial = Array(maxSelections).fill('');
    if (teachersList.length > 0) {
      return initial.map(() => teachersList[0].id);
    }
    return initial;
  });
  
  const [currentDate, setCurrentDate] = useState(new Date()); // Usar fecha actual
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombresDiasCortos = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const horasDelDia = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];

  const getTeacherTheme = (teacherId: string) => {
    const themes = {
      '1': { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' },
      '2': { bg: '#f0fdf4', border: '#10b981', text: '#065f46' },
      '3': { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' }
    };
    return themes[teacherId as keyof typeof themes] || { bg: '#f3e8ff', border: '#9333ea', text: '#6b21a8' };
  };

  const eventosSimulados = [
    { docenteId: '1', diaSemana: 1, inicio: 8, fin: 10 },  // Lunes
    { docenteId: '2', diaSemana: 1, inicio: 8, fin: 11 },
    { docenteId: '3', diaSemana: 1, inicio: 8.5, fin: 12 },
    { docenteId: '1', diaSemana: 2, inicio: 8, fin: 10 },  // Martes
    { docenteId: '1', diaSemana: 2, inicio: 12, fin: 14 },
    { docenteId: '1', diaSemana: 3, inicio: 14, fin: 16 },  // Miércoles
    { docenteId: '3', diaSemana: 3, inicio: 14, fin: 17 },
    { docenteId: '2', diaSemana: 4, inicio: 10, fin: 12 },  // Jueves
  ];

  // -------------------------------- Handlers ----------------------------------
  
  const handleTeacherChange = (index: number, newId: string) => {
    const updatedIds = [...selectedTeacherIds];
    updatedIds[index] = newId;
    setSelectedTeacherIds(updatedIds);
  };

  const handleConfirm = () => {
    // Filtrar IDs vacíos y obtener nombres
    const validIds = selectedTeacherIds.filter(id => id && id !== '');
    const selectedNames = validIds.map(id => {
      const teacher = teachersList.find(t => t.id === id);
      return teacher?.name || 'Sin seleccionar';
    });
    
    if (selectedNames.length > 0) {
      onSave(selectedNames);
    }
    onCancel(); // Cerrar después de guardar
  };

  const formatTime = (decimalHours: number): string => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
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

  const irHoy = () => {
    setCurrentDate(new Date());
  };

  // Calcular días de la semana correctamente
  const getDaysOfWeek = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = date.getDay();
    // Ajustar para que la semana empiece el lunes (1) en lugar de domingo (0)
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(date.getDate() - diff);
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  const diasDeLaSemana = getDaysOfWeek(currentDate);

  // Verificar si hay docentes disponibles
  if (teachersList.length === 0) {
    return (
      <div className="availability-overlay">
        <div className="availability-container">
          <div className="availability-header">
            <h2>No hay docentes disponibles</h2>
            <button onClick={onCancel} className="btn-close-picker">
              <X size={20} />
            </button>
          </div>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>No se encontraron catedráticos activos en el sistema.</p>
            <button onClick={onCancel} className="btn-cancel">Cerrar</button>
          </div>
        </div>
      </div>
    );
  }

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
              {Array.from({ length: maxSelections }).map((_, index) => (
                <div key={index} className="teacher-picker">
                  <UserIcon size={18} className="icon-blue" />
                  <select 
                    value={selectedTeacherIds[index] || ''}
                    onChange={(e) => handleTeacherChange(index, e.target.value)}
                    className="select-teacher"
                  >
                    <option value="" disabled>Seleccionar docente</option>
                    {teachersList.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button className="btn-confirm-main" onClick={handleConfirm}>
              <CheckCircle size={18} /> 
              {maxSelections > 1 ? 'Asignar Tutores' : 'Asignar Catedrático'}
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
              <button onClick={irAtras} className="arrow-btn" title="Semana anterior">
                <ChevronLeft size={18} />
              </button>
              <button onClick={irHoy} className="today-btn">Hoy</button>
              <button onClick={irAdelante} className="arrow-btn" title="Semana siguiente">
                <ChevronRight size={18} />
              </button>
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
                const diaSemana = diaObj.getDay();
                // Ajustar para que lunes sea 1, domingo sea 7
                const diaSemanaAjustado = diaSemana === 0 ? 7 : diaSemana;

                return (
                  <div key={index} className="day-column">
                    <div className={`day-header ${esHoy ? 'today' : ''}`}>
                      <span className="day-name">{nombresDiasCortos[diaSemana]}</span>
                      <span className="day-num">{diaObj.getDate()}</span>
                    </div>

                    <div className="day-body">
                      {/* Líneas de hora */}
                      {horasDelDia.map((_, i) => (
                        <div key={i} className="grid-line" />
                      ))}

                      {/* Eventos filtrados por día y docentes seleccionados */}
                      {eventosSimulados
                        .filter(evento => 
                          evento.diaSemana === diaSemanaAjustado && 
                          selectedTeacherIds.includes(evento.docenteId) &&
                          evento.docenteId // Asegurar que no sea undefined
                        )
                        .map((evento, idx) => {
                          const theme = getTeacherTheme(evento.docenteId);
                          const teacher = teachersList.find(t => t.id === evento.docenteId);
                          const eventKey = `${diaObj.toDateString()}-${evento.docenteId}-${evento.inicio}`;
                          const isLifted = hoveredEvent === eventKey || activeEvent === eventKey;
                          
                          // Calcular posición (asumiendo que cada hora = 3rem)
                          const topPosition = (evento.inicio - 8) * 3;
                          const heightValue = (evento.fin - evento.inicio) * 3;

                          return (
                            <div
                              key={`${evento.docenteId}-${idx}`}
                              className={`event-card ${isLifted ? 'lifted' : ''}`}
                              style={{
                                top: `${topPosition}rem`,
                                height: `${heightValue}rem`,
                                backgroundColor: theme.bg,
                                borderLeft: `4px solid ${theme.border}`,
                                color: theme.text,
                                zIndex: activeEvent === eventKey ? 10 : 1,
                                position: 'absolute',
                                left: '0',
                                right: '0',
                                margin: '0 2px',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                cursor: 'pointer',
                                overflow: 'hidden'
                              }}
                              onMouseEnter={() => setHoveredEvent(eventKey)}
                              onMouseLeave={() => setHoveredEvent(null)}
                              onClick={() => setActiveEvent(activeEvent === eventKey ? null : eventKey)}
                            >
                              <span className="event-label" style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                {teacher?.name.split(' ').slice(-1)[0] || evento.docenteId}
                              </span>
                              <span className="event-time-text" style={{ fontSize: '0.7rem', display: 'block' }}>
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
 * 
 * @param {Object} props
 * @param {(names: string[]) => void} props.onSave - Retorna un array con los nombres seleccionados
 * @param {() => void} props.onCancel - Función para cerrar el modal
 * @param {number} [props.maxSelections=1] - Define cuántos selectores mostrar
 * @param {Teacher[]} [props.teachers] - Lista de docentes (opcional, para usar API real)
 * 
 * @example
 * // Evaluación Especial (1 tutor)
 * <AvailabilityPicker 
 *   maxSelections={1} 
 *   onCancel={() => setShowAvailability(false)}
 *   onSave={(names) => setForm({ ...form, tutor: names[0] })} 
 * />
 * 
 * @example
 * // Evaluación Comprensiva (3 tutores)
 * <AvailabilityPicker 
 *   maxSelections={3} 
 *   onCancel={() => setShowAvailability(false)}
 *   onSave={(names) => setForm({ ...form, tutores: names.join(", ") })} 
 * />
 * 
 * @example
 * // Con API real
 * <AvailabilityPicker 
 *   maxSelections={1}
 *   teachers={teachersFromAPI}
 *   onCancel={() => setShowAvailability(false)}
 *   onSave={(names) => setForm({ ...form, tutor: names[0] })}
 * />
 */