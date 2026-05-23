"use client";
import "./result-reports.css";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

import Pagination from "../components/pagination";
import DashboardLayout from "../components/layout";
import Toast from "../components/toast";

import { X } from "lucide-react";
import { fetchResultReports, updateResultCalificacion } from "../services/resultReportService.js";

type Option = "especial" | "comprensiva";

type EvaluadorDetalle = {
    nombre: string;
    area: string;
};

type BaseReport = {
    id: number;
    nombre: string;
    idEstudiante: string;
    est: string;
    fecha: string;
    calificacion: string;
    evaluadores: string[];
    evaluadores_detallados: EvaluadorDetalle[];
    tutores_detallados: EvaluadorDetalle[];
};

type EspecialReport = BaseReport & {
    curso: string;
};

type ComprensivaReport = BaseReport & {
    gruposEstudio: string[];
};

export default function ResultReports() {

    const router = useRouter();

    const handleApproveSpecial = (carnet: string) => {
        router.push(`/evaluation-special/${carnet}`);
    };

    const handleApproveComprehensive = (carnet: string) => {
        router.push(`/evaluation-comprehensive/${carnet}`);
    };

    const [activeOption, setActiveOption] = useState<Option>("especial");
    const [studentQuery, setStudentQuery] = useState("");
    const [courseQuery, setCourseQuery] = useState("");
    const [startMonth, setStartMonth] = useState("");
    const [endMonth, setEndMonth] = useState("");
    const [appliedStartMonth, setAppliedStartMonth] = useState("");
    const [appliedEndMonth, setAppliedEndMonth] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [especialReports, setEspecialReports] = useState<EspecialReport[]>([]);
    const [comprensivaReports, setComprensivaReports] = useState<ComprensivaReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailHtml, setEmailHtml] = useState("");
    const [emailPlain, setEmailPlain] = useState("");

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<BaseReport | null>(null);
    const [selectedCalificacion, setSelectedCalificacion] = useState("");

    const calificacionOptions = ["Aprobado", "No Aprobado", "No se Presento"];

    const hasCalificacion = (calificacion?: string) => {
        return !!calificacion &&
            calificacion.trim() !== "" &&
            calificacion.trim().toLowerCase() !== "sin calificación";
    };

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

    useEffect(() => {
        const loadData = async () => {
            const result = await fetchResultReports();
            if (result.success) {
                setEspecialReports(result.data.especial);
                setComprensivaReports(result.data.comprensiva);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    const formatMonth = (value: string) => {
        if (!value) return "";
        const [year, month] = value.split("-");
        const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        return `${months[Number(month) - 1]} ${year}`;
    };

    const rangeText = startMonth && endMonth ? `${formatMonth(startMonth)} - ${formatMonth(endMonth)}` : "Seleccionar rango";

    const handleApplyFilters = () => {
        setAppliedStartMonth(startMonth);
        setAppliedEndMonth(endMonth);
    };

    const parseDate = (value: string): Date => {
        if (!value || value === "Sin fecha") return new Date();
        const [day, month, year] = value.split("/").map(Number);
        return new Date(year, month - 1, day);
    };

    const formatDateToSpanish = (value: string): string => {
        if (!value || value === "Sin fecha") return value;
        const [day, month, year] = value.split("/");
        const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        return `${Number(day)} de ${months[Number(month) - 1]} ${year}`;
    };

    const getMonthRange = (monthValue: string, isEnd = false) => {
        if (!monthValue) return null;
        const [year, month] = monthValue.split("-").map(Number);
        if (isEnd) return new Date(year, month, 0, 23, 59, 59, 999);
        return new Date(year, month - 1, 1, 0, 0, 0, 0);
    };

    const currentReports = activeOption === "especial" ? especialReports : comprensivaReports;

    const filteredReports = useMemo(() => {
        const normalizedStudentQuery = studentQuery.trim().toLowerCase();
        const normalizedCourseQuery = courseQuery.trim().toLowerCase();
        const startDate = getMonthRange(appliedStartMonth, false);
        const endDate = getMonthRange(appliedEndMonth, true);

        return currentReports.filter((report) => {
            const matchesStudent = normalizedStudentQuery === "" || report.nombre.toLowerCase().includes(normalizedStudentQuery) || report.idEstudiante.includes(normalizedStudentQuery);

            const matchesCourse = activeOption === "especial"
                ? normalizedCourseQuery === "" || (report as EspecialReport).curso.toLowerCase().includes(normalizedCourseQuery)
                : normalizedCourseQuery === "" || (report as ComprensivaReport).gruposEstudio.some((g) => g.toLowerCase().includes(normalizedCourseQuery));

            const reportDate = parseDate(report.fecha);
            const matchesStartDate = !startDate || reportDate >= startDate;
            const matchesEndDate = !endDate || reportDate <= endDate;

            return matchesStudent && matchesCourse && matchesStartDate && matchesEndDate;
        });
    }, [currentReports, studentQuery, courseQuery, appliedStartMonth, appliedEndMonth, activeOption]);

    const totalItems = filteredReports.length;

    const paginatedReports = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredReports.slice(start, end);
    }, [filteredReports, page, pageSize]);

    useEffect(() => { setPage(1); }, [studentQuery, courseQuery, appliedStartMonth, appliedEndMonth]);

    useEffect(() => {
        setPage(1);
        setPageSize(10);
        setStartMonth("");
        setEndMonth("");
        setAppliedStartMonth("");
        setAppliedEndMonth("");
        setStudentQuery("");
        setCourseQuery("");
    }, [activeOption]);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast((prev) => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // ===== LÓGICA DE PLANTILLA DE CORREO DINÁMICA =====
    const openEmailModal = (report: BaseReport) => {
        const fechaEval = formatDateToSpanish(report.fecha);
        const hora = new Date().getHours();
        const saludo = hora < 12 ? "Buenos días" : "Buenas tardes";

        const evaluadores = report.evaluadores_detallados || [];
        const tutores = report.tutores_detallados || [];

        // Rellenamos hasta asegurar los 3 espacios
        const safeEvaluadores = [...evaluadores];
        while (safeEvaluadores.length < 3) safeEvaluadores.push({ nombre: "[Pendiente asignar]", area: "N/A" });

        const safeTutores = [...tutores];
        while (safeTutores.length < 3) safeTutores.push({ nombre: "[Pendiente asignar]", area: "N/A" });

        let tableRows = '';
        let plainTerna = '';
        let plainTutores = '';

        for (let i = 0; i < 3; i++) {
            tableRows += `
            <tr>
                <td style="border: 1px solid #000; padding: 8px;">${safeEvaluadores[i].nombre}</td>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">${safeEvaluadores[i].area}</td>
                <td style="border: 1px solid #000; padding: 8px;">${safeTutores[i].nombre}</td>
                <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">${safeTutores[i].area}</td>
            </tr>`;
            
            plainTerna += `${safeEvaluadores[i].area}: ${safeEvaluadores[i].nombre}\n`;
            plainTutores += `${safeTutores[i].area}: ${safeTutores[i].nombre}\n`;
        }

        if (activeOption === "especial") {
            const espReport = report as EspecialReport;
            setEmailSubject(`Aprobación de terna de Evaluación Especial - ${espReport.nombre}`);

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000;">
                    <p>Estimada Mgtr. Alejandra,</p>
                    <p>${saludo}. Deseo que se encuentre bien.</p>
                    <p>Queremos solicitar amablemente la aprobación de la terna de evaluación de Ingeniería, por favor:</p>
                    
                    <p>
                        <strong>Fecha de la Evaluación:</strong> ${fechaEval}<br/>
                        <strong>Estudiante:</strong> ${espReport.nombre}<br/>
                        <strong>Carné:</strong> ${espReport.est}<br/>
                        <strong>Carrera:</strong> Ingeniería en Sistemas
                    </p>
                    <br/>
                    
                    <table style="border-collapse: collapse; width: 100%; max-width: 800px; text-align: left; margin-bottom: 20px;">
                        <tr>
                            <td colspan="2" style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f2f2f2; text-align: center;">Terna evaluadora</td>
                            <td colspan="2" style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f2f2f2; text-align: center;">Tutores</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Profesional</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Área</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Profesional</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Área</td>
                        </tr>
                        ${tableRows}
                    </table>

                    <p>Agradecidos de antemano por su apoyo, quedamos a la espera de su respuesta.</p>
                    <p>Cordialmente,<br/>Coordinación Académica</p>
                </div>
            `;

            const plainContent = `Estimada Mgtr. Alejandra,\n${saludo}. Deseo que se encuentre bien.\n\nQueremos solicitar amablemente la aprobación de la terna de evaluación de Ingeniería, por favor:\n\nFecha de la Evaluación: ${fechaEval}\nEstudiante: ${report.nombre}\nCarné: ${report.est}\nCarrera: Ingeniería en Sistemas\n\n--- TERNA EVALUADORA ---\n${plainTerna}\n--- TUTORES ---\n${plainTutores}\n\nAgradecidos de antemano por su apoyo, quedamos a la espera de su respuesta.\n\nCordialmente,\nCoordinación Académica`;

            setEmailHtml(htmlContent);
            setEmailPlain(plainContent);

        } else {
            const compReport = report as ComprensivaReport;
            const grupos = compReport.gruposEstudio.join(", ");

            setEmailSubject(`Informe de Evaluación Comprensiva - ${compReport.nombre}`);

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000;">
                    <p>Estimada Mgtr. Alejandra,</p>
                    <p>${saludo}. Deseo que se encuentre bien.</p>
                    <p>Por este medio compartimos los resultados correspondientes a la Evaluación Comprensiva de Ingeniería:</p>
                    
                    <p>
                        <strong>Fecha de la Evaluación:</strong> ${fechaEval}<br/>
                        <strong>Estudiante:</strong> ${compReport.nombre}<br/>
                        <strong>Carné:</strong> ${compReport.est}<br/>
                        <strong>Grupos de Estudio:</strong> ${grupos}<br/>
                        <strong>Resultado Final:</strong> ${compReport.calificacion}
                    </p>
                    <br/>
                    
                    <table style="border-collapse: collapse; width: 100%; max-width: 800px; text-align: left; margin-bottom: 20px;">
                        <tr>
                            <td colspan="2" style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f2f2f2; text-align: center;">Terna evaluadora</td>
                            <td colspan="2" style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f2f2f2; text-align: center;">Tutores</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Profesional</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Área</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Profesional</td>
                            <td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Área</td>
                        </tr>
                        ${tableRows}
                    </table>

                    <p>Agradecidos de antemano por su apoyo y gestión.</p>
                    <p>Cordialmente,<br/>Coordinación Académica</p>
                </div>
            `;

            const plainContent = `Estimada Mgtr. Alejandra,\n${saludo}. Deseo que se encuentre bien.\n\nPor este medio compartimos los resultados correspondientes a la Evaluación Comprensiva de Ingeniería:\n\nFecha de la Evaluación: ${fechaEval}\nEstudiante: ${compReport.nombre}\nCarné: ${compReport.est}\nGrupos de Estudio: ${grupos}\nResultado Final: ${compReport.calificacion}\n\n--- TERNA EVALUADORA ---\n${plainTerna}\n--- TUTORES ---\n${plainTutores}\n\nAgradecidos de antemano por su apoyo y gestión.\n\nCordialmente,\nCoordinación Académica`;

            setEmailHtml(htmlContent);
            setEmailPlain(plainContent);
        }

        setIsModalOpen(true);
    };

    const handleCopyTemplate = async () => {
        try {
            const clipboardItem = new ClipboardItem({
                'text/plain': new Blob([emailPlain], { type: 'text/plain' }),
                'text/html': new Blob([emailHtml], { type: 'text/html' })
            });
            await navigator.clipboard.write([clipboardItem]);
            setToast({ show: true, message: "¡Plantilla copiada! Lista para pegar en el correo.", type: "success" });
            setIsModalOpen(false);
        } catch (err) {
            navigator.clipboard.writeText(emailPlain);
            setToast({ show: true, message: "Plantilla copiada en formato texto.", type: "info" });
            setIsModalOpen(false);
        }
    };

    const openEditModal = (report: BaseReport) => {
        setEditingReport(report);
        setSelectedCalificacion(report.calificacion || "");
        setIsEditModalOpen(true);
    };

    const handleSaveCalificacion = async () => {
        if (!editingReport || !selectedCalificacion) return;

        const result = await updateResultCalificacion(editingReport.id, selectedCalificacion);

        if (!result.success) {
            setToast({
                show: true,
                message: result.errorMessage || "Error al actualizar la calificación",
                type: "error",
            });
            return;
        }

        const updateReports = (reports: any[]) =>
            reports.map((report) =>
                report.id === editingReport.id ? { ...report, calificacion: selectedCalificacion } : report
            );

        setEspecialReports((prev) => updateReports(prev));
        setComprensivaReports((prev) => updateReports(prev));

        setIsEditModalOpen(false);
        setEditingReport(null);
        setSelectedCalificacion("");

        setToast({
            show: true,
            message: "Calificación actualizada correctamente",
            type: "success",
        });
    };

    if (isLoading) return <DashboardLayout><div className="flex h-full items-center justify-center text-gray-500">Cargando reportes...</div></DashboardLayout>;

    return (
        <>
            <DashboardLayout>
                <div className="result-reports-general-content">
                    <div className="options-evaluation">
                        <div className="evaluation-switch">
                            <div className={`switch-thumb ${activeOption === "comprensiva" ? "right" : "left"}`} />
                            <button type="button" className={`switch-option ${activeOption === "especial" ? "active" : ""}`} onClick={() => setActiveOption("especial")}>
                                Evaluación Especial
                            </button>
                            <button type="button" className={`switch-option ${activeOption === "comprensiva" ? "active" : ""}`} onClick={() => setActiveOption("comprensiva")}>
                                Evaluación Comprensiva
                            </button>
                        </div>
                    </div>

                    <div className="filters-searchers">
                        <div className="searcher">
                            <h1>IDENTIDAD ESTUDIANTIL</h1>
                            <div className="input-search-icon">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path></svg>
                                <input type="text" placeholder="Buscar por nombre o ID" value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} />
                            </div>
                        </div>

                        {activeOption === "especial" && (
                            <div className="searcher">
                                <h1>CURSO</h1>
                                <div className="input-search-icon">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0 0 11.6 0l43.6-43.5a8.2 8.2 0 0 0 0-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path></svg>
                                    <input type="text" placeholder="Buscar curso" value={courseQuery} onChange={(e) => setCourseQuery(e.target.value)} />
                                </div>
                            </div>
                        )}

                        <div className="date-section">
                            <div className="searcher">
                                <h1>RANGO DE FECHAS DE EVALUACIÓN</h1>
                                <div className="input-search-icon date-range-box">
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"></path></svg>
                                    <div className="date-range-content">
                                        <p>{rangeText}</p>
                                        <div className="hidden-date-inputs">
                                            <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
                                            <input type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="apply-filters-btn" onClick={handleApplyFilters}>Aplicar filtros</button>
                        </div>
                    </div>

                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre del estudiante</th>
                                    <th>ID Estudiante</th>
                                    <th>{activeOption === "especial" ? "Curso" : "Grupos de estudio"}</th>
                                    <th>Fecha</th>
                                    <th>Calificación</th>
                                    <th>Evaluadores</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedReports.length === 0 && (
                                    <tr><td colSpan={7} className="text-center p-4 text-gray-500 font-semibold">No se encontraron resultados en la base de datos.</td></tr>
                                )}
                                {paginatedReports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="report-name">{report.nombre}</td>
                                        <td className="report-id">{report.est}</td>
                                        <td className="report-course">
                                            {activeOption === "especial" ? (
                                                (report as EspecialReport).curso
                                            ) : (
                                                <div className="report-subject-list">
                                                    {(report as ComprensivaReport).gruposEstudio.map((grupo, index) => (
                                                        <p key={index} className="text-xs">{grupo}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="report-date">{formatDateToSpanish(report.fecha)}</td>
                                        <td>
                                            <p className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${report.calificacion === 'Aprobado' ? 'bg-green-100 text-green-700' :
                                                report.calificacion === 'No Aprobado' ? 'bg-red-100 text-red-700' :
                                                    report.calificacion === 'No se Presento' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {hasCalificacion(report.calificacion) ? report.calificacion : "Sin calificación"}
                                            </p>
                                        </td>
                                        <td>
                                            <div className="evaluadores-list">
                                                {report.evaluadores.length > 0 ? report.evaluadores.map((ev, i) => <p key={i} className="text-xs">{ev}</p>) : <p className="text-xs text-gray-400">Sin evaluadores</p>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                {activeOption === "especial" ? (
                                                    <button className="export-btn" onClick={() => handleApproveSpecial(report.est)}>
                                                        Editar Evaluación
                                                    </button>
                                                ) : (
                                                    <button className="export-btn" onClick={() => handleApproveComprehensive(report.est)}>
                                                        Editar Evaluación
                                                    </button>
                                                )}
                                                <button className="export-btn" onClick={() => openEditModal(report)}>
                                                    Editar Calificacion
                                                </button>
                                                {activeOption === "comprensiva" && (
                                                    <button
                                                        className={`export-btn ${!hasCalificacion(report.calificacion) ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        onClick={() => openEmailModal(report)}
                                                        disabled={!hasCalificacion(report.calificacion)}
                                                        title={!hasCalificacion(report.calificacion) ? "Debe asignar una calificación antes de generar plantilla" : ""}
                                                    >
                                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path>
                                                        </svg>
                                                        Generar Plantilla
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="data-report-result-pagination">
                        {totalItems > 0 && (
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                totalItems={totalItems}
                                onPageChange={(newPage) => {
                                    const totalPages = Math.ceil(totalItems / pageSize) || 1;
                                    if (newPage < 1 || newPage > totalPages) return;
                                    setPage(newPage);
                                }}
                                onPageSizeChange={(size) => {
                                    setPageSize(size > 0 ? size : 10);
                                    setPage(1);
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* ===== MODAL DE PLANTILLA DE CORREO (VISOR HTML) ===== */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">Plantilla de Correo Generada</h3>
                                    <p className="text-xs text-blue-600 font-medium mt-1">Copia esta información para pegarla en Gmail o Outlook conservando la tabla.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-blue-100 rounded-full transition-colors text-blue-800">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body: Visor enriquecido */}
                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Asunto Sugerido</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        readOnly
                                        className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2 text-sm text-gray-800 focus:outline-none"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Vista Previa del Mensaje</label>
                                    <div 
                                        className="w-full border border-gray-300 rounded-lg p-4 bg-white overflow-y-auto"
                                        style={{ maxHeight: '400px' }}
                                        dangerouslySetInnerHTML={{ __html: emailHtml }} 
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleCopyTemplate}
                                    className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
                                    Copiar Plantilla
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== MODAL DE EDICIÓN DE CALIFICACIÓN ===== */}
                {isEditModalOpen && editingReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">Editar Calificación</h3>
                                    <p className="text-xs text-blue-600 font-medium mt-1">Información del estudiante</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-blue-100 rounded-full transition-colors text-blue-800">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Nombre del estudiante</label>
                                    <p className="text-sm font-semibold text-gray-800">{editingReport.nombre}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Carné</label>
                                    <p className="text-sm font-semibold text-gray-800">{editingReport.est}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Calificación</label>
                                    <select
                                        value={selectedCalificacion}
                                        onChange={(e) => setSelectedCalificacion(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Seleccione una calificación</option>
                                        {calificacionOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                                <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveCalificacion}
                                    disabled={!selectedCalificacion}
                                    className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-colors ${selectedCalificacion ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
            </DashboardLayout>
        </>
    );
}