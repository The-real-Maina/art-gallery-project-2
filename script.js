// ============================================================
// SHARED HELPERS
// ============================================================
function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(text).replace(/[&<>"']/g, c => map[c]);
}

function getArtistName(key) {
  const artist = ARTISTS.find(a => a.key === key);
  return artist ? artist.name : key;
}

// Today's date as YYYY-MM-DD in the visitor's local time zone
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// ============================================================
// 1. RENDER ARTWORK CARDS FROM data.js
// ============================================================
function renderGallery(container, list) {
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No artworks match your search. Try a different name or choose "All Artists".</p>';
    return;
  }

  list.forEach((art, index) => {
    const artist = getArtistName(art.artistKey);
    const card = document.createElement('article');
    card.className = 'art-card';
    card.innerHTML = `
      <img src="${escapeHtml(art.image)}"
           alt="${escapeHtml(art.title)} by ${escapeHtml(artist)}"
           data-index="${index}" tabindex="0" role="button">
      ${favButtonHtml(art)}
      <h3><a href="artwork.html?id=${art.id}">${escapeHtml(art.title)}</a></h3>
      <p>By ${escapeHtml(artist)}</p>`;
    container.appendChild(card);
  });
}

// Click or press Enter/Space on an artwork image to open the lightbox
function bindGalleryClicks(container) {
  container.addEventListener('click', e => {
    const img = e.target.closest('img[data-index]');
    if (img) openLightbox(Number(img.dataset.index));
  });

  container.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('img[data-index]')) {
      e.preventDefault();
      openLightbox(Number(e.target.dataset.index));
    }
  });
}

// ============================================================
// 2. LIGHTBOX (previous / next, keyboard, caption)
// ============================================================
let currentList = [];   // the artworks currently shown on the page
let lightboxIndex = 0;
let lastFocused = null;

function isLightboxOpen() {
  const lightbox = document.getElementById('lightbox');
  return lightbox && lightbox.style.display === 'flex';
}

function showLightboxImage() {
  const art = currentList[lightboxIndex];
  if (!art) return;

  const artist = getArtistName(art.artistKey);
  const img = document.getElementById('lightboxImg');

  // Load a larger version of the image for the viewer
  img.src = art.image.replace('w=500', 'w=1400');
  img.alt = `${art.title} by ${artist}`;
  document.getElementById('lightboxCaption').textContent = `${art.title}, by ${artist}`;

  const multiple = currentList.length > 1;
  document.getElementById('lbPrev').style.display = multiple ? '' : 'none';
  document.getElementById('lbNext').style.display = multiple ? '' : 'none';
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lastFocused = document.activeElement;
  lightboxIndex = index;
  showLightboxImage();
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // stop the page scrolling behind the viewer
  lightbox.querySelector('.close-btn').focus();
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.style.display = 'none';
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

function stepLightbox(direction) {
  if (currentList.length < 2) return;
  lightboxIndex = (lightboxIndex + direction + currentList.length) % currentList.length;
  showLightboxImage();
}

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  // Click on the dark background closes it; clicks on the image or buttons do not
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  lightbox.querySelector('.close-btn').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => stepLightbox(-1));
  document.getElementById('lbNext').addEventListener('click', () => stepLightbox(1));

  document.addEventListener('keydown', e => {
    if (!isLightboxOpen()) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });
}

// ============================================================
// 3. HOME PAGE: FEATURED ARTWORKS
// ============================================================
function setupFeatured() {
  const container = document.getElementById('featuredContainer');
  if (!container) return;

  currentList = ARTWORKS.filter(a => a.featured);
  renderGallery(container, currentList);
  bindGalleryClicks(container);
}

// ============================================================
// 4. ARTISTS PAGE: SEARCH + FILTER + SORT
// ============================================================
const SORTERS = {
  'default': (a, b) => a.id - b.id,
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title),
  'artist-asc': (a, b) =>
    getArtistName(a.artistKey).localeCompare(getArtistName(b.artistKey)) ||
    a.title.localeCompare(b.title)
};

function setupArtistsPage() {
  const container = document.getElementById('artworkContainer');
  if (!container) return;

  const searchInput = document.getElementById('artSearch');
  const filterSelect = document.getElementById('artistFilter');
  const sortSelect = document.getElementById('artSort');
  const countText = document.getElementById('resultsCount');

  // Build the artist dropdown from data.js
  ARTISTS.forEach(artist => {
    const option = document.createElement('option');
    option.value = artist.key;
    option.textContent = artist.name;
    filterSelect.appendChild(option);
  });

  function update() {
    const query = searchInput.value.trim().toLowerCase();
    const artistKey = filterSelect.value;

    currentList = ARTWORKS
      .filter(art => artistKey === 'all' || art.artistKey === artistKey)
      .filter(art => {
        if (!query) return true;
        return `${art.title} ${getArtistName(art.artistKey)}`.toLowerCase().includes(query);
      })
      .sort(SORTERS[sortSelect.value]);

    renderGallery(container, currentList);

    const n = currentList.length;
    countText.textContent = `${n} artwork${n === 1 ? '' : 's'} shown`;
  }

  searchInput.addEventListener('input', update);
  filterSelect.addEventListener('change', update);
  sortSelect.addEventListener('change', update);

  bindGalleryClicks(container);
  update();
}

// ============================================================
// 5. MOBILE MENU
// ============================================================
function setupNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// ============================================================
// START
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavToggle();
  setupLightbox();
  setupFeatured();
  setupArtistsPage();
});