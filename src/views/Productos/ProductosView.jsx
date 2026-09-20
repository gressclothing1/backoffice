import { useState } from 'react';
import ProductoForm from './ProductoForm';
import ProductosTable from './ProductosTable';
import './ProductosView.css';

export default function ProductosView() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function cerrarForm() {
    setMostrarForm(false);
  }

  function onCreated() {
    setRefreshKey((k) => k + 1);
    cerrarForm();
  }

  if (mostrarForm) {
    return (
      <div className="productos-form-screen">
        <div className="productos-form-screen-header">
          <h3>Nuevo producto</h3>
          <button type="button" className="btn-cerrar-form" onClick={cerrarForm} aria-label="Cerrar">
            ×
          </button>
        </div>
        <ProductoForm onCreated={onCreated} onCancelar={cerrarForm} />
      </div>
    );
  }

  return (
    <div>
      <button type="button" className="btn-crear-producto" onClick={() => setMostrarForm(true)}>
        + Crear producto
      </button>
      <ProductosTable refreshKey={refreshKey} />
    </div>
  );
}
