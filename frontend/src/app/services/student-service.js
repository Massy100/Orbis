import GLOBAL_API_URL from "./global-api-url";

const API = GLOBAL_API_URL;

export const studentService = {
    async findByCarnet(carnet) {
        const res = await fetch(`${API}students/search_by_est/?est=${carnet}`);
        if (!res.ok) return null;
        return res.json();
    },

    async getStudents() {
        const res = await fetch(`${API}students/`);
        if (!res.ok) throw new Error("Error obteniendo estudiantes");
        
        const data = await res.json();
        // DRF a veces devuelve { results: [...] } si hay paginación global
        return Array.isArray(data) ? data : (data.results || []);
    },

    async createStudent(data) {
        const res = await fetch(`${API}students/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: data.name,
                est: data.carne, // En DB se llama 'est'
                isactive: true,
                faculty: 1, // Valores por defecto obligatorios
                career: 1
            })
        });

        return {
            ok: res.ok,
            data: await res.json().catch(() => ({}))
        };
    },

    async updateStudent(id, data) {
        const res = await fetch(`${API}students/${id}/`, {
            method: "PATCH", // Cambiado a PATCH para que solo actualice lo enviado
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: data.name,
                est: data.carne // En DB se llama 'est'
            })
        });

        return {
            ok: res.ok,
            data: await res.json().catch(() => ({}))
        };
    },

    async deactivateStudent(id) {
        // Apunta al nuevo endpoint que creamos en views.py
        const res = await fetch(`${API}students/${id}/toggle-active/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            }
        });

        return {
            ok: res.ok,
            data: await res.json().catch(() => ({}))
        };
    }
};