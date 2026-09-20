const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

async function request(path) {
  const headers = API_KEY ? { 'x-api-key': API_KEY } : undefined;
  const response = await fetch(`${BASE_URL}/api/${path}`, { headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Error al pedir ${path} (${response.status})`);
  }
  return response.json();
}

export function getEnvios() {
  return request('envios');
}

export function getProductos() {
  return request('productos');
}

export function getClientes() {
  return request('clientes');
}
