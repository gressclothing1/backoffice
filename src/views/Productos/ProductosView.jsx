import { useState } from 'react';
import { getProductos } from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import ProductoForm from './ProductoForm';
import ProductosTable from './ProductosTable';
import FiltrosProductos from './FiltrosProductos';
import './ProductosView.css';

function ordenar(productos) {
  return [...productos].sort(
    (a, b) => a.nombre.localeCompare(b.nombre) || a.color.localeCompare(b.color) || a.talle.localeCompare(b.talle)
  );
}

function fetchProductosOrdenados() {
  return getProductos().then(ordenar);
}

const FILTROS_VACIOS = { categoria: '', nombre: '', talle: '', color: '' };

export default function ProductosView() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [productoEditando, setProductoEditando] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const { data: productos, error, loading } = useFetch(fetchProductosOrdenados, [refreshKey]);

  function refrescar() {
    setRefreshKey((k) => k + 1);
  }

  function cerrarForm() {
    setMostrarForm(false);
    setProductoEditando(null);
  }

  function onCreated() {
    refrescar();
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
        <FiltrosProductos productos={productos || []} onChange={setFiltros} />
      </div>
      <ProductosTable
        productos={productos}
        loading={loading}
        error={error}
        onEditar={editar}
        onCambio={refrescar}
        filtros={filtros}
      />
    </div>
  );
}
