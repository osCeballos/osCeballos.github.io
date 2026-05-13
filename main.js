/**
 * main.js — Portfolio Oscar Ceballos Cano
 * Vanilla JS · No dependencies
 */

/* ─── Utility ─── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── 0. THEME SWITCHER ─── */
(function initTheme() {
  const btn = $('#theme-toggle');
  if (!btn) return;

  const sunIcon = $('.theme-toggle__icon--sun', btn);
  const moonIcon = $('.theme-toggle__icon--moon', btn);

  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const isLight = savedTheme === 'light' || !savedTheme;

  function applyTheme(light) {
    document.documentElement.classList.toggle('light-mode', light);
    if (sunIcon && moonIcon) {
      sunIcon.style.display = light ? 'none' : 'block';
      moonIcon.style.display = light ? 'block' : 'none';
    }
    btn.setAttribute('aria-label', light ? 'Activar modo oscuro' : 'Activar modo claro');
  }

  if (isLight) applyTheme(true);

  btn.addEventListener('click', () => {
    const willBeLight = !document.documentElement.classList.contains('light-mode');
    localStorage.setItem('theme', willBeLight ? 'light' : 'dark');
    applyTheme(willBeLight);
  });
})();

/* ─── 1. NAV — Scroll state & mobile toggle ─── */
(function initNav() {
  const nav = $('.nav');
  const menuBtn = $('#nav-menu-btn');
  const mobileNav = $('#mobile-nav');
  const mobileLinks = $$('.mobile-nav__link');

  // Smart Navbar (Hide-on-scroll) logic
  let ticking = false;
  let lastScrollY = window.scrollY;

  const onScroll = () => {
    if (ticking) return;

    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      
      // 1. Classic "scrolled" state for background changes
      nav.classList.toggle('scrolled', currentScrollY > 40);

      // 2. Hide/Show logic (Smart Navbar)
      // Always show at the very top (scroll = 0)
      if (currentScrollY <= 0) {
        nav.classList.remove('nav--hidden');
      } 
      // Scrolling down: hide (with a small buffer to avoid jitter)
      else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        nav.classList.add('nav--hidden');
      } 
      // Scrolling up: show immediately
      else if (currentScrollY < lastScrollY) {
        nav.classList.remove('nav--hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    });

    ticking = true;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // 3. Extra Usability: Show nav when mouse is near the top edge
  let mouseTicking = false;
  window.addEventListener('mousemove', (e) => {
    if (mouseTicking) return;

    // Only react if mouse is in the top 30px and nav is currently hidden
    if (e.clientY < 30 && nav.classList.contains('nav--hidden')) {
      mouseTicking = true;
      requestAnimationFrame(() => {
        nav.classList.remove('nav--hidden');
        mouseTicking = false;
      });
    }
  }, { passive: true });

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


/* ─── 5. SMOOTH ACTIVE NAV LINK (ScrollSpy) ─── */
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
              'nav__link--current',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.5, rootMargin: '-10% 0px -70% 0px' }
  );

  sections.forEach(sec => io.observe(sec));
})();


/* ─── 6. CARD MAGNETIC HOVER EFFECT ─── */
(function initMagneticCards() {
  const cards = $$('.bento__card, .stack__item, .philosophy__card, .hero__dtc-container');

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.willChange = 'transform';
    });

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
      card.style.willChange = 'auto';
    });
  });
})();


/* (Stack progress removed - handled by CSS/initReveal) */


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
    'figma-ai': {
      title: 'Figma AI Agent System v2.0',
      tags: ['AI Agents', 'MCP Servers', 'Figma API', 'TypeScript'],
      githubUrl: 'https://github.com/osCeballos/Figma-AI-Agent-System',
      graphicType: 'ui-mockup',
      galleryMockups: ['figma-prompt-mockup', 'figma-component-mockup'],
      challenge: 'Proyecto creado específicamente para OpenCode. El objetivo es automatizar el proceso repetitivo y manual de transformar especificaciones y prompts en componentes y layouts reales de Figma, garantizando la accesibilidad WCAG por defecto.',
      designProcess: 'Diseño de un ecosistema de 7 agentes especializados (Extractor, Tokens, Layout, Components, Validator, Auditor, Memory) orquestados mediante el Figma Director.',
      technical: 'Implementación con TypeScript, Figma Plugin API y servidores MCP. Creación de un pipeline secuencial determinista que aplica autocorrección de contraste (WCAG 2.2) de manera autónoma.',
      result: 'Un sistema capaz de generar diseños consistentes, escalables y 100% accesibles en una fracción del tiempo manual.'
    },
    'avallain-author': {
      title: 'Avallain Author - Front-End Trainee',
      tags: ['EdTech', 'WCAG 2.2', 'MCP Servers', 'Inline CSS'],
      graphicType: 'ai-mockup',
      galleryMockups: ['terminal-mockup', 'edtech-stats-mockup'],
      challenge: 'Maquetar contenido educativo interactivo en un entorno de autoría sumamente restrictivo (Avallain), sin acceso a hojas de estilo externas ni unidades de viewport, adaptando contenido complejo para el mercado francés.',
      designProcess: 'Se priorizó la resiliencia del diseño usando estilos inline estrictos y estructuración semántica. Gran énfasis en la accesibilidad (WCAG 2.1/2.2) para educación inclusiva.',
      technical: 'Desarrollo de herramientas internas: creación de servidores MCP y el agente figma-director para automatizar la inserción de HTML/CSS y validación de encoding de caracteres.',
      result: 'Reducción masiva de la deuda técnica y tiempo de maquetación gracias a la IA, entregando componentes accesibles y robustos para EdTech.'
    },
    'agentic-workflows': {
      title: 'Agentic Workflows & Legacy Architecture',
      tags: ['AI Agents', 'XML-First', 'CSS Variables', 'Workflow Optimization'],
      graphicType: 'ai-mockup',
      galleryMockups: ['workflow-files-mockup', 'workflow-dual-ai-mockup'],
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
        <div class="ai-mockup mockup--full-w">
          <div class="ai-mockup__prompt">$ antigraviti --validate --schema=xml-first --output=mercury</div>
          <div class="ai-mockup__output">
            <div class="ai-mockup__line"></div>
            <div class="ai-mockup__line shorter"></div>
            <div class="ai-mockup__line ai-mockup__line--w75"></div>
            <div class="ai-mockup__line shorter"></div>
            <div class="ai-mockup__line ai-mockup__line--w85"></div>
            <div class="ai-mockup__line ai-mockup__line--w50"></div>
          </div>
        </div>`,
      'city-mockup': `
        <div class="city-mockup mockup--full-w">
          <div class="city-mockup__header"><span></span><span></span><span></span></div>
          <div class="city-mockup__grid">
            <div class="city-mockup__stat"><span>AQI 42</span><small>Calidad Aire</small></div>
            <div class="city-mockup__stat"><span>12 km/h</span><small>Tráfico</small></div>
            <div class="city-mockup__stat"><span>87%</span><small>Transporte</small></div>
            <div class="city-mockup__stat"><span>2.4°C</span><small>Temperatura</small></div>
            <div class="city-mockup__chart">
              <svg viewBox="0 0 200 32" preserveAspectRatio="none">
                <polyline points="0,28 30,20 60,24 90,10 120,16 150,6 180,12 200,8" fill="none" stroke="currentColor" stroke-width="1.5" class="chart-line"/>
                <polyline points="0,28 30,20 60,24 90,10 120,16 150,6 180,12 200,8 200,32 0,32" fill="currentColor" class="chart-fill"/>
              </svg>
            </div>
          </div>
        </div>`,
      'ui-mockup': `
        <div class="ui-mockup mockup--full-w">
          <div class="ui-mockup__nav">
            <div class="ui-mockup__logo"></div>
            <div class="ui-mockup__links"><span></span><span></span><span></span></div>
          </div>
          <div class="ui-mockup__hero">
            <div class="ui-mockup__text">
              <span class="ui-mockup__line--gradient"></span>
              <span class="ui-mockup__line--w70"></span>
              <span class="shorter"></span>
            </div>
            <div class="ui-mockup__btn"></div>
          </div>
        </div>`,
      'visual-mockup': `
        <div class="visual-mockup visual-mockup--grid">
          <div class="visual-mockup__node visual-mockup__node--purple">
            <div class="visual-mockup__dot visual-mockup__dot--purple"></div>
            <span>Alumno</span>
          </div>
          <div class="visual-mockup__edge visual-mockup__edge--purple"></div>
          <div class="visual-mockup__node visual-mockup__node--cyan">
            <div class="visual-mockup__dot visual-mockup__dot--cyan"></div>
            <span>AI Engine</span>
          </div>
          <div class="visual-mockup__edge visual-mockup__edge--cyan"></div>
          <div class="visual-mockup__node visual-mockup__node--pink">
            <div class="visual-mockup__dot visual-mockup__dot--pink"></div>
            <span>Currículo</span>
          </div>
        </div>`
    };
    return map[type] || map['ai-mockup'];
  }

  /* ── Gallery micro-UI: componentes CSS-only únicos por proyecto ── */
  function getGalleryMockup(type) {
    const map = {
      'figma-prompt-mockup': `
        <div class="gallery-mockup gallery-mockup--terminal">
          <div class="gm-header">
            <span class="gm-dot gm-dot--red"></span>
            <span class="gm-dot gm-dot--yellow"></span>
            <span class="gm-dot gm-dot--green"></span>
            <span class="gm-filename">opencode-agent</span>
          </div>
          <div class="gm-terminal-body">
            <div class="gm-tline"><span class="gm-prompt">&gt;</span> crea un boton con los estilos...<span class="gm-cursor">_</span></div>
          </div>
        </div>`,
      'figma-component-mockup': `
        <div class="gallery-mockup gallery-mockup--form">
          <div class="gm-form-label">// figma_component</div>
          <div class="gm-form-input gm-form-input--success"><span>✓ Primary Button</span></div>
          <div class="gm-form-label gm-form-label--spaced">// properties generated</div>
          <div class="gm-form-tags">
            <span class="tag tag--mini">Hover</span>
            <span class="tag tag--mini">Dark Mode</span>
            <span class="tag tag--mini">a11y</span>
          </div>
        </div>`,
      'workflow-files-mockup': `
        <div class="gallery-mockup gallery-mockup--form">
          <div class="gm-form-label gm-form-label--accent">// Arquitectura_Maestra</div>
          <div class="gm-form-list">
            <div class="gm-form-input gm-form-input--list gm-form-input--purple">📄 Reglas_Tecnicas.md</div>
            <div class="gm-form-input gm-form-input--list gm-form-input--green">📦 Biblioteca_Componentes.css</div>
            <div class="gm-form-input gm-form-input--list gm-form-input--pink">📋 Ejemplos_Maestros.xml</div>
          </div>
        </div>`,
      'workflow-dual-ai-mockup': `
        <div class="gallery-mockup gallery-mockup--terminal">
          <div class="gm-header">
            <span class="gm-dot gm-dot--red"></span>
            <span class="gm-dot gm-dot--yellow"></span>
            <span class="gm-dot gm-dot--green"></span>
            <span class="gm-filename">dual-agent-sys</span>
          </div>
          <div class="gm-terminal-body gm-terminal-body--flex">
            <div class="gm-tline gm-tline--cyan">[ Antigraviti ]<br/><span class="gm-tline__sub">↳ Sanitización XML & a11y ✓</span></div>
            <div class="gm-tline gm-tline--purple">[ Gemini 3 ]<br/><span class="gm-tline__sub">↳ Arquitectura: CSS Workarounds ✓</span></div>
            <div class="gm-tline gm-ok gm-tline--spaced">❯ Workflow Completed (0.8s)</div>
          </div>
        </div>`,
      'code-snippet-mockup': `
        <div class="gallery-mockup gallery-mockup--code">
          <div class="gm-header">
            <span class="gm-dot gm-dot--red"></span>
            <span class="gm-dot gm-dot--yellow"></span>
            <span class="gm-dot gm-dot--green"></span>
            <span class="gm-filename">workflow.js</span>
          </div>
          <div class="gm-code">
            <div class="gm-line"><span class="gm-kw">const</span> agent = <span class="gm-fn">createAgent</span>(config);</div>
            <div class="gm-line"><span class="gm-kw">await</span> agent.<span class="gm-fn">validate</span>(<span class="gm-str">'xml-first'</span>);</div>
            <div class="gm-line gm-comment">// Schema: Mercury Grid v2.4</div>
            <div class="gm-line"><span class="gm-fn">pipeline</span>.<span class="gm-fn">run</span>({ output: <span class="gm-str">'production'</span> });</div>
          </div>
        </div>`,
      'terminal-mockup': `
        <div class="gallery-mockup gallery-mockup--terminal">
          <div class="gm-header">
            <span class="gm-dot gm-dot--red"></span>
            <span class="gm-dot gm-dot--yellow"></span>
            <span class="gm-dot gm-dot--green"></span>
            <span class="gm-filename">terminal</span>
          </div>
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
            <div class="gm-bar-row"><span class="gm-bar-label">Aire</span><div class="gm-bar-track"><div class="gm-bar-fill gm-bar-fill--cyan"></div></div><span class="gm-bar-val">88</span></div>
            <div class="gm-bar-row"><span class="gm-bar-label">Tráfico</span><div class="gm-bar-track"><div class="gm-bar-fill gm-bar-fill--purple"></div></div><span class="gm-bar-val">62</span></div>
            <div class="gm-bar-row"><span class="gm-bar-label">Bus</span><div class="gm-bar-track"><div class="gm-bar-fill gm-bar-fill--green"></div></div><span class="gm-bar-val">94</span></div>
            <div class="gm-bar-row"><span class="gm-bar-label">Ruido</span><div class="gm-bar-track"><div class="gm-bar-fill gm-bar-fill--pink"></div></div><span class="gm-bar-val">35</span></div>
          </div>
        </div>`,
      'mobile-wireframe-mockup': `
        <div class="gallery-mockup gallery-mockup--wireframe">
          <div class="gm-phone">
            <div class="gm-phone-notch"></div>
            <div class="gm-phone-screen">
              <div class="gm-wf-bar"></div>
              <div class="gm-wf-card"></div>
              <div class="gm-wf-card gm-wf-card--dimmed"></div>
              <div class="gm-wf-card gm-wf-card--ghost"></div>
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
          <div class="gm-form-label gm-form-label--spaced">// passwd</div>
          <div class="gm-form-input"><span>•••••••••</span></div>
          <div class="gm-form-btn">AUTHENTICATE →</div>
        </div>`,
      'node-graph-mockup': `
        <div class="gallery-mockup gallery-mockup--graph">
          <svg viewBox="0 0 180 100" class="gm-graph-svg">
            <line x1="40" y1="50" x2="90" y2="25" class="gm-graph-edge gm-graph-edge--purple" stroke-width="1"/>
            <line x1="40" y1="50" x2="90" y2="75" class="gm-graph-edge gm-graph-edge--cyan" stroke-width="1"/>
            <line x1="90" y1="25" x2="140" y2="50" class="gm-graph-edge gm-graph-edge--pink" stroke-width="1"/>
            <line x1="90" y1="75" x2="140" y2="50" class="gm-graph-edge gm-graph-edge--green" stroke-width="1"/>
            <circle cx="40" cy="50" r="12" class="gm-graph-node gm-graph-node--purple" stroke-width="1.5"/>
            <circle cx="90" cy="25" r="10" class="gm-graph-node gm-graph-node--cyan" stroke-width="1.5"/>
            <circle cx="90" cy="75" r="10" class="gm-graph-node gm-graph-node--pink" stroke-width="1.5"/>
            <circle cx="140" cy="50" r="12" class="gm-graph-node gm-graph-node--green" stroke-width="1.5"/>
            <text x="40" y="54" text-anchor="middle" font-size="5" class="gm-graph-label gm-graph-label--purple">AI</text>
            <text x="90" y="29" text-anchor="middle" font-size="5" class="gm-graph-label gm-graph-label--cyan">UX</text>
            <text x="90" y="79" text-anchor="middle" font-size="5" class="gm-graph-label gm-graph-label--pink">DATA</text>
            <text x="140" y="54" text-anchor="middle" font-size="5" class="gm-graph-label gm-graph-label--green">EDU</text>
          </svg>
        </div>`,
      'edtech-stats-mockup': `
        <div class="gallery-mockup gallery-mockup--stats">
          <div class="gm-stat-item"><div class="gm-stat-val gm-stat-val--purple">100%</div><div class="gm-stat-label">WCAG 2.2 AA</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val gm-stat-val--green">0</div><div class="gm-stat-label">Errores A11Y</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val gm-stat-val--cyan">-85%</div><div class="gm-stat-label">Deuda Técnica</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val gm-stat-val--pink">Inline</div><div class="gm-stat-label">Styling System</div></div>
        </div>`,
      'stats-mockup': `
        <div class="gallery-mockup gallery-mockup--stats">
          <div class="gm-stat-item"><div class="gm-stat-val gm-stat-val--purple">94%</div><div class="gm-stat-label">Engagement</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val gm-stat-val--green">+37%</div><div class="gm-stat-label">Retención</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val gm-stat-val--cyan">12s</div><div class="gm-stat-label">Respuesta IA</div></div>
          <div class="gm-stat-item"><div class="gm-stat-val gm-stat-val--pink">🏆 #1</div><div class="gm-stat-label">Hackathon BCN</div></div>
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
        <div class="modal__header-top">
          <h2 class="modal__title" id="modal-panel-title">${data.title}</h2>
          ${data.githubUrl ? `
            <a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--github-mini" aria-label="Ver código en GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              GitHub
            </a>
          ` : ''}
        </div>
        <div class="modal__header-content">
          <div class="modal__tags">
            ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
          <div class="modal__status">
            <span class="modal__section-title modal__status-label">// Status:</span>
            <span class="modal__status-value">✓ Completed</span>
          </div>
        </div>
      </header>

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

        <section class="modal__section modal__section--highlight">
          <span class="modal__section-title">// Resultado</span>
          <p class="modal__text modal__text--large"><strong>${data.result}</strong></p>
        </section>
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
    modal.setAttribute('aria-labelledby', 'modal-panel-title');
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
