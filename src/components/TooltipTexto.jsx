import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './TooltipTexto.css';

export default function TooltipTexto({ texto }) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState(null);
  const anchorRef = useRef(null);
  const popoverRef = useRef(null);

  function toggle() {
    if (abierto) {
      setAbierto(false);
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ left: rect.left, top: rect.bottom + 6 });
    setAbierto(true);
  }

  useEffect(() => {
    if (!abierto) return;
    function onClickFuera(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        setAbierto(false);
      }
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

  return (
    <>
      <span ref={anchorRef} className="tooltip-texto-trigger" onClick={toggle} title={texto}>
        {texto}
      </span>
      {abierto &&
        pos &&
        createPortal(
          <div ref={popoverRef} className="tooltip-texto-popover" style={{ left: pos.left, top: pos.top }}>
            {texto}
          </div>,
          document.body
        )}
    </>
  );
}
