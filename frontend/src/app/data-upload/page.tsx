"use client";
import "./data-upload.css";
import { useEffect, useState } from "react";
import FileUpload from "../components/file-upload";
import Toast from "../components/toast";
import DashboardLayout from "../components/layout";




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
    const [toast, setToast] = useState<ToastState>({
        show: false,
        message: "",
        type: "info",
    });

    const showToast = (message: string, type: ToastType = "info") => {
        setToast({
            show: true,
            message,
            type,
        });
    };

    const hideToast = () => {
        setToast((prev) => ({
            ...prev,
            show: false,
        }));
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

            // Replace this simulation with the actual POST request to the backend to upload the file
            // now send the file and type (file, (especial or comprensiva)) to the backend
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("type", activeOption);

            // Here go the logic to send the file to the backend
            await new Promise((resolve) => setTimeout(resolve, 1500));

            showToast("Archivo cargado correctamente", "success");

            setSelectedFile(null);
        } catch (error) {
            showToast("Ocurrió un error al cargar el archivo", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Clear selected file when switching options
    useEffect(() => {
        setSelectedFile(null);
    }, [activeOption]);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (!toast.show) return;

        const timer = setTimeout(() => {
            hideToast();
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast.show]);


    return (
        <>
            <DashboardLayout>

                <div className="data-upload-general-content">

                    {/* <header className="data-upload-header">
                            <h1>Carga de pensum</h1>
                            <div className="system-administrator">
                                <h2>Administrador del sistema</h2>
                                <div className="icon">
                                    <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                            </div>
                        </header> */}

                    <div className="data-upload-fileupload">
                        <FileUpload
                            selectedFile={selectedFile}
                            onFileSelect={handleFileSelect}
                            onRemoveFile={handleRemoveSelectedFile}
                            onSave={handleSaveFile}
                        />
                    </div>

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
