"use client";
import "../styles/toast.css";


type ToastType = "success" | "error" | "info";

type ToastProps = {
    show: boolean;
    message: string;
    type?: ToastType;
    onClose: () => void;
};

export default function Toast({
    show,
    message,
    type = "info",
    onClose,
}: ToastProps) {
    return (
        <div className={`custom-toast ${show ? "show" : ""} ${type}`}>
            <div className="custom-toast-content">
                <span>{message}</span>

                <button
                    type="button"
                    className="custom-toast-close"
                    onClick={onClose}
                    aria-label="Cerrar notificación"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
