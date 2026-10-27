/**
 * js/ui.js
 * Helpers de renderizado y componentes reutilizables (vanilla, sin framework).
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

export function toast(msg, ms = 3200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.add('hidden'), ms);
}

export function playerCard({ sports_name = 'Jugador', country, city, primary_position, category, verified = false, age }) {
  const initials = sports_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return el('article', { class: 'card player-card' },
    el('div', { class: 'player-avatar' }, initials),
    el('div', {},
      el('div', { class: 'flex' },
        el('h3', {}, sports_name),
        verified ? el('span', { class: 'badge verified' }, 'Verificado') : null),
      el('p', { class: 'player-meta' },
        [primary_position, category, age ? `${age} años` : null, [country, city].filter(Boolean).join(', ')].filter(Boolean).join(' · '))));
}

export function phaseNotice(phase, text) {
  return el('div', { class: 'phase-notice' }, `FASE ${phase} — ${text}`);
}

export function spinner() { return el('div', { class: 'spinner', role: 'status', 'aria-label': 'Cargando' }); }
