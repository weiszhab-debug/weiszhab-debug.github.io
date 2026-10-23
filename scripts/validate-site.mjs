import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const files = fs.readdirSync(root, { recursive: true }).map(String).filter(file => file.endsWith('.html'));
const failures = [];

for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (!/<link rel="canonical" href="https:\/\/www\.621sober\.com\//.test(html)) failures.push(`${file}: missing www canonical`);
  if (!html.includes('<script src="/assets/site-tracking.js" defer></script>')) failures.push(`${file}: missing shared tracking scaffold`);
  for (const match of html.matchAll(/(?:href|src)="(\/(?!\/|#)[^"?#]*)/g)) {
    const urlPath = match[1];
    const target = path.join(root, urlPath.slice(1));
    const exists = path.extname(urlPath) ? fs.existsSync(target) : fs.existsSync(target) || fs.existsSync(path.join(target, 'index.html'));
    if (!exists) failures.push(`${file}: broken internal reference ${urlPath}`);
  }
  for (const audio of html.matchAll(/<audio\b[\s\S]*?<\/audio>/g)) {
    const after = html.slice(audio.index + audio[0].length, audio.index + audio[0].length + 250);
    if (!/(KI-Stimme|MI-hanggal)/.test(after)) failures.push(`${file}: audio missing AI disclosure`);
  }

  const language = html.match(/<html[^>]*\blang="([^"]+)"/i)?.[1]?.toLowerCase() ?? '';
  const socialBlocks = [...html.matchAll(/<nav class="s621-social-links"[\s\S]*?<\/nav>/g)].map(match => match[0]);
  if (html.includes('</footer>') && socialBlocks.length === 0) failures.push(`${file}: footer missing social links`);
  for (const social of socialBlocks) {
    if (language.startsWith('de')) {
      if (!social.includes('https://www.pinterest.com/iweiszhab/') || !social.includes('id=61594558974405') || !social.includes('https://621soberde.substack.com/')) failures.push(`${file}: incomplete German social links`);
      if (social.includes('id=61594136947748') || social.includes('https://substack.com/@621sober')) failures.push(`${file}: wrong-language social link in German block`);
    } else if (language.startsWith('hu')) {
      if (!social.includes('id=61594136947748')) failures.push(`${file}: missing Hungarian Facebook link`);
      if (social.includes('substack.com') || social.includes('id=61594558974405')) failures.push(`${file}: unpublished social link in Hungarian block`);
    } else if (language.startsWith('en')) {
      if (!social.includes('https://substack.com/@621sober')) failures.push(`${file}: missing English Substack link`);
      if (social.includes('facebook.com') || social.includes('621soberde.substack.com')) failures.push(`${file}: unpublished social link in English block`);
    }
  }
  if (/SOCIAL LINKS:/.test(html)) failures.push(`${file}: stale social-link placeholder`);
}

const requiredFiles = ['assets/audio/de-sample.mp3', 'assets/audio/hu-sample.mp3', 'sitemap.xml', 'robots.txt'];
for (const file of requiredFiles) if (!fs.existsSync(path.join(root, file))) failures.push(`missing ${file}`);

const germanFamily = fs.readFileSync(path.join(root, 'fuer-angehoerige/index.html'), 'utf8');
for (const oldText of ['Warum Sie das Trinken nicht kontrollieren können', 'außerhalb Ihrer Macht liegt', 'Wann Sie sofort Hilfe holen sollten']) {
  if (germanFamily.includes(oldText)) failures.push(`fuer-angehoerige/index.html: formal-language remnant ${oldText}`);
}

const germanArticle = fs.readFileSync(path.join(root, 'artikel/sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst/index.html'), 'utf8');
if (!germanArticle.includes('<title>Du verlierst nicht nur ihn – sondern langsam auch dich selbst | 621 SOBER</title>')) {
  failures.push('German article: incorrect title');
}

const audioLanding = fs.readFileSync(path.join(root, 'hoerprogramm/index.html'), 'utf8');
if (!audioLanding.includes('<a href="/soforthilfe/">Alle Nummern auf der Soforthilfe-Seite.</a>')) {
  failures.push('hoerprogramm/index.html: crisis sentence is not linked');
}

const germanHome = fs.readFileSync(path.join(root, 'de/index.html'), 'utf8');
const germanHero = germanHome.match(/<section class="section-pad brand-hero">[\s\S]*?<\/section>/)?.[0] ?? '';
for (const required of ['621 SOBER · Orientierung für Angehörige', 'Ich war derjenige, der getrunken hat.', 'href="#drei-wege"', 'class="brand-paths"', 'class="brand-articles"', 'Steven H. White']) {
  if (!germanHome.includes(required)) failures.push(`de/index.html: missing brand-home element ${required}`);
}
if (/gumroad|\d+[,.]\d+\s*€/.test(germanHero)) failures.push('de/index.html: hero contains a purchase link or price');

const workbook = fs.readFileSync(path.join(root, 'arbeitsbuch/index.html'), 'utf8');
for (const oldLabel of ['Audio-Begleitung', 'Audio kaufen', 'Bundle kaufen', 'Zur Audio-Begleitung']) {
  if (workbook.includes(oldLabel)) failures.push(`arbeitsbuch/index.html: old label ${oldLabel}`);
}
for (const required of ['Hörprogramm + Arbeitsbuch kaufen', 'Hörprogramm kaufen', 'href="/hoerprogramm/">Zum Hörprogramm']) {
  if (!workbook.includes(required)) failures.push(`arbeitsbuch/index.html: missing label ${required}`);
}

const completedArticles = [
  'weihnachten-mit-einem-alkoholkranken-familienmitglied',
  'co-abhaengigkeit-selbsttest',
  'funktionierender-alkoholiker',
  'partner-auf-trinken-ansprechen',
];
for (const slug of completedArticles) {
  const article = fs.readFileSync(path.join(root, `artikel/${slug}/index.html`), 'utf8');
  for (const required of ['assets/audio/de-sample.mp3', 'Gesprochen mit KI-Stimme.', 'class="author-box"', 's621-social-links', 'utm_source=blog&amp;utm_medium=artikel']) {
    if (!article.includes(required)) failures.push(`${slug}: missing article ending ${required}`);
  }
}
const christmas = fs.readFileSync(path.join(root, 'artikel/weihnachten-mit-einem-alkoholkranken-familienmitglied/index.html'), 'utf8');
if (!christmas.includes('utm_campaign=weihnachten')) failures.push('Christmas article: missing campaign parameter');

const tracking = fs.readFileSync(path.join(root, 'assets/site-tracking.js'), 'utf8');
if (!tracking.includes('zdwcno: 24.90') || !tracking.includes('sqlsa: 29.90')) failures.push('tracking scaffold: stale bundle prices');
if (!tracking.includes("const PIXEL_ID = 'META_PIXEL_ID'")) failures.push('tracking scaffold: placeholder Pixel ID was unexpectedly changed');

const germanFiles = files.filter(file => !file.startsWith('en\\') && !file.startsWith('hu\\') && file !== 'index.html' && !['impressum\\index.html', 'datenschutz\\index.html'].includes(file));
for (const file of germanFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (/href="\/audio\/">(?:Audio|Hörprogramm)<\/a>/.test(html)) failures.push(`${file}: legacy German audio navigation link`);
}
const scriptMatch = audioLanding.match(/<script>\(\(\)=>\{const q=new URLSearchParams[\s\S]*?<\/script>/);
if (!scriptMatch) failures.push('hoerprogramm/index.html: missing UTM forwarding script');
else {
  const links = [...audioLanding.matchAll(/<a[^>]+href="(https:\/\/[^\"]*gumroad\.com[^\"]*)"/g)].map(match => ({ href: match[1] }));
  const sandbox = {
    window: { location: { search: '?utm_source=meta&utm_campaign=test&ignored=value' } },
    document: { querySelectorAll: () => links },
    URL,
    URLSearchParams
  };
  vm.runInNewContext(scriptMatch[0].replace(/^<script>|<\/script>$/g, ''), sandbox);
  for (const link of links) {
    const url = new URL(link.href);
    if (url.searchParams.get('utm_source') !== 'meta' || url.searchParams.get('utm_campaign') !== 'test' || url.searchParams.has('ignored')) {
      failures.push('hoerprogramm/index.html: UTM forwarding behavior failed');
    }
  }
}

console.log(`HTML pages checked: ${files.length}`);
console.log(`Validation failures: ${failures.length}`);
for (const failure of failures) console.log(failure);
process.exitCode = failures.length ? 1 : 0;
