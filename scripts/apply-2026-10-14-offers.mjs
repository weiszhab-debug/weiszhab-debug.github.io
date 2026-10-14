import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(repo, relative), 'utf8');
const write = (relative, value) => fs.writeFileSync(path.join(repo, relative), value, 'utf8');

function replaceExact(relative, from, to) {
  const source = read(relative);
  const hits = source.split(from).length - 1;
  if (hits === 0 && source.includes(to)) return;
  if (hits !== 1) throw new Error(`${relative}: expected one match, found ${hits}`);
  write(relative, source.replace(from, to));
}

const oldHomeActions = '<div class="af-actions"><a class="button" href="/hoerprogramm/#listen">Erst reinhören – kostenlos</a><a class="af-secondary" href="/hoerprogramm/">Hörprogramm – 12,90 €</a></div>';
const newHomeActions = '<div class="af-actions"><a class="button" href="https://weiszhabster.gumroad.com/l/zdwcno" target="_blank" rel="noopener">Hörprogramm + Arbeitsbuch – 24,90 €</a><a class="af-secondary" href="/hoerprogramm/#listen">Erst reinhören – kostenlos</a></div>';
replaceExact('dist/de/index.html', oldHomeActions, newHomeActions);

const oldOffers = '<div class="af-supplements af-products"><article class="af-supplement"><h3>Hörprogramm</h3><p class="af-price">12,90 €</p><p>19 ruhige Audios für Angehörige.</p><a href="/hoerprogramm/">Hörprogramm ansehen</a></article><article class="af-supplement"><h3>Hörprogramm + Arbeitsbuch</h3><p class="af-price">27,90 €</p><p>Beides zusammen – du sparst 4,90 €.</p><a href="https://weiszhabster.gumroad.com/l/zdwcno" target="_blank" rel="noopener">Bundle ansehen</a></article><article class="af-supplement"><h3>Arbeitsbuch</h3><p class="af-price">19,90 €</p><p>Fragen, Übungen und ein persönlicher 30-Tage-Plan.</p><a href="/arbeitsbuch/">Arbeitsbuch ansehen</a></article><article class="af-supplement"><h3>Buch</h3><p class="af-price">8,99 €</p><p>Ein persönlicher Bericht über Sucht, Tiefpunkt und Genesung.</p><a href="/buch/">Buch ansehen</a></article><article class="af-supplement"><h3>Komplettpaket</h3><p class="af-price">34,90 €</p><p>Hörprogramm, Arbeitsbuch und Buch – du sparst 6,89 €.</p><a href="https://weiszhabster.gumroad.com/l/sqlsa" target="_blank" rel="noopener">Komplettpaket ansehen</a></article></div>';
const newOffers = '<div class="af-supplements af-products"><article class="af-supplement af-featured"><span class="af-offer-badge">Beste Wahl</span><h3>Hörprogramm + Arbeitsbuch</h3><p class="af-price">24,90 €</p><p class="af-price-note"><s>32,80 €</s> · Du sparst 7,90 €.</p><p>19 ruhige Audios, praktische Fragen, Übungen und ein persönlicher 30-Tage-Plan.</p><a href="https://weiszhabster.gumroad.com/l/zdwcno" target="_blank" rel="noopener">Hörprogramm + Arbeitsbuch wählen</a></article><article class="af-supplement"><h3>Hörprogramm</h3><p class="af-price">12,90 €</p><p>19 ruhige Audios für Angehörige.</p><a href="/hoerprogramm/">Hörprogramm ansehen</a></article><article class="af-supplement"><h3>Arbeitsbuch</h3><p class="af-price">19,90 €</p><p>Fragen, Übungen und ein persönlicher 30-Tage-Plan.</p><a href="/arbeitsbuch/">Arbeitsbuch ansehen</a></article><article class="af-supplement"><h3>Komplettpaket</h3><p class="af-price">29,90 €</p><p class="af-price-note"><s>41,70 €</s> · Du sparst 11,80 €.</p><p>Hörprogramm, Arbeitsbuch und Buch – alles zusammen.</p><a href="https://weiszhabster.gumroad.com/l/sqlsa" target="_blank" rel="noopener">Komplettpaket ansehen</a></article><article class="af-supplement"><h3>Buch</h3><p class="af-price">8,90 €</p><p>Ein persönlicher Bericht über Sucht, Tiefpunkt und Genesung.</p><a href="/buch/">Buch ansehen</a></article></div>';
replaceExact('dist/de/index.html', oldOffers, newOffers);

let workbook = read('dist/arbeitsbuch/index.html');
const workbookHeading = workbook.indexOf('<h2>Preise und verfügbare Ausgaben</h2>');
const cardsStart = workbook.indexOf('<div class="cards">', workbookHeading);
const cardsEndMarker = '\n        </div>';
const cardsEnd = workbook.indexOf(cardsEndMarker, cardsStart);
if (workbookHeading < 0 || cardsStart < 0 || cardsEnd < 0) throw new Error('Could not locate workbook offer cards');
const workbookOffers = `<div class="cards">
          <div class="card best-value"><span class="kicker">Beste Wahl · Arbeitsbuch + Audio</span><div class="price">24,90 €</div><p><s>32,80 €</s> · Du sparst 7,90 €. Das vollständige Arbeitsbuch und alle 19 Audiodateien.</p><a class="button sun" href="https://weiszhabster.gumroad.com/l/zdwcno" target="_blank" rel="noopener">Bundle kaufen</a></div>
          <div class="card"><span class="kicker">Arbeitsbuch</span><div class="price">19,90 €</div><p>Druckversion (A4-PDF, 79 Seiten), Handyversion (PDF) und EPUB</p><a class="button sun" href="https://weiszhabster.gumroad.com/l/eoeaie" target="_blank" rel="noopener">Arbeitsbuch kaufen</a></div>
          <div class="card"><span class="kicker">Audio-Begleitung</span><div class="price">12,90 €</div><p>19 eigenständige Audiodateien mit zusätzlichen Erklärungen und Beispielen zu allen zehn Kapiteln.</p><a class="button" href="https://weiszhabster.gumroad.com/l/qhzig" target="_blank" rel="noopener">Audio kaufen</a></div>
          <div class="card"><span class="kicker">Komplettpaket</span><div class="price">29,90 €</div><p><s>41,70 €</s> · Du sparst 11,80 €. Buch, vollständiges Arbeitsbuch und alle 19 Audiodateien.</p><a class="button" href="https://weiszhabster.gumroad.com/l/sqlsa" target="_blank" rel="noopener">Komplettpaket kaufen</a></div>`;
workbook = workbook.slice(0, cardsStart) + workbookOffers + workbook.slice(cardsEnd);
write('dist/arbeitsbuch/index.html', workbook);

let book = read('dist/buch/index.html');
const bookPriceHits = book.split('8,99 €').length - 1;
const newBookPriceHits = book.split('8,90 €').length - 1;
if (bookPriceHits === 2) write('dist/buch/index.html', book.replaceAll('8,99 €', '8,90 €'));
else if (bookPriceHits !== 0 || newBookPriceHits !== 2) throw new Error(`dist/buch/index.html: unexpected book price state`);

const audioCssPath = 'dist/assets/audio-first.css';
let audioCss = read(audioCssPath);
if (!audioCss.includes('.af-featured{')) {
  audioCss += `
.af-products .af-featured{grid-column:1/-1;position:relative;padding:clamp(2rem,4vw,3rem);border:2px solid var(--af-blue);background:var(--af-pale);box-shadow:0 18px 42px rgba(23,61,71,.1)}
.af-offer-badge{display:inline-flex;align-self:flex-start;width:max-content;margin-bottom:1rem;padding:.45rem .8rem;border-radius:999px;background:var(--af-sun);color:var(--af-ink);font-size:.75rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
.af-price-old,.af-price-note{color:#52666b;font-size:.9rem;font-weight:750}
.af-products .af-featured>a{display:inline-flex;width:max-content;margin-top:.35rem;padding:.8rem 1.1rem;border-radius:999px;background:var(--af-sun);text-decoration:none}
@media(max-width:820px){.af-products .af-featured{grid-column:auto}.af-products .af-featured>a{width:100%;justify-content:center;text-align:center}}
`;
  write(audioCssPath, audioCss);
}

const contentCssPath = 'dist/assets/content.css';
let contentCss = read(contentCssPath);
if (!contentCss.includes('.cards .best-value{')) {
  contentCss += `
.cards .best-value{grid-column:1/-1;border:2px solid var(--blue);background:var(--blue-soft);box-shadow:0 16px 38px rgba(23,61,71,.1)}
.cards .best-value .price{font-size:2.7rem}
@media(max-width:880px){.cards .best-value{grid-column:auto}}
`;
  write(contentCssPath, contentCss);
}

let builder = read('scripts/build-audio-first-pages.mjs');
const builderOffersStart = builder.indexOf('const deProducts=()=>`');
const builderHomeStart = builder.indexOf('function home', builderOffersStart);
const builderOffersEnd = builder.lastIndexOf('`;', builderHomeStart);
if (builderOffersStart < 0 || builderOffersEnd < 0) throw new Error('Could not locate deProducts builder');
builder = builder.slice(0, builderOffersStart) + `const deProducts=()=>\`<section class="section-pad"><p class="af-kicker">ANGEBOTE</p><h2>Wähle, was dir jetzt hilft.</h2>${newOffers}<p><a class="af-secondary" href="/kostenlos/">Kostenloses Einstiegsheft (PDF)</a></p></section>\`` + builder.slice(builderOffersEnd + 1);
const oldBuilderHero = '<a class="button" href="/hoerprogramm/#listen">${d.free}</a><a class="af-secondary" href="/hoerprogramm/">Hörprogramm – 12,90 €</a>';
const newBuilderHero = '<a class="button" href="https://weiszhabster.gumroad.com/l/zdwcno" target="_blank" rel="noopener">Hörprogramm + Arbeitsbuch – 24,90 €</a><a class="af-secondary" href="/hoerprogramm/#listen">${d.free}</a>';
const builderHeroHits = builder.split(oldBuilderHero).length - 1;
if (builderHeroHits !== 1) throw new Error(`Expected one builder hero match, found ${builderHeroHits}`);
builder = builder.replace(oldBuilderHero, newBuilderHero);
write('scripts/build-audio-first-pages.mjs', builder);

console.log('Updated German offer pricing and presentation.');
