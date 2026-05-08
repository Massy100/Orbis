"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/src/app/components/layout";
import AvailabilityPicker from "../../components/AvailabilityPicker";

import Pagination from "../../components/pagination";
import { EvaluationRow } from "../../components/evaluationRow";
import { useEvaluations } from "../../hooks/useEvaluations";
import { Evaluation } from "../../types";
import { mockData, CURSOS_DISPONIBLES } from "@/src/app/data/special-evaluation-mocks";

import "./special-evaluation.css";
import {Plus, X} from "lucide-react";

export default function EvaluacionEspecialPage() {
  const { 
    data, 
    togglePago, 
    toggleTutor, 
    deleteEvaluation, 
    saveEvaluation 
  } = useEvaluations(mockData);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ carnet: "", nombre: "", curso: "", tutor: "No Seleccionado" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  const totalItems = data.length;

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

  // --------------------- Handlers --------------------------

  const handleOpenEdit = (item: Evaluation) => {
    setForm({
      carnet: item.carnet,
      nombre: item.nombre,
      curso: item.curso,
      tutor: item.tutor.nombre
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveEvaluation({
      carnet: form.carnet,
      nombre: form.nombre,
      curso: form.curso,
      tutor: { nombre: form.tutor, estado: "no_acuerdo" }
    }, editingId);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ carnet: "", nombre: "", curso: "", tutor: "No seleccionado" });
  };

  const filteredCursos = useMemo(() => {
    if (!form.curso) return [];
    return CURSOS_DISPONIBLES.filter(c => 
      c.toLowerCase().includes(form.curso.toLowerCase())
    );
  }, [form.curso]);

  const handleCreateFromRow = (item: Evaluation) => {
    setForm({
      carnet: item.carnet,
      nombre: item.nombre,
      curso: item.curso,
      tutor: item.tutor.nombre
    });

    setEditingId(null); // importante: es nuevo, no edición
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="eval-container">

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
                paginatedData.map((item) => (
                  <EvaluationRow 
                    key={item.id}
                    item={item}
                    onCreate={handleCreateFromRow}
                    onEdit={handleOpenEdit} 
                    onDelete={deleteEvaluation}
                    onTogglePago={togglePago}
                    onToggleTutor={toggleTutor}
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

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>{editingId ? "Editar Estudiante" : "Agregar Estudiante"}</h2>
                <button className="close-x" onClick={closeModal}><X size={20}/></button>
              </div>

              <form onSubmit={handleAddSubmit} className="modal-form">
                <div className="form-group">
                  <label>Carné</label>
                  <input type="text" value={form.carnet} onChange={(e) => setForm({...form, carnet: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required />
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
                    <ul className="suggestions-list">
                      {filteredCursos.map((cursoNombre) => (
                        <li 
                          key={cursoNombre} 
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
                  <div className="tutor-input-wrapper">
                    <input type="text" value={form.tutor} readOnly className="readonly-input" />
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
                    {editingId ? "Guardar Cambios" : "Crear Estudiante"}
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
              setForm({ ...form, tutor: names[0] }); 
              setShowAvailability(false); 
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}