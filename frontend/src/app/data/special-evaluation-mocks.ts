import { Evaluation } from "../types";

export const CURSOS_DISPONIBLES = [
  "Cálculo I", "Cálculo II", "Precálculo", "Cálculo III", 
  "Base de Datos I", "Base de Datos II", "Física I", "Física II"
];

export const mockData: Evaluation[] = [
  {
    id: 1,
    carnet: "05324",
    nombre: "Abelardo De la Cruz",
    curso: "Cálculo I",
    pago: "pendiente",
    tutor: { nombre: "Dr. López", estado: "acordado" },
  },
  {
    id: 2,
    carnet: "50843",
    nombre: "Jorge Escalante",
    curso: "Base de Datos I",
    pago: "pagado",
    tutor: { nombre: "Dra. Pérez", estado: "no_acuerdo" },
  },
  {
    id: 3,
    carnet: "12944",
    nombre: "María Fernanda Ríos",
    curso: "Física II",
    pago: "pagado",
    tutor: { nombre: "Ing. Morales", estado: "acordado" },
  },
  {
    id: 4,
    carnet: "08221",
    nombre: "Ricardo Méndez",
    curso: "Estructuras de Datos",
    pago: "pendiente",
    tutor: { nombre: "Dr. Castillo", estado: "no_acuerdo" },
  },
  {
    id: 5,
    carnet: "33412",
    nombre: "Ana Lucía Ortiz",
    curso: "Programación Web",
    pago: "pagado",
    tutor: { nombre: "Msc. García", estado: "acordado" },
  },
  {
    id: 6,
    carnet: "45009",
    nombre: "Roberto Carlos Sosa",
    curso: "Estadística I",
    pago: "pendiente",
    tutor: { nombre: "Dra. Quiñónez", estado: "acordado" },
  },
  {
    id: 7,
    carnet: "09118",
    nombre: "Elena Villagrán",
    curso: "Redes de Computadoras",
    pago: "pagado",
    tutor: { nombre: "Ing. Soto", estado: "no_acuerdo" },
  },
  {
    id: 8,
    carnet: "21773",
    nombre: "Samuel Arriola",
    curso: "Sistemas Operativos",
    pago: "pagado",
    tutor: { nombre: "Dr. López", estado: "acordado" },
  },
];