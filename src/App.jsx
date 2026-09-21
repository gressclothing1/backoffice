import { useState } from 'react';
import EnviosTable from './views/Envios/EnviosTable';
import ProductosView from './views/Productos/ProductosView';
import { ToastProvider } from './components/ToastProvider';
import './App.css';

const TABS = [
  { id: 'envios', label: 'Envíos' },
  { id: 'productos', label: 'Productos' }
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
              <div className="panel-header">
                <h2>Envíos</h2>
              </div>
              <EnviosTable />
            </section>
          )}

          {tab === 'productos' && (
            <section className="panel">
              <ProductosView />
            </section>
          )}
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;
