/**
 * CREATIVE VISUAL COMMUNICATION PORTFOLIO ENGINE
 * Inspired by Rohith Manikkoth (2.5D Multi-Plane Parallax, Dot-Matrix, Neo-Brutalism)
 * & Spencer Gabor (Awwwards SOTD Bouncy Elastic Physics, Curved Carousel, Radial Themes)
 */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initSmartNav();
  initStickerPhysics();
  initCurvedCarousel();
  initCardDecks();
  initThemeEngine();
  initCaseStudyModal();
  initGiantFooter();
  initSoundEngine();
  initLiveClock();
});

/* ==========================================================================
   1. CUSTOM MAGNETIC & ELASTIC CURSOR
   ========================================================================== */
function initCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isHovering = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth lerp loop
  function renderCursor() {
    cursorX += (mouseX - cursorX) * 0.22;
    cursorY += (mouseY - cursorY) * 0.22;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover states on interactive elements
  const hoverTargets = 'a, button, .carousel-card, .deck-container, .sticker-badge, .swatch-btn, .footer-copy-email-pill';
  document.querySelectorAll(hoverTargets).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
    });
  });
}

/* ==========================================================================
   2. HERO 3D FLOATING STICKER CLUSTER (Rohith 2.5D Parallax + Spencer Elastic Inertia)
   ========================================================================== */
function initStickerPhysics() {
  const container = document.getElementById('stickerStageContainer');
  const stage = document.getElementById('stickerStage');
  const stickers = document.querySelectorAll('.sticker-item');
  if (!container || !stage || !stickers.length) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX = x;
    mouseY = y;
  });

  container.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  // Touch support
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      mouseX = ((touch.clientX - rect.left) / rect.width - 0.5) * 1.5;
      mouseY = ((touch.clientY - rect.top) / rect.height - 0.5) * 1.5;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    mouseX = 0;
    mouseY = 0;
  });

  let floatTime = 0;
  function updateStickers() {
    floatTime += 0.018;
    currentRotX += (-mouseY * 26 - currentRotX) * 0.1;
    currentRotY += (mouseX * 34 - currentRotY) * 0.1;

    stage.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;

    stickers.forEach((sticker, i) => {
      const depth = parseFloat(sticker.getAttribute('data-depth') || '1');
      const baseRot = parseFloat(sticker.getAttribute('data-base-rot') || '0');
      // Calm continuous floating animation
      const idleFloatY = Math.sin(floatTime + i * 1.25) * 8 * depth;
      const idleFloatRot = Math.cos(floatTime + i * 0.95) * 1.5;

      const moveX = mouseX * 50 * depth;
      const moveY = mouseY * 45 * depth + idleFloatY;
      const tilt = mouseX * 15 * depth + idleFloatRot;

      sticker.style.transform = `translate3d(${moveX}px, ${moveY}px, ${depth * 40}px) rotate(${baseRot + tilt}deg)`;
    });

    requestAnimationFrame(updateStickers);
  }
  requestAnimationFrame(updateStickers);
}

/* ==========================================================================
   3. CURVED ARC CAROUSEL (Spencer Gabor Radial Wheel Slide Trajectory)
   ========================================================================== */
function initCurvedCarousel() {
  const viewport = document.getElementById('curvedCarouselViewport');
  const track = document.getElementById('curvedCarouselTrack');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');
  const cards = document.querySelectorAll('.carousel-card');
  if (!viewport || !track || !cards.length) return;

  let currentTranslateX = 0;
  let targetTranslateX = 0;
  let isDragging = false;
  let startX = 0;
  let prevTranslateX = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = Date.now();

  const cardWidth = cards[0].offsetWidth + 36; // Card width + gap
  const maxScroll = -(cards.length - 1) * cardWidth;

  // Pointer drag events
  viewport.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    prevTranslateX = targetTranslateX;
    lastX = e.clientX;
    lastTime = Date.now();
    viewport.setPointerCapture(e.pointerId);
    document.getElementById('customCursor')?.classList.add('dragging');
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    targetTranslateX = prevTranslateX + deltaX;

    const now = Date.now();
    const dt = now - lastTime || 16;
    velocity = (e.clientX - lastX) / dt;
    lastX = e.clientX;
    lastTime = now;
  });

  const endDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    document.getElementById('customCursor')?.classList.remove('dragging');

    // Add inertia momentum
    targetTranslateX += velocity * 180;

    // Snap to nearest card
    const index = Math.round(-targetTranslateX / cardWidth);
    const clampedIndex = Math.max(0, Math.min(cards.length - 1, index));
    targetTranslateX = -clampedIndex * cardWidth;
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // Prev / Next Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      playTactileClick();
      const index = Math.round(-targetTranslateX / cardWidth);
      const newIndex = Math.max(0, index - 1);
      targetTranslateX = -newIndex * cardWidth;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      playTactileClick();
      const index = Math.round(-targetTranslateX / cardWidth);
      const newIndex = Math.min(cards.length - 1, index + 1);
      targetTranslateX = -newIndex * cardWidth;
    });
  }

  // Render loop with curved arc calculations
  function renderCarousel() {
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.14;
    track.style.transform = `translateX(${currentTranslateX}px)`;

    const viewportCenter = viewport.offsetWidth / 2;

    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distanceFromCenter = (cardCenter - viewportCenter) / (viewport.offsetWidth * 0.5);

      // Curved arc rotation and vertical dip
      const angle = distanceFromCenter * 14; // in degrees
      const translateY = Math.pow(Math.abs(distanceFromCenter), 2) * 28; // dip at the edges

      if (!card.matches(':hover')) {
        card.style.transform = `rotate(${angle}deg) translateY(${translateY}px)`;
      }
    });

    requestAnimationFrame(renderCarousel);
  }
  requestAnimationFrame(renderCarousel);
}

/* ==========================================================================
   4. INTERACTIVE CARD DECKS (Spencer Gabor Stack Fan-Out Physics)
   ========================================================================== */
function initCardDecks() {
  const deckContainers = document.querySelectorAll('.deck-container');

  deckContainers.forEach((deck) => {
    const layerBack = deck.querySelector('.card-deck__layer--back');
    const layerMid = deck.querySelector('.card-deck__layer--mid');
    const layerFront = deck.querySelector('.card-deck__layer--front');

    deck.addEventListener('mousemove', (e) => {
      const rect = deck.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (layerBack && layerMid && layerFront) {
        layerBack.style.transform = `rotate(${x * -18 - 6}deg) translate(${x * -24 - 14}px, ${y * 12 - 8}px) scale(0.98)`;
        layerMid.style.transform = `rotate(${x * 16 + 5}deg) translate(${x * 24 + 14}px, ${y * -10 - 4}px) scale(1.01)`;
        layerFront.style.transform = `translate(${x * 12}px, ${y * 12 - 8}px) scale(1.02)`;
      }
    });

    deck.addEventListener('mouseleave', () => {
      if (layerBack && layerMid && layerFront) {
        layerBack.style.transform = '';
        layerMid.style.transform = '';
        layerFront.style.transform = '';
      }
    });

    deck.addEventListener('click', () => {
      playTactileClick();
      const projectId = deck.getAttribute('data-project-id');
      if (projectId) {
        openProjectModal(projectId);
      }
    });
  });

  // Carousel card clicks
  document.querySelectorAll('.carousel-card').forEach((card) => {
    card.addEventListener('click', () => {
      playTactileClick();
      const projectId = card.getAttribute('data-project-id');
      if (projectId) {
        openProjectModal(projectId);
      }
    });
  });
}

/* ==========================================================================
   5. RADIAL PALETTE FAN-OUT THEME SWITCHER (Spencer Gabor Radial Engine)
   ========================================================================== */
function initThemeEngine() {
  const widget = document.getElementById('radialPaletteWidget');
  const toggleBtn = document.getElementById('radialToggleBtn');
  const swatchBtns = document.querySelectorAll('.swatch-btn');
  if (!widget || !toggleBtn) return;

  // Restore saved theme or default to 'void' (Rohith aesthetic)
  const validThemes = ['void', 'cream', 'solar'];
  const storedTheme = localStorage.getItem('portfolio_theme');
  const savedTheme = validThemes.includes(storedTheme) ? storedTheme : 'void';
  setTheme(savedTheme, false);

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    widget.classList.toggle('open');
    playWhooshSound();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      widget.classList.remove('open');
    }
  });

  swatchBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const theme = btn.getAttribute('data-set-theme');
      if (theme) {
        setTheme(theme, true);
        widget.classList.remove('open');
      }
    });
  });
}

function setTheme(themeName, playSound = true) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('portfolio_theme', themeName);

  // Update active indicator
  document.querySelectorAll('.swatch-btn').forEach((btn) => {
    if (btn.getAttribute('data-set-theme') === themeName) {
      btn.style.outline = '3px solid #ffffff';
    } else {
      btn.style.outline = 'none';
    }
  });

  // Update theme toggle accessibility and tooltips
  const toggleBtn = document.getElementById('radialToggleBtn');
  if (toggleBtn) {
    if (themeName === 'cream') {
      toggleBtn.setAttribute('title', 'Theme: Cream & Orange (Day Sun). Click to switch');
      toggleBtn.setAttribute('aria-label', 'Theme is Cream and Orange (Sun). Click to change');
    } else if (themeName === 'solar') {
      toggleBtn.setAttribute('title', 'Theme: Solar Amber & Dark (Night Moon). Click to switch');
      toggleBtn.setAttribute('aria-label', 'Theme is Solar Amber (Moon). Click to change');
    } else {
      toggleBtn.setAttribute('title', 'Theme: Void Acid & Black (Night Moon). Click to switch');
      toggleBtn.setAttribute('aria-label', 'Theme is Void Neon (Moon). Click to change');
    }
  }

  if (playSound) {
    playThemeChime();
  }
}

/* ==========================================================================
   6. CASE STUDY MODAL DEEP DIVE
   ========================================================================== */
const CASE_STUDIES = {
  'project-01': {
    title: 'Akkarakavu',
    category: 'Cultural Heritage & Visual Storytelling',
    client: 'Sacred Grove & Heritage Archive',
    year: '2025',
    role: 'Illustrator, Visual Researcher & Art Director',
    behanceUrl: 'https://www.behance.net/sooryakiran4',
    summary: 'An evocative illustration and editorial storytelling project inspired by the sacred grove traditions, rituals, and ecological atmosphere of Akkarakavu in northern Kerala.',
    challenge: 'Translating living local folklore, twilight grove rituals, and vernacular shrine architecture into a contemporary graphic language without losing regional authenticity.',
    solution: 'Synthesized lush botanical canopies, warm nilavilakku brass candlelight, and earthy laterite textures into a cohesive visual narrative series spanning expressive illustrations and editorial compositions.',
    swatches: ['#172A1F', '#E9C46A', '#E76F51', '#A7C957', '#FAF8F5'],
    deliverables: ['Illustrated Cultural Narrative Series', 'Editorial Visual Compositions', 'Regional Heritage Color & Motif Study', 'Digital & Print Exhibition Artwork']
  },
  'project-02': {
    title: 'Walkkaro Walkathon',
    category: 'Campaign Key Visual & Illustration',
    client: 'Curious Cat Ideas • Walkkaro',
    year: '2026',
    role: 'Illustration Intern & Key Visual Artist',
    behanceUrl: 'https://www.behance.net/sooryakiran4',
    summary: 'Developed the flagship key visual artwork and illustration system for the Walkkaro Walkathon campaign during an 8-week illustration internship at Curious Cat Ideas in Kozhikode.',
    challenge: 'Capturing the collective energy, motion, and accessibility of a large-scale community walkathon in a single unmistakable graphic system adaptable across outdoor banners and social feeds.',
    solution: 'Built a kinetic stride-driven illustration language combining sweeping motion ribbons, high-contrast neon chartreuse accents, and modular character lockups for seamless deployment across digital and print touchpoints.',
    swatches: ['#0B132B', '#FF4D00', '#FF9E00', '#CCFF00', '#FFFFFF'],
    deliverables: ['Flagship Campaign Key Visual Artwork', 'Multi-Format Print & OOH Collateral', 'Social & Digital Motion-Ready Assets', 'Custom Stride & Runner Iconography']
  },
  'project-03': {
    title: 'The Drip Codex',
    category: 'Editorial Glossary & Fashion Communication',
    client: 'Youth Culture & Style Taxonomy',
    year: '2025',
    role: 'Visual Researcher, Illustrator & Typographer',
    behanceUrl: 'https://www.behance.net/sooryakiran4',
    summary: 'An illustrated visual encyclopedia and cultural lexicon mapping Gen Z streetwear taxonomy, aesthetics, accessories, and emerging youth style codes across modern subcultures.',
    challenge: 'Gen Z fashion terminology and aesthetic micro-trends evolve rapidly online, resulting in fragmented and ephemeral visual records without cohesive physical documentation.',
    solution: 'Curated and categorized over 100 subcultural style terms. Paired technical flat sketches and expressive character illustrations with a modular, neo-brutalist typographic grid that mirrors digital feed culture in physical print form.',
    swatches: ['#CCFF00', '#0D0D12', '#F2F2F7', '#5E5E68', '#FF4800'],
    deliverables: ['Illustrated Fashion Lexicon & Publication', 'Custom Streetwear Icon & Vector Set', 'Modular Neo-Brutalist Grid System', 'Micro-Trend Sociological Analysis']
  },
  'project-04': {
    title: 'One Way Vision Installation',
    category: 'Environmental Graphics & Spatial Design',
    client: 'NIFT Kannur Campus Installation',
    year: '2025',
    role: 'Head Illustrator & Large-Format Production Lead',
    behanceUrl: 'https://www.behance.net/sooryakiran4',
    summary: 'A transformative environmental graphics project utilizing perforated one-way vision vinyl across the glass facades and partition walls of the NIFT Kannur campus.',
    challenge: 'Transforming sterile glass interior partitions into an inspiring, cohesive visual narrative without obstructing natural sunlight transmission into lecture halls.',
    solution: 'Directed the illustration team to create an intricate continuous graphic tapestry celebrating craft and design history, precisely mapped to architectural mullions and glass specs.',
    swatches: ['#00D285', '#2D1152', '#F5EFFF', '#9013FE', '#FF5E36'],
    deliverables: ['Full Architectural Glass Vector Wallpapers', 'Perforated Vinyl Material Spec & Print Files', 'On-Site Installation & Alignment Direction', 'Spatial Transformation Photo Documentation']
  }
};

function initCaseStudyModal() {
  const modalBackdrop = document.getElementById('caseModalBackdrop');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (!modalBackdrop) return;

  closeBtn?.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
      closeModal();
    }
  });

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    playTactileClick();
  }
}

function openProjectModal(projectId) {
  const modalBackdrop = document.getElementById('caseModalBackdrop');
  const data = CASE_STUDIES[projectId];
  if (!modalBackdrop || !data) return;

  document.getElementById('modalTitle').textContent = data.title;
  document.getElementById('modalCategory').textContent = data.category;
  document.getElementById('modalClient').textContent = data.client;
  document.getElementById('modalYear').textContent = data.year;
  document.getElementById('modalRole').textContent = data.role;
  document.getElementById('modalSummary').textContent = data.summary;
  document.getElementById('modalChallenge').textContent = data.challenge;
  document.getElementById('modalSolution').textContent = data.solution;

  // Swatches
  const swatchesContainer = document.getElementById('modalSwatches');
  if (swatchesContainer) {
    swatchesContainer.innerHTML = '';
    data.swatches.forEach((hex) => {
      const chip = document.createElement('div');
      chip.className = 'modal-swatch-chip';
      chip.style.backgroundColor = hex;
      chip.textContent = hex;
      swatchesContainer.appendChild(chip);
    });
  }

  // Deliverables
  const deliverablesContainer = document.getElementById('modalDeliverables');
  if (deliverablesContainer) {
    deliverablesContainer.innerHTML = '';
    data.deliverables.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      li.style.padding = '0.35rem 0';
      deliverablesContainer.appendChild(li);
    });
  }

  // Behance Portfolio Link
  const behanceBtn = document.getElementById('modalBehanceBtn');
  if (behanceBtn) {
    behanceBtn.href = data.behanceUrl || 'https://www.behance.net/sooryakiran4';
  }

  modalBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ==========================================================================
   7. GIANT KINETIC FOOTER (Spencer Gabor ScaleY Stretch on Scroll & Email Copy)
   ========================================================================== */
function initGiantFooter() {
  const footerTitle = document.getElementById('footerKineticTitle');
  const copyBtn = document.getElementById('footerEmailBtn');
  const copyToast = document.getElementById('copyToast');

  if (footerTitle) {
    footerTitle.addEventListener('click', () => {
      playTactileClick();
    });
  }

  if (copyBtn && copyToast) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.getAttribute('data-email') || 'sooryakiran605@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        playTactileClick();
        copyToast.classList.add('show');
        setTimeout(() => {
          copyToast.classList.remove('show');
        }, 2200);
      });
    });
  }

  // Nav & Social Links Click Feedback
  document.querySelectorAll('.nav-link-btn, .footer-links-list a').forEach((link) => {
    link.addEventListener('click', () => {
      playTactileClick();
    });
  });
}

/* ==========================================================================
   8. WEB AUDIO SOUND ENGINE (Tactile Mechanical Micro-Feedback)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initSoundEngine() {
  const soundToggle = document.getElementById('soundToggleBtn');
  if (!soundToggle) return;

  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggle.classList.toggle('active', soundEnabled);
    if (soundEnabled) {
      playTactileClick();
    }
  });
}

function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTactileClick() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(820, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  } catch (e) {
    // Ignore audio errors silently
  }
}

function playThemeChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    [520, 680, 880, 1040].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.04);
      osc.stop(ctx.currentTime + i * 0.04 + 0.14);
    });
  } catch (e) {}
}

function playWhooshSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {}
}

/* ==========================================================================
   9. LIVE STUDIO CLOCK
   ========================================================================== */
function initLiveClock() {
  const clockEl = document.getElementById('liveClock');
  if (!clockEl) return;

  function updateTime() {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      clockEl.textContent = formatter.format(now);
    } catch (e) {
      // Fallback calculation for UTC+5:30 (India Standard Time)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utc + (3600000 * 5.5));
      const hours = String(istDate.getHours()).padStart(2, '0');
      const minutes = String(istDate.getMinutes()).padStart(2, '0');
      const seconds = String(istDate.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

/* ==========================================================================
   10. AUTO-HIDING SMART NAVIGATION (Hide on Scroll Down, Reveal on Scroll Up)
   ========================================================================== */
function initSmartNav() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  let ticking = false;
  const threshold = 8; // minimum scroll delta to prevent micro-flicker

  function updateNav() {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Always keep visible when near the top of the page
    if (currentScrollY <= 60) {
      nav.classList.remove('nav-hidden');
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    const scrollDelta = currentScrollY - lastScrollY;

    // Only trigger if scroll delta exceeds threshold
    if (Math.abs(scrollDelta) >= threshold) {
      if (scrollDelta > 0) {
        // Scrolling downwards -> hide
        nav.classList.add('nav-hidden');
      } else {
        // Scrolling upwards -> reveal
        nav.classList.remove('nav-hidden');
      }
      lastScrollY = currentScrollY;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  // Accessibility: reveal header when focused with keyboard Tab navigation
  nav.addEventListener('focusin', () => {
    nav.classList.remove('nav-hidden');
  });
}
