"use client";
import "./data-upload.css";
import { useEffect, useState } from "react";
import FileUpload from "../components/file-upload";
import Toast from "../components/toast";
import DashboardLayout from "../components/layout";
import { uploadPensum } from "@/src/app/services/pensum-api";

// Shape of the response returned by the Django pensum upload endpoint
type ModelStat = { created: number; skipped: number };

type PensumUploadResult = {
  message: string;
  type: string;
  stats: {
    faculties: ModelStat;
    careers: ModelStat;
    courses: ModelStat;
  };
};

type Option = "especial" | "comprensiva";
type ToastType = "success" | "error" | "info";

type ToastState = {
  show: boolean;
  message: string;
  type: ToastType;
};

export default function DataUpload() {
  const [activeOption, setActiveOption] = useState<Option>("especial");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stepMessage, setStepMessage] = useState<string>("");
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "info",
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
  };

  const handleSaveFile = async () => {
    if (!selectedFile) {
      showToast("Selecciona un archivo antes de continuar", "error");
      return;
    }

    try {
      setIsLoading(true);
      setStepMessage("");

      // Run the parse → upsert pipeline; the heavy lifting happens in Python
      const result: PensumUploadResult = await uploadPensum(
        selectedFile,
        activeOption,
        (msg: string) => setStepMessage(msg)
      );

      const { faculties, careers, courses } = result.stats;
      const summary =
        `Carga completa: ` +
        `${faculties.created} facultad(es), ` +
        `${careers.created} carrera(s), ` +
        `${courses.created} curso(s) creado(s)` +
        (courses.skipped ? ` (${courses.skipped} ya existían)` : "");

      showToast(summary, "success");
      setSelectedFile(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      showToast(`Error al cargar el archivo: ${message}`, "error");
    } finally {
      setIsLoading(false);
      setStepMessage("");
    }
  };

  // Clear selected file when switching between "especial" / "comprensiva"
  useEffect(() => {
    setSelectedFile(null);
  }, [activeOption]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (!toast.show) return;
    const timer = setTimeout(hideToast, 4000);
    return () => clearTimeout(timer);
  }, [toast.show]);

  return (
    <>
      <DashboardLayout>
        <div className="data-upload-general-content">

          <div className="data-upload-fileupload">
            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onRemoveFile={handleRemoveSelectedFile}
              onSave={handleSaveFile}
            />
          </div>

          {/* Show the current processing step while loading */}
          {isLoading && stepMessage && (
            <p className="data-upload-step-message">{stepMessage}</p>
          )}

        </div>
      </DashboardLayout>

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
}