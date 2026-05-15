import GLOBAL_API_URL from './global-api-url';

const API = GLOBAL_API_URL;

const safeParseJson = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const parsed = await safeParseJson(response);
  if (!response.ok) {
    const error = new Error(response.statusText || 'Fetch error');
    error.response = response;
    error.payload = parsed;
    throw error;
  }
  return parsed;
};

export const teacherService = {

  /**
   * Get only active teachers.
   * @param {Record<string, string>} params 
   */
  getTeachers: async (params = {}) => {
    const qs = new URLSearchParams(params);
    const data = await fetchJson(`${API}teachers/?${qs}`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * search teacher by name.
   * @param {string} name
   * @returns {Promise<object|null>}
   */
  getTeacherByName: async (name) => {
    const data = await fetchJson(`${API}teachers/?search=${encodeURIComponent(name)}`);
    if (!Array.isArray(data)) return null;

    const exact = data.find(t => t.name === name);
    return exact ?? (data.length ? data[0] : null);
  },

  /**
   * Create a new teacher along with their courses and specialities.
   * @param {{
   *   name: string,
   *   cat: string,
   *   courses: number[],
   *   specialities: number[],
   * }} payload
   */
  createTeacher: (payload) =>
    fetchJson(`${API}teachers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        cat: payload.cat,
        isactive: true,
        evaluationcount: 0,
        career: 1,
        faculty: 1,
        courses: payload.courses,
        specialities: payload.specialities,
      }),
    }),

  /**
   * Updates a teacher's information.
   * @param {number} id
   * @param {{ name: string, cat: string }} data
   */
  updateTeacher: (id, data) =>
    fetch(`${API}teachers/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  /**
   * Updates a teacher's course and speciality relations.
   * @param {number} id
   * @param {{ courses: number[], specialities: number[] }} relations
   */
  updateTeacherRelations: (id, relations) =>
    fetch(`${API}teachers/${id}/update_relations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(relations),
    }),

  /**
   * Deactivates a teacher.
   * @param {number} id
   */
  deactivateTeacher: (id) =>
    fetch(`${API}teachers/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isactive: false }),
    }),

  /**
   * Increments a teacher's evaluation count.
   * @param {number} id
   * @param {number} currentCount 
   */
  incrementEvaluationCount: (id, currentCount) =>
    fetch(`${API}teachers/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluationcount: (currentCount ?? 0) + 1 }),
    }),

  /**
   * Uploads or replaces a teacher's schedule from an Excel file.
   * @param {File} file
   * @param {string} teacherCode 
   * @param {{ replace?: boolean, teacherId?: number }} options
   */
  uploadSchedule: async (file, teacherCode, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('teacher_code', teacherCode);
    formData.append('replace', options.replace ? 'true' : 'false');
    if (options.teacherId) {
      formData.append('teacher_id', String(options.teacherId));
    }

    const response = await fetch(`${API}teacher-schedules/upload/`, {
      method: 'POST',
      body: formData,
    });
    const data = await safeParseJson(response);
    return { ok: response.ok, data };
  },

  // Courses and Specialities

  /**
   * Get all courses ordered by name.
   */
  getCourses: async () => {
    const data = await fetchJson(`${API}courses/?ordering=name`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get all specialities ordered by name.
   */
  getSpecialities: async () => {
    const data = await fetchJson(`${API}specialities/?ordering=name`);
    return Array.isArray(data) ? data : [];
  },
};