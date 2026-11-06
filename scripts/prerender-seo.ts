// Runs after `vite build`. For every indexable route it writes dist/<route>/index.html with the
// route's own title, description, canonical URL, Open Graph tags, JSON-LD and a crawlable text
// summary inside #root (React replaces it on load). It also writes sitemap.xml and robots.txt.
// English metadata, matching the language every visitor lands on.
import fs from "fs";
import path from "path";
import { SEO_ROUTES, SITE_URL, OG_IMAGE, type SeoRoute } from "../src/seo/routes";

const DIST = path.join(process.cwd(), "dist");
const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const today = new Date().toISOString().slice(0, 10);

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const urlFor = (r: SeoRoute) => SITE_URL + (r.path === "/" ? "/" : r.path);

function replaceMeta(html: string, re: RegExp, replacement: string) {
  if (!re.test(html)) throw new Error(`prerender-seo: pattern not found in index.html: ${re}`);
  return html.replace(re, replacement);
}

function render(route: SeoRoute): string {
  const m = route.en;
  const url = urlFor(route);
  let html = template;

  html = html.replace(/<html lang="[^"]*">/, '<html lang="en">');
  html = replaceMeta(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`);
  html = replaceMeta(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = replaceMeta(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(m.description)}" />`);
  html = replaceMeta(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(m.title)}" />`);
  html = replaceMeta(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(m.description)}" />`);
  html = replaceMeta(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`);
  html = replaceMeta(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${esc(m.title)}" />`);
  html = replaceMeta(html, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${esc(m.description)}" />`);

  const robots = route.indexable ? "index, follow, max-image-preview:large" : "noindex, follow";
  const breadcrumb =
    route.path === "/"
      ? []
      : [
          { "@type": "ListItem", position: 1, name: "Quantrih", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: m.h1, item: url },
        ];
  const pageLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: m.title,
        description: m.description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        primaryImageOfPage: OG_IMAGE,
      },
      ...(breadcrumb.length ? [{ "@type": "BreadcrumbList", itemListElement: breadcrumb }] : []),
    ],
  };

  const extraHead = `
    <meta name="robots" content="${robots}" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:locale:alternate" content="fr_BE" />
    <meta property="og:locale:alternate" content="fr_FR" />
    <script type="application/ld+json">${JSON.stringify(pageLd)}</script>
  </head>`;
  html = replaceMeta(html, /\s*<\/head>/, extraHead);

  // Crawlable summary and internal links, replaced by the React app on load.
  const links = SEO_ROUTES.filter((r) => r.indexable && r.path !== route.path && r.en.summary)
    .map((r) => `<li><a href="${r.path}">${esc(r.en.h1)}</a></li>`)
    .join("");
  const body = `<div id="root"><main style="max-width:880px;margin:0 auto;padding:48px 20px;font-family:system-ui,sans-serif;color:#14141A">
      <h1>${esc(m.h1)}</h1>
      ${m.summary ? `<p>${esc(m.summary)}</p>` : ""}
      <nav aria-label="Quantrih"><ul>${links}</ul></nav>
    </main></div>`;
  html = replaceMeta(html, /<div id="root"><\/div>/, body);
  return html;
}

for (const route of SEO_ROUTES) {
  const html = render(route);
  const target = route.path === "/" ? path.join(DIST, "index.html") : path.join(DIST, route.path.slice(1), "index.html");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${SEO_ROUTES.filter((r) => r.indexable)
  .map(
    (r) => `  <url>
    <loc>${urlFor(r)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);

fs.writeFileSync(
  path.join(DIST, "robots.txt"),
  `User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth
Disallow: /profile
Disallow: /investor-profile

Sitemap: ${SITE_URL}/sitemap.xml
`
);

console.log(`prerender-seo: ${SEO_ROUTES.length} pages, sitemap with ${SEO_ROUTES.filter((r) => r.indexable).length} URLs`);
