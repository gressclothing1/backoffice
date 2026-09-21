import { useState } from 'react';
import { getClientes, getEnvios } from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import EmptyState from '../../components/EmptyState';
import TooltipTexto from '../../components/TooltipTexto';
import EnvioDetalleModal from './EnvioDetalleModal';
import './EnviosTable.css';

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
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: envios, error, loading } = useFetch(fetchEnviosConClientes, [refreshKey]);
  const [envioViendo, setEnvioViendo] = useState(null);

  function refrescar() {
    setRefreshKey((k) => k + 1);
  }

  if (loading) return <p className="status">Cargando envíos…</p>;
  if (error) return <p className="status error">Error al cargar envíos: {error}</p>;
  if (!envios.length) {
    return (
      <EmptyState
        icon={
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect x="9" y="24" width="30" height="24" rx="2" stroke="currentColor" strokeWidth="2.5" />
            <path
              d="M39 32h11l10 10v6H39"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="23" cy="52" r="5.5" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="51" cy="52" r="5.5" stroke="currentColor" strokeWidth="2.5" />
          </svg>
        }
        titulo="Todavía no hay envíos cargados."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="table-envios">
        <colgroup>
          <col style={{ width: '120px' }} />
          <col />
          <col style={{ width: '70px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Envío</th>
          </tr>
        </thead>
        <tbody>
          {envios.map((envio) => (
            <tr key={envio.id}>
              <td>
                <TooltipTexto texto={envio.cliente?.nombre || 'Cliente eliminado'} />
              </td>
              <td>
                <span className={`badge estado-${envio.estado}`}>{envio.estado}</span>
              </td>
              <td>
                <button type="button" className="btn-ver-envio" onClick={() => setEnvioViendo(envio)} aria-label="Ver envío">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {envioViendo && (
        <EnvioDetalleModal
          envio={envioViendo}
          onCerrar={() => setEnvioViendo(null)}
          onActualizado={(nuevoEnvio) => {
            setEnvioViendo(nuevoEnvio);
            refrescar();
          }}
        />
      )}
    </div>
  );
}
