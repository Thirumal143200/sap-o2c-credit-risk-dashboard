# SAP O2C Credit Risk Control Dashboard

> **Assessment Simulation — SAP Order-to-Cash (O2C) Credit Risk Management**

[![Deploy to GitHub Pages](https://github.com/Thirumal143200/sap-o2c-credit-risk-dashboard/actions/workflows/deploy.yml/badge.svg)](https://github.com/Thirumal143200/sap-o2c-credit-risk-dashboard/actions/workflows/deploy.yml)
[![Tests](https://img.shields.io/badge/tests-10%2F10%20passing-brightgreen)](https://github.com/Thirumal143200/sap-o2c-credit-risk-dashboard/actions)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Live Demo

**[https://thirumal143200.github.io/sap-o2c-credit-risk-dashboard/](https://thirumal143200.github.io/sap-o2c-credit-risk-dashboard/)**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [SAP O2C Process Flow](#sap-o2c-process-flow)
4. [Credit Risk Engine](#credit-risk-engine)
5. [Business Validation Rules](#business-validation-rules)
6. [AI Credit Review Assistant](#ai-credit-review-assistant)
7. [Technology Stack](#technology-stack)
8. [Project Structure](#project-structure)
9. [Seed Data](#seed-data)
10. [Local Setup](#local-setup)
11. [Testing](#testing)
12. [CI/CD & Deployment](#cicd--deployment)
13. [Git History](#git-history)
14. [Known Limitations](#known-limitations)

---

## Overview

This is a **production-grade, enterprise web application** that simulates the complete **SAP Order-to-Cash (O2C) Credit Risk Control** workflow. It faithfully models the credit risk assessment, credit block management, and O2C lifecycle progression found in SAP ECC and SAP S/4HANA environments — including SAP transaction codes (VA01, VKM1, VKM3, VL01N, VF01, F-28), SAP document numbering conventions, and role-based authorization controls.

The application is **100% client-side** with no backend dependency, making it immediately deployable and demonstrable in any environment.

---

## Features

| Feature | Description |
|---------|-------------|
| **Full O2C Lifecycle** | Sales Order → Credit Check → Delivery → Billing → Payment |
| **Deterministic Risk Engine** | Transparent 0–100 scoring across 5 dimensions |
| **7 SAP Business Rules** | Credit block, CRITICAL guard, sequence enforcement, RBAC |
| **AI Credit Review Assistant** | Grounded advisory recommendations per customer |
| **Role-Based Access** | `SALES_USER` and `CREDIT_MANAGER` roles with distinct permissions |
| **Dashboard KPIs** | Total exposure, overdue receivables, risk distribution charts |
| **Manager Release Modal** | Audit-logged credit block release with mandatory justification |
| **10 Automated Tests** | Full Vitest suite covering all validation rules |
| **Realistic Seed Data** | 10 business partners + 20 sales orders across all scenarios |
| **localStorage Persistence** | State survives page refresh; one-click Demo Reset |

---

## SAP O2C Process Flow

The application enforces the following strict stage sequence, mirroring real SAP document flow:

```
┌─────────────────────────────────┐
│    Sales Order (VA01)           │  ← Created by Sales User
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│   Credit Check (VKM1)           │  ← Automatic — triggers risk engine
│   ┌──────── Blocked? ─────────┐ │
│   │  YES → Manager Review     │ │  ← VKM3: Credit Manager releases
│   │         (VKM3)            │ │     with mandatory audit reason
│   └───────────────────────────┘ │
└──────────────┬──────────────────┘
               │ Approved
┌──────────────▼──────────────────┐
│  Outbound Delivery (VL01N)      │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Picking & Post Goods Issue     │  ← VL02N / PGI
│  (VL02N / PGI)                  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Customer Invoice / Billing     │  ← VF01
│  (VF01)                         │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│  Incoming Payment & AR Clearing │  ← F-28
│  (F-28)                         │
└─────────────────────────────────┘
```

### SAP Document Numbering Modeled

| Document Type | Range |
|--------------|-------|
| Sales Orders | `SO-100001` – `SO-100020` |
| Business Partners | `BP-100001` – `BP-100010` |
| Outbound Deliveries | `DEL-800001`+ |
| Goods Issue Documents | `GI-500001`+ |
| Billing Documents (Invoices) | `INV-900001`+ |
| AR Clearing Documents | `CLR-700001`+ |
| Materials | `MAT-4001` – `MAT-4007` |

---

## Credit Risk Engine

The application implements a **fully transparent, deterministic scoring algorithm** based exclusively on factual customer ledger metrics. No black-box ML — every score is 100% explainable and audit-proof.

### Scoring Matrix (Max 140 Points)

| Dimension | Threshold | Penalty Points |
|-----------|-----------|---------------|
| **Overdue Amount** | ≤ ₹0 | 0 pts |
| | ₹1 – ₹110,000 | 10 pts |
| | ₹110,001 – ₹150,000 | 25 pts |
| | ₹150,001+ | 40 pts |
| **Credit Utilization** | Below 50% | 0 pts |
| | 50% – 75% | 10 pts |
| | 76% – 100% | 20 pts |
| | Above 100% | 35 pts |
| **Payment History** | Excellent | 0 pts |
| | Good | 5 pts |
| | Average | 10 pts |
| | Poor | 20 pts |
| **Blocked Orders** | 0 orders | 0 pts |
| | 1 order | 10 pts |
| | 2+ orders | 20 pts |
| **Order Pressure** | Projected exposure > Limit | +25 pts |

### Risk Classifications

| Score | Category | Action |
|-------|----------|--------|
| 0 – 24 | 🟢 **LOW** | Auto-approve |
| 25 – 49 | 🟡 **MEDIUM** | Proceed with caution |
| 50 – 74 | 🟠 **HIGH** | Manager review recommended |
| 75+ | 🔴 **CRITICAL** | Hard block — fulfillment halted |

---

## Business Validation Rules

Seven non-negotiable SAP-aligned controls are enforced by the application:

| # | Rule | Description |
|---|------|-------------|
| **1** | Credit Limit Exposure | If `Current Exposure + Order Value > Credit Limit`, order is credit-blocked |
| **2** | Critical Customer Guard | `CRITICAL` risk customers are hard-blocked from any fulfillment |
| **3** | Credit Block Delivery Prevention | Credit-blocked orders cannot advance to Outbound Delivery |
| **4** | Role Authorization Check | Only `CREDIT_MANAGER` can release credit blocks |
| **5** | Mandatory Release Reason | Release justification is required (blank = rejected) |
| **6** | Billing Sequence Guard | Invoice cannot be raised before Delivery + PGI are complete |
| **7** | Payment Sequence Guard | AR clearing requires an active billing document |

---

## AI Credit Review Assistant

The built-in **AI Credit Review Assistant** produces grounded credit advisory recommendations based exclusively on verified transactional data:

- Synthesizes credit headroom, overdue receivables aging, payment track record, and order pipeline pressure
- Issues structured recommendations: `APPROVE` / `MANAGER REVIEW REQUIRED` / `CRITICAL BLOCK`
- Cites direct factual data — no hallucinated customers, values, or documents
- Works **100% offline** — no external API dependency
- Architecturally designed to plug into external LLM endpoints when configured

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19 |
| Language | TypeScript | 6 |
| Build Tool | Vite | 8 |
| Styling | Tailwind CSS | v4 |
| Icons | Lucide React | latest |
| Testing | Vitest | 5 |
| State | React Context + localStorage | — |
| CI/CD | GitHub Actions | — |
| Hosting | GitHub Pages | — |

---

## Project Structure

```
sap-o2c-credit-risk-dashboard/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: test → build → deploy to GitHub Pages
├── public/
├── src/
│   ├── types/
│   │   └── index.ts            # Domain models: Customer, SalesOrder, O2CStage, etc.
│   ├── data/
│   │   └── seedData.ts         # 10 business partners + 20 seeded sales orders
│   ├── utils/
│   │   ├── creditEngine.ts     # Deterministic credit risk scoring engine
│   │   ├── validationRules.ts  # 7 SAP O2C business rules & sequence enforcement
│   │   └── aiAssistant.ts      # AI Credit Review Assistant (rule-based)
│   ├── context/
│   │   └── AppContext.tsx      # Global state, role switching, localStorage sync
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── KpiCards.tsx
│   │   ├── AnalyticsCharts.tsx
│   │   ├── CustomerList.tsx
│   │   ├── OrderList.tsx
│   │   ├── OrderDetailsView.tsx
│   │   ├── ManagerReleaseModal.tsx
│   │   ├── NewOrderModal.tsx
│   │   ├── Toast.tsx
│   │   └── ValidationModal.tsx
│   ├── test/
│   │   └── sapValidation.test.ts  # 10 automated Vitest tests
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Seed Data

The application ships with realistic master data to demonstrate all credit risk scenarios:

### Business Partners (Customers)

| ID | Name | Risk | Credit Limit | Overdue |
|----|------|------|-------------|---------|
| BP-100001 | Tata Steel Manufacturing Ltd | 🟢 LOW | ₹15,00,000 | — |
| BP-100002 | Reliance Infrastructure Works | 🟢 LOW | ₹14,00,000 | — |
| BP-100003 | Bharat Forge Heavy Engineering | 🟡 MEDIUM | ₹13,00,000 | — |
| BP-100004 | Larsen & Toubro EPC Projects | 🟠 HIGH | ₹13,50,000 | — |
| BP-100005 | Zenith Logistics & Transport Corp | 🔴 CRITICAL | ₹12,00,000 | ₹1,55,000 |
| BP-100006 | Kirloskar Engine Systems | 🟢 LOW | ₹12,50,000 | — |
| BP-100007 | Apex Foundry & Casting Ltd | 🔴 CRITICAL | ₹11,50,000 | ₹1,62,000 |
| BP-100008 | Mahindra Defense Utilities | 🟡 MEDIUM | ₹14,50,000 | — |
| BP-100009 | Hindalco Industrial Rolling | 🟠 HIGH | ₹13,20,000 | — |
| BP-100010 | Godrej Process Equipment | 🟢 LOW | ₹12,80,000 | — |

### Sales Orders Seeded

20 orders (`SO-100001` through `SO-100020`) covering:
- ✅ Auto-approved orders (within limit, low-risk customer)
- 🚫 Credit limit violations (exposure exceeds limit)
- 🔴 CRITICAL customer hard blocks
- 🔓 Manager-released orders with audit records
- 📦 Mid-lifecycle orders (Delivery, PGI, Billing, Cleared states)

---

## Local Setup

### Prerequisites

- Node.js 18+ (tested on Node v24.x)
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/Thirumal143200/sap-o2c-credit-risk-dashboard.git
cd sap-o2c-credit-risk-dashboard

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The dev server launches at `http://localhost:5173/` and the preview server at `http://127.0.0.1:4173/sap-o2c-credit-risk-dashboard/`.

---

## Testing

The Vitest test suite validates all 10 required scenarios:

```
 RUN  v5.0.0

 ✓ src/test/sapValidation.test.ts (10 tests) 9ms
   ✓ 1.  Low-risk order approval: Approves within limit for excellent customer
   ✓ 2.  Credit-limit violation: Blocks when projected exposure exceeds credit limit (RULE 1)
   ✓ 3.  Critical customer block: Rejects fulfillment when customer is CRITICAL risk (RULE 2)
   ✓ 4.  Manager release: Allows authorized Credit Manager to release with valid reason (RULE 4)
   ✓ 5.  Missing release reason: Rejects release when reason is missing or empty (RULE 5)
   ✓ 6.  Blocked order attempting delivery: Rejects direct delivery progression (RULE 3)
   ✓ 7.  Billing before delivery: Rejects billing without prior delivery and PGI (RULE 6)
   ✓ 8.  Payment before billing: Rejects payment clearing without billing document (RULE 7)
   ✓ 9.  Correct risk calculation: Accurately computes score breakdown across all 5 dimensions
   ✓ 10. Correct O2C status transitions: Validates full lifecycle sequence progression

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Duration  280ms
```

Run tests with:
```bash
npm test
```

---

## CI/CD & Deployment

Every push to `main` triggers the automated GitHub Actions pipeline:

```
push to main
     │
     ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌───────────────┐
│  Checkout   │───▶│ npm install  │───▶│  npm test    │───▶│  npm build    │
└─────────────┘    └──────────────┘    └──────────────┘    └───────┬───────┘
                                                                    │
                                                                    ▼
                                                          ┌─────────────────┐
                                                          │ Deploy to       │
                                                          │ GitHub Pages    │
                                                          └─────────────────┘
```

**Live URL**: [https://thirumal143200.github.io/sap-o2c-credit-risk-dashboard/](https://thirumal143200.github.io/sap-o2c-credit-risk-dashboard/)

---

## Git History

```
d0dba6b  ci: add GitHub Actions deploy workflow and set base path for GitHub Pages
abafe2b  chore: add config files and static assets
731e3bc  prepare deployment
60b5b96  add testing
8166b8f  add AI credit assistant
9e45395  add dashboard
a6bb116  add validation rules
b7c1d6a  add credit risk engine
892523a  add SAP O2C data model
a38e591  initial project setup
```

---

## Known Limitations

- **Simulation only**: The app does not connect to a real SAP ERP (ECC or S/4HANA) RFC or OData service.
- **Client-side persistence**: All data lives in browser `localStorage`. Use the **Reset Demo** button to restore the original seed data.
- **AI Assistant**: The credit assistant is rule-based. Connecting to a live LLM (Gemini, GPT-4, etc.) requires adding an API key in `src/utils/aiAssistant.ts`.
---

*Built with React 19 + TypeScript + Vite + Tailwind CSS v4. Deployed on GitHub Pages.*
