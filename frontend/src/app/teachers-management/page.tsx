'use client'

import "./teachers-management.css"
import { useState, useMemo, useEffect } from "react"
import Pagination from "../components/pagination"




type Teacher = {
    id: number
    cat: string
    name: string
    career: string
    status: "Activo" | "Inactivo"
    evaluations: number
    aptitude: "Apto" | "No apto"
}

export default function Teachers() {

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const maxEvaluations = 15   // The max evaluations 

    // Array to load the Teachers
    const teachers: Teacher[] = [
        {
            id: 1,
            cat: "T-001",
            name: "Abelardo",
            career: "Informatica",
            status: "Activo",
            evaluations: 12,
            aptitude: "Apto",
        },
        {
            id: 2,
            cat: "T-002",
            name: "Jorge Escalante",
            career: "Sistemas",
            status: "Activo",
            evaluations: 15,
            aptitude: "Apto",
        },
        {
            id: 3,
            cat: "T-003",
            name: "Marlon Estrada",
            career: "Informatica",
            status: "Inactivo",
            evaluations: 15,
            aptitude: "No apto",
        },
        {
            id: 4,
            cat: "T-004",
            name: "Karla Hernández",
            career: "Informatica",
            status: "Activo",
            evaluations: 10,
            aptitude: "Apto",
        },
        {
            id: 5,
            cat: "T-005",
            name: "Luis Martínez",
            career: "Informatica",
            status: "Activo",
            evaluations: 5,
            aptitude: "Apto",
        },
        {
            id: 6,
            cat: "T-006",
            name: "Sofía Ramírez",
            career: "Informatica",
            status: "Activo",
            evaluations: 14,
            aptitude: "Apto",
        },
        {
            id: 7,
            cat: "T-007",
            name: "Daniel Castro",
            career: "Informatica",
            status: "Activo",
            evaluations: 7,
            aptitude: "Apto",
        },
        {
            id: 8,
            cat: "T-008",
            name: "Andrea López",
            career: "Informatica",
            status: "Activo",
            evaluations: 3,
            aptitude: "Apto",
        },
        {
            id: 9,
            cat: "T-009",
            name: "Carlos Méndez",
            career: "Sistemas",
            status: "Activo",
            evaluations: 11,
            aptitude: "Apto",
        },
        {
            id: 10,
            cat: "T-010",
            name: "Fernanda Ruiz",
            career: "Gestión Industrial",
            status: "Activo",
            evaluations: 9,
            aptitude: "Apto",
        },
        {
            id: 11,
            cat: "T-011",
            name: "Miguel Ángel Pineda",
            career: "Contaduria",
            status: "Inactivo",
            evaluations: 6,
            aptitude: "No apto",
        },
        {
            id: 12,
            cat: "T-012",
            name: "Paola Gómez",
            career: "Gestión Industrial",
            status: "Activo",
            evaluations: 13,
            aptitude: "Apto",
        },
        {
            id: 13,
            cat: "T-013",
            name: "Ricardo Flores",
            career: "Psicologia",
            status: "Activo",
            evaluations: 4,
            aptitude: "Apto",
        },
        {
            id: 14,
            cat: "T-014",
            name: "Valeria Navarro",
            career: "Gestión Industrial",
            status: "Activo",
            evaluations: 15,
            aptitude: "Apto",
        },
        {
            id: 15,
            cat: "T-015",
            name: "Óscar Reyes",
            career: "Informatica",
            status: "Inactivo",
            evaluations: 2,
            aptitude: "No apto",
        },
        {
            id: 16,
            cat: "T-016",
            name: "Gabriela Santos",
            career: "Medicina",
            status: "Activo",
            evaluations: 12,
            aptitude: "Apto",
        },
        {
            id: 17,
            cat: "T-017",
            name: "José Armando Cruz",
            career: "Enfermeria",
            status: "Activo",
            evaluations: 8,
            aptitude: "Apto",
        },
        {
            id: 18,
            cat: "T-018",
            name: "Natalia Herrera",
            career: "Gestión Industrial",
            status: "Activo",
            evaluations: 10,
            aptitude: "Apto",
        },
        {
            id: 19,
            cat: "T-019",
            name: "Kevin Alvarado",
            career: "Sistemas",
            status: "Inactivo",
            evaluations: 1,
            aptitude: "No apto",
        },
        {
            id: 20,
            cat: "T-020",
            name: "Diana Martínez",
            career: "Contaduria",
            status: "Activo",
            evaluations: 7,
            aptitude: "Apto",
        },
        {
            id: 21,
            cat: "T-021",
            name: "Samuel Ortega",
            career: "Administracion",
            status: "Activo",
            evaluations: 14,
            aptitude: "Apto",
        },
        {
            id: 22,
            cat: "T-022",
            name: "Camila Fuentes",
            career: "Derecho",
            status: "Activo",
            evaluations: 5,
            aptitude: "Apto",
        },
        {
            id: 23,
            cat: "T-023",
            name: "Héctor Zelaya",
            career: "Gestión Industrial",
            status: "Inactivo",
            evaluations: 3,
            aptitude: "No apto",
        },
        {
            id: 24,
            cat: "T-024",
            name: "María José Aguilar",
            career: "Arquitectura",
            status: "Activo",
            evaluations: 11,
            aptitude: "Apto",
        },
        {
            id: 25,
            cat: "T-025",
            name: "Alejandro Molina",
            career: "Informatica",
            status: "Activo",
            evaluations: 9,
            aptitude: "Apto",
        },
        {
            id: 26,
            cat: "T-026",
            name: "Lucía Castillo",
            career: "Gestión Industrial",
            status: "Activo",
            evaluations: 13,
            aptitude: "Apto",
        },
        {
            id: 27,
            cat: "T-027",
            name: "Fernando Mejía",
            career: "Enfermeria",
            status: "Inactivo",
            evaluations: 4,
            aptitude: "No apto",
        },
        {
            id: 28,
            cat: "T-028",
            name: "Isabella Rosales",
            career: "Odontologia",
            status: "Activo",
            evaluations: 15,
            aptitude: "Apto",
        },
        {
            id: 29,
            cat: "T-029",
            name: "Roberto Espinoza",
            career: "Sistemas",
            status: "Activo",
            evaluations: 6,
            aptitude: "Apto",
        },
        {
            id: 30,
            cat: "T-030",
            name: "Elena Vásquez",
            career: "Gestión Industrial",
            status: "Activo",
            evaluations: 12,
            aptitude: "Apto",
        },
    ]

    // Helper to show the progress bar to evaluations in the Table (column: Evaluaciones TOtales)
    const getProgressWidth = (value: number): string => {
        const percentage = (value / maxEvaluations) * 100
        return `${Math.min(percentage, 100)}%`
    }

    // Helper to show if the Teacher is Apto or No Apto about the evaluations that he/she have
    const getAptitude = (value: number): string => {
        return value === 15 ? "No apto" : "Apto"
    }

    // Helpers to set the filters, default (Todas and Todos)
    const [careerFilter, setCareerFilter] = useState("Todas")
    const [statusFilter, setStatusFilter] = useState("Todos")

    // When aplicate a filter diferent that Todas and Todos reload the array of teachers 
    // to reload the pages in the table to see the filters aplicated
    const filteredTeachers = useMemo(() => {
        return teachers.filter((teacher) => {
            const matchesCareer =
                careerFilter === "Todas" || teacher.career === careerFilter

            const matchesStatus =
                statusFilter === "Todos" || teacher.status === statusFilter

            return matchesCareer && matchesStatus
        })
    }, [teachers, careerFilter, statusFilter])

    const totalItems = filteredTeachers.length;

    const paginatedTeachers = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredTeachers.slice(start, end);
    }, [filteredTeachers, page, pageSize]);

    const icon_delete = <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M17.004 20L17.003 8h-1-8-1v12H17.004zM13.003 10h2v8h-2V10zM9.003 10h2v8h-2V10zM9.003 4H15.003V6H9.003z"></path><path d="M5.003,20c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2V8h2V6h-3h-1V4c0-1.103-0.897-2-2-2h-6c-1.103,0-2,0.897-2,2v2h-1h-3 v2h2V20z M9.003,4h6v2h-6V4z M8.003,8h8h1l0.001,12H7.003V8H8.003z"></path><path d="M9.003 10H11.003V18H9.003zM13.003 10H15.003V18H13.003z"></path></svg>
    const icon_edit = <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"></path></g></svg>


    // When change filters, reload to the first page
    // to avoid empty or out of range pages
    useEffect(() => {
        setPage(1)
    }, [careerFilter, statusFilter])

    return (
        <>
            <div className="container-teachers">
                <header className="teachers-header">
                    <h1>Maestros</h1>
                    <div className="system-administrator">
                        <h2>Administrador del sistema</h2>
                        <div className="icon">
                            <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                </header>

                <div className="types-filters">
                    <div className="filter-box">
                        <label htmlFor="career">CARRERA</label>     {/* The options to filter the career  */}
                        <select
                            name="career"
                            id="career"
                            value={careerFilter}
                            onChange={(e) => setCareerFilter(e.target.value)}
                        >
                            <option value="Todas">Todas las carreras</option>   
                            <option value="Informatica">Informática</option>
                            <option value="Sistemas">Sistemas</option>
                            <option value="Gestión Industrial">Gestión Industrial</option>
                        </select>
                    </div>

                    <div className="filter-box">
                        <label htmlFor="estado">ESTADO</label>  {/* The options to filter the state  */}
                        <select
                            name="estado"
                            id="estado"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="Todos">Cualquier estado</option>
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                <div className="table-teachers">
                    <table>
                        <thead>
                            <tr>
                                <th>CAT</th>
                                <th>Nombre</th>
                                <th>Carrera</th>
                                <th>Estado</th>
                                <th>Evaluaciones Totales</th>
                                <th>Apto para Evaluar</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="no-data">
                                        No hay resultados para la búsqueda
                                    </td>
                                </tr>
                            ) : (
                                paginatedTeachers.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.cat}</td>

                                        <td className="teacher-name">{c.name}</td>

                                        <td>
                                            <p className="teacher-career">{c.career}</p>
                                        </td>

                                        <td>
                                            <p className={`teacher-status ${c.status === "Activo" ? "active" : "inactive"}`}>
                                                ● {c.status}
                                            </p>
                                        </td>
                                        <td>
                                            <div className="evaluations-cell">
                                                <p className="evaluations-number">{c.evaluations}</p>
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{ width: getProgressWidth(c.evaluations) }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {/* <p className={`teacher-aptitude ${c.aptitude === "Apto" ? "apto" : "not-apto"}`}>
                                                {c.aptitude}
                                            </p> */}
                                            <p className={`teacher-aptitude ${getAptitude(c.evaluations) === "Apto" ? "apto" : "not-apto"}`}>
                                                {getAptitude(c.evaluations)}
                                            </p>
                                        </td>
                                        <td>
                                            <div className="teacher-actions">
                                                <button>
                                                    {icon_edit}
                                                </button>
                                                <button>
                                                    {icon_delete}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
                <footer className="teachers-pagination-footer">
                    {filteredTeachers.length > 0 && (
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
                </footer>
            </div>

        </>
    )

}
