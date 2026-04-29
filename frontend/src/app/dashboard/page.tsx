// frontend/src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout';
import { BookOpen, Award, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchDashboardData } from '../services/dashboardService.js'; // Importamos el .js

const avatarColors = ['#DBEAFE', '#EDE9FE', '#FCE7F3', '#D1FAE5'];
const avatarTextColors = ['#2563EB', '#7C3AED', '#DB2777', '#059669'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para el Switch de Docentes Top
  const [topViewMode, setTopViewMode] = useState<'comprensivas' | 'especiales'>('comprensivas');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      const result = await fetchDashboardData();
      if (result.success) {
        setMetrics(result.data);
      }
      setIsLoading(false);
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-gray-500 font-semibold">
          Cargando métricas del sistema...
        </div>
      </DashboardLayout>
    );
  }

  if (!metrics) {
    return (
      <DashboardLayout>
        <div className="text-red-500 text-center">Error al conectar con la base de datos Neon.</div>
      </DashboardLayout>
    );
  }

  const currentTopTeachers = topViewMode === 'comprensivas' 
    ? metrics.top_teachers.comprensivas 
    : metrics.top_teachers.especiales;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* ===== FILA 1: TARJETAS SUPERIORES ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total Evaluaciones Comprensivas
                </p>
                <p className="text-5xl font-extrabold text-gray-900 mt-2 leading-none">
                  {metrics.cards_totals.comprensivas.toLocaleString('es-GT')}
                </p>
              </div>
              <BookOpen size={36} className="text-blue-500 mt-1" strokeWidth={1.5} />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total Evaluaciones Especiales
                </p>
                <p className="text-5xl font-extrabold text-gray-900 mt-2 leading-none">
                  {metrics.cards_totals.especiales.toLocaleString('es-GT')}
                </p>
              </div>
              <Award size={36} className="text-purple-500 mt-1" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* ===== FILA 2: GRÁFICA DE BARRAS ===== */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-800">
              Evaluaciones realizadas por mes
            </h2>
            <div className="flex items-center gap-5 text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-blue-600" />
                ESPECIAL
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-gray-200" />
                COMPRENSIVA
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={metrics.monthly_chart} barCategoryGap="35%" barGap={4}>
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="especial" name="Especial" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comprensiva" name="Comprensiva" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ===== FILA 3: DOS TARJETAS INFERIORES ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CONFIRMACIONES */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5">
              Confirmaciones de Docentes
            </h2>
            <div className="flex flex-col gap-4">
              {metrics.confirmations.map((item: any) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{item.value} / {item.max === 0 ? 1 : item.max}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${item.max === 0 ? 0 : (item.value / item.max) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DOCENTES TOP CON SWITCH */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-800">
                Docentes Top (Histórico)
              </h2>
              {/* SWITCH / TOGGLE */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setTopViewMode('comprensivas')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${topViewMode === 'comprensivas' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  COMPRENSIVAS
                </button>
                <button 
                  onClick={() => setTopViewMode('especiales')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${topViewMode === 'especiales' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  ESPECIALES
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-h-[200px]">
              {currentTopTeachers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center mt-10">No hay datos suficientes</p>
              ) : (
                currentTopTeachers.map((docente: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 animate-fadeIn">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                         style={{ backgroundColor: avatarColors[index % 4], color: avatarTextColors[index % 4] }}>
                      {docente.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{docente.name}</p>
                      <p className="text-xs text-gray-400 font-semibold">{docente.dept}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-base font-extrabold ${topViewMode === 'comprensivas' ? 'text-blue-600' : 'text-purple-600'}`}>
                        {docente.total}
                      </p>
                      <p className="text-xs text-gray-400 font-semibold">TOTAL</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}