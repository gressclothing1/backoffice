import { getClientes } from './api';
import { useFetch } from './useFetch';

export default function ClientesTable({ refreshKey }) {
  const { data: clientes, error, loading } = useFetch(getClientes, [refreshKey]);

  if (loading) return <p className="status">Cargando clientes…</p>;
  if (error) return <p className="status error">Error al cargar clientes: {error}</p>;
  if (!clientes.length) return <p className="status">Todavía no hay clientes cargados.</p>;

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
