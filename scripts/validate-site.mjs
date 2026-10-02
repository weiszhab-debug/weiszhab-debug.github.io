import fs from 'node:fs';
import path from 'node:path';
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

console.log(`HTML pages checked: ${files.length}`);
console.log(`Validation failures: ${failures.length}`);
for (const failure of failures) console.log(failure);
process.exitCode = failures.length ? 1 : 0;
