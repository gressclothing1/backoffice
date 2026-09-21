import { useState } from 'react';
import EnviosTable from './views/Envios/EnviosTable';
import ProductosView from './views/Productos/ProductosView';
import ClientesTable from './views/Clientes/ClientesTable';
import { ToastProvider } from './components/ToastProvider';
import './App.css';

const TABS = [
  { id: 'envios', label: 'Envíos' },
  { id: 'productos', label: 'Productos' },
  { id: 'clientes', label: 'Clientes' }
];

function App() {
  const [tab, setTab] = useState('envios');

  return (
    <ToastProvider>
      <div className="app-shell">
        <nav className="side-nav">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`side-nav-item ${tab === id ? 'activo' : ''}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="app">
          <header className="app-header">
            <h1>Gress · Backoffice</h1>
          </header>

          {tab === 'envios' && (
            <section className="panel">
              <h2>Envíos</h2>
              <EnviosTable />
            </section>
          )}

          {tab === 'productos' && (
            <section className="panel">
              <ProductosView />
            </section>
          )}

          {tab === 'clientes' && (
            <section className="panel">
              <h2>Clientes</h2>
              <ClientesTable />
            </section>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
