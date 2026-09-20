import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIAS } from '../../lib/constants';
import Select from '../../components/Select';
import './FiltrosProductos.css';

const TODOS = 'Todos';
const VACIO = { categoria: '', nombre: '', talle: '', color: '' };

export default function FiltrosProductos({ productos, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [nombre, setNombre] = useState('');
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

  const nombresDisponibles = useMemo(() => {
    const relevantes = categoria ? productos.filter((p) => p.categoria === categoria) : productos;
    return [...new Set(relevantes.map((p) => p.nombre))].sort();
  }, [productos, categoria]);

  const variantesDelNombre = useMemo(() => {
    if (!nombre) return [];
    return productos.filter((p) => p.nombre === nombre && (!categoria || p.categoria === categoria));
  }, [productos, nombre, categoria]);

  const tallesDisponibles = useMemo(
    () => [...new Set(variantesDelNombre.map((p) => p.talle))].sort(),
    [variantesDelNombre]
  );
  const coloresDisponibles = useMemo(
    () => [...new Set(variantesDelNombre.map((p) => p.color))].sort(),
    [variantesDelNombre]
  );

  const hayFiltrosActivos = Boolean(aplicados.categoria || aplicados.nombre || aplicados.talle || aplicados.color);
  const hayNombre = Boolean(nombre);

  function actualizarCategoria(v) {
    setCategoria(v === TODOS ? '' : v);
    setNombre('');
    setTalle('');
    setColor('');
  }

  function actualizarNombre(v) {
    setNombre(v === TODOS ? '' : v);
    setTalle('');
    setColor('');
  }

  function aplicar() {
    const nuevos = { categoria, nombre, talle, color };
    setAplicados(nuevos);
    onChange(nuevos);
    setAbierto(false);
  }

  function limpiarFiltros() {
    setCategoria('');
    setNombre('');
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
          <div className="filtro-campo">
            Categoría
            <Select value={categoria || TODOS} onChange={actualizarCategoria} options={[TODOS, ...CATEGORIAS]} />
          </div>
          <div className="filtro-campo">
            Nombre
            <Select value={nombre || TODOS} onChange={actualizarNombre} options={[TODOS, ...nombresDisponibles]} />
          </div>
          <div className="filtro-campo">
            Talle
            <Select
              value={talle || TODOS}
              onChange={(v) => setTalle(v === TODOS ? '' : v)}
              options={[TODOS, ...tallesDisponibles]}
              disabled={!hayNombre}
            />
          </div>
          <div className="filtro-campo">
            Color
            <Select
              value={color || TODOS}
              onChange={(v) => setColor(v === TODOS ? '' : v)}
              options={[TODOS, ...coloresDisponibles]}
              disabled={!hayNombre}
            />
          </div>
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
