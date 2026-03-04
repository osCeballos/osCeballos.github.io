/**
 * main.js — Portfolio Oscar Ceballos Cano
 * Vanilla JS · No dependencies · MWC 2026
 */

/* ─── Utility ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── 1. NAV — Scroll state & mobile toggle ─── */
(function initNav() {
  const nav = $('.nav');
  const menuBtn = $('#nav-menu-btn');
  const mobileNav = $('#mobile-nav');
  const mobileLinks = $$('.mobile-nav__link');

  // Scrolled class — canonical ticking-flag pattern (one update per rendered frame)
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    });
    ticking = true;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile toggle
  function toggleMenu(open) {
    menuBtn.classList.toggle('is-open', open);
    mobileNav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    mobileNav.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('is-open');
    toggleMenu(!isOpen);
  });

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(false);
  });
})();


/* ─── 2. TYPEWRITER — Hero role text (ES6 Async/Await) ─── */
(async function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  const phrases = [
    'Front-End Developer',
    'UX/UI Designer',
    'Design Systems Lead',
    'AI Workflow Builder',
    'Creative Technologist',
  ];

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Start after hero animation settles
  await sleep(1200);

  while (true) {
    for (const phrase of phrases) {
      // Type
      for (let i = 1; i <= phrase.length; i++) {
        el.textContent = phrase.substring(0, i);
        await sleep(90);
      }

      await sleep(2200); // pause at full word

      // Delete
      for (let i = phrase.length; i >= 0; i--) {
        el.textContent = phrase.substring(0, i);
        await sleep(50);
      }

      await sleep(300); // pause before next word
    }
  }
})();


/* ─── 3. INTERSECTION OBSERVER — Reveal on scroll ─── */
(function initReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.reveal').forEach(el => io.observe(el));
})();


/* ─── 4. COUNTER ANIMATION — Stats section ─── */
(function initCounters() {
  const counters = $$('.stats__number[data-target]');
  if (!counters.length) return;

  const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(ease(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(el => {
      el.textContent = el.dataset.target;
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => io.observe(el));
})();


/* ─── 5. SMOOTH ACTIVE NAV LINK — Highlight current section ─── */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav__link:not(.nav__link--cta)');

  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle(
              'nav__link--active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(sec => io.observe(sec));
})();


/* ─── 6. CARD MAGNETIC HOVER EFFECT ─── */
(function initMagneticCards() {
  const cards = $$('.bento__card, .stack__item, .philosophy__card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const factor = 0.008; // Very subtle — feels like a 3D "breath", not a spin

      card.style.transition = 'transform 0.15s ease-out';
      card.style.transform = `
        translateY(-4px)
        perspective(1000px)
        rotateX(${-y * factor}deg)
        rotateY(${x * factor}deg)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      card.style.transform = '';
    });
  });
})();


/* ─── 7. STACK PROGRESS BARS — Trigger on card visible ─── */
(function initStackBars() {
  // The CSS handles this via .is-visible class (added by IntersectionObserver)
  // We just need to make sure items also get is-visible
  // (already handled by initReveal above, since stack items have .reveal)
})();


/* ─── 8. CURSOR GLOW (desktop only) ─── */
(function initCursorGlow() {
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  // top:0; left:0 baseline — movement via GPU-only translate3d (no Layout reflow)
  glow.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
    /* will-change removido para evitar VRAM leak/Layout Thrashing en móviles */
    transform: translate3d(-200px, -200px, 0);
    transition: opacity .3s ease;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0;
  let gx = 0, gy = 0;
  let glowFrame;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  function glowLoop() {
    // Lerp + translate3d — triggers Composite only (CPU cost ≈ 0)
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.transform = `translate3d(${gx - 200}px, ${gy - 200}px, 0)`;
    glowFrame = requestAnimationFrame(glowLoop);
  }

  glowLoop();

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(glowFrame);
    } else {
      glowLoop();
    }
  });
})();


/* ─── 9. HERO PARTICLE DOTS (canvas, desktop) ─── */
(function initParticles() {
  if (window.matchMedia('(hover: none)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;opacity:.4';
  const hero = $('.hero');
  if (!hero) return;
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 40;
  let W, H, particles = [];

  function resize() {
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: randRange(0.8, 2.5),
      vx: randRange(-0.15, 0.15),
      vy: randRange(-0.2, -0.05),
      alpha: randRange(0.2, 0.7),
    };
  }

  function initParticles_() {
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  // Unified RAF control — single source of truth for the animation loop
  let animationId = null;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.0008;
      if (p.y < 0 || p.alpha <= 0) {
        p.x = Math.random() * W;
        p.y = H + 5;
        p.alpha = randRange(0.2, 0.7);
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(139,92,246,${p.alpha})`;
      ctx.fill();
    });
    animationId = requestAnimationFrame(draw);
  }

  function startParticles() {
    if (!animationId) animationId = requestAnimationFrame(draw);
  }

  function stopParticles() {
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
  }

  resize();
  initParticles_();

  // Guard 1: IntersectionObserver — stop when Hero scrolls out of view
  const heroObserver = new IntersectionObserver(
    ([entry]) => { entry.isIntersecting ? startParticles() : stopParticles(); },
    { threshold: 0 }
  );
  heroObserver.observe(hero);

  // Guard 2: visibilitychange — stop when the tab is not active
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopParticles() : startParticles();
  });

  window.addEventListener('resize', resize, { passive: true });
})();


/* ─── 10. FOOTER YEAR ─── */
(function () {
  const yearEl = document.querySelector('.footer__copy .mono');
  // Already hardcoded in HTML as 2026
})();


/* ─── 11. PROJECT MODALS — Detailed case studies ─── */
(function initProjectModals() {
  const modal = $('#project-modal');
  const modalContent = $('#modal-content');
  const modalClose = $('#modal-close');
  const modalOverlay = $('#modal-overlay');
  const projectLinks = $$('.bento__card-link[data-project]');

  if (!modal || !modalContent) return;

  const projectDetails = {
    'agentic-workflows': {
      title: 'Agentic Workflows & Legacy Architecture',
      tags: ['AI Agents', 'XML-First', 'CSS Variables', 'Workflow Optimization'],
      graphicType: 'ai-mockup',
      galleryMockups: ['code-snippet-mockup', 'terminal-mockup'],
      challenge: 'Mantener la máxima productividad técnica utilizando hardware Apple "vintage", transformando contenido editorial complejo en código técnico bajo estándares estrictos XML-First.',
      designProcess: 'El ecosistema se diseñó tras dos meses de prueba y error. Se estableció una arquitectura basada en 3 archivos maestros (Reglas_Tecnicas, Biblioteca_Componentes, Ejemplos_Maestros) para que la IA comprendiera el sistema de rejilla Mercury.',
      technical: 'Se orquestó un sistema dual: Antigraviti automatizando la sanitización de entidades numéricas, a11y y jerarquía semántica; y Gemini 3 actuando como Arquitecto Senior proponiendo workarounds escalables (ej. Variables CSS para máscaras de recorte).',
      result: 'Un workflow ultra-eficiente que demuestra que cuando el flujo de trabajo es inteligente, el hardware pasa a ser secundario.'
    },
    'smart-city': {
      title: 'Sant Vicenç Smart City',
      tags: ['Data Visualization', 'Figma', 'Mobile-First', 'Smart Cities'],
      graphicType: 'city-mockup',
      galleryMockups: ['chart-mockup', 'mobile-wireframe-mockup'],
      challenge: 'La fragmentación de fuentes de información urbana (tráfico, aire, transporte) generaba ruido visual y dificultaba la toma de decisiones rápidas de movilidad.',
      designProcess: 'Diseñado en Figma aplicando Atomic Design para crear componentes reutilizables. Se priorizó la accesibilidad, asegurando contraste y legibilidad tipográfica sobre un fondo Dark Mode.',
      technical: 'Conceptualizado bajo un enfoque Responsive Design fluido, adaptando la parrilla de escritorio a una experiencia vertical móvil sin perder jerarquía visual.',
      result: 'Un ecosistema digital intuitivo que centraliza la información y transforma datos complejos en utilidad inmediata.'
    },
    'ascii-login': {
      title: 'Immersive ASCII Login',
      tags: ['Creative Coding', 'DOM Manipulation', 'ES6+'],
      graphicType: 'ui-mockup',
      galleryMockups: ['ascii-art-mockup', 'login-form-mockup'],
      challenge: 'Romper la monotonía visual de los sistemas de autenticación creando un "Wow effect" sin comprometer la usabilidad.',
      designProcess: 'Fusión entre la estética retro de los terminales (tipografía monoespaciada, checkbox ASCII) y un panel de control interactivo moderno.',
      technical: 'HTML5, CSS3 (Grid & Flexbox) y Vanilla JS. Implementación de video de fondo dinámico que se revela al iniciar sesión, con animaciones suaves y manipulación del DOM.',
      result: 'Experiencia inmersiva que demuestra dominio sólido de la maquetación avanzada y la lógica frontend nativa.'
    },
    'metamind': {
      title: 'METAMIND — Educación',
      tags: ['UX Research', 'Gamification', 'EdTech', 'Accessibility'],
      graphicType: 'visual-mockup',
      galleryMockups: ['node-graph-mockup', 'stats-mockup'],
      challenge: 'Abordar el abandono escolar en el modelo tradicional causado por la falta de personalización en el aprendizaje.',
      designProcess: 'Creado en el hackathon "24h d\'Innovació BCN". Conceptualización de un ecosistema 3D inclusivo orientado a la diversidad funcional (NESE).',
      technical: 'Integra algoritmos de evaluación cognitiva para adaptar el currículum. Emplea gamificación avanzada (incentivos, niveles) y un panel analítico integral para familias y docentes.',
      result: 'Propuesta innovadora que redefine la experiencia educativa adaptando dinámicamente el método al usuario.'
    }
  };

  /* ── Hero graphic: reutiliza las clases CSS existentes ── */
  function getHeroGraphic(type) {
    const map = {
      'ai-mockup': `
        <div class="ai-mockup" style="width:100%;max-width:420px">
          <div class="ai-mockup__prompt">$ antigraviti --validate --schema=xml-first --output=mercury</div>
          <div class="ai-mockup__output">
            <div class="ai-mockup__line"></div>
            <div class="ai-mockup__line shorter"></div>
            <div class="ai-mockup__line" style="width:75%"></div>
            <div class="ai-mockup__line shorter"></div>
            <div class="ai-mockup__line" style="width:85%"></div>
            <div class="ai-mockup__line" style="width:50%"></div>
          </div>
        </div>`,
      'city-mockup': `
        <div class="city-mockup" style="width:100%;max-width:420px">
          <div class="city-mockup__header"><span></span><span></span><span></span></div>
          <div class="city-mockup__grid">
            <div class="city-mockup__stat"><span>AQI 42</span><small>Calidad Aire</small></div>
            <div class="city-mockup__stat"><span>12 km/h</span><small>Tráfico</small></div>
            <div class="city-mockup__stat"><span>87%</span><small>Transporte</small></div>
            <div class="city-mockup__stat"><span>2.4°C</span><small>Temperatura</small></div>
            <div class="city-mockup__chart">
              <svg viewBox="0 0 200 32" preserveAspectRatio="none">
                <polyline points="0,28 30,20 60,24 90,10 120,16 150,6 180,12 200,8" fill="none" stroke="rgba(139,92,246,.6)" stroke-width="1.5"/>
                <polyline points="0,28 30,20 60,24 90,10 120,16 150,6 180,12 200,8 200,32 0,32" fill="rgba(139,92,246,.1)"/>
              </svg>
            </div>
          </div>
        </div>`,
      'ui-mockup': `
        <div class="ui-mockup" style="width:100%;max-width:420px">
          <div class="ui-mockup__nav">
            <div class="ui-mockup__logo"></div>
            <div class="ui-mockup__links"><span></span><span></span><span></span></div>
          </div>
          <div class="ui-mockup__hero">
            <div class="ui-mockup__text">
              <span style="width:90%;height:10px;background:linear-gradient(90deg,rgba(236,72,153,.5),transparent)"></span>
              <span style="width:70%;height:8px"></span>
              <span class="shorter"></span>
            </div>
            <div class="ui-mockup__btn"></div>
          </div>
        </div>`,
      'visual-mockup': `
        <div class="visual-mockup" style="width:100%;max-width:420px;gap:1.5rem;flex-wrap:wrap">
          <div class="visual-mockup__node" style="border-color:rgba(139,92,246,.6)">
            <div class="visual-mockup__dot" style="background:#8B5CF6"></div>
            <span>Alumno</span>
          </div>
          <div class="visual-mockup__edge" style="background:rgba(139,92,246,.3);width:40px;height:1px;flex-shrink:0"></div>
          <div class="visual-mockup__node" style="border-color:rgba(34,211,238,.6)">
            <div class="visual-mockup__dot" style="background:#22D3EE"></div>
            <span>AI Engine</span>
          </div>
          <div class="visual-mockup__edge" style="background:rgba(34,211,238,.3);width:40px;height:1px;flex-shrink:0"></div>
          <div class="visual-mockup__node" style="border-color:rgba(236,72,153,.6)">
            <div class="visual-mockup__dot" style="background:#EC4899"></div>
            <span>Currículo</span>
          </div>
        </div>`
    };
    return map[type] || map['ai-mockup'];
  }

  /* ── Gallery micro-UI: componentes CSS-only únicos por proyecto ── */
  function getGalleryMockup(type) {
    const map = {
      'code-snippet-mockup': `
        <div class="gallery-mockup gallery-mockup--code">
          <div class="gm-header"><span class="gm-dot" style="background:#ff5f57"></span><span class="gm-dot" style="background:#febc2e"></span><span class="gm-dot" style="background:#28c840"></span><span class="gm-filename">workflow.js</span></div>
          <div class="gm-code">
            <div class="gm-line"><span class="gm-kw">const</span> agent = <span class="gm-fn">createAgent</span>(config);</div>
            <div class="gm-line"><span class="gm-kw">await</span> agent.<span class="gm-fn">validate</span>(<span class="gm-str">'xml-first'</span>);</div>
            <div class="gm-line gm-comment">// Schema: Mercury Grid v2.4</div>
            <div class="gm-line"><span class="gm-fn">pipeline</span>.<span class="gm-fn">run</span>({ output: <span class="gm-str">'production'</span> });</div>
          </div>
        </div>`,
      'terminal-mockup': `
        <div class="gallery-mockup gallery-mockup--terminal">
          <div class="gm-header"><span class="gm-dot" style="background:#ff5f57"></span><span class="gm-dot" style="background:#febc2e"></span><span class="gm-dot" style="background:#28c840"></span><span class="gm-filename">terminal</span></div>
          <div class="gm-terminal-body">
            <div class="gm-tline"><span class="gm-prompt">~</span> validate --strict</div>
            <div class="gm-tline gm-ok">✓ Schema valid (124 nodes)</div>
            <div class="gm-tline gm-ok">✓ a11y issues: 0</div>
            <div class="gm-tline"><span class="gm-prompt">~</span> deploy mercury<span class="gm-cursor">_</span></div>
          </div>
        </div>`,
      'chart-mockup': `
        <div class="gallery-mockup gallery-mockup--chart">
          <div class="gm-chart-title">KPIs Urbanos — Sant Vicenç</div>
          <div class="gm-bars">
            <div class="gm-bar-row"><span class="gm-bar-label">Aire</span><div class="gm-bar-track"><div class="gm-bar-fill" style="width:88%;background:#22D3EE"></div></div><span class="gm-bar-val">88</span></div>
            <div class="gm-bar-row"><span class="gm-bar-label">Tráfico</span><div class="gm-bar-track"><div class="gm-bar-fill" style="width:62%;background:#8B5CF6"></div></div><span class="gm-bar-val">62</span></div>
            <div class="gm-bar-row"><span class="gm-bar-label">Bus</span><div class="gm-bar-track"><div class="gm-bar-fill" style="width:94%;background:#22C55E"></div></div><span class="gm-bar-val">94</span></div>
            <div class="gm-bar-row"><span class="gm-bar-label">Ruido</span><div class="gm-bar-track"><div class="gm-bar-fill" style="width:35%;background:#EC4899"></div></div><span class="gm-bar-val">35</span></div>
          </div>
        </div>`,
      'mobile-wireframe-mockup': `
        <div class="gallery-mockup gallery-mockup--wireframe">
          <div class="gm-phone">
            <div class="gm-phone-notch"></div>
            <div class="gm-phone-screen">
              <div class="gm-wf-bar" style="height:8px;width:60%;background:rgba(139,92,246,.6);margin-bottom:.5rem;border-radius:2px"></div>
              <div class="gm-wf-card"></div>
              <div class="gm-wf-card" style="opacity:.6"></div>
              <div class="gm-wf-card" style="opacity:.3"></div>
            </div>
          </div>
        </div>`,
      'ascii-art-mockup': `
        <div class="gallery-mockup gallery-mockup--ascii">
          <pre class="gm-ascii">
 ╔════════════════╗
 ║  LOGIN SYSTEM  ║
 ╠════════════════╣
 ║  USER: ██████  ║
 ║  PASS: ██████  ║
 ║                ║
 ║  [  ENTER  ]   ║
 ╚════════════════╝</pre>
        </div>`,
      'login-form-mockup': `
        <div class="gallery-mockup gallery-mockup--form">
          <div class="gm-form-label">// user_id</div>
          <div class="gm-form-input"><span>oscar@ceballos</span><span class="gm-cursor">_</span></div>
          <div class="gm-form-label" style="margin-top:.75rem">// passwd</div>
          <div class="gm-form-input"><span>•••••••••</span></div>
          <div class="gm-form-btn">AUTHENTICATE →</div>
        </div>`,
      'node-graph-mockup': `
        <div class="gallery-mockup gallery-mockup--graph">
          <svg viewBox="0 0 180 100" style="width:100%;height:100px">
            <line x1="40" y1="50" x2="90" y2="25" stroke="rgba(139,92,246,.4)" stroke-width="1"/>
            <line x1="40" y1="50" x2="90" y2="75" stroke="rgba(34,211,238,.4)" stroke-width="1"/>
            <line x1="90" y1="25" x2="140" y2="50" stroke="rgba(236,72,153,.4)" stroke-width="1"/>
            <line x1="90" y1="75" x2="140" y2="50" stroke="rgba(34,197,94,.4)" stroke-width="1"/>
            <circle cx="40" cy="50" r="12" fill="rgba(139,92,246,.2)" stroke="#8B5CF6" stroke-width="1.5"/>
            <circle cx="90" cy="25" r="10" fill="rgba(34,211,238,.2)" stroke="#22D3EE" stroke-width="1.5"/>
            <circle cx="90" cy="75" r="10" fill="rgba(236,72,153,.2)" stroke="#EC4899" stroke-width="1.5"/>
            <circle cx="140" cy="50" r="12" fill="rgba(34,197,94,.2)" stroke="#22C55E" stroke-width="1.5"/>
            <text x="40" y="54" text-anchor="middle" font-size="5" fill="#A78BFA">AI</text>
            <text x="90" y="29" text-anchor="middle" font-size="5" fill="#67E8F9">UX</text>
            <text x="90" y="79" text-anchor="middle" font-size="5" fill="#F9A8D4">DATA</text>
            <text x="140" y="54" text-anchor="middle" font-size="5" fill="#86EFAC">EDU</text>
          </svg>
        </div>`,
      'stats-mockup': `
        <div class="gallery-mockup gallery-mockup--stats">
          <div class="gm-stat-item"><div class="gm-stat-val" style="color:#8B5CF6">94%</div><div class="gm-stat-label">Engagement</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val" style="color:#22C55E">+37%</div><div class="gm-stat-label">Retención</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val" style="color:#22D3EE">12s</div><div class="gm-stat-label">Respuesta IA</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val" style="color:#EC4899">🏆 #1</div><div class="gm-stat-label">Hackathon BCN</div></div>
        </div>`
    };
    return map[type] || `<div class="gallery-mockup"></div>`;
  }

  function openModal(id) {
    const data = projectDetails[id];
    if (!data) return;

    // Scroll panel back to top on each open
    const panel = modal.querySelector('.modal__panel');
    if (panel) panel.scrollTop = 0;

    modalContent.innerHTML = `
      <div class="modal__hero-graphic">
        ${getHeroGraphic(data.graphicType)}
      </div>

      <header class="modal__header">
        <h2 class="modal__title" id="modal-panel-title">${data.title}</h2>
      </header>

      <div class="modal__body-grid">
        <div class="modal__main">
          <section class="modal__section">
            <span class="modal__section-title">// El Reto</span>
            <p class="modal__text">${data.challenge}</p>
          </section>

          <section class="modal__section">
            <span class="modal__section-title">// Proceso de Diseño</span>
            <p class="modal__text">${data.designProcess}</p>
          </section>

          <section class="modal__section">
            <span class="modal__section-title">// Implementación Técnica</span>
            <p class="modal__text">${data.technical}</p>
          </section>
        </div>

        <aside class="modal__sidebar">
          <div class="modal__sidebar-item">
            <span class="modal__section-title">// Tech Stack</span>
            <div class="modal__tags" style="margin-top: .75rem;">
              ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>

          <div class="modal__sidebar-item">
            <span class="modal__section-title">// Resultado</span>
            <p class="modal__text"><strong>${data.result}</strong></p>
          </div>

          <div class="modal__sidebar-item">
            <span class="modal__section-title">// Status</span>
            <p class="modal__text" style="color: #22C55E; font-weight: 600;">✓ Case Study Completed</p>
          </div>
        </aside>
      </div>

      <div class="modal__gallery-section">
        <span class="modal__section-title">// Artefactos del Proyecto</span>
        <div class="modal__gallery">
          ${data.galleryMockups.map(type => getGalleryMockup(type)).join('')}
        </div>
      </div>
    `;

    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-labelledby', 'modal-title-id');
    // WCAG 2.4.3 — Move focus to first focusable element inside modal
    previousFocus = document.activeElement;
    const firstFocusable = modal.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  // Track the triggering element to restore focus on close (WCAG 2.4.3)
  let previousFocus = null;

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    modal.setAttribute('aria-hidden', 'true');
    // WCAG 2.4.3 — Restore focus to the trigger element
    if (previousFocus) { previousFocus.focus(); previousFocus = null; }
  }

  // 🚀 Event Delegation + Destructuring para los links de proyectos
  const bentoGrid = $('.bento');
  if (bentoGrid) {
    bentoGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.bento__card-link[data-project]');
      if (!btn) return;

      e.preventDefault();
      previousFocus = btn;
      const { project } = btn.dataset; // ES6 Destructuring
      openModal(project);
    });
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // 🚀 Focus Trap de accesibilidad (a11y) y cierre con Escape
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusableEls = [...modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')];
      if (!focusableEls.length) return;

      const firstFocusable = focusableEls[0];
      const lastFocusable = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else { // Tab
        if (document.activeElement === lastFocusable || !focusableEls.includes(document.activeElement)) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });
})();
