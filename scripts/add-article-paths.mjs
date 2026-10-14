import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

const articles = [
  {
    hu: ["mukodo-alkoholista", "A „működő” alkoholista: amikor kívülről minden rendben van"],
    de: ["funktionierender-alkoholiker", "Der funktionierende Alkoholiker: Wenn nach außen alles normal wirkt"],
    en: ["functioning-alcoholic", "The Functioning Alcoholic: When Everything Looks Fine from the Outside"],
  },
  {
    hu: ["hogyan-beszeljek-a-parommal-az-ivasarol", "Hogyan beszéljek a párommal az ivásáról?"],
    de: ["partner-auf-trinken-ansprechen", "Wie spreche ich meinen Partner auf sein Trinken an?"],
    en: ["how-to-talk-to-your-partner-about-drinking", "How Do I Talk to My Partner About Their Drinking?"],
  },
  {
    hu: ["tarsfuggoseg-onteszt", "Társfüggő vagyok? Önteszt alkoholisták hozzátartozóinak"],
    de: ["co-abhaengigkeit-selbsttest", "Bin ich co-abhängig? Ein Selbsttest für Angehörige von Alkoholikern"],
    en: ["codependency-self-test", "Am I Codependent? A Self-Test for Families of Alcoholics"],
  },
  {
    hu: ["karacsony-alkoholista-csaladtaggal", "Karácsony alkoholista családtaggal: hogyan éld túl az ünnepeket?"],
    de: ["weihnachten-mit-einem-alkoholkranken-familienmitglied", "Weihnachten mit einem Alkoholiker: So überstehst du die Feiertage"],
    en: ["christmas-with-an-alcoholic-family-member", "Christmas with an Alcoholic: How to Get Through the Holidays"],
  },
  {
    hu: ["mar-megint-rola-szol-minden", "Már megint róla szól minden?"],
    de: ["warum-dreht-sich-immer-alles-um-ihn", "Warum dreht sich immer alles um ihn?"],
    en: ["why-is-it-always-about-them", "Why Is It Always About Them?"],
  },
  {
    hu: ["alkoholista-a-parom", "Alkoholista a párom, vagy csak beképzelem?"],
    de: ["ist-mein-partner-alkoholiker", "Ist mein Partner Alkoholiker – oder bilde ich mir das nur ein?"],
    en: ["is-my-partner-an-alcoholic", "Is My Partner an Alcoholic – or Am I Imagining It?"],
  },
  {
    hu: ["az-ejszaka-amikor-mindketten-sirtunk", "Az éjszaka, amikor mindketten sírtunk"],
    de: ["die-nacht-in-der-wir-beide-weinten", "Die Nacht, in der wir beide weinten"],
    en: ["the-night-we-both-cried", "The night we both cried"],
  },
  {
    hu: ["a-nap-amikor-senki-nem-mentett-meg", "A nap, amikor senki nem mentett meg"],
    de: ["der-tag-an-dem-niemand-mich-mehr-rettete", "Der Tag, an dem niemand mich mehr rettete"],
    en: ["the-day-no-one-rescued-me", "The day no one rescued me"],
  },
  {
    hu: ["amikor-az-ivas-abbamarad-a-bizalom-lassabban-epul", "Az ivás abbamarad. A bizalom lassabban épül."],
    de: ["das-trinken-hoert-auf-vertrauen-braucht-laenger", "Das Trinken hört auf. Vertrauen braucht länger."],
    en: ["drinking-stops-trust-takes-longer", "The drinking stops. Trust takes longer."],
  },
  {
    hu: ["a-csend-is-tud-kiabalni", "A csend is tud kiabálni"],
    de: ["auch-die-stille-kann-schreien", "Auch die Stille kann schreien"],
    en: ["silence-can-scream-too", "Silence can scream, too"],
  },
  {
    hu: ["alkoholproblemak-a-csaladban-segiteni-megmentes-nelkul", "Alkoholprobléma a családban: hogyan segíts anélkül, hogy megmentővé válnál?"],
    de: ["alkoholproblem-in-der-familie-helfen-ohne-zu-retten", "Alkoholproblem in der Familie: Helfen, ohne zu retten"],
    en: ["when-helping-becomes-rescuing", "When helping becomes rescuing"],
  },
  {
    hu: ["nem-csak-ot-veszited-el-lassan-onmagadat-is", "Nemcsak őt veszíted el – lassan önmagadat is"],
    de: ["sie-verlieren-nicht-nur-ihn-sondern-langsam-auch-sich-selbst", "Du verlierst nicht nur ihn – sondern langsam auch dich selbst."],
    en: ["you-dont-only-lose-them-you-lose-yourself", "You do not only lose them—you slowly lose yourself"],
  },
];

const related = [
  [5, 2], [5, 10], [11, 10], [10, 1], [11, 5], [0, 1],
  [9, 7], [10, 6], [9, 6], [1, 8], [11, 2], [2, 10],
];

const locale = {
  hu: {
    dir: "hu/cikkek", base: "/hu/cikkek/",
    overline: "Olvass tovább", heading: "Kapcsolódó cikkek", cardLabel: "Kapcsolódó olvasmány", read: "Elolvasom →",
    next: "Egy következő lépés",
    workbook: ["Ha szeretnéd rendezni, mi történik benned", "A 621 SOBER munkafüzet kérdésekkel, gyakorlatokkal és egy személyes 30 napos tervvel segít visszatalálni a saját határaidhoz.", "/hu/munkafuzet/", "Megnézem a munkafüzetet"],
    book: ["Ha szeretnéd megismerni a teljes történetet", "A 6 + 2 + 1 = 10 őszinte történet függőségről, mélypontról, felépülésről és a családi bizalom lassú újjáépítéséről.", "/hu/konyv/", "Megnézem a könyvet"],
  },
  de: {
    dir: "artikel", base: "/artikel/",
    overline: "Weiterlesen", heading: "Passende Artikel", cardLabel: "Passender Artikel", read: "Artikel lesen →",
    next: "Ein nächster Schritt",
    workbook: ["Wenn du deine nächsten Schritte sortieren möchtest", "Das 621 SOBER Arbeitsbuch hilft dir mit Fragen, Übungen und einem persönlichen 30-Tage-Plan, deine eigenen Grenzen wieder klarer zu sehen.", "/arbeitsbuch/", "Arbeitsbuch ansehen"],
    book: ["Wenn du die ganze Geschichte lesen möchtest", "6 + 2 + 1 = 10 erzählt ehrlich von Sucht, Tiefpunkt, Genesung und dem langsamen Wiederaufbau von Vertrauen in der Familie.", "/buch/", "Buch ansehen"],
    audio: ["Wenn du lieber zuhörst", "Das 621 SOBER Hörprogramm begleitet dich in 19 ruhigen Audios dabei, Muster zu verstehen, Grenzen zu schützen und einen nächsten Schritt zu wählen.", "/hoerprogramm/", "Hörprogramm ansehen"],
  },
  en: {
    dir: "en/articles", base: "/en/articles/",
    overline: "Keep reading", heading: "Related articles", cardLabel: "Related article", read: "Read the article →",
    next: "A next step",
    workbook: ["If you want to make sense of your next steps", "The 621 SOBER workbook uses questions, exercises, and a personal 30-day plan to help you reconnect with your own boundaries.", "/en/workbook/", "Explore the workbook"],
    book: ["If you want to read the full story", "6 + 2 + 1 = 10 is an honest account of addiction, rock bottom, recovery, and the slow rebuilding of trust within a family.", "/en/book/", "Explore the book"],
  },
};

const bookArticles = new Set([6, 7, 8]);

for (const [lang, copy] of Object.entries(locale)) {
  for (let index = 0; index < articles.length; index += 1) {
    const [slug] = articles[index][lang];
    const file = path.join(root, "dist", copy.dir, slug, "index.html");
    let html = fs.readFileSync(file, "utf8");
    if (html.includes('class="article-paths"')) continue;

    const cards = related[index].map((targetIndex) => {
      const [targetSlug, targetTitle] = articles[targetIndex][lang];
      return `<a class="related-card" href="${copy.base}${targetSlug}/"><span>${copy.cardLabel}</span><strong>${targetTitle}</strong><b>${copy.read}</b></a>`;
    }).join("");

    let productType = bookArticles.has(index) ? "book" : "workbook";
    if (lang === "de" && index === 1) productType = "audio";
    const [productTitle, productText, productHref, productLink] = copy[productType];
    const section = `<section class="article-paths" aria-label="${copy.heading}"><div class="wrap"><p class="eyebrow">${copy.overline}</p><div class="article-paths-grid"><div class="related-reading"><h2>${copy.heading}</h2><div class="related-cards">${cards}</div></div><aside class="article-product"><p class="eyebrow">${copy.next}</p><h2>${productTitle}</h2><p>${productText}</p><a class="article-product-link" href="${productHref}">${productLink} →</a></aside></div></div></section>`;

    const markerIndex = html.lastIndexOf("</main>");
    if (markerIndex < 0) throw new Error(`Missing article ending in ${file}`);
    html = `${html.slice(0, markerIndex)}${section}${html.slice(markerIndex)}`;
    fs.writeFileSync(file, html);
  }
}

const homeLinks = [
  ["hu/index.html", "Előbb olvasnék – megnézem a cikkeket", "/hu/cikkek/"],
  ["de/index.html", "Erst lesen – zu den Artikeln", "/artikel/"],
  ["index.html", "I’d rather read first – browse the articles", "/en/articles/"],
];

for (const [relative, label, href] of homeLinks) {
  const file = path.join(root, "dist", relative);
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('class="af-reading-link"')) continue;
  const heroEnd = html.indexOf('</div><aside class="af-hero-card">');
  if (heroEnd < 0) throw new Error(`Missing hero in ${file}`);
  html = `${html.slice(0, heroEnd)}<p class="af-reading-link"><a href="${href}">${label} →</a></p>${html.slice(heroEnd)}`;
  fs.writeFileSync(file, html);
}

const articleCss = `
.article-paths{padding:clamp(58px,8vw,92px) 0;background:var(--blog-paper);border-top:1px solid var(--blog-line)}
.article-paths>.wrap>.eyebrow{margin-bottom:14px}
.article-paths-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(300px,.85fr);gap:clamp(22px,4vw,44px);align-items:stretch}
.related-reading h2,.article-product h2{margin:0 0 20px;font-size:clamp(1.65rem,3vw,2.45rem);line-height:1.08}
.related-cards{display:grid;gap:14px}
.related-card{display:grid;gap:9px;padding:20px 22px;border:1px solid var(--blog-line);border-radius:18px;background:#fff;color:var(--blog-ink);text-decoration:none;box-shadow:0 12px 28px rgba(23,61,71,.06);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}
.related-card:hover,.related-card:focus-visible{transform:translateY(-2px);border-color:var(--blog-blue);box-shadow:0 16px 34px rgba(23,61,71,.1)}
.related-card span{font-size:.72rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--blog-blue)}
.related-card strong{font:700 clamp(1.08rem,2vw,1.3rem)/1.25 var(--serif)}
.related-card b{font-size:.88rem;color:var(--blog-ink)}
.article-product{display:flex;flex-direction:column;justify-content:center;padding:clamp(26px,4vw,42px);border-radius:24px;background:var(--blog-ink);color:#fff;box-shadow:0 20px 42px rgba(23,61,71,.15)}
.article-product .eyebrow{color:var(--blog-sun)}
.article-product p{color:#dce9eb;line-height:1.65}
.article-product-link{align-self:flex-start;margin-top:10px;padding:13px 18px;border-radius:999px;background:var(--blog-sun);color:var(--blog-ink);font-weight:900;text-decoration:none}
.article-product-link:hover,.article-product-link:focus-visible{filter:brightness(.96);transform:translateY(-1px)}
@media(max-width:850px){.article-paths-grid{grid-template-columns:1fr}.article-product{margin-top:4px}}
@media(max-width:560px){.article-paths{padding:50px 0}.related-card{padding:18px}.article-product{padding:26px 22px}.article-product-link{width:100%;text-align:center}}
`;

for (const relative of ["dist/hu/assets/blog.css", "dist/en/assets/blog.css"]) {
  const file = path.join(root, relative);
  let css = fs.readFileSync(file, "utf8");
  if (!css.includes(".article-paths{")) {
    css += articleCss;
    fs.writeFileSync(file, css);
  }
}

const homeCssFile = path.join(root, "dist/assets/audio-first.css");
let homeCss = fs.readFileSync(homeCssFile, "utf8");
if (!homeCss.includes(".af-reading-link{")) {
  homeCss += `
.af-reading-link{margin:1.1rem 0 0}
.af-reading-link a{display:inline-flex;align-items:center;gap:.35rem;color:var(--af-ink);font-size:.94rem;font-weight:850;text-underline-offset:5px}
@media(max-width:820px){.af-reading-link{text-align:center;margin-top:1rem}.af-reading-link a{justify-content:center}}
`;
  fs.writeFileSync(homeCssFile, homeCss);
}

console.log("Updated 36 article pages and 3 homepages.");
