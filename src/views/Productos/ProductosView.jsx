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
    return <ProductoForm titulo="Nuevo producto" onCerrar={cerrarForm} onCreated={onCreated} onCancelar={cerrarForm} />;
  }

  return (
    <div>
      <h2>Productos</h2>
      <button type="button" className="btn-crear-producto" onClick={() => setMostrarForm(true)}>
        + Crear producto
      </button>
      <ProductosTable refreshKey={refreshKey} />
    </div>
  );
}
