import { useState } from 'react';
import { createProducto } from './api';

const VACIO = { nombre: '', categoria: '', talle: '', medidas: '', color: '', stock: '' };

export default function ProductoForm({ onCreated }) {
  const [valores, setValores] = useState(VACIO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  function actualizarCampo(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setExito(false);
    setEnviando(true);
    try {
      await createProducto({
        nombre: valores.nombre.trim(),
        categoria: valores.categoria.trim(),
        talle: valores.talle.trim(),
        medidas: valores.medidas.trim(),
        color: valores.color.trim(),
        stock: parseInt(valores.stock, 10)
      });
      setValores(VACIO);
      setExito(true);
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
          <input
            value={valores.categoria}
            onChange={(e) => actualizarCampo('categoria', e.target.value)}
            required
          />
        </label>
        <label>
          Talle
          <input
            value={valores.talle}
            onChange={(e) => actualizarCampo('talle', e.target.value)}
            required
          />
        </label>
        <label>
          Medidas
          <input
            value={valores.medidas}
            onChange={(e) => actualizarCampo('medidas', e.target.value)}
            required
          />
        </label>
        <label>
          Color
          <input
            value={valores.color}
            onChange={(e) => actualizarCampo('color', e.target.value)}
            required
          />
        </label>
        <label>
          Stock
          <input
            type="number"
            min="0"
            step="1"
            value={valores.stock}
            onChange={(e) => actualizarCampo('stock', e.target.value)}
            required
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando…' : 'Crear producto'}
        </button>
        {error && <span className="status error">{error}</span>}
        {exito && !error && <span className="status success">Producto creado.</span>}
      </div>
    </form>
  );
}
