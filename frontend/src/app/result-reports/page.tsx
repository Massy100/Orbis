"use client";
import "./result-reports.css";
import { useState, useMemo, useEffect } from "react";
import Pagination from "../components/pagination";
import DashboardLayout from "../components/layout";




type Option = "especial" | "comprensiva";

// Base type for the reports, containing the common properties for both "especial" and "comprensiva" evaluation types.
type BaseReport = {
    id: number;
    nombre: string;
    idEstudiante: string;
    fecha: string;
    calificacion: "Aprobado" | "No Aprobado" | "No se Presento";
    evaluadores: string[];
};

// Type for the "especial" evaluation report, extending the BaseReport with a specific property for the course name.
type EspecialReport = BaseReport & {
    curso: string;
};

// Type for the "comprensiva" evaluation report, extending the BaseReport with a specific property for the study groups.
type ComprensivaReport = BaseReport & {
    gruposEstudio: string[];
};

export default function ResultReports() {

    const [activeOption, setActiveOption] = useState<Option>("especial");
    const [studentQuery, setStudentQuery] = useState("");
    const [courseQuery, setCourseQuery] = useState("");
    const [startMonth, setStartMonth] = useState("");
    const [endMonth, setEndMonth] = useState("");
    const [appliedStartMonth, setAppliedStartMonth] = useState("");
    const [appliedEndMonth, setAppliedEndMonth] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Function to format the month value from "YYYY-MM" to "Month YYYY" in Spanish
    const formatMonth = (value: string) => {
        if (!value) return "";
        const [year, month] = value.split("-");
        const months = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
        return `${months[Number(month) - 1]} ${year}`;
    };

    // Create a display text for the selected date range (example: enero 2026 - marzo 2026)
    const rangeText =
        startMonth && endMonth
            ? `${formatMonth(startMonth)} - ${formatMonth(endMonth)}`
            : "Seleccionar rango";

    // Function to apply the selected date filters to the reports and update the applied date range state
    const handleApplyFilters = () => {
        setAppliedStartMonth(startMonth);
        setAppliedEndMonth(endMonth);
    };

    // Function to parse a date string in the format "DD/MM/YYYY" into a Date object for comparison purposes when filtering the reports by date range
    const parseDate = (value: string): Date => {
        const [day, month, year] = value.split("/").map(Number);
        return new Date(year, month - 1, day);
    };

    // Function to format a date string from "DD/MM/YYYY" to "D de Month YYYY" in Spanish for display purposes in the table
    const formatDateToSpanish = (value: string): string => {
        const [day, month, year] = value.split("/");
        const months = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ];
        return `${Number(day)} de ${months[Number(month) - 1]} ${year}`;
    };

    // Function to get the start or end date of a month based on a "YYYY-MM" value, used for filtering the reports by date range. If isEnd is true, it returns the last moment of the month; otherwise, it returns the first moment of the month.
    const getMonthRange = (monthValue: string, isEnd = false) => {
        if (!monthValue) return null;

        const [year, month] = monthValue.split("-").map(Number);

        if (isEnd) {
            return new Date(year, month, 0, 23, 59, 59, 999);
        }

        return new Date(year, month - 1, 1, 0, 0, 0, 0);
    };

    // Mocks data for the reports of both evaluation types. 
    // Space to implement the logic to fetch the especialReports from the backend when the activeOption is "especial" and the comprensivaReports when the activeOption is "comprensiva".
    const especialReports: EspecialReport[] = [
        {
            id: 1,
            nombre: "Pedro Perez",
            idEstudiante: "1458745",
            curso: "Calculo I",
            fecha: "14/01/2023",
            calificacion: "Aprobado",
            evaluadores: ["Dr. Aris Thorne", "Profe. Elena Moretti"],
        },
        {
            id: 2,
            nombre: "David Bautista",
            idEstudiante: "1458723",
            curso: "Programacion Avanzada",
            fecha: "12/07/2023",
            calificacion: "No Aprobado",
            evaluadores: ["Profe. David Chen", "Dr. Sara Jenkins"],
        },
        {
            id: 3,
            nombre: "Bruce Castillo",
            idEstudiante: "1458741",
            curso: "Fisica II",
            fecha: "11/10/2023",
            calificacion: "No se Presento",
            evaluadores: ["Dr. Aris Thorne", "Profe. Roberto Smith"],
        },
    ];

    const comprensivaReports: ComprensivaReport[] = [
        {
            id: 1,
            nombre: "Francisco Perez",
            idEstudiante: "1623487",
            gruposEstudio: ["Sistemas: Grupo A", "Informatica: Grupo B", "Gestión: Grupo C"],
            fecha: "14/01/2026",
            calificacion: "Aprobado",
            evaluadores: ["Dr. Aris Thorne", "Profe. Elena Moretti"],
        },
        {
            id: 2,
            nombre: "Marlon Bautista",
            idEstudiante: "8462698",
            gruposEstudio: ["Sistemas: Grupo A", "Informatica: Grupo B", "Gestión: Grupo C"],
            fecha: "12/02/2026",
            calificacion: "No Aprobado",
            evaluadores: ["Profe. David Chen", "Dr. Sara Jenkins"],
        },
        {
            id: 3,
            nombre: "Carolina Castillo",
            idEstudiante: "7845321",
            gruposEstudio: ["Sistemas: Grupo A", "Informatica: Grupo B", "Gestión: Grupo C"],
            fecha: "11/04/2026",
            calificacion: "No se Presento",
            evaluadores: ["Dr. Aris Thorne", "Profe. Roberto Smith"],
        },
    ];

    const currentReports = activeOption === "especial" ? especialReports : comprensivaReports;

    // Memoized value for the filtered reports based on the search queries and selected date range. 
    // It normalizes the student and course queries to lowercase and trims them for more flexible searching. 
    // It also parses the report dates and compares them with the selected date range to filter the reports accordingly.
    const filteredReports = useMemo(() => {
        const normalizedStudentQuery = studentQuery.trim().toLowerCase();
        const normalizedCourseQuery = courseQuery.trim().toLowerCase();

        const startDate = getMonthRange(appliedStartMonth, false);
        const endDate = getMonthRange(appliedEndMonth, true);

        return currentReports.filter((report) => {
            const matchesStudent =
                normalizedStudentQuery === "" ||
                report.nombre.toLowerCase().includes(normalizedStudentQuery) ||
                report.idEstudiante.includes(normalizedStudentQuery);

            // For "especial" option, it checks if the course name includes the course query. 
            // For "comprensiva" option, it checks if any of the study groups include the course query.
            const matchesCourse =
                activeOption === "especial"
                    ? normalizedCourseQuery === "" ||
                    (report as EspecialReport).curso.toLowerCase().includes(normalizedCourseQuery)
                    : normalizedCourseQuery === "" ||
                    (report as ComprensivaReport).gruposEstudio.some((grupo) =>
                        grupo.toLowerCase().includes(normalizedCourseQuery)
                    );

            const reportDate = parseDate(report.fecha);

            const matchesStartDate = !startDate || reportDate >= startDate;
            const matchesEndDate = !endDate || reportDate <= endDate;

            return (
                matchesStudent &&
                matchesCourse &&
                matchesStartDate &&
                matchesEndDate
            );
        });
    }, [currentReports, studentQuery, courseQuery, appliedStartMonth, appliedEndMonth, activeOption]);

    const totalItems = filteredReports.length;

    // Memoized value for the paginated reports based on the current page and page size. 
    // It calculates the start and end indices for slicing the filtered reports array to get only the reports that should be displayed on the current page.
    const paginatedReports = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredReports.slice(start, end);
    }, [filteredReports, page, pageSize]);

    // Whenever the student query, course query, or applied date range changes, it resets the page to 1 to ensure that the user sees the first page of results for the new filters.
    useEffect(() => {
        setPage(1);
    }, [studentQuery, courseQuery, appliedStartMonth, appliedEndMonth]);

    // Whenever the active option changes between "especial" and "comprensiva", it resets all filters, search queries, and pagination to their initial states to provide a clean slate for the user to start filtering the new set of reports.
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

    // Function to handle the export of the document for the selected report.
    const handleExportDocument = () => {
        // Here would implement the logic to export the document for the selected report. For now, we will just log a message to the console.
        console.log("Exportar documento para el reporte seleccionado");
    };

    return (
        <>
            <DashboardLayout>

                <div className="result-reports-general-content">
                    {/* <header className="result-reports-header">
                            <h1>Resultados e informes</h1>
                            <div className="system-administrator">
                                <h2>Administrador del sistema</h2>
                                <div className="icon">
                                    <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                        </header> */}

                    <div className="options-evaluation">
                        <div className="evaluation-switch">
                            <div className={`switch-thumb ${activeOption === "comprensiva" ? "right" : "left"}`} />

                            <button
                                type="button"
                                className={`switch-option ${activeOption === "especial" ? "active" : ""}`}
                                onClick={() => setActiveOption("especial")}
                            >
                                Evaluación Especial
                            </button>

                            <button
                                type="button"
                                className={`switch-option ${activeOption === "comprensiva" ? "active" : ""}`}
                                onClick={() => setActiveOption("comprensiva")}
                            >
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
                                            <input
                                                type="month"
                                                value={startMonth}
                                                onChange={(e) => setStartMonth(e.target.value)}
                                            />
                                            <input
                                                type="month"
                                                value={endMonth}
                                                onChange={(e) => setEndMonth(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="apply-filters-btn" onClick={handleApplyFilters}>
                                Aplicar filtros
                            </button>
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
                                    <tr>
                                        <td colSpan={8} className="no-results">
                                            No se encontraron resultados para los filtros aplicados.
                                        </td>
                                    </tr>
                                )}
                                {paginatedReports.map((report) => (
                                    <tr key={report.id}>
                                        <td className="report-name">{report.nombre}</td>
                                        <td className="report-id">{report.idEstudiante}</td>
                                        <td className="report-course">
                                            {activeOption === "especial" ? (
                                                (report as EspecialReport).curso
                                            ) : (
                                                <div className="report-subject-list">
                                                    {(report as ComprensivaReport).gruposEstudio.map((grupo, index) => (
                                                        <p key={index}>{grupo}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="report-date">{formatDateToSpanish(report.fecha)}</td>
                                        <td>
                                            <p className={`status-badge ${report.calificacion.toLowerCase().replace(/\s+/g, "-")}`}>
                                                {report.calificacion}
                                            </p>
                                        </td>
                                        <td>
                                            <div className="evaluadores-list">
                                                {report.evaluadores.map((evaluador, index) => (
                                                    <p key={index}>{evaluador}</p>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="export-btn" onClick={handleExportDocument}>
                                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M22 20.007a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V19h18V7.3l-8 7.2-10-9V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v16.007zM4.434 5L12 11.81 19.566 5H4.434zM0 15h8v2H0v-2zm0-5h5v2H0v-2z"></path></g></svg>
                                                Enviar correo
                                            </button>
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
                                    const safeSize = size > 0 ? size : 10;
                                    setPageSize(safeSize);
                                    setPage(1);
                                }}
                            />
                        )}
                    </div>

                </div>

            </DashboardLayout>
        </>
    );
}
