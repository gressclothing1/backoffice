import { useEffect, useRef, useState } from 'react';
import { TALLES } from '../../lib/constants';
import Select from '../../components/Select';
import './FiltrosProductos.css';

const TODOS = 'Todos';
const VACIO = { producto: '', talle: '', color: '' };

export default function FiltrosProductos({ onChange }) {
  const [abierto, setAbierto] = useState(false);
  const [producto, setProducto] = useState('');
  const [talle, setTalle] = useState('');
  const [color, setColor] = useState('');
  const [aplicados, setAplicados] = useState(VACIO);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, [abierto]);

  const hayFiltrosActivos = Boolean(aplicados.producto || aplicados.talle || aplicados.color);

  function aplicar() {
    const nuevos = { producto, talle, color };
    setAplicados(nuevos);
    onChange(nuevos);
    setAbierto(false);
  }

  function limpiarFiltros() {
    setProducto('');
    setTalle('');
    setColor('');
    setAplicados(VACIO);
    onChange(VACIO);
  }

  return (
    <div className="filtros-productos" ref={rootRef}>
      <button
        type="button"
        className={`btn-filtrar ${hayFiltrosActivos ? 'activo' : ''}`}
        onClick={() => setAbierto((o) => !o)}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 3h12l-4.5 5.5V13l-3 1.5V8.5L2 3Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
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
          <button type="button" className="btn-aplicar-filtros" onClick={aplicar}>
            Aplicar
          </button>
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
