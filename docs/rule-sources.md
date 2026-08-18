# Configurable Financial Rule Sources

These references support defaults and statutory assumptions that can change. The calculator UI always exposes changing rates as assumptions where practical.

## Income tax

Configured rule set: **AY 2026-27 / FY 2025-26**, resident individual below age 60, normal slab-rate salary and other income.

- Income Tax Department — Salaried Individuals for AY 2026-27: https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1
- Income Tax Department — ITR-2 FAQs, including new-regime AY 2026-27 slab/rebate information: https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/itr-2/itr-2-faqs
- Income Tax Department — AY 2026-27 validation rules, including standard-deduction and old-regime deduction limits: https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/CBDT__e-Filing_ITR%202_Validation%20Rules_AY%202026-27_V1.0.pdf

The focused engine excludes surcharge, special-rate income and capital gains. New years belong in `src/config/taxRules.ts` rather than UI components.

## Gratuity

- Ministry of Labour and Employment — Labour Codes FAQ: https://www.labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf
- Ministry brief on the ₹20 lakh gratuity ceiling: https://labour.gov.in/sites/default/files/gratuity_2.pdf

Formula and limit parameters are centralized in `src/config/financialRules.ts`.

## PPF

- Department of Economic Affairs Annual Report 2025-26, showing PPF at 7.1% across the reported quarters and explaining that small-savings rates are notified: http://dea.gov.in/files/annual_reports_documents/FINAL%20ANNUAL%20REPORT%20ENGLISH%20with%20cover%20(2).pdf

The rate remains an editable calculator input because future notifications can change it.

## EPF

- EPFO press brief describing the prevailing 8.25% rate: https://www.epfindia.gov.in/site_docs/PDFs/EPFO_PRESS_RELEASES/PressBrief_MOL&EChairs238thMeetingCBT_EPF_13102025.pdf

The EPF rate and default contribution assumptions are centralized and editable. Employer EPF allocation is not inferred because EPS allocation and wage ceilings can vary.
