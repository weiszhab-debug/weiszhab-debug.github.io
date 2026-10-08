(() => {
  'use strict';
  const PIXEL_ID = 'META_PIXEL_ID';
  if (!/^\d{5,}$/.test(PIXEL_ID)) return;

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
  if (location.pathname.replace(/\/+$/, '/') === '/hoerprogramm/') {
    fbq('track', 'ViewContent');
  }

  let samplePlayed = false;
  document.addEventListener('play', (event) => {
    if (!samplePlayed && event.target instanceof HTMLAudioElement) {
      samplePlayed = true;
      fbq('trackCustom', 'SamplePlay');
    }
  }, true);

  const priceByProduct = {
    qhzig: 9.90,
    eoeaie: 19.90,
    zdwcno: 24.90,
    sqlsa: 29.90,
    odouo: 19.90,
  };
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href*="gumroad.com/l/"]');
    if (!link) return;
    const product = link.href.match(/gumroad\.com\/l\/([^?/#]+)/)?.[1];
    const value = priceByProduct[product];
    if (Number.isFinite(value)) fbq('track', 'InitiateCheckout', { value, currency: 'EUR' });
  });
})();
