import { useState } from 'react';
import { getProductos } from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import EliminarProductoModal from './EliminarProductoModal';
import './ProductosTable.css';

function ordenar(productos) {
  return [...productos].sort(
    (a, b) => a.nombre.localeCompare(b.nombre) || a.color.localeCompare(b.color) || a.talle.localeCompare(b.talle)
  );
}

function fetchProductosOrdenados() {
  return getProductos().then(ordenar);
}

export default function ProductosTable({ refreshKey, onEditar }) {
  const [localRefresh, setLocalRefresh] = useState(0);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const { data: productos, error, loading } = useFetch(fetchProductosOrdenados, [refreshKey, localRefresh]);

  function onEliminado() {
    setProductoAEliminar(null);
    setLocalRefresh((k) => k + 1);
  }

  if (loading) return <p className="status">Cargando productos…</p>;
  if (error) return <p className="status error">Error al cargar productos: {error}</p>;
  if (!productos.length) {
    return (
      <div className="tabla-vacia">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path
            d="M12 26 36 14l24 12M12 26v32l24 12 24-12V26M12 26l24 12 24-12M36 38v32"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M27 45 18 40.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="tabla-vacia-titulo">No encontramos productos</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Talle</th>
            <th>Color</th>
            <th className="col-sticky-stock">Stock</th>
            <th className="col-sticky-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{producto.categoria}</td>
              <td>
                <span className="badge talle">{producto.talle}</span>
              </td>
              <td>{producto.color}</td>
              <td className="col-sticky-stock">{producto.stock}</td>
              <td className="col-sticky-acciones">
                <div className="fila-acciones">
                  <button type="button" className="btn-icono" onClick={() => onEditar?.(producto)} aria-label="Editar">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M11.3 2.3a1.5 1.5 0 0 1 2.1 2.1L5.6 12.2l-3 .8.8-3 7.9-7.7Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="btn-icono btn-icono-eliminar"
                    onClick={() => setProductoAEliminar(producto)}
                    aria-label="Eliminar"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 4.2h10M6.3 4.2V2.7a.6.6 0 0 1 .6-.6h2.2a.6.6 0 0 1 .6.6v1.5M4.6 4.2l.6 8.8a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.6-8.8"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {productoAEliminar && (
        <EliminarProductoModal
          producto={productoAEliminar}
          variantesDelMismoNombre={productos.filter((p) => p.nombre === productoAEliminar.nombre)}
          onCerrar={() => setProductoAEliminar(null)}
          onEliminado={onEliminado}
        />
      )}
    </div>
  );
}
