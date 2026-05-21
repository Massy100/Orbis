"use client";
import "../../styles/evaluations-management.css";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout";
import Toast from "../../components/toast";
import AvailabilityPicker from "../../components/AvailabilityPicker";
import { availabilityService } from "../../services/availability-service";
import { evaluationService } from "../../services/evaluation-service";
import { teacherService } from "../../services/teacher-service";

interface StudentResponse {
    id: number;
    name: string;
    est: string;
}

interface TeacherResponse {
    id: number;
    name: string;
    evaluationcount?: number;
    faculty_name?: string;
    cat?: string;
}

type Evaluator = {
    id: number;
    nombre: string;
    curso?: string;
    evaluaciones: number;
    disabled?: boolean;
    facultad?: string;
    codigo?: string;
};

type StudentForm = {
    nombreCompleto: string;
    carnet: string;
};

type ScheduleForm = {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    lugar: string;
    salon: string;
    pagado: boolean;
};

export default function EvaluationSpecialPage() {
    const router = useRouter();
    const params = useParams();
    const estudianteCarnet = params?.id as string;

    const [studentId, setStudentId] = useState<number | null>(null);
    const [studygroupId, setStudygroupId] = useState<number | null>(null);
    const [typeId, setTypeId] = useState<number | null>(null);

    const [showAvailability, setShowAvailability] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
        show: false,
        message: "",
        type: "success",
    });

    const [studentData, setStudentData] = useState<StudentForm>({
        nombreCompleto: "Cargando...",
        carnet: "Cargando...",
    });

    const [scheduleData, setScheduleData] = useState<ScheduleForm>({
        fecha: "",
        horaInicio: "",
        horaFin: "",
        lugar: "Central",
        salon: "",
        pagado: false,
    });

    const [selectedEvaluatorEspecial, setSelectedEvaluatorEspecial] = useState<Evaluator | null>(null);

    // --- CARGAR DATOS DESDE LOS SERVICIOS ORIGINALES ---
    useEffect(() => {
        if (!estudianteCarnet) return;

        // Cargar estudiante
        evaluationService.getStudentByEst(estudianteCarnet).then((student) => {
            const typedStudent = student as StudentResponse | null;
            if (!typedStudent) {
                setToast({ show: true, message: "Estudiante no encontrado", type: "error" });
                return;
            }
            setStudentId(typedStudent.id);
            setStudentData({
                nombreCompleto: typedStudent.name ?? "",
                carnet: typedStudent.est ?? estudianteCarnet,
            });
        });

        // Buscar el curso asignado al estudiante en la tutoría
        evaluationService.getCourseFromTutorial(estudianteCarnet).then((courseName) => {
            // Guardamos el curso en el estado del evaluador si es que lo hay, sino lo preparamos
            setSelectedEvaluatorEspecial(prev => prev ? { ...prev, curso: courseName } : null);
            // También lo guardamos en una variable local por si seleccionan al maestro después
            if (typeof window !== "undefined") {
               (window as any).__specialCourseTemp = courseName;
            }
        });

        availabilityService.getStudyGroupIdByEst(estudianteCarnet).then(setStudygroupId);

        evaluationService.findTypeId("especial").then((id) => {
            if (id) setTypeId(id);
        });
    }, [estudianteCarnet]);

    // --- TOAST ---
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // --- Helpers de Horario ---
    const addMinutesToTime = (time: string, minutesToAdd: number) => {
        const [hours, minutes] = time.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes + minutesToAdd, 0, 0);
        return date.toTimeString().slice(0, 5);
    };

    const formatDate = (date: string) => {
        if (!date) return "Sin fecha";
        const parsedDate = new Date(`${date}T00:00:00`);
        if (Number.isNaN(parsedDate.getTime())) return date;
        return parsedDate.toLocaleDateString("es-GT", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatTime = (time: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hourNumber = Number(hours);
        const suffix = hourNumber >= 12 ? "P. M." : "A. M.";
        const normalizedHour = hourNumber % 12 || 12;
        return `${String(normalizedHour).padStart(2, "0")}:${minutes} ${suffix}`;
    };

    // --- Handlers ---
    const handleScheduleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setScheduleData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "horaInicio" && value
                ? { horaFin: addMinutesToTime(value, 80) }
                : {}),
        }));
    };

    const handleSelectEvaluatorEspecial = (evaluator: Evaluator) => {
        if (evaluator.disabled) return;
        setSelectedEvaluatorEspecial((prev) =>
            prev?.id === evaluator.id ? null : evaluator
        );
    };

    // --- GUARDAR EVALUACIÓN FINAL ---
    const handleSave = async () => {
        if (!studentId) return;

        setIsSaving(true);
        try {
            await evaluationService.createEvaluation({
                studentId,
                teacherId: selectedEvaluatorEspecial?.id ?? null,
                typeId: typeId ?? null,
                fecha: scheduleData.fecha || null,
                horaInicio: scheduleData.horaInicio || null,
                horaFin: scheduleData.horaFin || null,
                building: scheduleData.lugar || null,
                classroom: scheduleData.salon || null,
                pagado: scheduleData.pagado,
            });

            if (selectedEvaluatorEspecial) {
                await teacherService.incrementEvaluationCount(
                    selectedEvaluatorEspecial.id,
                    selectedEvaluatorEspecial.evaluaciones
                );
            }

            setToast({ show: true, message: "Evaluación guardada exitosamente", type: "success" });
            
            // Volver a la tabla principal tras 1.5s
            setTimeout(() => router.back(), 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error al guardar la evaluación";
            setToast({ show: true, message, type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    // --- Derived display values ---
    const evaluationLabel = "Evaluación Especial";
    const studentDisplayName = studentData.nombreCompleto || "Sin nombre";
    const studentDisplayCarnet = studentData.carnet || "Sin carné";
    const formattedDate = formatDate(scheduleData.fecha);
    const formattedStartTime = formatTime(scheduleData.horaInicio);
    const formattedEndTime = formatTime(scheduleData.horaFin);

    const scheduleDisplay =
        formattedStartTime && formattedEndTime
            ? `${formattedStartTime} - ${formattedEndTime}`
            : formattedStartTime || "Sin horario";

    const locationDisplay = `${scheduleData.lugar || "Sin lugar"}${scheduleData.salon ? `, Salón ${scheduleData.salon}` : ""}`;

    const evaluadorEspecialSeleccionado: Evaluator | null = selectedEvaluatorEspecial;
    const isSelected = selectedEvaluatorEspecial?.id === evaluadorEspecialSeleccionado?.id;

    const canSave = studentId !== null && studentData.carnet.trim() !== "" && !isSaving;

    return (
        <DashboardLayout>
            <div className="evaluations-page">
                <div className="evaluations-content">
                    <div className="evaluations-main">
                        <div className="evaluations-back-btn">
                            <button className="evaluations-back-btn" onClick={() => router.back()}>
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 11L6.414 11 11.707 5.707 10.293 4.293 2.586 12 10.293 19.707 11.707 18.293 6.414 13 21 13z"></path></svg>
                                Volver
                            </button>
                        </div>

                        <section className="evaluations-content-card">
                            <div className="evaluations-section-title">Información del estudiante</div>
                            <div className="evaluations-form-grid evaluations-two-columns">
                                <div className="evaluations-field">
                                    <label>Nombre Completo</label>
                                    <input name="nombreCompleto" value={studentData.nombreCompleto} readOnly className="bg-gray-50" />
                                </div>
                                <div className="evaluations-field">
                                    <label>Carné</label>
                                    <input name="carnet" value={studentData.carnet} readOnly className="bg-gray-50" />
                                </div>
                            </div>
                        </section>

                        <section className="evaluations-content-card">
                            <div className="evaluations-section-title">Programación de evaluación</div>
                            <div className="evaluations-form-grid evaluations-three-columns">
                                <div className="evaluations-field">
                                    <label>Fecha</label>
                                    <input type="date" name="fecha" value={scheduleData.fecha} onChange={handleScheduleChange} />
                                </div>
                                <div className="evaluations-field">
                                    <label>Hora Inicio</label>
                                    <input type="time" name="horaInicio" value={scheduleData.horaInicio} onChange={handleScheduleChange} />
                                </div>
                                <div className="evaluations-field">
                                    <label>Lugar</label>
                                    <select name="lugar" value={scheduleData.lugar} onChange={handleScheduleChange}>
                                        <option value="Central">Central</option>
                                        <option value="Ext Hermano Pedro">Ext Hermano Pedro</option>
                                    </select>
                                </div>
                                <div className="evaluations-field">
                                    <label>Salón</label>
                                    <input name="salon" value={scheduleData.salon} onChange={handleScheduleChange} placeholder="Ej. C-205" />
                                </div>
                                <div className="evaluations-field">
                                    <label>Hora Fin</label>
                                    <input type="time" name="horaFin" value={scheduleData.horaFin} onChange={handleScheduleChange} />
                                </div>
                                <div className="evaluations-field">
                                    <label>Estado del Pago</label>
                                    <button
                                        type="button"
                                        className={`payment-switch ${scheduleData.pagado ? "active" : ""}`}
                                        onClick={() => setScheduleData((prev) => ({ ...prev, pagado: !prev.pagado }))}
                                    >
                                        <p className="payment-switch-thumb" />
                                        <p className="payment-switch-text">{scheduleData.pagado ? "Sí" : "No"}</p>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="evaluations-content-card">
                            <div className="evaluations-section-header-inline">
                                <div className="evaluations-section-title">Selección de catedrático</div>
                                <div className="evaluations-search-input">
                                    <button type="button" className="evaluations-availability-button" onClick={() => setShowAvailability(true)}>
                                        Ver disponibilidad
                                    </button>
                                </div>
                            </div>
                            <div className="evaluations-teacher-table-wrapper">
                                <table className="evaluations-teacher-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Curso</th>
                                            <th>Evaluaciones</th>
                                            <th>Confirmado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {evaluadorEspecialSeleccionado ? (
                                            <tr>
                                                <td>{evaluadorEspecialSeleccionado.nombre}</td>
                                                <td>{evaluadorEspecialSeleccionado.curso ?? "—"}</td>
                                                <td>E{evaluadorEspecialSeleccionado.evaluaciones}</td>
                                                <td className="evaluations-action-cell">
                                                    <div className="approval-check">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            disabled={evaluadorEspecialSeleccionado.disabled}
                                                            onChange={() => handleSelectEvaluatorEspecial(evaluadorEspecialSeleccionado)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="evaluations-empty-state">
                                                        <div className="evaluations-empty-icon">
                                                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 100-6 3 3 0 000 6zm-5.784 6A2.238 2.238 0 015 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 005 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                        <h3>No se encontraron docentes</h3>
                                                        <p>Revisar la disponibilidad del catedrático en la sección de "Ver disponibilidad"</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <aside className="evaluations-summary">
                        <div className="evaluations-summary-card">
                            <h3>Resumen de Evaluación</h3>
                            <div className="evaluations-summary-block">
                                <span className="evaluations-summary-label">Estudiante</span>
                                <div className="evaluations-student-box">
                                    <div className="evaluations-student-icon">
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M13 14s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002.002zM3.022 13h9.956a.274.274 0 00.014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 00.022.004zm9.974.056v-.002.002zM8 7a2 2 0 100-4 2 2 0 000 4zm3-2a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <strong>{studentDisplayName}</strong>
                                        <p>{studentDisplayCarnet}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="evaluations-summary-block">
                                <span className="evaluations-summary-label">Programación detallada</span>
                                <div className="evaluations-detail-list">
                                    <div className="evaluations-detail-item">
                                        <span>Fecha</span>
                                        <strong>{formattedDate}</strong>
                                    </div>
                                    <div className="evaluations-detail-item">
                                        <span>Horario</span>
                                        <strong>{scheduleDisplay}</strong>
                                    </div>
                                    <div className="evaluations-detail-item">
                                        <span>Ubicación</span>
                                        <strong>{locationDisplay}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="evaluations-summary-block">
                                <span className="evaluations-summary-label">Catedrático asignado</span>
                                <div className="evaluations-teacher-card">
                                    <strong>{selectedEvaluatorEspecial?.nombre ?? "Sin catedrático asignado"}</strong>
                                    <p>{selectedEvaluatorEspecial?.facultad ?? "Facultad no especificada"}</p>
                                    <p>Tipo de Evaluación: {evaluationLabel}</p>
                                    <div className="evaluations-teacher-card-footer">
                                        <span>Estado: {selectedEvaluatorEspecial ? "Asignado" : "Pendiente"}</span>
                                        <span>Código: {selectedEvaluatorEspecial?.codigo ?? "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="evaluations-summary-actions">
                            <button type="submit" className="evaluations-primary-btn" disabled={!canSave} onClick={handleSave}>
                                {isSaving ? "Guardando..." : "Guardar Evaluación"}
                            </button>
                        </div>
                    </aside>
                </div>

                {showAvailability && (
                    <AvailabilityPicker
                        filterOptions={{
                            mode: 'tutorial-evaluator',
                            ...(studygroupId !== null && { studygroupId }),
                        }}
                        maxSelections={1}
                        onCancel={() => setShowAvailability(false)}
                        onSave={async (teachers) => {
                            const selectedTeacher = teachers[0];
                            if (!selectedTeacher) return;

                            setShowAvailability(false);

                            const teacher = (await teacherService.getTeacherByName(selectedTeacher.name)) as TeacherResponse | null;
                            if (teacher) {
                                // Recuperamos el curso que buscamos al inicio
                                const cursoReal = typeof window !== "undefined" ? (window as any).__specialCourseTemp : "Especialización";
                                
                                setSelectedEvaluatorEspecial({
                                    id: teacher.id,
                                    nombre: teacher.name,
                                    curso: cursoReal, // AQUÍ PINTAMOS EL CURSO REAL
                                    evaluaciones: teacher.evaluationcount ?? 0,
                                    facultad: teacher.faculty_name ?? "",
                                    codigo: teacher.cat ?? "",
                                });
                            }
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