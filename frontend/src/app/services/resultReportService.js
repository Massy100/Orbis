const API_URL = 'http://localhost:8001/api';

export const fetchResultReports = async () => {
    try {
        const response = await fetch(`${API_URL}/result-reports/`);
        if (!response.ok) throw new Error('Error al obtener los reportes');

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Result Reports Service Error:", error);
        return { success: false, data: { especial: [], comprensiva: [] } };
    }
};

export const updateResultCalificacion = async (evaluationId, state) => {
    try {
        const response = await fetch(
            `${API_URL}/result-reports/${evaluationId}/calificacion/`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ state }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al actualizar la calificación");
        }

        return { success: true, data };
    } catch (error) {
        console.error("Update Result Error:", error);
        return {
            success: false,
            errorMessage: error.message,
        };
    }
};

export const sendReportEmail = async (emailData) => {
    try {
        const response = await fetch(`${API_URL}/send-email/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error desconocido en el servidor');
        }

        return { success: true };
    } catch (error) {
        console.error("Email Service Error:", error);
        // Devolvemos el mensaje de error exacto
        return { success: false, errorMessage: error.message };
    }
};