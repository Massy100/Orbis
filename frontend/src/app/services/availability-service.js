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

  /**
   * @param {number} studygroupId
   */
  getStudyGroupTeachers: (studygroupId) =>
    fetch(`${API}studygroup-teachers/?studygroup=${studygroupId}`).then(r => r.json()),

  /**
   * @param {number} studygroupId
   */
  getCourseTutorials: (studygroupId) =>
    fetch(`${API}course-tutorials/?studygroup=${studygroupId}`).then(r => r.json()),

  /**
   * Given a student carnet (est), resolves the studygroup ID the student belongs to.
   * Flow: est → students/?est=<est> → student.id → studygroup-students/?student=<id> → studygroup id
   *
   * @param {string} est  - The student carnet/code from the URL param
   * @returns {Promise<number|null>} The studygroup ID, or null if not found
   */
  getStudyGroupIdByEst: async (est) => {
    // Step 1: find the student record by carnet (est field)
    const students = await fetch(`${API}students/?est=${encodeURIComponent(est)}`).then(r => r.json());
    if (!students.length) return null;

    const studentId = students[0].id;

    // Step 2: find the studygroup-student record for this student
    const sgStudents = await fetch(`${API}studygroup-students/?student=${studentId}`).then(r => r.json());
    if (!sgStudents.length) return null;

    return sgStudents[0].studygroup;
  },
};