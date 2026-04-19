'use client'

import "./teachers-management.css"
import { useState, useMemo, useEffect } from "react"
import Pagination from "../components/pagination"
import SidebarDropDown from "../components/sidebar-drop-down"
import Modal from "../components/modal"
import ModalAddTeacher from "../components/modal-add-teacher"
import UploadTeacherSchedule from "../components/upload-teacher-schedule"
import AutocompleteInput from "../components/autocomplete-input"
import DashboardLayout from "../components/layout"



type Teacher = {
    id: number
    carne: string
    credits: number
    name: string
    careers: Course[]
    academicAreas: AcademicArea[]
    status: "Activo" | "Inactivo"
    evaluations: number
}

type AcademicArea =
    | "Cálculo I"
    | "Cálculo II"
    | "Cálculo III"
    | "Física I"
    | "Física II"
    | "Estadística I"
    | "Estadística II"
    | "Álgebra Lineal"
    | "Matemática Discreta"
    | "Ecuaciones Diferenciales"
    | "Programación I"
    | "Programación II"
    | "Estructura de Datos"
    | "Base de Datos I"
    | "Base de Datos II"
    | "Redes de Computadoras"
    | "Sistemas Operativos"
    | "Ingeniería de Software"
    | "Arquitectura de Computadoras"
    | "Circuitos Eléctricos"
    | "Termodinámica"
    | "Resistencia de Materiales"
    | "Investigación de Operaciones"
    | "Compiladores"
    | "Inteligencia Artificial"
type Course = "Informatica" | "Sistemas" | "Gestión Industrial"


type TeacherDraft = {
    name: string
    carne: string
    credits: number | ""
    careers: Course[]
    academicAreas: AcademicArea[]
    status: "Activo" | "Inactivo"
}

type NewTeacherDraft = {
    carne: string
    fullName: string
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

    const [addModalOpen, setAddModalOpen] = useState(false)
    const [scheduleFile, setScheduleFile] = useState<File | null>(null)

    const [newTeacherCareers, setNewTeacherCareers] = useState<Course[]>([])

    // Array to load the Teachers
    const [teachers, setTeachers] = useState<Teacher[]>([
        {
            id: 1,
            carne: "05324",
            credits: 3,
            name: "Abelardo",
            careers: ["Informatica", "Sistemas"],
            academicAreas: ["Cálculo I", "Física I"],
            status: "Activo",
            evaluations: 12,
        },
        {
            id: 2,
            carne: "50843",
            credits: 4,
            name: "Jorge Escalante",
            careers: ["Sistemas"],
            academicAreas: ["Base de Datos I", "Programación II"],
            status: "Activo",
            evaluations: 15,
        },
        {
            id: 3,
            carne: "94231",
            credits: 5,
            name: "Marlon Estrada",
            careers: ["Informatica"],
            academicAreas: ["Estadística I", "Estadística II", "Matemática Discreta"],
            status: "Inactivo",
            evaluations: 15,
        },
        {
            id: 4,
            carne: "96325",
            credits: 3,
            name: "Karla Hernández",
            careers: ["Informatica"],
            academicAreas: ["Álgebra Lineal", "Ecuaciones Diferenciales"],
            status: "Activo",
            evaluations: 10,
        },
        {
            id: 5,
            carne: "84532",
            credits: 2,
            name: "Luis Martínez",
            careers: ["Informatica"],
            academicAreas: ["Programación I"],
            status: "Activo",
            evaluations: 5,
        },
    ])

    // Holds the temporary data while editing a teacher in the sidebar
    const [draft, setDraft] = useState<TeacherDraft>({
        name: "",
        carne: "",
        credits: "",
        careers: [],
        academicAreas: [],
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

            const matchesDisponibilidad =
                statusFilter === "Todos" || getAptitude(teacher.evaluations) === statusFilter

            return matchesCareer && matchesDisponibilidad
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

    const toggleNewTeacherCareer = (course: Course) => {
        setNewTeacherCareers((prev) =>
            prev.includes(course)
                ? prev.filter((c) => c !== course)
                : [...prev, course]
        )
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
            carne: teacher.carne,
            credits: teacher.credits,
            careers: teacher.careers,
            academicAreas: teacher.academicAreas,
            status: teacher.status,
        })
        setSelectedAcademicAreas(teacher.academicAreas)
        setOpen(true)
    }

    // Clear the draft and close the sidebar
    const closeDrawer = () => {
        setOpen(false)
        setSelectedTeacherId(null)
        setSelectedAcademicAreas([])
        setScheduleFile(null)
        setDraft({
            name: "",
            carne: "",
            credits: "",
            careers: [],
            academicAreas: [],
            status: "Activo",
        })
    }

    // Validates the draft before opening the edit confirmation modal
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

        const editTeacherPayload = {
            id: selectedTeacherId,
            name: draft.name,
            carne: draft.carne,
            careers: draft.careers,
            academicAreas: selectedAcademicAreas,
            status: draft.status,
            scheduleFile: scheduleFile ?? null,
        }

        console.log("Payload edición:", editTeacherPayload)

        setTeachers((prev) =>
            prev.map((teacher) =>
                teacher.id === selectedTeacherId
                    ? {
                        ...teacher,
                        name: draft.name,
                        carne: draft.carne,
                        credits: Number(draft.credits),
                        careers: draft.careers,
                        academicAreas: selectedAcademicAreas,
                        status: draft.status,
                    }
                    : teacher
            )
        )

        setEditModalOpen(false)
        closeDrawer()

        // Restores body scroll after closing both the modal and the sidebar
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

    // Academic areas available to assign when creating a new teacher
    const availableAcademicAreas: AcademicArea[] = [
        "Cálculo I",
        "Cálculo II",
        "Cálculo III",
        "Física I",
        "Física II",
        "Estadística I",
        "Estadística II",
        "Álgebra Lineal",
        "Matemática Discreta",
        "Ecuaciones Diferenciales",
        "Programación I",
        "Programación II",
        "Estructura de Datos",
        "Base de Datos I",
        "Base de Datos II",
        "Redes de Computadoras",
        "Sistemas Operativos",
        "Ingeniería de Software",
        "Arquitectura de Computadoras",
        "Circuitos Eléctricos",
        "Termodinámica",
        "Resistencia de Materiales",
        "Investigación de Operaciones",
        "Compiladores",
        "Inteligencia Artificial",
    ]

    const initialNewTeacherDraft: NewTeacherDraft = {
        carne: "",
        fullName: "",
    }

    const [newTeacherDraft, setNewTeacherDraft] = useState<NewTeacherDraft>(initialNewTeacherDraft)
    const [selectedAcademicAreas, setSelectedAcademicAreas] = useState<AcademicArea[]>([])

    // Resets all add-teacher form state and opens the modal
    const openAddModal = () => {
        setNewTeacherDraft(initialNewTeacherDraft)
        setSelectedAcademicAreas([])
        setScheduleFile(null)
        setAddModalOpen(true)
        setNewTeacherCareers([])
    }

    // Resets all add-teacher form state and closes the modal
    const closeAddModal = () => {
        setAddModalOpen(false)
        setNewTeacherDraft(initialNewTeacherDraft)
        setSelectedAcademicAreas([])
        setScheduleFile(null)
        setNewTeacherCareers([])
    }

    // Adds an academic area tag only if it hasn't been selected yet
    const handleAddAcademicArea = (area: AcademicArea) => {
        setSelectedAcademicAreas((prev) => {
            if (prev.includes(area)) return prev
            return [...prev, area]
        })
    }

    // Removes an academic area tag from the selection
    const handleRemoveAcademicArea = (area: AcademicArea) => {
        setSelectedAcademicAreas((prev) => prev.filter((item) => item !== area))
    }

    // Validates the form, builds the new teacher object and adds it to the list
    // carne, id, credits, careers, aptitude automatically for now
    const handleAddTeacher = (e: React.FormEvent) => {
        e.preventDefault()

        if (!newTeacherDraft.fullName.trim()) return
        if (!newTeacherDraft.carne.trim()) return

        const newTeacherPayload = {
            carne: newTeacherDraft.carne.trim(),
            fullName: newTeacherDraft.fullName.trim(),
            careers: newTeacherCareers,
            academicAreas: selectedAcademicAreas,
            scheduleFile: scheduleFile ?? null,
            // The backend assign: id, credits, evaluations, status, aptitude
        }

        console.log("Payload aggregar:", newTeacherPayload)

        const newTeacher: Teacher = {
            id: Date.now(),             // TEMPORARY: Replace this with the actual ID
            carne: newTeacherDraft.carne.trim(),
            credits: 0,
            name: newTeacherDraft.fullName.trim(),
            careers: newTeacherCareers,
            academicAreas: selectedAcademicAreas,
            status: "Activo",
            evaluations: 0,
        }

        setTeachers((prev) => [newTeacher, ...prev])
        closeAddModal()
    }

    return (
        <>
            <DashboardLayout>
                <div className="container-teachers">
                    {/* <header className="teachers-header">
                        <h1>Maestros</h1>
                        <div className="system-administrator">
                            <h2>Administrador del sistema</h2>
                            <div className="icon">
                                <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                        </div>
                    </header> */}

                    <div className="types-filters-add-teacher">
                        <div className="types-filters">
                            <div className="filter-box">
                                <label htmlFor="career">ESPECIALIDADES</label>     {/* The options to filter the career  */}
                                <select
                                    name="career"
                                    id="career"
                                    value={careerFilter}
                                    onChange={(e) => setCareerFilter(e.target.value)}
                                >
                                    <option value="Todos">Todas las especialidades</option>
                                    <option value="Informatica">Informática</option>
                                    <option value="Sistemas">Sistemas</option>
                                    <option value="Gestión Industrial">Gestión Industrial</option>
                                </select>
                            </div>

                            <div className="filter-box">
                                <label htmlFor="disponibilidad ">DISPONIBILIDAD </label>  {/* The options to filter the state  */}
                                <select
                                    name="disponibilidad "
                                    id="disponibilidad "
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="Todos">Cualquier disponibilidad </option>
                                    <option value="Apto">Apto</option>
                                    <option value="No apto">No apto</option>
                                </select>
                            </div>
                        </div>

                        <div className="add-new-teacher">
                            <button type="button" onClick={openAddModal}>
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M13 14s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002.002zM3.022 13h9.956a.274.274 0 00.014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 00.022.004zm9.974.056v-.002.002zM8 7a2 2 0 100-4 2 2 0 000 4zm3-2a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                Agregar Maestro
                            </button>
                        </div>

                    </div>

                    <div className="table-teachers">
                        <table>
                            <thead>
                                <tr>
                                    <th>Carnet</th>
                                    <th>Nombre</th>
                                    <th>Especialidades</th>
                                    <th>Cursos impartidos</th>
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
                                            <td>{c.carne}</td>

                                            <td className="teacher-name">{c.name}</td>

                                            <td>
                                                <div className="teacher-careers-column">
                                                    {c.careers.length > 0
                                                        ? c.careers.map((career) => (
                                                            <p key={career} className="teacher-career">
                                                                {career}
                                                            </p>
                                                        ))
                                                        : <p className="teacher-no-areas">Sin asignar</p>
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                <div className="teacher-careers-column">
                                                    {c.academicAreas.length > 0
                                                        ? c.academicAreas.map((area) => (
                                                            <p key={area} className="teacher-career">
                                                                {area}
                                                            </p>
                                                        ))
                                                        : <p className="teacher-no-areas">Sin asignar</p>
                                                    }
                                                </div>
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
            </DashboardLayout>

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
                        <label className="sidebar-drop-down-label">Carnet:</label>
                        <div className="input-underline">
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-underline-field"
                                placeholder="Ej: 00001"
                                value={draft.carne}
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
                                        setDraft((prev) => ({ ...prev, carne: value }))
                                    }
                                }}
                            />
                            <span className="input-underline-border"></span>
                        </div>
                    </div>

                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">Curso impartido</label>
                        <AutocompleteInput
                            options={availableAcademicAreas}
                            selected={selectedAcademicAreas}
                            placeholder="Buscar área..."
                            onSelect={(area) => handleAddAcademicArea(area as AcademicArea)}
                            variant="sidebar"
                        />
                    </div>

                    {selectedAcademicAreas.length > 0 && (
                        <div className="sidebar-drop-down-tags">
                            {selectedAcademicAreas.map((area) => (
                                <button
                                    key={area}
                                    type="button"
                                    className="sidebar-drop-down-tag"
                                    onClick={() => handleRemoveAcademicArea(area)}
                                >
                                    {area}
                                    <span className="sidebar-drop-down-tag-close">×</span>
                                </button>
                            ))}
                        </div>
                    )}

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
                        <label className="sidebar-drop-down-label">Subir Horario</label>
                        <UploadTeacherSchedule
                            file={scheduleFile}
                            onFileChange={setScheduleFile}
                        />
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
                        <span className="modal-highlight">{teacherToDelete?.carne}</span>?
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
                        <span className="modal-highlight">{draft.carne}</span>?
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

            <ModalAddTeacher
                open={addModalOpen}
                onClose={closeAddModal}
                title="Crear Nuevo Docente"
                subtitle="Ingresa los datos del docente y adjunta su cronograma de clases."
            >
                <form className="modal-add-teacher-form" onSubmit={handleAddTeacher}>

                    <div className="modal-add-teacher-field">
                        <label className="modal-add-teacher-label">Carnet</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            className="modal-add-teacher-input"
                            placeholder="Ej: 00001"
                            value={newTeacherDraft.carne}
                            required
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
                                    setNewTeacherDraft((prev) => ({ ...prev, carne: value }))
                                }
                            }}
                        />
                        <span className="input-underline-border"></span>
                    </div>

                    <div className="modal-add-teacher-field">
                        <label className="modal-add-teacher-label">Nombre completo</label>
                        <input
                            type="text"
                            className="modal-add-teacher-input"
                            placeholder="Ej: Juan Carlos Ramirez Ochoa"
                            value={newTeacherDraft.fullName}
                            onChange={(e) =>
                                setNewTeacherDraft((prev) => ({
                                    ...prev,
                                    fullName: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div className="modal-add-teacher-field">
                        <label className="modal-add-teacher-label">Curso impartido</label>
                        <AutocompleteInput
                            options={availableAcademicAreas}
                            selected={selectedAcademicAreas}
                            placeholder="Buscar área..."
                            onSelect={(area) => handleAddAcademicArea(area as AcademicArea)}
                            variant="modal"
                        />
                    </div>

                    {selectedAcademicAreas.length > 0 && (
                        <div className="modal-add-teacher-tags">
                            {selectedAcademicAreas.map((area) => (
                                <button
                                    key={area}
                                    type="button"
                                    className="modal-add-teacher-tag"
                                    onClick={() => handleRemoveAcademicArea(area)}
                                >
                                    {area}
                                    <span className="modal-add-teacher-tag-close">×</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="modal-add-teacher-field">
                        <label className="modal-add-teacher-label">Especialidades</label>
                        <div className="modal-add-teacher-checkboxes">
                            {availableCourses.map((course) => (
                                <label key={course} className="modal-add-teacher-course-option">
                                    <input
                                        type="checkbox"
                                        checked={newTeacherCareers.includes(course)}
                                        onChange={() => toggleNewTeacherCareer(course)}
                                    />
                                    {course}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="modal-add-teacher-field">
                        <label className="modal-add-teacher-label">Subir Horario</label>
                        <UploadTeacherSchedule
                            file={scheduleFile}
                            onFileChange={setScheduleFile}
                        />
                    </div>

                    <div className="modal-add-teacher-actions">
                        <button
                            type="button"
                            className="modal-add-teacher-btn modal-add-teacher-btn-ghost"
                            onClick={closeAddModal}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="modal-add-teacher-btn modal-add-teacher-btn-primary"
                        >
                            Guardar docente
                        </button>
                    </div>
                </form>
            </ModalAddTeacher>
        </>
    )

}
