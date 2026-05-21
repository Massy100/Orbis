import GLOBAL_API_URL from './global-api-url';

const API = GLOBAL_API_URL;

export const availabilityService = {
  getTeachers: async (params = {}) => {
    const qs = new URLSearchParams({ isactive: 'true', ...params });
    const res = await fetch(`${API}teachers/?${qs}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  getPeriods: async () => {
    const res = await fetch(`${API}periods/`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  getTeacherPeriods: async (teacherIds = []) => {
    const base = `${API}teachers-periods/`;
    const url = teacherIds.length
      ? `${base}?${teacherIds.map(id => `teacher=${id}`).join('&')}`
      : base;
    const res = await fetch(url);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  getStudyGroupTeachers: async (studygroupId) => {
    const res = await fetch(`${API}studygroup-teachers/?studygroup=${studygroupId}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  getCourseTutorials: async (studygroupId) => {
    const res = await fetch(`${API}course-tutorials/?studygroup=${studygroupId}`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  // CORREGIDO: Usando la ruta search_by_est para encontrar el ID exacto
  getStudyGroupIdByEst: async (est) => {
    const studentRes = await fetch(`${API}students/search_by_est/?est=${encodeURIComponent(est)}`);
    if (!studentRes.ok) return null;
    
    const student = await studentRes.json();
    const studentId = student.id;

    // Buscar si está en un grupo de estudio
    const sgRes = await fetch(`${API}studygroup-students/?student=${studentId}`);
    const sgData = await sgRes.json();
    const sgStudents = Array.isArray(sgData) ? sgData : (sgData.results || []);

    if (!sgStudents.length) return null;
    return sgStudents[0].studygroup;
  },
};