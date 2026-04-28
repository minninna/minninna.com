const photos = photoDatabase.photos || [];
const categories = ['all', ...(photoDatabase.categories || []).filter(Boolean)];

const heroMedia = document.getElementById('heroMedia');
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
const heroMediaA = document.getElementById('heroMediaA');
const heroMediaB = document.getElementById('heroMediaB');

const heroSlidesDesktop = [
  { // White Bird — landscape 600x480, soggetto centrato
    low:  'https://drscdn.500px.org/photo/1110775529/q%3D75_m%3D600/v2?sig=42a29cc425c8f4bb98ba347c4f213bb2ec8370d5d2f4a53d75d5dfbbd3741367',
    high: 'https://drscdn.500px.org/photo/1110775529/q%3D80_m%3D1024/v2?sig=428efc7235047684f2df75388b6f0fc29a0194ab7816c8d333608d64c0950f11',
    pos:  'center 40%'
  },
  { // One Fine Day — landscape 600x499
    low:  'https://drscdn.500px.org/photo/1111867251/q%3D75_m%3D600/v2?sig=a9177f322421fd0545fff09f9516a00d6928dab84f1ddb2abf22869711971b9c',
    high: 'https://drscdn.500px.org/photo/1111867251/q%3D80_m%3D1024/v2?sig=aa4ebf816bc37bced2193cf67ccf81d0839c5440bd5b66beb32e6c4c94a72e06',
    pos:  'center 35%'
  },
  { // I Didn't Know I Was Looking for Love — landscape 600x402
    low:  'https://drscdn.500px.org/photo/1118124011/q%3D75_m%3D600/v2?sig=56d0e31104d45300a4df82933ce208e17e970845de35ce1da1224982da33fe43',
    high: 'https://drscdn.500px.org/photo/1118124011/q%3D90_m%3D2048/v2?sig=8b74fcef261b7dbfd5d360067150b02d894b2b7638846868c02bd603b6c6343e',
    pos:  'center 45%'
  }
];

const heroSlidesMobile = [
  { // Here Comes The Sun — portrait 536x600
    low:  'https://drscdn.500px.org/photo/1110537354/q%3D75_m%3D600/v2?sig=1b6cac23c1677a8bbb7bde3ea0b4f77c53e7fdb8d87e37eb4058f5d875db5c50',
    high: 'https://drscdn.500px.org/photo/1110537354/q%3D80_m%3D1024/v2?sig=002d89224813467530b7040c08b3b75f4f8dac096b02519857efe60eafaab5c7',
    pos:  'center 30%'
  },
  { // The Man Comes Around — portrait 400x600
    low:  'https://drscdn.500px.org/photo/1109887005/q%3D75_m%3D600/v2?sig=1a2029922ec923b964a3e5b9a57439c53faa61cc36e2e448ff7d5d8216b99156',
    high: 'https://drscdn.500px.org/photo/1109887005/q%3D75_m%3D600/v2?sig=1a2029922ec923b964a3e5b9a57439c53faa61cc36e2e448ff7d5d8216b99156',
    pos:  'center 25%'
  },
  { // Sanctify Yourself — portrait 450x600
    low:  'https://drscdn.500px.org/photo/1110542817/q%3D75_m%3D600/v2?sig=35f4407bb1f0dd25999c1ceee6a0a59ff1bdebe03596c0a0f60ca1a0712c3014',
    high: 'https://drscdn.500px.org/photo/1110542817/q%3D75_m%3D600/v2?sig=35f4407bb1f0dd25999c1ceee6a0a59ff1bdebe03596c0a0f60ca1a0712c3014',
    pos:  'center 30%'
  }
];

let heroIndex = 0;
let heroActiveLayer = 'a'; // which layer is currently showing

function getSlides() {
  return window.innerWidth <= 768 ? heroSlidesMobile : heroSlidesDesktop;
}

function applySlide(layer, slide) {
  const el = layer === 'a' ? heroMediaA : heroMediaB;
  // blur-up: load low first, then high
  el.style.backgroundImage = `url("${slide.low}")`;
  el.style.backgroundPosition = slide.pos;
  const img = new Image();
  img.onload = () => { el.style.backgroundImage = `url("${slide.high}")`; };
  img.src = slide.high;
}

function heroNext() {
  const slides = getSlides();
  heroIndex = (heroIndex + 1) % slides.length;
  const next = slides[heroIndex];

  if (heroActiveLayer === 'a') {
    // load into B, then crossfade B over A
    applySlide('b', next);
    heroMediaB.classList.add('active');
    heroMediaA.classList.add('fade-out');
    heroActiveLayer = 'b';
  } else {
    // load into A, then crossfade A over B
    applySlide('a', next);
    heroMediaA.classList.remove('fade-out');
    heroMediaB.classList.remove('active');
    heroActiveLayer = 'a';
  }
}

// Init: load first slide on A
applySlide('a', getSlides()[0]);
// 12s display, then crossfade 2s, repeat every 14s
setTimeout(() => {
  heroNext();
  setInterval(heroNext, 14000);
}, 12000);

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
