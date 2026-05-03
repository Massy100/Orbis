export interface Evaluation {
  id: number;
  carnet: string;
  nombre: string;
  curso: string;
  pago: "pagado" | "pendiente";
  tutor: {
    nombre: string;
    estado: "acuerdo" | "no_acuerdo";
  };
  fecha: string;    
  hora: string;      
  aula: string;      
  edificio: string;  
}

export interface EvaluationFormData {
  studentId: string;
  nombre: string;
  curso: string;
  date: string;
  hour: string;
  classroom: string;
  building: string;
  typeId: string;
}