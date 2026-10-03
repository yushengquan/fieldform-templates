// 动态 sitemap：随 data/trades/*.json 自动更新
import type { APIRoute } from 'astro';

const modules = import.meta.glob('../data/trades/*.json', { eager: true });
const trades: any[] = Object.values(modules).map((m: any) => m.default);

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://fieldform-templates.pages.dev';
  const urls = [
    { loc: base + '/', priority: '1.0', changefreq: 'weekly' },
    ...trades.map((t) => ({
      loc: `${base}/templates/${t.slug}/`,
      priority: '0.9',
      changefreq: 'monthly',
    })),
    ...trades.flatMap((t) => [
      { loc: `${base}/templates/${t.slug}-word/`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${base}/templates/${t.slug}-excel/`, priority: '0.8', changefreq: 'monthly' },
    ]),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
