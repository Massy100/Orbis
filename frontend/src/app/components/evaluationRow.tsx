import { CircleCheckBig, Circle, UserCheck, X, Pencil, Trash2, Check, Plus } from "lucide-react";
import { Evaluation } from "../types";

interface EvaluationRowProps {
  item: Evaluation;
  onCreate: (item: Evaluation) => void;
  onEdit: (item: Evaluation) => void;
  onDelete: (id: number) => void;
  onTogglePago: (id: number) => void;
  onToggleTutor: (id: number) => void;
  onApprove: (id: number) => void;
}

export const EvaluationRow = ({ 
  item, 
  onCreate,
  onEdit, 
  onDelete, 
  onTogglePago, 
  onToggleTutor, 
  onApprove 
}: EvaluationRowProps) => { 
  const isReady = item.pago === "pagado" && item.tutor.estado === "acuerdo";

  return (
    <tr>
      <td>{item.carnet}</td>
      <td>
        <span className="truncate-text" title={item.nombre}>
          {item.nombre}
        </span>
      </td>
      <td>
        <span className="truncate-text" title={item.curso}>
          {item.curso}
        </span>
      </td>
      <td>
        <button 
          className="icon-btn" 
          data-title={item.pago === "pagado" ? "Pagado" : "Pendiente"}
          onClick={() => onTogglePago(item.id)}
        >
          {item.pago === "pagado" ? <CircleCheckBig color="green" /> : <Circle color="orange" />}
        </button>
      </td>
      <td>
        <div className="tutor-cell">
          <span>{item.tutor.nombre}</span>
          <button 
            className="icon-btn" 
            data-title={item.tutor.estado === "acuerdo" ? "De acuerdo" : "Sin acordar"}
            onClick={() => onToggleTutor(item.id)}
          >
            {item.tutor.estado === "acuerdo" ? <UserCheck color="green" /> : <X color="red" />}
          </button>
        </div>
      </td>
      <td>
        <span className={`status ${isReady ? 'ok' : 'bad'}`}>
          {isReady ? "Listo" : "No aprobado"}
        </span>
      </td>
      <td>
        <div className="actions">
          <button data-title="Editar evaluación" onClick={() => onEdit(item)}><Pencil size={18} /></button>
          <button data-title="Eliminar evaluación" onClick={() => onDelete(item.id)}><Trash2 size={18} /></button>
          <button data-title={isReady ? "Crear Evaluación" : "Requisitos incompletos"} disabled={!isReady} className="btn-approve" onClick={() => onApprove(item.id)}>
            <Check size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};