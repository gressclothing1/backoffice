import { useState } from 'react';
import { updateEnvio } from '../../lib/api';
import { ESTADOS_ENVIO } from '../../lib/constants';
import Select from '../../components/Select';
import TooltipTexto from '../../components/TooltipTexto';
import { useToast } from '../../components/ToastProvider';
import '../../components/Modal.css';
import './EnvioDetalleModal.css';

const OPCIONES_PAGADO = ['Sí', 'No'];

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function datosProducto(item) {
  if (typeof item === 'string') return { nombre: item, talle: '—', color: '—', unidades: '—' };
  return {
    nombre: item.nombre || item.producto || item.nombreProducto || 'Producto',
    talle: item.talle || '—',
    color: item.color || '—',
    unidades: item.cantidad ?? item.qty ?? item.cantidadPedida ?? '—'
  };
}

export default function EnvioDetalleModal({ envio, onCerrar, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState(envio.estado);
  const [pagado, setPagado] = useState(envio.pagado);
  const [linkSeguimiento, setLinkSeguimiento] = useState(envio.linkSeguimiento || '');
  const [tipoEnvio, setTipoEnvio] = useState(envio.tipoEnvio || '');
  const [comentarios, setComentarios] = useState(envio.comentarios || '');
  const { showSuccess, showError } = useToast();

  function activarEdicion() {
    setEstado(envio.estado);
    setPagado(envio.pagado);
    setLinkSeguimiento(envio.linkSeguimiento || '');
    setTipoEnvio(envio.tipoEnvio || '');
    setComentarios(envio.comentarios || '');
    setEditando(true);
  }

  async function guardar() {
    setGuardando(true);
    try {
      const cambios = {
        estado,
        pagado,
        linkSeguimiento: linkSeguimiento.trim() || null,
        tipoEnvio: tipoEnvio.trim() || null,
        comentarios
      };
      if (estado === 'Enviado' && !envio.fechaEnvio) cambios.fechaEnvio = new Date().toISOString();
      if (estado === 'Entregado' && !envio.fechaEntrega) cambios.fechaEntrega = new Date().toISOString();
      await updateEnvio(envio.id, cambios);
      showSuccess('Envío actualizado.');
      onActualizado?.({ ...envio, ...cambios });
      setEditando(false);
    } catch (err) {
      showError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box modal-box-envio" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box-header">
          <div className="modal-box-header-titulo">
            <h3>Envío #{String(envio.numero ?? '').padStart(3, '0')}</h3>
            {editando ? (
              <button type="button" className="btn-editar-envio" onClick={() => setEditando(false)}>
                Volver
              </button>
            ) : (
              <button type="button" className="btn-editar-envio" onClick={activarEdicion}>
                Editar
              </button>
            )}
          </div>
          <button type="button" className="btn-cerrar-modal" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="detalle-envio-grid">
          <div>
            <span className="detalle-envio-label">Cliente</span>
            <p>{envio.cliente?.nombre || 'Cliente eliminado'}</p>
          </div>
          <div>
            <span className="detalle-envio-label">Estado</span>
            {editando ? (
              <Select value={estado} onChange={setEstado} options={ESTADOS_ENVIO} />
            ) : (
              <span className={`badge estado-${envio.estado}`}>{envio.estado}</span>
            )}
          </div>

          <div className="detalle-envio-fila-completa">
            <span className="detalle-envio-label">Destino</span>
            <p>{envio.destino || '—'}</p>
          </div>

          <div className="detalle-envio-fila-completa">
            <span className="detalle-envio-label">Pedido</span>
            {Array.isArray(envio.productos) && envio.productos.length > 0 ? (
              <table className="detalle-envio-productos-tabla">
                <colgroup>
                  <col style={{ width: '110px' }} />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Talle</th>
                    <th>Color</th>
                    <th>Un.</th>
                  </tr>
                </thead>
                <tbody>
                  {envio.productos.map((item, i) => {
                    const p = datosProducto(item);
                    return (
                      <tr key={i}>
                        <td>
                          <TooltipTexto texto={p.nombre} />
                        </td>
                        <td>{p.talle}</td>
                        <td>{p.color}</td>
                        <td>{p.unidades}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>Sin productos</p>
            )}
          </div>

          <div>
            <span className="detalle-envio-label">Código postal</span>
            <p>{envio.cliente?.codigoPostal || '—'}</p>
          </div>
          <div>
            <span className="detalle-envio-label">Tipo de envío</span>
            {editando ? (
              <input
                type="text"
                className="detalle-envio-input"
                value={tipoEnvio}
                onChange={(e) => setTipoEnvio(e.target.value)}
                placeholder="Ej: Correo, Moto…"
              />
            ) : (
              <p>{envio.tipoEnvio || '—'}</p>
            )}
          </div>

          <div>
            <span className="detalle-envio-label">Fecha creación</span>
            <p className="detalle-envio-fecha">{formatDate(envio.fechaCreacion)}</p>
          </div>
          <div>
            <span className="detalle-envio-label">Fecha envío</span>
            <p className={`detalle-envio-fecha ${envio.fechaEnvio ? 'fecha-envio-valor' : ''}`}>
              {formatDate(envio.fechaEnvio)}
            </p>
          </div>
          <div>
            <span className="detalle-envio-label">Fecha entrega</span>
            <p className={`detalle-envio-fecha ${envio.fechaEntrega ? 'fecha-entrega-valor' : ''}`}>
              {formatDate(envio.fechaEntrega)}
            </p>
          </div>
          <div>
            <span className="detalle-envio-label">Pagado</span>
            {editando ? (
              <Select value={pagado ? 'Sí' : 'No'} onChange={(v) => setPagado(v === 'Sí')} options={OPCIONES_PAGADO} />
            ) : (
              <span className={`badge ${envio.pagado ? 'pagado-si' : 'pagado-no'}`}>{envio.pagado ? 'Sí' : 'No'}</span>
            )}
          </div>
          <div>
            <span className="detalle-envio-label">Link de seguimiento</span>
            {editando ? (
              <input
                type="text"
                className="detalle-envio-input"
                value={linkSeguimiento}
                onChange={(e) => setLinkSeguimiento(e.target.value)}
                placeholder="https://…"
              />
            ) : envio.linkSeguimiento ? (
              <p>
                <a href={envio.linkSeguimiento} target="_blank" rel="noreferrer">
                  Ver link
                </a>
              </p>
            ) : (
              <p>—</p>
            )}
          </div>

          <div className="detalle-envio-fila-completa">
            <span className="detalle-envio-label">Comentarios</span>
            {editando ? (
              <textarea
                className="detalle-envio-comentarios"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Sin comentarios"
                rows={3}
              />
            ) : (
              <p>{envio.comentarios || '—'}</p>
            )}
          </div>
        </div>

        <div className="modal-acciones">
          {editando && (
            <button type="button" className="modal-btn modal-btn-guardar" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          )}
          <button type="button" className="modal-btn" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
