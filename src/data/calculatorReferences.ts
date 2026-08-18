export interface CalculatorReference {
  label: string;
  reviewedDate: string;
  sourceLabel: string;
  sourceUrl: string;
}

export const calculatorReferences: Readonly<Record<string, CalculatorReference>> = {
  'income-tax-calculator': {
    label: 'Rules configured for AY 2026-27 (FY 2025-26)',
    reviewedDate: '17 August 2026',
    sourceLabel: 'Income Tax Department',
    sourceUrl: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
  },
  'gratuity-calculator': {
    label: 'Configurable gratuity assumptions and ₹20 lakh ceiling',
    reviewedDate: '17 August 2026',
    sourceLabel: 'Ministry of Labour and Employment',
    sourceUrl: 'https://www.labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf',
  },
  'ppf-calculator': {
    label: 'PPF rate is an editable projection assumption',
    reviewedDate: '17 August 2026',
    sourceLabel: 'Department of Economic Affairs',
    sourceUrl: 'https://dea.gov.in/files/annual_reports_documents/FINAL%20ANNUAL%20REPORT%20ENGLISH%20with%20cover%20(2).pdf',
  },
  'epf-calculator': {
    label: 'EPF rate and contribution shares are editable assumptions',
    reviewedDate: '17 August 2026',
    sourceLabel: 'Employees’ Provident Fund Organisation',
    sourceUrl: 'https://www.epfindia.gov.in/site_docs/PDFs/EPFO_PRESS_RELEASES/PressBrief_MOL&EChairs238thMeetingCBT_EPF_13102025.pdf',
  },
};
