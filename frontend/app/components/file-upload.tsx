"use client";
import "../styles/file-upload.css";
import { useRef, useState, DragEvent, ChangeEvent, useEffect } from "react";




type FileUploadProps = {
    selectedFile: File | null;
    onFileSelect: (file: File) => void;
    onRemoveFile: () => void;
    onSave: () => void;
    accept?: string;
    allowedText?: string;
};

export default function FileUpload({
    selectedFile,
    onFileSelect,
    onRemoveFile,
    onSave,
    accept = ".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    allowedText = "FORMATOS PERMITIDOS: EXCEL, CSV",
}: FileUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        const validTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        const validExtensions = [".xls", ".xlsx", ".csv"];
        const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

        const isValid =
            validTypes.includes(file.type) || validExtensions.includes(fileExtension);

        if (!isValid) return;

        onFileSelect(file);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const openFilePicker = () => {
        inputRef.current?.click();
    };

    const handleRemove = () => {
        onRemoveFile();
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    useEffect(() => {
        if (!selectedFile && inputRef.current) {
            inputRef.current.value = "";
        }
    }, [selectedFile]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="upload-wrapper">
            <div
                className={`upload-card ${isDragging ? "dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="upload-icon-circle">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13 19L13 15 16 15 12 10 8 15 11 15 11 19z"></path><path d="M7,19h2v-2H7c-1.654,0-3-1.346-3-3c0-1.404,1.199-2.756,2.673-3.015l0.581-0.102l0.192-0.558C8.149,8.274,9.895,7,12,7 c2.757,0,5,2.243,5,5v1h1c1.103,0,2,0.897,2,2s-0.897,2-2,2h-3v2h3c2.206,0,4-1.794,4-4c0-1.88-1.305-3.462-3.056-3.888 C18.507,7.67,15.56,5,12,5C9.244,5,6.85,6.611,5.757,9.15C3.609,9.792,2,11.82,2,14C2,16.757,4.243,19,7,19z"></path></svg>
                </div>

                <h3 className="upload-title">Subir Archivo</h3>

                <p className="upload-text">
                    Arrastre y suelte sus documentos aquí o
                    <br />
                    utilice el botón para explorar su
                    <br />
                    ordenador.
                </p>

                <button type="button" className="upload-button" onClick={openFilePicker}>
                    <div className="upload-button-icon">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm212-240h-28.8c-4.4 0-8.4 2.4-10.5 6.3-18 33.1-22.2 42.4-28.6 57.7-13.9-29.1-6.9-17.3-28.6-57.7-2.1-3.9-6.2-6.3-10.6-6.3H124c-9.3 0-15 10-10.4 18l46.3 78-46.3 78c-4.7 8 1.1 18 10.4 18h28.9c4.4 0 8.4-2.4 10.5-6.3 21.7-40 23-45 28.6-57.7 14.9 30.2 5.9 15.9 28.6 57.7 2.1 3.9 6.2 6.3 10.6 6.3H260c9.3 0 15-10 10.4-18L224 320c.7-1.1 30.3-50.5 46.3-78 4.7-8-1.1-18-10.3-18z"></path></svg>
                    </div>
                    Seleccionar Archivo
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleInputChange}
                    className="upload-input"
                />

                <div className="upload-divider" />

                <p className="upload-format">{allowedText}</p>

                {selectedFile && (
                    <div className="selected-file-card">
                        <div className="selected-file-left">
                            <div className="selected-file-icon">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" xmlns="http://www.w3.org/2000/svg"> <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm212-240h-28.8c-4.4 0-8.4 2.4-10.5 6.3-18 33.1-22.2 42.4-28.6 57.7-13.9-29.1-6.9-17.3-28.6-57.7-2.1-3.9-6.2-6.3-10.6-6.3H124c-9.3 0-15 10-10.4 18l46.3 78-46.3 78c-4.7 8 1.1 18 10.4 18h28.9c4.4 0 8.4-2.4 10.5-6.3 21.7-40 23-45 28.6-57.7 14.9 30.2 5.9 15.9 28.6 57.7 2.1 3.9 6.2 6.3 10.6 6.3H260c9.3 0 15-10 10.4-18L224 320c.7-1.1 30.3-50.5 46.3-78 4.7-8-1.1-18-10.3-18z"></path> </svg>
                            </div>

                            <div className="selected-file-info">
                                <p className="selected-file-name" title={selectedFile.name}>
                                    {selectedFile.name}
                                </p>
                                <span className="selected-file-meta">
                                    Excel • {formatFileSize(selectedFile.size)}
                                </span>
                            </div>
                        </div>

                        <div className="selected-file-actions">
                            <button
                                type="button"
                                className="file-action-button secondary save"
                                onClick={onSave}
                            >
                                Guardar
                            </button>
                            <button
                                type="button"
                                className="file-action-button secondary"
                                onClick={openFilePicker}
                            >
                                Cambiar
                            </button>
                            <button
                                type="button"
                                className="file-action-button danger"
                                onClick={handleRemove}
                            >
                                Quitar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
