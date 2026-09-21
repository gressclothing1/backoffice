const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_API_KEY;

async function request(path, options = {}) {
  const headers = { ...(API_KEY ? { 'x-api-key': API_KEY } : {}), ...options.headers };
  const response = await fetch(`${BASE_URL}/api/${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Error al pedir ${path} (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function requestJson(method, path, data) {
  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
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

export function createProducto(producto) {
  return requestJson('POST', 'productos', producto);
}

export function updateProducto(id, producto) {
  return requestJson('PATCH', `productos/${id}`, producto);
}

export function deleteProducto(id) {
  return request(`productos/${id}`, { method: 'DELETE' });
}

export function createImagen(imagen) {
  return requestJson('POST', 'imagenes', imagen);
}

export function getComponentes() {
  return request('componentes');
}

export function createComponente(componente) {
  return requestJson('POST', 'componentes', componente);
}

export function deleteComponente(id) {
  return request(`componentes/${id}`, { method: 'DELETE' });
}

export async function uploadImagen(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { url } = await request('uploads/imagen', { method: 'POST', body: formData });
  return url;
}
