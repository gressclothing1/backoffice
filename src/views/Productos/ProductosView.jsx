import { useState } from 'react';
import ProductoForm from './ProductoForm';
import ProductosTable from './ProductosTable';
import FiltrosProductos from './FiltrosProductos';
import './ProductosView.css';

export default function ProductosView() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filtros, setFiltros] = useState({ producto: '', talle: '', color: '' });

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
      <div className="productos-toolbar">
        <button type="button" className="btn-crear-producto" onClick={() => setMostrarForm(true)}>
          + Crear producto
        </button>
        <FiltrosProductos onChange={setFiltros} />
      </div>
      <ProductosTable refreshKey={refreshKey} onEditar={editar} filtros={filtros} />
    </div>
  );
}
