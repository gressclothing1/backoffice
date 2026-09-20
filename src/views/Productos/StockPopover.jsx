import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './StockPopover.css';

export default function StockPopover({ anchorRef, onAgregar, onReemplazar, onCerrar, enviando, error }) {
  const [valor, setValor] = useState('');
  const [pos, setPos] = useState(null);
  const [confirmandoReemplazo, setConfirmandoReemplazo] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function calcularPosicion() {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPos({ left: rect.left + rect.width / 2, bottom: window.innerHeight - rect.top + 8 });
    }
    calcularPosicion();
    window.addEventListener('resize', calcularPosicion);
    window.addEventListener('scroll', calcularPosicion, true);
    return () => {
      window.removeEventListener('resize', calcularPosicion);
      window.removeEventListener('scroll', calcularPosicion, true);
    };
  }, [anchorRef]);

  useEffect(() => {
    function onClickFuera(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onCerrar();
      }
    }
    function onEscape(e) {
      if (e.key === 'Escape') onCerrar();
    }
    document.addEventListener('mousedown', onClickFuera);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickFuera);
      document.removeEventListener('keydown', onEscape);
    };
  }, [anchorRef, onCerrar]);

  function onChange(e) {
    const v = e.target.value;
    if (/^-?\d*$/.test(v)) setValor(v);
  }

  if (!pos) return null;

  if (confirmandoReemplazo) {
    return createPortal(
      <div className="stock-popover" ref={popoverRef} style={{ left: pos.left, bottom: pos.bottom }}>
        <p className="stock-popover-confirmacion">¿Estás seguro que desea reemplazar?</p>
        {error && <span className="status error">{error}</span>}
        <div className="stock-popover-acciones">
          <button type="button" className="btn-reemplazar" onClick={() => onReemplazar(valor)} disabled={enviando}>
            Sí, reemplazar
          </button>
          <button type="button" className="btn-volver" onClick={() => setConfirmandoReemplazo(false)} disabled={enviando}>
            Cancelar
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="stock-popover" ref={popoverRef} style={{ left: pos.left, bottom: pos.bottom }}>
      <input type="text" inputMode="numeric" value={valor} onChange={onChange} placeholder="0" autoFocus />
      {error && <span className="status error">{error}</span>}
      <div className="stock-popover-acciones">
        <button type="button" className="btn-agregar" onClick={() => onAgregar(valor)} disabled={enviando || valor === ''}>
          Agregar
        </button>
        <button
          type="button"
          className="btn-reemplazar"
          onClick={() => setConfirmandoReemplazo(true)}
          disabled={enviando || valor === ''}
        >
          Reemplazar
        </button>
      </div>
    </div>,
    document.body
  );
}
