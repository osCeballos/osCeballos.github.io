/**
 * main-critical.js — Lógica esencial del Portfolio
 * Tema, Navegación, Modales, Revelado y Contadores.
 */

/* Utility functions */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* THEME SWITCHER */
(function initTheme() {
  const btn = $('#theme-toggle');
  if (!btn) return;

  const sunIcon = $('.theme-toggle__icon--sun', btn);
  const moonIcon = $('.theme-toggle__icon--moon', btn);

  const savedTheme = localStorage.getItem('theme');
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

/* NAV — Scroll state & mobile toggle */
(function initNav() {
  const nav = $('.nav');
  const menuBtn = $('#nav-menu-btn');
  const mobileNav = $('#mobile-nav');
  const navLinks = $$('.nav__link');
  const mobileLinks = $$('.mobile-nav__link');

  let ticking = false;
  let lastScrollY = window.scrollY;

  const onScroll = () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const isScrolled = currentScrollY > 40;
      nav.classList.toggle('nav--scrolled', isScrolled);
      navLinks.forEach(link => link.classList.toggle('nav__link--scrolled', isScrolled));

      if (currentScrollY <= 0) {
        nav.classList.remove('nav--hidden');
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        nav.classList.add('nav--hidden');
      } else if (currentScrollY < lastScrollY) {
        nav.classList.remove('nav--hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
    });
    ticking = true;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  let mouseTicking = false;
  window.addEventListener('mousemove', (e) => {
    if (mouseTicking) return;
    if (e.clientY < 30 && nav.classList.contains('nav--hidden')) {
      mouseTicking = true;
      requestAnimationFrame(() => {
        nav.classList.remove('nav--hidden');
        mouseTicking = false;
      });
    }
  }, { passive: true });

  mobileLinks.forEach(link => link.setAttribute('tabindex', '-1'));

  function toggleMenu(open) {
    menuBtn.classList.toggle('is-open', open);
    mobileNav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    mobileNav.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
    mobileLinks.forEach(link => link.setAttribute('tabindex', open ? '0' : '-1'));
  }

  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('is-open');
    toggleMenu(!isOpen);
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(false);
  });
})();

/* TYPEWRITER — Hero role text */
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
  await sleep(1200);

  while (true) {
    for (const phrase of phrases) {
      for (let i = 1; i <= phrase.length; i++) {
        el.textContent = phrase.substring(0, i);
        await sleep(90);
      }
      await sleep(2200);
      for (let i = phrase.length; i >= 0; i--) {
        el.textContent = phrase.substring(0, i);
        await sleep(50);
      }
      await sleep(300);
    }
  }
})();

/* INTERSECTION OBSERVER — Reveal on scroll */
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
          const bars = entry.target.querySelectorAll('.stack__level[role="progressbar"]');
          bars.forEach(bar => {
            const val = bar.getAttribute('aria-valuenow');
            bar.setAttribute('aria-valuenow', val);
          });
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  $$('.reveal').forEach(el => io.observe(el));
})();

/* COUNTER ANIMATION — Stats section */
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
    counters.forEach(el => { el.textContent = el.dataset.target; });
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

/* SMOOTH ACTIVE NAV LINK (ScrollSpy) */
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
            link.classList.toggle('nav__link--current', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.5, rootMargin: '-10% 0px -70% 0px' }
  );

  sections.forEach(sec => io.observe(sec));
})();

/* PROJECT MODALS — Detailed case studies */
(function initProjectModals() {
  const modal = $('#project-modal');
  const modalContent = $('#modal-content');
  const modalClose = $('#modal-close');
  const modalOverlay = $('#modal-overlay');

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

  function getHeroGraphic(type) {
    const map = {
      'ai-mockup': `<img src="./assets/mockups/ai.svg" alt="Mockup de IA" width="400" height="280" class="mockup--full-w">`,
      'city-mockup': `<img src="./assets/mockups/city.svg" alt="Mockup Smart City" width="400" height="280" class="mockup--full-w">`,
      'ui-mockup': `<img src="./assets/mockups/ui.svg" alt="Mockup UI" width="400" height="280" class="mockup--full-w">`,
      'visual-mockup': `<img src="./assets/mockups/visual.svg" alt="Mockup Visual" width="400" height="280" class="mockup--full-w">`
    };
    return map[type] || map['ai-mockup'];
  }

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
    const panel = modal.querySelector('.modal__panel');
    if (panel) panel.scrollTop = 0;

    modalContent.innerHTML = `
      <div class="modal__hero-graphic">${getHeroGraphic(data.graphicType)}</div>
      <header class="modal__header">
        <div class="modal__header-top">
          <h2 class="modal__title" id="modal-panel-title">${data.title}</h2>
          ${data.githubUrl ? `<a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--github-mini">GitHub</a>` : ''}
        </div>
        <div class="modal__header-content">
          <div class="modal__tags">${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
          <div class="modal__status"><span class="modal__section-title">// Status:</span> <span class="modal__status-value">✓ Completed</span></div>
        </div>
      </header>
      <div class="modal__main">
        <section class="modal__section"><span class="modal__section-title">// El Reto</span><p class="modal__text">${data.challenge}</p></section>
        <section class="modal__section"><span class="modal__section-title">// Proceso</span><p class="modal__text">${data.designProcess}</p></section>
        <section class="modal__section"><span class="modal__section-title">// Técnica</span><p class="modal__text">${data.technical}</p></section>
        <section class="modal__section modal__section--highlight"><span class="modal__section-title">// Resultado</span><p class="modal__text"><strong>${data.result}</strong></p></section>
      </div>
      <div class="modal__gallery-section"><span class="modal__section-title">// Artefactos</span><div class="modal__gallery">${data.galleryMockups.map(type => getGalleryMockup(type)).join('')}</div></div>
    `;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-labelledby', 'modal-panel-title');
    previousFocus = document.activeElement;
    const firstFocusable = modal.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  let previousFocus = null;
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    modal.setAttribute('aria-hidden', 'true');
    if (previousFocus) { previousFocus.focus(); previousFocus = null; }
  }

  const bentoGrid = $('.bento');
  if (bentoGrid) {
    bentoGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.bento__card-link[data-project]');
      if (!btn) return;
      e.preventDefault();
      previousFocus = btn;
      openModal(btn.dataset.project);
    });
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const els = [...modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])')];
      if (!els.length) return;
      if (e.shiftKey && document.activeElement === els[0]) { e.preventDefault(); els[els.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === els[els.length - 1]) { e.preventDefault(); els[0].focus(); }
    }
  });
})();
