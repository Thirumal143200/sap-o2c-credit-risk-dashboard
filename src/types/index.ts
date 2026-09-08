export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PaymentHistoryRating = 'Excellent' | 'Good' | 'Average' | 'Poor';
export type UserRole = 'SALES_USER' | 'CREDIT_MANAGER';

export type O2CStage = 
  | 'SALES_ORDER'
  | 'CREDIT_CHECK'
  | 'DELIVERY'
  | 'GOODS_ISSUE'
  | 'BILLING'
  | 'PAYMENT';

export type OrderStatus = 
  | 'DRAFT'
  | 'PENDING_CREDIT_CHECK'
  | 'APPROVED'
  | 'CREDIT_BLOCKED'
  | 'RELEASED'
  | 'IN_DELIVERY'
  | 'GOODS_ISSUED'
  | 'BILLED'
  | 'CLEARED';

export type CreditStatus = 'PENDING' | 'APPROVED' | 'BLOCKED' | 'RELEASED';

export interface Material {
  id: string; // e.g. MAT-4001
  name: string;
  category: string;
  unitPrice: number; // in INR
  unitOfMeasure: string;
}

export interface OrderItem {
  itemNumber: number; // 10, 20, 30
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number; // in INR
  netValue: number; // in INR
}

export interface Customer {
  id: string; // BP-100001
  name: string;
  creditLimit: number; // in INR
  currentExposure: number; // in INR (unbilled/billed open exposure)
  availableCredit: number; // creditLimit - currentExposure
  overdueReceivables: number; // in INR
  paymentHistory: PaymentHistoryRating;
  riskScore: number;
  riskCategory: RiskCategory;
  blockedOrdersCount: number;
  openOrdersCount: number;
  completedOrdersCount: number;
  industry: string;
  city: string;
}

export interface RiskBreakdown {
  overdueAmount: number;
  overduePoints: number;
  creditUtilizationPct: number;
  creditUtilizationPoints: number;
  paymentHistory: PaymentHistoryRating;
  paymentHistoryPoints: number;
  blockedOrdersCount: number;
  blockedOrdersPoints: number;
  orderPressurePoints: number;
  orderCausesOverLimit: boolean;
  totalScore: number;
  riskCategory: RiskCategory;
}

export interface ReleaseAudit {
  releasedBy: string;
  role: UserRole;
  releaseReason: string;
  releasedAt: string;
}

export interface SapDocuments {
  salesOrder: string; // SO-100001
  delivery?: string; // DEL-800001
  goodsIssue?: string; // GI-500001
  billingDocument?: string; // INV-900001
  paymentClearing?: string; // CLR-700001
}

export interface SalesOrder {
  id: string; // SO-100001
  customerId: string; // BP-100001
  customerName: string;
  orderDate: string; // YYYY-MM-DD
  orderValue: number; // in INR
  creditLimit: number;
  currentExposure: number;
  overdueAmount: number;
  riskScore: number;
  riskCategory: RiskCategory;
  orderStatus: OrderStatus;
  creditStatus: CreditStatus;
  currentStage: O2CStage;
  items: OrderItem[];
  documents: SapDocuments;
  riskBreakdown?: RiskBreakdown;
  creditBlockReason?: string;
  releaseAudit?: ReleaseAudit;
  nextAction: string;
}

export interface ValidationResult {
  valid: boolean;
  ruleNumber?: number;
  ruleName?: string;
  reason: string;
  customerCreditLimit?: number;
  projectedExposure?: number;
  exceededBy?: number;
  requiredAction: string;
}

export interface AiRecommendation {
  summary: string;
  decision: 'APPROVE' | 'MANAGER_REVIEW' | 'CRITICAL_BLOCK';
  reasons: string[];
  groundedFacts: {
    label: string;
    value: string;
  }[];
  recommendedAction: string;
}
