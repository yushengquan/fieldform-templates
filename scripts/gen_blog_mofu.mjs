// 生成 3 篇 MOFU/BOFU blog JSON 到 src/data/blog/
// 用 node 脚本绕过单次 write 长度限制；内容用 JS 对象字面量，JSON.stringify 输出
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'src', 'data', 'blog');

const posts = [];

// ===== Post 1: plumbing-invoice-template-word-guide =====
posts.push({
  slug: 'plumbing-invoice-template-word-guide',
  title: 'Plumbing Invoice Template Word Guide: Line-Iteming Labor, Fixtures & Trip Fees',
  description: 'Step-by-step guide to using a plumbing invoice template in Word — how to line-item labor hours, trip fees, fixtures, and pipe/fittings so your invoice is clear, defensible, and gets paid without a dispute.',
  h1: 'How to Invoice a Plumbing Job in Word (Template Walkthrough)',
  category: 'Trade Guides',
  date: '2025-03-04',
  intro: "Plumbers lose money on invoices that say 'Replaced kitchen faucet — $285' with no breakdown. The client can't tell what was labor, what was the fixture, what was the trip — and a vague invoice is the one that gets disputed. This walkthrough shows exactly how to structure a plumbing invoice in Word, line by line, using the free template.",
  sections: [
    {
      h2: 'Why a line-itemed plumbing invoice beats a lump sum',
      blocks: [
        { type: 'p', text: "A lump-sum invoice hides your pricing. When the client sees only 'Plumbing repair: $285,' they wonder whether the faucet itself was $200 or $50 — and if they think the fixture was cheap, they assume you overcharged for labor. A line-itemed invoice shows each charge separately, so the client can match every dollar to the work they watched you do." },
        { type: 'p', text: 'Line-itemed invoices also protect you in a dispute. If the client claims they never approved a charge, your invoice — with its itemized trip fee, labor hours, and fixture cost — is your record of what was billed and when. A lump sum gives you nothing to point to.' }
      ]
    },
    {
      h2: 'The 6 line items a plumbing invoice should have',
      blocks: [
        { type: 'p', text: 'Not every job needs all six, but these cover the vast majority of residential service calls. The Word template has these as pre-filled rows — you edit the description, quantity, and rate, and delete the rows you don\'t need.' },
        { type: 'table', headers: ['Line item', 'Typical unit', 'Sample rate'], rows: [
          ['Trip / service call fee', 'each', '$75-$150'],
          ['Diagnostic time', 'hour', '$75-$125/hr'],
          ['Labor (licensed plumber)', 'hour', '$90-$150/hr'],
          ['Apprentice labor', 'hour', '$40-$60/hr'],
          ['Fixtures (faucet, valve, toilet)', 'each', 'pass-through + markup'],
          ['Pipe, fittings, consumables', 'foot or each', 'pass-through + markup']
        ]}
      ]
    },
    {
      h2: 'How to handle the trip fee in Word',
      blocks: [
        { type: 'p', text: 'The trip fee is the most disputed charge in plumbing invoicing — because plumbers hide it. Some roll it into a higher hourly rate; some add it silently to materials; some only charge it on the first hour. Pick one method and be consistent, then show it as its own line on every invoice.' },
        { type: 'p', text: "In the Word template, the trip fee is the first row under line items: 'Trip / service call — 1 each @ $95.' State it upfront when you book the job and it never surprises anyone on the invoice." }
      ]
    },
    {
      h2: 'Marking up fixtures vs passing through at cost',
      blocks: [
        { type: 'p', text: 'There are two schools: pass the fixture through at your exact cost, or mark it up 15-25% to cover your time sourcing, picking up, and warrantying the part. Both are legitimate — the mistake is being inconsistent or hiding the markup.' },
        { type: 'p', text: "If you mark up, show it as a single line: 'Kitchen faucet (Moen 87233) — 1 each @ $145.' The client sees a fair retail price they can compare online. If you pass through at cost, show the same line at your cost and add a separate 'Materials handling — 15%' line so the handling charge is visible." }
      ]
    },
    {
      h2: 'Editing the Word template: the 4 things to change first',
      blocks: [
        { type: 'ul', items: [
          'Your business name, license number, and phone in the header — clients check the license number on every plumbing invoice',
          "The tax rate cell — look up your state's rule on plumbing (some tax labor, some tax only materials, some exempt residential repairs entirely)",
          "The line-item rows — delete the ones you didn't use, edit quantities and rates on the ones you did",
          "The payment terms line — 'Net 15' vs 'Due on receipt' vs 'COD'; pick the one that matches how this