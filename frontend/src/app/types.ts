export type GroupStatus = 'Aprobado' | 'Pendiente';

export interface StudyGroup {
    id: number;
    group: string;
    approvedgroup: boolean;

    teachers: {
        teacher: number;
        hasaccepted: boolean;
    }[];

    students: {
        student: number;
        haspayment: boolean;
    }[];
}

export interface EstudianteGrupo {
    id: number;
    carne: string;
    nombre: string;
    pagado: boolean;
}

export interface TutorGrupo {
    nombre: string;
    aprobado: boolean;
}

export interface SelectedTeacher {
  id: number;
  name: string;
}

export interface GroupDetail extends StudyGroup {
    tutores: TutorGrupo[];
    estudiantes: EstudianteGrupo[]
}

export interface Evaluation {
  id: number;
  carnet: string;
  nombre: string;
  curso: string;
  pago: "pendiente" | "pagado";
  tutor: {
    nombre: string;
    estado: "acuerdo" | "no_acuerdo";
  };
  tutors?: SelectedTeacher[];
}