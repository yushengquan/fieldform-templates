// 动态 sitemap：trade 页 + 独立页面全自动，新增 .astro 页面或 trade JSON 无需改此文件
// - trade 页：从 data/trades/*.json 扫出，lastmod 用 git 最后提交时间
// - 独立页面：从 src/pages/*.astro 扫出（index → /，about → /about/），lastmod 用构建当天
import type { APIRoute } from 'astro';
import { execSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const modules = import.meta.glob('../data/trades/*.json', { eager: true });
const trades: any[] = Object.values(modules).map((m: any) => m.default);

// guides (长尾信息型页面)
const guideModules = import.meta.glob('../data/guides/*.json', { eager: true });
const guides: any[] = Object.values(guideModules).map((m: any) => m.default);

// blog 文章
const blogModules = import.meta.glob('../data/blog/*.json', { eager: true });
const blogPosts: any[] = Object.values(blogModules)
  .map((m: any) => m.default)
  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

// 扫 src/pages/ 下所有顶层 .astro 页面 → 自动进 sitemap
// index.astro → /，about.astro → /about/，contact.astro → /contact/ ...
const astroPages = import.meta.glob('../pages/*.astro', { eager: false });
const staticPaths = Object.keys(astroPages)
  .filter((p) => !p.includes('404.astro')) // 404 页不进 sitemap
  .map((p) => {
  // glob key 形如 '../pages/about.astro' 或 './../pages/about.astro'，取 basename 再去 .astro
  const file = p.split('/').pop()!.replace(/\.astro$/, '');
  return file === 'index' ? '/' : `/${file}/`;
});

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

const today = new Date().toISOString().slice(0, 10);

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://fieldform-templates.pages.dev';

  // 独立页面：首页 priority 1.0 weekly，其余 0.7 monthly
  const staticUrls = staticPaths.map((path) => ({
    loc: base + path,
    priority: path === '/' ? '1.0' : '0.7',
    changefreq: path === '/' ? 'weekly' : 'monthly',
    lastmod: today,
  }));

  // trade 模板页：主页面 0.9，word/excel 变体 0.8
  const tradeUrls = [
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

  // guide 页：0.6 monthly（信息型长尾，低于模板页权重）
  const guideUrls = [
    { loc: `${base}/guides/`, priority: '0.6', changefreq: 'monthly', lastmod: today },
    ...guides.map((g: any) => ({
      loc: `${base}/guides/${g.slug}/`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: today,
    })),
  ];

  // blog 页：列表 0.6，文章 0.5（信息型，低于 guides 因为更偏顶/中漏斗）
  const blogUrls = [
    { loc: `${base}/blog/`, priority: '0.6', changefreq: 'weekly', lastmod: today },
    ...blogPosts.map((p: any) => ({
      loc: `${base}/blog/${p.slug}/`,
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: p.date,
    })),
  ];

  const urls = [...staticUrls, ...tradeUrls, ...guideUrls, ...blogUrls];
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