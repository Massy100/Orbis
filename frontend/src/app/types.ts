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