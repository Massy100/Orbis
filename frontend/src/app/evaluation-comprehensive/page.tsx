"use client";
import "../styles/evaluations-management.css";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout";
import Toast from "../components/toast";

type AreaType = "informatica" | "sistemas" | "gestion";

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

const evaluadoresComprensiva: Record<AreaType, Evaluator[]> = {
    informatica: [
        {
            id: 1,
            nombre: "Ing. José Ramírez",
            evaluaciones: 6,
            facultad: "Facultad de Ingeniería",
            codigo: "COMP-INF-001",
        },
    ],
    sistemas: [
        {
            id: 6,
            nombre: "Ing. Carlos Pérez",
            evaluaciones: 5,
            facultad: "Facultad de Ingeniería",
            codigo: "COMP-SIS-001",
        },
    ],
    gestion: [
        {
            id: 9,
            nombre: "Lic. Mario Castillo",
            evaluaciones: 4,
            facultad: "Facultad de Ingeniería",
            codigo: "COMP-GES-001",
        },
    ],
};

export default function EvaluationComprehensivePage() {
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
        lugar: "Central",
        salon: "",
        horaFin: "",
        pagado: false,
    });

    const [activeArea, setActiveArea] = useState<AreaType>("informatica");

    const [selectedEvaluatorsComprensiva, setSelectedEvaluatorsComprensiva] =
        useState<Record<AreaType, Evaluator | null>>({
            informatica: null,
            sistemas: null,
            gestion: null,
        });

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

    const handleSelectEvaluatorComprensiva = (
        area: AreaType,
        evaluator: Evaluator
    ) => {
        if (evaluator.disabled) return;

        setSelectedEvaluatorsComprensiva((prev) => ({
            ...prev,
            [area]: prev[area]?.id === evaluator.id ? null : evaluator,
        }));
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

    const comprensivaFiltered = evaluadoresComprensiva[activeArea];

    const allSelectedComprensiva = [
        selectedEvaluatorsComprensiva.informatica,
        selectedEvaluatorsComprensiva.sistemas,
        selectedEvaluatorsComprensiva.gestion,
    ];

    const comprensivaAsignados = allSelectedComprensiva.filter(Boolean).length;

    const canSaveComprensiva =
        comprensivaAsignados === 3 &&
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
                                    Selección de catedráticos
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

                            <div className="evaluations-area-tabs">
                                <button
                                    type="button"
                                    className={`evaluations-tab ${activeArea === "informatica" ? "active" : ""
                                        }`}
                                    onClick={() => setActiveArea("informatica")}
                                >
                                    Informática
                                    {selectedEvaluatorsComprensiva.informatica && (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>)}
                                </button>

                                <button
                                    type="button"
                                    className={`evaluations-tab ${activeArea === "sistemas" ? "active" : ""
                                        }`}
                                    onClick={() => setActiveArea("sistemas")}
                                >
                                    Sistemas
                                    {selectedEvaluatorsComprensiva.sistemas && (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>)}
                                </button>

                                <button
                                    type="button"
                                    className={`evaluations-tab ${activeArea === "gestion" ? "active" : ""
                                        }`}
                                    onClick={() => setActiveArea("gestion")}
                                >
                                    Gestión Industrial
                                    {selectedEvaluatorsComprensiva.gestion && (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>)}
                                </button>
                            </div>

                            <div className="evaluations-teacher-table-wrapper">
                                <table className="evaluations-teacher-table">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Evaluaciones realizadas</th>
                                            <th>Confirmado</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {comprensivaFiltered.length > 0 ? (
                                            comprensivaFiltered.map((item) => {
                                                const isSelected =
                                                    selectedEvaluatorsComprensiva[activeArea]?.id ===
                                                    item.id;

                                                return (
                                                    <tr key={item.id}>
                                                        <td>{item.nombre}</td>
                                                        <td>{item.evaluaciones}</td>
                                                        <td className="evaluations-action-cell">
                                                            <div className="approval-check">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    disabled={item.disabled}
                                                                    onChange={() =>
                                                                        handleSelectEvaluatorComprensiva(activeArea, item)
                                                                    }
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={4}>
                                                    <div className="evaluations-empty-state">
                                                        <div className="evaluations-empty-icon"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 100-6 3 3 0 000 6zm-5.784 6A2.238 2.238 0 015 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 005 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd"></path></svg></div>

                                                        <h3>No se encontro docente</h3>

                                                        <p>
                                                            Revisar la disponibilidad de los catedráticos en la sección de "Ver disponibilidad"
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
                                    Catedráticos asignados
                                </span>

                                <div className="evaluations-assigned-list">
                                    <div className="evaluations-assigned-item">
                                        <span>Informática</span>
                                        <strong>
                                            {selectedEvaluatorsComprensiva.informatica?.nombre ||
                                                "Pendiente"}
                                        </strong>
                                    </div>

                                    <div className="evaluations-assigned-item">
                                        <span>Sistemas</span>
                                        <strong>
                                            {selectedEvaluatorsComprensiva.sistemas?.nombre ||
                                                "Pendiente"}
                                        </strong>
                                    </div>

                                    <div className="evaluations-assigned-item">
                                        <span>Gestión Industrial</span>
                                        <strong>
                                            {selectedEvaluatorsComprensiva.gestion?.nombre ||
                                                "Pendiente"}
                                        </strong>
                                    </div>

                                    <div className="evaluations-teacher-card-footer-dark">
                                        <span>
                                            {comprensivaAsignados === 3
                                                ? "Los 3 evaluadores asignados"
                                                : `Faltan ${3 - comprensivaAsignados} por asignar`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="evaluations-summary-actions">

                            <button
                                type="button"
                                className="evaluations-primary-btn evaluations-full"
                                disabled={!canSaveComprensiva}
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
