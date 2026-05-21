"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/src/app/components/layout";
import AvailabilityPicker from "../../components/AvailabilityPicker";
import Pagination from "../../components/pagination";
import { EvaluationRow } from "../../components/evaluationRow";
import { Evaluation } from "../../types";
import { specialEvaluationService } from "@/src/app/services/specialEvaluationService";
import Toast from "../../components/toast";

import "./special-evaluation.css";
import { Plus, X, Search } from "lucide-react";

export default function EvaluacionEspecialPage() {

  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [cursosBd, setCursosBd] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form, setForm] = useState({ carnet: "", nombre: "", curso: "", tutor: "", tutorId: null as number|null });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isStudentLocked, setIsStudentLocked] = useState(false); 
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
    show: false, message: "", type: "success"
  });

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    const evals = await specialEvaluationService.getAllSpecialEvaluations();
    const courses = await specialEvaluationService.getAllCourses();
    setData(evals);
    setCursosBd(courses);
    if (!silent) setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const totalItems = data.length;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / pageSize);
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [totalItems, page, pageSize]);

  const filteredCursos = useMemo(() => {
    if (!form.curso) return [];
    const sourceList = cursosBd.length > 0 ? cursosBd.map(c => c.name) : ["Cálculo I", "Sistemas Operativos"];
    return sourceList.filter(c => c.toLowerCase().includes(form.curso.toLowerCase()));
  }, [form.curso, cursosBd]);

  const handleSearchCarnet = async () => {
      if (!form.carnet) return;
      const student = await specialEvaluationService.searchStudentByCarnet(form.carnet);
      if (student) {
          setForm(prev => ({ ...prev, nombre: student.name }));
          setIsStudentLocked(true); 
          setToast({ show: true, message: "Estudiante encontrado", type: "success" });
      } else {
          setForm(prev => ({ ...prev, nombre: "" }));
          setIsStudentLocked(false);
          setToast({ show: true, message: "Estudiante nuevo, ingresa el nombre", type: "info" });
      }
  };

  // Si el carnet existe, redirige a la página de evaluación especial para ese estudiante
  const handleApprove = (carnet: string) => {
    if (carnet) {
      router.push(`/evaluation-special/${carnet}`);
    } else {
      setToast({ show: true, message: "Error al intentar crear evaluación.", type: "error" });
    }
  };

  const handleOpenEdit = (item: any) => {
    setForm({
      carnet: item.carnet || "", 
      nombre: item.nombre || "",
      curso: item.curso || "",
      tutor: item.tutor?.nombre || "",
      tutorId: null
    });
    setEditingId(item.id);
    setIsStudentLocked(false);
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await specialEvaluationService.createOrUpdateEvaluation(form, editingId, cursosBd);
      closeModal();
      await loadData(false); 
      setToast({ show: true, message: editingId ? "Actualizado correctamente" : "Registro de tutoría creado", type: "success" });
    } catch (err) {
      setToast({ show: true, message: "Error al guardar (Revisa consola)", type: "error" });
    }
  };

  const deleteEvaluation = async (id: number) => {
      if(confirm("¿Eliminar registro de tutoría?")) {
          setData(prev => prev.filter(item => item.id !== id));
          await specialEvaluationService.deleteEvaluation(id);
      }
  };

  const togglePago = async (id: number, _currentPago: any) => {
      const targetItem = data.find(item => item.id === id);
      if (!targetItem) return;

      const isPaidNow = targetItem.pago === "pagado";
      const willBePaid = !isPaidNow;
      
      setData(prev => prev.map(item => {
        if (item.id === id) {
           const newPagoStr = willBePaid ? "pagado" : "pendiente";
           const newState = (willBePaid && item.tutor.estado === "acordado") ? "Aprobado" : "No aprobado";
           return { ...item, pago: newPagoStr, estado: newState };
        }
        return item;
      }));

      await specialEvaluationService.togglePayment(id, willBePaid);
  };

  const toggleTutor = async (id: number, _currentAcuerdo: any) => {
      const targetItem = data.find(item => item.id === id);
      if (!targetItem) return;

      const isAcordadoNow = targetItem.tutor.estado === "acordado";
      const willBeAcordado = !isAcordadoNow;
      
      setData(prev => prev.map(item => {
        if (item.id === id) {
           const newAcuerdoStr = willBeAcordado ? "acordado" : "no_acuerdo";
           const newState = (willBeAcordado && item.pago === "pagado") ? "Aprobado" : "No aprobado";
           return { ...item, tutor: { ...item.tutor, estado: newAcuerdoStr }, estado: newState };
        }
        return item;
      }));

      await specialEvaluationService.toggleTutorStatus(id, willBeAcordado);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setIsStudentLocked(false);
    setForm({ carnet: "", nombre: "", curso: "", tutor: "", tutorId: null });
  };

  const handleCreateFromRow = (item: any) => {
    setForm({
      carnet: item.carnet || "",
      nombre: item.nombre || "",
      curso: item.curso || "",
      tutor: item.tutor?.nombre || "",
      tutorId: null
    });
    setEditingId(null);
    setIsStudentLocked(true);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (toast.show) {
        const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <DashboardLayout>
      <div className="eval-container">
        <div className="eval-header">
          <button
            className="btn-add"
            onClick={() => {
              setForm({ carnet: "", nombre: "", curso: "", tutor: "", tutorId: null });
              setEditingId(null);
              setIsStudentLocked(false);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} />
            Preparar Evaluación
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
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>Cargando datos...</td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>No hay registros de tutoría</td></tr>
              ) : (
                paginatedData.map((item) => (
                  <EvaluationRow 
                    key={item.id}
                    item={item}
                    onCreate={handleCreateFromRow}
                    onEdit={handleOpenEdit} 
                    onDelete={deleteEvaluation}
                    onTogglePago={togglePago}
                    onToggleTutor={toggleTutor}
                    onApprove={handleApprove}
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

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>{editingId ? "Editar Registro" : "Agregar Registro de Tutoría"}</h2>
                <button className="close-x" onClick={closeModal}><X size={20}/></button>
              </div>

              <form onSubmit={handleAddSubmit} className="modal-form">
                
                <div className="form-group">
                  <label>Carné</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        value={form.carnet} 
                        onChange={(e) => setForm({...form, carnet: e.target.value})} 
                        style={{ flex: 1 }}
                        required 
                      />
                      {!editingId && (
                        <button 
                            type="button" 
                            onClick={handleSearchCarnet} 
                            style={{ 
                                padding: '8px 12px', 
                                backgroundColor: '#f3f4f6', 
                                border: '1px solid #d1d5db', 
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Buscar Estudiante"
                        >
                            <Search size={18} color="#4b5563" />
                        </button>
                      )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input 
                    type="text" 
                    value={form.nombre} 
                    onChange={(e) => setForm({...form, nombre: e.target.value})} 
                    disabled={isStudentLocked}
                    className={isStudentLocked ? "readonly-input" : ""}
                    required 
                  />
                </div>

                <div className="form-group relative">
                  <label>Curso</label>
                  <input 
                    type="text" 
                    value={form.curso} 
                    onChange={(e) => {
                      setForm({ ...form, curso: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Ej. Cálculo..."
                    required 
                  />
                  {showSuggestions && filteredCursos.length > 0 && (
                    <ul className="suggestions-list" style={{ position: 'absolute', zIndex: 10, background: 'white', border: '1px solid #ccc', width: '100%', listStyle: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
                      {filteredCursos.map((cursoNombre) => (
                        <li 
                          key={cursoNombre} 
                          style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setForm({ ...form, curso: cursoNombre });
                            setShowSuggestions(false);
                          }}
                        >
                          {cursoNombre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="form-group">
                  <label>Tutor Asignado</label>
                  <div className="tutor-input-wrapper" style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" value={form.tutor} readOnly className="readonly-input" style={{ flex: 1 }} />
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
                    {editingId ? "Guardar Cambios" : "Guardar Registro"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAvailability && (
          <AvailabilityPicker
            filterOptions={{mode: 'tutorial-tutor'}}
            maxSelections={1}
            onCancel={() => setShowAvailability(false)}
            onSave={(teachers) => {
              if (teachers && teachers.length > 0) {
                 setForm({
                   ...form,
                   tutor: teachers[0].name,
                   tutorId: Number(teachers[0].id) 
                 });
              }
              setShowAvailability(false);
            }}
          />
        )}
      </div>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />
    </DashboardLayout>
  );
}