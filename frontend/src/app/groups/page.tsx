"use client";

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Plus, UserCheck, X, Circle, UserPlus, CircleCheckBig, PlusSquare} from 'lucide-react';
import DashboardLayout from '@/src/app/components/layout';
import Pagination from '../components/pagination';
import AvailabilityPicker from '../components/AvailabilityPicker';
import { GroupDetail } from "../types";
import { useGroups } from '../hooks/useGroups'; 
import { canCreateGroup } from '@/src/lib/groupRules';
import './groups.css';

interface Estudiante {
    id: number;
    carne: string;
    nombre: string;
    pagado: boolean;
}

export default function GroupsPage() {
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
    const [comprensive, setComprensive] = useState(["No Seleccionado", "No Seleccionado", "No Seleccionado"]);
    const [tutorApprovals, setTutorApprovals] = useState({ sistemas: false, gestion: false, informatica: false });
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

    const buildGroup = (id: number): GroupDetail => ({
        id,
        nombre: groupName,
        estado: "Pendiente",
        tutores: [
            { nombre: comprensive[0], aprobado: tutorApprovals.sistemas },
            { nombre: comprensive[1], aprobado: tutorApprovals.gestion },
            { nombre: comprensive[2], aprobado: tutorApprovals.informatica }
        ],
        estudiantes: estudiantes.map(e => ({
            ...e,
            pagado: e.pagado ?? false
        }))
    });
    const canCreateEvaluation = selectedGroup?.estado === "Aprobado";

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

    const handleCreateGroup = () => {
        if (!canCreate) return;

        addGroup(buildGroup(Date.now()));
        closeModal();
    };

    const handleUpdateGroup = () => {
        if (!editingGroup) return;

        updateGroup(buildGroup(editingGroup.id));

        setIsEditModalOpen(false);
        setEditingGroup(null);
        closeModal();
    };

    const handleEditGroup = async (id: number) => {
        const detail = await getGroupDetail(id);
        if (!detail) return;

        setEditingGroup(detail);
        setGroupName(detail.nombre);

        setComprensive([
            detail.tutores[0]?.nombre || "No Seleccionado",
            detail.tutores[1]?.nombre || "No Seleccionado",
            detail.tutores[2]?.nombre || "No Seleccionado"
        ]);

        setTutorApprovals({
            sistemas: detail.tutores[0]?.aprobado || false,
            gestion: detail.tutores[1]?.aprobado || false,
            informatica: detail.tutores[2]?.aprobado || false
        });

        setEstudiantes(detail.estudiantes);

        setIsEditModalOpen(true);
    };

    const handleDeleteGroup = (id: number) => {
        const confirmDelete = window.confirm(
            "¿Estás seguro de que deseas eliminar este grupo?"
        );

        if (!confirmDelete) return;

        deleteGroup(id);

        if (editingGroup?.id === id) {
            setEditingGroup(null);
            setIsEditModalOpen(false);
        }

        if (paginatedGroups.length === 1 && page > 1) {
            setPage(page - 1);
        }
    };

    const togglePayment = (id: number) => {
        const updated = estudiantes.map(e =>
            e.id === id ? { ...e, pagado: !e.pagado } : e
        );

        setEstudiantes(updated);

        if (editingGroup) {
            updateGroup({
                ...buildGroup(editingGroup.id),
                estudiantes: updated
            });
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
            updateGroup({
                ...buildGroup(editingGroup.id),
                estudiantes: updated
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setGroupName("")
        setComprensive(["No Seleccionado", "No Seleccionado", "No Seleccionado"]);
        setEstudiantes([]);
        setTutorApprovals({ sistemas: false, gestion: false, informatica: false });
    };

    const openDeleteModal = (id: number) => {
        setGroupToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteGroup = () => {
        if (groupToDelete === null) return;

        deleteGroup(groupToDelete);

        if (selectedGroup?.id === groupToDelete) {
            setSelectedGroup(null);
        }

        if (editingGroup?.id === groupToDelete) {
            setEditingGroup(null);
            setIsEditModalOpen(false);
        }

        setIsDeleteModalOpen(false);
        setGroupToDelete(null);
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
                        <div className="no-results-message">No hay resultados para esta categoría</div>
                    ) : (
                        paginatedGroups.map((group) => (
                            <div key={group.id} className="group-card">
                                <div className="card-header">
                                    <h3 className="group-name">{group.nombre}</h3>
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
                                    <span className={`status-badge ${group.estado === 'Aprobado' ? 'status-aprobado' : 'status-pendiente'}`}>
                                        {group.estado}
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
                                                        value={comprensive[tutor.idx]}
                                                        readOnly
                                                        className="input-readonly"
                                                    />

                                                    <button
                                                        className={`icon-btn tutor-status-btn ${
                                                            isApproved ? "approved" : "pending"
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
                                                                className={`icon-btn payment-status-btn ${
                                                                    est.pagado ? "paid" : "pending"
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
                                                        value={comprensive[tutor.idx]}
                                                        readOnly
                                                        className="input-readonly"
                                                    />

                                                    <button
                                                        className={`icon-btn tutor-status-btn ${
                                                            isApproved ? "approved" : "pending"
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
                                                                className={`icon-btn payment-status-btn ${
                                                                    est.pagado
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
                                                                    console.log("Crear evaluación para:", est);
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
                        maxSelections={3}
                        onCancel={() => setShowAvailability(false)}
                        onSave={(names) => { 
                            setComprensive(names); 
                            setShowAvailability(false); 
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}