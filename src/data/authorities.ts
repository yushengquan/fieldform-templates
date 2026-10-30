// 权威来源映射 — 每个工种族对应 2-4 个一手/权威出处。
// 目的：让 deepDive 里的数字和规则可核验，同时向审核方显示"做过功课"，而不是批量生成。
export interface Authority { label: string; url: string; note?: string }

const COMMON: Authority[] = [
  { label: 'IRS — Independent contractor (self-employed) tax guidance', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/independent-contractor-defined' },
];

const BY_KEYWORD: { re: RegExp; items: Authority[] }[] = [
  {
    re: /electric/i,
    items: [
      { label: 'NFPA — National Electrical Code (NEC) overview', url: 'https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70' },
      { label: 'CSLB — C-10 Electrical Contractor licence (California)', url: 'https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx' },
      { label: 'OSHA — Electrical safety standards (29 CFR 1910 Subpart S)', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910SubpartS' },
    ],
  },
  {
    re: /plumb/i,
    items: [
      { label: 'IAPMO — Uniform Plumbing Code', url: 'https://www.iapmo.org/uniform-plumbing-code/' },
      { label: 'EPA — Lead-Safe RRP rule (renovation, repair, painting)', url: 'https://www.epa.gov/lead/lead-safe-certified-renovation-repair-and-painting-program' },
      { label: 'EPA — Safe Drinking Water Act (backflow and cross-connection)', url: 'https://www.epa.gov/sdwa' },
    ],
  },
  {
    re: /hvac|air condition/i,
    items: [
      { label: 'EPA — Section 608 refrigerant certification', url: 'https://www.epa.gov/section608' },
      { label: 'DOE — SEER2 / HSPF2 efficiency standards', url: 'https://www.energy.gov/eere/buildings/standards-and-test-procedures' },
      { label: 'AHRI — Directory of Certified Product Performance', url: 'https://www.ahrinet.org/product-directory' },
    ],
  },
  {
    re: /pest/i,
    items: [
      { label: 'EPA — Pesticide regulation and applicator certification', url: 'https://www.epa.gov/pesticide-worker-safety' },
      { label: 'EPA — Pesticide product and label search', url: 'https://www.epa.gov/pesticides/pesticide-product-label-system' },
      { label: 'California SPCB — Structural Pest Control Board', url: 'https://www.pestboard.ca.gov/' },
    ],
  },
  {
    re: /roof/i,
    items: [
      { label: 'OSHA — Fall protection for residential roofing', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.501' },
      { label: 'NRCA — National Roofing Contractors Association', url: 'https://www.nrca.net/' },
      { label: 'FEMA — Wind and hail roofing standards', url: 'https://www.fema.gov/emergency-managers/risk-management/building-science' },
    ],
  },
  {
    re: /drywall|plaster/i,
    items: [
      { label: 'Gypsum Association — GA-214 recommended levels of finish', url: 'https://www.gypsum.org/codes-standards/ga-214/' },
      { label: 'Gypsum Association — GA-216 application standards', url: 'https://www.gypsum.org/codes-standards/ga-216/' },
      { label: 'CSLB — C-9 Drywall Contractor licence', url: 'https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx' },
    ],
  },
  {
    re: /weld|fabricat/i,
    items: [
      { label: 'AWS — D1.1 Structural Welding Code (Steel)', url: 'https://www.aws.org/standards/page/d11' },
      { label: 'OSHA — Welding, cutting and brazing (29 CFR 1910 Subpart Q)', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910SubpartQ' },
      { label: 'American Institute of Steel Construction — Code of Standard Practice', url: 'https://www.aisc.org/publications/steel-standards/' },
    ],
  },
  {
    re: /paint/i,
    items: [
      { label: 'EPA — Lead-Safe RRP rule (pre-1978 housing)', url: 'https://www.epa.gov/lead/lead-safe-certified-renovation-repair-and-painting-program' },
      { label: 'Master Painters Institute — coating performance standards', url: 'https://www.mpi.net/' },
      { label: 'OSHA — Spray finishing and ventilation (29 CFR 1910.107)', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.107' },
    ],
  },
  {
    re: /landscap|irrigation/i,
    items: [
      { label: 'EPA — WaterSense irrigation guidance', url: 'https://www.epa.gov/watersense' },
      { label: 'USDA — Plant hardiness zone map', url: 'https://planthardiness.ars.usda.gov/' },
      { label: 'State contractor licensing lookup (CSLB example)', url: 'https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx' },
    ],
  },
  {
    re: /tile|tiling/i,
    items: [
      { label: 'TCNA — Tile Council of North America installation handbook', url: 'https://www.tcnatile.com/' },
      { label: 'ANSI — A108 ceramic tile standards', url: 'https://www.ansi.org/' },
      { label: 'Mapei / TCNA — substrate flatness tolerances', url: 'https://www.tcnatile.com/faqs.html' },
    ],
  },
  {
    re: /deck|framing|framer|carpent/i,
    items: [
      { label: 'American Wood Council — Wood construction data', url: 'https://www.awc.org/codes-standards/publications' },
      { label: 'ICC — International Residential Code (deck provisions)', url: 'https://www.iccsafe.org/' },
      { label: 'OSHA — Fall protection in construction', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.501' },
    ],
  },
  {
    re: /solar/i,
    items: [
      { label: 'DOE — Homeowner solar and tax credit guidance', url: 'https://www.energy.gov/eere/solar/homeowners-guide-going-solar' },
      { label: 'NREL — PV system performance resources', url: 'https://www.nrel.gov/pv/' },
      { label: 'NEC Article 690 — Solar photovoltaic systems', url: 'https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70' },
    ],
  },
  {
    re: /appliance/i,
    items: [
      { label: 'EPA — Section 608 refrigerant handling', url: 'https://www.epa.gov/section608' },
      { label: 'OSHA — Hazard communication (SDS) 29 CFR 1910.1200', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1200' },
      { label: 'ENERGY STAR — appliance efficiency standards', url: 'https://www.energystar.gov/' },
    ],
  },
  {
    re: /clean/i,
    items: [
      { label: 'OSHA — Hazard communication and chemical safety', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1200' },
      { label: 'ISSA — cleaning industry standards and training', url: 'https://www.issa.com/' },
      { label: 'EPA — Safer Choice product certification', url: 'https://www.epa.gov/saferchoice' },
    ],
  },
  {
    re: /credit note/i,
    items: [
      { label: 'IRS — Sales tax and recordkeeping requirements', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/recordkeeping' },
      { label: 'IRS — Publication 583, Starting a Business and Keeping Records', url: 'https://www.irs.gov/publications/p583' },
      { label: 'FASB — Revenue from Contracts with Customers (ASC 606)', url: 'https://www.fasb.org/' },
    ],
  },
  {
    re: /general contractor/i,
    items: [
      { label: 'IRS — 1099-NEC reporting for subcontractors', url: 'https://www.irs.gov/forms-pubs/about-form-1099-nec' },
      { label: 'NASCLA — National Association of State Contractors Licensing', url: 'https://www.nascla.org/' },
      { label: 'OSHA — Multi-employer worksite policy (construction)', url: 'https://www.osha.gov/laws-regs/standardinterpretations/1999-12-10-0' },
    ],
  },
];

const DEFAULT: Authority[] = [
  { label: 'NASCLA — State contractor licensing agencies', url: 'https://www.nascla.org/' },
  { label: 'IRS — Small business and self-employed tax centre', url: 'https://www.irs.gov/businesses/small-businesses-self-employed' },
];

export function authoritiesFor(tradeName: string, docType: string, extraKeyword = ''): Authority[] {
  const hay = `${tradeName} ${docType} ${extraKeyword}`;
  const hit = BY_KEYWORD.find((g) => g.re.test(hay));
  const base = hit ? hit.items : DEFAULT;
  // 每个页面至少 3 条，最多 4 条；补一条通用 IRS 链接让企业所得税口径也有出处
  const out = [...base];
  if (out.length < 3) out.push(COMMON[0]);
  return out.slice(0, 4);
}
