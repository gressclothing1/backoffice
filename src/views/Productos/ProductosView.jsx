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

  function quitarFiltro(campo) {
    setFiltros((f) => {
      if (campo === 'categoria') return { ...f, categoria: '', nombre: '', talle: '', color: '' };
      if (campo === 'nombre') return { ...f, nombre: '', talle: '', color: '' };
      return { ...f, [campo]: '' };
    });
  }

  function quitarTodosLosFiltros() {
    setFiltros(FILTROS_VACIOS);
  }

  const hayFiltrosActivos = Boolean(filtros.categoria || filtros.nombre || filtros.talle || filtros.color);

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
        <FiltrosProductos productos={productos || []} filtros={filtros} onChange={setFiltros} />
      </div>

      {hayFiltrosActivos && (
        <div className="filtros-chips">
          {filtros.categoria && (
            <span className="chip">
              Categoría: {filtros.categoria}
              <button type="button" onClick={() => quitarFiltro('categoria')} aria-label="Quitar filtro de categoría">
                ×
              </button>
            </span>
          )}
          {filtros.nombre && (
            <span className="chip">
              Nombre: {filtros.nombre}
              <button type="button" onClick={() => quitarFiltro('nombre')} aria-label="Quitar filtro de nombre">
                ×
              </button>
            </span>
          )}
          {filtros.talle && (
            <span className="chip">
              Talle: {filtros.talle}
              <button type="button" onClick={() => quitarFiltro('talle')} aria-label="Quitar filtro de talle">
                ×
              </button>
            </span>
          )}
          {filtros.color && (
            <span className="chip">
              Color: {filtros.color}
              <button type="button" onClick={() => quitarFiltro('color')} aria-label="Quitar filtro de color">
                ×
              </button>
            </span>
          )}
          <button type="button" className="chip-quitar-todos" onClick={quitarTodosLosFiltros}>
            Quitar todos
          </button>
        </div>
      )}

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
