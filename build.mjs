// Builds the static site into public/ from src/pages/*.html.
// No dependencies: run with `node build.mjs` (or `npm run build`).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SITE = 'https://www.rocknrollhouse.com';
const MINDBODY_SCHEDULE = 'https://go.mindbodyonline.com/book/widgets/schedules/view/8026543dcae/schedule';
const OUT = 'public';

// Order here is the nav order.
const pages = [
  { slug: '', src: 'home', nav: null,
    title: 'Rock N Roll House | Muay Thai, BJJ & Kids MMA in Vaudreuil-Dorion',
    description: "Muay Thai, Brazilian Jiu Jitsu, women's BJJ, teen and kids MMA classes in Vaudreuil-Dorion. See the live schedule and book your first class." },
  { slug: 'classes', src: 'classes', nav: 'Classes',
    title: 'Classes | Rock N Roll House',
    description: "Muay Thai, Brazilian Jiu Jitsu, Onna-musha women's BJJ, Teen Spirit, kids intro to MMA, private coaching and adapted programs in Vaudreuil-Dorion." },
  { slug: 'schedule', src: 'schedule', nav: 'Schedule',
    title: 'Class schedule | Rock N Roll House',
    description: 'Live class times for Rock N Roll House from Mindbody. Pick a class and book your spot.' },
  { slug: 'first-class', src: 'first-class', nav: 'First class',
    title: 'Your first class | Rock N Roll House',
    description: 'How to book and prepare for your first martial arts class at Rock N Roll House. Drop-in $40 plus tax, credited to your first month if you join.' },
  { slug: 'memberships', src: 'memberships', nav: 'Memberships',
    title: 'Memberships and drop-ins | Rock N Roll House',
    description: 'Memberships from $70 a month, unlimited training for $170, $40 drop-ins and private coaching at Rock N Roll House.' },
  { slug: 'about', src: 'about', nav: 'About',
    title: 'About the gym | Rock N Roll House',
    description: 'Where the timeless values of martial arts meet the rhythm and energy of rock and roll. Meet the coaches at Rock N Roll House.' },
  { slug: 'reviews', src: 'reviews', nav: 'Reviews',
    title: 'Reviews | Rock N Roll House',
    description: 'What members say about training at Rock N Roll House, from our Google listing.' },
  { slug: 'shop', src: 'shop', nav: 'Shop',
    title: 'Shop | Rock N Roll House',
    description: 'Gloves, hand wraps, mouth guards, gis, shirts and more at the Rock N Roll House gym shop.' },
  { slug: 'contact', src: 'contact', nav: 'Contact',
    title: 'Contact | Rock N Roll House',
    description: 'Find Rock N Roll House at 1 Av. de la Fabrique, Suite 001, Vaudreuil-Dorion. Call 438 535 6855 or email rocknrollhousemma@outlook.com.' },
  { slug: 'cookies', src: 'cookies', nav: null,
    title: 'Cookies | Rock N Roll House',
    description: 'Which cookies the Rock N Roll House website uses and how to change your choice.' },
];

// Old URLs (Squarespace one-pager and the previous single-page redesign) -> new pages.
const legacyHashes = {
  '#classes': '/classes/', '#schedule': '/schedule/', '#first-class': '/first-class/',
  '#memberships': '/memberships/', '#about': '/about/', '#reviews': '/reviews/',
  '#store': '/shop/', '#contact-us': '/contact/',
};
const legacyPages = { landing: '/', home: '/', cart: '/shop/' };

const read = (p) => readFileSync(p, 'utf8');
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };
const url = (slug) => (slug ? `/${slug}/` : '/');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const icon = {
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
};

function head(page, extraHead = '') {
  return `<!DOCTYPE html>
<html lang="en-CA" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${SITE}${url(page.slug)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Rock N Roll House">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${SITE}${url(page.slug)}">
<meta property="og:image" content="${SITE}/assets/img/og.jpg">
<meta name="theme-color" content="#120f0d">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/big-shoulders-display.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
${extraHead}<link rel="stylesheet" href="/assets/css/site.css">
<script>document.documentElement.classList.replace('no-js', 'js');</script>
</head>`;
}

function header(page) {
  const items = pages.filter((p) => p.nav).map((p) => {
    const current = p.slug === page.slug ? ' aria-current="page"' : '';
    return `        <li><a href="${url(p.slug)}"${current}>${p.nav}</a></li>`;
  }).join('\n');
  return `<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/" aria-label="Rock N Roll House, home"${page.slug === '' ? ' aria-current="page"' : ''}>
      <img src="/assets/img/logo-160.webp" srcset="/assets/img/logo-160.webp 1x, /assets/img/logo-320.webp 2x" width="44" height="44" alt="">
      <span>Rock N Roll House</span>
    </a>
    <nav class="primary-nav" id="primary-nav" aria-label="Main">
      <ul>
${items}
        <li><a class="nav-ig" href="https://www.instagram.com/rocknroll_house" rel="noopener" target="_blank" aria-label="Instagram (opens in a new tab)">${icon.ig}</a></li>
      </ul>
    </nav>
    <a class="btn btn-amp btn-sm header-cta" href="/schedule/"${page.slug === 'schedule' ? ' aria-current="page"' : ''}>View schedule</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">
      <span class="visually-hidden">Menu</span>
      <svg class="icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
    </button>
  </div>
</header>`;
}

function footer(page) {
  const contact = page.slug === 'contact' ? '' : `
    <dl class="contact-grid">
      <div><dt>Address</dt><dd><a href="https://www.google.com/maps/search/?api=1&amp;query=Rock+N+Roll+House%2C+1+Av.+de+la+Fabrique%2C+Vaudreuil-Dorion%2C+QC+J7V+0X1" target="_blank" rel="noopener">1 Av. de la Fabrique, Suite 001<br>Vaudreuil-Dorion, QC J7V 0X1</a></dd></div>
      <div><dt>Phone</dt><dd><a href="tel:+14385356855">438&nbsp;535&nbsp;6855</a></dd></div>
      <div><dt>Email</dt><dd><a href="mailto:rocknrollhousemma@outlook.com">rocknrollhousemma@outlook.com</a></dd></div>
      <div><dt>Follow</dt><dd><a href="https://www.instagram.com/rocknroll_house" target="_blank" rel="noopener">@rocknroll_house on Instagram</a></dd></div>
    </dl>`;
  const actions = page.slug === 'schedule'
    ? `<a class="btn btn-ink" href="/first-class/">Book your first class</a>
      <a class="btn btn-line" href="/contact/">Contact us</a>`
    : `<a class="btn btn-ink" href="/schedule/">View schedule</a>
      <a class="btn btn-line" href="/first-class/">Book your first class</a>`;
  return `<footer class="site-footer on-amp">
  <div class="wrap">
    <p class="footer-title">Come train. Come sweat. Come learn.</p>
    <p class="footer-sub">One class at a time, you'll find your rhythm.</p>
    <div class="footer-actions">
      ${actions}
    </div>${contact}
    <div class="footer-base">
      <span>&copy; Rock 'N' Roll House</span>
      <span class="footer-links">
        <a href="/cookies/">Cookies</a>
        <button type="button" class="link-button" data-consent-open>Cookie settings</button>
        <a href="${MINDBODY_SCHEDULE}" target="_blank" rel="noopener">Class booking by Mindbody</a>
      </span>
    </div>
  </div>
</footer>`;
}

const consentUI = `
<section class="consent-banner" id="consent-banner" aria-labelledby="consent-title" hidden>
  <div class="consent-inner">
    <div>
      <h2 class="consent-title" id="consent-title">Cookies and outside content</h2>
      <p>This site doesn't use advertising or tracking cookies of its own. The class schedule (Mindbody) and maps (Google) load from those services, and they may set their own cookies. Choose what to allow. You can change this anytime from <a href="/cookies/">Cookie settings</a>.</p>
    </div>
    <div class="consent-actions">
      <button type="button" class="btn btn-amp btn-sm" data-consent-accept>Accept all</button>
      <button type="button" class="btn btn-line btn-sm" data-consent-reject>Essential only</button>
      <button type="button" class="btn btn-line btn-sm" data-consent-open>Customize</button>
    </div>
  </div>
</section>

<dialog class="consent-dialog" id="consent-dialog" aria-labelledby="consent-dialog-title">
  <form method="dialog" class="consent-form">
    <h2 id="consent-dialog-title">Cookie settings</h2>
    <p>Choose which outside services can load on this site. If you turn one off, you'll get a direct link instead.</p>
    <fieldset>
      <legend class="visually-hidden">Cookie categories</legend>
      <label class="consent-option">
        <input type="checkbox" checked disabled>
        <span><strong>Essential</strong><br>Remembers your cookie choice in your browser. Always on.</span>
      </label>
      <label class="consent-option">
        <input type="checkbox" name="mindbody" data-consent-category="mindbody">
        <span><strong>Class schedule and booking (Mindbody)</strong><br>Shows the live schedule on this site. Mindbody may set cookies, including analytics.</span>
      </label>
      <label class="consent-option">
        <input type="checkbox" name="maps" data-consent-category="maps">
        <span><strong>Maps (Google)</strong><br>Shows our location on an embedded Google map. Google may set cookies.</span>
      </label>
    </fieldset>
    <div class="consent-actions">
      <button type="submit" class="btn btn-amp btn-sm" value="save" data-consent-save>Save choices</button>
      <button type="submit" class="btn btn-ink btn-sm" value="accept" data-consent-accept>Accept all</button>
      <button type="submit" class="btn btn-line-dark btn-sm" value="reject" data-consent-reject>Essential only</button>
    </div>
  </form>
</dialog>`;

function render(page) {
  let body = read(join('src/pages', `${page.src}.html`));
  // Optional per-page head additions: <!--head ... head-->
  let extraHead = '';
  body = body.replace(/<!--head([\s\S]*?)head-->\n?/, (_, h) => { extraHead = h.trim() + '\n'; return ''; });
  body = body.replaceAll('{{MINDBODY_SCHEDULE}}', MINDBODY_SCHEDULE);
  return `${head(page, extraHead)}
<body data-page="${page.slug || 'home'}">
${header(page)}
${consentUI}

<main id="main">
${body.trim()}
</main>

${footer(page)}

<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}

for (const page of pages) {
  write(join(OUT, page.slug, 'index.html'), render(page));
}

// 404
write(join(OUT, '404.html'), render({ slug: '404', src: '404', title: 'Page not found | Rock N Roll House', description: "That page isn't here anymore." })
  .replace(`<link rel="canonical" href="${SITE}/404/">`, '<meta name="robots" content="noindex">'));

// Legacy redirects: keep old links (and their #anchors) working.
const hashMap = JSON.stringify(legacyHashes);
for (const [slug, target] of Object.entries(legacyPages)) {
  write(join(OUT, slug, 'index.html'), `<!DOCTYPE html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rock N Roll House</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITE}${target}">
<script>var m=${hashMap};location.replace(m[location.hash]||'${target}');</script>
<noscript><meta http-equiv="refresh" content="0; url=${target}"></noscript>
</head>
<body style="background:#120f0d;color:#efe9e1;font-family:system-ui,sans-serif;padding:24px">
<p>This page has moved. <a href="${target}" style="color:#fd765d">Continue to Rock N Roll House</a>.</p>
</body>
</html>
`);
}
write('src/legacy-hashes.json', JSON.stringify(legacyHashes, null, 2) + '\n');

// sitemap + robots
const today = new Date().toISOString().slice(0, 10);
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE}${url(p.slug)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
write(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Built ${pages.length} pages, 404, ${Object.keys(legacyPages).length} redirects into ${OUT}/`);
