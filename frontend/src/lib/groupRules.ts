import { EstudianteGrupo } from "../app/types";

export const canCreateGroup = (
  groupName: string,
  tutors: string[],
  students: EstudianteGrupo[]
) => {
  return (
    groupName.trim() !== "" &&
    tutors.every(t => t !== "No Seleccionado") &&
    students.length >= 1 &&
    students.length <= 6
  );
};

export const isGroupApproved = (
  estudiantes: { pagado: boolean }[],
  tutores: { aprobado: boolean }[]
) => {
  const allStudentsPaid = estudiantes.every(e => e.pagado);
  const allTutorsApproved = tutores.every(t => t.aprobado);

  return allTutorsApproved && allStudentsPaid;
};