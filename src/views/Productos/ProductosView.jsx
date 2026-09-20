import { useState } from 'react';
import ProductoForm from './ProductoForm';
import ProductosTable from './ProductosTable';
import './ProductosView.css';

export default function ProductosView() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function onCreated() {
    setRefreshKey((k) => k + 1);
    setMostrarForm(false);
  }

  return (
    <div>
      {!mostrarForm && (
        <button type="button" className="btn-crear-producto" onClick={() => setMostrarForm(true)}>
          + Crear producto
        </button>
      )}

      {mostrarForm && <ProductoForm onCreated={onCreated} onCancelar={() => setMostrarForm(false)} />}

      <ProductosTable refreshKey={refreshKey} />
    </div>
  );
}
