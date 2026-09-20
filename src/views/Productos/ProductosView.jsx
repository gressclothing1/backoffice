import { useState } from 'react';
import ProductoForm from './ProductoForm';
import ProductosTable from './ProductosTable';
import './ProductosView.css';

export default function ProductosView() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function cerrarForm() {
    setMostrarForm(false);
    setProductoEditando(null);
  }

  function onCreated() {
    setRefreshKey((k) => k + 1);
    cerrarForm();
  }

  function editar(producto) {
    setProductoEditando(producto);
    setMostrarForm(true);
  }

  if (mostrarForm) {
    return (
      <ProductoForm
        titulo={productoEditando ? 'Editar producto' : 'Nuevo producto'}
        productoEditando={productoEditando}
        onCerrar={cerrarForm}
        onCreated={onCreated}
        onCancelar={cerrarForm}
      />
    );
  }

  return (
    <div>
      <h2>Productos</h2>
      <button type="button" className="btn-crear-producto" onClick={() => setMostrarForm(true)}>
        + Crear producto
      </button>
      <ProductosTable refreshKey={refreshKey} onEditar={editar} />
    </div>
  );
}
