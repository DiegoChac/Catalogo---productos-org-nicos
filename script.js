
const CONFIG = {
  SHEET_ID: "1ZX5ng_nUFZxqsrL7CXyBKbHxcwPMSpQBwGOwBcixjK0",
  SHEET_NAME: "Productos",     // nombre exacto de la pestaña/tab
 
  // Mapea cada dato con el TÍTULO EXACTO de la columna en tu hoja.
  // Si tu hoja usa otros nombres de columna, solo cambia el texto de la derecha.
  COLUMNS: {
    nombre:        "Nombre del producto",
    descripcion:   "Breve descripción del producto",
    imagen:        "Imagenes de las presentaciones del producto",  // URL(s) de foto, una por línea (o enlace de Google Drive)
    representante: "Nombre del representante",
    telefono:      "Numero de contacto",
    whatsapp:      "Whatsapp empresarial",
    correo:        "Correo electronico",
    facebook:      "Facebook",
    instagram:     "Instagram",
    tiktok:        "Tiktok",
  },
 
  // Presentaciones y precios viven en UNA sola columna cada uno, con una
  // presentación/precio por línea dentro de la misma celda (Alt+Enter en Sheets).
  // Ej. celda "Presentaciones del producto":
  //   750ml
  //   1L
  // celda "Precio de cada presentación":
  //   120
  //   200
  PRESENTACIONES_COL: "Presentaciones del producto",
  PRECIOS_COL: "Precio de cada presentación"
};
/* ============================================================================ */
 
// Divide el contenido de una celda con varios valores (uno por línea,
// o separados por coma / punto y coma si no hay saltos de línea).
function dividirCelda(v){
  if(esVacio(v)) return [];
  const texto = String(v).trim();
  const partes = texto.includes('\n') ? texto.split('\n') : texto.split(/[,;]/);
  return partes.map(x => x.trim()).filter(x => x !== '');
}
 
const grid = document.getElementById('grid');
const buscador = document.getElementById('buscador');
const contador = document.getElementById('contador');
let TODOS = [];
 
function estadoHTML(titulo, texto){
  return `<div class="state">
    <div class="stamp-circle" style="animation:none;border-top-color:var(--gold);"></div>
    <h3>${titulo}</h3>
    <p>${texto}</p>
  </div>`;
}
 
function esVacio(v){
  if(v === null || v === undefined) return true;
  const t = String(v).trim().toLowerCase();
  return t === "" || t === "n/a" || t === "na" || t === "-";
}
 
// Convierte un enlace para compartir de Google Drive a un enlace de imagen directo
function normalizarImagen(url){
  if(!url) return null;
  url = String(url).trim();
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if(url.includes('drive.google.com') && m){
    return `https://lh3.googleusercontent.com/d/${m[1]}=w600`;
  }
  return url;
}
 
function soloNumeros(v){
  return String(v || '').replace(/[^\d+]/g, '');
}
 
const ICONS = {
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.1h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.14.82.84-3.06-.2-.31a8.17 8.17 0 0 1-1.25-4.38c0-4.53 3.69-8.22 8.22-8.22 2.2 0 4.26.86 5.81 2.41a8.15 8.15 0 0 1 2.41 5.81c0 4.53-3.7 8.26-8.19 8.26zm4.5-6.14c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.24-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.09 0 1.23.9 2.42 1.03 2.59.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.46 1.5-1.46H16.6V4.34C16.32 4.3 15.36 4.2 14.24 4.2c-2.33 0-3.93 1.42-3.93 4.03V10.5H7.8v3h2.5V21h3.2z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.82a4.6 4.6 0 0 1-3.3-1.39V15.4a5.6 5.6 0 1 1-4.8-5.54v2.62a3 3 0 1 0 2.1 2.86V2h2.6a4.6 4.6 0 0 0 4.2 4.58V9.2a7.16 7.16 0 0 1-2.6-.5v4.6a5.7 5.7 0 0 1-.2 1.5c-.03-.02-.02-.02 0 0a6.9 6.9 0 0 0 .2-1.5V2h1.8z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>`
};
 
function tarjetaHTML(p, indice){
  const cardId = `card-${indice}`;
 
  const pills = p.presentaciones.map((pr, i) => `
    <button type="button" class="pill${i === 0 ? ' active' : ''}" data-precio="${pr.precio}">${pr.nombre}</button>
  `).join('');
 
  const precioInicial = p.presentaciones.length ? p.presentaciones[0].precio : '';
 
  const redes = [];
  if(p.facebook)  redes.push(`<a class="icon-btn fb" href="${p.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.facebook}</a>`);
  if(p.instagram) redes.push(`<a class="icon-btn ig" href="${p.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>`);
  if(p.tiktok)    redes.push(`<a class="icon-btn tt" href="${p.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ICONS.tiktok}</a>`);
  if(p.whatsapp)  redes.push(`<a class="icon-btn wa" href="https://wa.me/${soloNumeros(p.whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.whatsapp}</a>`);
 
  const imagen = p.imagen
    ? `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;placeholder&quot;>Foto no disponible</div>'">`
    : `<div class="placeholder">Sin foto</div>`;
 
  return `
  <article class="card" id="${cardId}">
    <div class="card-photo">
      <div class="photo-inner">${imagen}</div>
      ${precioInicial ? `<div class="price-badge">$${precioInicial}</div>` : ''}
    </div>
    <div class="card-body">
      <h2>${p.nombre || 'Producto sin nombre'}</h2>
      <div class="name-rule"></div>
      ${p.descripcion ? `<p class="desc">${p.descripcion}</p>` : ''}
      ${p.presentaciones.length ? `
        <div class="presentation-label">Presentación / tamaño:</div>
        <div class="presentations">${pills}</div>
      ` : ''}
      <div class="contact">
        ${(p.telefono || p.representante) ? `
          <div class="phone-pill">
            ${p.telefono ? `<span class="icon-circle">${ICONS.phone}</span><a href="tel:${soloNumeros(p.telefono)}">${p.telefono}</a>` : ''}
            ${p.telefono && p.representante ? `<span class="sep">·</span>` : ''}
            ${p.representante ? `<span class="rep-inline">${p.representante}</span>` : ''}
          </div>` : ''}
        ${p.correo ? `<div class="email-row">${ICONS.mail}<a href="mailto:${p.correo}">${p.correo}</a></div>` : ''}
        ${redes.length ? `<div class="icon-row">${redes.join('')}</div>` : ''}
      </div>
    </div>
  </article>`;
}
 
function render(lista){
  if(!lista.length){
    grid.innerHTML = estadoHTML('Sin resultados', 'No hay productos que coincidan con tu búsqueda.');
    contador.textContent = '';
    return;
  }
  grid.innerHTML = lista.map(tarjetaHTML).join('');
  contador.textContent = `${lista.length} producto${lista.length === 1 ? '' : 's'}`;
  activarSelectorDePrecios();
}
 
// Al hacer clic en una presentación, actualiza el precio mostrado sobre la foto
// de esa misma tarjeta y marca la presentación seleccionada.
function activarSelectorDePrecios(){
  document.querySelectorAll('.card').forEach(card => {
    const badge = card.querySelector('.price-badge');
    card.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        card.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        if(badge){
          badge.textContent = `$${pill.dataset.precio}`;
          badge.classList.remove('bump');
          void badge.offsetWidth; // reinicia la animación
          badge.classList.add('bump');
        }
      });
    });
  });
}
 
buscador.addEventListener('input', () => {
  const q = buscador.value.trim().toLowerCase();
  const filtrados = TODOS.filter(p =>
    (p.nombre || '').toLowerCase().includes(q) ||
    (p.descripcion || '').toLowerCase().includes(q) ||
    (p.representante || '').toLowerCase().includes(q)
  );
  render(filtrados);
});
 
async function cargarCatalogo(){
  if(!CONFIG.SHEET_ID || CONFIG.SHEET_ID.includes('PEGA_AQUI')){
    grid.innerHTML = estadoHTML(
      'Falta configurar la hoja',
      'Abre script.js y escribe el ID de tu Google Sheet en CONFIG.SHEET_ID (ver las instrucciones en los comentarios).'
    );
    return;
  }
 
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;
 
  try{
    const res = await fetch(url);
    if(!res.ok){
      if(res.status === 404 || res.status === 400){
        throw new Error(`La hoja no responde (código ${res.status}). Verifica que el SHEET_ID sea correcto y que la hoja esté compartida como "Cualquier persona con el enlace: Lector".`);
      }
      throw new Error(`No se pudo leer la hoja (código ${res.status}).`);
    }
    const raw = await res.text();
 
    // Si Google devuelve una página de login en vez de datos, no es JSON válido
    if(raw.indexOf('{') === -1){
      throw new Error('La hoja no es accesible públicamente. Ve a Compartir → Acceso general → "Cualquier persona con el enlace" con rol Lector.');
    }
 
    const json = JSON.parse(raw.substring(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
 
    // Google responde HTTP 200 aunque haya un error de consulta (ej. pestaña no encontrada)
    if(json.status === 'error'){
      const detalle = (json.errors && json.errors[0] && (json.errors[0].detailed_message || json.errors[0].message)) || 'Error desconocido.';
      throw new Error(`Google Sheets respondió con un error: ${detalle}. Revisa que CONFIG.SHEET_NAME ("${CONFIG.SHEET_NAME}") coincida EXACTO con el nombre de tu pestaña.`);
    }
 
    const todasLasFilas = json.table.rows || [];
    const norm = (s) => String(s || '').trim().toLowerCase();
    const tituloNombre = norm(CONFIG.COLUMNS.nombre);
 
    // Google decide por su cuenta si la primera fila es encabezado. Si lo es, llega en
    // json.table.cols (labels); si no, llega como una fila más dentro de rows.
    // Buscamos el encabezado en ambos lugares para que funcione en cualquier caso.
    let cols = json.table.cols.map(c => String(c.label || '').trim());
    let rows = todasLasFilas;
 
    if(!cols.some(c => norm(c) === tituloNombre)){
      const posicion = todasLasFilas.findIndex(fila =>
        fila && fila.c && fila.c.some(cell => cell && norm(cell.v) === tituloNombre)
      );
      if(posicion === -1){
        throw new Error(`No encontré la columna "${CONFIG.COLUMNS.nombre}" en la hoja. Revisa que los encabezados estén escritos igual que en CONFIG.COLUMNS (script.js).`);
      }
      cols = todasLasFilas[posicion].c.map(cell => (cell && cell.v != null) ? String(cell.v).trim() : '');
      rows = todasLasFilas.slice(posicion + 1);
    }
 
    if(!rows.length){
      grid.innerHTML = estadoHTML('El catálogo está vacío', 'La hoja no tiene ninguna fila de productos debajo de los encabezados.');
      return;
    }
 
    const idx = (label) => cols.findIndex(c => c.toLowerCase() === String(label).toLowerCase());
    const getVal = (row, colName) => {
      const i = idx(colName);
      if(i === -1) return '';
      const cell = row.c[i];
      if(!cell) return '';
      return (cell.f !== undefined && cell.f !== null) ? cell.f : (cell.v ?? '');
    };
 
    TODOS = rows.map(row => {
      const C = CONFIG.COLUMNS;
 
      const nombresPresentacion = dividirCelda(getVal(row, CONFIG.PRESENTACIONES_COL));
      const precios = dividirCelda(getVal(row, CONFIG.PRECIOS_COL));
      const presentaciones = nombresPresentacion.map((nombreP, i) => ({
        nombre: nombreP,
        precio: precios[i] !== undefined ? precios[i] : ''
      })).filter(pr => pr.nombre && pr.precio);
 
      const val = (key) => { const v = getVal(row, C[key]); return esVacio(v) ? '' : String(v).trim(); };
 
      const imagenesRaw = dividirCelda(getVal(row, C.imagen));
      const imagenPrincipal = imagenesRaw.length ? normalizarImagen(imagenesRaw[0]) : null;
 
      return {
        nombre: val('nombre'),
        descripcion: val('descripcion'),
        imagen: imagenPrincipal,
        representante: val('representante'),
        telefono: val('telefono'),
        whatsapp: val('whatsapp'),
        correo: val('correo'),
        facebook: val('facebook'),
        instagram: val('instagram'),
        tiktok: val('tiktok'),
        presentaciones
      };
    }).filter(p => p.nombre);
 
    if(!TODOS.length){
      grid.innerHTML = estadoHTML('El catálogo está vacío', 'Aún no hay productos cargados en la hoja de Google Sheets.');
      return;
    }
    render(TODOS);
 
  }catch(err){
    console.error(err);
    grid.innerHTML = estadoHTML(
      'No se pudo cargar el catálogo',
      err.message || 'Revisa que la hoja esté compartida como "Cualquier persona con el enlace puede ver" y que el ID y el nombre de la pestaña en CONFIG sean correctos.'
    );
  }
}
 
cargarCatalogo();
