#!/usr/bin/env node
// IndexNow 提交脚本：读 dist/sitemap.xml,批量 ping api.indexnow.org
// 用法: node scripts/indexnow_submit.mjs [--dry-run]
// Key 文件: public/6e5b3e7fd4e150dec4040927bc7abf21.txt (根路径可访问即生效)

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP = join(ROOT, 'dist', 'sitemap.xml');
const KEY_FILE_DIR = join(ROOT, 'public');

// 从 public/ 里自动找 key 文件 (32位hex.txt)
const keyFile = readdirSync(KEY_FILE_DIR).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error('No IndexNow key file found in public/ (expected <32-hex>.txt)');
  process.exit(1);
}
const KEY = keyFile.replace('.txt', '');
const KEY_LOCATION = `https://fieldformtemplates.com/${keyFile}`;
const HOST = 'fieldformtemplates.com';

if (!existsSync(SITEMAP)) {
  console.error('dist/sitemap.xml not found — run `npm run build` first');
  process.exit(1);
}

// 提取所有 URL
const xml = readFileSync(SITEMAP, 'utf-8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
console.log(`Found ${urls.length} URLs in sitemap`);
console.log(`Key: ${KEY}`);
console.log(`Key location: ${KEY_LOCATION}`);

const dryRun = process.argv.includes('--dry-run');
if (dryRun) {
  console.log('\n[dry-run] Would submit these URLs (first 10):');
  urls.slice(0, 10).forEach((u) => console.log('  ' + u));
  console.log(`  ... and ${Math.max(0, urls.length - 10)} more`);
  process.exit(0);
}

// IndexNow 单次最多 10000 URL,这里 500 一批稳妥
const BATCH = 500;
const batches = [];
for (let i = 0; i < urls.length; i += BATCH) batches.push(urls.slice(i, i + BATCH));

const ENDPOINTS = ['https://api.indexnow.org', 'https://www.bing.com/indexnow'];

async function submit() {
  let ok = 0, fail = 0;
  for (const ep of ENDPOINTS) {
    console.log(`\n== Pinging ${ep} ==`);
    for (let i = 0; i < batches.length; i++) {
      const body = JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: batches[i],
      });
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body,
        });
        // 200=ok 202=accepted(key未验证时) 400/403/422=错误 429=限流
        console.log(`  batch ${i + 1}/${batches.length}: HTTP ${res.status}`);
        if (res.status === 200 || res.status === 202) ok++;
        else {
          fail++;
          const txt = await res.text().catch(() => '');
          if (txt) console.log(`    ${txt.slice(0, 200)}`);
        }
      } catch (e) {
        fail++;
        console.error(`  batch ${i + 1} error: ${e.message}`);
      }
    }
  }
  console.log(`\nDone: ${ok} batch-ok, ${fail} batch-fail`);
  console.log('Note: 202 = accepted, key file will be verified on first crawl.');
  console.log(`Verify key file is live: ${KEY_LOCATION}`);
}

submit();