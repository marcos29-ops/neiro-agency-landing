(function () {
  'use strict';

  var ACCENT = '#2F6BFF';
  var lang = 'es';

  // Webhooks publicos de n8n (no llevan secretos; la proteccion es validacion en servidor + CORS + campo trampa).
  var WEBHOOKS = {
    recursos: 'https://n8n.neiro.agency/webhook/web-recursos-gratuitos',
    llamada: 'https://n8n.neiro.agency/webhook/web-solicitud-llamada'
  };
  var REQUEST_TIMEOUT_MS = 15000;

  var GUIAS = [
    { id: 'g1', tag: 'dinero', title: '[Título de la guía 01]', titleEn: '[Guide title 01]', desc: '[Una línea sobre cómo generar ingresos con IA.]', descEn: '[One line about how to make money with AI.]' },
    { id: 'g2', tag: 'claude', title: '[Título de la guía 02]', titleEn: '[Guide title 02]', desc: '[Un tip, tool o plugin de Claude explicado paso a paso.]', descEn: '[A Claude tip, tool or plugin explained step by step.]' },
    { id: 'g3', tag: 'dinero', title: '[Título de la guía 03]', titleEn: '[Guide title 03]', desc: '[Una línea sobre el modelo de negocio que explica.]', descEn: '[One line about the business model it covers.]' },
    { id: 'g4', tag: 'claude', title: '[Título de la guía 04]', titleEn: '[Guide title 04]', desc: '[Un tip, tool o plugin de Claude explicado paso a paso.]', descEn: '[A Claude tip, tool or plugin explained step by step.]' },
    { id: 'g5', tag: 'dinero', title: '[Título de la guía 05]', titleEn: '[Guide title 05]', desc: '[Una línea sobre cómo generar ingresos con IA.]', descEn: '[One line about how to make money with AI.]' },
    { id: 'g6', tag: 'claude', title: '[Título de la guía 06]', titleEn: '[Guide title 06]', desc: '[Un tip, tool o plugin de Claude explicado paso a paso.]', descEn: '[A Claude tip, tool or plugin explained step by step.]' },
    { id: 'g7', tag: 'tecnico', title: '[Título de la guía 07]', titleEn: '[Guide title 07]', desc: '[Un concepto técnico de automatización con IA explicado en simple.]', descEn: '[A technical AI automation concept explained simply.]' },
    { id: 'g8', tag: 'tecnico', title: '[Título de la guía 08]', titleEn: '[Guide title 08]', desc: '[Un concepto técnico de automatización con IA explicado en simple.]', descEn: '[A technical AI automation concept explained simply.]' }
  ];

  var STRINGS = {
    es: {
      pickToSelect: 'Tocá para seleccionar',
      selected: 'Seleccionada',
      pickedTitle: function (n) { return n === 1 ? '1 guía seleccionada' : n + ' guías seleccionadas'; },
      downloadLabel: function (n) { return n === 1 ? 'Descargar 1 guía' : 'Descargar ' + n + ' guías'; },
      nameRequired: 'Ingresá tu nombre.',
      emailRequired: 'Ingresá tu correo.',
      emailInvalid: 'Ese correo no parece válido.',
      phoneRequired: 'Ingresá tu número de teléfono.',
      phoneInvalid: function (code, expected, got) { return 'Para ' + code + ' se esperan ' + expected + ' (tenés ' + got + ').'; },
      digitsWord: function (a, b) { return a === b ? a + ' dígitos' : 'entre ' + a + ' y ' + b + ' dígitos'; },
      sending: 'Enviando…',
      modalClose: 'Cerrar',
      modalOk: 'Entendido',
      guiasOkTitle: 'Listo, revisá tu correo.',
      guiasOkText: 'Te enviaremos a tu correo las guías que elegiste.',
      contactOkTitle: 'Mensaje recibido',
      contactOkText: 'Gracias. Te contacto pronto para coordinar la llamada.',
      errorTitle: 'No pudimos enviarlo',
      errorText: 'Hubo un problema de conexión. Intentá de nuevo en unos minutos.'
    },
    en: {
      pickToSelect: 'Tap to select',
      selected: 'Selected',
      pickedTitle: function (n) { return n === 1 ? '1 guide selected' : n + ' guides selected'; },
      downloadLabel: function (n) { return n === 1 ? 'Download 1 guide' : 'Download ' + n + ' guides'; },
      nameRequired: 'Enter your name.',
      emailRequired: 'Enter your email.',
      emailInvalid: "That email doesn't look valid.",
      phoneRequired: 'Enter your phone number.',
      phoneInvalid: function (code, expected, got) { return 'For ' + code + ' we expect ' + expected + ' (you entered ' + got + ').'; },
      digitsWord: function (a, b) { return a === b ? a + ' digits' : 'between ' + a + ' and ' + b + ' digits'; },
      sending: 'Sending…',
      modalClose: 'Close',
      modalOk: 'Got it',
      guiasOkTitle: 'Done, check your email.',
      guiasOkText: "We'll send the guides you picked to your email.",
      contactOkTitle: 'Message received',
      contactOkText: "Thanks. I'll be in touch soon to schedule the call.",
      errorTitle: "We couldn't send it",
      errorText: 'There was a connection problem. Please try again in a few minutes.'
    }
  };

  function t() { return STRINGS[lang]; }

  var picked = {};
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    var title = lang === 'en' ? g.titleEn : g.title;
    var desc = lang === 'en' ? g.descEn : g.desc;
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
    card.appendChild(el('h3', { style: 'font-size:18px;line-height:1.32;font-weight:700;color:#12131A;' }, [title]));
    card.appendChild(el('p', { style: 'font-size:14.5px;line-height:1.62;color:#5A5F6E;flex-grow:1;' }, [desc]));
    card.appendChild(el('span', {
      style: 'font-size:13.5px;font-weight:500;color:' + (on ? ACCENT : '#8C91A0') + ';'
    }, [on ? t().selected : t().pickToSelect]));

    return card;
  }

  function renderGuias() {
    var railDinero = document.getElementById('rail-guias-dinero');
    var railClaude = document.getElementById('rail-guias-claude');
    var railTecnico = document.getElementById('rail-guias-tecnico');
    railDinero.innerHTML = '';
    railClaude.innerHTML = '';
    railTecnico.innerHTML = '';
    GUIAS.filter(function (g) { return g.tag === 'dinero'; }).forEach(function (g) { railDinero.appendChild(renderGuiaCard(g)); });
    GUIAS.filter(function (g) { return g.tag === 'claude'; }).forEach(function (g) { railClaude.appendChild(renderGuiaCard(g)); });
    GUIAS.filter(function (g) { return g.tag === 'tecnico'; }).forEach(function (g) { railTecnico.appendChild(renderGuiaCard(g)); });

    var count = Object.keys(picked).length;
    var form = document.getElementById('guias-form');
    var empty = document.getElementById('guias-empty');

    if (count > 0) {
      form.hidden = false; empty.hidden = true;
      document.getElementById('picked-title').textContent = t().pickedTitle(count);
      document.getElementById('submit-guias').textContent = t().downloadLabel(count);
    } else {
      form.hidden = true; empty.hidden = false;
    }
  }

  function showFieldError(inputId, errorId, message) {
    var input = document.getElementById(inputId);
    var errorEl = document.getElementById(errorId);
    if (message) {
      input.style.borderColor = '#C0392B';
      errorEl.textContent = message;
      errorEl.hidden = false;
      return false;
    }
    input.style.borderColor = '#DDE0E7';
    errorEl.hidden = true;
    errorEl.textContent = '';
    return true;
  }

  function clearFieldError(inputId, errorId) {
    document.getElementById(inputId).style.borderColor = '#DDE0E7';
    var errorEl = document.getElementById(errorId);
    errorEl.hidden = true;
    errorEl.textContent = '';
  }

  function postJSON(url, payload) {
    if (typeof fetch !== 'function') { return Promise.reject(new Error('fetch_unsupported')); }
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, REQUEST_TIMEOUT_MS) : null;
    var options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };
    if (controller) { options.signal = controller.signal; }
    return fetch(url, options).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) { throw new Error('http_' + res.status); }
    }, function (err) {
      clearTimeout(timer);
      throw err;
    });
  }

  function setSending(btn, on, restoreText) {
    btn.disabled = on;
    btn.style.opacity = on ? '.65' : '';
    btn.style.cursor = on ? 'default' : '';
    btn.setAttribute('aria-busy', on ? 'true' : 'false');
    btn.textContent = on ? t().sending : restoreText;
  }

  var modalEl = document.getElementById('modal');
  var modalReturnFocus = null;
  var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"></path></svg>';
  var ICON_ERR = '<svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:26px;height:26px" aria-hidden="true"><path d="M12 6.5v7M12 17.5h.01"></path></svg>';

  function openModal(kind, returnFocusEl) {
    var s = t();
    var isErr = kind === 'error';
    var title = isErr ? s.errorTitle : (kind === 'guias' ? s.guiasOkTitle : s.contactOkTitle);
    var text = isErr ? s.errorText : (kind === 'guias' ? s.guiasOkText : s.contactOkText);
    var icon = document.getElementById('modal-icon');
    icon.className = 'modal-icon ' + (isErr ? 'err' : 'ok');
    icon.innerHTML = isErr ? ICON_ERR : ICON_OK;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-text').textContent = text;
    document.getElementById('modal-ok').textContent = s.modalOk;
    document.getElementById('modal-x').setAttribute('aria-label', s.modalClose);
    modalReturnFocus = returnFocusEl || null;
    modalEl.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-ok').focus();
  }

  function closeModal() {
    if (modalEl.hidden) { return; }
    modalEl.hidden = true;
    document.body.style.overflow = '';
    if (modalReturnFocus && document.body.contains(modalReturnFocus)) { modalReturnFocus.focus(); }
    modalReturnFocus = null;
  }

  modalEl.querySelectorAll('[data-close]').forEach(function (node) { node.addEventListener('click', closeModal); });
  document.addEventListener('keydown', function (e) {
    if (modalEl.hidden) { return; }
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key === 'Tab') {
      var items = [document.getElementById('modal-x'), document.getElementById('modal-ok')];
      var i = items.indexOf(document.activeElement);
      if (i === -1) { e.preventDefault(); items[1].focus(); }
      else if (e.shiftKey && i === 0) { e.preventDefault(); items[1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });

  ['guia-nombre', 'c-nombre'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () { clearFieldError(id, id + '-error'); });
  });
  ['guia-correo', 'c-correo'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function () { clearFieldError(id, id + '-error'); });
  });

  document.getElementById('clear-picks').addEventListener('click', function () {
    picked = {};
    renderGuias();
  });

  document.getElementById('submit-guias').addEventListener('click', function () {
    var btn = this;
    if (btn.disabled) { return; }
    var nombre = document.getElementById('guia-nombre').value.trim();
    var correo = document.getElementById('guia-correo').value.trim();

    var nameOk = showFieldError('guia-nombre', 'guia-nombre-error', nombre ? null : t().nameRequired);
    var emailOk;
    if (!correo) {
      emailOk = showFieldError('guia-correo', 'guia-correo-error', t().emailRequired);
    } else if (!EMAIL_RE.test(correo)) {
      emailOk = showFieldError('guia-correo', 'guia-correo-error', t().emailInvalid);
    } else {
      emailOk = showFieldError('guia-correo', 'guia-correo-error', null);
    }

    if (!nameOk || !emailOk) { return; }

    var restoreText = btn.textContent;
    var guias = GUIAS.filter(function (g) { return picked[g.id]; }).map(function (g) { return g.id + ': ' + g.title; });

    setSending(btn, true);
    postJSON(WEBHOOKS.recursos, {
      nombre: nombre,
      correo: correo,
      pais: document.getElementById('guia-pais').value,
      rol: document.getElementById('guia-rol').value,
      guias: guias,
      idioma: lang,
      website: document.getElementById('guia-website').value
    }).then(function () {
      picked = {};
      document.getElementById('guia-nombre').value = '';
      document.getElementById('guia-correo').value = '';
      renderGuias();
      openModal('guias', null);
    }, function () {
      openModal('error', btn);
    }).then(function () {
      setSending(btn, false, restoreText);
    });
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
    if (!digits) { return t().phoneRequired; }
    if (digits.length < range[0] || digits.length > range[1]) {
      return t().phoneInvalid(code, t().digitsWord(range[0], range[1]), digits.length);
    }
    return null;
  }

  var telInput = document.getElementById('c-telefono');
  var telSelect = document.getElementById('c-pais-tel');

  telInput.addEventListener('input', function () { clearFieldError('c-telefono', 'c-tel-error'); });
  telSelect.addEventListener('change', function () { clearFieldError('c-telefono', 'c-tel-error'); });

  document.getElementById('c-submit').addEventListener('click', function () {
    var btn = this;
    if (btn.disabled) { return; }
    var nombre = document.getElementById('c-nombre').value.trim();
    var correo = document.getElementById('c-correo').value.trim();

    var nameOk = showFieldError('c-nombre', 'c-nombre-error', nombre ? null : t().nameRequired);
    var emailOk;
    if (!correo) {
      emailOk = showFieldError('c-correo', 'c-correo-error', t().emailRequired);
    } else if (!EMAIL_RE.test(correo)) {
      emailOk = showFieldError('c-correo', 'c-correo-error', t().emailInvalid);
    } else {
      emailOk = showFieldError('c-correo', 'c-correo-error', null);
    }

    var phoneErr = validatePhone(telSelect.value, telInput.value);
    var phoneOk = showFieldError('c-telefono', 'c-tel-error', phoneErr);

    if (!nameOk || !emailOk || !phoneOk) { return; }

    var restoreText = btn.textContent;
    var code = (telSelect.value || '').split(' ')[0];
    var digits = telInput.value.replace(/\D/g, '');

    setSending(btn, true);
    postJSON(WEBHOOKS.llamada, {
      nombre: nombre,
      correo: correo,
      telefono: code + ' ' + digits,
      mensaje: document.getElementById('c-mensaje').value.trim(),
      idioma: lang,
      website: document.getElementById('c-website').value
    }).then(function () {
      document.getElementById('c-nombre').value = '';
      document.getElementById('c-correo').value = '';
      telInput.value = '';
      document.getElementById('c-mensaje').value = '';
      openModal('contacto', null);
    }, function () {
      openModal('error', btn);
    }).then(function () {
      setSending(btn, false, restoreText);
    });
  });

  function applyLang(newLang) {
    lang = newLang;
    document.getElementById('lang-es').classList.toggle('is-active', lang === 'es');
    document.getElementById('lang-en').classList.toggle('is-active', lang === 'en');
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-en]').forEach(function (node) {
      if (!node.hasAttribute('data-es')) { node.setAttribute('data-es', node.textContent); }
      node.textContent = lang === 'en' ? node.getAttribute('data-en') : node.getAttribute('data-es');
    });

    document.querySelectorAll('[data-en-ph]').forEach(function (node) {
      if (!node.hasAttribute('data-es-ph')) { node.setAttribute('data-es-ph', node.getAttribute('placeholder')); }
      node.setAttribute('placeholder', lang === 'en' ? node.getAttribute('data-en-ph') : node.getAttribute('data-es-ph'));
    });

    renderGuias();
  }

  document.getElementById('lang-es').addEventListener('click', function () { applyLang('es'); });
  document.getElementById('lang-en').addEventListener('click', function () { applyLang('en'); });

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
