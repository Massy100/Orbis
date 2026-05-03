// page.tsx - Versión corregida con tipos
"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/src/app/components/layout";
import AvailabilityPicker from "../../components/AvailabilityPicker";
import Pagination from "../../components/pagination";
import { EvaluationRow } from "../../components/evaluationRow";
import { useEvaluations } from "../../hooks/useEvaluations";
import { evaluationService } from "../../services/evaluationService";
import { Evaluation } from "../../types";
import "./special-evaluation.css";
import { Plus, X } from "lucide-react";

export default function EvaluacionEspecialPage() {
  const { 
    data, 
    loading,
    error,
    togglePago,
    toggleTutor, 
    deleteEvaluation, 
    saveEvaluation,
    reload
  } = useEvaluations();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    studentId: "", 
    nombre: "", 
    curso: "", 
    date: "",
    hour: "",
    classroom: "",
    building: "",
    typeId: ""
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);

  // Cargar estudiantes y tipos para el formulario
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const [studentsData, typesData] = await Promise.all([
          evaluationService.getStudents(),
          evaluationService.getTypes()
        ]);
        setStudents(studentsData);
        setTypes(typesData);
      } catch (err) {
        console.error('Error loading form data:', err);
      }
    };
    loadFormData();
  }, []);

  const totalItems = data.length;

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return [];
    return students.filter((s: any) => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.est.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, students]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / pageSize);
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalItems, page, pageSize]);


const handleOpenEdit = (item: Evaluation) => {
  setForm({
    studentId: item.carnet,
    nombre: item.nombre,
    curso: item.curso,
    date: (item as any).fecha || "",  
    hour: (item as any).hora || "",
    classroom: (item as any).aula || "",
    building: (item as any).edificio || "",
    typeId: ""
  });
  setEditingId(item.id);
  setIsModalOpen(true);
};

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveEvaluation(form, editingId);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ 
      studentId: "", nombre: "", curso: "", date: "", hour: "", 
      classroom: "", building: "", typeId: "" 
    });
    setSearchTerm("");
  };

  // CORREGIDO: Tipado explícito para student
  const handleSelectStudent = (student: any) => {
    setForm({
      ...form,
      studentId: student.id,
      nombre: student.name,
      curso: student.career_name
    });
    setSearchTerm(`${student.est} - ${student.name}`);
    setShowStudentSuggestions(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="eval-container">
          <div style={{ textAlign: "center", padding: "40px" }}>Cargando evaluaciones...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="eval-container">
          <div style={{ textAlign: "center", padding: "40px", color: "red" }}>{error}</div>
          <button onClick={reload}>Reintentar</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="eval-container">

        <div className="eval-header">
          <button className="btn-add" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Agregar Evaluación
          </button>
        </div>

        <div className="table-wrapper">
          <table className="eval-table">
            <thead>
              <tr>
                <th>Carnet</th>
                <th>Nombre</th>
                <th>Curso</th>
                <th>Pago</th>
                <th>Tutor</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                    No hay evaluaciones registradas
                  </td>
                </tr>
              ) : (
                paginatedData.map((item: Evaluation) => (
                  <EvaluationRow 
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit} 
                    onDelete={deleteEvaluation}
                    onTogglePago={() => togglePago(item.id)}
                    onToggleTutor={() => toggleTutor(item.id)}
                    onApprove={(id) => console.log("Aprobado:", id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="eval-pagination-wrapper" style={{ marginTop: "20px" }}>
          {totalItems > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </footer>

        {/* Modal actualizado */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>{editingId ? "Editar Evaluación" : "Agregar Evaluación"}</h2>
                <button className="close-x" onClick={closeModal}><X size={20}/></button>
              </div>

              <form onSubmit={handleAddSubmit} className="modal-form">
                <div className="form-group relative">
                  <label>Buscar Estudiante</label>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowStudentSuggestions(true);
                    }}
                    onFocus={() => setShowStudentSuggestions(true)}
                    placeholder="Buscar por carnet o nombre..."
                    required 
                  />
                  {showStudentSuggestions && filteredStudents.length > 0 && (
                    <ul className="suggestions-list">
                      {filteredStudents.map((student: any) => (
                        <li 
                          key={student.id} 
                          onMouseDown={() => handleSelectStudent(student)}
                        >
                          {student.est} - {student.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="form-group">
                  <label>Fecha</label>
                  <input 
                    type="date" 
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Hora</label>
                  <input 
                    type="time" 
                    value={form.hour}
                    onChange={(e) => setForm({...form, hour: e.target.value})}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Evaluación</label>
                  <select 
                    value={form.typeId}
                    onChange={(e) => setForm({...form, typeId: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {types.map((type: any) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Edificio</label>
                    <input 
                      type="text" 
                      value={form.building}
                      onChange={(e) => setForm({...form, building: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Aula</label>
                    <input 
                      type="text" 
                      value={form.classroom}
                      onChange={(e) => setForm({...form, classroom: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tutor Asignado</label>
                  <div className="tutor-input-wrapper">
                    <input 
                      type="text" 
                      value={form.nombre} 
                      readOnly 
                      className="readonly-input" 
                      placeholder="Seleccionar tutor" 
                    />
                    <button 
                      type="button" 
                      className="btn-availability"
                      onClick={() => setShowAvailability(true)}
                    >
                      Ver disponibilidad
                    </button>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn-create">
                    {editingId ? "Guardar Cambios" : "Crear Evaluación"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAvailability && (
          <AvailabilityPicker
            maxSelections={1} 
            onCancel={() => setShowAvailability(false)}
            onSave={(names) => { 
              setForm({ ...form, nombre: names[0] }); 
              setShowAvailability(false); 
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}