import { GroupDetail, StudyGroup } from "../types";

let mockDB: GroupDetail[] = [];

export const groupsService = {
    async getAll(): Promise<StudyGroup[]> {
        return mockDB.map(g => ({
            id: g.id,
            nombre: g.nombre,
            estado: g.estado
        }));
    },

    async getById(id: number): Promise<GroupDetail | null> {
        return mockDB.find(g => g.id === id) || null;
    },

    async create(group: GroupDetail): Promise<void> {
        mockDB.unshift(group);
    },

    async update(group: GroupDetail): Promise<void> {
        mockDB = mockDB.map(g =>
            g.id === group.id ? group : g
        );
    },

    async remove(id: number): Promise<void> {
        mockDB = mockDB.filter(g => g.id !== id);
    }
};