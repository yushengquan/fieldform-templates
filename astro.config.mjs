// @ts-check
import { defineConfig } from 'astro/config';

// 站点地址：上线后替换为你的真实域名（影响 canonical 与 sitemap）
export default defineConfig({
  site: 'https://fieldform-templates.pages.dev',
  output: 'static',
  build: { format: 'directory' },
  compressHTML: true,
});
