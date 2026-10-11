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

function tradeLower(trade: string): string {
  return (trade || 'trade').toLowerCase();
}

// 取前 3 个 line item 描述,用于在段落中具体提及
function topItems(lineItems?: TradeLineItem[]): TradeLineItem[] {
  if (!lineItems || lineItems.length === 0) return [];
  return lineItems.slice(0, 3);
}

function itemsPhrase(items: TradeLineItem[]): string {
  if (items.length === 0) return 'your line items';
  const names = items.map(i => i.description.toLowerCase());
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]}, ${names[1]}, and ${names[2]}`;
}

// 主段落:150-200 词,针对该工种
export function howToUseParagraph(trade: Trade): string {
  const { noun, verb } = docNoun(trade.docType);
  const tl = tradeLower(trade.trade);
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

  const opening =
    noun === 'estimate'
      ? `Use this ${tl} ${noun} template when a customer asks for a price before you start the job.`
      : `Use this ${tl} ${noun} template after you complete the work and are ready to ${verb} the customer.`;

  return `${opening} Open the file and replace the placeholder business name, address, and contact fields with your own. The line items are pre-filled with ${ip} — adjust the quantities and rates to match what you actually did on this job, and delete any rows you did not use.${licenseSentence} ${taxMention} Add your payment terms (the template ships with a sensible default — change it if you offer net 30 or require payment on completion). Save a copy per client so you have a record of what you charged and when.`;
}

// 三张卡片的小标题 + 正文(针对该工种)
export function howToUseCards(trade: Trade): { title: string; body: string }[] {
  const { noun } = docNoun(trade.docType);
  const tl = tradeLower(trade.trade);
  const items = topItems(trade.lineItems);
  const firstItem = items[0]?.description?.toLowerCase() ?? 'your first line item';
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
      title: noun === 'estimate' ? `Send it and track the job` : `Set terms and send`,
      body: noun === 'estimate'
        ? `Email the ${noun} as a PDF (Word → Save As → PDF) so the customer cannot edit it. When they approve, convert it to an invoice by changing the title and adding an invoice number.`
        : `Enter your payment terms and due date, then email the ${noun} as a PDF (Word → Save As → PDF). Keep a copy per client for your records and tax filing.`,
    },
  ];
}