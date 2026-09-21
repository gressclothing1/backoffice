import { getClientes } from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import EmptyState from '../../components/EmptyState';

export default function ClientesTable({ refreshKey }) {
  const { data: clientes, error, loading } = useFetch(getClientes, [refreshKey]);

  if (loading) return <p className="status">Cargando clientes…</p>;
  if (error) return <p className="status error">Error al cargar clientes: {error}</p>;
  if (!clientes.length) {
    return (
      <EmptyState
        icon={
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="26" r="12" stroke="currentColor" strokeWidth="2.5" />
            <path
              d="M14 58c2-12 12-20 22-20s20 8 22 20"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        titulo="Todavía no hay clientes cargados."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Dirección de entrega</th>
            <th>Código postal</th>
            <th>Negocio</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>{cliente.nombre}</td>
              <td>{cliente.email}</td>
              <td>
                {cliente.direccionEntrega}
                {cliente.direccionEntrega2 ? `, ${cliente.direccionEntrega2}` : ''}
              </td>
              <td>{cliente.codigoPostal}</td>
              <td>{cliente.nombreNegocio || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
