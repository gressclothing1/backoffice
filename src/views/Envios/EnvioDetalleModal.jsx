import { useState } from 'react';
import { updateEnvio } from '../../lib/api';
import { ESTADOS_ENVIO } from '../../lib/constants';
import Select from '../../components/Select';
import { useToast } from '../../components/ToastProvider';
import '../../components/Modal.css';
import './EnvioDetalleModal.css';

const OPCIONES_PAGADO = ['Sí', 'No'];

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short' }).format(new Date(value));
}

export default function EnvioDetalleModal({ envio, onCerrar, onActualizado }) {
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [guardandoPagado, setGuardandoPagado] = useState(false);
  const [comentarios, setComentarios] = useState(envio.comentarios || '');
  const { showSuccess, showError } = useToast();

  async function cambiarEstado(estado) {
    if (estado === envio.estado) return;
    setGuardandoEstado(true);
    try {
      const cambios = { estado };
      if (estado === 'Enviado' && !envio.fechaEnvio) cambios.fechaEnvio = new Date().toISOString();
      if (estado === 'Entregado' && !envio.fechaEntrega) cambios.fechaEntrega = new Date().toISOString();
      await updateEnvio(envio.id, cambios);
      showSuccess('Estado del envío actualizado.');
      onActualizado?.({ ...envio, ...cambios });
    } catch (err) {
      showError(err.message);
    } finally {
      setGuardandoEstado(false);
    }
  }

  async function cambiarPagado(opcion) {
    const pagado = opcion === 'Sí';
    if (pagado === envio.pagado) return;
    setGuardandoPagado(true);
    try {
      await updateEnvio(envio.id, { pagado });
      showSuccess('Pagado actualizado.');
      onActualizado?.({ ...envio, pagado });
    } catch (err) {
      showError(err.message);
    } finally {
      setGuardandoPagado(false);
    }
  }

  async function guardarComentarios() {
    if (comentarios === (envio.comentarios || '')) return;
    try {
      await updateEnvio(envio.id, { comentarios });
      showSuccess('Comentarios actualizados.');
      onActualizado?.({ ...envio, comentarios });
    } catch (err) {
      showError(err.message);
    }
  }

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
            <Select
              value={envio.estado}
              onChange={cambiarEstado}
              options={ESTADOS_ENVIO}
              disabled={guardandoEstado}
            />
          </div>
          <div>
            <span className="detalle-envio-label">Destino</span>
            <p>{envio.destino || '—'}</p>
          </div>
          <div>
            <span className="detalle-envio-label">Fecha creación</span>
            <p>{formatDate(envio.fechaCreacion)}</p>
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
            <Select
              value={envio.pagado ? 'Sí' : 'No'}
              onChange={cambiarPagado}
              options={OPCIONES_PAGADO}
              disabled={guardandoPagado}
            />
          </div>
          <div>
            <span className="detalle-envio-label">Link de seguimiento</span>
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
          <div className="detalle-envio-fila-completa">
            <span className="detalle-envio-label">Comentarios</span>
            <textarea
              className="detalle-envio-comentarios"
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              onBlur={guardarComentarios}
              placeholder="Sin comentarios"
              rows={3}
            />
          </div>
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
