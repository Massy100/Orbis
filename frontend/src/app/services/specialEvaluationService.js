import {GLOBAL_API_URL} from './global-api-url';

const API_URL = GLOBAL_API_URL;

const safeParse = async (res) => {
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results || []);
};

export const specialEvaluationService = {

  getAllSpecialEvaluations: async () => {
    try {
      const [ctRes, sgsRes, studentsRes, teachersRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}course-tutorials/`),
        fetch(`${API_URL}studygroup-students/`),
        fetch(`${API_URL}students/`),
        fetch(`${API_URL}teachers/`),
        fetch(`${API_URL}courses/`)
      ]);

      const ctData = await safeParse(ctRes);
      const sgsData = await safeParse(sgsRes);
      const studentsData = await safeParse(studentsRes);
      const teachersData = await safeParse(teachersRes);
      const coursesData = await safeParse(coursesRes);

      return ctData.map((ct) => {
        const relation = sgsData.find(sgs => sgs.studygroup === ct.studygroup);
        const studentObj = relation ? studentsData.find(s => s.id === relation.student) : null;
        const teacherObj = teachersData.find(t => t.id === ct.teacher);
        const courseObj = coursesData.find(c => c.id === ct.course);

        const statusAcuerdo = ct.hasaccepted ? "acordado" : "no_acuerdo";
        const estadoFinal = (ct.hasaccepted && ct.haspayment) ? "Aprobado" : "No aprobado";

        return {
          id: ct.id,
          carnet: studentObj?.est || "",
          nombre: studentObj?.name || "",
          curso: courseObj?.name || "",
          pago: ct.haspayment ? "pagado" : "pendiente",
          tutor: { 
              nombre: teacherObj?.name || "Sin asignar", 
              estado: statusAcuerdo 
          },
          estado: estadoFinal,
          studentId: studentObj?.id 
        };
      });
    } catch (error) {
      console.error("Error cargando tabla:", error);
      return [];
    }
  },

  getAllCourses: async () => {
    try {
        const res = await fetch(`${API_URL}courses/`);
        return await safeParse(res);
    } catch (error) { return []; }
  },

  searchStudentByCarnet: async (carnet) => {
      const searchRes = await fetch(`${API_URL}students/?search=${carnet}`);
      const studentArray = await safeParse(searchRes);
      return studentArray.length > 0 ? studentArray[0] : null;
  },

  createOrUpdateEvaluation: async (form, editingId, cursosBd) => {
    try {
      let courseId = null;
      const foundCourse = cursosBd.find(c => c.name.toLowerCase() === form.curso.toLowerCase());
      if (foundCourse) {
          courseId = foundCourse.id;
      } else {
          const cRes = await fetch(`${API_URL}courses/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: form.curso, career: 1, faculty: 1 })
          });
          const newCourse = await cRes.json();
          courseId = newCourse.id;
      }

      if (editingId) {
        const ctRes = await fetch(`${API_URL}course-tutorials/${editingId}/`);
        const ct = await ctRes.json();
        
        await fetch(`${API_URL}course-tutorials/${editingId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                course: courseId,
                teacher: form.tutorId || ct.teacher
            })
        });

        const sgsRes = await fetch(`${API_URL}studygroup-students/?studygroup=${ct.studygroup}`);
        const sgsData = await safeParse(sgsRes);
        if (sgsData.length > 0) {
            await fetch(`${API_URL}/students/${sgsData[0].student}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.nombre, est: form.carnet })
            });
        }
      } else {
        let studentId;
        const existingStudent = await specialEvaluationService.searchStudentByCarnet(form.carnet);
        if (existingStudent) {
            studentId = existingStudent.id;
            await fetch(`${API_URL}/students/${studentId}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: form.nombre })
            });
        } else {
            const createRes = await fetch(`${API_URL}students/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: form.nombre, est: form.carnet, isactive: true, career: 1, faculty: 1 })
            });
            const newStudent = await createRes.json();
            studentId = newStudent.id;
        }

        const sgRes = await fetch(`${API_URL}studygroups/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group: `Especial-${form.carnet}`, approvedgroup: true, isactive: true })
        });
        const newSG = await sgRes.json();

        await fetch(`${API_URL}studygroup-students/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studygroup: newSG.id, student: studentId, haspayment: false })
        });

        await fetch(`${API_URL}course-tutorials/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              studygroup: newSG.id, 
              teacher: form.tutorId, 
              course: courseId, 
              hasaccepted: false, 
              haspayment: false 
          })
        });
      }
      return { success: true };
    } catch (error) { throw error; }
  },

  deleteEvaluation: async (id) => {
      await fetch(`${API_URL}course-tutorials/${id}/`, { method: 'DELETE' });
  },

  togglePayment: async (id, isPaidNow) => {
    try {
      await fetch(`${API_URL}course-tutorials/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ haspayment: isPaidNow === true || isPaidNow === "pagado" }) 
      });
    } catch (e) { console.error(e); }
  },

  toggleTutorStatus: async (id, isAcceptedNow) => {
    try {
      await fetch(`${API_URL}course-tutorials/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hasaccepted: isAcceptedNow === true || isAcceptedNow === "acordado" })
      });
    } catch (e) { console.error(e); }
  },
};