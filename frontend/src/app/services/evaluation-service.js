import GLOBAL_API_URL from './global-api-url';

const API = GLOBAL_API_URL;

export const evaluationService = {

  // Estudents

  /**
   * search student by est (carnet)
   * @param {string} est
   * @returns {Promise<object|null>}
   */
  getStudentByEst: async (est) => {
    const data = await fetch(
      `${API}students/?est=${encodeURIComponent(est)}`
    ).then(r => r.json());
    return data.length ? data[0] : null;
  },

  // Types of evaluations 

  /**
   * @returns {Promise<Array<{id: number, name: string}>>}
   */
  getTypes: () =>
    fetch(`${API}types/`).then(r => r.json()),

  /**
   * @param {string} keyword
   * @returns {Promise<number|null>}
   */
  findTypeId: async (keyword) => {
    const types = await evaluationService.getTypes();
    const match = types.find(t =>
      t.name.toLowerCase().includes(keyword.toLowerCase())
    );
    return match?.id ?? null;
  },

  // Evaluations

  /**
   * Create evaluation and link teacher.
   * @param {{
   *   studentId: number,
   *   teacherId: number|null,
   *   typeId: number|null,
   *   fecha: string|null,       // "YYYY-MM-DD"
   *   horaInicio: string|null,  // "HH:MM"
   *   horaFin: string|null,     // "HH:MM"
   *   building: string|null,    // campo `lugar` del form
   *   classroom: string|null,   // campo `salon` del form
   *   pagado: boolean,
   * }} payload
   * @returns {Promise<{ evaluation: object, evaluationTeacher: object }>}
   */
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
    // 1. Create evaliation with required fields
    const body = {
      studentid: studentId,
      haspayment: pagado ?? false,
    };

    if (typeId)     body.type      = typeId;
    if (fecha)      body.date      = fecha;
    if (horaInicio) body.starthour = horaInicio;
    if (horaFin)    body.endhour   = horaFin;
    if (building)   body.building  = building;
    if (classroom)  body.classroom = classroom;

    const evalRes = await fetch(`${API}evaluations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!evalRes.ok) {
      const err = await evalRes.json().catch(() => ({}));
      throw new Error(err?.detail ?? 'Error al crear la evaluación');
    }

    const evaluation = await evalRes.json();

    // 2. link teacher if teacherId is provided
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