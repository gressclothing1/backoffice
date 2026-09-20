import { useEffect, useRef, useState } from 'react';
import { TALLES } from '../../lib/constants';
import Select from '../../components/Select';
import './FiltrosProductos.css';

const TODOS = 'Todos';

export default function FiltrosProductos({ onChange }) {
  const [abierto, setAbierto] = useState(false);
  const [producto, setProducto] = useState('');
  const [talle, setTalle] = useState('');
  const [color, setColor] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    onChange({ producto, talle, color });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto, talle, color]);

  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, [abierto]);

  const hayFiltrosActivos = Boolean(producto || talle || color);

  function limpiarFiltros() {
    setProducto('');
    setTalle('');
    setColor('');
  }

  return (
    <div className="filtros-productos" ref={rootRef}>
      <button
        type="button"
        className={`btn-filtrar ${hayFiltrosActivos ? 'activo' : ''}`}
        onClick={() => setAbierto((o) => !o)}
      >
        Filtrar{hayFiltrosActivos ? ' ●' : ''}
      </button>

      {abierto && (
        <div className="filtros-panel">
          <label className="filtro-campo">
            Producto
            <input
              value={producto}
              onChange={(e) => setProducto(e.target.value)}
              placeholder="Buscar por nombre o categoría"
            />
          </label>
          <label className="filtro-campo">
            Talle
            <Select
              value={talle || TODOS}
              onChange={(v) => setTalle(v === TODOS ? '' : v)}
              options={[TODOS, ...TALLES]}
            />
          </label>
          <label className="filtro-campo">
            Color
            <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Buscar por color" />
          </label>
          {hayFiltrosActivos && (
            <button type="button" className="btn-limpiar-filtros" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
