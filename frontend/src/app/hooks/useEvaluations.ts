import { useState } from "react";
import { Evaluation } from "../types";

export function useEvaluations(initialData: Evaluation[]) {
  const [data, setData] = useState(initialData);

  const togglePago = (id: number) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, pago: item.pago === "pendiente" ? "pagado" : "pendiente" } : item
    ));
  };

  const toggleTutor = (id: number) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, tutor: { ...item.tutor, estado: item.tutor.estado === "acuerdo" ? "no_acuerdo" : "acuerdo" }} : item
    ));
  };

  const deleteEvaluation = (id: number) => setData(prev => prev.filter(i => i.id !== id));

  const saveEvaluation = (evaluation: Partial<Evaluation>, editingId: number | null) => {
    if (editingId) {
      setData(prev => prev.map(item => item.id === editingId ? { ...item, ...evaluation } as Evaluation : item));
    } else {
      const newEval = { ...evaluation, id: Date.now(), pago: "pendiente", tutor: { ...evaluation.tutor, estado: "no_acuerdo" } } as Evaluation;
      setData([newEval, ...data]);
    }
  };

  return { data, togglePago, toggleTutor, deleteEvaluation, saveEvaluation };
}