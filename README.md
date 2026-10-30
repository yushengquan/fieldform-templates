# FieldForm Templates

**[fieldformtemplates.com](https://fieldformtemplates.com/)** — free invoice, estimate and quote templates for 50+ trades, in PDF, Word and Excel. No signup, no email gate.

## What this is

A programmatically generated static site: one JSON file per trade produces three pages (main / Word / Excel) plus the downloadable files, structured data and sitemap. Adding a trade means adding one JSON file.

Useful starting points:

- [Invoice templates](https://fieldformtemplates.com/invoice-templates/) · [Estimate templates](https://fieldformtemplates.com/estimate-templates/) · [Business forms](https://fieldformtemplates.com/business-form-templates/)
- [Free invoice calculator](https://fieldformtemplates.com/invoice-calculator/) · [Welding estimate calculator](https://fieldformtemplates.com/welding-estimate-calculator/)
- [Contractor licence requirements by state](https://fieldformtemplates.com/contractor-license-requirements-by-state/) — reference table, free to cite
- [Editorial standards](https://fieldformtemplates.com/editorial-standards/) — how the templates and figures are compiled

## Stack

Astro (static output) · Cloudflare Workers hosting · Python generates the xlsx/docx/pdf binaries from the same JSON. Deployed on push to `main`.

## Local development

```bash
npm install
npm run dev          # local dev server
npm run build        # static build to dist/
python scripts/gen_templates.py   # regenerate public/downloads/ from the trade JSON
```

## Where the content lives

- `src/data/trades/*.json` — one file per trade (title, line items, FAQ, `deepDive` long-form guide)
- `src/data/blog/*.json` — blog posts
- `src/data/authorities.ts` — primary sources cited per trade family
- `src/data/affiliates.ts` — software recommendation data
- `scripts/gen_templates.py` — JSON → xlsx/docx/pdf

## Directory structure

```
src/
  data/trades/            # one JSON per trade — the file you normally touch
  data/blog/
  layouts/BaseLayout.astro
  components/             # download cards, FAQ, invoice preview, builder
  pages/
    templates/[slug].astro        # main + -word + -excel variants from one JSON
    blog/[slug].astro
    guides/[slug].astro
    sitemap.xml.ts
scripts/gen_templates.py
public/downloads/         # generated binaries
```

## Licence

Templates and guides are free for commercial use by contractors.
