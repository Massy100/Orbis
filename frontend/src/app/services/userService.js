import {GLOBAL_API_URL} from './global-api-url';

const API_URL = GLOBAL_API_URL;

export const getSystemUsers = async () => {
  try {
    const response = await fetch(`${API_URL}system-users/`);
    if (!response.ok) throw new Error('Error al obtener los usuarios');
    const data = await response.json();
    return data.results ? data.results : data;
  } catch (error) {
    console.error("Service Error - getSystemUsers:", error);
    return [];
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await fetch(`${API_URL}system-users/${userId}/toggle-active/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al cambiar el estado');
    return await response.json(); 
  } catch (error) {
    console.error("Service Error - toggleUserStatus:", error);
    return null;
  }
};