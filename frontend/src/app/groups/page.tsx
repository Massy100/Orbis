"use client";

import { useRouter } from "next/navigation";

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Plus, UserCheck, X, Circle, UserPlus, CircleCheckBig, PlusSquare } from 'lucide-react';
import DashboardLayout from '@/src/app/components/layout';
import Pagination from '../components/pagination';
import AvailabilityPicker from '../components/AvailabilityPicker';
import { GroupDetail, SelectedTeacher } from "../types";
import { useGroups } from '../hooks/useGroups';
import { canCreateGroup } from '@/src/lib/groupRules';
import { studentService } from '@/src/app/services/student-service';
import './groups.css';

interface Estudiante {
    id: number;
    carne: string;
    nombre: string;
    pagado: boolean;
}

export default function GroupsPage() {

    const router = useRouter();

    const handleApprove = (carnet: string) => {
        console.log("Carnet enviado:", carnet);
        router.push(`/evaluation-comprehensive/${carnet}`);
    };

    const {
        filter,
        setFilter,
        filteredGroups,
        addGroup,
        getGroupDetail,
        updateGroup,
        deleteGroup
    } = useGroups();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const totalItems = filteredGroups.length;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showAvailability, setShowAvailability] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupDetail | null>(null);

    const [groupName, setGroupName] = useState("");
    const [comprensive, setComprensive] = useState<(SelectedTeacher | null)[]>([
        null,
        null,
        null
    ]);
    const [tutorApprovals, setTutorApprovals] = useState({ sistemas: false, gestion: false, informatica: false });
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

    console.log("filteredGroups:", filteredGroups);

    const buildGroupPayload = () => ({
        group: groupName,

        teachers: [
            {
                teacher: comprensive[0]?.id,
                hasaccepted: tutorApprovals.sistemas
            },
            {
                teacher: comprensive[1]?.id,
                hasaccepted: tutorApprovals.gestion
            },
            {
                teacher: comprensive[2]?.id,
                hasaccepted: tutorApprovals.informatica
            }
        ].filter(t => t.teacher),

        students: estudiantes.map((e) => ({
            name: e.nombre,
            est: e.carne,
            haspayment: e.pagado
        }))
    });

    const paginatedGroups = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return filteredGroups.slice(start, end);
    }, [filteredGroups, page, pageSize]);

    const canCreate = canCreateGroup(groupName, comprensive, estudiantes);

    const handleAddStudent = () => {
        if (estudiantes.length < 6) {
            setEstudiantes([...estudiantes, { id: Date.now(), carne: "", nombre: "", pagado: false }]);
        }
    };

    const handleCreateGroup = async () => {
        if (!canCreate) return;

        try {
            const studentsWithIds = await Promise.all(
                estudiantes.map(async (est) => {
                    const foundStudent = await studentService.findByCarnet(est.carne);

                    if (!foundStudent) {
                        throw new Error(
                            `No se encontró el estudiante con carnet ${est.carne}`
                        );
                    }

                    return {
                        student: foundStudent.id,
                        haspayment: est.pagado
                    };
                })
            );

            const payload = {
                group: groupName,
                teachers: [
                    {
                        teacher: comprensive[0]?.id,
                        hasaccepted: tutorApprovals.sistemas
                    },
                    {
                        teacher: comprensive[1]?.id,
                        hasaccepted: tutorApprovals.gestion
                    },
                    {
                        teacher: comprensive[2]?.id,
                        hasaccepted: tutorApprovals.informatica
                    }
                ].filter(t => t.teacher),
                students: studentsWithIds
            };

            await addGroup(payload);
            closeModal();

        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateGroup = async () => {
        if (!editingGroup) return;

        try {
            const studentsWithIds = await Promise.all(
                estudiantes.map(async (est) => {
                    const foundStudent =
                        await studentService.findByCarnet(est.carne);

                    if (!foundStudent) {
                        throw new Error(
                            `No se encontró el estudiante con carnet ${est.carne}`
                        );
                    }

                    return {
                        student: foundStudent.id,
                        haspayment: est.pagado
                    };
                })
            );

            const payload = {
                group: groupName,
                teachers: [
                    {
                        teacher: comprensive[0]?.id,
                        hasaccepted: tutorApprovals.sistemas
                    },
                    {
                        teacher: comprensive[1]?.id,
                        hasaccepted: tutorApprovals.gestion
                    },
                    {
                        teacher: comprensive[2]?.id,
                        hasaccepted: tutorApprovals.informatica
                    }
                ].filter(t => t.teacher),

                students: studentsWithIds
            };

            await updateGroup(
                editingGroup.id,
                payload
            );

            setIsEditModalOpen(false);
            setEditingGroup(null);
            closeModal();

        } catch (error) {
            console.error(error);
        }
    };

    const handleEditGroup = async (id: number) => {
        const detail = await getGroupDetail(id);

        if (!detail) return;

        console.log("Detail:", detail);

        setEditingGroup(detail);
        setGroupName(detail.group);

        const selectedTeachers: (SelectedTeacher | null)[] = [
            null,
            null,
            null
        ];

        detail.teachers.forEach((teacher: any, index: number) => {
            if (index < 3) {
                selectedTeachers[index] = {
                    id: teacher.id,
                    name: teacher.name
                };
            }
        });

        setComprensive(selectedTeachers);

        setTutorApprovals({
            sistemas: detail.teachers[0]?.hasaccepted || false,
            gestion: detail.teachers[1]?.hasaccepted || false,
            informatica: detail.teachers[2]?.hasaccepted || false
        });

        const formattedStudents = detail.students.map(
            (student: any) => ({
                id: student.id,
                carne: student.est,
                nombre: student.name,
                pagado: student.haspayment
            })
        );

        setEstudiantes(formattedStudents);

        setIsEditModalOpen(true);
    };

    const togglePayment = (id: number) => {
        const updated = estudiantes.map(e =>
            e.id === id ? { ...e, pagado: !e.pagado } : e
        );

        setEstudiantes(updated);

        if (editingGroup) {
            updateGroup(
                editingGroup.id,
                {
                    ...buildGroupPayload(),
                    students: updated.map((e) => ({
                        name: e.nombre,
                        est: e.carne,
                        haspayment: e.pagado
                    }))
                }
            );
        }
    };

    const removeStudent = (id: number) => {
        setEstudiantes(estudiantes.filter(e => e.id !== id));
    };

    const updateStudent = (
        id: number,
        field: "carne" | "nombre",
        value: string
    ) => {
        const updated = estudiantes.map(est =>
            est.id === id
                ? { ...est, [field]: value }
                : est
        );

        setEstudiantes(updated);

        if (editingGroup) {
            updateGroup(
                editingGroup.id,
                {
                    ...buildGroupPayload(),
                    students: updated.map((e) => ({
                        name: e.nombre,
                        est: e.carne,
                        haspayment: e.pagado
                    }))
                }
            );
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setGroupName("");
        
        setComprensive([
            null,
            null,
            null
        ]);

        setEstudiantes([]);
        
        setTutorApprovals({
            sistemas: false,
            gestion: false,
            informatica: false
        });
    };

    const openDeleteModal = (id: number) => {
        setGroupToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteGroup = async () => {
    if (groupToDelete === null) return;

    try {
        await deleteGroup(groupToDelete);

        if (selectedGroup?.id === groupToDelete) {
        setSelectedGroup(null);
        }

        if (editingGroup?.id === groupToDelete) {
        setEditingGroup(null);
        setIsEditModalOpen(false);
        }

        setIsDeleteModalOpen(false);
        setGroupToDelete(null);

    } catch (error) {
        console.error("Error al eliminar grupo:", error);
    }
};

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setGroupToDelete(null);
    };

    return (
        <DashboardLayout>
            <div className="groups-container">

                <div className="groups-controls">
                    <button className="btn-create" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} />
                        <span>Crear Grupo</span>
                    </button>

                    <div className="filters-wrapper">
                        <span>Filtrar por:</span>
                        <select
                            className="filter-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Aprobado">Aprobados</option>
                            <option value="Pendiente">Pendientes</option>
                        </select>
                    </div>
                </div>

                <div className="groups-grid" key={`${filter}-${page}`}>
                    {paginatedGroups.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-svg">
                                <svg
                                    stroke="currentColor"
                                    fill="none"
                                    strokeWidth="0"
                                    viewBox="0 0 24 24"
                                    height="1em"
                                    width="1em"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>

                            <h3>No hay resultados</h3>
                            <p>No encontramos elementos para esta categoría.</p>
                        </div>
                    ) : (
                        paginatedGroups.map((group) => (
                            <div key={group.id} className="group-card">
                                <div className="card-header">
                                    <h3 className="group-name">
                                        {group.group}
                                    </h3>

                                    <div className="card-actions">
                                        <button
                                            className="action-icon btn-edit"
                                            onClick={() => handleEditGroup(group.id)}
                                        >
                                            <Pencil size={20} />
                                        </button>

                                        <button
                                            className="action-icon btn-delete"
                                            onClick={() => openDeleteModal(group.id)}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <span
                                        className={`status-badge ${
                                            group.approvedgroup
                                                ? "status-aprobado"
                                                : "status-pendiente"
                                        }`}
                                    >
                                        {group.approvedgroup
                                            ? "Aprobado"
                                            : "Pendiente"}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <footer className="groups-pagination-footer">
                    {totalItems > 0 && (
                        <Pagination
                            page={page}
                            pageSize={pageSize}
                            totalItems={totalItems}
                            onPageChange={(newPage) => setPage(newPage)}
                            onPageSizeChange={(size) => {
                                setPageSize(size);
                                setPage(1);
                            }}
                        />
                    )}
                </footer>

                {/* MODAL DE CREACION */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-container group-modal-large">
                            <div className="modal-header">
                                <h2>Crear Nuevo Grupo</h2>
                                <button className="close-x" onClick={closeModal}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-form">
                                <div className="tutor-row">
                                    <label>Nombre del Grupo:</label>

                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) =>
                                            setGroupName(
                                                e.target.value
                                            )
                                        }
                                        className="table-input"
                                    />
                                </div>

                                <section className="modal-section">
                                    <div className="section-header">
                                        <h3>Tutores</h3>
                                        <button
                                            type="button"
                                            className="btn-availability"
                                            onClick={() => setShowAvailability(true)}
                                        >
                                            Ver disponibilidad
                                        </button>
                                    </div>

                                    <div className="tutors-list">
                                        {[
                                            { label: "Sistemas", key: "sistemas", idx: 0 },
                                            { label: "Gestión", key: "gestion", idx: 1 },
                                            { label: "Informática", key: "informatica", idx: 2 }
                                        ].map((tutor) => {
                                            const isApproved =
                                                tutorApprovals[tutor.key as keyof typeof tutorApprovals];

                                            return (
                                                <div key={tutor.key} className="tutor-row">
                                                    <label>{tutor.label}:</label>

                                                    <input
                                                        type="text"
                                                        value={comprensive[tutor.idx]?.name || "No Seleccionado"}
                                                        readOnly
                                                        className="input-readonly"
                                                    />

                                                    <button
                                                        className={`icon-btn tutor-status-btn ${isApproved ? "approved" : "pending"
                                                            }`}
                                                        data-title={
                                                            isApproved
                                                                ? "De acuerdo"
                                                                : "Pendiente"
                                                        }
                                                        onClick={() =>
                                                            setTutorApprovals({
                                                                ...tutorApprovals,
                                                                [tutor.key]: !isApproved
                                                            })
                                                        }
                                                    >
                                                        {isApproved ? (
                                                            <UserCheck size={18} color="green" />
                                                        ) : (
                                                            <X size={18} color="red" />
                                                        )}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section className="modal-section">
                                    <div className="section-header">
                                        <h3>Estudiantes ({estudiantes.length}/6)</h3>

                                        <button
                                            className="btn-add-student"
                                            onClick={handleAddStudent}
                                            disabled={estudiantes.length >= 6}
                                        >
                                            <UserPlus size={16} />
                                            Agregar
                                        </button>
                                    </div>

                                    <div className="students-table-wrapper">
                                        <table className="students-modal-table">
                                            <thead>
                                                <tr>
                                                    <th>CARNÉ</th>
                                                    <th>NOMBRE</th>
                                                    <th style={{ textAlign: "center" }}>ACCIONES</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {estudiantes.map((est) => (
                                                    <tr key={est.id}>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={est.carne}
                                                                onChange={(e) =>
                                                                    updateStudent(est.id, "carne", e.target.value)
                                                                }
                                                                className="table-input"
                                                            />
                                                        </td>

                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={est.nombre}
                                                                onChange={(e) =>
                                                                    updateStudent(est.id, "nombre", e.target.value)
                                                                }
                                                                className="table-input"
                                                            />
                                                        </td>

                                                        <td
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                gap: "8px"
                                                            }}
                                                        >
                                                            <button
                                                                className="icon-btn"
                                                                data-title="Eliminar estudiante"
                                                                onClick={() => removeStudent(est.id)}
                                                                style={{ color: "#ef4444" }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>

                                                            <button
                                                                className={`icon-btn payment-status-btn ${est.pagado ? "paid" : "pending"
                                                                    }`}
                                                                data-title={
                                                                    est.pagado
                                                                        ? "Pagado"
                                                                        : "Pendiente"
                                                                }
                                                                onClick={() => togglePayment(est.id)}
                                                            >
                                                                {est.pagado ? (
                                                                    <CircleCheckBig
                                                                        size={18}
                                                                        color="green"
                                                                    />
                                                                ) : (
                                                                    <Circle
                                                                        size={18}
                                                                        color="orange"
                                                                    />
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                <footer className="modal-footer-approve">
                                    <button
                                        className="btn-approve-group"
                                        disabled={!canCreate}
                                        onClick={handleCreateGroup}
                                    >
                                        {canCreate ? "Crear Grupo" : "Pendiente de Validar"}
                                    </button>
                                </footer>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL DE EDICIÓN */}
                {isEditModalOpen && editingGroup && (
                    <div className="modal-overlay">
                        <div className="modal-container group-modal-large">
                            <div className="modal-header">
                                <h2>Actualizar Grupo</h2>

                                <button
                                    className="close-x"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditingGroup(null);
                                        closeModal();
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-form">
                                <div className="tutor-row">
                                    <label>Nombre del Grupo:</label>

                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        className="table-input"
                                    />
                                </div>
                                <header className="modal-id-header">
                                    ID Grupo: #{editingGroup.id}
                                </header>

                                <section className="modal-section">
                                    <div className="section-header">
                                        <h3>Tutores</h3>

                                        <button
                                            type="button"
                                            className="btn-availability"
                                            onClick={() => setShowAvailability(true)}
                                        >
                                            Ver disponibilidad
                                        </button>
                                    </div>

                                    <div className="tutors-list">
                                        {[
                                            { label: "Sistemas", key: "sistemas", idx: 0 },
                                            { label: "Gestión", key: "gestion", idx: 1 },
                                            { label: "Informática", key: "informatica", idx: 2 }
                                        ].map((tutor) => {
                                            const isApproved =
                                                tutorApprovals[
                                                tutor.key as keyof typeof tutorApprovals
                                                ];

                                            return (
                                                <div key={tutor.key} className="tutor-row">

                                                    <label>{tutor.label}:</label>

                                                    <input
                                                        type="text"
                                                        value={comprensive[tutor.idx]?.name || "No Seleccionado"}
                                                        readOnly
                                                        className="input-readonly"
                                                    />

                                                    <button
                                                        className={`icon-btn tutor-status-btn ${isApproved ? "approved" : "pending"
                                                            }`}
                                                        data-title={
                                                            isApproved
                                                                ? "De acuerdo"
                                                                : "Pendiente"
                                                        }
                                                        onClick={() =>
                                                            setTutorApprovals({
                                                                ...tutorApprovals,
                                                                [tutor.key]: !isApproved
                                                            })
                                                        }
                                                    >
                                                        {isApproved ? (
                                                            <UserCheck size={18} color="green" />
                                                        ) : (
                                                            <X size={18} color="red" />
                                                        )}
                                                    </button>

                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                                <section className="modal-section">
                                    <div className="section-header">
                                        <h3>Estudiantes ({estudiantes.length}/6)</h3>

                                        <button
                                            className="btn-add-student"
                                            onClick={handleAddStudent}
                                            disabled={estudiantes.length >= 6}
                                        >
                                            <UserPlus size={16} />
                                            Agregar
                                        </button>
                                    </div>

                                    <div className="students-table-wrapper">
                                        <table className="students-modal-table">
                                            <thead>
                                                <tr>
                                                    <th>CARNÉ</th>
                                                    <th>NOMBRE</th>
                                                    <th style={{ textAlign: "center" }}>
                                                        ACCIONES
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {estudiantes.map((est) => (
                                                    <tr key={est.id}>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={est.carne}
                                                                onChange={(e) =>
                                                                    updateStudent(
                                                                        est.id,
                                                                        "carne",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="table-input"
                                                            />
                                                        </td>

                                                        <td>
                                                            <input
                                                                type="text"
                                                                value={est.nombre}
                                                                onChange={(e) =>
                                                                    updateStudent(
                                                                        est.id,
                                                                        "nombre",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="table-input"
                                                            />
                                                        </td>

                                                        <td
                                                            style={{
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                gap: "8px"
                                                            }}
                                                        >
                                                            <button
                                                                className="icon-btn"
                                                                data-title="Eliminar estudiante"
                                                                onClick={() =>
                                                                    removeStudent(est.id)
                                                                }
                                                                style={{ color: "#ef4444" }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>

                                                            <button
                                                                className={`icon-btn payment-status-btn ${est.pagado
                                                                    ? "paid"
                                                                    : "pending"
                                                                    }`}
                                                                data-title={
                                                                    est.pagado
                                                                        ? "Pagado"
                                                                        : "Pendiente"
                                                                }
                                                                onClick={() =>
                                                                    togglePayment(est.id)
                                                                }
                                                            >
                                                                {est.pagado ? (
                                                                    <CircleCheckBig
                                                                        size={18}
                                                                        color="green"
                                                                    />
                                                                ) : (
                                                                    <Circle
                                                                        size={18}
                                                                        color="orange"
                                                                    />
                                                                )}
                                                            </button>
                                                            <button
                                                                className="icon-btn btn-evaluation"
                                                                data-title={
                                                                    est.pagado
                                                                        ? "Crear evaluación"
                                                                        : "Debe estar pagado"
                                                                }
                                                                disabled={!est.pagado}
                                                                onClick={() => {
                                                                    handleApprove(est.carne);
                                                                }}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                <footer className="modal-footer-approve">
                                    <button
                                        className="btn-approve-group"
                                        disabled={!canCreate}
                                        onClick={handleUpdateGroup}
                                    >
                                        {canCreate
                                            ? "Actualizar Grupo"
                                            : "Pendiente de Validar"}
                                    </button>
                                </footer>
                            </div>
                        </div>
                    </div>
                )}

                {isDeleteModalOpen && (
                    <div className="modal-overlay delete-overlay">
                        <div className="modal-container delete-modal">

                            <div className="modal-header">
                                <h2>Confirmar eliminación</h2>

                                <button className="close-x" onClick={cancelDelete}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-form delete-content">
                                <p className="delete-text">
                                    ¿Estás seguro de que deseas eliminar este grupo?
                                    <br />
                                    Esta acción no se puede deshacer.
                                </p>

                                <div className="delete-actions">

                                    <button
                                        onClick={cancelDelete}
                                        className="btn-delete-cancel"
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        onClick={confirmDeleteGroup}
                                        className="btn-delete-confirm"
                                    >
                                        Eliminar
                                    </button>

                                </div>
                            </div>

                        </div>
                    </div>
                )}

               {showAvailability && (
                    <AvailabilityPicker
                        filterOptions={{mode: 'group-evaluator'}}
                        maxSelections={3}
                        onCancel={() => setShowAvailability(false)}
                        onSave={(teachers) => {
                            setComprensive(teachers);
                            setShowAvailability(false);
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}