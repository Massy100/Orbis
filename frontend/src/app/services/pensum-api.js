import GLOBAL_API_URL from './global-api-url';

const API_BASE = GLOBAL_API_URL;

// Function to upload a pensum file

export async function uploadPensum(file, type, onStep = (msg) => {}) {
  if (!file) throw new Error("Archivo requerido");

  onStep("Enviando archivo al servidor…");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const res = await fetch(`${API_BASE}pensum/upload/`, {
    method: "POST",
    body: formData,
  });

  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }

  if (!res.ok) {
    throw new Error(
      data?.error ||
      data?.detail ||
      `Server error: ${res.status}`
    );
  }

  return data;
}