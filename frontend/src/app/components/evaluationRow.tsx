import { CircleCheckBig, Circle, UserCheck, X, Pencil, Trash2, Check } from "lucide-react";
import { Evaluation } from "../types";

interface EvaluationRowProps {
  item: Evaluation;
  onCreate: (item: Evaluation) => void;
  onEdit: (item: Evaluation) => void;
  onDelete: (id: number) => void;
  onTogglePago: (id: number, currentState: "pagado" | "pendiente") => void;
  onToggleTutor: (id: number, currentStatus: "acordado" | "no_acuerdo") => void;
  onApprove: (carnet: string) => void;
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
          type="button"
          className="icon-btn" 
          data-title={item.pago === "pagado" ? "Pagado" : "Pendiente"}
          onClick={() => onTogglePago(item.id, item.pago as "pagado" | "pendiente")}
        >
          {item.pago === "pagado" ? <CircleCheckBig color="green" /> : <Circle color="orange" />}
        </button>
      </td>
      <td>
        <div className="tutor-cell">
          <span>{item.tutor.nombre}</span>
          <button 
            type="button"
            className="icon-btn" 
            data-title={item.tutor.estado === "acordado" ? "De acuerdo" : "Sin acordar"}
            onClick={() => onToggleTutor(item.id, item.tutor.estado as "acordado" | "no_acordado")}
          >
            {item.tutor.estado === "acordado" ? <UserCheck color="green" /> : <X color="red" />}
          </button>
        </div>
      </td>
      <td>
        <span className={`status ${isReady ? 'ok' : 'bad'}`}>
          {isReady ? "Aprobado" : "No aprobado"}
        </span>
      </td>
      <td>
        <div className="actions">
          <button type="button" data-title="Editar evaluación" onClick={() => onEdit(item)}><Pencil size={18} /></button>
          <button type="button" data-title="Eliminar evaluación" onClick={() => onDelete(item.id)}><Trash2 size={18} /></button>
          <button 
            type="button"
            data-title={isReady ? "Crear Evaluación" : "Requisitos incompletos"} 
            disabled={!isReady} 
            className="btn-approve" 
            onClick={() => onApprove(item.carnet)}
          >
            <Check size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};