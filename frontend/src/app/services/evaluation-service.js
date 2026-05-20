import GLOBAL_API_URL from './global-api-url';

const API = GLOBAL_API_URL;

export const evaluationService = {

  // Students
  getStudentByEst: async (est) => {
    const res = await fetch(`${API}students/search_by_est/?est=${encodeURIComponent(est)}`);
    if (!res.ok) return null;
    return await res.json(); 
  },

  // Types of evaluations 
  getTypes: async () => {
    const res = await fetch(`${API}types/`);
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  },

  findTypeId: async (keyword) => {
    const types = await evaluationService.getTypes();
    const match = types.find(t =>
      t.name.toLowerCase().includes(keyword.toLowerCase())
    );
    return match?.id ?? null;
  },

  // Busca el nombre del curso basándose en la tutoría previa del estudiante
  getCourseFromTutorial: async (est) => {
      try {
        const studentRes = await fetch(`${API}students/search_by_est/?est=${encodeURIComponent(est)}`);
        if (!studentRes.ok) return "Especialización";
        const student = await studentRes.json();

        const sgRes = await fetch(`${API}studygroup-students/?student=${student.id}`);
        const sgData = await sgRes.json();
        const sgList = Array.isArray(sgData) ? sgData : (sgData.results || []);
        if (sgList.length === 0) return "Especialización";

        const ctRes = await fetch(`${API}course-tutorials/?studygroup=${sgList[0].studygroup}`);
        const ctData = await ctRes.json();
        const ctList = Array.isArray(ctData) ? ctData : (ctData.results || []);
        if (ctList.length === 0) return "Especialización";

        const courseRes = await fetch(`${API}courses/${ctList[0].course}/`);
        const course = await courseRes.json();
        return course.name || "Especialización";
      } catch (e) {
          return "Especialización";
      }
  },

  // Evaluations
  createEvaluation: async ({
    studentId,
    teacherId,
    typeId,
    fecha,
    horaInicio,
    horaFin,
    building,
    classroom,
    pagado,
  }) => {
    // Evitamos enviar campos vacíos que enojen a Django
    const body = {
      studentid: studentId,
      haspayment: pagado ?? false,
    };

    if (typeId)     body.type      = typeId;
    if (fecha)      body.date      = fecha;
    if (horaInicio) body.starthour = horaInicio;
    if (horaFin)    body.endhour   = horaFin;
    // Nos aseguramos de enviar el nombre del edificio o dejarlo nulo si está vacío
    if (building && building.trim() !== "")   body.building  = building;
    if (classroom && classroom.trim() !== "")  body.classroom = classroom;

    const evalRes = await fetch(`${API}evaluations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!evalRes.ok) {
      const err = await evalRes.json().catch(() => ({}));
      console.error("Error exacto del backend:", err); // Para debugear si vuelve a fallar
      throw new Error(err?.detail || err?.building?.[0] || 'Error al crear la evaluación');
    }

    const evaluation = await evalRes.json();

    // Link teacher if teacherId is provided
    let evaluationTeacher = null;
    if (teacherId) {
      const etRes = await fetch(`${API}evaluation-teachers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluation: evaluation.id,
          teacher: teacherId,
        }),
      });

      if (!etRes.ok) {
        const err = await etRes.json().catch(() => ({}));
        throw new Error(err?.detail ?? 'Error al asignar el catedrático');
      }

      evaluationTeacher = await etRes.json();
    }

    return { evaluation, evaluationTeacher };
  },
};