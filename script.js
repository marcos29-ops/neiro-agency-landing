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
    { id: 'c01', tag: 'claude', title: 'Prompt estructurado: cómo le hablo a Claude', titleEn: 'Structured prompting: how I talk to Claude', desc: 'Los tres bloques (rol, objetivo y resultado) para que Claude rinda de verdad.', descEn: 'The three blocks (role, goal and result) to get real performance out of Claude.' },
    { id: 'c02', tag: 'claude', title: 'CLAUDE.md: el contexto ya masticado', titleEn: 'CLAUDE.md: ready-made context', desc: 'Explicale tu trabajo una sola vez y Claude lo recuerda en cada sesión.', descEn: 'Explain your work once and Claude remembers it in every session.' },
    { id: 'c03', tag: 'claude', title: 'Proyectos: por qué dejé los chats sueltos', titleEn: 'Projects: why I stopped using loose chats', desc: 'Un espacio con instrucciones, archivos y memoria propios para cada trabajo.', descEn: 'A space with its own instructions, files and memory for each job.' },
    { id: 'c04', tag: 'claude', title: 'Skills: las que vienen y las que armás vos', titleEn: 'Skills: built-in ones and the ones you build', desc: 'Manuales de buenas prácticas para que Claude no improvise.', descEn: 'Best-practice manuals so Claude doesn\'t improvise.' },
    { id: 'c05', tag: 'claude', title: 'Comandos de Claude Code que sí valen la pena', titleEn: 'Claude Code commands worth mastering', desc: 'Los comandos con / importantes, agrupados por momento de trabajo.', descEn: 'The commands that matter, grouped by when you use them.' },
    { id: 'c06', tag: 'claude', title: 'Artefactos: de una conversación a una app', titleEn: 'Artifacts: from a conversation to an app', desc: 'Diseños, documentos y mini-apps que Claude arma para que los uses.', descEn: 'Designs, documents and mini-apps that Claude builds for you to use.' },
    { id: 'c07', tag: 'claude', title: 'MarkItDown: que Claude lea cualquier documento', titleEn: 'MarkItDown: let Claude read any document', desc: 'Convertí PDF, Word, Excel o PowerPoint para que Claude los lea bien.', descEn: 'Convert PDF, Word, Excel or PowerPoint so Claude reads them properly.' },
    { id: 'c08', tag: 'claude', title: 'Perplexity y Tavily: información real y con fuentes', titleEn: 'Perplexity and Tavily: real, sourced information', desc: 'Búsqueda web en vivo, con datos actuales y fuentes citadas.', descEn: 'Live web search with current data and cited sources.' },
    { id: 'c09', tag: 'claude', title: 'Controlar Claude desde el celular', titleEn: 'Control Claude from your phone', desc: 'Tres formas de dejar a Claude trabajando y seguirlo desde el celular.', descEn: 'Three ways to leave Claude working and follow along from your phone.' },
    { id: 'c10', tag: 'claude', title: 'Codex Plugin: revisión de código dentro de Claude Code', titleEn: 'Codex Plugin: code review inside Claude Code', desc: 'Un segundo modelo revisa el trabajo del primero, sin gastar de más.', descEn: 'A second model reviews the first one\'s work without burning your quota.' },
    { id: 'c11', tag: 'claude', title: 'Plugin Small Business: instalalo y usá sus 44 skills', titleEn: 'Small Business plugin: install it and use its 44 skills', desc: '44 skills para dueños de pyme: finanzas, ventas, marketing y más.', descEn: '44 skills for small-business owners: finance, sales, marketing and more.' },
    { id: 'c12', tag: 'claude', title: 'Certificaciones de Microsoft con Claude', titleEn: 'Microsoft certifications with Claude', desc: 'Estudiá con la documentación de Microsoft Learn siempre al día.', descEn: 'Study with always up-to-date Microsoft Learn documentation.' },
    { id: 'c13', tag: 'claude', title: 'WhatsApp Business Tools MCP', titleEn: 'WhatsApp Business Tools MCP', desc: 'El servidor oficial de Meta para configurar WhatsApp Business en lenguaje natural.', descEn: 'Meta\'s official server to set up WhatsApp Business in plain language.' },
    { id: 'c14', tag: 'claude', title: 'Apify: leads cualificados con Claude', titleEn: 'Apify: qualified leads with Claude', desc: 'Miles de scrapers listos para armar listas de prospectos por perfil.', descEn: 'Thousands of ready-made scrapers to build prospect lists by profile.' },
    { id: 'c15', tag: 'claude', title: 'Scrapling + Claude: tus propios leads', titleEn: 'Scrapling + Claude: your own leads', desc: 'Generá leads calificados a demanda, sin comprar bases viejas.', descEn: 'Generate qualified leads on demand, without buying stale lists.' },
    { id: 'c16', tag: 'claude', title: 'Edito mis videos con IA: Remotion + Claude Code', titleEn: 'I edit my videos with AI: Remotion + Claude Code', desc: 'Editá el video que ya grabaste, hablándole a Claude.', descEn: 'Edit the video you already recorded just by talking to Claude.' },
    { id: 'c17', tag: 'claude', title: 'Claude en Chrome: que la IA navegue la web por vos', titleEn: 'Claude in Chrome: let AI browse the web for you', desc: 'Una extensión que lee, hace clic y navega páginas en tu navegador mientras hacés otra cosa.', descEn: 'An extension that reads, clicks and browses pages in your browser while you do something else.' },
    { id: 'n01', tag: 'negocio', title: 'Contenido en video para tu negocio, sin cámara', titleEn: 'Video content for your business, no camera', desc: 'Guion, voz y video para Shorts y Reels sin que nadie grabe.', descEn: 'Script, voice and video for Shorts and Reels without anyone filming.' },
    { id: 'n02', tag: 'negocio', title: 'Anuncios con avatares de IA', titleEn: 'Ads with AI avatars', desc: 'Tu avatar en HeyGen y anuncios testimoniales, sin actores ni grabación.', descEn: 'Your HeyGen avatar and testimonial ads, no actors or shoot needed.' },
    { id: 'n03', tag: 'negocio', title: 'Tu propio MCP, conectado a tu negocio', titleEn: 'Your own MCP, connected to your business', desc: 'La ruta técnica para que Claude trabaje con tus sistemas, con permisos mínimos.', descEn: 'The technical route for Claude to work with your systems, with minimal permissions.' },
    { id: 'n04', tag: 'negocio', title: 'Video con IA: Higgsfield y similares', titleEn: 'AI video: Higgsfield and similar tools', desc: 'Video para anuncios y demos con Higgsfield, Runway o Kling, sin equipo.', descEn: 'Video for ads and demos with Higgsfield, Runway or Kling, no crew needed.' },
    { id: 'n05', tag: 'negocio', title: 'Small Business: instalación y uso seguro', titleEn: 'Small Business: installation and safe use', desc: 'Cómo instalarlo, qué cubre y cómo usarlo de forma segura.', descEn: 'How to install it, what it covers and how to use it safely.' },
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
      companyRequired: 'Elige una opción.',
      phoneRequired: 'Ingresá tu número de teléfono.',
      phoneInvalid: function (code, expected, got) { return 'Para ' + code + ' se esperan ' + expected + ' (tenés ' + got + ').'; },
      digitsWord: function (a, b) { return a === b ? a + ' dígitos' : 'entre ' + a + ' y ' + b + ' dígitos'; },
      sending: 'Enviando…',
      modalClose: 'Cerrar',
      modalOk: 'Entendido',
      guiasOkTitle: 'Listo, revisá tu correo.',
      guiasOkText: 'Te enviaremos a tu correo las guías que elegiste. Si no lo ves en la bandeja principal, revisá la carpeta de spam.',
      contactOkTitle: 'Mensaje recibido',
      contactOkText: 'Gracias. Te contacto pronto para coordinar la llamada.',
      errorTitle: 'Ha ocurrido un problema',
      errorText: 'En breve lo solucionaremos.'
    },
    en: {
      pickToSelect: 'Tap to select',
      selected: 'Selected',
      pickedTitle: function (n) { return n === 1 ? '1 guide selected' : n + ' guides selected'; },
      downloadLabel: function (n) { return n === 1 ? 'Download 1 guide' : 'Download ' + n + ' guides'; },
      nameRequired: 'Enter your name.',
      emailRequired: 'Enter your email.',
      emailInvalid: "That email doesn't look valid.",
      companyRequired: 'Choose an option.',
      phoneRequired: 'Enter your phone number.',
      phoneInvalid: function (code, expected, got) { return 'For ' + code + ' we expect ' + expected + ' (you entered ' + got + ').'; },
      digitsWord: function (a, b) { return a === b ? a + ' digits' : 'between ' + a + ' and ' + b + ' digits'; },
      sending: 'Sending…',
      modalClose: 'Close',
      modalOk: 'Got it',
      guiasOkTitle: 'Done, check your email.',
      guiasOkText: "We'll send the guides you picked to your email. If you don't see it in your main inbox, check your spam folder.",
      contactOkTitle: 'Message received',
      contactOkText: "Thanks. I'll be in touch soon to schedule the call.",
      errorTitle: 'A problem occurred',
      errorText: "We'll fix it shortly."
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
    var railNegocio = document.getElementById('rail-guias-negocio');
    var railClaude = document.getElementById('rail-guias-claude');
    if (!railNegocio || !railClaude) { return; }
    railNegocio.innerHTML = '';
    railClaude.innerHTML = '';
    // Las guías nuevas se agregan al final de GUIAS y se muestran primero (a la izquierda) en cada fila.
    GUIAS.filter(function (g) { return g.tag === 'negocio'; }).reverse().forEach(function (g) { railNegocio.appendChild(renderGuiaCard(g)); });
    GUIAS.filter(function (g) { return g.tag === 'claude'; }).reverse().forEach(function (g) { railClaude.appendChild(renderGuiaCard(g)); });

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

  function postOnce(url, payload) {
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

  // Reintenta solo si el fallo es del servidor (5xx), limite de peticiones (429) o falta de conexion.
  // No reintenta errores de validacion (4xx) ni cortes por tiempo: en ese caso el dato pudo haberse guardado y se duplicaria.
  var RETRY_DELAYS_MS = [3000, 10000];

  function isRetryable(err) {
    var m = String((err && err.message) || '');
    if (/^http_(5\d\d|429)$/.test(m)) { return true; }
    return !!err && err.name === 'TypeError';
  }

  function postJSON(url, payload) {
    var attempt = 0;
    function run() {
      return postOnce(url, payload).catch(function (err) {
        if (attempt >= RETRY_DELAYS_MS.length || !isRetryable(err)) { throw err; }
        var wait = RETRY_DELAYS_MS[attempt] + Math.floor(Math.random() * 3000);
        attempt += 1;
        return new Promise(function (resolve) { setTimeout(resolve, wait); }).then(run);
      });
    }
    return run();
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
    var node = document.getElementById(id);
    if (node) { node.addEventListener('input', function () { clearFieldError(id, id + '-error'); }); }
  });
  ['guia-correo', 'c-correo'].forEach(function (id) {
    var node = document.getElementById(id);
    if (node) { node.addEventListener('input', function () { clearFieldError(id, id + '-error'); }); }
  });

  var clearPicksBtn = document.getElementById('clear-picks');
  if (clearPicksBtn) {
    clearPicksBtn.addEventListener('click', function () {
      picked = {};
      renderGuias();
    });
  }

  var submitGuiasBtn = document.getElementById('submit-guias');
  if (submitGuiasBtn) { submitGuiasBtn.addEventListener('click', function () {
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

    var empresaSel = document.querySelector('input[name="guia-empresa"]:checked');
    var empresaBox = document.getElementById('guia-empresa');
    var empresaErr = document.getElementById('guia-empresa-error');
    if (!empresaSel) {
      empresaBox.classList.add('err');
      empresaErr.textContent = t().companyRequired;
      empresaErr.hidden = false;
    } else {
      empresaBox.classList.remove('err');
      empresaErr.hidden = true;
      empresaErr.textContent = '';
    }

    var telOk = true;
    if (empresaSel && empresaSel.value === 'si') {
      telOk = showFieldError('guia-telefono', 'guia-tel-error', validatePhone(document.getElementById('guia-pais-tel').value, document.getElementById('guia-telefono').value));
    }

    if (!nameOk || !emailOk || !empresaSel || !telOk) { return; }
    var telefonoEmpresa = '';
    if (empresaSel.value === 'si') {
      telefonoEmpresa = (document.getElementById('guia-pais-tel').value || '').split(' ')[0] + ' ' + document.getElementById('guia-telefono').value.replace(/\D/g, '');
    }

    var restoreText = btn.textContent;
    var guias = GUIAS.filter(function (g) { return picked[g.id]; }).map(function (g) { return g.id + ': ' + g.title; });

    setSending(btn, true);
    postJSON(WEBHOOKS.recursos, {
      nombre: nombre,
      correo: correo,
      pais: document.getElementById('guia-pais').value,
      rol: document.getElementById('guia-rol').value,
      empresa: empresaSel.value,
      telefono: telefonoEmpresa,
      guias: guias,
      idioma: lang,
      website: document.getElementById('guia-website').value
    }).then(function () {
      picked = {};
      document.getElementById('guia-nombre').value = '';
      document.getElementById('guia-correo').value = '';
      empresaSel.checked = false;
      document.getElementById('guia-tel-wrap').hidden = true;
      document.getElementById('guia-telefono').value = '';
      renderGuias();
      openModal('guias', null);
    }, function () {
      openModal('error', btn);
    }).then(function () {
      setSending(btn, false, restoreText);
    });
  }); }

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
  var cSubmitBtn = document.getElementById('c-submit');

  if (telInput && telSelect) {
    telInput.addEventListener('input', function () { clearFieldError('c-telefono', 'c-tel-error'); });
    telSelect.addEventListener('change', function () { clearFieldError('c-telefono', 'c-tel-error'); });
  }

  if (cSubmitBtn) { cSubmitBtn.addEventListener('click', function () {
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
  }); }

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

    var privacyLink = document.getElementById('privacy-link');
    if (privacyLink) { privacyLink.href = lang === 'en' ? 'privacidad.html?lang=en' : 'privacidad.html'; }

    if (window.$chatwoot && typeof window.$chatwoot.setLocale === 'function') { window.$chatwoot.setLocale(lang); }
    renderGuias();
    if (typeof syncHeaderSpacer === 'function') { syncHeaderSpacer(); }
  }

  document.getElementById('lang-es').addEventListener('click', function () { applyLang('es'); });
  document.getElementById('lang-en').addEventListener('click', function () { applyLang('en'); });

  var siteHeader = document.getElementById('site-header');
  var headerSpacer = document.getElementById('header-spacer');
  if (siteHeader && headerSpacer) {
    var syncHeaderSpacer = function () { headerSpacer.style.height = siteHeader.offsetHeight + 'px'; };
    syncHeaderSpacer();
    window.addEventListener('resize', syncHeaderSpacer);
  }

  document.body.setAttribute('data-anim', 'on');
  var reveals = document.querySelectorAll('.reveal');
  if (typeof IntersectionObserver === 'undefined') {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in'); io.unobserve(e.target);
          (function (n) { setTimeout(function () { n.style.transitionDelay = '0s'; }, 1400); })(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  }


  // Preguntas frecuentes: apertura y cierre con animación fluida (altura + desvanecido).
  (function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('details.faq-item').forEach(function (d) {
      var sum = d.querySelector('summary');
      var body = d.querySelector('summary ~ *');
      if (!sum || !body || !d.animate) return;
      var anim = null;
      function done(open) {
        anim = null;
        d.open = open;
        d.removeAttribute('data-open');
        d.style.overflow = '';
        d.style.height = '';
      }
      sum.addEventListener('click', function (e) {
        e.preventDefault();
        if (anim) anim.cancel();
        var abrir = !d.open || d.getAttribute('data-open') === 'false';
        if (reduce) { d.open = abrir; return; }
        var start = d.offsetHeight;
        d.style.overflow = 'hidden';
        d.setAttribute('data-open', abrir ? 'true' : 'false');
        d.open = true;
        var end = abrir ? d.scrollHeight + (d.offsetHeight - d.clientHeight) : sum.offsetHeight + (d.offsetHeight - d.clientHeight);
        if (abrir) { d.style.height = start + 'px'; end = d.scrollHeight + (d.offsetHeight - d.clientHeight); }
        anim = d.animate({ height: [start + 'px', end + 'px'] }, { duration: 360, easing: 'cubic-bezier(.22,.8,.3,1)' });
        body.animate({ opacity: abrir ? [0, 1] : [1, 0] }, { duration: abrir ? 320 : 200, easing: 'ease', fill: 'both' });
        anim.onfinish = function () { done(abrir); };
        anim.oncancel = function () { anim = null; };
      });
    });
  })();


  // "¿Tienes una empresa?": si responde Sí se despliega el teléfono.
  (function () {
    var wrap = document.getElementById('guia-tel-wrap');
    var radios = document.querySelectorAll('input[name="guia-empresa"]');
    if (!wrap || !radios.length) { return; }
    radios.forEach(function (r) {
      r.addEventListener('change', function () {
        var box = document.getElementById('guia-empresa');
        var err = document.getElementById('guia-empresa-error');
        box.classList.remove('err');
        err.hidden = true;
        err.textContent = '';
        var mostrar = r.value === 'si';
        if (mostrar && wrap.hidden) {
          wrap.hidden = false;
          if (wrap.animate) { wrap.animate({ opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] }, { duration: 280, easing: 'cubic-bezier(.22,.8,.3,1)' }); }
        } else if (!mostrar) {
          wrap.hidden = true;
          clearFieldError('guia-telefono', 'guia-tel-error');
        }
      });
    });
    var gt = document.getElementById('guia-telefono');
    var gs = document.getElementById('guia-pais-tel');
    if (gt) { gt.addEventListener('input', function () { clearFieldError('guia-telefono', 'guia-tel-error'); }); }
    if (gs) { gs.addEventListener('change', function () { clearFieldError('guia-telefono', 'guia-tel-error'); }); }
  })();


  // Chat de la web (Chatwoot en servidor propio): burbuja a la izquierda; el botón "Pruébalo aquí" lo abre.
  (function () {
    var BASE_URL = 'https://chatwoot.neiro.agency';
    var abrirAlCargar = false;
    window.chatwootSettings = { position: 'left', locale: lang === 'en' ? 'en' : 'es', launcherTitle: lang === 'en' ? 'Chat with us' : 'Chatea con nosotros' };
    window.addEventListener('chatwoot:ready', function () {
      if (window.$chatwoot && lang === 'en') { window.$chatwoot.setLocale('en'); }
      if (abrirAlCargar && window.$chatwoot) { window.$chatwoot.toggle('open'); abrirAlCargar = false; }
    });
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest ? e.target.closest('[data-open-chat]') : null;
      if (!trigger) { return; }
      e.preventDefault();
      if (window.$chatwoot && typeof window.$chatwoot.toggle === 'function') { window.$chatwoot.toggle('open'); }
      else { abrirAlCargar = true; }
    });
    // Misma animación al pasar el mouse que el botón de WhatsApp (sube y crece un poco, con sombra).
    var estilo = document.createElement('style');
    estilo.textContent = '.woot-widget-bubble { transition: transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease !important; }'
      + '.woot-widget-bubble:hover { transform: translateY(-3px) scale(1.06) !important; box-shadow: 0 14px 32px rgba(255,114,12,.5) !important; }'
      + '.woot-widget-bubble:active { transform: translateY(0) scale(1) !important; box-shadow: none !important; }';
    document.head.appendChild(estilo);
    function cargar() {
      var g = document.createElement('script');
      g.src = BASE_URL + '/packs/js/sdk.js';
      g.async = true;
      g.onload = function () { window.chatwootSDK.run({ websiteToken: 'Np7ycQNH9ZPVTgWfWijWkXtg', baseUrl: BASE_URL }); };
      document.head.appendChild(g);
    }
    if (document.readyState === 'complete') { cargar(); } else { window.addEventListener('load', cargar); }
  })();

  renderGuias();
})();
