const API_URL = 'http://localhost:8001/api';

export const getDashboardMetrics = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard-metrics/`);
    if (!response.ok) throw new Error('Error al obtener métricas');
    return await response.json();
  } catch (error) {
    console.error("Error Dashboard Service:", error);
    return null;
  }
};