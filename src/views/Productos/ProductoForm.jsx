import { useEffect, useState } from 'react';
import {
  createProducto,
  updateProducto,
  deleteProducto,
  createImagen,
  uploadImagen,
  getComponentes,
  createComponente,
  deleteComponente
} from '../../lib/api';
import { TALLES, CATEGORIAS } from '../../lib/constants';
import Select from '../../components/Select';
import './ProductoForm.css';

const MAX_IMAGENES = 6;

const VACIO = { nombre: '', categoria: '', material: '' };

function valoresDeVariante(producto) {
  return { nombre: producto.nombre, categoria: producto.categoria, material: producto.material || '' };
}

function datosParaModo(productoEditando, variantesDelProducto, modo) {
  if (!productoEditando) return { talles: [], medidas: {}, colores: [], imagenes: {} };
  if (modo === 'variante') {
    return {
      talles: [productoEditando.talle],
      medidas: { [productoEditando.talle]: productoEditando.medidas },
      colores: [productoEditando.color],
      imagenes: { [productoEditando.color]: [] }
    };
  }
  const tallesUnicos = [...new Set(variantesDelProducto.map((v) => v.talle))];
  const coloresUnicos = [...new Set(variantesDelProducto.map((v) => v.color))];
  const medidas = {};
  variantesDelProducto.forEach((v) => { medidas[v.talle] = v.medidas; });
  return { talles: tallesUnicos, medidas, colores: coloresUnicos, imagenes: Object.fromEntries(coloresUnicos.map((c) => [c, []])) };
}

export default function ProductoForm({
  onCreated,
  onCancelar,
  titulo,
  onCerrar,
  productoEditando,
  variantesDelProducto = [],
  productos = []
}) {
  const [modoEdicion, setModoEdicion] = useState('producto');
  const [valores, setValores] = useState(() => (productoEditando ? valoresDeVariante(productoEditando) : VACIO));
  const [talles, setTalles] = useState(() => datosParaModo(productoEditando, variantesDelProducto, 'producto').talles);
  const [medidasPorTalle, setMedidasPorTalle] = useState(
    () => datosParaModo(productoEditando, variantesDelProducto, 'producto').medidas
  );
  const [colores, setColores] = useState(() => datosParaModo(productoEditando, variantesDelProducto, 'producto').colores);
  const [colorInput, setColorInput] = useState('');
  const [imagenesPorColor, setImagenesPorColor] = useState(
    () => datosParaModo(productoEditando, variantesDelProducto, 'producto').imagenes
  );
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [componentesExistentes, setComponentesExistentes] = useState([]);
  const [errorConjunto, setErrorConjunto] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const conjuntoBloqueado = valores.categoria === 'Conjunto';

  useEffect(() => {
    if (!productoEditando || productoEditando.categoria !== 'Conjunto') return;
    getComponentes()
      .then((lista) => {
        setComponentesExistentes(lista);
        setProductosSeleccionados(
          lista.filter((c) => c.conjuntoNombre === productoEditando.nombre).map((c) => c.productoNombre)
        );
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!conjuntoBloqueado) {
      setErrorConjunto(null);
      return;
    }
    if (productosSeleccionados.length < 2) {
      setErrorConjunto(null);
      return;
    }
    const grupos = productosSeleccionados.map((nombre) => productos.filter((p) => p.nombre === nombre));
    if (grupos.some((g) => g.length === 0)) return;

    const materiales = new Set(grupos.map((g) => g[0].material));
    const tallesPorProducto = grupos.map((g) => [...new Set(g.map((p) => p.talle))].sort().join('|'));
    const coloresPorProducto = grupos.map((g) => [...new Set(g.map((p) => p.color))].sort().join('|'));

    if (materiales.size > 1 || new Set(tallesPorProducto).size > 1 || new Set(coloresPorProducto).size > 1) {
      setErrorConjunto('Los productos elegidos deben tener el mismo material, los mismos talles y los mismos colores.');
      return;
    }

    setErrorConjunto(null);
    const base = grupos[0];
    const tallesUnicos = [...new Set(base.map((p) => p.talle))];
    const coloresUnicos = [...new Set(base.map((p) => p.color))];
    const medidas = {};
    base.forEach((p) => { medidas[p.talle] = p.medidas; });
    setValores((v) => ({ ...v, material: base[0].material }));
    setTalles(tallesUnicos);
    setMedidasPorTalle(medidas);
    setColores(coloresUnicos);
    setImagenesPorColor(Object.fromEntries(coloresUnicos.map((c) => [c, []])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productosSeleccionados, conjuntoBloqueado]);

  function agregarProductoConjunto(nombre) {
    setProductosSeleccionados((p) => (p.includes(nombre) ? p : [...p, nombre]));
  }

  function quitarProductoConjunto(nombre) {
    setProductosSeleccionados((p) => p.filter((n) => n !== nombre));
  }

  const nombresDisponiblesParaConjunto = [...new Set(productos.filter((p) => p.categoria !== 'Conjunto').map((p) => p.nombre))]
    .filter((nombre) => nombre !== valores.nombre.trim() && !productosSeleccionados.includes(nombre))
    .sort();

  function cambiarModoEdicion(modo) {
    if (modo === modoEdicion || !productoEditando) return;
    setModoEdicion(modo);
    setValores(valoresDeVariante(productoEditando));
    const datos = datosParaModo(productoEditando, variantesDelProducto, modo);
    setTalles(datos.talles);
    setMedidasPorTalle(datos.medidas);
    setColores(datos.colores);
    setImagenesPorColor(datos.imagenes);
  }

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
    setImagenesPorColor((m) => (color in m ? m : { ...m, [color]: [] }));
    setColorInput('');
  }

  function quitarColor(color) {
    setColores((c) => c.filter((x) => x !== color));
    setImagenesPorColor((m) => {
      const { [color]: quitadas, ...resto } = m;
      quitadas?.forEach((imagen) => URL.revokeObjectURL(imagen.previewUrl));
      return resto;
    });
  }

  function onColorKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      agregarColor();
    }
  }

  function agregarImagenesColor(color, fileList) {
    const actuales = imagenesPorColor[color] || [];
    const nuevas = Array.from(fileList)
      .slice(0, MAX_IMAGENES - actuales.length)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setImagenesPorColor((m) => ({ ...m, [color]: [...actuales, ...nuevas] }));
  }

  function quitarImagenColor(color, index) {
    setImagenesPorColor((m) => {
      const lista = [...(m[color] || [])];
      const [quitada] = lista.splice(index, 1);
      if (quitada) URL.revokeObjectURL(quitada.previewUrl);
      return { ...m, [color]: lista };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!valores.categoria) { setError('Elegí una categoría.'); return; }
    if (conjuntoBloqueado) {
      if (productosSeleccionados.length < 2) { setError('Seleccioná al menos 2 productos para el conjunto.'); return; }
      if (errorConjunto) { setError(errorConjunto); return; }
    }
    if (!valores.material.trim()) { setError('Ingresá el material.'); return; }
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
        material: valores.material.trim(),
        stock: 0
      };
      function stockHeredado(talle, color) {
        const stocks = productosSeleccionados.map((nombre) => {
          const variante = productos.find((p) => p.nombre === nombre && p.talle === talle && p.color === color);
          return variante ? variante.stock : 0;
        });
        return stocks.length ? Math.min(...stocks) : 0;
      }
      const combinaciones = talles.flatMap((talle) =>
        colores.map((color) => ({
          ...base,
          talle,
          medidas: medidasPorTalle[talle].trim(),
          color,
          ...(conjuntoBloqueado ? { stock: stockHeredado(talle, color) } : {})
        }))
      );

      let productosCreados;
      if (modoEdicion === 'producto' && productoEditando) {
        productosCreados = await Promise.all(
          combinaciones.map((producto) => {
            const existente = variantesDelProducto.find((v) => v.talle === producto.talle && v.color === producto.color);
            if (existente) return updateProducto(existente.id, { ...producto, stock: existente.stock });
            return createProducto(producto);
          })
        );
        const combosActuales = new Set(combinaciones.map((c) => `${c.talle}__${c.color}`));
        const aEliminar = variantesDelProducto.filter((v) => !combosActuales.has(`${v.talle}__${v.color}`));
        await Promise.all(aEliminar.map((v) => deleteProducto(v.id)));
      } else {
        productosCreados = await Promise.all(
          combinaciones.map((producto) => {
            const esOriginal =
              productoEditando && producto.talle === productoEditando.talle && producto.color === productoEditando.color;
            if (esOriginal) {
              return updateProducto(productoEditando.id, { ...producto, stock: productoEditando.stock });
            }
            return createProducto(producto);
          })
        );
      }

      const coloresConImagenes = colores.filter((color) => (imagenesPorColor[color]?.length || 0) > 0);
      if (coloresConImagenes.length > 0) {
        const urlsPorColor = {};
        await Promise.all(
          coloresConImagenes.map(async (color) => {
            urlsPorColor[color] = await Promise.all(imagenesPorColor[color].map((imagen) => uploadImagen(imagen.file)));
          })
        );
        const registrosImagenes = productosCreados
          .filter((producto) => urlsPorColor[producto.color])
          .flatMap((producto) =>
            urlsPorColor[producto.color].map((url, index) => ({
              productoId: producto.id,
              url,
              orden: index,
              principal: index === 0
            }))
          );
        await Promise.all(registrosImagenes.map((imagen) => createImagen(imagen)));
      }

      const viejosComponentes = productoEditando
        ? componentesExistentes.filter((c) => c.conjuntoNombre === productoEditando.nombre)
        : [];
      if (conjuntoBloqueado) {
        await Promise.all(viejosComponentes.map((c) => deleteComponente(c.id)));
        await Promise.all(
          productosSeleccionados.map((productoNombre) =>
            createComponente({ conjuntoNombre: valores.nombre.trim(), productoNombre })
          )
        );
      } else if (viejosComponentes.length > 0) {
        await Promise.all(viejosComponentes.map((c) => deleteComponente(c.id)));
      }

      setValores(VACIO);
      setTalles([]);
      setMedidasPorTalle({});
      setColores([]);
      setProductosSeleccionados([]);
      Object.values(imagenesPorColor).flat().forEach((imagen) => URL.revokeObjectURL(imagen.previewUrl));
      setImagenesPorColor({});
      const esSoloEdicion =
        Boolean(productoEditando) &&
        (modoEdicion === 'producto' ||
          (combinaciones.length === 1 &&
            combinaciones[0].talle === productoEditando.talle &&
            combinaciones[0].color === productoEditando.color));
      setExito(
        esSoloEdicion
          ? 'Producto actualizado.'
          : `Se ${combinaciones.length === 1 ? 'creó 1 variante' : `crearon ${combinaciones.length} variantes`}.`
      );
      setTimeout(() => onCreated?.(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="producto-form" onSubmit={onSubmit}>
      {(titulo || onCerrar) && (
        <div className="producto-form-header">
          <h3>{titulo}</h3>
          {onCerrar && (
            <button type="button" className="btn-cerrar-form" onClick={onCerrar} aria-label="Cerrar">
              ×
            </button>
          )}
        </div>
      )}

      {productoEditando && (
        <div className="modo-edicion-tabs">
          <button
            type="button"
            className={`modo-edicion-tab ${modoEdicion === 'producto' ? 'activo' : ''}`}
            onClick={() => cambiarModoEdicion('producto')}
          >
            Producto
          </button>
          <button
            type="button"
            className={`modo-edicion-tab ${modoEdicion === 'variante' ? 'activo' : ''}`}
            onClick={() => cambiarModoEdicion('variante')}
          >
            Variante
          </button>
        </div>
      )}

      {!(productoEditando && modoEdicion === 'variante') && (
        <div className="form-grid">
          <label className="field">
            Nombre
            <input
              value={valores.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              required
            />
          </label>
          {conjuntoBloqueado && (
            <div className="field">
              Productos
              <Select
                value=""
                onChange={agregarProductoConjunto}
                options={nombresDisponiblesParaConjunto}
                placeholder="Agregar producto…"
                searchable
              />
              {productosSeleccionados.length > 0 && (
                <div className="chip-list">
                  {productosSeleccionados.map((nombre) => (
                    <span className="chip" key={nombre}>
                      {nombre}
                      <button type="button" onClick={() => quitarProductoConjunto(nombre)} aria-label={`Quitar ${nombre}`}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errorConjunto && <span className="status error">{errorConjunto}</span>}
            </div>
          )}
          <div className="field">
            Categoría
            <Select
              value={valores.categoria}
              onChange={(categoria) => actualizarCampo('categoria', categoria)}
              options={CATEGORIAS}
            />
          </div>
          <label className="field">
            Material
            <input
              value={valores.material}
              onChange={(e) => actualizarCampo('material', e.target.value)}
              disabled={conjuntoBloqueado}
              required
            />
          </label>
        </div>
      )}

      <div className="form-field">
        <span className="form-field-label">Talles</span>
        <div className="chip-toggle-group">
          {TALLES.map((talle) => (
            <button
              type="button"
              key={talle}
              className={`chip-toggle ${talles.includes(talle) ? 'activo' : ''}`}
              onClick={() => toggleTalle(talle)}
              disabled={conjuntoBloqueado}
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
            disabled={conjuntoBloqueado}
          />
          <button type="button" onClick={agregarColor} disabled={conjuntoBloqueado}>
            Agregar
          </button>
        </div>
        {colores.length > 0 && (
          <div className="chip-list">
            {colores.map((color) => (
              <span className="chip" key={color}>
                {color}
                <button
                  type="button"
                  onClick={() => quitarColor(color)}
                  aria-label={`Quitar ${color}`}
                  disabled={conjuntoBloqueado}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {colores.length > 0 && (
          <div className="imagenes-por-color">
            {colores.map((color) => {
              const imagenesColor = imagenesPorColor[color] || [];
              return (
                <div key={color} className="color-imagenes-bloque">
                  <span className="form-field-label">
                    Fotos para color {color} (hasta {MAX_IMAGENES})
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="imagenes-input"
                    onChange={(e) => {
                      agregarImagenesColor(color, e.target.files);
                      e.target.value = '';
                    }}
                    disabled={imagenesColor.length >= MAX_IMAGENES}
                  />
                  {imagenesColor.length > 0 && (
                    <div className="imagenes-preview">
                      {imagenesColor.map((imagen, index) => (
                        <div className="imagen-preview" key={imagen.previewUrl}>
                          <img src={imagen.previewUrl} alt="" />
                          <button
                            type="button"
                            onClick={() => quitarImagenColor(color, index)}
                            aria-label={`Quitar foto de ${color}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {talles.length > 0 && colores.length > 0 && (
        <p className="form-hint">
          Se van a crear {talles.length * colores.length} variantes (una por cada combinación de talle y color).
        </p>
      )}

      <div className="form-actions">
        <button
          type="submit"
          disabled={
            enviando ||
            !valores.nombre.trim() ||
            !valores.categoria ||
            !valores.material.trim() ||
            talles.length === 0 ||
            colores.length === 0 ||
            (conjuntoBloqueado && (productosSeleccionados.length < 2 || Boolean(errorConjunto)))
          }
        >
          {enviando ? (productoEditando ? 'Guardando…' : 'Creando…') : productoEditando ? 'Guardar cambios' : 'Crear producto'}
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
