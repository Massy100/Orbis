'use client';

import { useState } from 'react';
import DashboardLayout from '../components/layout';
import { ChevronLeft, ChevronRight, Download, Clock } from 'lucide-react';

export default function AvailabilityPage() {
  // ================= STATES =================
  // Selection slots (Colors are tied to the slot position)
  const [slot1, setSlot1] = useState('1'); 
  const [slot2, setSlot2] = useState('2'); 
  const [slot3, setSlot3] = useState('3');

  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 16)); // Default to April 2026

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const shortDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const dayHours = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];

  // ================= POSITION-BASED COLORS (As per mockups) =================
  const slotThemes = {
    slot1: { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' }, // BLUE
    slot2: { bg: '#f0fdf4', border: '#10b981', text: '#065f46' }, // GREEN/TEAL
    slot3: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e' }  // ORANGE/AMBER
  };

  const teachersList = [
    { id: '1', name: 'MSc. Ing. Carlos Pérez' },
    { id: '2', name: 'Ing. Ana López' },
    { id: '3', name: 'Ing. Roberto Juárez' }
  ];

  const getTeacherName = (id: string) => teachersList.find(t => t.id === id)?.name || '';

  // ================= MOCK EVENTS (Including Overlaps) =================
  const mockEvents = [
    { slot: 'slot1', teacherId: slot1, day: 2, start: 8, end: 10, title: 'Sistemas Operativos I' },
    { slot: 'slot2', teacherId: slot2, day: 2, start: 8, end: 10, title: 'Sistemas Operativos I' }, // OVERLAP
    { slot: 'slot1', teacherId: slot1, day: 4, start: 11, end: 13, title: 'Proyecto Final' },
    { slot: 'slot3', teacherId: slot3, day: 1, start: 14, end: 16, title: 'Base de Datos II' },
  ];

  // ================= NAVIGATION LOGIC =================
  const moveWeek = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (offset * 7));
    setCurrentDate(d);
  };

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-6">
        
        {/* TOP SECTION: Title and Nav Controls Outside */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Disponibilidad</h2>
          </div>
          
          {/* Calendar Nav: Outside and Top Right */}
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-700">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <div className="flex bg-white border border-gray-200 rounded-lg shadow-sm">
              <button onClick={() => moveWeek(-1)} className="p-2 hover:bg-gray-50 border-r border-gray-200"><ChevronLeft size={20}/></button>
              <button onClick={() => moveWeek(1)} className="p-2 hover:bg-gray-50"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>

        {/* TEACHER SELECTION SLOTS */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <label className="block text-sm font-bold text-gray-600 mb-4 uppercase tracking-wider">
            Selección de docentes
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <select value={slot1} onChange={e => setSlot1(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="">-- Docente 1 --</option>
                {teachersList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="h-1 rounded-full" style={{ backgroundColor: slotThemes.slot1.border }}></div>
            </div>
            <div className="space-y-2">
              <select value={slot2} onChange={e => setSlot2(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="">-- Docente 2 --</option>
                {teachersList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="h-1 rounded-full" style={{ backgroundColor: slotThemes.slot2.border }}></div>
            </div>
            <div className="space-y-2">
              <select value={slot3} onChange={e => setSlot3(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <option value="">-- Docente 3 --</option>
                {teachersList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="h-1 rounded-full" style={{ backgroundColor: slotThemes.slot3.border }}></div>
            </div>
          </div>
        </div>

        {/* CALENDAR GRID (Full Width) */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[600px]">
          <div className="flex flex-1 overflow-x-auto">
            {/* Timeline Column */}
            <div className="w-20 flex-shrink-0 bg-gray-50/50 border-r border-gray-100">
              <div className="h-14 border-b border-gray-200"></div>
              {dayHours.map(h => (
                <div key={h} className="h-24 border-b border-gray-50 flex items-start justify-center pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{h}</span>
                </div>
              ))}
            </div>

            {/* Days Columns */}
            <div className="flex-1 grid grid-cols-7 min-w-[800px]">
              {weekDays.map((day, dIdx) => (
                <div key={dIdx} className="border-r border-gray-100 relative">
                  <div className="h-14 border-b border-gray-200 flex flex-col items-center justify-center bg-gray-50/30">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{shortDayNames[day.getDay()]}</span>
                    <span className="text-lg font-bold text-gray-800">{day.getDate()}</span>
                  </div>
                  
                  <div className="relative h-full">
                    {dayHours.map((_, i) => <div key={i} className="h-24 border-b border-gray-50"></div>)}
                    
                    {/* Render Events */}
                    {mockEvents
                      .filter(e => e.day === day.getDay() && e.teacherId !== '')
                      .map((ev, eIdx, arr) => {
                        const theme = slotThemes[ev.slot as keyof typeof slotThemes];
                        const overlaps = arr.filter(o => o.start === ev.start).length;
                        const width = overlaps > 1 ? `${95/overlaps}%` : '90%';
                        const left = overlaps > 1 ? `${(arr.indexOf(ev) % overlaps) * (100/overlaps)}%` : '5%';

                        return (
                          <div 
                            key={eIdx}
                            className="absolute rounded-lg p-3 border-l-4 text-[10px] shadow-sm flex flex-col z-10"
                            style={{
                              top: `${(ev.start - 8) * 6}rem`, // h-24 = 6rem
                              height: `${(ev.end - ev.start) * 6}rem`,
                              width: width,
                              left: left,
                              backgroundColor: theme.bg,
                              borderLeftColor: theme.border,
                              color: theme.text
                            }}
                          >
                            <span className="font-bold mb-1 flex items-center gap-1 opacity-70">
                              <Clock size={10}/> {ev.start}:00 - {ev.end}:00
                            </span>
                            <span className="font-extrabold uppercase mb-1">{ev.title}</span>
                            <span className="mt-auto italic font-semibold">{getTeacherName(ev.teacherId)}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER: Create Excel Button Bottom Right */}
        <div className="flex justify-end pt-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition-all uppercase text-sm tracking-wide">
            <Download size={20}/> Crear Excel
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}