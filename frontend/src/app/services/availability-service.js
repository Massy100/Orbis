import GLOBAL_API_URL from './global-api-url';

const API = GLOBAL_API_URL;

export const availabilityService = {
  getTeachers: (params = {}) => {
    const qs = new URLSearchParams({ isactive: 'true', ...params });
    return fetch(`${API}teachers/?${qs}`).then(r => r.json());
  },

  getPeriods: () =>
    fetch(`${API}periods/`).then(r => r.json()),

  getTeacherPeriods: (teacherIds = []) => {
    const base = `${API}teachers-periods/`;
    const url = teacherIds.length
      ? `${base}?${teacherIds.map(id => `teacher=${id}`).join('&')}`
      : base;
    return fetch(url).then(r => r.json());
  },
};