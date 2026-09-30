// @ts-check
import { defineConfig } from 'astro/config';

// 站点地址：正式域名
export default defineConfig({
  site: 'https://fieldformtemplates.com',
  output: 'static',
  build: { format: 'directory' },
  compressHTML: true,
});
