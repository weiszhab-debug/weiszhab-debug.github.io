import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

function updateFile(file, replacements) {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [from, to] of replacements) after = after.replaceAll(from, to);
  if (after !== before) fs.writeFileSync(file, after);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) {
      updateFile(file, [
        ['112,90 €', '19,90 €'],
        ['212,90 €', '34,90 €'],
        [/(?<!\d)9,90 €/g, '12,90 €'],
        [/(?<!\d)24,90 €/g, '27,90 €'],
        [/(?<!\d)29,90 €/g, '34,90 €'],
        [/(?<!\d)8,79 €/g, '6,89 €'],
      ]);
    }
  }
}

walk(dist);

updateFile(path.join(dist, 'assets', 'site-tracking.js'), [
  ['qhzig: 9.90', 'qhzig: 12.90'],
  ['zdwcno: 24.90', 'zdwcno: 27.90'],
  ['sqlsa: 29.90', 'sqlsa: 34.90'],
]);

updateFile(path.join(root, 'scripts', 'build-audio-first-pages.mjs'), [
  ['112,90 €', '19,90 €'],
  ['212,90 €', '34,90 €'],
  [/(?<!\d)9,90 €/g, '12,90 €'],
  [/(?<!\d)24,90 €/g, '27,90 €'],
  [/(?<!\d)29,90 €/g, '34,90 €'],
  [/(?<!\d)8,79 €/g, '6,89 €'],
]);

updateFile(path.join(root, 'scripts', 'apply-2026-10-08-v5.mjs'), [
  ['qhzig: 9.90', 'qhzig: 12.90'],
  ['zdwcno: 24.90', 'zdwcno: 27.90'],
  ['sqlsa: 29.90', 'sqlsa: 34.90'],
]);

const fixes = path.join(root, 'scripts', 'apply-2026-10-02-fixes.mjs');
updateFile(fixes, [
  ["'$112,90 €'", "'$1' + '12,90 €'"],
  ["'$127,90 €'", "'$1' + '27,90 €'"],
  ["'$134,90 €'", "'$1' + '34,90 €'"],
  ['Zum Hörprogramm – 9,90 €', 'Zum Hörprogramm – 12,90 €'],
]);

console.log('Applied 2026-10-09 German pricing.');
