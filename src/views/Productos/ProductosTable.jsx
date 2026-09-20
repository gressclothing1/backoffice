import { useRef, useState } from 'react';
import { getProductos, updateProducto } from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import EliminarProductoModal from './EliminarProductoModal';
import StockPopover from './StockPopover';
import './ProductosTable.css';

function ordenar(productos) {
  return [...productos].sort(
    (a, b) => a.nombre.localeCompare(b.nombre) || a.color.localeCompare(b.color) || a.talle.localeCompare(b.talle)
  );
}

function fetchProductosOrdenados() {
  return getProductos().then(ordenar);
}

function filtrar(productos, filtros) {
  const producto = filtros.producto.trim().toLowerCase();
  const color = filtros.color.trim().toLowerCase();
  return productos.filter((p) => {
    if (producto && !`${p.categoria} ${p.nombre}`.toLowerCase().includes(producto)) return false;
    if (filtros.talle && p.talle !== filtros.talle) return false;
    if (color && !p.color.toLowerCase().includes(color)) return false;
    return true;
  });
}

export default function ProductosTable({ refreshKey, onEditar, filtros = { producto: '', talle: '', color: '' } }) {
  const [localRefresh, setLocalRefresh] = useState(0);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [editandoStockId, setEditandoStockId] = useState(null);
  const [guardandoStock, setGuardandoStock] = useState(false);
  const [errorStock, setErrorStock] = useState(null);
  const anchorStockRef = useRef(null);
  const { data: productos, error, loading } = useFetch(fetchProductosOrdenados, [refreshKey, localRefresh]);

  function onEliminado() {
    setProductoAEliminar(null);
    setLocalRefresh((k) => k + 1);
  }

  function abrirEditorStock(producto) {
    setEditandoStockId(producto.id);
    setErrorStock(null);
  }

  function cerrarEditorStock() {
    setEditandoStockId(null);
    setErrorStock(null);
  }

  async function guardarStock(producto, nuevoStock) {
    setGuardandoStock(true);
    setErrorStock(null);
    try {
      await updateProducto(producto.id, { stock: nuevoStock });
      cerrarEditorStock();
      setLocalRefresh((k) => k + 1);
    } catch (err) {
      setErrorStock(err.message);
    } finally {
      setGuardandoStock(false);
    }
  }

  function onAgregarStock(producto, valorTexto) {
    const delta = parseInt(valorTexto, 10);
    if (Number.isNaN(delta)) { setErrorStock('Ingresá un número válido.'); return; }
    guardarStock(producto, producto.stock + delta);
  }

  function onReemplazarStock(producto, valorTexto) {
    const nuevo = parseInt(valorTexto, 10);
    if (Number.isNaN(nuevo)) { setErrorStock('Ingresá un número válido.'); return; }
    guardarStock(producto, nuevo);
  }

  if (loading) return <p className="status">Cargando productos…</p>;
  if (error) return <p className="status error">Error al cargar productos: {error}</p>;

  const hayFiltrosActivos = Boolean(filtros.producto || filtros.talle || filtros.color);
  const productosFiltrados = filtrar(productos, filtros);

  if (!productos.length || (hayFiltrosActivos && !productosFiltrados.length)) {
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
        <p className="tabla-vacia-titulo">
          {hayFiltrosActivos ? 'No encontramos productos con esos filtros.' : 'No encontramos productos registrados.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="table-productos">
        <colgroup>
          <col style={{ width: '130px' }} />
          <col style={{ width: '70px' }} />
          <col style={{ width: '90px' }} />
          <col style={{ width: '80px' }} />
          <col style={{ width: '104px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Talle</th>
            <th>Color</th>
            <th className="col-sticky-stock">Stock</th>
            <th className="col-sticky-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosFiltrados.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.categoria} {producto.nombre}</td>
              <td>
                <span className="badge talle">{producto.talle}</span>
              </td>
              <td>{producto.color}</td>
              <td className="col-sticky-stock">
                <div className="stock-celda">
                  <span ref={producto.id === editandoStockId ? anchorStockRef : undefined}>{producto.stock}</span>
                  <button
                    type="button"
                    className="btn-icono-mini"
                    onClick={() => abrirEditorStock(producto)}
                    aria-label="Editar stock"
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                      <path d="M4 5.5h5M6.5 3v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      <path d="M4 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                {editandoStockId === producto.id && (
                  <StockPopover
                    anchorRef={anchorStockRef}
                    onAgregar={(v) => onAgregarStock(producto, v)}
                    onReemplazar={(v) => onReemplazarStock(producto, v)}
                    onCerrar={cerrarEditorStock}
                    enviando={guardandoStock}
                    error={errorStock}
                  />
                )}
              </td>
              <td className="col-sticky-acciones">
                <div className="fila-acciones">
                  <button type="button" className="btn-icono" onClick={() => onEditar?.(producto)} aria-label="Editar">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
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
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
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
