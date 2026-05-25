'use client'

import "./students-management.css"
import { useState, useMemo, useEffect } from "react"
import Pagination from "../components/pagination"
import SidebarDropDown from "../components/sidebar-drop-down"
import Modal from "../components/modal"
import DashboardLayout from "../components/layout"
import Toast from "../components/toast"
import { studentService } from "../services/student-service"

type Student = {
    id: number
    carne: string
    name: string
    status: "Activo" | "Inactivo"
}

type StudentDraft = {
    name: string
    carne: string
}

export default function Students() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [students, setStudents] = useState<Student[]>([])

    const [open, setOpen] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null)

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

    const [editModalOpen, setEditModalOpen] = useState(false)
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [statusFilter, setStatusFilter] = useState("Todos")
    const [isSavingStudent, setIsSavingStudent] = useState(false)
    const [isEditingStudent, setIsEditingStudent] = useState(false)
    const [isDeletingStudent, setIsDeletingStudent] = useState(false)

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "info" as "success" | "error" | "info",
    })

    const [draft, setDraft] = useState<StudentDraft>({
        name: "",
        carne: "",
    })

    const initialNewStudentDraft: StudentDraft = {
        name: "",
        carne: ""
    }

    const [newStudentDraft, setNewStudentDraft] = useState<StudentDraft>(initialNewStudentDraft)

    const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
        setToast({ show: true, message, type })
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }))
        }, 3000)
    }

    const mapStudent = (student: any): Student => ({
        id: student.id,
        carne: student.est || student.carne || "Sin carnet",
        name: student.name || "Sin nombre",
        status: student.isactive ? "Activo" : "Inactivo"
    })

    const loadStudents = async () => {
        try {
            const data = await studentService.getStudents()
            setStudents(data.map(mapStudent))
        } catch (error) {
            console.error(error)
            showToast("Error cargando estudiantes", "error")
        }
    }

    useEffect(() => {
        loadStudents()
    }, [])

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesStatus =
                statusFilter === "Todos" ||
                student.status === statusFilter

            const search = searchTerm.toLowerCase().trim()

            const matchesSearch =
                search === "" ||
                student.name.toLowerCase().includes(search) ||
                student.carne.includes(search)

            return matchesStatus && matchesSearch
        })
    }, [students, statusFilter, searchTerm])

    const totalItems = filteredStudents.length

    const paginatedStudents = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredStudents.slice(start, start + pageSize)
    }, [filteredStudents, page, pageSize])

    const handleEdit = (student: Student) => {
        setSelectedStudentId(student.id)
        setDraft({
            name: student.name,
            carne: student.carne
        })
        setOpen(true)
    }

    const closeDrawer = () => {
        setOpen(false)
        setSelectedStudentId(null)
        setDraft({ name: "", carne: "" })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedStudentId === null) return
        setEditModalOpen(true)
    }

    const closeEditModal = () => {
        setEditModalOpen(false)
    }

    const handleConfirmEdit = async () => {
        if (selectedStudentId === null) return
        setIsEditingStudent(true)

        try {
            const res = await studentService.updateStudent(
                selectedStudentId,
                {
                    name: draft.name.trim(),
                    carne: draft.carne.trim()
                }
            )

            if (!res.ok) {
                showToast("No se pudo actualizar el estudiante", "error")
                return
            }

            await loadStudents()
            closeDrawer()
            closeEditModal()
            showToast("Estudiante actualizado correctamente", "success")

        } catch (error) {
            console.error(error)
            showToast("Error conectando con el servidor", "error")
        } finally {
            setIsEditingStudent(false)
        }
    }

    const handleAskDelete = (student: Student) => {
        setStudentToDelete(student)
        setDeleteModalOpen(true)
    }

    const closeDeleteModal = () => {
        setDeleteModalOpen(false)
        setStudentToDelete(null)
    }

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return
        setIsDeletingStudent(true)

        try {
            const res = await studentService.deactivateStudent(studentToDelete.id)

            if (!res.ok) {
                showToast("No se pudo cambiar el estado del estudiante", "error")
                return
            }

            await loadStudents()
            closeDeleteModal()
            showToast("Estado del estudiante modificado", "success")

        } catch (error) {
            console.error(error)
            showToast("Error conectando con el servidor", "error")
        } finally {
            setIsDeletingStudent(false)
        }
    }

    const openAddModal = () => {
        setNewStudentDraft(initialNewStudentDraft)
        setAddModalOpen(true)
    }

    const closeAddModal = () => {
        setAddModalOpen(false)
        setNewStudentDraft(initialNewStudentDraft)
    }

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSavingStudent) return

        const name = newStudentDraft.name.trim()
        const carne = newStudentDraft.carne.trim()

        if (!name || !carne) {
            showToast("Completa todos los campos", "error")
            return
        }

        setIsSavingStudent(true)

        try {
            const res = await studentService.createStudent({ name, carne })

            if (!res.ok) {
                showToast("No se pudo crear el estudiante", "error")
                return
            }

            await loadStudents()
            closeAddModal()
            showToast("Estudiante creado correctamente", "success")

        } catch (error) {
            console.error(error)
            showToast("Error conectando con el servidor", "error")
        } finally {
            setIsSavingStudent(false)
        }
    }

    const icon_delete = <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M17.004 20L17.003 8h-1-8-1v12H17.004zM13.003 10h2v8h-2V10zM9.003 10h2v8h-2V10zM9.003 4H15.003V6H9.003z"></path><path d="M5.003,20c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2V8h2V6h-3h-1V4c0-1.103-0.897-2-2-2h-6c-1.103,0-2,0.897-2,2v2h-1h-3 v2h2V20z M9.003,4h6v2h-6V4z M8.003,8h8h1l0.001,12H7.003V8H8.003z"></path><path d="M9.003 10H11.003V18H9.003zM13.003 10H15.003V18H13.003z"></path></svg>
    const icon_edit = <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"></path></g></svg>

    return (
        <>
            <DashboardLayout>
                <div className="container-students">

                    <div className="types-filters-add-student">
                        <div className="types-filters">
                            <div className="filter-box">
                                <label htmlFor="search">
                                    BUSCAR
                                </label>

                                <input
                                    id="search"
                                    type="text"
                                    placeholder="Nombre o carnet"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-box">
                                <label htmlFor="status">
                                    ESTADO
                                </label>

                                <select
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="Activo">Activos</option>
                                    <option value="Inactivo">Inactivos</option>
                                </select>
                            </div>
                        </div>

                        <div className="add-new-student">
                            <button
                                type="button"
                                onClick={openAddModal}
                            >
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M13 14s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002.002zM3.022 13h9.956a.274.274 0 00.014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 00.022.004zm9.974.056v-.002.002zM8 7a2 2 0 100-4 2 2 0 000 4zm3-2a3 3 0 11-6 0 3 3 0 016 0z" clipRule="evenodd"></path></svg>
                                Agregar Estudiante
                            </button>
                        </div>
                    </div>

                    <div className="table-students">
                        <table>
                            <thead>
                                <tr>
                                    <th>Carnet</th>
                                    <th>Nombre</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paginatedStudents.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="no-data"
                                        >
                                            No hay estudiantes en el sistema.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedStudents.map(student => (
                                        <tr key={student.id}>
                                            <td>{student.carne}</td>
                                            <td className="student-name">{student.name}</td>
                                            <td><span
                                                className={`student-status ${
                                                    student.status === "Activo"
                                                        ? "active"
                                                        : "inactive"
                                                    }`}
                                            >
                                                {student.status}
                                            </span></td>

                                            <td>
                                                <div className="student-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(student)}
                                                    >
                                                        {icon_edit}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleAskDelete(student)}
                                                    >
                                                        {icon_delete}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <footer className="students-pagination-footer">
                        {filteredStudents.length > 0 && (
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                totalItems={totalItems}
                                onPageChange={(newPage) => {
                                    const totalPages =
                                        Math.ceil(totalItems / pageSize) || 1

                                    if (
                                        newPage < 1 ||
                                        newPage > totalPages
                                    ) return

                                    setPage(newPage)
                                }}
                                onPageSizeChange={(size) => {
                                    setPageSize(size > 0 ? size : 10)
                                    setPage(1)
                                }}
                            />
                        )}
                    </footer>
                </div>
            </DashboardLayout>

            {/* EDITAR */}
            <SidebarDropDown
                open={open}
                onClose={closeDrawer}
                title="Editar estudiante"
                width={420}
            >
                <form
                    className="sidebar-drop-down-form"
                    onSubmit={handleSubmit}
                >
                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">
                            Nombre:
                        </label>

                        <div className="input-underline">
                            <input
                                type="text"
                                className="input-underline-field"
                                placeholder="Nombre del estudiante"
                                value={draft.name}
                                onChange={(e) =>
                                    setDraft(prev => ({
                                        ...prev,
                                        name: e.target.value
                                    }))
                                }
                                required
                            />
                            <span className="input-underline-border"></span>
                        </div>
                    </div>

                    <div className="sidebar-drop-down-field">
                        <label className="sidebar-drop-down-label">
                            Carnet:
                        </label>

                        <div className="input-underline">
                            <input
                                type="text"
                                inputMode="numeric"
                                className="input-underline-field"
                                value={draft.carne}
                                required
                                onKeyDown={(e) => {
                                    if (
                                        ["e", "E", "+", "-", ".", ",", " "].includes(e.key)
                                    ) {
                                        e.preventDefault()
                                    }
                                }}
                                onChange={(e) => {
                                    if (/^\d*$/.test(e.target.value)) {
                                        setDraft(prev => ({
                                            ...prev,
                                            carne: e.target.value
                                        }))
                                    }
                                }}
                            />
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

            {/* ELIMINAR/DESACTIVAR */}
            <Modal
                open={deleteModalOpen}
                onClose={closeDeleteModal}
                title={studentToDelete?.status === "Activo" ? "Desactivar estudiante" : "Activar estudiante"}
            >
                <div className="modal-student-form">
                    <p className="modal-text">
                        ¿Estás seguro que deseas {studentToDelete?.status === "Activo" ? "desactivar" : "activar"} al estudiante{" "}
                        <strong>
                            {studentToDelete?.name}
                        </strong>?
                    </p>

                    <div className="modal-student-actions">
                        <button
                            type="button"
                            className="modal-student-btn modal-student-btn-ghost"
                            onClick={closeDeleteModal}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className={`modal-student-btn ${studentToDelete?.status === "Activo" ? "modal-student-btn-danger" : "modal-student-btn-primary"}`}
                            onClick={handleConfirmDelete}
                            disabled={isDeletingStudent}
                        >
                            {isDeletingStudent ? (
                                <>
                                    <span className="btn-spinner" />
                                    Procesando...
                                </>
                            ) : (
                                "Confirmar acción"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>


            {/* CONFIRMAR EDICIÓN */}
            <Modal
                open={editModalOpen}
                onClose={closeEditModal}
                title="Guardar cambios"
            >
                <div className="modal-student-form">
                    <p className="modal-text">
                        ¿Deseas guardar los cambios realizados al estudiante?
                    </p>

                    <div className="modal-student-actions">
                        <button
                            type="button"
                            className="modal-student-btn modal-student-btn-ghost"
                            onClick={closeEditModal}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="modal-student-btn modal-student-btn-primary"
                            onClick={handleConfirmEdit}
                            disabled={isEditingStudent}
                        >
                            {isEditingStudent ? (
                                <>
                                    <span className="btn-spinner" />
                                    Guardando...
                                </>
                            ) : (
                                "Confirmar cambios"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>


            {/* AGREGAR */}
            <Modal
                open={addModalOpen}
                onClose={closeAddModal}
                title="Crear Nuevo Estudiante"
            >
                <form
                    className="modal-student-form"
                    onSubmit={handleAddStudent}
                >
                    <div className="modal-student-field">
                        <label className="modal-student-label">
                            Carnet
                        </label>

                        <input
                            type="text"
                            inputMode="numeric"
                            className="modal-student-input"
                            value={newStudentDraft.carne}
                            required
                            onKeyDown={(e) => {
                                if (
                                    ["e", "E", "+", "-", ".", ",", " "].includes(e.key)
                                ) {
                                    e.preventDefault()
                                }
                            }}
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value)) {
                                    setNewStudentDraft(prev => ({
                                        ...prev,
                                        carne: e.target.value
                                    }))
                                }
                            }}
                        />
                    </div>

                    <div className="modal-student-field">
                        <label className="modal-student-label">
                            Nombre completo
                        </label>

                        <input
                            type="text"
                            className="modal-student-input"
                            value={newStudentDraft.name}
                            onChange={(e) =>
                                setNewStudentDraft(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))
                            }
                            required
                        />
                    </div>

                    <div className="modal-student-actions">
                        <button
                            type="button"
                            className="modal-student-btn modal-student-btn-ghost"
                            onClick={closeAddModal}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="modal-student-btn modal-student-btn-primary"
                            disabled={isSavingStudent}
                        >
                            {isSavingStudent ? (
                                <>
                                    <span className="btn-spinner" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar estudiante"
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast(prev => ({
                        ...prev,
                        show: false
                    }))
                }
            />
        </>
    )
}