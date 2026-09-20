import { useState } from 'react';
import { createProducto } from '../../lib/api';
import Select from '../../components/Select';
import './ProductoForm.css';

const TALLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const CATEGORIAS = ['Pantalón', 'Blusa', 'Vestido', 'Remera'];

const VACIO = { nombre: '', categoria: '' };

export default function ProductoForm({ onCreated, onCancelar }) {
  const [valores, setValores] = useState(VACIO);
  const [talles, setTalles] = useState([]);
  const [medidasPorTalle, setMedidasPorTalle] = useState({});
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
    setMedidasPorTalle((m) => {
      if (talle in m) {
        const { [talle]: _quitado, ...resto } = m;
        return resto;
      }
      return { ...m, [talle]: '' };
    });
  }

  function actualizarMedida(talle, medida) {
    setMedidasPorTalle((m) => ({ ...m, [talle]: medida }));
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

    if (!valores.categoria) { setError('Elegí una categoría.'); return; }
    if (talles.length === 0) { setError('Elegí al menos un talle.'); return; }
    if (colores.length === 0) { setError('Agregá al menos un color.'); return; }
    if (talles.some((talle) => !medidasPorTalle[talle]?.trim())) {
      setError('Completá las medidas de todos los talles elegidos.');
      return;
    }

    setEnviando(true);
    try {
      const base = {
        nombre: valores.nombre.trim(),
        categoria: valores.categoria.trim(),
        stock: 0
      };
      const combinaciones = talles.flatMap((talle) =>
        colores.map((color) => ({ ...base, talle, medidas: medidasPorTalle[talle].trim(), color }))
      );
      await Promise.all(combinaciones.map((producto) => createProducto(producto)));

      setValores(VACIO);
      setTalles([]);
      setMedidasPorTalle({});
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
        <label className="field">
          Nombre
          <input
            value={valores.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
            required
          />
        </label>
        <div className="field">
          Categoría
          <Select
            value={valores.categoria}
            onChange={(categoria) => actualizarCampo('categoria', categoria)}
            options={CATEGORIAS}
          />
        </div>
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
        {talles.length > 0 && (
          <div className="medidas-por-talle">
            {talles.map((talle) => (
              <label key={talle} className="medida-talle-input">
                Medidas para {talle}
                <input
                  value={medidasPorTalle[talle] || ''}
                  onChange={(e) => actualizarMedida(talle, e.target.value)}
                  required
                />
              </label>
            ))}
          </div>
        )}
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
        {onCancelar && (
          <button type="button" className="form-actions-cancelar" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
        )}
        {error && <span className="status error">{error}</span>}
        {exito && !error && <span className="status success">{exito}</span>}
      </div>
    </form>
  );
}
