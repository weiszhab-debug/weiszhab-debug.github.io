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

const landing = fs.readFileSync(path.join(root, 'hoerprogramm', 'index.html'), 'utf8');
const utmScript = landing.match(/<script>(\(\(\)=>\{const q=new URLSearchParams[\s\S]*?\}\)\(\);)<\/script>/)?.[1];
if (!utmScript) {
  failures.push('hoerprogramm/index.html: missing UTM forwarding script');
} else {
  const gumroadLink = { href: 'https://weiszhabster.gumroad.com/l/qhzig' };
  vm.runInNewContext(utmScript, {
    URL, URLSearchParams,
    window: { location: { search: '?utm_source=meta&utm_campaign=test&ignored=value' } },
    document: { querySelectorAll: () => [gumroadLink] }
  });
  const forwarded = new URL(gumroadLink.href);
  if (forwarded.searchParams.get('utm_source') !== 'meta' || forwarded.searchParams.get('utm_campaign') !== 'test') failures.push('UTM forwarding did not preserve campaign parameters');
  if (forwarded.searchParams.has('ignored')) failures.push('UTM forwarding copied a non-UTM parameter');
}

const families = fs.readFileSync(path.join(root, 'fuer-angehoerige', 'index.html'), 'utf8');
for (const oldText of ['Warum Sie das Trinken nicht kontrollieren können', 'außerhalb Ihrer Macht liegt', 'Wann Sie sofort Hilfe holen sollten']) {
  if (families.includes(oldText)) failures.push(`fuer-angehoerige/index.html: formal wording remains: ${oldText}`);
}

const articleTitle = fs.readFileSync(path.join(root, 'artikel', 'sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst', 'index.html'), 'utf8');
if (!articleTitle.includes('<title>Du verlierst nicht nur ihn – sondern langsam auch dich selbst | 621 SOBER</title>')) failures.push('German article title is not in du form');

console.log(`HTML pages checked: ${files.length}`);
console.log(`Validation failures: ${failures.length}`);
for (const failure of failures) console.log(failure);
process.exitCode = failures.length ? 1 : 0;
