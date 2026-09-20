import { useEffect, useRef, useState } from 'react';
import './Select.css';

export default function Select({ value, onChange, options, placeholder = 'Elegir…', disabled = false }) {
  const [abierto, setAbierto] = useState(false);
  const rootRef = useRef(null);

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

  function elegir(opcion) {
    onChange(opcion);
    setAbierto(false);
  }

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
        <ul className="custom-select-options" role="listbox">
          {options.map((opcion) => (
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
      )}
    </div>
  );
}
