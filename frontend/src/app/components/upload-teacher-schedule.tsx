'use client'

import { useEffect, useRef } from 'react'
import '../styles/upload-teacher-schedule.css'

type UploadScheduleProps = {
    file: File | null
    onFileChange: (file: File | null) => void
}

export default function UploadTeacherSchedule({
    file,
    onFileChange,
}: UploadScheduleProps) {
    const inputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (!file && inputRef.current) {
            inputRef.current.value = ''
        }
    }, [file])

    const handleOpenPicker = () => {
        if (inputRef.current) {
            inputRef.current.value = ''
        }

        inputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] ?? null
        onFileChange(selectedFile)
    }

    const handleRemoveFile = () => {
        onFileChange(null)

        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    return (
        <div className="upload-schedule">
            <input
                ref={inputRef}
                type="file"
                accept=".xls,.xlsx,.csv"
                className="upload-schedule-input-hidden"
                onChange={handleFileChange}
            />

            <div className="upload-schedule-dropzone">
                <div className="upload-schedule-icon">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13 19L13 15 16 15 12 10 8 15 11 15 11 19z"></path><path d="M7,19h2v-2H7c-1.654,0-3-1.346-3-3c0-1.404,1.199-2.756,2.673-3.015l0.581-0.102l0.192-0.558C8.149,8.274,9.895,7,12,7 c2.757,0,5,2.243,5,5v1h1c1.103,0,2,0.897,2,2s-0.897,2-2,2h-3v2h3c2.206,0,4-1.794,4-4c0-1.88-1.305-3.462-3.056-3.888 C18.507,7.67,15.56,5,12,5C9.244,5,6.85,6.611,5.757,9.15C3.609,9.792,2,11.82,2,14C2,16.757,4.243,19,7,19z"></path></svg>
                </div>

                <h4 className="upload-schedule-title">Subir horario</h4>
                <p className="upload-schedule-subtitle">Formato permitido: Excel, CSV</p>

                <button
                    type="button"
                    className="upload-schedule-button"
                    onClick={handleOpenPicker}
                >
                    Seleccionar archivo
                </button>
            </div>

            {file && (
                <div className="upload-schedule-file">
                    <div className="upload-schedule-file-left">
                        <div className="upload-schedule-file-icon">
                            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2zM575.34 477.84l-61.22 102.3L452.3 477.8a12 12 0 0 0-10.27-5.79h-38.44a12 12 0 0 0-6.4 1.85 12 12 0 0 0-3.75 16.56l82.34 130.42-83.45 132.78a12 12 0 0 0-1.84 6.39 12 12 0 0 0 12 12h34.46a12 12 0 0 0 10.21-5.7l62.7-101.47 62.3 101.45a12 12 0 0 0 10.23 5.72h37.48a12 12 0 0 0 6.48-1.9 12 12 0 0 0 3.62-16.58l-83.83-130.55 85.3-132.47a12 12 0 0 0 1.9-6.5 12 12 0 0 0-12-12h-35.7a12 12 0 0 0-10.29 5.84z"></path></svg>
                        </div>

                        <div className="upload-schedule-file-info">
                            <p className="upload-schedule-file-name">{file.name}</p>
                            <span className="upload-schedule-file-status">
                                {file.name.endsWith(".csv") ? "CSV" : "EXCEL"} • CARGADO
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="upload-schedule-remove"
                        onClick={handleRemoveFile}
                    >
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z"></path></g></svg>
                    </button>
                </div>
            )}
        </div>
    )
}
