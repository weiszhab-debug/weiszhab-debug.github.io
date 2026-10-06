import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, value) => fs.writeFileSync(path.join(root, rel), value, 'utf8');

const germanPages = [
  'de/index.html', 'fuer-angehoerige/index.html', 'arbeitsbuch/index.html',
  'audio/index.html', 'kostenlos/index.html', 'buch/index.html', 'faq/index.html',
  'soforthilfe/index.html', 'ueber-mich/index.html', 'artikel/index.html'
];
const articleRoot = path.join(root, 'artikel');
const articles = fs.readdirSync(articleRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(articleRoot, entry.name, 'index.html')))
  .map(entry => `artikel/${entry.name}/index.html`);

function replaceAllLiteral(text, pairs) {
  for (const [from, to] of pairs) text = text.split(from).join(to);
  return text;
}

function useDu(text) {
  const phrases = [
    ['Sie verlieren nicht nur ihn - sondern langsam auch sich selbst.', 'Du verlierst nicht nur ihn – sondern langsam auch dich selbst.'],
    ['Sie verlieren nicht nur ihn – sondern langsam auch sich selbst.', 'Du verlierst nicht nur ihn – sondern langsam auch dich selbst.'],
    ['Sie müssen', 'du musst'], ['Sie können', 'du kannst'], ['Sie dürfen', 'du darfst'],
    ['Sie brauchen', 'du brauchst'], ['Sie haben', 'du hast'], ['Sie möchten', 'du möchtest'],
    ['Sie wissen', 'du weißt'], ['Sie entscheiden', 'du entscheidest'], ['Sie erhalten', 'du erhältst'],
    ['Sie hören', 'du hörst'], ['Sie arbeiten', 'du arbeitest'], ['Sie beginnen', 'du beginnst'],
    ['Sie nehmen', 'du nimmst'], ['Sie prüfen', 'du prüfst'], ['Sie wählen', 'du wählst'],
    ['Sie bleiben', 'du bleibst'], ['Sie holen', 'du holst'], ['Sie rufen', 'du rufst'],
    ['Sie versuchen', 'du versuchst'], ['Sie führen', 'du führst'], ['Sie planen', 'du planst'],
    ['Sie sagen', 'du sagst'], ['Sie schreiben', 'du schreibst'], ['Sie nutzen', 'du nutzt'],
    ['Sie finden', 'du findest'], ['Sie sehen', 'du siehst'], ['Sie zeigen', 'du zeigst'],
    ['Sie geben', 'du gibst'], ['Sie kontrollieren', 'du kontrollierst'], ['Sie achten', 'du achtest'],
    ['Sie erzählen', 'du erzählst'], ['Sie formulieren', 'du formulierst'], ['Sie wenden', 'du wendest'],
    ['Sie tragen', 'du trägst'], ['Sie schützen', 'du schützt'], ['Sie schlafen', 'du schläfst'],
    ['Sie zweifeln', 'du zweifelst'], ['Sie übernehmen', 'du übernimmst'], ['Sie erklären', 'du erklärst'],
    ['Sie fragen', 'du fragst'], ['Sie lesen', 'du liest'], ['Sie fürchten', 'du fürchtest'],
    ['Sie bringen', 'du bringst'], ['Sie suchen', 'du suchst'], ['Sie steuern', 'du steuerst'],
    ['Sie versprechen', 'du versprichst'], ['Sie verlassen', 'du verlässt'], ['Sie vermeiden', 'du vermeidest'],
    ['Sie erkennen', 'du erkennst'], ['Sie zählen', 'du zählst'], ['Sie öffnen', 'du öffnest'],
    ['Sie beenden', 'du beendest'], ['Sie laden', 'du lädst'], ['Sie machen', 'du machst'],
    ['Sie fühlen', 'du fühlst'], ['Sie bezahlen', 'du bezahlst'], ['Sie kaufen', 'du kaufst'],
    ['Sie bekommen', 'du bekommst'], ['Sie setzen', 'du setzt'], ['Sie geraten', 'du gerätst'],
    ['wenn Sie sich', 'wenn du dich'], ['Wenn Sie sich', 'Wenn du dich'],
    ['wenn Sie', 'wenn du'], ['Wenn Sie', 'Wenn du'], ['dass Sie', 'dass du'],
    ['ob Sie', 'ob du'], ['weil Sie', 'weil du'], ['damit Sie', 'damit du'],
    ['während Sie', 'während du'], ['bevor Sie', 'bevor du'], ['bis Sie', 'bis du'],
    ['für Sie', 'für dich'], ['Für Sie', 'Für dich'], ['mit Ihnen', 'mit dir'],
    ['von Ihnen', 'von dir'], ['bei Ihnen', 'bei dir'], ['zu Ihnen', 'zu dir'],
    ['auf Sie', 'auf dich'], ['gegen Sie', 'gegen dich'], ['über Sie', 'über dich'],
    ['was Sie', 'was du'], ['Was Sie', 'Was du'], ['wie Sie', 'wie du'],
    ['Wie Sie', 'Wie du'], ['die Sie', 'die du'], ['der Sie', 'der du'],
    ['den Sie', 'den du'], ['dem Sie', 'dem du'], ['das Sie', 'das du'],
    ['und Sie', 'und du'], ['oder Sie', 'oder du'], ['Auch Sie', 'Auch du'],
    ['Nicht, weil Sie', 'Nicht, weil du'], ['Beginnen Sie', 'Beginne'], ['Achten Sie', 'Achte'],
    ['Beenden Sie', 'Beende'], ['Verlassen Sie', 'Verlasse'], ['Vermeiden Sie', 'Vermeide'],
    ['Wählen Sie', 'Wähle'], ['Notieren Sie', 'Notiere'], ['Formulieren Sie', 'Formuliere'],
    ['Besprechen Sie', 'Besprich'], ['Bestimmen Sie', 'Bestimme'], ['Bewahren Sie', 'Bewahre'],
    ['Bleiben Sie', 'Bleibe'], ['Erstellen Sie', 'Erstelle'], ['Erzählen Sie', 'Erzähle'],
    ['Fragen Sie', 'Frage'], ['Halten Sie', 'Halte'], ['Holen Sie', 'Hole'],
    ['Klären Sie', 'Kläre'], ['Nehmen Sie', 'Nimm'], ['Öffnen Sie', 'Öffne'],
    ['Planen Sie', 'Plane'], ['Prüfen Sie', 'Prüfe'], ['Reden Sie', 'Rede'],
    ['Sagen Sie', 'Sage'], ['Schreiben Sie', 'Schreibe'], ['Sorgen Sie', 'Sorge'],
    ['Sprechen Sie', 'Sprich'], ['Steuern Sie', 'Steuere'], ['Versprechen Sie', 'Versprich'],
    ['Versuchen Sie', 'Versuche'], ['Wiederholen Sie', 'Wiederhole'], ['Benennen Sie', 'Benenne'],
    ['Laden Sie', 'Lade'], ['Ordnen Sie', 'Ordne'], ['Folgen Sie', 'Folge'],
    ['Nutzen Sie', 'Nutze'], ['Unterbrechen Sie', 'Unterbrich'], ['Führen Sie', 'Führe'],
    ['Ihr eigenes', 'Dein eigenes'], ['Ihr nächster', 'Dein nächster'], ['Ihr Ziel', 'Dein Ziel'],
    ['Ihr Vertrauen', 'Dein Vertrauen'], ['Ihr Schweigen', 'Dein Schweigen'],
    ['Ihr Leben', 'Dein Leben'], ['Ihr Alltag', 'Dein Alltag'], ['Ihr Sicherheitsgefühl', 'Dein Sicherheitsgefühl'],
    ['Ihre Aufgabe', 'Deine Aufgabe'], ['Ihre Belastung', 'Deine Belastung'],
    ['Ihre Gesundheit', 'Deine Gesundheit'], ['Ihre Wahrnehmung', 'Deine Wahrnehmung'],
    ['Ihre Sorge', 'Deine Sorge'], ['Ihre Geschichte', 'Deine Geschichte'],
    ['Ihre Vorsicht', 'Deine Vorsicht'], ['Ihre Notizen', 'Deine Notizen'],
    ['Ihre Beobachtung', 'Deine Beobachtung'], ['Ihre Beobachtungen', 'Deine Beobachtungen'],
    ['Ihre Grenzen', 'Deine Grenzen'], ['Ihre Grenze', 'Deine Grenze'],
    ['Ihre Sicherheit', 'Deine Sicherheit'], ['Ihre Beziehungen', 'Deine Beziehungen'],
    ['Ihre Antworten', 'Deine Antworten'], ['Ihre eigene', 'Deine eigene'],
    ['Ihre eigenen', 'Deine eigenen'], ['Ihre konkrete', 'Deine konkrete'],
    ['Ihre weitere', 'Deine weitere'], ['Ihre Kraft', 'Deine Kraft'],
    ['Ihren Alltag', 'deinen Alltag'], ['Ihren Körper', 'deinen Körper'],
    ['Ihren nächsten', 'deinen nächsten'], ['Ihren eigenen', 'deinen eigenen'],
    ['Ihrem eigenen', 'deinem eigenen'], ['Ihres eigenen', 'deines eigenen'],
    ['Ihnen hilft', 'dir hilft'], ['Ihnen das', 'dir das'], ['Ihnen die', 'dir die'],
    ['Ihnen bekannt', 'dir bekannt'], ['Ihnen macht', 'dir macht'], ['Ihnen gehört', 'dir gehört']
  ];
  text = replaceAllLiteral(text, phrases);
  text = text.replace(/\bIhre\b/g, 'deine').replace(/\bIhr\b/g, 'dein')
    .replace(/\bIhren\b/g, 'deinen').replace(/\bIhrem\b/g, 'deinem')
    .replace(/\bIhres\b/g, 'deines').replace(/\bIhnen\b/g, 'dir');
  text = text.replace(/([.!?]\s*|>)(du)\b/g, (_, prefix) => `${prefix}Du`);
  text = replaceAllLiteral(text, [
    ['So beginnen Sie', 'So beginnst du'], ['Laden du', 'Lade'], ['sehen Sie es', 'sieh es'],
    ['Vielleicht haben Sie', 'Vielleicht hast du'], ['Vielleicht wissen Sie', 'Vielleicht weißt du'],
    ['Vielleicht hören Sie', 'Vielleicht hörst du'], ['Vielleicht möchten Sie', 'Vielleicht möchtest du'],
    ['Vielleicht suchen Sie', 'Vielleicht suchst du'], ['Vielleicht zählen Sie', 'Vielleicht zählst du'],
    ['Am Ende wählen Sie', 'Am Ende wählst du'], ['Was brauchen Sie', 'Was brauchst du'],
    ['rufen Sie die Polizei', 'ruf die Polizei'], ['wählen Sie 112', 'wähle 112'],
    ['wählen Sie lieber 112', 'wähle lieber 112'], ['benötigen Sie sofort', 'brauchst du sofort'],
    ['können Sie 110 wählen', 'kannst du 110 wählen'], ['versuchen Sie,', 'versuchst du,'],
    ['nutzen Sie bitte', 'nutze bitte'], ['holen Sie professionelle Hilfe', 'hole professionelle Hilfe'],
    ['holen Sie sofort Hilfe', 'hole sofort Hilfe'], ['folgen Sie den Anweisungen', 'folge den Anweisungen'],
    ['warum Sie das Thema', 'warum du das Thema'], ['Dann müssen Sie', 'Dann musst du'],
    ['dürfen Sie schon heute', 'darfst du schon heute'], ['geschieht, Sie betrifft', 'geschieht, dich betrifft'],
    ['welche Unterstützung Sie', 'welche Unterstützung du'], ['welche Grenze Sie', 'welche Grenze du'],
    ['als Sie sich sicher fühlen', 'als du dich sicher fühlst'], ['können Sie auch allein', 'kannst du auch allein'],
    ['wen Sie anrufen', 'wen du anrufst'], ['Vielleicht sind Sie müde', 'Vielleicht bist du müde'],
    ['mit denen Sie', 'mit denen du'], ['tragen Sie 0 € ein', 'trägst du 0 € ein'],
    ['benötigen Sie lediglich', 'brauchst du lediglich'], ['woran Sie eine gefährliche Situation erkennen', 'woran du eine gefährliche Situation erkennst'],
    ['Immer häufiger denken Sie', 'Immer häufiger denkst du'], ['Nach Abschluss erhalten Sie', 'Nach Abschluss erhältst du'],
    ['Nach dem Kauf erhalten Sie', 'Nach dem Kauf erhältst du'], ['Nimm sich', 'Nimm dir'],
    ['unterbrechen Sie eine Übung', 'unterbrich eine Übung'], ['wenn sie Sie stark belastet', 'wenn sie dich stark belastet'],
    ['Wenn eine Übung Sie stark belastet', 'Wenn eine Übung dich stark belastet'],
    ['wenn du gerade nicht wissen', 'wenn du gerade nicht weißt'], ['Sie bedeuten nicht, dass du', 'Sie bedeuten nicht, dass du'],
    ['Sie beschreibt, was Sie', 'Sie beschreibt, was du'], ['Sie ist keine Drohung und kein Satz, den du selbst nicht einhalten können', 'Sie ist keine Drohung und kein Satz, den du selbst nicht einhalten kannst'],
    ['Sie sagt nur klar, was du nicht länger tragen, erklären oder verbergen werden', 'Sie sagt nur klar, was du nicht länger tragen, erklären oder verbergen wirst'],
    ['Sie könnten zum Beispiel entscheiden', 'Du könntest zum Beispiel entscheiden'],
    ['Sie misstrauen den eigenen Gefühlen', 'Du misstraust deinen eigenen Gefühlen'],
    ['Sie sind nicht zu empfindlich', 'Du bist nicht zu empfindlich'],
    ['dass auch Sie bereits', 'dass auch du bereits'], ['fragen Sie sich', 'fragst du dich'],
    ['bringen Sie sich', 'bring dich'], ['und rufen Sie die Polizei', 'und ruf die Polizei'],
    ['Vereinbaren Sie', 'Vereinbare'], ['und holen Sie Unterstützung', 'und hole Unterstützung'],
    ['und beginnen Sie dort, wo Sie sich wiedererkennen', 'und beginne dort, wo du dich wiedererkennst'],
    ['Welchen einen ehrlichen Satz könnten Sie', 'Welchen einen ehrlichen Satz könntest du'],
    ['Sie bilden sich das nicht ein', 'Du bildest dir das nicht ein'],
    ['Wenn du Angst vor der Reaktion haben, setzen Sie die Grenze nicht allein durch', 'Wenn du Angst vor der Reaktion hast, setze die Grenze nicht allein durch'],
    ['Wenn du eine Eskalation befürchten, führen Sie das Gespräch nicht allein und nicht an einem Ort, von dem du nicht wegkommen', 'Wenn du eine Eskalation befürchtest, führe das Gespräch nicht allein und nicht an einem Ort, von dem du nicht wegkommst'],
    ['Wenn du meine weitere Arbeit freiwillig unterstützen möchten, können Sie', 'Wenn du meine weitere Arbeit freiwillig unterstützen möchtest, kannst du'],
    ['Wenn jedes Gespräch verweigert wird, müssen Sie', 'Wenn jedes Gespräch verweigert wird, musst du'],
    ['Zuerst erhalten Sie', 'Zuerst erhältst du'], ['unterbrechen Sie die Arbeit und holen Sie Unterstützung', 'unterbrich die Arbeit und hole Unterstützung'],
    ['Sie wollen den Menschen nicht fallen lassen', 'Du willst den Menschen nicht fallen lassen'],
    ['Sie müssen nicht allein bleiben', 'Du musst nicht allein bleiben'],
    ['du beobachten', 'du beobachtest'], ['du annehmen', 'du annimmst'], ['du einhalten', 'du einhältst'],
    ['du übertreiben', 'du übertreibst'], ['du brauchen', 'du brauchst'], ['du beginnen', 'du beginnst'],
    ['du erkennen', 'du erkennst'], ['du verändern', 'du veränderst'], ['du bekommen', 'du bekommst'],
    ['du helfen', 'du hilfst'], ['du wissen', 'du weißt'], ['du möchten', 'du möchtest'],
    ['du haben', 'du hast'], ['du können', 'du kannst'], ['du dürfen', 'du darfst'],
    ['du müssen', 'du musst'], ['du werden', 'du wirst'], ['du stellen', 'du stellst'],
    ['du tragen', 'du trägst'], ['du tun', 'du tust'], ['du lieben', 'du liebst'],
    ['du gehen', 'du gehst'], ['du sprechen', 'du sprichst'], ['du sehen', 'du siehst'],
    ['du lesen', 'du liest'], ['du zeigen', 'du zeigst'], ['du entscheiden', 'du entscheidest'],
    ['du verwenden', 'du verwendest'], ['du ausfüllen', 'du ausfüllst'], ['du zurückkehren', 'du zurückkehrst'],
    ['du bekommen', 'du bekommst'], ['du wollen', 'du willst'], ['du sollen', 'du sollst'],
    ['Deine Belastung', 'deine Belastung'], ['obwohl Sie ahnten', 'obwohl du ahntest'],
    ['wählen Sie 112', 'wähle 112'], ['unterbrechen Sie die Arbeit', 'unterbrich die Arbeit'],
    ['wenn sie Sie zu stark belastet', 'wenn sie dich zu stark belastet'],
    ['wohin Sie gehen können', 'wohin du gehen kannst'], ['was Sie in einer bestimmten Situation tun werden', 'was du in einer bestimmten Situation tun wirst'],
    ['was Sie tun oder nicht mehr tun werden', 'was du tun oder nicht mehr tun wirst'],
    ['und planen Sie einen sicheren Ort', 'und plane einen sicheren Ort'],
    ['dass du den anderen weniger lieben', 'dass du den anderen weniger liebst'],
    ['warum du das Thema gerade jetzt ansprechen', 'warum du das Thema gerade jetzt ansprichst'],
    ['wenn du die Situation als lebensbedrohlich einschätzen', 'wenn du die Situation als lebensbedrohlich einschätzt'],
    ['was du eigentlich wissen', 'was du eigentlich wissen möchtest'], ['du für Deine eigene Sicherheit', 'du für deine eigene Sicherheit'],
    ['wenn du gerade nicht wissen', 'wenn du gerade nicht weißt'], ['könntest du heute für sich aufschreiben', 'könntest du heute für dich aufschreiben'],
    ['welche Unterstützung du in welchem Tempo annehmen', 'welche Unterstützung du in welchem Tempo annimmst'],
    ['du kannst sich beraten', 'du kannst dich beraten'], ['dass du kaum noch zur Ruhe kommen', 'dass du kaum noch zur Ruhe kommst'],
    ['wenn du merken', 'wenn du merkst'], ['dass du seit längerer Zeit versuchen', 'dass du seit längerer Zeit versuchst'],
    ['ob du selbst auch Fehler machen', 'ob du selbst auch Fehler machst'],
    ['was du selbst künftig tun werden', 'was du selbst künftig tun wirst'],
    ['dass du sich selbst ernst nehmen', 'dass du dich selbst ernst nimmst'],
    ['was du heute wirklich wissen', 'was du heute wirklich weißt'], ['was du wirklich beobachten', 'was du wirklich beobachtest'],
    ['was du selbst brauchen', 'was du selbst brauchst'], ['wählen Sie', 'wähle'],
    ['Warum Sie das Trinken nicht kontrollieren können', 'Warum du das Trinken nicht kontrollieren kannst'],
    ['außerhalb Ihrer Macht liegt', 'außerhalb deiner Macht liegt'],
    ['Wann Sie sofort Hilfe holen sollten', 'Wann du sofort Hilfe holen solltest'],
    ['was du für deine eigene Sicherheit brauchen', 'was du für deine eigene Sicherheit brauchst'],
    ['versuchst, sich an eine unberechenbare Situation anzupassen', 'versuchst, dich an eine unberechenbare Situation anzupassen'],
    ['Du darfst Deine Sorge', 'Du darfst deine Sorge'],
    ['Du übernimmst Aufgaben, erklären Fehlzeiten, gleichen finanzielle Schäden aus oder verbergen die Situation', 'Du übernimmst Aufgaben, erklärst Fehlzeiten, gleichst finanzielle Schäden aus oder verbirgst die Situation'],
    ['bei Ihrer Erfahrung zu bleiben', 'bei deiner Erfahrung zu bleiben'],
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
  ]);
  return text;
}

for (const rel of [...germanPages, ...articles]) write(rel, useDu(read(rel)));

// Correct German product formats and prices without changing any product URL.
{
  const rel = 'arbeitsbuch/index.html';
  let html = read(rel);
  html = html.replace('Das vollständige Arbeitsbuch in Druckversion, Handyversion und EPUB.', 'Druckversion (A4-PDF, 79 Seiten), Handyversion (PDF) und EPUB');
  html = html.replace(/(<span class="kicker">Audio-Begleitung<\/span><div class="price">)19,90 €/, '$19,90 €');
  html = html.replace(/(<span class="kicker">Arbeitsbuch \+ Audio<\/span><div class="price">)29,90 €/, '$124,90 €');
  html = html.replace(/(<span class="kicker">Komplettpaket<\/span><div class="price">)34,90 €/, '$129,90 €');
  write(rel, html);
}

// Expand urgent-help coverage to Germany, Austria and Switzerland.
{
  const rel = 'soforthilfe/index.html';
  let html = read(rel)
    .replaceAll('Soforthilfe Deutschland', 'Soforthilfe Deutschland, Österreich, Schweiz');
  html = html.replace(/<h1>[\s\S]*?<\/h1>/, '<h1>Soforthilfe Deutschland, Österreich, Schweiz</h1>');
  const block = `<section class="support-grid"><article class="prose"><h2>Österreich</h2><ul><li><strong>144</strong> Rettung</li><li><strong>133</strong> Polizei</li><li><strong>142</strong> TelefonSeelsorge (rund um die Uhr, kostenlos)</li><li><strong>112</strong> Euro-Notruf</li></ul><h2>Schweiz</h2><ul><li><strong>144</strong> Sanität / Rettungsdienst</li><li><strong>117</strong> Polizei</li><li><strong>143</strong> Die Dargebotene Hand (rund um die Uhr)</li><li><strong>112</strong> Euro-Notruf</li></ul></article></section>`;
  if (!html.includes('Die Dargebotene Hand')) html = html.replace('</main>', `${block}</main>`);
  write(rel, html);
}

// FAQ language availability, purchase answers and A4 wording.
{
  const rel = 'faq/index.html';
  let html = read(rel);
  html = html.replace(/Diese Website und die hier beschriebenen Ausgaben sind deutschsprachig\.[\s\S]*?gewünschte Ausgabe erhalten\./, 'Die Website gibt es auf Deutsch, Englisch und Ungarisch. Das Hörprogramm ist derzeit auf Deutsch erhältlich.');
  html = html.replace('Die deutsche Ausgabe liegt als A4-PDF vor', 'Die deutsche Ausgabe liegt als A4-PDF mit 79 Seiten vor');
  const additions = `<details><summary>Ist die Stimme echt?</summary><p>Die Audios werden mit einer KI-Stimme gesprochen. Text, Geschichten und Erfahrung stammen von Steven H. White, der selbst fast zwanzig Jahre getrunken hat und seit über zehn Jahren trocken ist.</p></details><details><summary>Gibt es ein Abo oder eine E-Mail-Serie?</summary><p>Nein. Du kaufst einmal und bekommst sofort Zugang. Gumroad schickt dir nur die Kaufbestätigung mit dem Download-Link.</p></details><details><summary>Kann ich zuerst hineinhören?</summary><p>Ja. Den ersten Teil kannst du kostenlos und ohne E-Mail-Adresse auf der Seite des Hörprogramms anhören.</p></details>`;
  if (!html.includes('Ist die Stimme echt?')) html = html.replace('</article>', `${additions}</article>`);
  write(rel, html);
}

// Transparent author and AI disclosures.
{
  const rel = 'ueber-mich/index.html';
  let html = read(rel);
  const disclosure = `<h2>Sprache und KI</h2><p>Ganz offen: Ich bin Ungar und kein deutscher Muttersprachler. Meine deutschen Texte entstehen mit Hilfe von KI-Übersetzung, die Audios werden mit einer KI-Stimme gesprochen. Die Geschichten, die Übungen und die Erfahrung dahinter sind meine eigenen. Alkohol spricht jede Sprache.</p>`;
  if (!html.includes('Ganz offen: Ich bin Ungar')) html = html.replace('</article>', `${disclosure}</article>`);
  if (!html.includes('SOCIAL LINKS: URL-ek pótlandók')) html = html.replace('</footer>', '<!-- SOCIAL LINKS: URL-ek pótlandók --></footer>');
  write(rel, html);
}

// Replace every German article's closing promotion with the requested sample and author blocks.
const articleAuthor = `<section class="author-box"><h2>Steven H. White</h2><p>Fast zwanzig Jahre habe ich getrunken. Seit über zehn Jahren bin ich trocken. Ich schreibe für die Menschen, die das alles miterleben.</p><p><strong>Ich bin kein Muttersprachler. Aber Alkohol spricht jede Sprache.</strong></p><p><a href="/ueber-mich/">Meine Geschichte →</a></p></section>`;
const articleCta = `<section class="next"><div class="wrap next-box"><div><div class="eyebrow">Erst reinhören – kostenlos</div><h2>Hör dir den ersten Teil an.</h2><p>Ohne E-Mail-Adresse, ohne Anmeldung.</p><audio controls preload="none" style="display:block;width:min(100%,620px);margin:20px 0"><source src="/assets/audio/de-sample.mp3" type="audio/mpeg"></audio><p class="meta">Gesprochen mit KI-Stimme. Text und Geschichte: Steven H. White.</p><p><a class="all-link" href="/kostenlos/">Lieber lesen? Kostenloses Einstiegsheft (PDF)</a></p></div><div><a class="button" href="/hoerprogramm/?utm_source=blog&amp;utm_medium=artikel">Zum Hörprogramm – 9,90 €</a><p style="margin-top:18px"><a href="/soforthilfe/">Bei unmittelbarer Gefahr: Soforthilfe</a></p></div></div></section>`;
for (const rel of articles) {
  let html = read(rel);
  if (!html.includes('Fast zwanzig Jahre habe ich getrunken.')) html = html.replace('</article>', `${articleAuthor}</article>`);
  html = html.replace(/<section class="next">[\s\S]*?<\/section>/, articleCta);
  write(rel, html);
}

{
  const rel = 'artikel/sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst/index.html';
  let html = read(rel);
  html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Du verlierst nicht nur ihn – sondern langsam auch dich selbst | 621 SOBER</title>');
  write(rel, html);
}

// Hungarian metadata and grammar correction.
for (const file of fs.readdirSync(root, { recursive: true }).filter(name => name.endsWith('.html'))) {
  const rel = String(file).replaceAll('\\', '/');
  let html = read(rel).replaceAll('az ügyelet a 1830-as számon', 'az ügyelet az 1830-as számon');
  if (rel === 'hu/index.html') html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Útmutatás alkoholproblémával érintett családoknak | 621 SOBER</title>');
  write(rel, html);
}

// Ensure every static HTML page has a www canonical.
const htmlFiles = fs.readdirSync(root, { recursive: true }).filter(name => name.endsWith('.html'));
for (const file of htmlFiles) {
  const rel = String(file).replaceAll('\\', '/');
  let html = read(rel);
  const aliases = {'en/index.html':'/','audio/index.html':'/hoerprogramm/','en/audio/index.html':'/audio-program/','hu/hanganyag/index.html':'/hanganyag/'};
  const route = aliases[rel] ?? (rel === 'index.html' ? '/' : `/${rel.replace(/index\.html$/, '')}`);
  const canonical = `<link rel="canonical" href="https://www.621sober.com${route}">`;
  if (/<link rel="canonical"[^>]*>/i.test(html)) html = html.replace(/<link rel="canonical"[^>]*>/i, canonical);
  else html = html.replace('</title>', `</title>${canonical}`);
  write(rel, html);
}

const routes = htmlFiles.map(file => {
  const rel = String(file).replaceAll('\\', '/');
  return rel === 'index.html' ? '/' : `/${rel.replace(/index\.html$/, '')}`;
}).sort();
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>https://www.621sober.com${route}</loc></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', 'User-agent: *\nAllow: /\nSitemap: https://www.621sober.com/sitemap.xml\n');

console.log(`Applied 2026-10-02 fixes to ${htmlFiles.length} HTML pages and ${articles.length} German articles.`);
