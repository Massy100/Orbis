import { useState, useMemo } from "react";
import {
    StudyGroup,
    GroupDetail,
    GroupStatus
} from "../types";

import { STUDY_GROUPS_MOCK } from "../data/groups-mocks";

export const useGroups = () => {
    const [groups, setGroups] = useState<StudyGroup[]>(STUDY_GROUPS_MOCK);

    const [groupDetails, setGroupDetails] = useState<GroupDetail[]>(
        STUDY_GROUPS_MOCK.map((group) => ({
            ...group,
            tutores: [
                { nombre: "No asignado", aprobado: false },
                { nombre: "No asignado", aprobado: false },
                { nombre: "No asignado", aprobado: false }
            ],
            estudiantes: []
        }))
    );

    const [filter, setFilter] = useState<GroupStatus | "Todos">("Todos");

    const addGroup = (newGroup: GroupDetail) => {
        setGroupDetails((prev) => [newGroup, ...prev]);

        setGroups((prev) => [
            {
                id: newGroup.id,
                nombre: newGroup.nombre,
                estado: newGroup.estado
            },
            ...prev
        ]);
    };

    const updateGroup = (updatedGroup: GroupDetail) => {
        setGroupDetails((prev) =>
            prev.map((group) =>
                group.id === updatedGroup.id
                    ? updatedGroup
                    : group
            )
        );

        setGroups((prev) =>
            prev.map((group) =>
                group.id === updatedGroup.id
                    ? {
                        id: updatedGroup.id,
                        nombre: updatedGroup.nombre,
                        estado: updatedGroup.estado
                    }
                    : group
            )
        );
    };

    const deleteGroup = (id: number) => {
        setGroups((prev) =>
            prev.filter((group) => group.id !== id)
        );
    };

    const getGroupDetail = (id: number) => {
        return groupDetails.find((group) => group.id === id) || null;
    };

    const filteredGroups = useMemo(() => {
        if (filter === "Todos") return groups;
        return groups.filter((group) => group.estado === filter);
    }, [filter, groups]);

    return {
        filter,
        setFilter,
        filteredGroups,
        addGroup,
        getGroupDetail,
        updateGroup,
        deleteGroup
    };
};