import { useEffect, useMemo, useRef, useState } from 'react';
import { updateProducto } from '../../lib/api';
import EliminarProductoModal from './EliminarProductoModal';
import StockPopover from './StockPopover';
import './ProductosTable.css';

const POR_PAGINA = 8;

function filtrar(productos, filtros) {
  return productos.filter((p) => {
    if (filtros.categoria && p.categoria !== filtros.categoria) return false;
    if (filtros.nombre && p.nombre !== filtros.nombre) return false;
    if (filtros.talle && p.talle !== filtros.talle) return false;
    if (filtros.color && p.color !== filtros.color) return false;
    return true;
  });
}

export default function ProductosTable({
  productos,
  loading,
  error,
  onEditar,
  onCambio,
  componentes = [],
  filtros = { categoria: '', nombre: '', talle: '', color: '' }
}) {
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [editandoStockId, setEditandoStockId] = useState(null);
  const [guardandoStock, setGuardandoStock] = useState(false);
  const [errorStock, setErrorStock] = useState(null);
  const [pagina, setPagina] = useState(1);
  const anchorStockRef = useRef(null);

  useEffect(() => {
    setPagina(1);
  }, [filtros]);

  const componentesPorConjunto = useMemo(() => {
    const mapa = {};
    componentes.forEach((c) => {
      (mapa[c.conjuntoNombre] ||= []).push(c.productoNombre);
    });
    return mapa;
  }, [componentes]);

  function stockMostrado(producto) {
    if (producto.categoria !== 'Conjunto') return producto.stock;
    const nombresComponentes = componentesPorConjunto[producto.nombre] || [];
    if (nombresComponentes.length === 0) return producto.stock;
    const stocks = nombresComponentes.map((nombre) => {
      const variante = productos.find((p) => p.nombre === nombre && p.talle === producto.talle && p.color === producto.color);
      return variante ? variante.stock : 0;
    });
    return Math.min(...stocks);
  }

  function onEliminado() {
    setProductoAEliminar(null);
    onCambio();
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
      onCambio();
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

  const hayFiltrosActivos = Boolean(filtros.categoria || filtros.nombre || filtros.talle || filtros.color);
  const productosFiltrados = filtrar(productos, filtros);
  const ocultarProducto = Boolean(filtros.nombre);
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const productosPagina = productosFiltrados.slice((paginaSegura - 1) * POR_PAGINA, paginaSegura * POR_PAGINA);

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
    <div>
      <div className="table-wrap">
      <table className="table-productos">
        <colgroup>
          {!ocultarProducto && <col style={{ width: '130px' }} />}
          <col style={{ width: '92px' }} />
          <col style={{ width: '90px' }} />
          <col style={{ width: '80px' }} />
          <col style={{ width: '104px' }} />
        </colgroup>
        <thead>
          <tr>
            {!ocultarProducto && <th>Producto</th>}
            <th>Talle</th>
            <th>Color</th>
            <th className="col-sticky-stock">Stock</th>
            <th className="col-sticky-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productosPagina.map((producto) => (
            <tr key={producto.id}>
              {!ocultarProducto && (
                <td>
                  {producto.categoria} {producto.nombre}
                </td>
              )}
              <td>
                <span className="badge talle">{producto.talle}</span>
              </td>
              <td>{producto.color}</td>
              <td className="col-sticky-stock">
                <div className="stock-celda">
                  <span ref={producto.id === editandoStockId ? anchorStockRef : undefined}>{stockMostrado(producto)}</span>
                  {producto.categoria !== 'Conjunto' && (
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
                  )}
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
                  <button
                    type="button"
                    className="btn-icono"
                    onClick={() => onEditar?.(producto, productos.filter((p) => p.nombre === producto.nombre))}
                    aria-label="Editar"
                  >
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
      </div>

      {totalPaginas > 1 && (
        <div className="paginador">
          <button
            type="button"
            className="paginador-flecha"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={paginaSegura === 1}
            aria-label="Página anterior"
          >
            ‹
          </button>
          <span className="paginador-info">
            Página {paginaSegura} de {totalPaginas}
          </span>
          <button
            type="button"
            className="paginador-flecha"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaSegura === totalPaginas}
            aria-label="Página siguiente"
          >
            ›
          </button>
        </div>
      )}

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
