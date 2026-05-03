import { Evaluation } from '../types';

const API_BASE = '/api';

export const evaluationService = {
  getAll: async (): Promise<Evaluation[]> => {
    const response = await fetch(`${API_BASE}/evaluations/`);
    if (!response.ok) throw new Error('Error al cargar evaluaciones');
    const data = await response.json();
    return data.map((item: any) => ({
      id: item.id,
      carnet: item.student_carnet,
      nombre: item.student_name,
      curso: item.career_name,
      pago: item.pago,
      tutor: {
        nombre: item.tutor_nombre,
        estado: item.tutor_estado
      },
      fecha: item.date,
      hora: item.hour,
      aula: item.classroom,
      edificio: item.building
    }));
  },

  create: async (data: {
    studentid: number;
    date: string;
    hour: string;
    classroom: string;
    building: string;
    type: number;
  }): Promise<Evaluation> => {
    const response = await fetch(`${API_BASE}/evaluations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al crear evaluación');
    const result = await response.json();
    return result;
  },

  update: async (id: number, data: Partial<Evaluation>): Promise<Evaluation> => {
    const response = await fetch(`${API_BASE}/evaluations/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error al actualizar evaluación');
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/evaluations/${id}/`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar evaluación');
  },

  togglePago: async (studentId: number, currentStatus: boolean): Promise<void> => {
    const response = await fetch(`${API_BASE}/students/${studentId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ haspayment: !currentStatus })
    });
    if (!response.ok) throw new Error('Error al actualizar pago');
  },

  toggleTutor: async (evaluationId: number, currentState: string): Promise<void> => {
    const newState = currentState === 'acuerdo' ? 'Pendiente' : 'Aprobado';
    const response = await fetch(`${API_BASE}/results/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        evaluationid: evaluationId,
        state: newState,
        observation: ''
      })
    });
    if (!response.ok) throw new Error('Error al actualizar estado del tutor');
  },

  getStudents: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/students/`);
    if (!response.ok) throw new Error('Error al cargar estudiantes');
    return response.json();
  },

  getTypes: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/types/`);
    if (!response.ok) throw new Error('Error al cargar tipos');
    return response.json();
  },

  getTeachers: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/teachers/?isactive=true`);
    if (!response.ok) throw new Error('Error al cargar docentes');
    return response.json();
  },

  getTeacherAvailability: async (teacherId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/teachers-periods/?teacher=${teacherId}`);
    if (!response.ok) throw new Error('Error al cargar disponibilidad');
    return response.json();
  }
};