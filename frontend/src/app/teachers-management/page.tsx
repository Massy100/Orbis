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
import Toast from "../components/toast"
import GLOBAL_API_URL from "../services/global-api-url"



type Teacher = {
    id: number
    carne: string
    name: string
    teacherSpecialities: Speciality[]
    courses: Course[]
    status: "Activo" | "Inactivo"
    evaluations: number
}

type Course = {
    id: number
    name: string
}

// type Speciality = "Informatica" | "Sistemas" | "Gestión Industrial"
type Speciality = {
    id: number
    name: string
}


type TeacherDraft = {
    name: string
    carne: string
    teacherSpecialities: Speciality[]
    courses: Course[]
}

type NewTeacherDraft = {
    carne: string
    fullName: string
}

const API_BASE = GLOBAL_API_URL;

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

    const [newTeacherCareers, setNewTeacherCareers] = useState<Speciality[]>([])

    // Array to load the Teachers
    const [teachers, setTeachers] = useState<Teacher[]>([])

    // Academic areas available to assign when creating a new teacher
    const [availableCourses, setAvailableCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourses] = useState<Course[]>([])

    const [isSavingTeacher, setIsSavingTeacher] = useState(false)
    const [isEditingTeacher, setIsEditingTeacher] = useState(false)
    const [isDeletingTeacher, setIsDeletingTeacher] = useState(false)

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "info" as "success" | "error" | "info",
    })

    const showToast = (
        message: string,
        type: "success" | "error" | "info" = "info"
    ) => {
        setToast({ show: true, message, type })

        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }))
        }, 3000)
    }

    const mapTeacher = (teacher: any): Teacher => ({
        id: teacher.id,
        carne: teacher.cat,
        name: teacher.name,
        teacherSpecialities: teacher.specialities ?? [],
        courses: teacher.courses ?? [],
        status: teacher.isactive ? "Activo" : "Inactivo",
        evaluations: teacher.evaluationcount ?? 0,
    })

    const loadTeachers = async () => {
        try {
            const res = await fetch(`${API_BASE}teachers/`)

            if (!res.ok) {
                throw new Error("Error cargando docentes")
            }

            const data = await res.json()
            setTeachers(data.map(mapTeacher))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        loadTeachers()
    }, [])

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await fetch(`${API_BASE}courses/?ordering=name`)

                if (!res.ok) {
                    throw new Error("Error cargando cursos")
                }

                const data = await res.json()

                const courses: Course[] = data.map((course: any) => ({
                    id: course.id,
                    name: course.name,
                }))

                setAvailableCourses(courses)
            } catch (error) {
                console.error(error)
            }
        }

        loadCourses()
    }, [])

    useEffect(() => {
        const loadSpecialities = async () => {
            try {
                const res = await fetch(`${API_BASE}specialities/?ordering=name`)

                if (!res.ok) {
                    throw new Error("Error cargando especialidades")
                }

                const data = await res.json()

                const specialities: Speciality[] = data.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                }))

                setAvailableSpecialities(specialities)
            } catch (error) {
                console.error(error)
            }
        }

        loadSpecialities()
    }, [])

    // Holds the temporary data while editing a teacher in the sidebar
    const [draft, setDraft] = useState<TeacherDraft>({
        name: "",
        carne: "",
        teacherSpecialities: [],
        courses: [],
    })

    // Helper to show the progress bar to evaluations in the Table (column: Evaluaciones TOtales)
    const getProgressWidth = (value: number): string => {
        const percentage = (value / maxEvaluations) * 100
        return `${Math.min(percentage, 100)}%`
    }

    // Helper to show if the Teacher is Apto or No Apto about the evaluations that he/she have
    const getAptitude = (value: number): string => {
        return value >= 15 ? "No apto" : "Apto"
    }

    // Helpers to set the filters, default (Todos and Todos)
    const [careerFilter, setCareerFilter] = useState("Todos")
    const [statusFilter, setStatusFilter] = useState("Todos")

    // When aplicate a filter diferent that Todos and Todos reload the array of teachers 
    // to reload the pages in the table to see the filters aplicated
    const filteredTeachers = useMemo(() => {
        return teachers.filter((teacher) => {
            const matchesCareer =
                careerFilter === "Todos" ||
                teacher.teacherSpecialities.some(
                    (speciality) => speciality.name === careerFilter
                )

            const matchesDisponibilidad =
                statusFilter === "Todos" ||
                getAptitude(teacher.evaluations) === statusFilter

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

    // The specialities that is available to add or remove in the edit sidebar, the max is 3 specialities for teacher
    const [availableSpecialities, setAvailableSpecialities] = useState<Speciality[]>([])

    // Add or remove specialities from the teachers
    const toggleCareer = (speciality: Speciality) => {
        setDraft((prev) => {
            const exists = prev.teacherSpecialities.some(item => item.id === speciality.id)

            if (exists) {
                return {
                    ...prev,
                    teacherSpecialities: prev.teacherSpecialities.filter(
                        item => item.id !== speciality.id
                    ),
                }
            }

            if (prev.teacherSpecialities.length >= 3) return prev

            return {
                ...prev,
                teacherSpecialities: [...prev.teacherSpecialities, speciality],
            }
        })
    }

    const toggleNewTeacherSpeciality = (speciality: Speciality) => {
        setNewTeacherCareers((prev) =>
            prev.some((item) => item.id === speciality.id)
                ? prev.filter((item) => item.id !== speciality.id)
                : [...prev, speciality]
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
        setScheduleFile(null)
        setDraft({
            name: teacher.name,
            carne: teacher.carne,
            teacherSpecialities: teacher.teacherSpecialities,
            courses: teacher.courses,
        })
        setSelectedCourses(teacher.courses)
        setOpen(true)
    }

    // Clear the draft and close the sidebar
    const closeDrawer = () => {
        setOpen(false)
        setSelectedTeacherId(null)
        setSelectedCourses([])
        setScheduleFile(null)
        setDraft({
            name: "",
            carne: "",
            teacherSpecialities: [],
            courses: [],
        })
    }

    // Validates the draft before opening the edit confirmation modal
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedTeacherId === null) return
        setEditModalOpen(true)
    }

    const closeEditModal = () => {
        setEditModalOpen(false)
    }

    // Confirm the teacher edit
    // Runs only after confirmation in the modal
    const handleConfirmEdit = async () => {
        if (selectedTeacherId === null) return

        setIsEditingTeacher(true)

        try {
            const teacherRes = await fetch(`${API_BASE}teachers/${selectedTeacherId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: draft.name,
                    cat: draft.carne,
                }),
            })

            if (!teacherRes.ok) {
                showToast("No se pudo actualizar el docente.", "error")
                return
            }

            const relationsRes = await fetch(
                `${API_BASE}teachers/${selectedTeacherId}/update_relations/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        courses: selectedCourse.map(course => course.id),
                        specialities: draft.teacherSpecialities.map(speciality => speciality.id),
                    }),
                }
            )

            if (!relationsRes.ok) {
                showToast("No se pudieron actualizar los cursos o especialidades.", "error")
                return
            }

            if (scheduleFile) {
                const scheduleUploaded = await uploadTeacherSchedule(draft.carne, {
                    replace: true,
                    teacherId: selectedTeacherId,
                })

                if (!scheduleUploaded) {
                    return
                }
            }

            await loadTeachers()

            setEditModalOpen(false)
            closeDrawer()
            showToast("Docente actualizado correctamente.", "success")
        } catch (error) {
            console.error("Error editando docente:", error)
            showToast("Error conectando con el servidor.", "error")
        } finally {
            setIsEditingTeacher(false)
        }
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
    const handleConfirmDelete = async () => {
        if (!teacherToDelete) return

        setIsDeletingTeacher(true)

        try {
            const res = await fetch(`${API_BASE}teachers/${teacherToDelete.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isactive: false,
                }),
            })

            if (!res.ok) {
                showToast("No se pudo eliminar el docente.", "error")
                return
            }

            await loadTeachers()
            closeDeleteModal()
            showToast("Docente eliminado correctamente.", "success")
        } catch (error) {
            console.error("Error conectando con backend:", error)
            showToast("Error conectando con el servidor.", "error")
        } finally {
            setIsDeletingTeacher(false)
        }
    }

    const initialNewTeacherDraft: NewTeacherDraft = {
        carne: "",
        fullName: "",
    }

    const [newTeacherDraft, setNewTeacherDraft] = useState<NewTeacherDraft>(initialNewTeacherDraft)

    // Resets all add-teacher form state and opens the modal
    const openAddModal = () => {
        setNewTeacherDraft(initialNewTeacherDraft)
        setSelectedCourses([])
        setScheduleFile(null)
        setAddModalOpen(true)
        setNewTeacherCareers([])
    }

    // Resets all add-teacher form state and closes the modal
    const closeAddModal = () => {
        setAddModalOpen(false)
        setNewTeacherDraft(initialNewTeacherDraft)
        setSelectedCourses([])
        setScheduleFile(null)
        setNewTeacherCareers([])
    }

    // Adds an academic area tag only if it hasn't been selected yet
    const handleAddCourse = (course: Course) => {
        setSelectedCourses((prev) => {
            if (prev.some(item => item.id === course.id)) return prev
            return [...prev, course]
        })
    }

    // Removes an academic area tag from the selection
    const handleRemoveCourse = (course: Course) => {
        setSelectedCourses((prev) => prev.filter((item) => item.id !== course.id))
    }

    const uploadTeacherSchedule = async (
        teacherCode: string,
        options?: {
            replace?: boolean
            teacherId?: number
        }
    ) => {
        if (!scheduleFile) return true

        const formData = new FormData()
        formData.append("file", scheduleFile)
        formData.append("teacher_code", teacherCode)
        formData.append("replace", options?.replace ? "true" : "false")

        if (options?.teacherId) {
            formData.append("teacher_id", String(options.teacherId))
        }

        const res = await fetch(`${API_BASE}teacher-schedules/upload/`, {
            method: "POST",
            body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
            showToast(
                data.error || "El docente fue guardado, pero no se pudo cargar el horario.",
                "error"
            )
            return false
        }

        showToast(
            options?.replace
                ? `Horario actualizado correctamente. Los registros fueron actualizados`
                : `Horario cargado correctamente. Los registros fueron creados`,
            "success"
        )

        return true
    }

    // Validates the form, builds the new teacher object and adds it to the list
    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isSavingTeacher) return

        const teacherCode = newTeacherDraft.carne.trim()

        if (!newTeacherDraft.fullName.trim() || !teacherCode) {
            showToast("Faltan campos por completar", "error")
            return
        }

        setIsSavingTeacher(true)

        try {
            const res = await fetch(`${API_BASE}teachers/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newTeacherDraft.fullName.trim(),
                    cat: teacherCode,
                    isactive: true,
                    evaluationcount: 0,
                    career: 1,
                    faculty: 1,
                    courses: selectedCourse.map(c => c.id),
                    specialities: newTeacherCareers.map(s => s.id),
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                console.error(data)
                showToast("No se ha podido crear el docente.", "error")
                return
            }

            if (scheduleFile) {
                const scheduleUploaded = await uploadTeacherSchedule(teacherCode)

                if (!scheduleUploaded) {
                    return
                }
            }

            await loadTeachers()

            closeAddModal()
            showToast("Docente creado correctamente.", "success")
        } catch (error) {
            console.error("Error conectando con backend:", error)
            showToast("Error conectando con el servidor.", "error")
        } finally {
            setIsSavingTeacher(false)
        }
    }

    return (
        <>
            <DashboardLayout>
                <div className="container-teachers">

                    <div className="types-filters-add-teacher">
                        <div className="types-filters">
                            <div className="filter-box">
                                <label htmlFor="career">ESPECIALIDADES</label>
                                <select
                                    name="career"
                                    id="career"
                                    value={careerFilter}
                                    onChange={(e) => setCareerFilter(e.target.value)}
                                >
                                    <option value="Todos">Todas las especialidades</option>
                                    {availableSpecialities.map((speciality) => (
                                        <option key={speciality.id} value={speciality.name}>
                                            {speciality.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-box">
                                <label htmlFor="disponibilidad ">DISPONIBILIDAD </label>
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
                                    <th>Cursos impartidos</th>
                                    <th>Especialidades</th>
                                    <th>Evaluaciones Totales</th>
                                    <th>Apto para Evaluar</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="no-data">
                                            No se encontraron resultados disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTeachers.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.carne}</td>

                                            <td className="teacher-name">{c.name}</td>

                                            <td>
                                                <div className="teacher-careers-column">
                                                    {c.courses.length > 0
                                                        ? c.courses.map((course) => (
                                                            <p key={course.id} className="teacher-career">
                                                                {course.name}
                                                            </p>
                                                        ))
                                                        : <p className="teacher-no-areas">Sin asignar</p>
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                <div className="teacher-careers-column">
                                                    {c.teacherSpecialities.length > 0
                                                        ? c.teacherSpecialities.map((speciality) => (
                                                            <p key={speciality.id} className="teacher-career">
                                                                {speciality.name}
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
                            options={availableCourses.map(course => course.name)}
                            selected={selectedCourse.map(course => course.name)}
                            placeholder="Buscar curso..."
                            onSelect={(courseName) => {
                                const course = availableCourses.find(c => c.name === courseName)
                                if (course) handleAddCourse(course)
                            }}
                            variant="sidebar"
                        />
                    </div>

                    {selectedCourse.length > 0 && (
                        <div className="sidebar-drop-down-tags">
                            {selectedCourse.map((course) => (
                                <button
                                    key={course.id}
                                    type="button"
                                    className="sidebar-drop-down-tag"
                                    onClick={() => handleRemoveCourse(course)}
                                >
                                    {course.name}
                                    <span className="sidebar-drop-down-tag-close">×</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">Especialidades:</label>
                        <div className="input-underline courses-checkboxes">
                            {availableSpecialities.map((speciality) => (
                                <label key={speciality.id} className="modal-add-teacher-course-option">
                                    <input
                                        type="checkbox"
                                        checked={draft.teacherSpecialities.some(item => item.id === speciality.id)}
                                        onChange={() => toggleCareer(speciality)}
                                    />
                                    {speciality.name}
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
                            disabled={isDeletingTeacher}
                        >
                            {isDeletingTeacher ? (
                                <>
                                    <span className="btn-spinner" />
                                    Eliminando...
                                </>
                            ) : (
                                "Eliminar"
                            )}
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
                            disabled={isEditingTeacher}
                        >
                            {isEditingTeacher ? (
                                <>
                                    <span className="btn-spinner" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar"
                            )}
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
                            options={availableCourses.map(course => course.name)}
                            selected={selectedCourse.map(course => course.name)}
                            placeholder="Buscar curso..."
                            onSelect={(courseName) => {
                                const course = availableCourses.find(c => c.name === courseName)
                                if (course) handleAddCourse(course)
                            }}
                            variant="modal"
                        />
                    </div>

                    {selectedCourse.length > 0 && (
                        <div className="modal-add-teacher-tags">
                            {selectedCourse.map((course) => (
                                <button
                                    key={course.id}
                                    type="button"
                                    className="modal-add-teacher-tag"
                                    onClick={() => handleRemoveCourse(course)}
                                >
                                    {course.name}
                                    <span className="modal-add-teacher-tag-close">×</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="modal-add-teacher-field">
                        <label className="modal-add-teacher-label">Especialidades: </label>
                        <div className="modal-add-teacher-checkboxes">
                            {availableSpecialities.map((speciality) => (
                                <label key={speciality.id} className="modal-add-teacher-course-option">
                                    <input
                                        type="checkbox"
                                        checked={newTeacherCareers.some(item => item.id === speciality.id)}
                                        onChange={() => toggleNewTeacherSpeciality(speciality)}
                                    />
                                    {speciality.name}
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
                            disabled={isSavingTeacher}
                        >
                            {isSavingTeacher ? (
                                <>
                                    <span className="btn-spinner" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar docente"
                            )}
                        </button>
                    </div>
                </form>
            </ModalAddTeacher>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />
        </>
    )

}
