(function () {
  'use strict';

  var ACCENT = '#2F6BFF';

  var GUIAS = [
    { id: 'g1', tag: 'dinero', title: '[Título de la guía 01]', desc: '[Una línea sobre cómo generar ingresos con IA.]' },
    { id: 'g2', tag: 'claude', title: '[Título de la guía 02]', desc: '[Un tip, tool o plugin de Claude explicado paso a paso.]' },
    { id: 'g3', tag: 'dinero', title: '[Título de la guía 03]', desc: '[Una línea sobre el modelo de negocio que explica.]' },
    { id: 'g4', tag: 'claude', title: '[Título de la guía 04]', desc: '[Un tip, tool o plugin de Claude explicado paso a paso.]' },
    { id: 'g5', tag: 'dinero', title: '[Título de la guía 05]', desc: '[Una línea sobre cómo generar ingresos con IA.]' },
    { id: 'g6', tag: 'claude', title: '[Título de la guía 06]', desc: '[Un tip, tool o plugin de Claude explicado paso a paso.]' }
  ];

  var picked = {};

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'style') { node.style.cssText = attrs[k]; }
      else if (k.indexOf('on') === 0) { node.addEventListener(k.slice(2).toLowerCase(), attrs[k]); }
      else { node.setAttribute(k, attrs[k]); }
    });
    (children || []).forEach(function (c) {
      if (typeof c === 'string') { node.appendChild(document.createTextNode(c)); }
      else if (c) { node.appendChild(c); }
    });
    return node;
  }

  function svgCheck(color) {
    var wrap = document.createElement('div');
    wrap.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"></path></svg>';
    return wrap.firstChild;
  }

  function renderGuiaCard(g) {
    var on = !!picked[g.id];
    var card = el('div', {
      class: 'reveal lift is-in',
      style: 'scroll-snap-align:start;flex:0 0 300px;background:#ffffff;border:1.5px solid ' + (on ? ACCENT : '#E8EAEF') + ';border-radius:16px;padding:26px;display:flex;flex-direction:column;gap:14px;cursor:pointer;',
      onClick: function () {
        if (picked[g.id]) { delete picked[g.id]; } else { picked[g.id] = true; }
        renderGuias();
      }
    });

    var dot = el('div', {
      style: 'width:24px;height:24px;border-radius:50%;border:1.5px solid ' + (on ? ACCENT : '#DDE0E7') + ';background:' + (on ? ACCENT : '#ffffff') + ';display:flex;align-items:center;justify-content:center;'
    }, [svgCheck('#ffffff')]);

    card.appendChild(el('div', { style: 'display:flex;justify-content:flex-end;' }, [dot]));
    card.appendChild(el('h3', { style: 'font-size:18px;line-height:1.32;font-weight:700;color:#12131A;' }, [g.title]));
    card.appendChild(el('p', { style: 'font-size:14.5px;line-height:1.62;color:#5A5F6E;flex-grow:1;' }, [g.desc]));
    card.appendChild(el('span', {
      style: 'font-size:13.5px;font-weight:500;color:' + (on ? ACCENT : '#8C91A0') + ';'
    }, [on ? 'Seleccionada' : 'Tocá para seleccionar']));

    return card;
  }

  function renderGuias() {
    var railDinero = document.getElementById('rail-guias-dinero');
    var railClaude = document.getElementById('rail-guias-claude');
    railDinero.innerHTML = '';
    railClaude.innerHTML = '';
    GUIAS.filter(function (g) { return g.tag === 'dinero'; }).forEach(function (g) { railDinero.appendChild(renderGuiaCard(g)); });
    GUIAS.filter(function (g) { return g.tag === 'claude'; }).forEach(function (g) { railClaude.appendChild(renderGuiaCard(g)); });

    var count = Object.keys(picked).length;
    var form = document.getElementById('guias-form');
    var sent = document.getElementById('guias-sent');
    var empty = document.getElementById('guias-empty');

    if (sent.hasAttribute('data-sent')) {
      form.hidden = true; empty.hidden = true; sent.hidden = false;
      return;
    }

    if (count > 0) {
      form.hidden = false; empty.hidden = true; sent.hidden = true;
      document.getElementById('picked-title').textContent = count === 1 ? '1 guía seleccionada' : count + ' guías seleccionadas';
      document.getElementById('submit-guias').textContent = count === 1 ? 'Descargar 1 guía' : 'Descargar ' + count + ' guías';
    } else {
      form.hidden = true; empty.hidden = false; sent.hidden = true;
    }
  }

  document.getElementById('clear-picks').addEventListener('click', function () {
    picked = {};
    renderGuias();
  });

  document.getElementById('submit-guias').addEventListener('click', function () {
    document.getElementById('guias-sent').setAttribute('data-sent', '1');
    renderGuias();
  });

  document.getElementById('reset-guias').addEventListener('click', function () {
    picked = {};
    document.getElementById('guias-sent').removeAttribute('data-sent');
    renderGuias();
  });

  document.querySelectorAll('[data-rail-left]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rail = document.getElementById(btn.getAttribute('data-rail-left'));
      if (rail) { rail.scrollBy({ left: -340, behavior: 'smooth' }); }
    });
  });
  document.querySelectorAll('[data-rail-right]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rail = document.getElementById(btn.getAttribute('data-rail-right'));
      if (rail) { rail.scrollBy({ left: 340, behavior: 'smooth' }); }
    });
  });

  document.querySelectorAll('[data-scroll]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-scroll'));
      if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  var PHONE_DIGIT_LENGTHS = {
    '+506': [8, 8], '+507': [7, 8], '+52': [10, 10], '+57': [10, 10],
    '+54': [10, 10], '+56': [9, 9], '+51': [9, 9], '+593': [9, 9],
    '+502': [8, 8], '+503': [8, 8], '+504': [8, 8], '+505': [8, 8],
    '+1': [10, 10], '+34': [9, 9], '+55': [10, 11], '+44': [10, 10],
    '+33': [9, 9], '+49': [6, 11], '+39': [9, 10], '+351': [9, 9]
  };

  function validatePhone(countryOption, rawValue) {
    var code = (countryOption || '').split(' ')[0];
    var range = PHONE_DIGIT_LENGTHS[code] || [6, 14];
    var digits = (rawValue || '').replace(/\D/g, '');
    if (!digits) { return 'Ingresá tu número de teléfono.'; }
    if (digits.length < range[0] || digits.length > range[1]) {
      var expected = range[0] === range[1] ? range[0] + ' dígitos' : 'entre ' + range[0] + ' y ' + range[1] + ' dígitos';
      return 'Para ' + code + ' se esperan ' + expected + ' (tenés ' + digits.length + ').';
    }
    return null;
  }

  var telInput = document.getElementById('c-telefono');
  var telSelect = document.getElementById('c-pais-tel');
  var telError = document.getElementById('c-tel-error');

  function clearTelError() {
    telError.hidden = true;
    telError.textContent = '';
    telInput.style.borderColor = '#DDE0E7';
  }
  telInput.addEventListener('input', clearTelError);
  telSelect.addEventListener('change', clearTelError);

  document.getElementById('c-submit').addEventListener('click', function () {
    var err = validatePhone(telSelect.value, telInput.value);
    if (err) {
      telError.hidden = false;
      telError.textContent = err;
      telInput.style.borderColor = '#C0392B';
    } else {
      clearTelError();
    }
  });

  document.body.setAttribute('data-anim', 'on');
  var reveals = document.querySelectorAll('.reveal');
  if (typeof IntersectionObserver === 'undefined') {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  }

  renderGuias();
})();
