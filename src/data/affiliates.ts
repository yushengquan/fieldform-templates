// 联盟项目配置 — 申请通过后只需把 affiliateUrl 填上，页面与 rel 属性自动切换。
// 注意：affiliateUrl 为空时，页面按普通外链渲染，且不显示"联盟链接"披露文案。
// 目前（2026-10-30）尚未提交任何申请，因此全部为空。

export interface Vendor {
  id: string;
  name: string;
  url: string;            // 普通官网链接
  affiliateUrl: string;   // 申请通过后填这里；空字符串 = 还没拿到
  bestFor: string;
  tradeKinds: ('service' | 'build' | 'pro')[];
  priceNote: string;
  why: string;
  caveat: string;
}

export const VENDORS: Vendor[] = [
  {
    id: 'jobber',
    name: 'Jobber',
    url: 'https://www.getjobber.com/',
    affiliateUrl: '',
    bestFor: '上门服务类承包商（空调、水管、电工、园林、保洁、除虫）',
    tradeKinds: ['service'],
    priceNote: '付费方案约 $29–$129/月，按用户数与功能分层；有免费试用',
    why: '把排班、报价、开票、收款放在一个流程里。客户在手机上签字确认报价后，工单和发票自动生成，不用回办公室再录一遍。',
    caveat: '按月付费，团队规模上来后单价明显上升；单人短工不一定划算。',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    url: 'https://quickbooks.intuit.com/',
    affiliateUrl: '',
    bestFor: '需要记账 + 报税一体化的承包商、有雇员或分包较多的团队',
    tradeKinds: ['build', 'service', 'pro'],
    priceNote: 'Simple Start 约 $30/月起，Plus 约 $90/月；促销价常见',
    why: '发票与账套打通，1099 申报、销售税申报、银行对账在同一处完成。会计和税务师最熟悉的格式，交接成本最低。',
    caveat: '学习曲线比纯开票工具陡；功能多但很多用不上。',
  },
  {
    id: 'freshbooks',
    name: 'FreshBooks',
    url: 'https://www.freshbooks.com/',
    affiliateUrl: '',
    bestFor: '自由职业者、单人承包商、以工时或项目计费的工种',
    tradeKinds: ['pro'],
    priceNote: 'Lite 约 $19/月起，按可计费客户数分层',
    why: '工时记录和发票绑定，适合按小时或按里程碑收费的人；客户门户能让对方自助查看和付款。',
    caveat: '客户数上限按方案限制，接单多的小团队容易超限。',
  },
  {
    id: 'invoice-simple',
    name: 'Invoice Simple',
    url: 'https://www.invoicesimple.com/',
    affiliateUrl: '',
    bestFor: '只想要"手机开单、当场收钱"的现场工人',
    tradeKinds: ['service', 'build'],
    priceNote: '约 $7/月或 $80/年',
    why: '手机上三分钟出一张发票，支持拍照附现场照片、签字后立即发PDF。比完整 SaaS 轻得多。',
    caveat: '没有排班、没有库存、没有完整账套；业务长大后要迁移。',
  },
  {
    id: 'wave',
    name: 'Wave',
    url: 'https://www.waveapps.com/',
    affiliateUrl: '',
    bestFor: '刚起步、预算为零、需要免费开票 + 基础记账',
    tradeKinds: ['pro', 'service'],
    priceNote: '核心开票与记账免费；收款和发薪按笔收费',
    why: '完全免费的开票与记账组合，适合还没到付费阶段的个体户。',
    caveat: '高级功能（ payroll、专业记账）才收费，支持响应也按付费层级区分。',
  },
];

/** 当前是否有任何可用的联盟链接（页面据此决定是否显示披露） */
export function hasAffiliateLinks(): boolean {
  return VENDORS.some((v) => v.affiliateUrl !== '');
}

/** 取渲染用链接：有联盟链接用联盟链接，否则用官网 */
export function linkFor(v: Vendor): { href: string; isAffiliate: boolean } {
  return v.affiliateUrl ? { href: v.affiliateUrl, isAffiliate: true } : { href: v.url, isAffiliate: false };
}

/** 按工种类型推荐前两个 */
export function vendorsForKind(kind: 'service' | 'build' | 'pro', limit = 2): Vendor[] {
  const primary = VENDORS.filter((v) => v.tradeKinds.includes(kind));
  const order: Record<string, string[]> = {
    service: ['jobber', 'quickbooks', 'invoice-simple'],
    build: ['quickbooks', 'jobber', 'invoice-simple'],
    pro: ['freshbooks', 'wave', 'quickbooks'],
  };
  const pref = order[kind] ?? [];
  return primary
    .sort((a, b) => (pref.indexOf(a.id) + 1 || 99) - (pref.indexOf(b.id) + 1 || 99))
    .slice(0, limit);
}
