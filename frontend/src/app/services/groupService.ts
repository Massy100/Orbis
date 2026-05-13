import GLOBAL_API_URL from './global-api-url';

const API = GLOBAL_API_URL;

export const groupsService = {

  async getAll() {
    const res = await fetch(`${API}studygroups/`);
    return res.json();
  },

  async getById(id: number) {
    const res = await fetch(`${API}studygroups/${id}/`);
    if (!res.ok) return null;
    return res.json();
  },

  async create(group: any) {
    const res = await fetch(`${API}studygroups/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(group),
    });

    if (!res.ok) {
      const error = await res.json();
      throw error;
    }

    return res.json();
  },

  async update(id: number, group: any) {
    const res = await fetch(`${API}studygroups/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(group),
    });

    if (!res.ok) throw await res.json();
    return res.json();
    },

  async remove(id: number) {
    const res = await fetch(`${API}studygroups/${id}/soft_delete/`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Error en soft delete');
    }

    return res.json();
  }
};