import '../../components/Modal.css';
import './EnvioDetalleModal.css';

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  en_transito: 'En tránsito',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS'
});

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(new Date(value));
}

export default function EnvioDetalleModal({ envio, onCerrar }) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box-header">
          <h3>{envio.cliente?.nombre || 'Cliente eliminado'}</h3>
          <button type="button" className="btn-cerrar-modal" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="detalle-envio-grid">
          <div>
            <span className="detalle-envio-label">Estado</span>
            <span className={`badge estado-${envio.estado}`}>{ESTADO_LABELS[envio.estado] || envio.estado}</span>
          </div>
          <div>
            <span className="detalle-envio-label">Destino</span>
            <p>{envio.destino || '—'}</p>
          </div>
          <div>
            <span className="detalle-envio-label">Fecha envío</span>
            <p>{formatDate(envio.fechaEnvio)}</p>
          </div>
          <div>
            <span className="detalle-envio-label">Fecha entrega</span>
            <p>{formatDate(envio.fechaEntrega)}</p>
          </div>
          <div>
            <span className="detalle-envio-label">Pagado</span>
            <span className={`badge ${envio.pagado ? 'pagado-si' : 'pagado-no'}`}>{envio.pagado ? 'Sí' : 'No'}</span>
          </div>
          <div>
            <span className="detalle-envio-label">Monto</span>
            <p>{currencyFormatter.format(envio.monto || 0)}</p>
          </div>
          <div>
            <span className="detalle-envio-label">Seguimiento</span>
            <p>
              {envio.linkSeguimiento ? (
                <a href={envio.linkSeguimiento} target="_blank" rel="noreferrer">
                  Ver link
                </a>
              ) : (
                '—'
              )}
            </p>
          </div>
          {envio.comentarios && (
            <div>
              <span className="detalle-envio-label">Comentarios</span>
              <p>{envio.comentarios}</p>
            </div>
          )}
        </div>

        <div className="modal-acciones">
          <button type="button" className="modal-btn" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
