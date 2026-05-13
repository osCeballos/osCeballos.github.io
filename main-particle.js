/**
 * main-particle.js — Animaciones pesadas y efectos visuales
 * Partículas del hero, Cursor glow y Efecto magnético.
 */

(function initParticlesModule() {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* CARD MAGNETIC HOVER EFFECT */
  function initMagneticCards() {
    const cards = $$('.bento__card, .stack__item, .philosophy__card, .hero__dtc-container');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => { card.style.willChange = 'transform'; });
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const factor = 0.008;
        card.style.transition = 'transform 0.15s ease-out';
        card.style.transform = `translateY(-4px) perspective(1000px) rotateX(${-y * factor}deg) rotateY(${x * factor}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        card.style.transform = '';
        card.style.willChange = 'auto';
      });
    });
  }

  /* CURSOR GLOW (desktop only) */
  function initCursorGlow() {
    if (window.matchMedia('(hover: none)').matches) return;
    const glow = document.createElement('div');
    glow.style.cssText = `position:fixed;top:0;left:0;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle, rgba(139,92,246,.08) 0%, transparent 70%);pointer-events:none;z-index:0;transform:translate3d(-200px,-200px,0);transition:opacity .3s ease;opacity:0;`;
    document.body.appendChild(glow);
    let mx = 0, my = 0, gx = 0, gy = 0, frame;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; glow.style.opacity = '1'; });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    function loop() {
      gx += (mx - gx) * 0.08; gy += (my - gy) * 0.08;
      glow.style.transform = `translate3d(${gx - 200}px, ${gy - 200}px, 0)`;
      frame = requestAnimationFrame(loop);
    }
    loop();
    document.addEventListener('visibilitychange', () => { document.hidden ? cancelAnimationFrame(frame) : loop(); });
  }

  /* HERO PARTICLE DOTS (canvas, desktop) */
  function initParticles() {
    if (window.matchMedia('(hover: none)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;opacity:.4';
    const hero = $('.hero');
    if (!hero) return;
    hero.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 40;
    let W, H, particles = [], animationId = null;
    function resize() { W = canvas.width = hero.offsetWidth; H = canvas.height = hero.offsetHeight; }
    function randRange(min, max) { return min + Math.random() * (max - min); }
    function create() { return { x: Math.random() * W, y: Math.random() * H, r: randRange(0.8, 2.5), vx: randRange(-0.15, 0.15), vy: randRange(-0.2, -0.05), alpha: randRange(0.2, 0.7) }; }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.0008;
        if (p.y < 0 || p.alpha <= 0) { p.x = Math.random() * W; p.y = H + 5; p.alpha = randRange(0.2, 0.7); }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha})`; ctx.fill();
      });
      animationId = requestAnimationFrame(draw);
    }
    function start() { if (!animationId) animationId = requestAnimationFrame(draw); }
    function stop() { if (animationId) { cancelAnimationFrame(animationId); animationId = null; } }
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, create);
    const observer = new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); }, { threshold: 0 });
    observer.observe(hero);
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    window.addEventListener('resize', resize, { passive: true });
  }

  // Initialize all heavy effects
  initMagneticCards();
  initCursorGlow();
  initParticles();
})();
