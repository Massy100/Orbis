import {GLOBAL_API_URL} from './global-api-url';

const API_URL = GLOBAL_API_URL;

export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_URL}dashboard-metrics/`);
    if (!response.ok) throw new Error('Error al obtener métricas del servidor');
    
    const data = await response.json();
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error("Dashboard Service Error:", error);
    return {
      success: false,
      data: null
    };
  }
};