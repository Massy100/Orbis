'use client';

import DashboardLayout from '../components/layout';
import { Mail, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ================= DATOS DE EJEMPLO (MOCKS) =================
const evaluacionesPorMes = [
  { mes: 'ENE', especial: 120, comprensiva: 180 },
  { mes: 'FEB', especial: 210, comprensiva: 160 },
  { mes: 'MAR', especial: 320, comprensiva: 110 },
  { mes: 'ABR', especial: 250, comprensiva: 200 },
  { mes: 'MAY', especial: 380, comprensiva: 150 },
  { mes: 'JUN', especial: 290, comprensiva: 210 },
];

const pendientesPorAccion = [
  { label: 'ENVIAR CORREO', value: 18, max: 18, color: '#2563EB' },
  { label: 'REGISTRAR RESULTADO', value: 12, max: 18, color: '#2563EB' },
  { label: 'SUBIR DOCUMENTO', value: 8, max: 18, color: '#2563EB' },
  { label: 'ASIGNAR EVALUADOR', value: 4, max: 18, color: '#93C5FD' },
];

const docentesTop = [
  { initials: 'ER', name: 'Dr. Elena Rodríguez', dept: 'CIENCIAS SOCIALES', total: 48 },
  { initials: 'JM', name: 'MSc. Juan Carlos Mora', dept: 'INGENIERÍA', total: 42 },
  { initials: 'MS', name: 'Dra. Marta Sánchez', dept: 'ECONOMÍA', total: 35 },
  { initials: 'LM', name: 'Lic. Luis Montero', dept: 'ARTES', total: 29 },
];

// Colores para los avatares
const avatarColors = ['#DBEAFE', '#EDE9FE', '#FCE7F3', '#D1FAE5'];
const avatarTextColors = ['#2563EB', '#7C3AED', '#DB2777', '#059669'];

// Tooltip personalizado para la gráfica
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
  const totalEvaluaciones = 1284;
  const correosPendientes = 18;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">

        {/* TÍTULO */}


        {/* ===== FILA 1: DOS TARJETAS SUPERIORES ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Tarjeta: Total de Evaluaciones */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Total de Evaluaciones
                </p>
                <p className="text-5xl font-extrabold text-gray-900 mt-2 leading-none">
                  {totalEvaluaciones.toLocaleString('es-GT')}
                </p>
              </div>
              
            </div>
          </div>

          {/* Tarjeta: Correos Pendientes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Correos Pendientes
                </p>
                <p className="text-5xl font-extrabold text-gray-900 mt-2 leading-none">
                  {correosPendientes}
                </p>
              </div>
              <Mail size={36} className="text-gray-300 mt-1" strokeWidth={1.5} />
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
            <BarChart
              data={evaluacionesPorMes}
              barCategoryGap="35%"
              barGap={4}
            >
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="especial" name="Especial" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comprensiva" name="Comprensiva" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ===== FILA 3: DOS TARJETAS INFERIORES ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Tarjeta: Pendientes por tipo de acción */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5">
              Pendientes por tipo de acción
            </h2>
            <div className="flex flex-col gap-4">
              {pendientesPorAccion.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-gray-700">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(item.value / item.max) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta: Docentes con más evaluaciones */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-800 mb-5">
              Docentes con más evaluaciones
            </h2>
            <div className="flex flex-col gap-4">
              {docentesTop.map((docente, index) => (
                <div key={docente.name} className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                    style={{
                      backgroundColor: avatarColors[index],
                      color: avatarTextColors[index],
                    }}
                  >
                    {docente.initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{docente.name}</p>
                    <p className="text-xs text-gray-400 font-semibold">{docente.dept}</p>
                  </div>

                  {/* Total */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-extrabold text-blue-600">{docente.total}</p>
                    <p className="text-xs text-gray-400 font-semibold">TOTAL</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}