import { getProductos } from '../../lib/api';
import { useFetch } from '../../hooks/useFetch';
import './ProductosTable.css';

function agruparPorNombre(productos) {
  const grupos = new Map();

  for (const producto of productos) {
    const grupo = grupos.get(producto.nombre) || {
      nombre: producto.nombre,
      categoria: producto.categoria,
      variantes: [],
      stockTotal: 0
    };
    grupo.variantes.push({ id: producto.id, talle: producto.talle, color: producto.color, stock: producto.stock });
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
  if (!productos.length) {
    return (
      <div className="tabla-vacia">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <path
            d="M12 26 36 14l24 12M12 26v32l24 12 24-12V26M12 26l24 12 24-12M36 38v32"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M27 45 18 40.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <p className="tabla-vacia-titulo">No encontramos productos</p>
      </div>
    );
  }

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
                      {variante.talle} · {variante.color}
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
