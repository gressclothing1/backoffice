import { getClientes, getEnvios } from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';

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

function fetchEnviosConClientes() {
  return Promise.all([getEnvios(), getClientes()]).then(([envios, clientes]) => {
    const clientesPorId = new Map(clientes.map((cliente) => [cliente.id, cliente]));
    return envios.map((envio) => ({
      ...envio,
      cliente: clientesPorId.get(envio.clienteId) || null
    }));
  });
}

export default function EnviosTable() {
  const { data: envios, error, loading } = useFetch(fetchEnviosConClientes, []);

  if (loading) return <p className="status">Cargando envíos…</p>;
  if (error) return <p className="status error">Error al cargar envíos: {error}</p>;
  if (!envios.length) return <p className="status">Todavía no hay envíos cargados.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Destino</th>
            <th>Estado</th>
            <th>Fecha envío</th>
            <th>Fecha entrega</th>
            <th>Pagado</th>
            <th>Monto</th>
            <th>Seguimiento</th>
          </tr>
        </thead>
        <tbody>
          {envios.map((envio) => (
            <tr key={envio.id}>
              <td>{envio.cliente?.nombre || 'Cliente eliminado'}</td>
              <td>{envio.destino}</td>
              <td>
                <span className={`badge estado-${envio.estado}`}>
                  {ESTADO_LABELS[envio.estado] || envio.estado}
                </span>
              </td>
              <td>{formatDate(envio.fechaEnvio)}</td>
              <td>{formatDate(envio.fechaEntrega)}</td>
              <td>
                <span className={`badge ${envio.pagado ? 'pagado-si' : 'pagado-no'}`}>
                  {envio.pagado ? 'Sí' : 'No'}
                </span>
              </td>
              <td>{currencyFormatter.format(envio.monto || 0)}</td>
              <td>
                {envio.linkSeguimiento ? (
                  <a href={envio.linkSeguimiento} target="_blank" rel="noreferrer">
                    Ver
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
