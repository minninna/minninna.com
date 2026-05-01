const photos = photoDatabase.photos || [];
const categories = ['all', ...(photoDatabase.categories || []).filter(Boolean)];

const selectedGrid = document.getElementById('selectedGrid');
const archiveGrid = document.getElementById('archiveGrid');
const filtersEl = document.getElementById('filters');
const nsfwToggle = document.getElementById('nsfwToggle');
const exploreAll = document.getElementById('exploreAll');
const centerAll = document.getElementById('centerAll');
const body = document.body;

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const closeLightbox = document.getElementById('closeLightbox');
const prevLightbox = document.getElementById('prevLightbox');
const nextLightbox = document.getElementById('nextLightbox');

let activeCategory = 'all';
let revealNSFW = false;
let currentList = [];
let currentIndex = 0;

// ── HERO SLIDESHOW ──────────────────────────────────────────
// ============================================================
// HERO — foto flottanti su sfondo nero
// ============================================================

const heroPhotosEl = null; // definito dentro initHero

const heroSlidesDesktop = [
  { low: 'https://drscdn.500px.org/photo/1110775529/q%3D75_m%3D600/v2?sig=42a29cc425c8f4bb98ba347c4f213bb2ec8370d5d2f4a53d75d5dfbbd3741367',
    high: 'https://drscdn.500px.org/photo/1110775529/q%3D80_m%3D1024/v2?sig=428efc7235047684f2df75388b6f0fc29a0194ab7816c8d333608d64c0950f11',
    aspect: 16/10 },
  { low: 'https://drscdn.500px.org/photo/1111867251/q%3D75_m%3D600/v2?sig=a9177f322421fd0545fff09f9516a00d6928dab84f1ddb2abf22869711971b9c',
    high: 'https://drscdn.500px.org/photo/1111867251/q%3D80_m%3D1024/v2?sig=aa4ebf816bc37bced2193cf67ccf81d0839c5440bd5b66beb32e6c4c94a72e06',
    aspect: 16/10 },
  { low: 'https://drscdn.500px.org/photo/1110800360/q%3D75_m%3D600/v2?sig=c5f83659acfd59e525765f92774eaddea4e1e44d844df72ee07ea3cc1fead8c6',
    high: 'https://drscdn.500px.org/photo/1110800360/q%3D80_m%3D1024/v2?sig=1d6778009d1aa8af8e464394d0e0bdca4fd6e3f0933af0abe1b6bb5f92dd8491',
    aspect: 5/4 },
  { low: 'https://drscdn.500px.org/photo/1117038191/q%3D75_m%3D600/v2?sig=e4195f785a4e5e2b45ec3e2ec5e4963126f3018726dd4c99988b3c8f77a1aa72',
    high: 'https://drscdn.500px.org/photo/1117038191/q%3D80_m%3D1024/v2?sig=97d65386c854a368d73b0eb4ddd9fb15b2b99c6842af6ee1a31917f932d6108f',
    aspect: 3/2 },
  { low: 'https://drscdn.500px.org/photo/1110537354/q%3D75_m%3D600/v2?sig=1b6cac23c1677a8bbb7bde3ea0b4f77c53e7fdb8d87e37eb4058f5d875db5c50',
    high: 'https://drscdn.500px.org/photo/1110537354/q%3D80_m%3D1024/v2?sig=002d89224813467530b7040c08b3b75f4f8dac096b02519857efe60eafaab5c7',
    aspect: 9/16 },
  { low: 'https://drscdn.500px.org/photo/1109887005/q%3D75_m%3D600/v2?sig=1a2029922ec923b964a3e5b9a57439c53faa61cc36e2e448ff7d5d8216b99156',
    high: 'https://drscdn.500px.org/photo/1109887005/q%3D75_m%3D600/v2?sig=1a2029922ec923b964a3e5b9a57439c53faa61cc36e2e448ff7d5d8216b99156',
    aspect: 2/3 },
];

const heroSlidesMobile = heroSlidesDesktop; // stesso pool su mobile

window.addEventListener('load', function initHero() {
  const heroPhotosEl = document.getElementById('heroPhotos');
  if (!heroPhotosEl) return;

  const pool = [...heroSlidesDesktop].sort(() => Math.random() - .5);
  let poolIndex = 0;
  const maxVisible = 3;
  const showEvery  = 7000;  // ms tra un'apparizione
  const resetAfter = 28000; // ms prima del reset — 3 foto × 7s = 21s + 7s di pausa
  const introSequenceDelay = 8200; // 1) motto hero 2) pausa 3) dissolvenza/zoom 4) slideshow
  const activeCards = [];
  let zCounter = 2;
  let spawnCount = 0;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnPhoto() {
    if (!heroPhotosEl) return;
    const W = heroPhotosEl.offsetWidth;
    const H = heroPhotosEl.offsetHeight;

    const slide = pool[poolIndex % pool.length];
    poolIndex++;
    spawnCount++;

    // Larghezza 30-42% — cap altezza al 60% hero per le verticali
    const pw  = W * rand(.30, .42);
    const ph  = Math.min(pw / slide.aspect, H * .60);
    const aw  = ph * slide.aspect; // larghezza effettiva dopo il cap

    // Zone sicure: evita logo (top 17%) e motto (bottom 13%)
    const safeTop = H * .17;
    const safeBot = H * .87;

    // Posizione: massimizza distanza dai centri delle card già visibili
    const margin = 0.03;
    let bestLeft = rand(W * margin, W - aw - W * margin);
    let bestTop  = rand(safeTop, Math.max(safeTop + 1, safeBot - ph));
    let bestDist = -1;

    const attempts = 18;
    for (let i = 0; i < attempts; i++) {
      const cl = rand(W * margin, W - aw - W * margin);
      const ct = rand(safeTop, Math.max(safeTop + 1, safeBot - ph));
      const cx = cl + aw / 2;
      const cy = ct + ph / 2;

      let minDist = Infinity;
      activeCards.forEach(card => {
        const ex = parseFloat(card.style.left) + parseFloat(card.style.width)  / 2;
        const ey = parseFloat(card.style.top)  + parseFloat(card.style.height) / 2;
        const d  = Math.hypot(cx - ex, cy - ey);
        if (d < minDist) minDist = d;
      });

      if (activeCards.length === 0) minDist = Infinity;
      if (minDist > bestDist) { bestDist = minDist; bestLeft = cl; bestTop = ct; }
    }

    const left = bestLeft;
    const top  = bestTop;

    const el = document.createElement('div');
    const edgeVariant = Math.floor(Math.random() * 4) + 1;
    el.className = `hero-photo edge-rough-${edgeVariant}`;
    el.style.cssText = `width:${aw}px;height:${ph}px;top:${top}px;left:${left}px;background-image:url("${slide.low}");z-index:${++zCounter};`;
    heroPhotosEl.appendChild(el);

    const img = new Image();
    img.onload = () => { el.style.backgroundImage = `url("${slide.high}")`; };
    img.src = slide.high;

    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('visible')));
    activeCards.push(el);

    if (activeCards.length > maxVisible) {
      const old = activeCards.shift();
      old.classList.remove('visible');
      old.classList.add('fading');
      setTimeout(() => old.remove(), 2400);
    }

    setTimeout(spawnPhoto, showEvery);
  }

  setTimeout(spawnPhoto, introSequenceDelay);

  // Reset completo: tutte svaniscono → nero → ricomincia
  setInterval(() => {
    activeCards.forEach(el => {
      el.classList.remove('visible');
      el.classList.add('fading');
      setTimeout(() => el.remove(), 2400);
    });
    activeCards.length = 0;
    spawnCount = 0;
  }, resetAfter);
});

const preferredCategories = [
  'Moments & Mates',
  'Wandering around this planet',
  'Visions',
  'The Whereabout of life'
];

const categoryShortLabels = {
  'Wandering around this planet': 'Wandering<br>around this planet',
  'The Whereabout of life': 'The Whereabout<br>of life',
};
const categoryFilterLabelsMobile = {
  'Wandering around this planet': 'Wandering',
  'The Whereabout of life': 'Whereabout',
  'Moments & Mates': 'Mates',
};
const categoryFilterLabelsDesktop = {
  'Wandering around this planet': 'Wandering around this planet',
  'The Whereabout of life': 'The Whereabout of life',
  'Moments & Mates': 'Moments & Mates',
  'Visions': 'Visions',
};
function shortLabel(cat) { return categoryShortLabels[cat] || cat; }
function altText(photo) {
  const milancats = ['Moments & Mates', 'Visions'];
  const suffix = milancats.includes(photo.category) ? ' — portrait photography Milan' : ' — photography Milan';
  return photo.title + suffix;
}
function filterLabel(cat) {
  if (window.innerWidth <= 768) {
    return categoryFilterLabelsMobile[cat] || cat;
  }
  return categoryFilterLabelsDesktop[cat] || cat;
}

function scrollToArchive() {
  document.getElementById('archive').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setCategory(category) {
  activeCategory = category;
  renderFilters();
  renderSelected();
  renderArchive();
}

const categoryCovers = {
  'Moments & Mates': photos.find(p => p.title === "I Don't Want to Talk About It") || photos.find(p => p.category === 'Moments & Mates'),
  'Wandering around this planet': photos.find(p => p.title === 'One Fine Day') || photos.find(p => p.category === 'Wandering around this planet'),
  'Visions': photos.find(p => p.title === 'Ocean Eyes') || photos.find(p => p.category === 'Visions'),
  'The Whereabout of life': photos.find(p => p.category === 'The Whereabout of life'),
};

function createCategoryCard(category, index) {
  const representative = categoryCovers[category] || photos.find((photo) => photo.category === category) || photos[0];
  const thumb = representative.imageLowUrl || representative.imageUrl;
  const article = document.createElement('article');
  article.className = `category-card cat-${index} ${representative?.nsfw ? 'is-nsfw' : ''}`;
  article.innerHTML = `
    <img
      src="${thumb}"
      alt="${category}"
      loading="lazy"
      decoding="async"
      width="${representative.width}"
      height="${representative.height}"
    />
    <div class="card-meta"><div class="card-title">${shortLabel(category)}</div></div>
  `;
  article.addEventListener('click', () => {
    setCategory(category);
    scrollToArchive();
  });
  return article;
}

function passCategory(photo) { return activeCategory === 'all' || photo.category === activeCategory; }
function archiveFiltered() { return photos.filter(passCategory); }

function createArchiveCard(photo, listRef) {
  const article = document.createElement('article');
  article.className = `archive-card ${photo.nsfw ? 'is-nsfw' : ''}`;
  const thumb = photo.imageLowUrl || photo.imageUrl;
  article.innerHTML = `
    <img
      src="${thumb}"
      alt="${altText(photo)}"
      loading="lazy"
      decoding="async"
      width="${photo.width}"
      height="${photo.height}"
    />
    <div class="card-meta"><div class="card-title">${photo.title}</div></div>
  `;
  article.addEventListener('click', () => openLightbox(photo, listRef, true));
  return article;
}

function renderSelected() {
  const grid = document.getElementById('selectedGrid');
  if (!grid) return;
  grid.innerHTML = '';
  preferredCategories.forEach((category, index) => grid.appendChild(createCategoryCard(category, index)));
}

function renderArchive() {
  archiveGrid.innerHTML = '';
  const list = archiveFiltered();
  list.forEach((photo) => archiveGrid.appendChild(createArchiveCard(photo, list)));
  applyStagger(archiveGrid);
  const countEl = document.getElementById('archiveCount');
  if (countEl) countEl.textContent = list.length + ' photo' + (list.length !== 1 ? 's' : '');
}

function renderFilters() {
  filtersEl.innerHTML = '';
  const filterAll = document.getElementById('filterAll');
  if (filterAll) {
    filterAll.classList.toggle('active', activeCategory === 'all');
    filterAll.onclick = () => setCategory('all');
  }
  categories.filter(c => c !== 'all').forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter-btn ${category === activeCategory ? 'active' : ''}`;
    button.textContent = filterLabel(category);
    button.addEventListener('click', () => setCategory(category));
    filtersEl.appendChild(button);
  });
}

function syncNSFW() {
  body.classList.toggle('reveal-nsfw', revealNSFW);
  if (!nsfwToggle) return;
  nsfwToggle.classList.toggle('active', revealNSFW);
  nsfwToggle.setAttribute('aria-pressed', String(revealNSFW));
  const label = nsfwToggle.querySelector('.nsfw-line-1');
  if (label) label.textContent = revealNSFW ? 'Hide' : 'Reveal';
}

function openLightbox(photo, list, showArrows) {
  currentList = list || archiveFiltered();
  currentIndex = Math.max(0, currentList.findIndex((item) => item.imageUrl === photo.imageUrl && item.title === photo.title));
  updateLightbox();
  // frecce solo nel portfolio
  const show = showArrows === true;
  if (prevLightbox) prevLightbox.style.display = show ? '' : 'none';
  if (nextLightbox) nextLightbox.style.display = show ? '' : 'none';
  if (typeof lightbox.showModal === 'function') lightbox.showModal();
  // GA4 tracking — photo_open event con photo_title e category
  if (typeof gtag === 'function') {
    gtag('event', 'photo_open', {
      photo_title: photo.title,
      photo_category: photo.category || 'uncategorized'
    });
  }
}

function updateLightbox() {
  const photo = currentList[currentIndex];
  if (!photo) return;
  lightboxImage.src = photo.imageUrl;
  lightboxImage.alt = photo.title;
  lightboxTitle.textContent = photo.title;
  lightboxCategory.textContent = photo.category || '';
}

function stepLightbox(direction) {
  if (!currentList.length) return;
  currentIndex = (currentIndex + direction + currentList.length) % currentList.length;
  updateLightbox();
}

if (nsfwToggle) nsfwToggle.addEventListener('click', () => { revealNSFW = !revealNSFW; syncNSFW(); });
if (exploreAll) exploreAll.addEventListener('click', () => { setCategory('all'); scrollToArchive(); });
if (centerAll) centerAll.addEventListener('click', () => { setCategory('all'); scrollToArchive(); });
if (closeLightbox) closeLightbox.addEventListener('click', () => lightbox.close());
if (prevLightbox) prevLightbox.addEventListener('click', (e) => { e.stopPropagation(); stepLightbox(-1); });
if (nextLightbox) nextLightbox.addEventListener('click', (e) => { e.stopPropagation(); stepLightbox(1); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.open) return;
  if (e.key === 'Escape') lightbox.close();
  if (e.key === 'ArrowLeft') stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
});
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) lightbox.close();
});

function renderLatestShots() {
  const grid = document.getElementById('latestGrid');
  if (!grid || typeof latestShots === 'undefined') return;
  grid.innerHTML = '';
  latestShots.titles.forEach((shotTitle) => {
    const photo = photos.find(p => p.title === shotTitle);
    if (!photo) return;
    const article = document.createElement('article');
    article.className = `topshot-card ${photo.nsfw ? 'is-nsfw' : ''}`;
    const thumb = photo.imageLowUrl || photo.imageUrl;
    article.innerHTML = `
      <img
      src="${thumb}"
      alt="${altText(photo)}"
      loading="lazy"
      decoding="async"
      width="${photo.width}"
      height="${photo.height}"
    />
      <div class="card-meta"><div class="card-title">${photo.title}</div></div>
    `;
    article.addEventListener('click', () => openLightbox(photo, photos, false));
    grid.appendChild(article);
  });
  applyStagger(grid);
}

function renderTopShots() {
  const grid = document.getElementById('topshotsGrid');
  const title = document.getElementById('topshotsTitle');
  if (!grid || !title || typeof topShots === 'undefined') return;
  title.textContent = 'Top shots · ' + topShots.month;
  grid.innerHTML = '';
  topShots.titles.forEach((shotTitle, i) => {
    const photo = photos.find(p => p.title === shotTitle);
    if (!photo) return;
    const article = document.createElement('article');
    article.className = `topshot-card ${photo.nsfw ? 'is-nsfw' : ''}`;
    const tthumb = photo.imageLowUrl || photo.imageUrl;
    article.innerHTML = `
      <img
      src="${tthumb}"
      alt="${altText(photo)}"
      loading="lazy"
      decoding="async"
      width="${photo.width}"
      height="${photo.height}"
    />
      <span class="topshot-rank">${i + 1}</span>
      <div class="card-meta"><div class="card-title">${photo.title}</div></div>
    `;
    article.addEventListener('click', () => openLightbox(photo, photos, false));
    grid.appendChild(article);
  });
  applyStagger(grid);
}

function applyStagger(grid) {
  const cards = grid.querySelectorAll('.archive-card, .topshot-card');
  cards.forEach((card, i) => {
    // Lazy loading: eager for first 4, lazy for rest
    const img = card.querySelector('img');
    if (img) img.loading = i < 4 ? 'eager' : 'lazy';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      const idx = Array.from(cards).indexOf(card);
      // Stagger within each group of ~3 (column count), max 210ms delay
      const delay = (idx % 3) * 70;
      setTimeout(() => card.classList.add('card-visible'), delay);
      observer.unobserve(card);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  cards.forEach(card => observer.observe(card));
}

function renderRandomShot() {
  const wrap = document.getElementById('randomshotWrap');
  const title = document.getElementById('randomshotTitle');
  if (!wrap || !photos.length) return;
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const photo = photos[dayOfYear % photos.length];
  if (title) title.textContent = photo.title;
  const article = document.createElement('article');
  article.className = `randomshot-card ${photo.nsfw ? 'is-nsfw' : ''}`;
  article.innerHTML = `<img
      src="${photo.imageUrl}"
      alt="${altText(photo)}"
      loading="lazy"
      decoding="async"
      width="${photo.width}"
      height="${photo.height}"
      style="aspect-ratio:${photo.width}/${photo.height};"
    />`;
  article.addEventListener('click', () => openLightbox(photo, photos, false));
  wrap.appendChild(article);
}

const scrollIndicator = document.getElementById('scrollIndicator');
const backToTop = document.getElementById('backToTop');
const navBrand = document.getElementById('navBrand');
const heroSection = document.getElementById('heroSection');

// Nascondi brand wordmark quando la hero è visibile
if (navBrand && heroSection) {
  const brandObserver = new IntersectionObserver(
    ([entry]) => navBrand.classList.toggle('hero-hidden', entry.isIntersecting),
    { threshold: 0.1 }
  );
  brandObserver.observe(heroSection);
}

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (scrollIndicator) scrollIndicator.classList.toggle('hidden', y > 80);
  if (backToTop) backToTop.classList.toggle('visible', y > 400);
}, { passive: true });
if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

renderSelected();
renderFilters();
renderArchive();
renderLatestShots();
renderTopShots();
renderRandomShot();
syncNSFW();

// Re-render filter labels on resize/orientation change
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderFilters, 150);
});
/* hamburger */
const navHamburger = document.getElementById('navHamburger');
const siteNav = document.getElementById('siteNav');
if (navHamburger && siteNav) {
  navHamburger.addEventListener('click', () => {
    navHamburger.classList.toggle('open');
    siteNav.classList.toggle('open');
  });
  siteNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navHamburger.classList.remove('open');
      siteNav.classList.remove('open');
    });
  });
}

/* ============================================================
   CONTACT DRAWER
   ============================================================ */
const openDrawerBtn  = document.getElementById('openDrawer');
const closeDrawerBtn = document.getElementById('closeDrawer');
const drawerOverlay  = document.getElementById('drawerOverlay');
const contactDrawer  = document.getElementById('contactDrawer');

function openDrawer() {
  contactDrawer.classList.add('open');
  contactDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  contactDrawer.classList.remove('open');
  contactDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (openDrawerBtn)  openDrawerBtn.addEventListener('click', openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
if (drawerOverlay)  drawerOverlay.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && contactDrawer?.classList.contains('open')) closeDrawer();
});

/* form submit via Formspree (async) */
const contactForm   = document.getElementById('contactForm');
const drawerConfirm = document.getElementById('drawerConfirm');
const drawerSendBtn = document.getElementById('drawerSendBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    drawerSendBtn.disabled = true;
    drawerSendBtn.textContent = 'Sending…';
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        contactForm.style.display = 'none';
        drawerConfirm.style.display = 'block';
      } else {
        drawerSendBtn.disabled = false;
        drawerSendBtn.textContent = 'Try again';
      }
    } catch {
      drawerSendBtn.disabled = false;
      drawerSendBtn.textContent = 'Try again';
    }
  });
}

/* See rates accordion */
document.querySelectorAll('.contact-card-rates-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = btn.nextElementSibling;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.setAttribute('aria-hidden', String(expanded));
    panel.classList.toggle('open', !expanded);
  });
});

/* disable right click */
document.addEventListener('contextmenu', e => e.preventDefault());
