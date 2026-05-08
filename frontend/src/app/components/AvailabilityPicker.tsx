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
import { useAvailability } from '@/src/app/hooks/use-availability';
import { SelectedTeacher } from "../types";

interface Teacher {
  id: number;
  name: string;
}

interface AvailabilityEvent {
  docenteId: string;
  diaSemana: number;
  inicio: number;
  fin: number;
}

interface FilterOptions {
  mode?: 'comprehensive' | 'special';
  studygroupId?: number;
}

interface AvailabilityPickerProps {
  onSave: (teachers: SelectedTeacher[]) => void;
  onCancel: () => void;
  maxSelections?: number;
  filterOptions?: FilterOptions;
}

const PALETAS = [
  { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' },
  { bg: '#f0fdf4', border: '#10b981', text: '#065f46' },
  { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' },
  { bg: '#fdf4ff', border: '#a855f7', text: '#6b21a8' },
  { bg: '#fff1f2', border: '#f43f5e', text: '#9f1239' },
];

export default function AvailabilityPicker({
  onSave,
  onCancel,
  maxSelections = 1,
  filterOptions = {},
}: AvailabilityPickerProps) {

  // Propaga filterOptions al hook para que filtre los docentes elegibles
  const { teachers, events, loading } = useAvailability([], filterOptions);

  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(
    Array(maxSelections).fill('')
  );
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [activeEvent, setActiveEvent]   = useState<string | null>(null);

  const nombresMeses      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const nombresDiasCortos = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const horasDelDia       = ['7am', '8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm', '7pm', '8pm', '9pm'];

  // Create a dinamic config for teachers to assign colors and names easily only for the selected ones (those that appear on events)
  const configDocentes: Record<string, { nombre: string; theme: typeof PALETAS[0] }> = Object.fromEntries(
    teachers.map((t: Teacher, i: number) => [
      String(t.id),
      { nombre: t.name, theme: PALETAS[i % PALETAS.length] }
    ])
  );

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Get label based on filter options */
  const getLabel = () => {
    if (filterOptions.mode === 'comprehensive') {
      return maxSelections > 1 ? 'Asignar Evaluadores' : 'Asignar Evaluador';
    }
    if (filterOptions.mode === 'special') {
      return maxSelections > 1 ? 'Asignar Evaluadores' : 'Asignar Evaluador';
    }
    return maxSelections > 1 ? 'Asignar Tutores' : 'Asignar Catedrático';
  };

  const getTitle = () => {
    if (filterOptions.mode === 'comprehensive') return 'Disponibilidad — Evaluadores (Comprensiva)';
    if (filterOptions.mode === 'special')        return 'Disponibilidad — Evaluadores (Especial)';
    return maxSelections > 1 ? 'Disponibilidad de Tutores' : 'Disponibilidad de Catedráticos';
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleTeacherChange = (index: number, newId: string) => {
    const updated = [...selectedTeacherIds];
    updated[index] = newId;
    setSelectedTeacherIds(updated);
  };

  const handleConfirm = () => {
    const selectedTeachers = selectedTeacherIds
      .filter(id => id && configDocentes[id])
      .map(id => ({
        id: Number(id),
        name: configDocentes[id].nombre
      }));

    onSave(selectedTeachers);
  };

  const formatTime = (decimalHours: number) => {
    const hours   = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const ampm    = hours >= 12 ? 'pm' : 'am';
    const display = hours > 12 ? hours - 12 : hours;
    return `${display}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const irAtras = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const irAdelante = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  // Días de la semana actual
  const inicioDeSemana = new Date(currentDate);
  inicioDeSemana.setDate(currentDate.getDate() - currentDate.getDay());
  const diasDeLaSemana = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(inicioDeSemana);
    d.setDate(inicioDeSemana.getDate() + i);
    return d;
  });

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="availability-overlay">
        <div className="availability-container" style={{ display: 'grid', placeItems: 'center' }}>
          <p>Cargando disponibilidad...</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="availability-overlay">
      <div className="availability-container">
        {/* HEADER */}
        <div className="availability-header">
          <div className="header-left">
            <button className="btn-close-picker" onClick={onCancel}>
              <X size={20} />
            </button>
            <h2>{getTitle()}</h2>
          </div>

          <div className="header-actions">
            <div className="multi-teacher-selectors">
              {selectedTeacherIds.map((id, index) => (
                <div key={index} className="teacher-picker">
                  <select
                    value={id}
                    onChange={(e) => handleTeacherChange(index, e.target.value)}
                    className="select-teacher"
                    style={{
                      border: `2px solid ${
                        id ? configDocentes[id]?.theme.border : '#e5e7eb'
                      }`,
                      backgroundColor: id
                        ? `${configDocentes[id]?.theme.border}10`
                        : '#ffffff'
                    }}
                  >
                    <option className="select-option" value="">
                      -- Seleccionar --
                    </option>
                    {teachers.map((t: Teacher) => (
                      <option
                        key={t.id}
                        value={String(t.id)}
                        // Evita seleccionar el mismo docente dos veces
                        disabled={selectedTeacherIds.includes(String(t.id)) && String(t.id) !== id}
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button className="btn-confirm-main" onClick={handleConfirm}>
              <CheckCircle size={18} />
              {getLabel()}
            </button>
          </div>
        </div>

        {/* NAVBAR DE FECHAS */}
        <div className="calendar-navbar">
          <div className="nav-left">
            <span className="month-text">
              {nombresMeses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="nav-arrows">
              <button onClick={irAtras}    className="arrow-btn"><ChevronLeft /></button>
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

            {/* Columna de horas */}
            <div className="hour-column">
              <div className="hour-header-spacer" />
              {horasDelDia.map(hora => (
                <div key={hora} className="hour-cell">
                  {hora}
                </div>
              ))}
            </div>

            {/* Columnas de días */}
            <div className="day-grid">
              {diasDeLaSemana.map((diaObj, index) => {
                const esHoy =
                  diaObj.toDateString() === new Date().toDateString();

                // Eventos del día que pertenecen a los docentes seleccionados
                const eventosDia = events.filter((e: AvailabilityEvent) =>
                  e.diaSemana === diaObj.getDay() &&
                  selectedTeacherIds.includes(e.docenteId)
                );

                return (
                  <div key={index} className="day-column">
                    
                    {/* HEADER DÍA */}
                    <div className={`day-header ${esHoy ? 'today' : 'normal'}`}>
                      <span>{nombresDiasCortos[diaObj.getDay()]}</span>
                      <span className="day-number">
                        {diaObj.getDate()}
                      </span>
                    </div>

                    {/* BODY */}
                    <div className="day-body">
                      {horasDelDia.map((_, i) => (
                        <div key={i} className="grid-line" />
                      ))}

                      {eventosDia.map((evento: AvailabilityEvent, idx: number) => {
                        const config = configDocentes[evento.docenteId];
                        if (!config) return null;

                        const solapados = eventosDia.filter(e => 
                          (evento.inicio < e.fin && evento.fin > e.inicio)
                        );                        
                        const numSolapados = solapados.length;
                        const orden = solapados.findIndex(e => e.docenteId === evento.docenteId);
                        const offsetX = 8;
                        const offsetY = 8;
                        
                        const width = 100 / numSolapados;
                        const left = width * orden;

                        const eventKey = `${diaObj.toDateString()}-${evento.docenteId}-${evento.inicio}`;
                        const isLifted = hoveredEvent === eventKey || activeEvent === eventKey;

                        return (
                          <div
                            key={idx}
                            className={`event-card ${isLifted ? 'lifted' : ''}`}
                            style={{
                              top: `calc(((${evento.inicio} - 7) * var(--cell-height)) + (${orden} * ${offsetY}px))`,
                              height: `calc((${evento.fin} - ${evento.inicio}) * var(--cell-height))`,
                              backgroundColor: config.theme.bg,
                              borderLeft: `4px solid ${config.theme.border}`,
                              color: config.theme.text,
                              zIndex: isLifted ? 100 : (10 + orden),
                              width: '87%',
                              left: `calc(4% + (${orden} * ${offsetX}px))`,
                            }}
                            onMouseEnter={() => setHoveredEvent(eventKey)}
                            onMouseLeave={() => setHoveredEvent(null)}
                            onClick={() => setActiveEvent(activeEvent === eventKey ? null : eventKey)}
                          >
                            <span className="event-label">
                              {config.nombre.split(' ').pop()}
                            </span>

                            <span className="event-time-text">
                              {formatTime(evento.inicio)} - {formatTime(evento.fin)}
                            </span>

                            {isLifted && (
                              <span className="event-teacher-full">
                                {config.nombre}
                              </span>
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
        </div>

      </div>
    </div>
  );
}