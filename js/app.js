(function () {
  const I18N = {
    en: {
      'nav.skip': 'Skip to content',
      'nav.home': 'Home',
      'nav.residential': 'Residential',
      'nav.commercial': 'Commercial',
      'nav.utility': 'Utility Solutions',
      'nav.environmental': 'Environmental',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.menu': 'Menu',
      'nav.close': 'Close',
      'theme.light': 'Light',
      'theme.dark': 'Dark',
      'form.contacthow': 'How would you like to be contacted?',
      'form.service': 'Please choose the type of service you need',
      'form.zip': 'ZIP',
      'form.name': 'Name',
      'form.email': 'Email',
      'form.submit': 'Submit Request',
      'success.back': 'Back to home',
      'study.disclaimer': 'Independent design study. Not affiliated with The Davey Tree Expert Company. Exact public marketing copy and forest-green identity from davey.com used for a Motionsites mythic-naturecore craft study only. Chrome can install this PWA from the address bar. Built by dglxss.',
      'study.short': 'Independent design study. Not affiliated with The Davey Tree Expert Company. Built by dglxss.',
      'study.mock': 'Mock consultation confirmation for this independent design study. No payment processed. Built by dglxss.'
    },
    pt: {
      'nav.skip': 'Saltar para o conteúdo',
      'nav.home': 'Início',
      'nav.residential': 'Residencial',
      'nav.commercial': 'Comercial',
      'nav.utility': 'Soluções para utilities',
      'nav.environmental': 'Ambiental',
      'nav.about': 'Sobre',
      'nav.contact': 'Contacto',
      'nav.menu': 'Menu',
      'nav.close': 'Fechar',
      'theme.light': 'Claro',
      'theme.dark': 'Escuro',
      'form.contacthow': 'Como prefere ser contactado?',
      'form.service': 'Escolha o tipo de serviço de que precisa',
      'form.zip': 'Código postal',
      'form.name': 'Nome',
      'form.email': 'Email',
      'form.submit': 'Enviar pedido',
      'success.back': 'Voltar',
      'study.disclaimer': 'Estudo de design independente. Sem vínculo com The Davey Tree Expert Company. Textos de marketing públicos e identidade verde-floresta de davey.com usados apenas para um estudo Motionsites mythic-naturecore. O Chrome pode instalar este PWA a partir da barra de endereço. Built by dglxss.',
      'study.short': 'Estudo de design independente. Sem vínculo com The Davey Tree Expert Company. Built by dglxss.',
      'study.mock': 'Confirmação simulada para este estudo de design independente. Nenhum pagamento foi processado. Built by dglxss.'
    }
  };

  function currentLang() {
    return document.documentElement.getAttribute('lang') === 'pt' ? 'pt' : 'en';
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyI18n(lang) {
    const dict = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-set-lang') === lang ? 'true' : 'false');
    });
    const menu = document.querySelector('.menu-btn');
    if (menu) {
      const open = menu.getAttribute('aria-expanded') === 'true';
      menu.textContent = dict[open ? 'nav.close' : 'nav.menu'];
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('[data-set-theme]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-set-theme') === theme ? 'true' : 'false');
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#07110c' : '#2f6b3a');
  }

  applyTheme(currentTheme());
  applyI18n(currentLang());

  document.addEventListener('click', function (e) {
    const langBtn = e.target.closest('[data-set-lang]');
    if (langBtn) {
      const lang = langBtn.getAttribute('data-set-lang') === 'pt' ? 'pt' : 'en';
      document.documentElement.setAttribute('lang', lang);
      try { localStorage.setItem('dt-lang', lang); } catch (err) {}
      applyI18n(lang);
    }
    const themeBtn = e.target.closest('[data-set-theme]');
    if (themeBtn) {
      const theme = themeBtn.getAttribute('data-set-theme') === 'dark' ? 'dark' : 'light';
      try { localStorage.setItem('dt-theme', theme); } catch (err) {}
      applyTheme(theme);
    }
  });

  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.getElementById('navLinks');
  if (menuBtn && navLinks) {
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      navLinks.classList.toggle('is-open', open);
      applyI18n(currentLang());
    }
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  const form = document.getElementById('consult');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.hidden = true;
      const ok = document.getElementById('success');
      if (ok) ok.hidden = false;
    });
  }

  const bg = document.getElementById('heroBg');
  if (bg) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hero = bg.closest('.hero') || bg;

    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let scrollY = 0;
    let targetScroll = 0;
    let heroHeight = hero.offsetHeight || window.innerHeight || 1;
    let raf = 0;
    let tabVisible = document.visibilityState === 'visible';
    let onscreen = true;
    let lastTransform = '';
    let listening = false;
    let scrollListening = false;

    function motionAllowed() {
      return !reduceMotion.matches && tabVisible && onscreen;
    }

    function apply(px, py, sy) {
      const next = 'translate3d(' + px + 'px, ' + (py + sy) + 'px, 0) scale3d(1.08, 1.08, 1)';
      if (next === lastTransform) return;
      lastTransform = next;
      bg.style.transform = next;
    }

    function stopLoop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      bg.style.willChange = '';
    }

    function tick() {
      raf = 0;
      if (!motionAllowed()) {
        stopLoop();
        return;
      }

      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      scrollY += (targetScroll - scrollY) * 0.08;

      const px = Math.round(x * 100) / 100;
      const py = Math.round(y * 100) / 100;
      const sy = Math.round(scrollY * 100) / 100;
      apply(px, py, sy);

      const settled =
        Math.abs(tx - x) < 0.05 &&
        Math.abs(ty - y) < 0.05 &&
        Math.abs(targetScroll - scrollY) < 0.05;
      if (settled) {
        x = tx;
        y = ty;
        scrollY = targetScroll;
        apply(Math.round(x * 100) / 100, Math.round(y * 100) / 100, Math.round(scrollY * 100) / 100);
        stopLoop();
        return;
      }

      raf = requestAnimationFrame(tick);
    }

    function kick() {
      if (!motionAllowed() || raf) return;
      bg.style.willChange = 'transform';
      raf = requestAnimationFrame(tick);
    }

    function onMove(e) {
      if (!motionAllowed()) return;
      tx = ((e.clientX - cx) / cx) * 18;
      ty = ((e.clientY - cy) / cy) * 18;
      kick();
    }

    function onScroll() {
      if (!motionAllowed()) return;
      const yPos = window.scrollY || window.pageYOffset || 0;
      const p = yPos < 0 ? 0 : yPos > heroHeight ? 1 : yPos / heroHeight;
      targetScroll = p * -36;
      kick();
    }

    function onResize() {
      cx = window.innerWidth / 2;
      cy = window.innerHeight / 2;
      heroHeight = hero.offsetHeight || window.innerHeight || 1;
      if (motionAllowed()) onScroll();
    }

    function onVisibility() {
      tabVisible = document.visibilityState === 'visible';
      if (!tabVisible) stopLoop();
    }

    function bindMove() {
      if (listening || !motionAllowed()) return;
      window.addEventListener('mousemove', onMove, { passive: true });
      listening = true;
    }

    function unbindMove() {
      if (!listening) return;
      window.removeEventListener('mousemove', onMove);
      listening = false;
    }

    function bindScroll() {
      if (scrollListening || !motionAllowed()) return;
      window.addEventListener('scroll', onScroll, { passive: true });
      scrollListening = true;
    }

    function unbindScroll() {
      if (!scrollListening) return;
      window.removeEventListener('scroll', onScroll);
      scrollListening = false;
    }

    function syncMotionPreference() {
      if (reduceMotion.matches) {
        unbindMove();
        unbindScroll();
        stopLoop();
        tx = 0;
        ty = 0;
        x = 0;
        y = 0;
        scrollY = 0;
        targetScroll = 0;
        apply(0, 0, 0);
        return;
      }
      bindMove();
      bindScroll();
      onScroll();
    }

    function onMq(mq, fn) {
      if (mq.addEventListener) mq.addEventListener('change', fn);
      else mq.addListener(fn);
    }

    window.addEventListener('resize', onResize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    onMq(reduceMotion, syncMotionPreference);

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function (entries) {
        onscreen = entries.some(function (entry) { return entry.isIntersecting; });
        if (!onscreen) stopLoop();
      }, { threshold: 0 });
      io.observe(hero);
    }

    syncMotionPreference();
  }

  var LANDING_AIR = 14;

  function headerClearance() {
    var header = document.querySelector('header.nav');
    if (!(header instanceof HTMLElement)) return 96;
    return Math.round(header.getBoundingClientRect().bottom + LANDING_AIR);
  }

  function syncStickyNavHeight() {
    document.documentElement.style.setProperty('--sticky-nav-height', headerClearance() + 'px');
  }

  function scrollToId(id, behavior) {
    if (!id || id === 'top') {
      window.scrollTo({ top: 0, behavior: behavior });
      return true;
    }
    var node = document.getElementById(id);
    if (!node) return false;
    syncStickyNavHeight();
    var top = window.scrollY + node.getBoundingClientRect().top - headerClearance();
    window.scrollTo({ top: Math.max(0, top), behavior: behavior });
    return true;
  }

  function reducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest('a[href]');
    if (!link || link.target === '_blank') return;
    var url;
    try { url = new URL(link.getAttribute('href'), window.location.href); }
    catch (err) { return; }
    if (!url.hash) return;
    var here = window.location.pathname.replace(/\/$/, '') || '/';
    var there = url.pathname.replace(/\/$/, '') || '/';
    if (here !== there || url.origin !== window.location.origin) return;
    var id = decodeURIComponent(url.hash.slice(1));
    if (id !== 'top' && !document.getElementById(id)) return;
    e.preventDefault();
    scrollToId(id, reducedMotion() ? 'auto' : 'smooth');
    if (window.history && history.pushState) history.pushState(null, '', '#' + id);
  });

  function landHash() {
    if (!window.location.hash) return;
    var id = decodeURIComponent(window.location.hash.slice(1));
    scrollToId(id, 'auto');
  }

  syncStickyNavHeight();
  window.addEventListener('resize', syncStickyNavHeight, { passive: true });
  window.addEventListener('load', function () {
    syncStickyNavHeight();
    landHash();
  });
  landHash();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }
})();
