import EnviosTable from './EnviosTable';
import ProductosTable from './ProductosTable';
import './App.css';

function App() {
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
        <ProductosTable />
      </section>
    </div>
  );
}

export default App;
