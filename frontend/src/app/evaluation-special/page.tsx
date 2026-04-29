"use client";
import "../styles/evaluations-management.css";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout";
import Toast from "../components/toast";

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

const evaluadoresEspecial: Evaluator[] = [
    {
        id: 1,
        nombre: "Dr. Roberto Santizo",
        curso: "Cálculo II",
        evaluaciones: 14,
        facultad: "Facultad de Ingeniería",
        codigo: "CAT-T-002",
    },
];

export default function EvaluationSpecialPage() {
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({
        show: false,
        message: "",
        type: "success",
    });

    const handleSave = () => {
        setToast({ show: true, message: "Evaluación guardada exitosamente", type: "success" });
    };

    const [studentData, setStudentData] = useState<StudentForm>({
        nombreCompleto: "",
        carnet: "",
    });

    const [scheduleData, setScheduleData] = useState<ScheduleForm>({
        fecha: "",
        horaInicio: "",
        horaFin: "",
        lugar: "Central",
        salon: "",
        pagado: false,
    });

    const [selectedEvaluatorEspecial, setSelectedEvaluatorEspecial] =
        useState<Evaluator | null>(null);

    const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStudentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleScheduleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setScheduleData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectEvaluatorEspecial = (evaluator: Evaluator) => {
        if (evaluator.disabled) return;

        setSelectedEvaluatorEspecial((prev) =>
            prev?.id === evaluator.id ? null : evaluator
        );
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

    const locationDisplay = `${scheduleData.lugar || "Sin lugar"}${scheduleData.salon ? `, Salón ${scheduleData.salon}` : ""
        }`;

    const especialFiltered = evaluadoresEspecial;

    const canSave =
        selectedEvaluatorEspecial !== null &&
        studentData.nombreCompleto.trim() !== "" &&
        studentData.carnet.trim() !== "" &&
        scheduleData.fecha !== "" &&
        scheduleData.horaInicio !== "" &&
        scheduleData.horaFin !== "" &&
        scheduleData.salon.trim() !== "" &&
        scheduleData.lugar.trim() !== "" &&
        scheduleData.pagado;

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);


    return (
        <DashboardLayout>
            <div className="evaluations-page">
                <div className="evaluations-content">
                    <div className="evaluations-main">
                        <section className="evaluations-content-card">
                            <div className="evaluations-section-title">
                                Información del estudiante
                            </div>

                            <div className="evaluations-form-grid evaluations-two-columns">
                                <div className="evaluations-field">
                                    <label>Nombre Completo</label>
                                    <input
                                        name="nombreCompleto"
                                        value={studentData.nombreCompleto}
                                        onChange={handleStudentChange}
                                        placeholder="Ingresa el nombre del estudiante"
                                    />
                                </div>

                                <div className="evaluations-field">
                                    <label>Carné / ID</label>
                                    <input
                                        name="carnet"
                                        value={studentData.carnet}
                                        onChange={handleStudentChange}
                                        placeholder="Ingresa el carné o ID"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="evaluations-content-card">
                            <div className="evaluations-section-title">
                                Programación de evaluación
                            </div>

                            <div className="evaluations-form-grid evaluations-three-columns">
                                <div className="evaluations-field">
                                    <label>Fecha</label>
                                    <input
                                        type="date"
                                        name="fecha"
                                        value={scheduleData.fecha}
                                        onChange={handleScheduleChange}
                                    />
                                </div>

                                <div className="evaluations-field">
                                    <label>Hora Inicio</label>
                                    <input
                                        type="time"
                                        name="horaInicio"
                                        value={scheduleData.horaInicio}
                                        onChange={handleScheduleChange}
                                    />
                                </div>

                                <div className="evaluations-field">
                                    <label>Lugar</label>
                                    <select
                                        name="lugar"
                                        value={scheduleData.lugar}
                                        onChange={handleScheduleChange}
                                    >
                                        <option value="Central">Central</option>
                                        <option value="Extension Hermano Pedro">
                                            Extension Hermano Pedro
                                        </option>
                                    </select>
                                </div>

                                <div className="evaluations-field">
                                    <label>Salón</label>
                                    <input
                                        name="salon"
                                        value={scheduleData.salon}
                                        onChange={handleScheduleChange}
                                        placeholder="Ej. C-205"
                                    />
                                </div>

                                <div className="evaluations-field">
                                    <label>Hora Fin</label>
                                    <input
                                        type="time"
                                        name="horaFin"
                                        value={scheduleData.horaFin}
                                        onChange={handleScheduleChange}
                                    />
                                </div>

                                <div className="evaluations-field">
                                    <label>Estado del Pago</label>

                                    <button
                                        type="button"
                                        className={`payment-switch ${scheduleData.pagado ? "active" : ""}`}
                                        onClick={() =>
                                            setScheduleData((prev) => ({
                                                ...prev,
                                                pagado: !prev.pagado,
                                            }))
                                        }
                                    >
                                        <p className="payment-switch-thumb" />
                                        <p className="payment-switch-text">
                                            {scheduleData.pagado ? "Sí" : "No"}
                                        </p>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="evaluations-content-card">
                            <div className="evaluations-section-header-inline">
                                <div className="evaluations-section-title">
                                    Selección de catedrático
                                </div>

                                <div className="evaluations-search-input">
                                    <button
                                        type="button"
                                        className="evaluations-availability-button"
                                    >
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
                                        {especialFiltered.length > 0 ? (
                                            especialFiltered.map((item) => {
                                                const isSelected =
                                                    selectedEvaluatorEspecial?.id === item.id;

                                                return (
                                                    <tr key={item.id}>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.curso}</td>
                                                        <td>{item.evaluaciones}</td>
                                                        <td className="evaluations-action-cell">
                                                            <div className="approval-check">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    disabled={item.disabled}
                                                                    onChange={() => handleSelectEvaluatorEspecial(item)}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5}>
                                                    <div className="evaluations-empty-state">
                                                        <div className="evaluations-empty-icon"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 100-6 3 3 0 000 6zm-5.784 6A2.238 2.238 0 015 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 005 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd"></path></svg></div>

                                                        <h3>No se encontraron docentes</h3>

                                                        <p>
                                                            Revisar la disponibilidad del catedrático en la sección de "Ver disponibilidad"
                                                        </p>
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
                                        <svg
                                            stroke="currentColor"
                                            fill="currentColor"
                                            strokeWidth="0"
                                            viewBox="0 0 16 16"
                                            height="1em"
                                            width="1em"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M13 14s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002.002zM3.022 13h9.956a.274.274 0 00.014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 00.022.004zm9.974.056v-.002.002zM8 7a2 2 0 100-4 2 2 0 000 4zm3-2a3 3 0 11-6 0 3 3 0 016 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <strong>{studentDisplayName}</strong>
                                        <p>{studentDisplayCarnet}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="evaluations-summary-block">
                                <span className="evaluations-summary-label">
                                    Programación detallada
                                </span>

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
                                <span className="evaluations-summary-label">
                                    Catedrático asignado
                                </span>

                                <div className="evaluations-teacher-card">
                                    <strong>
                                        {selectedEvaluatorEspecial?.nombre ||
                                            "Sin catedrático asignado"}
                                    </strong>
                                    <p>
                                        {selectedEvaluatorEspecial?.facultad ||
                                            "Facultad no especificada"}
                                    </p>
                                    <p>Tipo de Evaluación: {evaluationLabel}</p>

                                    <div className="evaluations-teacher-card-footer">
                                        <span>
                                            Estado:{" "}
                                            {selectedEvaluatorEspecial ? "Asignado" : "Pendiente"}
                                        </span>
                                        <span>
                                            Código: {selectedEvaluatorEspecial?.codigo || "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="evaluations-summary-actions">
                            <button
                                type="submit"
                                className="evaluations-primary-btn"
                                disabled={!canSave}
                                onClick={handleSave}
                            >
                                Guardar Evaluación
                            </button>
                        </div>
                    </aside>
                </div>
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
