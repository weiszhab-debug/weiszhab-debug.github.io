(() => {
  'use strict';

  const CLOUDFLARE_ANALYTICS_TOKEN = '4b98c2b08aa1425d8351dfb8acf47087';
  const META_PIXEL_ID = '313797046105194';
  const UMAMI_WEBSITE_ID = 'e3ddee5e-010d-4fa0-8c27-58ff1ac558db';
  const CONSENT_KEY = 's621_marketing_consent_v1';
  const CONSENT_MAX_AGE_MS = 270 * 24 * 60 * 60 * 1000;
  const SLIDEIN_DISMISSED_KEY = 's621_slidein_dismissed_v1';
  const SLIDEIN_SESSION_KEY = 's621_slidein_shown_v1';
  const SLIDEIN_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

  const analytics = document.createElement('script');
  analytics.type = 'module';
  analytics.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  analytics.dataset.cfBeacon = JSON.stringify({ token: CLOUDFLARE_ANALYTICS_TOKEN });
  document.head.appendChild(analytics);

  const copy = {
    de: {
      text: 'Meta Pixel nur mit Einwilligung.',
      privacy: 'Datenschutz',
      privacyHref: '/datenschutz/',
      accept: 'OK',
      decline: 'Ablehnen',
      settings: 'Cookie-Einstellungen',
      label: 'Cookie-Einstellungen',
    },
    hu: {
      text: 'Meta Pixel csak hozzájárulással.',
      privacy: 'Adatvédelem',
      privacyHref: '/hu/adatvedelem/',
      accept: 'Rendben',
      decline: 'Elutasítom',
      settings: 'Süti-beállítások',
      label: 'Süti-beállítások',
    },
    en: {
      text: 'We use Meta Pixel only with your consent to measure and improve advertising.',
      privacy: 'Read the privacy notice',
      privacyHref: '/en/privacy/',
      accept: 'Accept',
      decline: 'Decline',
      settings: 'Cookie settings',
      label: 'Cookie settings',
    },
  };

  const language = document.documentElement.lang.toLowerCase().startsWith('hu')
    ? 'hu'
    : document.documentElement.lang.toLowerCase().startsWith('de') ? 'de' : 'en';
  const words = copy[language];
  const promoLanguage = language === 'hu' ? 'hu' : 'de';
  const promoCopy = {
    de: {
      title: 'Du musst nicht alles allein tragen.',
      cta: 'Hörprogramm entdecken →',
      href: '/hoerprogramm/?utm_source=site&utm_medium=slidein',
      label: 'Hinweis auf das Hörprogramm',
      close: 'Hinweis schließen',
    },
    hu: {
      title: 'Nem kell mindent egyedül vinned.',
      cta: 'Megnézem a hanganyagot →',
      href: '/hanganyag/?utm_source=site&utm_medium=slidein',
      label: 'Ajánló: hanganyag',
      close: 'Ajánló bezárása',
    },
  };
  let marketingEnabled = false;
  let samplePlayed = false;
  let sampleHalf = false;
  let sampleCompleted = false;

  if (/^[0-9a-f-]{20,}$/i.test(UMAMI_WEBSITE_ID)) {
    const umami = document.createElement('script');
    umami.defer = true;
    umami.src = 'https://cloud.umami.is/script.js';
    umami.dataset.websiteId = UMAMI_WEBSITE_ID;
    document.head.appendChild(umami);
  }

  const utmCampaign = new URLSearchParams(location.search).get('utm_campaign');
  function trackUmami(name, data = {}) {
    const payload = { lang: language, ...data };
    if (utmCampaign) payload.utm_campaign = utmCampaign;
    window.umami?.track(name, payload);
  }

  document.addEventListener('click', (event) => {
    const homeCardLink = event.target.closest?.('[data-home-card]');
    if (!homeCardLink) return;
    trackUmami('home_card_click', { lang: homeCardLink.dataset.lang || promoLanguage });
  });

  function readConsent() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));
      if (!saved || !['accepted', 'declined'].includes(saved.value) || saved.expiresAt <= Date.now()) {
        localStorage.removeItem(CONSENT_KEY);
        return null;
      }
      return saved.value;
    } catch {
      return null;
    }
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, expiresAt: Date.now() + CONSENT_MAX_AGE_MS }));
    } catch {
      // If storage is unavailable, consent applies only to the current page load.
    }
  }

  function removeBanner() {
    document.querySelector('.s621-consent')?.remove();
    document.documentElement.classList.remove('s621-consent-visible');
  }

  function loadMetaPixel() {
    if (!/^\d{5,}$/.test(META_PIXEL_ID) || window.fbq) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    const landingPath = location.pathname.replace(/\/+$/, '/');
    if (['/hoerprogramm/', '/hanganyag/'].includes(landingPath)) window.fbq('track', 'ViewContent');
  }

  function enableMarketing() {
    if (marketingEnabled) return;
    marketingEnabled = true;
    loadMetaPixel();
  }

  function showBanner() {
    removeBanner();
    const banner = document.createElement('section');
    banner.className = 's621-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', words.label);
    banner.innerHTML = `<div class="s621-consent__copy"><p>${words.text}</p><a href="${words.privacyHref}">${words.privacy}</a></div><div class="s621-consent__actions"><button type="button" data-consent="declined">${words.decline}</button><button type="button" data-consent="accepted">${words.accept}</button></div>`;
    banner.addEventListener('click', (event) => {
      const choice = event.target.closest?.('[data-consent]')?.dataset.consent;
      if (!choice) return;
      const wasAccepted = readConsent() === 'accepted' || marketingEnabled;
      saveConsent(choice);
      if (choice === 'accepted') {
        enableMarketing();
        removeBanner();
      } else if (wasAccepted) {
        window.fbq?.('consent', 'revoke');
        location.reload();
      } else {
        removeBanner();
      }
    });
    document.body.appendChild(banner);
    document.documentElement.classList.add('s621-consent-visible');
  }

  function addSettingsLink() {
    const footer = document.querySelector('footer');
    if (!footer || footer.querySelector('.s621-consent-settings')) return;
    const wrap = document.createElement('p');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 's621-consent-settings';
    button.textContent = words.settings;
    button.addEventListener('click', showBanner);
    wrap.appendChild(button);
    footer.appendChild(wrap);
  }

  const priceByProduct = { qhzig: 12.90, eoeaie: 19.90, zdwcno: 24.90, sqlsa: 29.90, odouo: 19.90, 'aggodom-erted-hanganyag-hu': 12.90, 'aggodom-erted-teljes-munkafuzet-hu': 19.90, 'aggodom-erted-csomag-hu': 24.90 };

  function samplePlace(audio) {
    return audio.dataset.playOrigin || audio.dataset.playPlace || 'player';
  }

  function sampleDuration(audio) {
    if (Number.isFinite(audio.duration) && audio.duration > 0) return audio.duration;
    const fallback = Number(document.querySelector('[data-hero-duration]')?.dataset.heroDuration);
    return Number.isFinite(fallback) && fallback > 0 ? fallback : 0;
  }

  document.addEventListener('play', (event) => {
    if (samplePlayed || !(event.target instanceof HTMLAudioElement)) return;
    event.target.dataset.playOrigin = event.target.dataset.playPlace || 'player';
    samplePlayed = true;
    trackUmami('sample_play', { place: samplePlace(event.target) });
    if (marketingEnabled) window.fbq?.('trackCustom', 'SamplePlay');
  }, true);

  document.addEventListener('timeupdate', (event) => {
    const audio = event.target;
    const duration = audio instanceof HTMLAudioElement ? sampleDuration(audio) : 0;
    if (sampleHalf || !(audio instanceof HTMLAudioElement) || !duration || audio.currentTime < duration / 2) return;
    sampleHalf = true;
    trackUmami('sample_50', { place: samplePlace(audio) });
  }, true);

  document.addEventListener('ended', (event) => {
    if (sampleCompleted || !(event.target instanceof HTMLAudioElement)) return;
    sampleCompleted = true;
    trackUmami('sample_end', { place: samplePlace(event.target) });
    if (marketingEnabled) window.fbq?.('trackCustom', 'SampleComplete');
  }, true);

  document.addEventListener('click', (event) => {
    const freeLink = event.target.closest?.('[data-free-sample]');
    if (freeLink && freeLink.getAttribute('href') === '#listen') {
      event.preventDefault();
      document.querySelector('#listen')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const audio = document.querySelector('#listen audio');
      if (audio) {
        audio.dataset.playPlace = freeLink.dataset.place || 'player';
        audio.play().catch(() => {});
      }
      trackUmami('free_click', { place: freeLink.dataset.place || 'hero' });
      return;
    }
    const link = event.target.closest?.('a[href*="gumroad.com/l/"]');
    if (!link) return;
    const product = link.href.match(/gumroad\.com\/l\/([^?/#]+)/)?.[1];
    const value = priceByProduct[product];
    if (!Number.isFinite(value)) return;
    const productName = link.dataset.product || (product.includes('csomag') || product === 'zdwcno' || product === 'sqlsa' ? 'bundle' : product.includes('munkafuzet') || product === 'eoeaie' || product === 'odouo' ? 'workbook' : 'audio');
    const place = link.dataset.place || (link.closest('[data-sample-buy]') ? 'sample' : link.closest('#variants') ? 'cards' : link.closest('.af-mobile-sticky') ? 'sticky' : link.closest('.af-decision-actions') ? 'bottom' : 'cards');
    trackUmami('buy_click', { product: productName, place });
    if (!marketingEnabled) return;
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) {
      const checkoutUrl = new URL(link.href);
      checkoutUrl.searchParams.set('fbclid', fbclid);
      link.href = checkoutUrl.toString();
    }
    window.fbq?.('track', 'InitiateCheckout', {
      content_ids: [product],
      content_type: 'product',
      value,
      currency: 'EUR',
    });
  });

  const cards = document.querySelector('#variants');
  if (cards && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      trackUmami('reach_cards');
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(cards);
  }

  function initializeConsent() {
    addSettingsLink();
    const decision = readConsent();
    if (decision === 'accepted') enableMarketing();
    else if (decision !== 'declined') showBanner();
  }

  function initializeHeroAudio() {
    const control = document.querySelector('[data-hero-audio]');
    if (!control) return;
    const audio = document.querySelector(control.dataset.audioTarget || '#listen audio');
    const button = control.querySelector('.af-hero-audio-toggle');
    const icon = button?.querySelector('[aria-hidden="true"]');
    const progress = control.querySelector('[data-hero-progress]');
    if (!(audio instanceof HTMLAudioElement) || !button || !icon || !progress) return;

    const updateState = () => {
      const playing = !audio.paused && !audio.ended;
      icon.textContent = playing ? '' : '▶';
      button.setAttribute('aria-label', playing ? button.dataset.pauseLabel : button.dataset.playLabel);
      control.classList.toggle('is-playing', playing);
    };

    button.addEventListener('click', () => {
      audio.dataset.playPlace = 'hero';
      if (audio.paused || audio.ended) audio.play().catch(() => {});
      else audio.pause();
    });
    audio.addEventListener('pointerdown', () => { audio.dataset.playPlace = 'player'; });
    audio.addEventListener('keydown', () => { audio.dataset.playPlace = 'player'; });
    audio.addEventListener('play', updateState);
    audio.addEventListener('pause', updateState);
    audio.addEventListener('timeupdate', () => {
      const fallbackDuration = Number(control.dataset.heroDuration);
      const duration = Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : fallbackDuration;
      progress.value = Number.isFinite(duration) && duration > 0 ? audio.currentTime / duration : 0;
    });
    audio.addEventListener('ended', () => {
      progress.value = 1;
      updateState();
      if (audio.dataset.playPlace !== 'hero') return;
      const slot = document.querySelector('[data-hero-ended-slot]');
      const offer = document.querySelector('[data-sample-buy]');
      const message = offer?.querySelector('.af-sample-ended');
      if (!slot || !offer) return;
      slot.hidden = false;
      if (message) message.hidden = false;
      slot.appendChild(offer);
      offer.classList.remove('is-highlighted');
      requestAnimationFrame(() => offer.classList.add('is-highlighted'));
    });
    updateState();
  }

  function initializeHomePromo() {
    const normalizedPath = location.pathname.replace(/\/+$/, '/') || '/';
    if (!['/', '/de/', '/hu/'].includes(normalizedPath) || document.querySelector('.s621-home-promo')) return;
    const promo = document.createElement('section');
    promo.className = 's621-home-promo';
    promo.setAttribute('aria-labelledby', 's621-home-promo-title');
    if (normalizedPath === '/') {
      promo.classList.add('s621-home-promo--root');
      const german = '<div class="s621-home-promo__choice" data-promo-lang="de"><small>Available now in German / Jetzt auf Deutsch:</small><strong>Du musst nicht alles allein tragen.</strong><a data-home-card data-lang="de" href="/hoerprogramm/?utm_source=site&amp;utm_medium=home_card">Hörprogramm entdecken →</a></div>';
      const hungarian = '<div class="s621-home-promo__choice" data-promo-lang="hu"><small>Available now in Hungarian / Most magyarul:</small><strong>Nem kell mindent egyedül vinned.</strong><a data-home-card data-lang="hu" href="/hanganyag/?utm_source=site&amp;utm_medium=home_card">Megnézem a hanganyagot →</a></div>';
      const preferred = navigator.language.toLowerCase().startsWith('hu') ? 'hu' : 'de';
      promo.innerHTML = `<h2 id="s621-home-promo-title">Available now</h2><div class="s621-home-promo__actions">${preferred === 'hu' ? hungarian + german : german + hungarian}</div>`;
      const choices = promo.querySelectorAll('.s621-home-promo__choice');
      choices.forEach((choice, index) => {
        choice.classList.toggle('is-primary', index === 0);
        choice.querySelector('a').className = index === 0 ? 'button' : 'af-secondary';
      });
    } else if (normalizedPath === '/hu/') {
      promo.innerHTML = '<h2 id="s621-home-promo-title">Nem kell mindent egyedül vinned.</h2><p>Hanganyag hozzátartozóknak – attól, aki a másik oldalon állt.</p><a class="button" data-home-card data-lang="hu" href="/hanganyag/?utm_source=site&amp;utm_medium=home_card">Megnézem a hanganyagot →</a>';
    } else {
      promo.innerHTML = '<h2 id="s621-home-promo-title">Du musst nicht alles allein tragen.</h2><p>Ein Hörprogramm für Angehörige – von jemandem, der auf der anderen Seite stand.</p><a class="button" data-home-card data-lang="de" href="/hoerprogramm/?utm_source=site&amp;utm_medium=home_card">Hörprogramm entdecken →</a>';
    }
    if (normalizedPath === '/') document.querySelector('.hero-copy .af-actions')?.insertAdjacentElement('beforebegin', promo);
    else document.querySelector('.site-header')?.insertAdjacentElement('afterend', promo);
  }

  function initializeSlidein() {
    const normalizedPath = location.pathname.replace(/\/+$/, '/') || '/';
    const excludedPaths = ['/hoerprogramm/', '/hanganyag/', '/de/hoerprogramm/', '/hu/hanganyag/'];
    const isArticle = document.querySelector('article.blog-prose, article.prose')
      || /^\/(?:artikel|hu\/cikk(?:ek)?|en\/articles)\//.test(normalizedPath);
    if (language === 'en' || isArticle || excludedPaths.includes(normalizedPath)) return;

    let shownThisPage = false;
    let triggerReached = false;
    let observer;
    try {
      if (sessionStorage.getItem(SLIDEIN_SESSION_KEY) === '1') return;
    } catch {
      // The in-memory flag below still guarantees one display on this page.
    }
    try {
      const dismissedAt = Number(localStorage.getItem(SLIDEIN_DISMISSED_KEY));
      if (Number.isFinite(dismissedAt) && dismissedAt > 0 && Date.now() - dismissedAt < SLIDEIN_DISMISS_MS) return;
    } catch {
      // Without local storage, only the session display limit is applied.
    }

    const page = location.pathname;
    const content = promoCopy[promoLanguage];

    function rememberSessionDisplay() {
      try { sessionStorage.setItem(SLIDEIN_SESSION_KEY, '1'); } catch { /* page-memory fallback */ }
    }

    function rememberDismissal() {
      try { localStorage.setItem(SLIDEIN_DISMISSED_KEY, String(Date.now())); } catch { /* session-only fallback */ }
    }

    function showSlidein() {
      triggerReached = true;
      if (shownThisPage || document.querySelector('.s621-slidein')) return;
      if (document.querySelector('.s621-consent')) {
        if (!observer && 'MutationObserver' in window) {
          observer = new MutationObserver(() => {
            if (!document.querySelector('.s621-consent')) showSlidein();
          });
          observer.observe(document.body, { childList: true });
        }
        return;
      }

      observer?.disconnect();
      shownThisPage = true;
      rememberSessionDisplay();
      const panel = document.createElement('section');
      panel.className = 's621-slidein';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'false');
      panel.setAttribute('aria-label', content.label);
      panel.innerHTML = `<button class="s621-slidein__close" type="button" aria-label="${content.close}">×</button><p>${content.title}</p><a class="s621-slidein__cta" href="${content.href}">${content.cta}</a>`;

      function closeSlidein() {
        if (!panel.isConnected) return;
        rememberDismissal();
        trackUmami('slidein_close', { lang: promoLanguage, page });
        panel.classList.remove('is-visible');
        panel.addEventListener('transitionend', () => panel.remove(), { once: true });
        setTimeout(() => panel.remove(), 350);
        document.removeEventListener('keydown', handleEscape);
      }

      function handleEscape(event) {
        if (event.key === 'Escape') closeSlidein();
      }

      panel.querySelector('.s621-slidein__close').addEventListener('click', closeSlidein);
      panel.querySelector('.s621-slidein__cta').addEventListener('click', () => {
        trackUmami('slidein_click', { lang: promoLanguage, page });
      });
      document.addEventListener('keydown', handleEscape);
      document.body.appendChild(panel);
      requestAnimationFrame(() => panel.classList.add('is-visible'));
      panel.querySelector('.s621-slidein__cta').focus({ preventScroll: true });
      trackUmami('slidein_show', { lang: promoLanguage, page });
    }

    const scrollHandler = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= 0.5) {
        window.removeEventListener('scroll', scrollHandler);
        showSlidein();
      }
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    setTimeout(() => {
      if (!triggerReached) showSlidein();
    }, 15000);
  }

  function initializePageFeatures() {
    initializeHomePromo();
    initializeHeroAudio();
    initializeConsent();
    initializeSlidein();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializePageFeatures);
  else initializePageFeatures();
})();
