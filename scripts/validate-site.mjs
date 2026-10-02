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
