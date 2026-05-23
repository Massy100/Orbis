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
                est: data.carne, 
                isactive: true,
                faculty: 1, 
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
            method: "PATCH", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: data.name,
                est: data.carne 
            })
        });

        return {
            ok: res.ok,
            data: await res.json().catch(() => ({}))
        };
    },

    async deactivateStudent(id) {
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