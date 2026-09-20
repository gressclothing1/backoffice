import { useState } from 'react';
import EnviosTable from './EnviosTable';
import ProductosTable from './ProductosTable';
import ProductoForm from './ProductoForm';
import './App.css';

function App() {
  const [productosRefreshKey, setProductosRefreshKey] = useState(0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Gress · Backoffice</h1>
      </header>

      <section className="panel">
        <h2>Envíos</h2>
        <EnviosTable />
      </section>

      <section className="panel">
        <h2>Productos</h2>
        <ProductoForm onCreated={() => setProductosRefreshKey((k) => k + 1)} />
        <ProductosTable refreshKey={productosRefreshKey} />
      </section>
    </div>
  );
}

export default App;
