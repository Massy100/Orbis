// src/app/hooks/useEvaluations.ts
import { useState, useEffect } from "react";
import { Evaluation } from "../types";

const API_BASE = '/api';

export function useEvaluations() {
  const [data, setData] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Métodos del servicio integrados en el hook
  const getAll = async (): Promise<Evaluation[]> => {
    const response = await fetch(`${API_BASE}/evaluations/`);
    if (!response.ok) throw new Error('Error al cargar evaluaciones');
    const responseData = await response.json();
    return responseData.map((item: any) => ({
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
  };

  const update = async (id: number, updateData: any): Promise<any> => {
    const response = await fetch(`${API_BASE}/evaluations/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!response.ok) throw new Error('Error al actualizar evaluación');
    return response.json();
  };

  const create = async (createData: {
    studentid: number;
    date: string;
    hour: string;
    classroom: string;
    building: string;
    type: number;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE}/evaluations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    });
    if (!response.ok) throw new Error('Error al crear evaluación');
    return response.json();
  };

  const deleteEvaluation = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/evaluations/${id}/`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar evaluación');
  };

  const togglePago = async (studentId: number, currentStatus: boolean): Promise<void> => {
    const response = await fetch(`${API_BASE}/students/${studentId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ haspayment: !currentStatus })
    });
    if (!response.ok) throw new Error('Error al actualizar pago');
  };

  const toggleTutor = async (evaluationId: number, currentState: string): Promise<void> => {
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
  };

  const getStudents = async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/students/`);
    if (!response.ok) throw new Error('Error al cargar estudiantes');
    return response.json();
  };

  const getTypes = async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/types/`);
    if (!response.ok) throw new Error('Error al cargar tipos');
    return response.json();
  };

  const getTeachers = async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/teachers/?isactive=true`);
    if (!response.ok) throw new Error('Error al cargar docentes');
    return response.json();
  };

  const getTeacherAvailability = async (teacherId: number): Promise<any[]> => {
    const response = await fetch(`${API_BASE}/teachers-periods/?teacher=${teacherId}`);
    if (!response.ok) throw new Error('Error al cargar disponibilidad');
    return response.json();
  };

  // Función para cargar evaluaciones
  const loadEvaluations = async () => {
    try {
      setLoading(true);
      const evaluations = await getAll();
      setData(evaluations);
      setError(null);
    } catch (err) {
      setError('Error al cargar las evaluaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para guardar evaluación (crear o editar)
  const saveEvaluation = async (formData: any, editingId: number | null) => {
    try {
      if (editingId) {
        const updateData = {
          date: formData.date,
          hour: formData.hour,
          classroom: formData.classroom,
          building: formData.building,
          type: Number(formData.typeId)
        };
        await update(editingId, updateData);
        await loadEvaluations();
      } else {
        await create({
          studentid: Number(formData.studentId),
          date: formData.date,
          hour: formData.hour,
          classroom: formData.classroom,
          building: formData.building,
          type: Number(formData.typeId)
        });
        await loadEvaluations();
      }
    } catch (err) {
      console.error('Error al guardar:', err);
      throw err;
    }
  };

  // Wrappers para toggle con solo ID
  const handleTogglePago = async (id: number) => {
    const item = data.find(i => i.id === id);
    if (!item) return;
    
    const studentId = parseInt(item.carnet);
    const currentStatus = item.pago === "pagado";
    
    await togglePago(studentId, currentStatus);
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, pago: currentStatus ? "pendiente" : "pagado" } : item
    ));
  };

  const handleToggleTutor = async (id: number) => {
    const item = data.find(i => i.id === id);
    if (!item) return;
    
    const currentState = item.tutor.estado;
    await toggleTutor(id, currentState);
    setData(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        tutor: { ...item.tutor, estado: currentState === "acuerdo" ? "no_acuerdo" : "acuerdo" }
      } : item
    ));
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadEvaluations();
  }, []);

  return {
    // Datos y estados
    data,
    loading,
    error,
    // Funciones principales
    togglePago: handleTogglePago,
    toggleTutor: handleToggleTutor,
    deleteEvaluation,
    saveEvaluation,
    reload: loadEvaluations,
    // Funciones auxiliares (para el formulario)
    getStudents,
    getTypes,
    getTeachers,
    getTeacherAvailability
  };
}