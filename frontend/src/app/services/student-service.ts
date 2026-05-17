import GLOBAL_API_URL from "./global-api-url";

const API = GLOBAL_API_URL;

export const studentService = {
    async findByCarnet(carnet: string) {
        const res = await fetch(
            `${API}students/search_by_est/?est=${carnet}`
        );

        if (!res.ok) return null;

        return res.json();
    },

    async getStudents() {
        const res = await fetch(
            `${API}students/`
        )

        if (!res.ok) {
            throw new Error(
                "Error obteniendo estudiantes"
            )
        }

        return res.json()
    },
    async createStudent(data: {
        name: string
        carne: string
    }) {
        const res = await fetch(
            `${API}students/`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify(data)
            }
        )

        return {
            ok: res.ok,
            data: await res.json()
        }
    },

    async updateStudent(
        id: number,
        data: {
            name: string
            carne: string
        }
    ) {
        const res = await fetch(
            `${API}students/${id}/`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify(data)
            }
        )

        return {
            ok: res.ok,
            data: await res.json()
        }
    },

    async deactivateStudent(id: number) {
        const res = await fetch(
            `${API}students/${id}/deactivate/`,
            {
                method: "PATCH"
            }
        )

        return {
            ok: res.ok,
            data: await res.json()
        }
    }
};