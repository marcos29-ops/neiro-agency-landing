/* Neiro Agency — extras visuales: barra de progreso, partículas, chats animados,
   contadores, apilado de tarjetas, calculadora y transición entre páginas. Solo capa visual. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var isEn = function () { var b = document.getElementById('lang-en'); return !!(b && b.classList.contains('is-active')); };

  /* ---- Barra de progreso ---- */
  var bar = document.createElement('div'); bar.className = 'scroll-bar'; document.body.appendChild(bar);
  function progress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--sp', h > 0 ? Math.min(1, window.pageYOffset / h).toFixed(4) : 0);
  }
  window.addEventListener('scroll', progress, { passive: true }); progress();

  /* ---- Transición suave entre páginas ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var url;
    try { url = new URL(a.href, location.href); } catch (er) { return; }
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || url.pathname === location.pathname) return;
    if (/privacidad\.html$/.test(url.pathname)) return;
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function () { location.href = a.href; }, 260);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) document.body.classList.remove('is-leaving'); });

  /* ---- Contadores ---- */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    counters.forEach(function (c) { c.textContent = '0'; });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, to = parseInt(el.getAttribute('data-count'), 10), t0 = null;
        (function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1500), e2 = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(to * e2);
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---- Cinta: duplicar para el bucle infinito ---- */
  var track = $('.marquee-track');
  if (track) {
    var clone = track.cloneNode(true); clone.setAttribute('aria-hidden', 'true');
    while (clone.firstChild) track.appendChild(clone.firstChild);
  }

  /* ---- Apilado de tarjetas: índice para el desplazamiento ---- */
  $$('.stack-grid > .lift').forEach(function (c, i) { c.style.setProperty('--i', i); });

  /* ---- Calculadora ---- */
  (function () {
    var h = $('#calc-h'), c = $('#calc-c');
    if (!h || !c) return;
    var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    function paint(inp) { inp.style.setProperty('--fill', ((inp.value - inp.min) / (inp.max - inp.min) * 100) + '%'); }
    function calc() {
      var hrs = +h.value, cost = +c.value, en = isEn();
      // 4 semanas por mes; el agente se encarga de ~70% del trabajo y el otro 30% sigue siendo tuyo.
      // Todo en horas enteras para que se vea la cuenta: hoy = con agente + ahorro.
      var now = hrs * 4, saved = Math.round(now * 0.7), withAgent = now - saved, month = saved * cost;
      var set = function (id, t) { $(id).textContent = t; };
      set('#calc-h-out', hrs + ' h'); set('#calc-c-out', '$' + cost);
      set('#calc-r-now', now + ' h'); set('#calc-r-with', withAgent + ' h'); set('#calc-r-h', saved + ' h');
      set('#calc-r-m', fmt(month)); set('#calc-r-y', fmt(month * 12));
      set('#calc-l-now', en ? 'TODAY' : 'HOY');
      set('#calc-l-with', en ? 'WITH THE AGENT' : 'CON EL AGENTE');
      set('#calc-l-save', en ? 'YOU SAVE' : 'TE AHORRAS');
      set('#calc-s-now', en ? hrs + ' h per week × 4 weeks, each month' : hrs + ' h por semana × 4 semanas, cada mes');
      set('#calc-s-with', en ? 'what you would still do yourself' : 'lo que seguirías haciendo tú');
      set('#calc-s-save', en ? now + ' h − ' + withAgent + ' h, each month' : now + ' h − ' + withAgent + ' h, cada mes');
      set('#calc-m-pre', en ? 'Those ' + saved + ' h are worth' : 'Esas ' + saved + ' h valen');
      set('#calc-m-mo', en ? 'per month' : 'al mes'); set('#calc-m-yr', en ? 'per year' : 'al año');
      paint(h); paint(c);
    }
    ['lang-es', 'lang-en'].forEach(function (id) { var b = document.getElementById(id); if (b) b.addEventListener('click', function () { setTimeout(calc, 30); }); });
    h.addEventListener('input', calc); c.addEventListener('input', calc); calc();
    var cta = $('#calc-cta');
    if (cta) cta.addEventListener('click', function () {
      // El mensaje con los números viaja a la página de contacto (se rellena solo si el campo está vacío)
      var hrs = +h.value, cost = +c.value;
      var msg = isEn()
        ? 'I spend about ' + hrs + ' hours a week on repetitive tasks (an hour of my time is worth ~$' + cost + '). I would like to see what can be automated.'
        : 'Dedico unas ' + hrs + ' horas a la semana a tareas repetitivas (una hora de mi tiempo vale ~$' + cost + '). Quiero ver qué se puede automatizar.';
      try { sessionStorage.setItem('neiro-prefill', msg); } catch (e) {}
    });
  })();

  /* ---- Mensaje guardado por la calculadora -> campo de mensaje de la página de contacto ---- */
  (function () {
    var m = $('#c-mensaje'), saved = null;
    try { saved = sessionStorage.getItem('neiro-prefill'); } catch (e) {}
    if (m && saved && !m.value.trim()) { m.value = saved; try { sessionStorage.removeItem('neiro-prefill'); } catch (e) {} }
  })();

  /* ---- Luz que sigue al mouse en tarjetas de Cómo funciona, cuadro de ejemplos y calculadora ---- */
  var formCard = $('#c-nombre') && $('#c-nombre').closest('[style*="border-radius: 18px"]');
  var glowEls = $$('.flow-node, .uc-note, .calc-box'); if (formCard) { formCard.classList.add('form-card'); glowEls.push(formCard); }
  glowEls.forEach(function (el) {
    el.classList.add('mglow');
    if (el.matches('.uc-note, .calc-box') || el === formCard) el.classList.add('dark');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--gx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    });
  });

  /* ---- Luz suave que sigue al mouse por TODA la sección (contacto, llamada y Qué hago), también a los lados ---- */
  var queHago = $('.stack-grid') && $('.stack-grid').closest('.sec-dark');
  ['#contacto', '#agenda', queHago].forEach(function (sel) {
    var sec = typeof sel === 'string' ? $(sel) : sel;
    if (!sec || !sec.classList.contains('sec-dark')) return;
    sec.classList.add('mglow', 'dark', 'wide');
    sec.addEventListener('pointermove', function (e) {
      var r = sec.getBoundingClientRect();
      sec.style.setProperty('--gx', (e.clientX - r.left).toFixed(0) + 'px');
      sec.style.setProperty('--gy', (e.clientY - r.top).toFixed(0) + 'px');
    });
  });

  /* ---- Chats animados (escriben mensaje por mensaje) ---- */
  var MSG = '[style*="align-self: flex-start; max-width"], [style*="align-self: flex-end; max-width"]';
  function runChat(card) {
    if (!card || reduce) return;
    var msgs = $$(MSG, card);
    if (!msgs.length) return;
    card._tok = (card._tok || 0) + 1;
    var tok = card._tok;
    $$('.typing', card).forEach(function (t) { t.remove(); });
    msgs.forEach(function (m) { m.classList.remove('msg-in'); m.classList.add('msg-hide'); });
    var host = msgs[0].parentElement; host.style.position = 'relative';
    var i = 0;
    function next() {
      if (tok !== card._tok || i >= msgs.length) return;
      var m = msgs[i], left = /flex-start/.test(m.getAttribute('style') || '');
      var ty = document.createElement('div');
      ty.className = 'typing' + (left ? ' is-left' : '');
      ty.innerHTML = '<i></i><i></i><i></i>';
      ty.style.top = (m.offsetTop + 4) + 'px';
      host.appendChild(ty);
      setTimeout(function () {
        if (tok !== card._tok) { ty.remove(); return; }
        ty.remove(); m.classList.remove('msg-hide'); m.classList.add('msg-in');
        i++; setTimeout(next, 450);
      }, left ? 700 : 1100);
    }
    setTimeout(next, 350);
  }
  document.addEventListener('uc:show', function (e) {
    var card = e.detail.card;
    if (e.detail.index === 0 && !card._seen) return; // la primera se anima al verla en pantalla
    runChat(card);
  });
  var first = $('.uc-card');
  if (first && 'IntersectionObserver' in window && !reduce) {
    first.querySelectorAll(MSG).forEach(function (m) { m.classList.add('msg-hide'); });
    var fio = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { fio.disconnect(); first._seen = true; runChat(first); }
    }, { threshold: 0.35 });
    fio.observe(first);
  }

  if (reduce) return; // las partículas también corren en celular (con el dedo hacen de mouse)

  /* ---- Hero: red de partículas que reacciona al mouse ---- */
  var sticky = $('.hero-sticky');
  if (sticky) {
    var cv = document.createElement('canvas'); cv.className = 'hero-net'; sticky.insertBefore(cv, sticky.firstChild);
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1), pts = [], mouse = { x: -999, y: -999 }, vis = true, act = 0;
    function size() {
      var nw = sticky.clientWidth, nh = sticky.clientHeight;
      // En celular, al hacer scroll la barra del navegador aparece/desaparece y cambia la altura (~50-100 px): se ignora
      // (si el ancho es el mismo y la altura cambia poco, no se toca nada, así los puntos no se mueven ni saltan).
      if (pts.length && Math.abs(nw - W) < 2 && Math.abs(nh - H) < 150) return;
      var ow = W, oh = H;
      W = nw; H = nh;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(110, Math.max(36, W * H / 14000)));
      if (pts.length && ow && oh && Math.abs(pts.length - n) < 14) {
        // mismo grupo de puntos: se reescala su posición (sin reiniciar, para que nada "salte")
        pts.forEach(function (p) { p.x *= W / ow; p.y *= H / oh; });
      } else {
        pts = []; for (var k = 0; k < n; k++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
      }
    }
    size(); window.addEventListener('resize', size);
    sticky.addEventListener('pointermove', function (e) { var r = sticky.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(function (t) { sticky.addEventListener(t, function () { mouse.x = mouse.y = -999; }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }, { threshold: 0 }).observe(sticky);
    (function draw() {
      requestAnimationFrame(draw);
      if (!vis) return;
      ctx.clearRect(0, 0, W, H);
      // Zona del texto: al cargar, puntos y líneas se desvanecen suavemente ahí (sin recortes).
      // En cuanto el usuario mueve el mouse sobre el hero, se pueden ver también sobre el texto.
      var sr = sticky.getBoundingClientRect(), z1 = $('.hero-tag'), z2 = $('.hero-copy'), zr = null;
      if (z1 && z2) {
        var r1 = z1.getBoundingClientRect(), r2 = z2.getBoundingClientRect();
        zr = { l: Math.min(r1.left, r2.left) - sr.left, r: Math.max(r1.right, r2.right) - sr.left, t: r1.top - sr.top, b: r2.bottom - sr.top };
      }
      act += (mouse.x > -900 ? 0.04 : -0.004); act = act < 0 ? 0 : act > 1 ? 1 : act;
      var fade = function (x, y) {
        if (!zr) return 1;
        var dx = Math.max(zr.l - x, 0, x - zr.r), dy = Math.max(zr.t - y, 0, y - zr.b), d = Math.sqrt(dx * dx + dy * dy);
        var base = d >= 70 ? 1 : 0.04 + 0.96 * (d / 70);
        return base + (1 - base) * act;
      };
      for (var a = 0; a < pts.length; a++) {
        var p = pts[a];
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 22000) { var f = (1 - d2 / 22000) * 0.9; p.vx += dx / Math.sqrt(d2 + 1) * f * .05; p.vy += dy / Math.sqrt(d2 + 1) * f * .05; }
        p.vx *= .985; p.vy *= .985;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath(); var fa = fade(p.x, p.y); ctx.arc(p.x, p.y, 3.2, 0, 6.283); ctx.fillStyle = 'rgba(26,77,255,' + (0.9 * fa).toFixed(3) + ')'; ctx.fill();
        for (var b = a + 1; b < pts.length; b++) {
          var q = pts[b], ex = p.x - q.x, ey = p.y - q.y, dd = ex * ex + ey * ey;
          if (dd < 24000) { ctx.strokeStyle = 'rgba(26,77,255,' + (0.6 * (1 - dd / 24000) * Math.min(fa, fade(q.x, q.y))).toFixed(3) + ')'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        if (d2 < 30000) { ctx.strokeStyle = 'rgba(79,209,255,' + (0.9 * (1 - d2 / 30000)).toFixed(3) + ')'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
    })();
  }
})();
