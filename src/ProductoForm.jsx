import { useState } from 'react';
import { createProducto } from './api';

const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const CATEGORIAS = ['Pantalón', 'Remera', 'Vestido'];

const VACIO = { nombre: '', categoria: '', medidas: '' };

export default function ProductoForm({ onCreated }) {
  const [valores, setValores] = useState(VACIO);
  const [talles, setTalles] = useState([]);
  const [colores, setColores] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  function actualizarCampo(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }));
  }

  function toggleTalle(talle) {
    setTalles((t) => (t.includes(talle) ? t.filter((x) => x !== talle) : [...t, talle]));
  }

  function agregarColor() {
    const color = colorInput.trim();
    if (!color) return;
    setColores((c) => (c.includes(color) ? c : [...c, color]));
    setColorInput('');
  }

  function quitarColor(color) {
    setColores((c) => c.filter((x) => x !== color));
  }

  function onColorKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      agregarColor();
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (talles.length === 0) { setError('Elegí al menos un talle.'); return; }
    if (colores.length === 0) { setError('Agregá al menos un color.'); return; }

    setEnviando(true);
    try {
      const base = {
        nombre: valores.nombre.trim(),
        categoria: valores.categoria.trim(),
        medidas: valores.medidas.trim(),
        stock: 0
      };
      const combinaciones = talles.flatMap((talle) => colores.map((color) => ({ ...base, talle, color })));
      await Promise.all(combinaciones.map((producto) => createProducto(producto)));

      setValores(VACIO);
      setTalles([]);
      setColores([]);
      setExito(`Se ${combinaciones.length === 1 ? 'creó 1 variante' : `crearon ${combinaciones.length} variantes`}.`);
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="producto-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <label>
          Nombre
          <input
            value={valores.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
            required
          />
        </label>
        <label>
          Categoría
          <select
            value={valores.categoria}
            onChange={(e) => actualizarCampo('categoria', e.target.value)}
            required
          >
            <option value="" disabled>
              Elegir…
            </option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </label>
        <label>
          Medidas
          <input
            value={valores.medidas}
            onChange={(e) => actualizarCampo('medidas', e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-field">
        <span className="form-field-label">Talles</span>
        <div className="chip-toggle-group">
          {TALLES.map((talle) => (
            <button
              type="button"
              key={talle}
              className={`chip-toggle ${talles.includes(talle) ? 'activo' : ''}`}
              onClick={() => toggleTalle(talle)}
            >
              {talle}
            </button>
          ))}
        </div>
      </div>

      <div className="form-field">
        <span className="form-field-label">Colores</span>
        <div className="tag-input-row">
          <input
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            onKeyDown={onColorKeyDown}
            placeholder="Escribí un color y presioná Enter"
          />
          <button type="button" onClick={agregarColor}>
            Agregar
          </button>
        </div>
        {colores.length > 0 && (
          <div className="chip-list">
            {colores.map((color) => (
              <span className="chip" key={color}>
                {color}
                <button type="button" onClick={() => quitarColor(color)} aria-label={`Quitar ${color}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {talles.length > 0 && colores.length > 0 && (
        <p className="form-hint">
          Se van a crear {talles.length * colores.length} variantes (una por cada combinación de talle y color).
        </p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando…' : 'Crear producto'}
        </button>
        {error && <span className="status error">{error}</span>}
        {exito && !error && <span className="status success">{exito}</span>}
      </div>
    </form>
  );
}
