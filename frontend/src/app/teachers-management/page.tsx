'use client'

import "./teachers-management.css"
import { useState, useMemo, useEffect } from "react"
import Pagination from "../components/pagination"
import SidebarDropDown from "../components/sidebar-drop-down"
import Modal from "../components/modal"




type Course = "Informatica" | "Sistemas" | "Gestión Industrial"

type Teacher = {
    id: number
    cat: string
    credits: number
    name: string
    careers: Course[]
    status: "Activo" | "Inactivo"
    evaluations: number
    aptitude: "Apto" | "No apto"
}

type TeacherDraft = {
    name: string
    cat: string
    credits: number | ""
    careers: Course[]
    status: "Activo" | "Inactivo"
}

export default function Teachers() {

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const maxEvaluations = 15   // The max evaluations 

    const [open, setOpen] = useState(false)
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null)
    const [editModalOpen, setEditModalOpen] = useState(false)

    // Array to load the Teachers
    const [teachers, setTeachers] = useState<Teacher[]>([
        {
            id: 1,
            cat: "T-001",
            credits: 3,
            name: "Abelardo",
            careers: ["Informatica", "Sistemas"],
            status: "Activo",
            evaluations: 12,
            aptitude: "Apto",
        },
        {
            id: 2,
            cat: "T-002",
            credits: 4,
            name: "Jorge Escalante",
            careers: ["Sistemas"],
            status: "Activo",
            evaluations: 15,
            aptitude: "Apto",
        },
        {
            id: 3,
            cat: "T-003",
            credits: 5,
            name: "Marlon Estrada",
            careers: ["Informatica"],
            status: "Inactivo",
            evaluations: 15,
            aptitude: "No apto",
        },
        {
            id: 4,
            cat: "T-004",
            credits: 3,
            name: "Karla Hernández",
            careers: ["Informatica"],
            status: "Activo",
            evaluations: 10,
            aptitude: "Apto",
        },
        {
            id: 5,
            cat: "T-005",
            credits: 2,
            name: "Luis Martínez",
            careers: ["Informatica"],
            status: "Activo",
            evaluations: 5,
            aptitude: "Apto",
        },
        {
            id: 6,
            cat: "T-006",
            credits: 4,
            name: "Sofía Ramírez",
            careers: ["Informatica"],
            status: "Activo",
            evaluations: 14,
            aptitude: "Apto",
        },
        {
            id: 7,
            cat: "T-007",
            credits: 3,
            name: "Daniel Castro",
            careers: ["Informatica"],
            status: "Activo",
            evaluations: 7,
            aptitude: "Apto",
        },
        {
            id: 8,
            cat: "T-008",
            credits: 2,
            name: "Andrea López",
            careers: ["Informatica"],
            status: "Activo",
            evaluations: 3,
            aptitude: "Apto",
        },
        {
            id: 9,
            cat: "T-009",
            credits: 4,
            name: "Carlos Méndez",
            careers: ["Sistemas"],
            status: "Activo",
            evaluations: 11,
            aptitude: "Apto",
        },
        {
            id: 10,
            cat: "T-010",
            credits: 5,
            name: "Fernanda Ruiz",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 9,
            aptitude: "Apto",
        },
        {
            id: 11,
            cat: "T-011",
            credits: 3,
            name: "Miguel Ángel Pineda",
            careers: ["Sistemas"],
            status: "Inactivo",
            evaluations: 6,
            aptitude: "No apto",
        },
        {
            id: 12,
            cat: "T-012",
            credits: 4,
            name: "Paola Gómez",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 13,
            aptitude: "Apto",
        },
        {
            id: 13,
            cat: "T-013",
            credits: 2,
            name: "Ricardo Flores",
            careers: ["Sistemas"],
            status: "Activo",
            evaluations: 4,
            aptitude: "Apto",
        },
        {
            id: 14,
            cat: "T-014",
            credits: 6,
            name: "Valeria Navarro",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 15,
            aptitude: "Apto",
        },
        {
            id: 15,
            cat: "T-015",
            credits: 3,
            name: "Óscar Reyes",
            careers: ["Informatica"],
            status: "Inactivo",
            evaluations: 2,
            aptitude: "No apto",
        },
        {
            id: 16,
            cat: "T-016",
            credits: 4,
            name: "Gabriela Santos",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 12,
            aptitude: "Apto",
        },
        {
            id: 17,
            cat: "T-017",
            credits: 3,
            name: "José Armando Cruz",
            careers: ["Sistemas"],
            status: "Activo",
            evaluations: 8,
            aptitude: "Apto",
        },
        {
            id: 18,
            cat: "T-018",
            credits: 5,
            name: "Natalia Herrera",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 10,
            aptitude: "Apto",
        },
        {
            id: 19,
            cat: "T-019",
            credits: 2,
            name: "Kevin Alvarado",
            careers: ["Sistemas"],
            status: "Inactivo",
            evaluations: 1,
            aptitude: "No apto",
        },
        {
            id: 20,
            cat: "T-020",
            credits: 4,
            name: "Diana Martínez",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 7,
            aptitude: "Apto",
        },
        {
            id: 21,
            cat: "T-021",
            credits: 3,
            name: "Samuel Ortega",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 14,
            aptitude: "Apto",
        },
        {
            id: 22,
            cat: "T-022",
            credits: 2,
            name: "Camila Fuentes",
            careers: ["Sistemas"],
            status: "Activo",
            evaluations: 5,
            aptitude: "Apto",
        },
        {
            id: 23,
            cat: "T-023",
            credits: 3,
            name: "Héctor Zelaya",
            careers: ["Gestión Industrial"],
            status: "Inactivo",
            evaluations: 3,
            aptitude: "No apto",
        },
        {
            id: 24,
            cat: "T-024",
            credits: 5,
            name: "María José Aguilar",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 11,
            aptitude: "Apto",
        },
        {
            id: 25,
            cat: "T-025",
            credits: 4,
            name: "Alejandro Molina",
            careers: ["Informatica"],
            status: "Activo",
            evaluations: 9,
            aptitude: "Apto",
        },
        {
            id: 26,
            cat: "T-026",
            credits: 3,
            name: "Lucía Castillo",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 13,
            aptitude: "Apto",
        },
        {
            id: 27,
            cat: "T-027",
            credits: 2,
            name: "Fernando Mejía",
            careers: ["Sistemas"],
            status: "Inactivo",
            evaluations: 4,
            aptitude: "No apto",
        },
        {
            id: 28,
            cat: "T-028",
            credits: 6,
            name: "Isabella Rosales",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 15,
            aptitude: "Apto",
        },
        {
            id: 29,
            cat: "T-029",
            credits: 3,
            name: "Roberto Espinoza",
            careers: ["Sistemas"],
            status: "Activo",
            evaluations: 6,
            aptitude: "Apto",
        },
        {
            id: 30,
            cat: "T-030",
            credits: 4,
            name: "Elena Vásquez",
            careers: ["Gestión Industrial"],
            status: "Activo",
            evaluations: 12,
            aptitude: "Apto",
        },
    ])

    const [draft, setDraft] = useState<TeacherDraft>({
        name: "",
        cat: "",
        credits: "",
        careers: [],
        status: "Activo",
    })

    // Helper to show the progress bar to evaluations in the Table (column: Evaluaciones TOtales)
    const getProgressWidth = (value: number): string => {
        const percentage = (value / maxEvaluations) * 100
        return `${Math.min(percentage, 100)}%`
    }

    // Helper to show if the Teacher is Apto or No Apto about the evaluations that he/she have
    const getAptitude = (value: number): string => {
        return value === 15 ? "No apto" : "Apto"
    }

    // Helpers to set the filters, default (Todos and Todos)
    const [careerFilter, setCareerFilter] = useState("Todos")
    const [statusFilter, setStatusFilter] = useState("Todos")

    // When aplicate a filter diferent that Todos and Todos reload the array of teachers 
    // to reload the pages in the table to see the filters aplicated
    const filteredTeachers = useMemo(() => {
        return teachers.filter((teacher) => {
            const matchesCareer =
                careerFilter === "Todos" || teacher.careers.includes(careerFilter as Course)

            const matchesStatus =
                statusFilter === "Todos" || teacher.status === statusFilter

            return matchesCareer && matchesStatus
        })
    }, [teachers, careerFilter, statusFilter])

    const totalItems = filteredTeachers.length;

    // Data segmentation for pagination
    // Calculates which records to display based on the current page
    const paginatedTeachers = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredTeachers.slice(start, end);
    }, [filteredTeachers, page, pageSize]);

    const icon_delete = <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M17.004 20L17.003 8h-1-8-1v12H17.004zM13.003 10h2v8h-2V10zM9.003 10h2v8h-2V10zM9.003 4H15.003V6H9.003z"></path><path d="M5.003,20c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2V8h2V6h-3h-1V4c0-1.103-0.897-2-2-2h-6c-1.103,0-2,0.897-2,2v2h-1h-3 v2h2V20z M9.003,4h6v2h-6V4z M8.003,8h8h1l0.001,12H7.003V8H8.003z"></path><path d="M9.003 10H11.003V18H9.003zM13.003 10H15.003V18H13.003z"></path></svg>
    const icon_edit = <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"></path></g></svg>

    // The courses that is available to add or remove in the edit sidebar, the max is 3 courses for teacher
    const availableCourses: Course[] = [
        "Informatica",
        "Sistemas",
        "Gestión Industrial",
    ]

    // Add or remove courses from the teachers
    const toggleCareer = (course: Course) => {
        setDraft((prev) => {
            const exists = prev.careers.includes(course)
            if (exists) {
                return {
                    ...prev,
                    careers: prev.careers.filter((c) => c !== course),
                }
            }
            if (prev.careers.length >= 3) return prev
            return {
                ...prev,
                careers: [...prev.careers, course],
            }
        })
    }

    // When change filters, reload to the first page
    // to avoid empty or out of range pages
    useEffect(() => {
        setPage(1)
    }, [careerFilter, statusFilter])

    // Open the sidebar in edit mode
    // Load the selected teacher's data into the draft
    const handleEdit = (teacher: Teacher) => {
        setSelectedTeacherId(teacher.id)
        setDraft({
            name: teacher.name,
            cat: teacher.cat,
            credits: teacher.credits,
            careers: teacher.careers,
            status: teacher.status,
        })
        setOpen(true)
    }

    // Clear the draft and close the sidebar
    const closeDrawer = () => {
        setOpen(false)
        setSelectedTeacherId(null)
        setDraft({
            name: "",
            cat: "",
            credits: "",
            careers: [],
            status: "Activo",
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedTeacherId === null) return
        if (draft.credits === "" || draft.credits < 0 || draft.credits > 16) return
        setEditModalOpen(true)
    }

    const closeEditModal = () => {
        setEditModalOpen(false)
    }

    // Confirm the teacher edit
    // Runs only after confirmation in the modal
    const handleConfirmEdit = () => {
        if (selectedTeacherId === null) return
        if (draft.credits === "" || draft.credits < 0 || draft.credits > 16) return

        setTeachers((prev) =>
            prev.map((teacher) =>
                teacher.id === selectedTeacherId
                    ? {
                        ...teacher,
                        name: draft.name,
                        cat: draft.cat,
                        credits: Number(draft.credits),
                        careers: draft.careers,
                        status: draft.status,
                    }
                    : teacher
            )
        )

        setEditModalOpen(false)
        closeDrawer()

        requestAnimationFrame(() => {
            document.body.style.overflow = ''
        })
    }

    // Opens a confirmation modal to delete a teacher
    // Temporarily saves the selected teacher
    const handleAskDelete = (teacher: Teacher) => {
        setTeacherToDelete(teacher)
        setDeleteModalOpen(true)
    }

    const closeDeleteModal = () => {
        setDeleteModalOpen(false)
        setTeacherToDelete(null)
    }

    // Permanently removes the teacher from the state
    // Runs after confirming in the modal
    const handleConfirmDelete = () => {
        if (!teacherToDelete) return

        setTeachers((prev) => prev.filter((t) => t.id !== teacherToDelete.id))
        closeDeleteModal()
    }

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
                        <label htmlFor="career">CURSO</label>     {/* The options to filter the career  */}
                        <select
                            name="career"
                            id="career"
                            value={careerFilter}
                            onChange={(e) => setCareerFilter(e.target.value)}
                        >
                            <option value="Todos">Todos los cursos</option>
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
                                <th>Curso</th>
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
                                            <div className="teacher-careers-column">
                                                {c.careers.map((career) => (
                                                    <p key={career} className="teacher-career">
                                                        {career}
                                                    </p>
                                                ))}
                                            </div>
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
                                            <p className={`teacher-aptitude ${getAptitude(c.evaluations) === "Apto" ? "apto" : "not-apto"}`}>
                                                {getAptitude(c.evaluations)}
                                            </p>
                                        </td>
                                        <td>
                                            <div className="teacher-actions">
                                                <button type="button" onClick={() => handleEdit(c)}>
                                                    {icon_edit}
                                                </button>
                                                <button type="button" onClick={() => handleAskDelete(c)}>
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

            <SidebarDropDown
                open={open}
                onClose={closeDrawer}
                title="Editar docente"
                width={420}
            >
                <form className="sidebar-drop-down-form" onSubmit={handleSubmit}>
                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">Nombre:</label>
                        <div className="input-underline">
                            <input
                                type="text"
                                className="input-underline-field"
                                placeholder="Nombre del docente"
                                value={draft.name}
                                onChange={(e) =>
                                    setDraft((prev) => ({ ...prev, name: e.target.value }))
                                }
                                required
                            />
                            <span className="input-underline-border"></span>
                        </div>
                    </div>

                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">Código:</label>
                        <div className="input-underline">
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-underline-field"
                                placeholder="Ej: 00001"
                                value={draft.cat}
                                onKeyDown={(e) => {
                                    if (
                                        ["e", "E", "+", "-", ".", ",", " "].includes(e.key)
                                    ) {
                                        e.preventDefault()
                                    }
                                }}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (/^\d*$/.test(value)) {
                                        setDraft((prev) => ({ ...prev, cat: value }))
                                    }
                                }}
                            />
                            <span className="input-underline-border"></span>
                        </div>
                    </div>

                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">Creditos:</label>
                        <div className="input-underline">
                            <input
                                type="number"
                                min={0}
                                max={16}
                                className="input-underline-field"
                                placeholder="Ej: 3"
                                value={draft.credits}
                                onKeyDown={(e) => {
                                    if (["e", "E", "+", "-"].includes(e.key)) {
                                        e.preventDefault()
                                    }
                                }}
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value === "") {
                                        setDraft((prev) => ({ ...prev, credits: "" }))
                                        return
                                    }
                                    const parsed = Number(value)
                                    if (parsed <= 16) {
                                        setDraft((prev) => ({ ...prev, credits: parsed }))
                                    }
                                }}
                                required
                            />
                            <span className="input-underline-border"></span>
                        </div>
                    </div>

                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">Cursos:</label>
                        <div className="input-underline courses-checkboxes">
                            {availableCourses.map((course) => (
                                <label key={course} className="course-option">
                                    <input
                                        type="checkbox"
                                        checked={draft.careers.includes(course)}
                                        onChange={() => toggleCareer(course)}
                                    />
                                    {course}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">Estado:</label>
                        <div className="input-underline">
                            <select
                                className="input-underline-field"
                                value={draft.status}
                                onChange={(e) =>
                                    setDraft((prev) => ({
                                        ...prev,
                                        status: e.target.value as "Activo" | "Inactivo",
                                    }))
                                }
                            >
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                            <span className="input-underline-border"></span>
                        </div>
                    </div>

                    <div className="sidebar-drop-down-actions">
                        <button
                            type="button"
                            className="sidebar-drop-down-btn sidebar-drop-down-btn-ghost"
                            onClick={closeDrawer}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="sidebar-drop-down-btn sidebar-drop-down-btn-primary"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </SidebarDropDown>

            <Modal
                open={deleteModalOpen}
                onClose={closeDeleteModal}
                title="Eliminar docente"
                width={500}
            >
                <div className="modal-content">
                    <p className="modal-text">
                        ¿Seguro que deseas eliminar al docente{" "}
                        <span className="modal-highlight">{teacherToDelete?.name}</span>{" "}
                        con código{" "}
                        <span className="modal-highlight">{teacherToDelete?.cat}</span>?
                    </p>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="modal-btn modal-btn-ghost"
                            onClick={closeDeleteModal}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="modal-btn modal-btn-danger"
                            onClick={handleConfirmDelete}
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={editModalOpen}
                onClose={closeEditModal}
                title="Guardar cambios"
                width={500}
            >
                <div className="modal-content">
                    <p className="modal-text">
                        ¿Seguro que deseas guardar los cambios del docente{" "}
                        <span className="modal-highlight">{draft.name}</span>{" "}
                        con código{" "}
                        <span className="modal-highlight">{draft.cat}</span>?
                    </p>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="modal-btn modal-btn-ghost"
                            onClick={closeEditModal}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="modal-btn modal-btn-primary"
                            onClick={handleConfirmEdit}
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </Modal>

        </>
    )

}
