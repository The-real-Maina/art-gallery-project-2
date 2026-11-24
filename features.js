// ============================================================
// FEATURES: dark mode, favourites, artwork detail, exhibitions
// Load after script.js (and after data.js on pages that use artworks).
// ============================================================

// ---------- 1. DARK MODE ----------
function setupTheme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  function paint() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? 'Light mode' : 'Dark mode';
    btn.setAttribute('aria-pressed', String(dark));
  }

  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('artisanTheme', next); } catch (e) { /* storage blocked */ }
    paint();
  });

  paint();
}

// ---------- 2. FAVOURITES (saved in this browser) ----------
const FAV_KEY = 'artisanFavourites';

function getFavs() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function isFav(id) {
  return getFavs().includes(id);
}

// Adds or removes an artwork and returns whether it is now a favourite
function toggleFav(id) {
  let favs = getFavs();
  const on = !favs.includes(id);
  favs = on ? favs.concat(id) : favs.filter(f => f !== id);
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) { /* storage blocked */ }
  return on;
}

function favInner(on, withLabel) {
  return `<span aria-hidden="true">${on ? '&#9829;' : '&#9825;'}</span>` +
    (withLabel ? (on ? ' Saved' : ' Save to favourites') : '');
}

function favButtonHtml(art, withLabel) {
  const on = isFav(art.id);
  return `<button type="button" class="fav-btn${withLabel ? ' fav-btn--label' : ''}"
    data-id="${art.id}" data-label="${withLabel ? 1 : 0}" aria-pressed="${on}"
    aria-label="Favourite: ${escapeHtml(art.title)}">${favInner(on, withLabel)}</button>`;
}

function setupFavButtons() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const on = toggleFav(id);

    document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(b => {
      b.setAttribute('aria-pressed', String(on));
      b.innerHTML = favInner(on, b.dataset.label === '1');
    });

    if (document.getElementById('favContainer')) renderFavourites();
  });
}

function renderFavourites() {
  const container = document.getElementById('favContainer');
  const count = document.getElementById('favCount');
  if (!container) return;

  const list = ARTWORKS.filter(a => isFav(a.id));
  currentList = list;

  if (list.length === 0) {
    container.innerHTML = '<p class="empty-state">You have not saved any artworks yet. ' +
      'Browse the <a href="artists.html">artists page</a> and tap the heart on a piece you like.</p>';
    count.textContent = '';
    return;
  }

  renderGallery(container, list);
  count.textContent = `${list.length} saved artwork${list.length === 1 ? '' : 's'}`;
}

function setupFavouritesPage() {
  const container = document.getElementById('favContainer');
  if (!container) return;
  bindGalleryClicks(container);
  renderFavourites();
}

// ---------- 3. EXHIBITIONS (dates and status badges) ----------
function shortDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function exhibitionStatus(ex) {
  const today = todayString();
  if (today < ex.start) return { label: 'Opening soon', cls: 'soon' };
  if (today > ex.end) return { label: 'Ended', cls: 'ended' };
  return { label: 'On now', cls: 'now' };
}

function setupExhibitions() {
  const body = document.getElementById('exhibitionBody');
  if (!body) return;

  body.innerHTML = EXHIBITIONS.map(ex => {
    const status = exhibitionStatus(ex);
    const art = ARTWORKS.find(a => a.title === ex.name);
    const name = art
      ? `<a href="artwork.html?id=${art.id}">${escapeHtml(ex.name)}</a>`
      : escapeHtml(ex.name);

    return `<tr>
      <td>${name}</td>
      <td>${escapeHtml(getArtistName(ex.artistKey))}</td>
      <td>${shortDate(ex.start)} to ${shortDate(ex.end)}</td>
      <td>${escapeHtml(ex.location)}</td>
      <td><span class="badge badge-${status.cls}">${status.label}</span></td>
    </tr>`;
  }).join('');
}

// ---------- 4. ARTWORK DETAIL PAGE (artwork.html?id=2) ----------
function setupArtworkPage() {
  const box = document.getElementById('artworkDetail');
  if (!box) return;

  const id = Number(new URLSearchParams(window.location.search).get('id'));
  const art = ARTWORKS.find(a => a.id === id);

  if (!art) {
    box.innerHTML = '<p class="empty-state">We could not find that artwork. ' +
      '<a href="artists.html">Browse all artworks</a>.</p>';
    return;
  }

  const artist = getArtistName(art.artistKey);
  const ex = EXHIBITIONS.find(e => e.name === art.title);
  const others = ARTWORKS.filter(a => a.artistKey === art.artistKey && a.id !== art.id);
  document.title = `${art.title} | Artisan Gallery`;

  let showLine = '';
  if (ex) {
    const status = exhibitionStatus(ex);
    showLine = `<p class="detail-show">Exhibited in the ${escapeHtml(ex.location)},
      ${shortDate(ex.start)} to ${shortDate(ex.end)}
      <span class="badge badge-${status.cls}">${status.label}</span></p>`;
  }

  box.innerHTML = `
    <a class="back-link" href="artists.html">Back to all artworks</a>
    <div class="detail">
      <img class="detail-img" src="${escapeHtml(art.image.replace('w=500', 'w=1000'))}"
           alt="${escapeHtml(art.title)} by ${escapeHtml(artist)}">
      <div class="detail-info">
        <h1>${escapeHtml(art.title)}</h1>
        <p class="detail-artist">By ${escapeHtml(artist)}</p>
        ${showLine}
        ${favButtonHtml(art, true)}
        <p><a class="btn" href="booking.html">Book a visit</a></p>
      </div>
    </div>
    ${others.length ? `<h2 class="section-title">More by ${escapeHtml(artist)}</h2>
      <div class="grid-layout" id="moreContainer"></div>` : ''}`;

  if (others.length) renderGallery(document.getElementById('moreContainer'), others);
}

// ---------- START ----------
document.addEventListener('DOMContentLoaded', () => {
  setupTheme();
  if (typeof ARTWORKS === 'undefined') return; // pages without artwork data stop here
  setupFavButtons();
  setupFavouritesPage();
  setupExhibitions();
  setupArtworkPage();
});