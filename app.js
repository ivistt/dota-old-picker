// ── Config ──
const IMG_PATH = './images/';
const CARD_W   = 216;   // base card width
const CARD_H   = 312;   // base card height
let SPACING    = 450;   // recalculated on resize
let CARD_W_CUR = 216;
let CARD_H_CUR = 312;
const MAX_ROT  = 52;    // max rotateY degrees for far cards
const MAX_DIST = 5;     // cards beyond this look fully side-on

function heroImg(key) {
  return `${IMG_PATH}npc_dota_hero_${key}_png.png`;
}

// ── Создаёт <img>, <video> или <img>(gif) в зависимости от наличия медиа ──
function createHeroMediaEl(hero) {
  const media = getHeroMedia(hero.key);

  if (media && media.type === 'mp4') {
    const vid = document.createElement('video');
    vid.src = media.file;
    vid.autoplay = true;
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.className = 'card-portrait';
    vid.setAttribute('playsinline', '');
    vid.onerror = function() {
      const fallback = document.createElement('img');
      fallback.src = heroImg(hero.key);
      fallback.alt = hero.name;
      fallback.className = 'card-portrait';
      fallback.onerror = function() { this.onerror=null; this.src=makePlaceholder(hero.name,hero.attribute); };
      vid.parentNode && vid.parentNode.replaceChild(fallback, vid);
    };
    return vid;
  }

  if (media && media.type === 'gif') {
    const img = document.createElement('img');
    img.src = media.file;
    img.alt = hero.name;
    img.className = 'card-portrait';
    img.onerror = function() {
      this.onerror = null; this.src = heroImg(hero.key);
      this.onerror = function() { this.onerror=null; this.src=makePlaceholder(hero.name,hero.attribute); };
    };
    return img;
  }

  const img = document.createElement('img');
  img.src = heroImg(hero.key);
  img.alt = hero.name;
  img.loading = 'lazy';
  img.className = 'card-portrait';
  img.onerror = function() { this.onerror=null; this.src=makePlaceholder(hero.name,hero.attribute); };
  return img;
}

function makePlaceholder(name, attribute) {
  const colors = { strength:'#c0392b', agility:'#27ae60', intelligence:'#2980b9', universal:'#8e44ad' };
  const c = document.createElement('canvas');
  c.width = 200; c.height = 270;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0d1018'; ctx.fillRect(0,0,200,270);
  ctx.fillStyle = (colors[attribute]||'#333') + '22'; ctx.fillRect(0,0,200,270);
  ctx.strokeStyle = (colors[attribute]||'#333') + '55'; ctx.lineWidth = 2;
  ctx.strokeRect(1,1,198,268);
  ctx.fillStyle = '#4a5060';
  ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const words = name.split(' ');
  words.forEach((w,i) => ctx.fillText(w, 100, 130 + i*16 - (words.length-1)*8));
  return c.toDataURL();
}

// ── State ──
const ATTR_ABBR = { strength:'STR', agility:'AGI', intelligence:'INT', universal:'UNI' };
let currentView    = 'carousel';
let activeFilter   = 'all';
let filteredHeroes = [...HEROES];
let selectedHero   = null;

// Physics — scrollX is fractional card index offset (in px, SPACING units)
let scrollX        = 0;
let velocity       = 0;
let isAnimating    = false;
let isDragging     = false;
let dragMoved      = false;
let dragStartX     = 0;
let dragStartScroll = 0;
let lastDragX      = 0;
let lastDragTime   = 0;

// ──────────────────────────────────────────────
// Per-card 3D transform from offset
// offset = signed distance from center in card units (0 = center, 1 = one right, -2 = two left)
// ──────────────────────────────────────────────
function cardTransform(offset) {
  const absOff  = Math.abs(offset);
  const sign    = Math.sign(offset) || 1;

  // Scale: center=1, drops off with distance
  const scale   = Math.max(0.45, 1 - absOff * 0.11);

  // rotateY: 0 at center, grows toward MAX_ROT
 const rotY = (absOff <= 1 ? absOff * 15
            : absOff <= 2 ? 15 + (absOff - 1) * 40
            : Math.min(55 + (absOff - 2) * 35, 90)) * (-sign);

  // X position:
  // Cards at distance 1 and 2 are spaced so they don't overlap the previous card.
  // Card at distance 3+ starts to slightly overlap card at distance 2.
  // Each card's visible half-width at its scale: (CARD_W_CUR / 2) * scale
  // We position edges so: pos[n] = pos[n-1] + halfWidth[n-1] + halfWidth[n] + gap
  // For n>=3 we reduce the gap to allow slight overlap.
  let tx;
  if (absOff <= 0.001) {
    tx = 0;
  } else {
    // Compute position for integer offsets first, then interpolate
    const buildPos = (n) => {
      // half-width of each card at its scale
      const hw = (i) => (CARD_W_CUR / 2) * Math.max(0.45, 1 - i * 0.11);
      let pos = 0;
      for (let i = 1; i <= n; i++) {
        const gap = i <= 2 ? 6 : -CARD_W_CUR * 0.08; // gap: positive=no overlap, negative=overlap
        pos += hw(i - 1) + hw(i) + gap;
      }
      return pos;
    };
    const floor = Math.floor(absOff);
    const frac  = absOff - floor;
    const p0 = floor === 0 ? 0 : buildPos(floor);
    const p1 = buildPos(floor + 1);
    tx = (p0 + (p1 - p0) * frac) * sign;
  }

  // Z: center card pops forward, side cards recede
  const tz      = -Math.abs(offset) * 55;

  // Brightness
  const bright  = Math.max(0.28, 1 - absOff * 0.18);

  return { scale, rotY, tx, tz, bright };
}

// ──────────────────────────────────────────────
// BUILD CAROUSEL
// ──────────────────────────────────────────────
function buildCarousel() {
  const track = document.getElementById('carousel-track');
  track.innerHTML = '';

  filteredHeroes.forEach((h, i) => {
    const el = document.createElement('div');
    el.className = 'hero-card';
    el.dataset.index = i;
    el.style.left   = '50%';
    el.style.width  = CARD_W_CUR + 'px';
    el.style.height = CARD_H_CUR + 'px';
    el.style.marginTop  = -(CARD_H_CUR / 2) + 'px';
    el.style.marginLeft = -(CARD_W_CUR / 2) + 'px';

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    // Hero portrait — gif/mp4/png
    const mediaEl = createHeroMediaEl(h);
    inner.appendChild(mediaEl);

    // Frame overlay — 1.png covers the whole card on top
    const frame = document.createElement('img');
    frame.src = './1.png';
    frame.className = 'card-frame';
    frame.draggable = false;
    inner.appendChild(frame);

    // Text/badges on top of frame
    inner.innerHTML += `
      <div class="card-name">${h.name}</div>
      <div class="attr-badge ${h.attribute}">${ATTR_ABBR[h.attribute]}</div>`;

    // Abilities bar
    const abilities = getHeroAbilities(h.key);
    if (abilities.length) {
      const abBar = document.createElement('div');
      abBar.className = 'card-abilities';
      abilities.forEach(src => {
        const ab = document.createElement('img');
        ab.src = src;
        ab.className = 'card-ability-icon';
        ab.draggable = false;
        abBar.appendChild(ab);
      });
      inner.appendChild(abBar);
    }

    el.appendChild(inner);
    el.addEventListener('click', () => { if (!dragMoved) onCardClick(i); });
    track.appendChild(el);
  });

  updateCarousel();
}

// ──────────────────────────────────────────────
// UPDATE CAROUSEL — apply 3D transforms per card
// ──────────────────────────────────────────────
function updateCarousel() {
  const track = document.getElementById('carousel-track');
  const cards = track.querySelectorAll('.hero-card');

  // centerIdx as float (fractional position during scroll)
  const centerF = -scrollX / SPACING;
  const centerI = Math.round(centerF);

  cards.forEach((c, i) => {
    const offset = i - centerF;  // float offset from current center
    const { scale, rotY, tx, tz, bright } = cardTransform(offset);

    // Z-index: center card on top
    const zi = Math.round(100 - Math.abs(i - centerF) * 10);
    c.style.zIndex = zi;

    c.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${rotY}deg) scale(${scale})`;
    c.style.opacity   = Math.max(0.1, bright + 0.1);

    // Image brightness separate so card border stays normal
    const mediaChild = c.querySelector('img.card-portrait, video.card-portrait');
    if (mediaChild) mediaChild.style.filter = `brightness(${bright}) saturate(${0.7 + bright * 0.5})`;

    const diff = Math.abs(i - centerI);
    c.classList.toggle('focused', diff === 0);

    // Visibility cull
    c.style.visibility = Math.abs(offset) > 13 ? 'hidden' : 'visible';
  });

  // Update pick button
  const fi = Math.max(0, Math.min(filteredHeroes.length - 1, centerI));
  if (filteredHeroes[fi]) {
    document.getElementById('pick-btn').textContent = `Pick ${filteredHeroes[fi].name}`;
  }
}

// ──────────────────────────────────────────────
// PHYSICS
// ──────────────────────────────────────────────
function animate() {
  if (!isAnimating) return;
  velocity *= 0.905;
  scrollX  += velocity;

  const maxS =  0;
  const minS = -(filteredHeroes.length - 1) * SPACING;
  if (scrollX > maxS) { scrollX = maxS; velocity *= -0.1; }
  if (scrollX < minS) { scrollX = minS; velocity *= -0.1; }

  if (Math.abs(velocity) < 0.35) {
    const target = -Math.round(-scrollX / SPACING) * SPACING;
    scrollX += (target - scrollX) * 0.15;
    if (Math.abs(scrollX - target) < 0.25) {
      scrollX = target; velocity = 0; isAnimating = false;
    }
  }

  updateCarousel();
  if (isAnimating) requestAnimationFrame(animate);
}

function startAnim() {
  if (!isAnimating) { isAnimating = true; requestAnimationFrame(animate); }
}

// ──────────────────────────────────────────────
// INPUT — WHEEL
// ──────────────────────────────────────────────
const wrap = document.getElementById('track-wrap');

wrap.addEventListener('wheel', e => {
  e.preventDefault();
  const power = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) * 0.55, 110);
  velocity -= power;
  startAnim();
  document.getElementById('scroll-hint').classList.add('hidden');
}, { passive: false });

// ──────────────────────────────────────────────
// INPUT — MOUSE DRAG
// ──────────────────────────────────────────────
wrap.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  e.preventDefault();
  isDragging = true; dragMoved = false;
  dragStartX = e.clientX; dragStartScroll = scrollX;
  lastDragX = e.clientX; lastDragTime = Date.now();
  isAnimating = false; velocity = 0;
  wrap.classList.add('dragging');
});

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const now = Date.now();
  const dt  = now - lastDragTime;
  const dx  = e.clientX - dragStartX;
  if (Math.abs(dx) > 5) dragMoved = true;
  if (dt > 0) velocity = (e.clientX - lastDragX) / dt * 16;
  lastDragX = e.clientX; lastDragTime = now;
  scrollX = dragStartScroll + dx;
  updateCarousel();
});

window.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false; wrap.classList.remove('dragging');
  startAnim();
});

// ── TOUCH ──
wrap.addEventListener('touchstart', e => {
  dragStartX = e.touches[0].clientX; dragStartScroll = scrollX;
  lastDragX = e.touches[0].clientX; lastDragTime = Date.now();
  dragMoved = false; velocity = 0; isAnimating = false;
}, { passive: true });

wrap.addEventListener('touchmove', e => {
  const now = Date.now();
  const x   = e.touches[0].clientX;
  const dx  = x - dragStartX;
  if (Math.abs(dx) > 5) dragMoved = true;
  const isMob = window.innerWidth <= 768;
  velocity = (x - lastDragX) / Math.max(now - lastDragTime, 1) * (isMob ? 12 : 16);
  lastDragX = x; lastDragTime = now;
  scrollX = dragStartScroll + dx;
  updateCarousel();
}, { passive: true });

wrap.addEventListener('touchend', () => startAnim());

// ──────────────────────────────────────────────
// CARD CLICK
// ──────────────────────────────────────────────
function onCardClick(i) {
  const centerI = Math.round(-scrollX / SPACING);
  if (Math.abs(i - centerI) <= 1) {
    openChallenges(filteredHeroes[i]);
  } else {
    const target = -i * SPACING;
    velocity = 0; isAnimating = true;
    const snap = () => {
      scrollX += (target - scrollX) * 0.18;
      updateCarousel();
      if (Math.abs(scrollX - target) > 0.5) requestAnimationFrame(snap);
      else { scrollX = target; updateCarousel(); isAnimating = false; }
    };
    requestAnimationFrame(snap);
  }
}

function pickHero() {
  const ci = Math.max(0, Math.min(filteredHeroes.length - 1, Math.round(-scrollX / SPACING)));
  openChallenges(filteredHeroes[ci]);
}

// ──────────────────────────────────────────────
// CHALLENGES PANEL
// ──────────────────────────────────────────────
function openChallenges(hero) {
  selectedHero = hero;
  const pool = CHALLENGES[hero.key] || [
    'Выиграй игру на этом герое','Убей 10 врагов','Убей Рошана соло',
    'Не умирай ни разу','Фармь 400 GPM','Сделай хет-трик'
  ];
  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);

  const panelImg = document.getElementById('panel-hero-img');
  panelImg.src = heroImg(hero.key);
  panelImg.alt = hero.name;
  panelImg.onerror = function() {
    this.onerror = null;
    this.src = makePlaceholder(hero.name, hero.attribute);
  };
  document.getElementById('panel-hero-name').textContent = hero.name;
  document.getElementById('panel-hero-meta').textContent =
    `${ATTR_ABBR[hero.attribute]}  ·  ${hero.attack_type.toUpperCase()}`;

  const list = document.getElementById('challenges-list');
  list.innerHTML = '';
  picked.forEach((ch, i) => {
    const el = document.createElement('div');
    el.className = 'challenge-item';
    el.innerHTML = `<div class="challenge-num">0${i+1}</div><div class="challenge-text">${ch}</div>`;
    el.addEventListener('click', () => el.classList.toggle('picked'));
    list.appendChild(el);
  });

  document.getElementById('challenge-panel').classList.add('open');

  document.querySelectorAll('.grid-hero').forEach(el => el.classList.remove('selected'));
  const gh = document.querySelector(`.grid-hero[data-key="${hero.key}"]`);
  if (gh) gh.classList.add('selected');
}

function closePanel() {
  document.getElementById('challenge-panel').classList.remove('open');
}

// ──────────────────────────────────────────────
// BUILD GRID
// ──────────────────────────────────────────────
function buildGrid() {
  const grid = document.getElementById('grid-view');
  grid.innerHTML = '';

  const wrap = document.createElement('div');
  wrap.className = 'grid-sections-wrap';

  const sections = [
    { attr:'strength',     label:'⚔ Strength' },
    { attr:'agility',      label:'🏹 Agility' },
    { attr:'intelligence', label:'✦ Intelligence' },
    { attr:'universal',    label:'◈ Universal' },
  ];

  sections.forEach(sec => {
    const heroes = filteredHeroes.filter(h => h.attribute === sec.attr);
    if (!heroes.length) return;
    const section = document.createElement('div');
    section.className = 'grid-section';
    section.innerHTML = `<div class="grid-section-title ${sec.attr}">${sec.label}</div>`;
    const ghGrid = document.createElement('div');
    ghGrid.className = 'grid-heroes';
    heroes.forEach(h => {
      const el = document.createElement('div');
      el.className = 'grid-hero' + (selectedHero && selectedHero.key === h.key ? ' selected' : '');
      el.dataset.key = h.key;
      const img = document.createElement('img');
      img.src = heroImg(h.key); img.alt = h.name; img.loading = 'lazy';
      img.onerror = function() { this.onerror = null; this.src = makePlaceholder(h.name, h.attribute); };
      el.appendChild(img);
      el.innerHTML += `<div class="gh-name">${h.name}</div>`;
      el.addEventListener('click', () => openChallenges(h));
      ghGrid.appendChild(el);
    });
    section.appendChild(ghGrid);
    wrap.appendChild(section);
  });

  grid.appendChild(wrap);
}

// ──────────────────────────────────────────────
// FILTERS / VIEW
// ──────────────────────────────────────────────
function setFilter(f) {
  activeFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const map = { all:'all', strength:'str', agility:'agi', intelligence:'int', universal:'uni', melee:'melee', ranged:'ranged' };
  document.querySelector(`.filter-btn.${map[f]||f}`).classList.add('active');
  if      (f === 'all')                  filteredHeroes = [...HEROES];
  else if (['melee','ranged'].includes(f)) filteredHeroes = HEROES.filter(h => h.attack_type === f);
  else                                   filteredHeroes = HEROES.filter(h => h.attribute === f);
  document.getElementById('filter-count').textContent = `${filteredHeroes.length} heroes`;
  scrollX = 0; velocity = 0;
  buildCarousel();
  buildGrid();
}

function setView(v) {
  currentView = v;
  document.getElementById('carousel-view').style.display = v === 'carousel' ? 'flex' : 'none';
  document.getElementById('grid-view').style.display     = v === 'grid'     ? 'block' : 'none';
  document.getElementById('btn-carousel').classList.toggle('active', v === 'carousel');
  document.getElementById('btn-grid').classList.toggle('active', v === 'grid');
}

// ──────────────────────────────────────────────
// KEYBOARD
// ──────────────────────────────────────────────
window.addEventListener('keydown', e => {
  if (currentView !== 'carousel') return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const cur = Math.round(-scrollX / SPACING);
    const target = -Math.min(filteredHeroes.length - 1, cur + 1) * SPACING;
    scrollX = target; velocity = 0; isAnimating = false; updateCarousel();
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const cur = Math.round(-scrollX / SPACING);
    const target = -Math.max(0, cur - 1) * SPACING;
    scrollX = target; velocity = 0; isAnimating = false; updateCarousel();
  }
  if (e.key === 'Enter')      pickHero();
  if (e.key === 'Escape')     closePanel();
});

// ── INIT ──
function recalcSpacing() {
  const isMobile = window.innerWidth <= 768;
  const isSmall  = window.innerWidth <= 480;

  if (isSmall) {
    CARD_W_CUR = 144;
    CARD_H_CUR = 206;
    SPACING = Math.round(window.innerWidth / 4.2);
  } else if (isMobile) {
    CARD_W_CUR = 240;
    CARD_H_CUR = 344;
    SPACING = Math.round(window.innerWidth / 5.5);
  } else {
    CARD_W_CUR = CARD_W;
    CARD_H_CUR = CARD_H;
    SPACING = Math.max(130, Math.min(220, Math.round(window.innerWidth / 8)));
  }

  // Apply to all existing cards
  document.querySelectorAll('.hero-card').forEach(el => {
    el.style.width     = CARD_W_CUR + 'px';
    el.style.height    = CARD_H_CUR + 'px';
    el.style.marginTop  = -(CARD_H_CUR / 2) + 'px';
    el.style.marginLeft = -(CARD_W_CUR / 2) + 'px';
  });
}
window.addEventListener('resize', () => { recalcSpacing(); updateCarousel(); });
recalcSpacing();
buildCarousel();
buildGrid();
initLoader();
