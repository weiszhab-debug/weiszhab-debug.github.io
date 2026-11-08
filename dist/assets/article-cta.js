(() => {
  // R42-R48: related reading, persistent attribution, reading depth and in-article samples.
  const roots = [...document.querySelectorAll('[data-article-cta]')];
  const article = document.querySelector('article.blog-prose, article.prose');
  const end = document.querySelector('.article-cta--end[data-article-cta]');
  const params = new URLSearchParams(location.search);
  const storageKey = (name) => `s621_${name}`;
  const remember = (name) => {
    const incoming = params.get(name);
    try {
      if (incoming) sessionStorage.setItem(storageKey(name), incoming);
      return incoming || sessionStorage.getItem(storageKey(name)) || '';
    } catch {
      return incoming || '';
    }
  };
  const attribution = { utm_source: remember('utm_source'), utm_campaign: remember('utm_campaign') };
  const slug = end?.dataset.articleSlug || location.pathname.split('/').filter(Boolean).at(-1) || '';
  const lang = document.documentElement.lang?.toLowerCase().startsWith('de') ? 'de' : 'hu';
  const eventData = () => ({ slug, lang, utm_campaign: attribution.utm_campaign || '' });

  document.querySelectorAll('[data-article-cta-link], [data-attribution-link]').forEach((link) => {
    if (attribution.utm_campaign || attribution.utm_source) {
      const url = new URL(link.href, location.origin);
      if (attribution.utm_campaign) url.searchParams.set('utm_campaign', attribution.utm_campaign);
      if (attribution.utm_source) url.searchParams.set('utm_source', attribution.utm_source);
      link.href = url.toString();
    }
  });

  const track = (name, data) => window.umami?.track?.(name, data);

  const sampleSource = lang === 'de' ? '/assets/audio/de-sample.mp3' : '/assets/audio/hu-sample.mp3';
  const sampleCopy = lang === 'de'
    ? {
        duration: 'ca. 5 Minuten',
        finished: 'Wenn dir das geholfen hat: Die übrigen 18 Teile gehen genauso weiter.',
        details: 'Mehr über das Hörprogramm →',
        detailsHref: '/hoerprogramm/',
        disclosure: 'Gesprochen mit KI-Stimme. Text und Geschichte: Steven H. White.',
        play: 'Hörprobe abspielen',
        pause: 'Hörprobe pausieren',
      }
    : {
        duration: 'kb. 4 perc',
        finished: 'Ha ez segített: a többi 18 rész ugyanígy folytatódik.',
        details: 'Többet a hanganyagról →',
        detailsHref: '/hanganyag/',
        disclosure: 'MI-hanggal készült. Szöveg és történet: Steven H. White.',
        play: 'Hangminta lejátszása',
        pause: 'Hangminta szüneteltetése',
      };
  const samplePlayers = [];

  const createSamplePlayer = (trigger) => {
    const shell = document.createElement('div');
    shell.className = 'article-sample';
    shell.dataset.articleSample = '';
    shell.innerHTML = `<div class="article-sample-row"><button class="article-sample-toggle" type="button" aria-label="${sampleCopy.pause}"><span aria-hidden="true">❚❚</span></button><div class="article-sample-main"><div class="article-sample-meta"><strong>${sampleCopy.duration}</strong><span data-sample-time>0:00</span></div><div class="article-sample-track" aria-hidden="true"><span data-sample-progress></span></div></div></div><p class="article-sample-finished" data-sample-finished hidden>${sampleCopy.finished}</p><p class="article-sample-details"><a data-attribution-link href="${sampleCopy.detailsHref}">${sampleCopy.details}</a></p><audio preload="metadata" src="${sampleSource}"></audio><p class="article-sample-disclosure">${sampleCopy.disclosure}</p>`;
    trigger.insertAdjacentElement('afterend', shell);

    const audio = shell.querySelector('audio');
    const toggle = shell.querySelector('.article-sample-toggle');
    const icon = toggle.querySelector('span');
    const progress = shell.querySelector('[data-sample-progress]');
    const time = shell.querySelector('[data-sample-time]');
    const finished = shell.querySelector('[data-sample-finished]');
    const details = shell.querySelector('[data-attribution-link]');
    if (attribution.utm_campaign || attribution.utm_source) {
      const url = new URL(details.href, location.origin);
      if (attribution.utm_campaign) url.searchParams.set('utm_campaign', attribution.utm_campaign);
      if (attribution.utm_source) url.searchParams.set('utm_source', attribution.utm_source);
      details.href = url.toString();
    }
    const state = { audio, played: false, halfway: false, ended: false };
    samplePlayers.push(state);
    const sampleEventData = () => ({ slug, place: 'article', lang, utm_campaign: attribution.utm_campaign || '' });
    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

    toggle.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
    audio.addEventListener('play', () => {
      samplePlayers.forEach((other) => { if (other.audio !== audio && !other.audio.paused) other.audio.pause(); });
      icon.textContent = '❚❚';
      toggle.setAttribute('aria-label', sampleCopy.pause);
      if (!state.played) {
        state.played = true;
        track('sample_play', sampleEventData());
      }
    });
    audio.addEventListener('pause', () => {
      if (audio.ended) return;
      icon.textContent = '▶';
      toggle.setAttribute('aria-label', sampleCopy.play);
    });
    audio.addEventListener('timeupdate', () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      progress.style.width = `${Math.min(100, ratio * 100)}%`;
      time.textContent = formatTime(audio.currentTime);
      if (!state.halfway && ratio >= .5) {
        state.halfway = true;
        track('sample_50', sampleEventData());
      }
    });
    audio.addEventListener('ended', () => {
      icon.textContent = '▶';
      toggle.setAttribute('aria-label', sampleCopy.play);
      finished.hidden = false;
      if (!state.ended) {
        state.ended = true;
        track('sample_end', sampleEventData());
      }
    });
    audio.play().catch(() => {
      icon.textContent = '▶';
      toggle.setAttribute('aria-label', sampleCopy.play);
    });
    return shell;
  };
  let endViewed = false;
  if (end && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (endViewed || !entries.some((entry) => entry.isIntersecting)) return;
      endViewed = true;
      track('article_cta_view', { ...eventData(), place: 'end' });
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(end);
  }

  document.addEventListener('click', (event) => {
    const related = event.target.closest('[data-related-link]');
    if (related) track('related_click', { from: slug, to: related.dataset.relatedTo });
    const link = event.target.closest('[data-article-cta-link]');
    if (!link) return;
    track('article_cta_click', {
      ...eventData(),
      type: link.dataset.articleCtaType,
      place: link.dataset.articleCtaPlace,
    });
    if (link.dataset.articleCtaType === 'sample') {
      event.preventDefault();
      const existing = link.nextElementSibling?.matches('[data-article-sample]') ? link.nextElementSibling : null;
      if (existing) {
        const audio = existing.querySelector('audio');
        if (audio.paused) audio.play();
      } else createSamplePlayer(link);
    }
  });

  if (article) {
    const sent = { 50: false, 75: false };
    const measure = () => {
      const rect = article.getBoundingClientRect();
      const reached = Math.max(0, Math.min(1, (innerHeight - rect.top) / Math.max(rect.height, 1)));
      for (const threshold of [50, 75]) {
        if (!sent[threshold] && reached >= threshold / 100) {
          sent[threshold] = true;
          track(threshold === 50 ? 'article_read_50' : 'article_read_75', eventData());
        }
      }
      if (sent[50] && sent[75]) {
        removeEventListener('scroll', measure);
        removeEventListener('resize', measure);
      }
    };
    addEventListener('scroll', measure, { passive: true });
    addEventListener('resize', measure);
    measure();

    let activeMs = 0;
    let activeSince = document.visibilityState === 'visible' ? performance.now() : null;
    let activeTimer;
    let timeSent = false;
    const scheduleActive = () => {
      clearTimeout(activeTimer);
      if (timeSent || document.visibilityState !== 'visible') return;
      activeSince = performance.now();
      activeTimer = setTimeout(() => {
        activeMs += performance.now() - activeSince;
        activeSince = null;
        if (activeMs >= 60000 && !timeSent) {
          timeSent = true;
          track('article_time_60', eventData());
        }
      }, Math.max(0, 60000 - activeMs));
    };
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && activeSince !== null) {
        activeMs += performance.now() - activeSince;
        activeSince = null;
        clearTimeout(activeTimer);
      } else scheduleActive();
    });
    scheduleActive();
  }

  document.querySelectorAll('[data-article-audio]').forEach((player) => {
    const audio = player.querySelector('audio');
    const toggle = player.querySelector('.article-audio-toggle');
    const icon = toggle.querySelector('span');
    const duration = player.querySelector('[data-audio-duration]');
    const progress = player.querySelector('[data-audio-progress]');
    const promo = player.querySelector('[data-audio-promo]');
    const data = { slug: player.dataset.articleSlug, lang: player.dataset.articleLang };
    let played = false;
    let halfway = false;
    const updateDuration = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const minutes = Math.max(1, Math.round(audio.duration / 60));
      duration.textContent = `${data.lang === 'de' ? 'ca.' : 'kb.'} ${minutes} ${data.lang === 'de' ? 'Min.' : 'perc'}`;
    };
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    toggle.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
    audio.addEventListener('play', () => {
      icon.textContent = '❚❚';
      if (!played) { played = true; track('article_audio_play', { ...data, utm_campaign: attribution.utm_campaign || '' }); }
    });
    audio.addEventListener('pause', () => { if (!audio.ended) icon.textContent = '▶'; });
    audio.addEventListener('timeupdate', () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      progress.style.width = `${Math.min(100, ratio * 100)}%`;
      if (!halfway && ratio >= .5) {
        halfway = true;
        track('article_audio_50', { ...data, utm_campaign: attribution.utm_campaign || '' });
      }
    });
    audio.addEventListener('ended', () => {
      icon.textContent = '▶';
      promo.hidden = false;
      track('article_audio_end', { ...data, utm_campaign: attribution.utm_campaign || '' });
    });
  });
})();
