// RSS 2.0：博客目录提交(Blogarama 等)和订阅器自动发现用
// 与 sitemap.xml.ts 同模式：扫 data/blog/*.json 手写 XML，不加依赖
import type { APIRoute } from 'astro';

const modules = import.meta.glob('../data/blog/*.json', { eager: true });
const posts: any[] = Object.values(modules)
  .map((m: any) => m.default)
  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

// XML 转义(title/description 可能含 & < > ")
const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://fieldformtemplates.com';

  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${base}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${base}/blog/${p.slug}/</guid>
      <description>${esc(p.description)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
    </item>`
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FieldForm Templates Blog</title>
    <link>${base}/blog/</link>
    <description>Invoicing tips, tax rules, and business advice for trade contractors.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
