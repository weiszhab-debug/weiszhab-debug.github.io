import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

function read(relative) {
  return fs.readFileSync(path.join(dist, relative), 'utf8');
}

function write(relative, value) {
  fs.writeFileSync(path.join(dist, relative), value, 'utf8');
}

function replaceRequired(relative, from, to) {
  const current = read(relative);
  if (!current.includes(from)) {
    if (current.includes(to)) return;
    throw new Error(`Missing required text in ${relative}: ${from.slice(0, 100)}`);
  }
  write(relative, current.replace(from, to));
}

function setTitleAndDescription(relative, title, description) {
  let html = read(relative);
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${description}">`);
  } else {
    html = html.replace(/<title>[^<]*<\/title>/i, (match) => `${match}<meta name="description" content="${description}">`);
  }
  write(relative, html);
}

// R7: unique titles and descriptions.
setTitleAndDescription(
  'soforthilfe/index.html',
  'Soforthilfe bei Alkohol, Entzug oder Gewalt – Deutschland, Österreich, Schweiz | 621 SOBER',
  'Geprüfte Hilfen in Deutschland, Österreich und der Schweiz: Notrufnummern, Suchtberatung, Al-Anon, Anonyme Alkoholiker und Hilfe bei Gewalt.',
);
{
  const relative = 'soforthilfe/index.html';
  const html = read(relative).replace(/<div class="eyebrow">Soforthilfe[^<]*<\/div>/, '<div class="eyebrow">Soforthilfe Deutschland, Österreich, Schweiz</div>');
  write(relative, html);
}
setTitleAndDescription(
  'de/index.html',
  '621 SOBER – Orientierung und Hörprogramm für Angehörige',
  'Hörprogramm, Arbeitsbuch und ehrliche Texte für Angehörige von Menschen mit Alkoholproblemen – von jemandem, der selbst auf der anderen Seite stand.',
);
const englishDescription = "Calm, practical guidance for people worried about a loved one's drinking – from someone who stood on the other side.";
setTitleAndDescription('en/index.html', '621 SOBER', englishDescription);
setTitleAndDescription('index.html', 'Audio guidance for families affected by problem drinking | 621 SOBER', englishDescription);

// /audio/ is a real content page instead of a 200-status client-side redirect.
write('audio/index.html', read('hoerprogramm/index.html').replace(
  'https://www.621sober.com/hoerprogramm/',
  'https://www.621sober.com/hoerprogramm/',
));

// R8: only the requested remaining formal-address corrections.
replaceRequired(
  'arbeitsbuch/index.html',
  'Danach beobachten Sie Deine konkrete Situation, beantworten Fragen zur Selbstreflexion und lesen eine persönliche Geschichte aus der Erfahrung des Autors.',
  'Danach beobachtest du deine konkrete Situation, beantwortest Fragen zur Selbstreflexion und liest eine persönliche Geschichte aus der Erfahrung des Autors.',
);
replaceRequired('fuer-angehoerige/index.html', 'bei Ihrer Erfahrung zu bleiben', 'bei deiner Erfahrung zu bleiben');
replaceRequired(
  'kostenlos/index.html',
  'Besonders dann, wenn du oft kontrollieren, erklären, retten oder an Ihrer eigenen Wahrnehmung zweifeln. Du arbeitest allein, im eigenen Tempo und müssen Deine Antworten niemandem zeigen.',
  'Besonders dann, wenn du oft kontrollierst, erklärst, rettest oder an deiner eigenen Wahrnehmung zweifelst. Du arbeitest allein, in deinem eigenen Tempo und musst deine Antworten niemandem zeigen.',
);
replaceRequired('soforthilfe/index.html', 'Rufen Sie sofort 112 bei', 'Ruf sofort 112 bei');

{
  const relative = 'kontakt/index.html';
  let html = read(relative);
  html = html.replace('<h1>Schreiben Sie mir.</h1><p class="lead">Für Fragen zu den Büchern, Arbeitsmaterialien oder Downloads erreichen Sie mich per E-Mail.</p>', '<h1>Schreib mir.</h1><p class="lead">Für Fragen zu den Büchern, Arbeitsmaterialien oder Downloads erreichst du mich per E-Mail.</p>');
  html = html.replace(/<div class="callout"><h2 class="compact">E-Mail<\/h2>[\s\S]*?<\/div>\s*<h2>Was ich beantworten kann<\/h2>/, '<div class="callout"><h2 class="compact">E-Mail</h2><p><a href="mailto:weiszhab@gmail.com"><strong>weiszhab@gmail.com</strong></a></p><p>Bitte gib bei Fragen zu einem Gumroad-Download die beim Kauf verwendete E-Mail-Adresse an.</p><p>Sende keine Passwörter, Zahlungsdaten oder ausführlichen Gesundheitsdaten.</p></div><h2>Was ich beantworten kann</h2>');
  html = html.replace(/<h2>Was dieses Angebot nicht leisten kann<\/h2>[\s\S]*?<\/article>/, '<h2>Was dieses Angebot nicht leisten kann</h2><p>Ich biete keine individuelle medizinische, psychologische, psychotherapeutische oder suchtmedizinische Beratung an.</p><p>In einer akuten Gefahrenlage nutze bitte die örtlichen Notruf- und Hilfsangebote.</p><p>Für Deutschland, Österreich und die Schweiz findest du geprüfte Anlaufstellen auf der Soforthilfe-Seite.</p></article>');
  write(relative, html);
}

const exactReplacements = [
  ['artikel/alkoholproblem-in-der-familie-helfen-ohne-zu-retten/index.html', 'Sie beschreibt, was <em>Sie</em> tun oder nicht mehr tun werden', 'Sie beschreibt, was du tun oder nicht mehr tun wirst'],
  ['artikel/alkoholproblem-in-der-familie-helfen-ohne-zu-retten/index.html', 'die Ihrer Kinder', 'die deiner Kinder'],
  ['artikel/alkoholproblem-in-der-familie-helfen-ohne-zu-retten/index.html', 'Dort können Sie deine Situation', 'Dort kannst du deine Situation'],
  ['artikel/auch-die-stille-kann-schreien/index.html', 'Was bleibt in Ihrer Familie unausgesprochen', 'Was bleibt in deiner Familie unausgesprochen'],
  ['artikel/sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst/index.html', 'Sie beschreibt, was <strong>Sie</strong> in einer bestimmten Situation tun werden', 'Sie beschreibt, was du in einer bestimmten Situation tun wirst'],
  ['artikel/sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst/index.html', 'Zukunft Ihrer Beziehung', 'Zukunft deiner Beziehung'],
  ['artikel/sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst/index.html', 'Kapitel Ihrer Geschichte', 'Kapitel deiner Geschichte'],
  ['artikel/sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst/index.html', 'Wie viel Ihrer Kraft', 'Wie viel deiner Kraft'],
];
for (const args of exactReplacements) replaceRequired(...args);

const socialIcons = {
  pinterest: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14"></circle><text x="16" y="21" text-anchor="middle">P</text></svg>',
  substack: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 7h20v3H6zm0 6h20v3H6zm2 6h16v3H8zm0 5h16l-8 5z"></path></svg>',
};

function socialBlock(lang) {
  if (lang === 'de') {
    return `<nav class="s621-social-links" aria-label="Soziale Medien"><a href="https://www.pinterest.com/iweiszhab/" target="_blank" rel="noopener" aria-label="621 SOBER auf Pinterest">${socialIcons.pinterest}</a><a href="https://621sober.substack.com" target="_blank" rel="noopener" aria-label="621 SOBER auf Substack">${socialIcons.substack}</a><!-- SOCIAL LINKS: Facebook- und TikTok-URL pótlandó --></nav>`;
  }
  const label = lang === 'hu' ? 'Közösségi média' : 'Social media';
  const aria = lang === 'hu' ? '621 SOBER a Substacken' : '621 SOBER on Substack';
  const comment = lang === 'hu' ? '<!-- SOCIAL LINKS: magyar Facebook-URL pótlandó -->' : '';
  return `<nav class="s621-social-links" aria-label="${label}"><a href="https://621sober.substack.com" target="_blank" rel="noopener" aria-label="${aria}">${socialIcons.substack}</a>${comment}</nav>`;
}

function followBlock(lang) {
  const title = lang === 'de' ? 'Folge meiner Geschichte' : lang === 'hu' ? 'Kövesd a történetem' : 'Follow my story';
  return `<section class="s621-follow-block"><h2>${title}</h2>${socialBlock(lang)}</section>`;
}

for (const [relative, lang] of [
  ['ueber-mich/index.html', 'de'],
  ['hu/rolam/index.html', 'hu'],
  ['en/about/index.html', 'en'],
]) {
  let html = read(relative);
  html = html.replace(/<section class="s621-follow-block">[\s\S]*?<\/section>/g, '');
  html = html.replace('</main>', `${followBlock(lang)}</main>`);
  write(relative, html);
}

function personSchema(lang) {
  const sameAs = lang === 'de'
    ? ['https://www.pinterest.com/iweiszhab/', 'https://621sober.substack.com']
    : ['https://621sober.substack.com'];
  return `<script type="application/ld+json" id="s621-person-schema">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Steven H. White',
    url: 'https://www.621sober.com/',
    sameAs,
  })}</script>`;
}

for (const [relative, lang] of [['index.html', 'en'], ['de/index.html', 'de'], ['hu/index.html', 'hu']]) {
  let html = read(relative);
  html = html.replace(/<script type="application\/ld\+json" id="s621-person-schema">[\s\S]*?<\/script>/g, '');
  html = html.replace('</head>', `${personSchema(lang)}</head>`);
  write(relative, html);
}

const htmlFiles = [];
function collectHtml(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) collectHtml(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
collectHtml(dist);

for (const file of htmlFiles) {
  const relative = path.relative(dist, file).replaceAll('\\', '/');
  let html = fs.readFileSync(file, 'utf8');
  const lang = (html.match(/<html[^>]*\slang=["']([^"']+)/i)?.[1] || 'en').toLowerCase().split('-')[0];

  html = html.replace(/<link rel="stylesheet" href="\/assets\/social\.css">/g, '');
  html = html.replace(/<script src="\/assets\/site-tracking\.js" defer><\/script>/g, '');
  html = html.replace('</head>', '<link rel="stylesheet" href="/assets/social.css"><script src="/assets/site-tracking.js" defer></script></head>');

  html = html.replace(/<nav class="s621-social-links"[\s\S]*?<\/nav>/g, '');
  html = html.replace(/<!-- SOCIAL LINKS:[\s\S]*?-->/g, '');
  if (relative !== 'hoerprogramm/index.html' && html.includes('</footer>')) {
    html = html.replace('</footer>', `${socialBlock(lang)}</footer>`);
  }
  fs.writeFileSync(file, html, 'utf8');
}

// Recreate the dedicated story-page blocks after normalizing footer icon rows.
for (const [relative, lang] of [
  ['ueber-mich/index.html', 'de'],
  ['hu/rolam/index.html', 'hu'],
  ['en/about/index.html', 'en'],
]) {
  let html = read(relative);
  html = html.replace(/<section class="s621-follow-block">[\s\S]*?<\/section>/g, '');
  html = html.replace('</main>', `${followBlock(lang)}</main>`);
  write(relative, html);
}

write('assets/social.css', `
.s621-social-links{display:flex;align-items:center;justify-content:center;gap:10px;margin:20px auto 8px}
.s621-social-links a{display:inline-grid;place-items:center;width:40px;height:40px;border:1px solid currentColor;border-radius:50%;color:#e9a33a;text-decoration:none;transition:transform .15s ease,background .15s ease}
.s621-social-links a:hover,.s621-social-links a:focus-visible{transform:translateY(-2px);background:rgba(233,163,58,.12)}
.s621-social-links svg{width:22px;height:22px;fill:currentColor;stroke:none}
.s621-social-links circle{fill:none;stroke:currentColor;stroke-width:2}
.s621-social-links text{fill:currentColor;font:bold 18px Arial,sans-serif}
.s621-follow-block{width:min(760px,calc(100% - 40px));margin:20px auto 70px;padding:28px;text-align:center;border:1px solid rgba(23,61,71,.18);border-radius:20px;background:rgba(255,255,255,.55)}
.s621-follow-block h2{margin:0 0 12px}
`);

write('assets/site-tracking.js', `(() => {
  'use strict';
  const PIXEL_ID = 'META_PIXEL_ID';
  if (!/^\\d{5,}$/.test(PIXEL_ID)) return;

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
  if (location.pathname.replace(/\\/+$/, '/') === '/hoerprogramm/') {
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
    const product = link.href.match(/gumroad\\.com\\/l\\/([^?/#]+)/)?.[1];
    const value = priceByProduct[product];
    if (Number.isFinite(value)) fbq('track', 'InitiateCheckout', { value, currency: 'EUR' });
  });
})();
`);

// Guardrails for this revision.
const allHtml = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
for (const forbidden of ['Rufen Sie sofort 112 bei', 'bei Ihrer Erfahrung zu bleiben', 'an Ihrer eigenen Wahrnehmung zweifeln', 'Dort können Sie deine Situation', 'Was bleibt in Ihrer Familie unausgesprochen', 'Zukunft Ihrer Beziehung', 'Kapitel Ihrer Geschichte', 'Wie viel Ihrer Kraft']) {
  if (allHtml.includes(forbidden)) throw new Error(`Remaining requested text: ${forbidden}`);
}
if (!read('assets/site-tracking.js').includes("const PIXEL_ID = 'META_PIXEL_ID'")) throw new Error('Pixel placeholder missing');
if (read('hoerprogramm/index.html').includes('s621-social-links')) throw new Error('Landing must not contain social links');

console.log(`Updated ${htmlFiles.length} HTML files for v5.`);
