// 为 /guides/how-to-write-a-{trade}-invoice/ 页生成 HowTo schema 步骤
// 每个 guide 都是 "how to write a X invoice" 的深度内容,
// 步骤从 guide 的 sections[0] (必填字段列表) + 通用写发票流程推导,
// 保证步骤既贴合该工种又有动作性(HowToStep 要求 name 是动作短语)。
import { lowerKeepProper } from './how-to-use';

export interface GuideSectionBlock {
  type: string;
  text?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

export interface GuideSection {
  h2: string;
  blocks: GuideSectionBlock[];
}

export interface Guide {
  slug: string;
  trade: string;
  templateSlug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
}

function tradeLower(trade: string): string {
  // 小写化但保留专有词/缩写(HVAC Service → HVAC service)
  return lowerKeepProper(trade || 'Trade');
}

// 从 guide.sections[0] 的 ul 列表提取该工种特有的必填字段
// 这些字段会在步骤里被引用,让每个 guide 的 HowTo 不雷同
function tradeSpecificFields(guide: Guide): string[] {
  const first = guide.sections[0];
  if (!first) return [];
  const ul = first.blocks.find((b) => b.type === 'ul' && b.items && b.items.length > 0);
  if (!ul || !ul.items) return [];
  // ul items 可能很长,取前半句作为字段名
  return ul.items.slice(0, 4).map((it) => {
    // "Permit # and inspecting jurisdiction for ..." → "Permit # and inspecting jurisdiction"
    const short = it.split(/ — | – | - |for |so that |which |since |because /)[0];
    return short.trim().replace(/\.$/, '');
  });
}

// 生成 5-6 个 HowToStep,前两步引用该工种特有字段,后面是通用发送/记录步骤
export function howToStepsForGuide(guide: Guide): { name: string; text: string }[] {
  const tl = tradeLower(guide.trade);
  // estimate/quote 类 guide 的步骤文案用对应单据类型（默认 invoice，兼容旧 guide）
  const doc = ((guide as any).docType ?? 'invoice') as string;
  const fields = tradeSpecificFields(guide);
  const fieldPhrase =
    fields.length > 0
      ? fields.slice(0, 2).join('; ')
      : 'business name, client details, and job date';

  const steps: { name: string; text: string }[] = [
    {
      name: `Open the ${tl} ${doc} template`,
      text: `Download the free ${tl} ${doc} template (Excel, Word, or PDF) and open it in your editor. Save a copy named with the client and date so you can find it later.`,
    },
    {
      name: `Fill in your business header and license`,
      text: `Enter your business name, address, phone, and email at the top. ${fields.length > 0 ? `For ${tl} work, also add ${fieldPhrase}.` : 'Add your contractor license number if your state requires it.'} These fields appear on every invoice once set.`,
    },
    {
      name: `Add the client and job-site details`,
      text: `Record the customer name, billing address, and the job-site address if it differs. Include the work order or job number and the date the work was completed — this links the invoice to the job for your records and the client's.`,
    },
    {
      name: `List the line items with quantities and rates`,
      text: `Enter each piece of work as a separate line: labor hours and rate, materials with cost-plus markup, flat fees, and any permits passed through at cost. Use the trade-specific line items from the template as a starting point and delete rows you did not use.`,
    },
    {
      name: `Apply sales tax per your state rules`,
      text: `Set the taxable flag per line item — most states tax materials and exempt labor, but a handful tax both. Check your state DOR if unsure, and apply the rate only to the taxable lines so the total is correct.`,
    },
    {
      name: `Set payment terms and send the invoice`,
      text: `Enter your payment terms (net 15, net 30, or due on receipt) and the due date. Save the file as a PDF (Word → Save As → PDF) so the client cannot edit it, then email it. Keep a copy per client for tax filing and your records.`,
    },
  ];

  return steps;
}

// 完整的 HowTo JSON-LD 对象(不含 @context,由调用方包)
export function howToSchemaForGuide(guide: Guide, siteUrl: string) {
  const steps = howToStepsForGuide(guide);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.h1,
    description: guide.description,
    image: `${siteUrl}/og-image.png`,
    totalTime: "PT30M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    tool: [
      { "@type": "HowToTool", name: "Excel or Word editor" },
      { "@type": "HowToTool", name: "PDF viewer" },
    ],
    step: steps.map((s) => ({
      "@type": "HowToStep",
      name: s.name,
      text: s.text,
    })),
  };
}