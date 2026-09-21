import { useState } from 'react';
import { deleteProducto } from '../../lib/api';
import { useToast } from '../../components/ToastProvider';
import './EliminarProductoModal.css';

export default function EliminarProductoModal({ producto, variantesDelMismoNombre, onCerrar, onEliminado }) {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();

  async function eliminarSoloEsta() {
    setEnviando(true);
    setError(null);
    try {
      await deleteProducto(producto.id);
      showSuccess('Variante eliminada.');
      onEliminado();
    } catch (err) {
      setError(err.message);
      showError(err.message);
      setEnviando(false);
    }
  }

  async function eliminarTodas() {
    setEnviando(true);
    setError(null);
    try {
      await Promise.all(variantesDelMismoNombre.map((v) => deleteProducto(v.id)));
      showSuccess(
        variantesDelMismoNombre.length === 1 ? 'Producto eliminado.' : `${variantesDelMismoNombre.length} variantes eliminadas.`
      );
      onEliminado();
    } catch (err) {
      setError(err.message);
      showError(err.message);
      setEnviando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>Eliminar producto</h3>
        <p>
          {producto.categoria} {producto.nombre} tiene {variantesDelMismoNombre.length}{' '}
          {variantesDelMismoNombre.length === 1 ? 'variante' : 'variantes'} de talle y color. Elegí si querés eliminar
          únicamente esta variante (<strong>{producto.talle} · {producto.color}</strong>) o todas las variantes de{' '}
          {producto.categoria} {producto.nombre}.
        </p>

        {error && <p className="status error">{error}</p>}

        <div className="modal-acciones">
          <button type="button" className="modal-btn modal-btn-peligro" onClick={eliminarTodas} disabled={enviando}>
            Eliminar todos ({variantesDelMismoNombre.length})
          </button>
          <button type="button" className="modal-btn modal-btn-peligro-suave" onClick={eliminarSoloEsta} disabled={enviando}>
            Eliminar solo esta variante ({producto.talle} · {producto.color})
          </button>
          <button type="button" className="modal-btn" onClick={onCerrar} disabled={enviando}>
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
