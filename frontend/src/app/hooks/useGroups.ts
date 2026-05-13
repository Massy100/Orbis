import { useState, useEffect, useMemo } from "react";
import { StudyGroup, GroupDetail, GroupStatus } from "../types";
import { groupsService } from "../services/groupService";

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

    const addGroup = async (group: any) => {
        await groupsService.create(group);
        await loadGroups();
    };

    const updateGroup = async (id: number, group: any) => {
        await groupsService.update(id, group);
        await loadGroups();
    };

    const deleteGroup = async (id: number) => {
        await groupsService.remove(id);
        await loadGroups();
    };

    const filteredGroups = useMemo(() => {
        if (filter === "Todos") {
            return groups;
        }

        if (filter === "Aprobado") {
            return groups.filter(
                (g) => g.approvedgroup === true
            );
        }

        if (filter === "Pendiente") {
            return groups.filter(
                (g) => g.approvedgroup === false
            );
        }

        return groups;
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
        loadGroups,
        getGroupDetail
    };
};