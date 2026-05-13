import GLOBAL_API_URL from "./global-api-url";

const API = GLOBAL_API_URL;

export const studentService = {
    async findByCarnet(carnet: string) {
        const res = await fetch(
            `${API}students/search_by_est/?est=${carnet}`
        );

        if (!res.ok) return null;

        return res.json();
    }
};