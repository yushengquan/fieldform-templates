// 动态 sitemap：随 data/trades/*.json 自动更新
// lastmod 用每个 trade JSON 的 git 最后提交时间 —— Google 据此精准识别哪些 URL 变了需要重爬
import type { APIRoute } from 'astro';
import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const modules = import.meta.glob('../data/trades/*.json', { eager: true });
const trades: any[] = Object.values(modules).map((m: any) => m.default);

// 取每个 trade JSON 文件的 git 最后提交日期(YYYY-MM-DD)。
// 构建环境(Cloudflare Pages)有 git;本地无 git 时回退到文件 mtime;再不行回退到构建当天。
function gitLastmod(slug: string): string {
  const here = fileURLToPath(import.meta.url);
  const jsonPath = here.replace(/\/pages\/sitemap\.xml\.ts$/, `/data/trades/${slug}.json`);
  try {
    const out = execSync(`git log -1 --format=%cI -- ${JSON.stringify(jsonPath)}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (out) return out.slice(0, 10);
  } catch {}
  try {
    const stat = statSync(jsonPath);
    return stat.mtime.toISOString().slice(0, 10);
  } catch {}
  return new Date().toISOString().slice(0, 10);
}

// 预计算每个 trade 的 lastmod(主页面 + word + excel 共用同一 JSON 的提交时间)
const lastmodBySlug: Record<string, string> = {};
for (const t of trades) lastmodBySlug[t.slug] = gitLastmod(t.slug);

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://fieldform-templates.pages.dev';
  const urls = [
    { loc: base + '/', priority: '1.0', changefreq: 'weekly', lastmod: new Date().toISOString().slice(0, 10) },
    ...trades.map((t) => ({
      loc: `${base}/templates/${t.slug}/`,
      priority: '0.9',
      changefreq: 'monthly',
      lastmod: lastmodBySlug[t.slug],
    })),
    ...trades.flatMap((t) => [
      { loc: `${base}/templates/${t.slug}-word/`, priority: '0.8', changefreq: 'monthly', lastmod: lastmodBySlug[t.slug] },
      { loc: `${base}/templates/${t.slug}-excel/`, priority: '0.8', changefreq: 'monthly', lastmod: lastmodBySlug[t.slug] },
    ]),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};