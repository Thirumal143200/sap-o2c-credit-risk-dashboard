# Assessment Simulation — SAP O2C Credit Risk Control Dashboard

> **IMPORTANT DISCLAIMER**  
> *This project is an assessment simulation inspired by the SAP Order-to-Cash (O2C) business process. It does not connect to a live SAP system.*

---

## 1. Project Overview

The **SAP O2C Credit Risk Control Dashboard** is an enterprise-grade web application engineered to model and enforce credit risk governance within the SAP Order-to-Cash (O2C) lifecycle.

In high-volume enterprise sales environments (modeled after SAP S/4HANA Sales & Distribution and Credit Management modules), sales employees continuously book customer sales orders. Uncontrolled order fulfillment without automated credit checks exposes the enterprise to severe liquidity risks, uncollectable bad debts, and working capital erosion.

This simulation models the end-to-end O2C lifecycle, a transparent deterministic credit scoring engine, role-based authorization controls, strict sequence guards, and a grounded AI Credit Review Assistant.

---

## 2. Business Problem & Control Objectives

Before any customer sales order is allowed to proceed to warehouse fulfillment and outbound delivery, the enterprise must evaluate:
- **Customer Credit Limit**: Approved master credit ceiling.
- **Current Credit Exposure**: Existing unbilled and open receivables balance.
- **Outstanding Overdue Receivables**: Aged overdue invoices awaiting debt recovery.
- **Order Net Value**: Proposed transaction exposure.
- **Customer Payment History Track Record**: Empirical payment reliability rating.
- **Existing Blocked Orders Count**: Active credit block occurrences.

### Automated Decision Outcomes:
1. **APPROVED**: Order falls safely within credit headroom and customer risk threshold.
2. **CREDIT BLOCKED**: Order causes credit limit breach or customer risk exceeds tolerance.
3. **MANAGER REVIEW**: Requires authorized Credit Risk Manager inspection and release.

---

## 3. SAP Business Process Flow (O2C)

The application models the authentic SAP Sales & Distribution (SD) and Financial Accounting (FI) workflow:

```
[ Sales Order (VA01) ]
         ↓
 [ Credit Check (VKM1) ]
   ├── Credit Blocked? → [ Manager Review & Release (VKM3) ]
   └── Approved
         ↓
[ Outbound Delivery (VL01N) ]
         ↓
[ Picking & Post Goods Issue (VL02N / PGI) ]
         ↓
 [ Customer Invoice / Billing (VF01) ]
         ↓
[ Incoming Payment & AR Clearing (F-28) ]
```

### SAP Document Numbering Conventions Modeled:
- **Sales Orders**: `SO-100001` – `SO-100020`
- **Business Partners / Customers**: `BP-100001` – `BP-100010`
- **Outbound Deliveries**: `DEL-800001`+
- **Goods Issue Documents**: `GI-500001`+
- **Billing Documents (Invoices)**: `INV-900001`+
- **AR Clearing Documents**: `CLR-700001`+
- **Materials**: `MAT-4001` – `MAT-4007`

---

## 4. Deterministic Credit Risk Engine

To guarantee 100% explainable and audit-proof credit decisions, the application implements a **transparent deterministic scoring algorithm** based entirely on factual customer ledger metrics:

### Risk Scoring Matrix (Max 140 Points):

| Dimension | Range / Category | Penalty Points |
|---|---|---|
| **Overdue Amount** | ₹0 | `0 pts` |
| | ₹1 – ₹10,000 | `10 pts` |
| | ₹10,001 – ₹50,000 | `25 pts` |
| | ₹50,001+ | `40 pts` |
| **Credit Utilization** | Below 50% | `0 pts` |
| | 50% – 75% | `10 pts` |
| | 76% – 100% | `20 pts` |
| | Above 100% | `35 pts` |
| **Payment History** | Excellent | `0 pts` |
| | Good | `5 pts` |
| | Average | `10 pts` |
| | Poor | `20 pts` |
| **Existing Blocked Orders** | 0 orders | `0 pts` |
| | 1 order | `10 pts` |
| | 2+ orders | `20 pts` |
| **Order-to-Credit Pressure** | Projected exposure > Limit | `+25 pts` |

### Risk Classifications:
- **0 – 24**: `LOW RISK`
- **25 – 49**: `MEDIUM RISK`
- **50 – 74**: `HIGH RISK`
- **75+**: `CRITICAL RISK`

---

## 5. SAP-Aligned Business Validation Rules

The application enforces 7 non-negotiable business validation controls:

1. **RULE 1 (Credit Limit Exposure Violation)**: If projected exposure (`Current Exposure + Order Value`) exceeds the approved limit, the order is blocked with: `"Credit Block: Order would exceed customer credit limit."`
2. **RULE 2 (Critical Customer Risk Guard)**: If a customer is classified as `CRITICAL` risk, fulfillment is halted with: `"Fulfillment blocked: Customer is classified as CRITICAL risk."`
3. **RULE 3 (Credit Block Delivery Prevention)**: Credit-blocked orders are strictly prevented from advancing to Outbound Delivery (`DEL`). Displays exact exceeded exposure, customer credit limit, and mandatory remediation action.
4. **RULE 4 (Role Authorization Check)**: Only the `CREDIT_MANAGER` role can release credit blocks. The `SALES_USER` role is prohibited from overriding credit blocks.
5. **RULE 5 (Mandatory Audit Release Reason)**: A Credit Manager cannot release an order without entering a documented release justification reason (`"Release reason is required."`).
6. **RULE 6 (Billing Sequence Guard)**: An invoice cannot be generated prior to Outbound Delivery and Post Goods Issue (PGI) completion.
7. **RULE 7 (Payment Clearing Sequence Guard)**: AR payment clearing cannot be executed without an active billing document.

---

## 6. AI Credit Review Assistant

Rather than relying on a generic chatbot or hallucinated text, the built-in **AI Credit Review Assistant** produces grounded credit advisory recommendations based exclusively on verified transactional facts:
- Synthesizes credit headroom, overdue receivables aging, historical payment track record, and order pressure.
- Formulates specific business recommendations (`APPROVE`, `MANAGER REVIEW REQUIRED`, or `CRITICAL BLOCK`).
- Displays direct factual citations without inventing customers, values, or documents.
- Designed with modular architecture to connect to external LLM endpoints if configured, operating 100% offline and deterministically by default.

---

## 7. Technology Stack

- **Core Framework**: React 19 + TypeScript
- **Bundler & Build Tool**: Vite 8
- **Design System & Styling**: Tailwind CSS v4 with custom enterprise SAP Horizon / Fiori-inspired palette
- **Icons**: Lucide React
- **Automated Test Runner**: Vitest (10/10 automated validation tests)
- **State Management**: Reactive React Context with localStorage persistence and simulation master reset
- **Deployment Platform**: Public static hosting (Surge / Vercel / Netlify)

---

## 8. Seed Master & Transactional Data

The application ships with realistic master data configured to demonstrate all scenarios:
- **10 Customers (Business Partners)**:
  - `BP-100001`: Tata Steel Manufacturing Ltd (LOW Risk, ₹500k limit)
  - `BP-100002`: Reliance Infrastructure Works (LOW Risk, ₹400k limit)
  - `BP-100003`: Bharat Forge Heavy Engineering (MEDIUM Risk, ₹300k limit)
  - `BP-100004`: Larsen & Toubro EPC Projects (HIGH Risk, ₹350k limit)
  - `BP-100005`: Zenith Logistics & Transport Corp (CRITICAL Risk, ₹200k limit, ₹55k overdue)
  - `BP-100006`: Kirloskar Engine Systems (LOW Risk, ₹250k limit)
  - `BP-100007`: Apex Foundry & Casting Ltd (CRITICAL Risk, ₹150k limit, ₹62k overdue)
  - `BP-100008`: Mahindra Defense Utilities (MEDIUM Risk, ₹450k limit)
  - `BP-100009`: Hindalco Industrial Rolling (HIGH Risk, ₹320k limit)
  - `BP-100010`: Godrej Process Equipment (LOW Risk, ₹280k limit)
- **20 Seeded Sales Orders** (`SO-100001` through `SO-100020`) testing:
  - Automatic credit approvals (`SO-100001`, `SO-100002`, `SO-100014`, etc.)
  - Credit limit violators (`SO-100003`, `SO-100004`)
  - Critical customer blocks (`SO-100005`, `SO-100007`, `SO-100019`)
  - Manager released orders with documented audit records (`SO-100006`, `SO-100015`)
  - Mid-lifecycle orders in Delivery, Goods Issue, Billing, and Cleared states

---

## 9. Local Setup & Execution

### Prerequisites
- Node.js 18+ (tested on Node v24.19.0)
- npm 9+

### Installation & Run Steps
```bash
# 1. Install project dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Build production bundle
npm run build

# 4. Preview production build locally
npm run preview
```
The application will launch locally at `http://127.0.0.1:4173/`.

---

## 10. Automated Testing Results

The automated Vitest test suite verifies all 10 required test scenarios:

```
 RUN  v5.0.0

 ✓ src/test/sapValidation.test.ts (10 tests)
   ✓ 1. Low-risk order approval: Approves within limit for excellent customer
   ✓ 2. Credit-limit violation: Blocks when projected exposure exceeds credit limit (RULE 1)
   ✓ 3. Critical customer block: Rejects fulfillment when customer is CRITICAL risk (RULE 2)
   ✓ 4. Manager release: Allows authorized Credit Manager to release with valid reason (RULE 4)
   ✓ 5. Missing release reason: Rejects release when reason is missing or empty (RULE 5)
   ✓ 6. Blocked order attempting delivery: Rejects direct delivery progression (RULE 3)
   ✓ 7. Billing before delivery: Rejects billing without prior delivery and goods issue (RULE 6)
   ✓ 8. Payment before billing: Rejects payment clearing without billing document (RULE 7)
   ✓ 9. Correct risk calculation: Accurately computes exact score breakdown across all 5 dimensions
   ✓ 10. Correct O2C status transitions: Validates progression through the full lifecycle sequence

 Test Files  1 passed (1)
      Tests  10 passed (10)
```

---

## 11. Git & Deployment Details

- **GitHub Repository**: [sap-o2c-credit-risk-dashboard](https://github.com/thirumal143200/sap-o2c-credit-risk-dashboard)
- **Live Deployed URL**: Public deployment link verified below in final delivery report.

---

## 12. Known Limitations
- The application is an in-memory client-side assessment simulation; it does not connect to a real SAP ERP (ECC or S/4HANA) RFC or OData service.
- Data changes are persisted in browser `localStorage` and can be restored anytime via the **Reset Demo** button.
