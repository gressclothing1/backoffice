import { getProductos } from './api';
import { useFetch } from './useFetch';

function agruparPorNombre(productos) {
  const grupos = new Map();

  for (const producto of productos) {
    const grupo = grupos.get(producto.nombre) || {
      nombre: producto.nombre,
      categoria: producto.categoria,
      variantes: [],
      stockTotal: 0
    };
    grupo.variantes.push({ id: producto.id, talle: producto.talle, stock: producto.stock });
    grupo.stockTotal += producto.stock;
    grupos.set(producto.nombre, grupo);
  }

  return [...grupos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function fetchProductosAgrupados() {
  return getProductos().then(agruparPorNombre);
}

export default function ProductosTable({ refreshKey }) {
  const { data: productos, error, loading } = useFetch(fetchProductosAgrupados, [refreshKey]);

  if (loading) return <p className="status">Cargando productos…</p>;
  if (error) return <p className="status error">Error al cargar productos: {error}</p>;
  if (!productos.length) return <p className="status">Todavía no hay productos cargados.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Talles</th>
            <th>Stock total</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.nombre}>
              <td>{producto.nombre}</td>
              <td>{producto.categoria}</td>
              <td>
                <div className="talles">
                  {producto.variantes.map((variante) => (
                    <span key={variante.id} className="badge talle">
                      {variante.talle}: {variante.stock}
                    </span>
                  ))}
                </div>
              </td>
              <td>{producto.stockTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
