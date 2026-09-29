# FieldForm Templates — 程序化发票模板站

面向美国手艺人（水管工、电工等）的发票/报价单模板下载站。数据驱动批量生成页面，新增一个工种 = 加一个 JSON 文件。

## 目录结构

```
fieldform-site/
├── astro.config.mjs          # Astro 配置（site 地址、静态输出）
├── src/
│   ├── data/trades/          # ★ 数据层：每个 JSON = 一个模板页
│   │   ├── plumbing-invoice-template.json
│   │   └── electrician-invoice-template.json
│   ├── layouts/BaseLayout.astro   # 全站布局（SEO meta / 导航 / 页脚）
│   ├── components/                 # 发票预览 / 下载卡 / FAQ
│   └── pages/
│       ├── index.astro             # 首页（自动列出所有模板）
│       ├── templates/[slug].astro  # ★ 动态模板页（getStaticPaths 批量生成）
│       └── sitemap.xml.ts          # 自动 sitemap
├── scripts/gen_templates.py  # ★ 从 JSON 批量生成 xlsx/docx/pdf → public/downloads/
├── public/                   # 下载文件 / favicon / robots.txt
└── .github/workflows/        # 自动部署（可选）
```

## 本地运行

```bash
npm install          # 首次
python3 scripts/gen_templates.py   # 生成模板下载文件（每次改 JSON 后重跑）
npm run dev          # 本地预览 http://localhost:4321
npm run build        # 构建到 dist/
```

## 新增一个工种（核心流程）

1. 复制 `src/data/trades/plumbing-invoice-template.json` 为 `electrician-estimate-template.json`（文件名 = 页面 slug）
2. 修改 `title / trade / docType / lineItems / features / faqs`
3. `python3 scripts/gen_templates.py` 重新生成下载文件
4. `npm run build` —— 新页面自动出现在 `/templates/electrician-estimate-template/`

改数据不碰代码，这就是"程序化"。

## 上线部署（二选一）

### 方式 A：Cloudflare Pages 控制台直连（推荐，最简单）
1. 代码推到 GitHub 仓库（`git init && git add . && git commit && git push`）
2. Cloudflare → Pages → Create project → 连接该仓库
3. 构建配置：Build command `npm run build`，Output directory `dist`
4. 首次部署后把自定义域名绑到 Pages（Cloudflare → 你的域名 → Pages 绑定）
5. 上线后改 `astro.config.mjs` 的 `site` 为真实域名，并更新 `public/robots.txt` 的 Sitemap 地址

### 方式 B：GitHub Actions（本仓库已带 workflow）
仓库 Settings → Secrets 添加 `CLOUDFLARE_API_TOKEN`（Pages:Edit 权限）和 `CLOUDFLARE_ACCOUNT_ID`，推送 main 自动部署。

## 上线后的 SEO 待办

- Google Search Console 验证站点 → 提交 `https://你的域名/sitemap.xml`
- 免费 Ahrefs Webmaster Tools 复核目标关键词搜索量
- 每 1-2 周加 1-2 个工种 JSON，保持内容爬坡节奏

## 变现（后续接入，本 MVP 未含）

- PDF 免费免邮箱下载（已实现直链）
- Word/Excel 留资墙：接 Brevo（免费层 300 封/天）发下载链接
- Pro 订阅：接 Paddle（5%+$0.50/笔）——去水印、无限开票、在线发送
- 侧边栏 QuickBooks/Xero 联盟佣金

## 合规注意

- 每页页脚与文件内已含免责声明（非法律/税务建议）
- 税率格故意留空（提示用户查本州税率，避免被解读为税务建议）
- 联盟链接需 FTC 披露；收集邮箱需隐私政策 + double opt-in（GDPR/CCPA）
