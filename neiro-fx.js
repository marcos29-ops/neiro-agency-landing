/* Neiro Agency — efectos visuales: preloader, logo que se rellena al bajar (suavizado), títulos, pestañas de casos de uso,
   botones magnéticos y tarjetas con inclinación 3D. Solo capa visual: no toca formularios ni workflows. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var body = document.body;
  var pre = document.getElementById('preloader');

  /* ---- Preloader ---- */
  function finish() {
    body.classList.remove('is-loading');
    if (!pre) return;
    pre.classList.add('is-done');
    setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 1000);
  }
  var seen = false;
  try { seen = sessionStorage.getItem('neiro-intro') === '1'; } catch (e) {}
  if (!pre || reduce || seen) {
    if (pre && pre.parentNode) pre.parentNode.removeChild(pre);
    body.classList.remove('is-loading');
  } else {
    var count = pre.querySelector('.pl-count');
    var DURATION = 2100, start = null;
    var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
    var tick = function (ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / DURATION), p = ease(t);
      pre.style.setProperty('--p', p.toFixed(4));
      pre.querySelector('.pl-fill').style.setProperty('--p', p.toFixed(4));
      count.textContent = Math.round(p * 100);
      if (t < 1) { requestAnimationFrame(tick); }
      else { setTimeout(finish, 280); try { sessionStorage.setItem('neiro-intro', '1'); } catch (e) {} }
    };
    requestAnimationFrame(tick);
    setTimeout(function () { if (document.getElementById('preloader')) finish(); }, 5500);
  }

  /* ---- Scroll suavizado (lerp): logo del hero + títulos ---- */
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var track = document.querySelector('.hero-track');
  var heads = [].slice.call(document.querySelectorAll('h2')).map(function (h) {
    h.classList.add('fill-h');
    return { el: h, cur: 0, tgt: 0 };
  });
  var hero = { cur: 0, tgt: 0 };
  var running = false;
  var EASE = 0.1; // más bajo = más lento y fluido

  function measure() {
    var vh = window.innerHeight;
    var atBottom = window.pageYOffset + vh >= document.documentElement.scrollHeight - 4;
    if (track) {
      var r = track.getBoundingClientRect();
      var total = track.offsetHeight - vh;
      hero.tgt = reduce ? 1 : clamp(-r.top / (total * 0.9));
    }
    heads.forEach(function (h) {
      var b = h.el.getBoundingClientRect();
      h.tgt = reduce ? 1 : clamp((vh * 0.92 - b.top) / (vh * 0.42));
      if (atBottom && b.top < vh) { h.tgt = 1; }
    });
  }
  function frame() {
    var moving = false, d;
    if (track) {
      d = hero.tgt - hero.cur;
      if (Math.abs(d) > 0.0004) { hero.cur += d * EASE; moving = true; } else { hero.cur = hero.tgt; }
      track.style.setProperty('--hp', hero.cur.toFixed(4));
    }
    heads.forEach(function (h) {
      var dd = h.tgt - h.cur;
      if (Math.abs(dd) > 0.0004) { h.cur += dd * (EASE * 1.6); moving = true; } else { h.cur = h.tgt; }
      h.el.style.setProperty('--p', h.cur.toFixed(4));
    });
    if (moving) { requestAnimationFrame(frame); } else { running = false; }
  }
  function kick() { measure(); if (!running) { running = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  if (reduce) { hero.cur = 1; heads.forEach(function (h) { h.cur = 1; }); }
  kick();

  /* ---- Casos de uso: pestañas redondas con indicador que se desliza ---- */
  (function () {
    var tabsWrap = document.querySelector('.uc-tabs');
    var grid = document.querySelector('.uc-grid');
    if (!tabsWrap || !grid) return;
    var tabs = [].slice.call(tabsWrap.querySelectorAll('.uc-tab'));
    var ind = tabsWrap.querySelector('.uc-ind');
    var cards = [].slice.call(grid.children);
    cards.forEach(function (c) { c.classList.add('uc-card'); });
    grid.classList.add('is-tabbed');
    var current = 0;

    function moveInd() {
      var t = tabs[current];
      ind.style.width = t.offsetWidth + 'px';
      ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
      if (tabsWrap.scrollWidth > tabsWrap.clientWidth) {
        tabsWrap.scrollTo({ left: t.offsetLeft - (tabsWrap.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
      }
    }
    function show(i) {
      current = i;
      cards.forEach(function (c, k) {
        if (k === i) {
          c.hidden = false;
          c.classList.add('is-in');
          c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
        } else { c.hidden = true; }
      });
      tabs.forEach(function (t, k) {
        t.classList.toggle('is-active', k === i);
        t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      });
      moveInd();
      document.dispatchEvent(new CustomEvent('uc:show', { detail: { index: i, card: cards[i] } }));
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { if (k !== current) show(k); }); });
    tabsWrap.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { show((current + 1) % tabs.length); tabs[current].focus(); }
      if (e.key === 'ArrowLeft') { show((current + tabs.length - 1) % tabs.length); tabs[current].focus(); }
    });
    window.addEventListener('resize', moveInd);
    show(0);
    setTimeout(moveInd, 300);
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(moveInd); }
  })();

  /* ---- Vista previa local: Chatwoot solo carga en neiro.agency; aquí se muestra un botón de muestra ---- */
  (function () {
    var h = location.hostname;
    if (!(h === 'localhost' || h === '127.0.0.1')) return;
    if (!document.querySelector('[data-open-chat]') && !document.querySelector('script[src*="script.js"]')) return;
    (function () {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chat-preview'; b.setAttribute('aria-label', 'Chat (vista previa local)');
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/></svg>';
      // Mismo comportamiento que la burbuja real (se despliega en la misma página). En local el iframe de Chatwoot está bloqueado.
      b.addEventListener('click', function () {
        if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') { window.$chatwoot.toggle(); }
        tip.classList.add('is-on'); setTimeout(function () { tip.classList.remove('is-on'); }, 6000);
      });
      var tip = document.createElement('div'); tip.className = 'chat-preview-tip';
      tip.textContent = 'Vista previa local: el chat de Chatwoot se ve vacío aquí porque su servidor solo lo permite en neiro.agency. En la web real se despliega con el bot.';
      document.body.appendChild(b); document.body.appendChild(tip);
    })();
  })();

  if (!finePointer || reduce) return;

  /* ---- Tarjetas: brillo azul que sigue al mouse (sin inclinación) ---- */
  [].slice.call(document.querySelectorAll('.lift')).forEach(function (c) {
    if (c.closest('.uc-grid')) return;
    c.classList.add('tilt');
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--gx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      c.style.setProperty('--gy', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    });
  });

  /* ---- Hero: luz y cuadrícula azul siguen al mouse ---- */
  var sticky = document.querySelector('.hero-sticky');
  if (sticky) {
    sticky.addEventListener('pointermove', function (e) {
      var r = sticky.getBoundingClientRect();
      sticky.style.setProperty('--sx', (e.clientX - r.left).toFixed(0) + 'px');
      sticky.style.setProperty('--sy', (e.clientY - r.top).toFixed(0) + 'px');
      sticky.style.setProperty('--sa', '1');
    });
    sticky.addEventListener('pointerleave', function () { sticky.style.setProperty('--sa', '0'); });
  }
})();
