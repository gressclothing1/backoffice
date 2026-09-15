const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path) {
  const response = await fetch(`${BASE_URL}/api/${path}`);
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
