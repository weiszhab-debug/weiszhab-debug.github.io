import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, html) => fs.writeFileSync(path.join(root, rel), html, 'utf8');
const replace = (html, from, to, rel) => {
  if (!html.includes(from) && !html.includes(to)) throw new Error(`${rel}: expected text missing`);
  return html.replaceAll(from, to);
};

for (const rel of ['de/index.html', 'hoerprogramm/index.html']) {
  let html = read(rel);
  html = replace(
    html,
    'In Österreich und der Schweiz: 144. Alle Nummern auf der Soforthilfe-Seite.',
    'In Österreich und der Schweiz: 144. <a href="/soforthilfe/">Alle Nummern auf der Soforthilfe-Seite.</a>',
    rel
  );
  if (rel === 'hoerprogramm/index.html' && !html.includes('const utm=[')) {
    const script = `<script>(()=>{const q=new URLSearchParams(window.location.search);const utm=[...q].filter(([key])=>/^utm_/i.test(key));if(!utm.length)return;document.querySelectorAll('a[href*="gumroad.com"]').forEach(link=>{const url=new URL(link.href);utm.forEach(([key,value])=>url.searchParams.set(key,value));link.href=url.toString()})})();</script>`;
    html = html.replace('</body>', `${script}</body>`);
  }
  write(rel, html);
}

{
  const rel = 'fuer-angehoerige/index.html';
  let html = read(rel);
  const fixes = [
    ['Warum Sie das Trinken nicht kontrollieren können', 'Warum du das Trinken nicht kontrollieren kannst'],
    ['außerhalb Ihrer Macht liegt', 'außerhalb deiner Macht liegt'],
    ['Wann Sie sofort Hilfe holen sollten', 'Wann du sofort Hilfe holen solltest'],
    ['was du für deine eigene Sicherheit brauchen', 'was du für deine eigene Sicherheit brauchst'],
    ['versuchst, sich an eine unberechenbare Situation anzupassen', 'versuchst, dich an eine unberechenbare Situation anzupassen'],
    ['Du darfst Deine Sorge', 'Du darfst deine Sorge'],
    ['Du übernimmst Aufgaben, erklären Fehlzeiten, gleichen finanzielle Schäden aus oder verbergen die Situation', 'Du übernimmst Aufgaben, erklärst Fehlzeiten, gleichst finanzielle Schäden aus oder verbirgst die Situation'],
    ['Kontrolle bindet Deine Kraft', 'Kontrolle bindet deine Kraft'],
    ['Eine Grenze beschreibt Dein eigenes Handeln', 'Eine Grenze beschreibt dein eigenes Handeln'],
    ['Was werden du tust', 'Was wirst du tun'],
    ['die du tatsächlich umsetzen können', 'die du tatsächlich umsetzen kannst'],
    ['Wie du ein Gespräch beginnen können', 'Wie du ein Gespräch beginnen kannst'],
    ['was du erlebt haben', 'was du erlebt hast'],
    ['Vermeiden du das Gespräch', 'Vermeide das Gespräch'],
    ['Dein Ziel ist, Deine Beobachtung, Deine Sorge', 'Dein Ziel ist, deine Beobachtung, deine Sorge'],
    ['eine Beratung für sich selbst aufsuchen', 'eine Beratung für dich selbst aufsuchen'],
    ['Beenden du ein Gespräch', 'Beende ein Gespräch'],
    ['warten. deine nächsten Schritte', 'warten. Deine nächsten Schritte'],
    ['ständig Angst haben oder deinen Alltag nicht mehr bewältigen können', 'ständig Angst hast oder deinen Alltag nicht mehr bewältigen kannst'],
    ['Du brauchst verlässliche Erwachsene, klare Sicherheit und die Gewissheit, dass sie nicht schuld sind', 'Kinder brauchen verlässliche Erwachsene, klare Sicherheit und die Gewissheit, dass sie nicht schuld sind'],
    ['was du nicht garantieren können', 'was du nicht garantieren kannst'],
    ['innerhalb Ihrer Kontrolle liegt', 'innerhalb deiner Kontrolle liegt'],
    ['finden du Angebote', 'findest du Angebote'],
    ['Soforthilfe Deutschland öffnen', 'Soforthilfe öffnen']
  ];
  for (const [from, to] of fixes) html = replace(html, from, to, rel);
  write(rel, html);
}

{
  const rel = 'artikel/sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst/index.html';
  let html = read(rel);
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Du verlierst nicht nur ihn – sondern langsam auch dich selbst | 621 SOBER</title>');
  write(rel, html);
}

console.log('Applied the non-Pixel v3 PDF fixes.');
