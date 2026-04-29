export type GroupStatus = 'Aprobado' | 'Pendiente';

export interface StudyGroup {
    id: number;
    nombre: string;
    estado: GroupStatus;
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

export interface GroupDetail extends StudyGroup {
    tutores: TutorGrupo[];
    estudiantes: EstudianteGrupo[];
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
}