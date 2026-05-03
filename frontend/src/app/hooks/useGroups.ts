import { useState, useEffect, useMemo } from "react";
import { StudyGroup, GroupDetail, GroupStatus } from "../types";
import { groupsService } from "../services/groupService";
import { isGroupApproved } from "@/src/lib/groupRules";

export const useGroups = () => {

    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [groupDetails, setGroupDetails] = useState<GroupDetail[]>([]);
    const [filter, setFilter] = useState<GroupStatus | "Todos">("Todos");

    const loadGroups = async () => {
        const data = await groupsService.getAll();
        setGroups(data);
    };

    const getGroupDetail = async (id: number) => {
        const detail = await groupsService.getById(id);
        return detail;
    };

    const addGroup = async (group: GroupDetail) => {
        await groupsService.create(group);
        await loadGroups();
    };

    const updateGroup = async (group: GroupDetail) => {
        const status: GroupStatus = isGroupApproved(
            group.estudiantes,
            group.tutores
        ) ? "Aprobado" : "Pendiente";

        const finalGroup = {
            ...group,
            estado: status
        };

        await groupsService.update(finalGroup);
        await loadGroups();
    };

    const deleteGroup = async (id: number) => {
        await groupsService.remove(id);
        await loadGroups();
    };

    const filteredGroups = useMemo(() => {
        if (filter === "Todos") return groups;
        return groups.filter(g => g.estado === filter);
    }, [groups, filter]);

    useEffect(() => {
        loadGroups();
    }, []);

    return {
        filter,
        setFilter,
        filteredGroups,
        addGroup,
        updateGroup,
        deleteGroup,
        getGroupDetail
    };
};