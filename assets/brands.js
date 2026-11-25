import { brandDirectory } from './brand-directory.js';

const filters = document.querySelector('.brand-letters');
const grid = document.querySelector('.brand-grid');
const more = document.querySelector('.brand-more');
const status = document.querySelector('.brand-status');
const pageSize = 20;
const entries = brandDirectory.map(([name, logo]) => {
  const initial = name.normalize('NFD')[0].toUpperCase();
  return { name, logo, letter: /^[A-Z]$/.test(initial) ? initial : '#' };
});
const available = new Set(entries.map(({ letter }) => letter));
let matching = entries;
let visible = 0;
let selected = 'all';

function addPage() {
  const page = document.createDocumentFragment();
  for (const { name, logo } of matching.slice(visible, visible + pageSize)) {
    const tile = document.createElement('li');
    tile.className = 'brand-card glass';
    if (logo) {
      const image = document.createElement('img');
      image.className = 'brand-logo';
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.src = `./assets/brands/${logo}.webp`;
      image.addEventListener('error', () => image.remove(), { once: true });
      tile.append(image);
    }
    const label = document.createElement('span');
    label.className = 'brand-label';
    label.textContent = name;
    tile.append(label);
    page.append(tile);
  }
  visible = Math.min(visible + pageSize, matching.length);
  grid.append(page);
  more.hidden = visible >= matching.length;
  status.textContent = `Показано ${visible} из ${matching.length}`;
}

for (const letter of ['all', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#']) {
  const button = document.createElement('button');
  button.className = 'brand-letter evok-button';
  button.type = 'button';
  button.dataset.letter = letter;
  button.textContent = letter === 'all' ? 'Все' : letter;
  button.disabled = letter !== 'all' && !available.has(letter);
  button.setAttribute('aria-pressed', String(letter === selected));
  button.setAttribute('aria-controls', grid.id);
  if (letter === '#') button.setAttribute('aria-label', 'Цифры и другие символы');
  filters.append(button);
}

filters.addEventListener('click', (event) => {
  const button = event.target.closest('.brand-letter');
  if (!button || button.dataset.letter === selected) return;
  filters.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-pressed', 'true');
  selected = button.dataset.letter;
  matching = selected === 'all' ? entries : entries.filter(({ letter }) => letter === selected);
  visible = 0;
  grid.replaceChildren();
  addPage();
});

more.addEventListener('click', addPage);
addPage();
filters.hidden = false;
