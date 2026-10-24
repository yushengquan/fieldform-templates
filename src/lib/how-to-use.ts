// 从 trade JSON 字段自动生成针对性的 "How to use" 段落
// 每个工种的段落都引用该工种真实的 line items / license / tax 字段,避免通用化

export interface TradeLineItem {
  code: string;
  description: string;
  defaultQty?: number;
  unit?: string;
  sampleRate?: number;
  taxable?: boolean;
}

export interface Trade {
  slug: string;
  trade: string;
  docType: string;
  title: string;
  subtitle: string;
  licenseField?: boolean;
  taxHint?: string;
  lineItems?: TradeLineItem[];
  paymentTerms?: string;
}

function docNoun(docType: string): { noun: string; verb: string } {
  // invoice → "invoice" / "bill"; estimate → "estimate" / "quote"; quote → "quote" / "quote"
  const d = (docType || 'invoice').toLowerCase();
  if (d.includes('estimate')) return { noun: 'estimate', verb: 'quote' };
  if (d.includes('quote')) return { noun: 'quote', verb: 'quote' };
  return { noun: 'invoice', verb: 'bill' };
}

// 专有名词(Christmas)与行业缩写(HVAC)在任何语境下都保持原大写
const PROPER_WORDS = new Set(['christmas', 'hvac']);

// 小写化字符串,但保留专有词/缩写(HVAC Technician → HVAC technician)
export function lowerKeepProper(s: string): string {
  return (s || '')
    .split(' ')
    .map((w) => (PROPER_WORDS.has(w.toLowerCase()) ? w : w.toLowerCase()))
    .join(' ');
}

function tradeLower(trade: string): string {
  return lowerKeepProper(trade || 'Trade');
}

// -ing 结尾的工种名(Welding/Plumbing/Cleaning)指"从事该工种的人"时转成 welder/plumber/cleaner;
// 其余工种名本身指人(Electrician),复数直接加 s。
export function tradePerson(tradeName: string, plural = true): string {
  const lower = tradeLower(tradeName);
  if (lower.endsWith('ing') && lower.length > 5) {
    return lower.slice(0, -3) + (plural ? 'ers' : 'er'); // welding→welders, plumbing→plumbers
  }
  return plural ? lower + 's' : lower;
}

// 取前 3 个 line item 描述,用于在段落中具体提及
function topItems(lineItems?: TradeLineItem[]): TradeLineItem[] {
  if (!lineItems || lineItems.length === 0) return [];
  return lineItems.slice(0, 3);
}

function itemsPhrase(items: TradeLineItem[]): string {
  if (items.length === 0) return 'your line items';
  const names = items.map(i => lowerKeepProper(i.description));
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]}, ${names[1]}, and ${names[2]}`;
}

// 主段落:150-200 词,针对该工种
export function howToUseParagraph(trade: Trade): string {
  const { noun, verb } = docNoun(trade.docType);
  const tl = trade.trade;
  const items = topItems(trade.lineItems);
  const ip = itemsPhrase(items);
  const hasLicense = trade.licenseField === true;
  const taxMention = trade.taxHint
    ? trade.taxHint.toLowerCase().includes('sales tax')
      ? 'Enter your state sales tax rate in the tax cell — the total recalculates automatically. If your state does not tax services, leave the rate blank.'
      : 'Set the tax rate to match your jurisdiction; leave it blank if no tax applies.'
    : 'Set the tax rate for your jurisdiction, or leave it blank if the work is not taxable.';

  const licenseSentence = hasLicense
    ? ` Most states require a contractor license number on any client-facing ${noun}, so fill in the License # field before sending — leaving it blank can delay payment or violate state board rules.`
    : '';

  // estimate 和 quote 都是开工前的单据;invoice 是完工后的账单
  const preJob = noun !== 'invoice';
  const opening =
    preJob
      ? `Use this ${tl} ${noun} template when a customer asks for a price before you start the job.`
      : `Use this ${tl} ${noun} template after you complete the work and are ready to ${verb} the customer.`;

  return `${opening} Open the file and replace the placeholder business name, address, and contact fields with your own. The line items are pre-filled with ${ip} — adjust the quantities and rates to match what you actually did on this job, and delete any rows you did not use.${licenseSentence} ${taxMention} Add your payment terms (the template ships with a sensible default — change it if you offer net 30 or require payment on completion). Save a copy per client so you have a record of what you charged and when.`;
}

// 三张卡片的小标题 + 正文(针对该工种)
export function howToUseCards(trade: Trade): { title: string; body: string }[] {
  const { noun } = docNoun(trade.docType);
  const tl = trade.trade;
  const items = topItems(trade.lineItems);
  const firstItem = items[0]?.description ? lowerKeepProper(items[0].description) : 'your first line item';
  const hasLicense = trade.licenseField === true;

  return [
    {
      title: `Fill in your business details`,
      body: `Replace the placeholder business name, address, phone, and email at the top with your own. ${hasLicense ? 'Add your License # — most states require it on a client-facing ' + noun + ' for ' + tl + ' work.' : 'These fields appear on every page once set, so you only type them once.'}`,
    },
    {
      title: `Adjust the line items`,
      body: `The template ships with ${items.length} pre-filled rows starting with ${firstItem}. Change the quantity and rate to match this job, add rows for anything extra, and delete rows you did not use. The structure stays aligned.`,
    },
    {
      title: noun === 'invoice' ? `Set terms and send` : `Send it and track the job`,
      body: noun === 'invoice'
        ? `Enter your payment terms and due date, then email the ${noun} as a PDF (Word → Save As → PDF). Keep a copy per client for your records and tax filing.`
        : `Email the ${noun} as a PDF (Word → Save As → PDF) so the customer cannot edit it. When they approve, convert it to an invoice by changing the title and adding an invoice number.`,
    },
  ];
}

// "How {trade}s typically bill" — 行业计费知识段落(200+ 词)
// 从 lineItems 推导,解释 call-out fee / labor / materials / warranty 的行业惯例
export function billingContext(trade: Trade): string {
  const { noun, verb } = docNoun(trade.docType);
  const tl = trade.trade;
  const items = trade.lineItems ?? [];
  const hasCallOut = items.some(i => /call.?out|service.?fee|trip/i.test(i.description));
  const hasLabor = items.some(i => /labor/i.test(i.description));
  const hasMaterials = items.some(i => /material|parts|supply/i.test(i.description));
  const hasWarranty = items.some(i => /warranty|guarantee/i.test(i.description));
  const hasPermit = items.some(i => /permit|inspection/i.test(i.description));
  const hasLicense = trade.licenseField === true;

  const parts: string[] = [];

  parts.push(`Most ${tl} businesses ${verb} a job using a combination of fixed fees and time-and-materials pricing.`);

  if (hasCallOut) {
    parts.push(`A service call-out fee covers the cost of traveling to the job site and the first hour of diagnosis — it is typically a flat charge ($50–$150 depending on your market and whether the job is after hours). Some ${tradePerson(trade.trade)} waive the call-out fee if the customer approves the repair on the spot; others always charge it. Put it on its own line so the customer sees it itemized.`);
  }
  if (hasLabor) {
    parts.push(`Labor is usually billed at an hourly rate ($75–$150/hr for skilled trades in most US markets). Track time from arrival to completion, including any time spent picking up parts. If you have a minimum charge (e.g. 1 hour even for a 20-minute fix), note it in the line item description.`);
  }
  if (hasMaterials) {
    parts.push(`Materials and parts are billed at cost plus a markup — 20% to 30% is common for consumables, higher for hard-to-source items. Keep receipts for every purchase; on the ${noun}, list each material as a separate line if it is over $50, or group small items under "Materials" with a single total.`);
  }
  if (hasPermit) {
    parts.push(`Permits and inspection fees, if required by your city or county, are usually passed through at cost. List them as a separate line so the customer understands they are a government fee, not your markup.`);
  }
  if (hasWarranty) {
    parts.push(`A warranty line — typically 30 to 90 days on parts and labor — tells the customer you stand behind the work. Most ${tradePerson(trade.trade)} offer it at no charge as a line item marked $0.00; some sell extended warranties as an upsell. Check whether your state requires a written warranty by law for ${tl} work.`);
  }
  if (hasLicense) {
    parts.push(`In most US states, a ${tradePerson(trade.trade, false)} must include their contractor license number on every client-facing ${noun}. Leaving it off can result in fines from the state board and gives the customer grounds to dispute the charge. Enter it in the License # field before sending.`);
  }

  parts.push(`Tax treatment varies by state — some states tax ${tl} labor, others only tax materials, and a few tax nothing. Look up your state's rule or ask your CPA, then set the tax rate cell accordingly. When in doubt, tax the materials and leave labor untaxed, which is the most common treatment.`);

  return parts.join(' ');
}