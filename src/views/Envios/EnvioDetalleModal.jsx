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

function normalizarProducto(item) {
  if (typeof item === 'string') return { nombre: item, talle: '', color: '', cantidad: '', nuevo: false };
  return {
    nombre: item.nombre || item.producto || item.nombreProducto || '',
    talle: item.talle || '',
    color: item.color || '',
    cantidad: item.cantidad ?? item.qty ?? item.cantidadPedida ?? '',
    nuevo: false
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
  const [productos, setProductos] = useState(() => (envio.productos || []).map(normalizarProducto));
  const { showSuccess, showError } = useToast();

  function activarEdicion() {
    setEstado(envio.estado);
    setPagado(envio.pagado);
    setLinkSeguimiento(envio.linkSeguimiento || '');
    setTipoEnvio(envio.tipoEnvio || '');
    setComentarios(envio.comentarios || '');
    setProductos((envio.productos || []).map(normalizarProducto));
    setEditando(true);
  }

  function actualizarProducto(index, campo, valor) {
    setProductos((p) => p.map((item, i) => (i === index ? { ...item, [campo]: valor } : item)));
  }

  function eliminarProducto(index) {
    setProductos((p) => p.filter((_, i) => i !== index));
  }

  function agregarProducto() {
    setProductos((p) => [...p, { nombre: '', talle: '', color: '', cantidad: '', nuevo: true }]);
  }

  async function guardar() {
    setGuardando(true);
    try {
      const cambios = {
        estado,
        pagado,
        linkSeguimiento: linkSeguimiento.trim() || null,
        tipoEnvio: tipoEnvio.trim() || null,
        comentarios,
        productos: productos
          .filter((item) => item.nombre.trim())
          .map(({ nuevo, ...item }) => ({ ...item, cantidad: item.cantidad === '' ? 0 : Number(item.cantidad) }))
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
                Modo lectura
              </button>
            ) : (
              <button type="button" className="btn-editar-envio" onClick={activarEdicion}>
                Modo edición
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
            <div className="detalle-envio-pedido-header">
              <span className="detalle-envio-label">Pedido</span>
              {editando && (
                <button type="button" className="btn-agregar-producto" onClick={agregarProducto} aria-label="Agregar producto">
                  +
                </button>
              )}
            </div>

            {editando ? (
              productos.length > 0 ? (
                <table className="detalle-envio-productos-tabla">
                  <colgroup>
                    <col style={{ width: '110px' }} />
                    <col />
                    <col />
                    <col style={{ width: '70px' }} />
                    <col style={{ width: '34px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Talle</th>
                      <th>Color</th>
                      <th>Un.</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map((item, i) => (
                      <tr key={i}>
                        <td>
                          {item.nuevo ? (
                            <input
                              type="text"
                              className="detalle-envio-input-celda"
                              value={item.nombre}
                              onChange={(e) => actualizarProducto(i, 'nombre', e.target.value)}
                              placeholder="Producto"
                            />
                          ) : (
                            <TooltipTexto texto={item.nombre} />
                          )}
                        </td>
                        <td>
                          {item.nuevo ? (
                            <input
                              type="text"
                              className="detalle-envio-input-celda"
                              value={item.talle}
                              onChange={(e) => actualizarProducto(i, 'talle', e.target.value)}
                              placeholder="Talle"
                            />
                          ) : (
                            item.talle || '—'
                          )}
                        </td>
                        <td>
                          {item.nuevo ? (
                            <input
                              type="text"
                              className="detalle-envio-input-celda"
                              value={item.color}
                              onChange={(e) => actualizarProducto(i, 'color', e.target.value)}
                              placeholder="Color"
                            />
                          ) : (
                            item.color || '—'
                          )}
                        </td>
                        <td>
                          <input
                            type="text"
                            inputMode="numeric"
                            className="detalle-envio-input-celda"
                            value={item.cantidad}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (/^\d*$/.test(v)) actualizarProducto(i, 'cantidad', v);
                            }}
                            placeholder="0"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-eliminar-producto"
                            onClick={() => eliminarProducto(i)}
                            aria-label="Quitar producto"
                          >
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M3 4.2h10M6.3 4.2V2.7a.6.6 0 0 1 .6-.6h2.2a.6.6 0 0 1 .6.6v1.5M4.6 4.2l.6 8.8a1 1 0 0 0 1 .9h3.6a1 1 0 0 0 1-.9l.6-8.8"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Sin productos</p>
              )
            ) : Array.isArray(envio.productos) && envio.productos.length > 0 ? (
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
