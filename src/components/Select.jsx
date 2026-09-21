import { useEffect, useRef, useState } from 'react';
import './Select.css';

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Elegir…',
  disabled = false,
  searchable = false
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const rootRef = useRef(null);
  const buscarRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setAbierto(false);
    }
    function onEscape(e) {
      if (e.key === 'Escape') setAbierto(false);
    }
    document.addEventListener('mousedown', onClickFuera);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickFuera);
      document.removeEventListener('keydown', onEscape);
    };
  }, [abierto]);

  useEffect(() => {
    if (abierto) {
      setBusqueda('');
      if (searchable) requestAnimationFrame(() => buscarRef.current?.focus());
    }
  }, [abierto, searchable]);

  function elegir(opcion) {
    onChange(opcion);
    setAbierto(false);
  }

  const opcionesFiltradas =
    searchable && busqueda.trim()
      ? options.filter((o) => o.toLowerCase().includes(busqueda.trim().toLowerCase()))
      : options;

  return (
    <div className="custom-select" ref={rootRef}>
      <button
        type="button"
        className={`custom-select-trigger ${abierto ? 'abierto' : ''}`}
        onClick={() => !disabled && setAbierto((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={abierto}
      >
        <span className={value ? '' : 'custom-select-placeholder'}>{value || placeholder}</span>
        <svg className="custom-select-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {abierto && (
        <div className="custom-select-dropdown">
          {searchable && (
            <input
              ref={buscarRef}
              type="text"
              className="custom-select-buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar…"
            />
          )}
          <ul className="custom-select-options" role="listbox">
            {opcionesFiltradas.length === 0 && (
              <li className="custom-select-sin-resultados">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="9.5" cy="9.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M14.2 14.2 19 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M7 9.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Sin resultados
              </li>
            )}
            {opcionesFiltradas.map((opcion) => (
              <li
                key={opcion}
                role="option"
                aria-selected={opcion === value}
                className={`custom-select-option ${opcion === value ? 'seleccionada' : ''}`}
                onClick={() => elegir(opcion)}
              >
                {opcion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
