import { describe, it, expect } from 'vitest';
import { calculateRiskBreakdown } from '../utils/creditEngine';
import {
  validateCreditLimit,
  validateCustomerRisk,
  validateDeliveryCreation,
  validateManagerRelease,
  validateBillingCreation,
  validatePaymentClearing,
} from '../utils/validationRules';
import type { Customer, SalesOrder } from '../types';

// Mock test fixture helpers
const createMockCustomer = (overrides?: Partial<Customer>): Customer => ({
  id: 'BP-TEST01',
  name: 'Test Business Partner Ltd',
  creditLimit: 200000,
  currentExposure: 50000,
  availableCredit: 150000,
  overdueReceivables: 0,
  paymentHistory: 'Excellent',
  riskScore: 0,
  riskCategory: 'LOW',
  blockedOrdersCount: 0,
  openOrdersCount: 1,
  completedOrdersCount: 5,
  industry: 'Heavy Machinery',
  city: 'Mumbai',
  ...overrides,
});

const createMockOrder = (overrides?: Partial<SalesOrder>): SalesOrder => ({
  id: 'SO-TEST01',
  customerId: 'BP-TEST01',
  customerName: 'Test Business Partner Ltd',
  orderDate: '2026-03-01',
  orderValue: 40000,
  creditLimit: 200000,
  currentExposure: 50000,
  overdueAmount: 0,
  riskScore: 0,
  riskCategory: 'LOW',
  orderStatus: 'APPROVED',
  creditStatus: 'APPROVED',
  currentStage: 'CREDIT_CHECK',
  items: [
    { itemNumber: 10, materialId: 'MAT-4001', materialName: 'Gas Turbine Core', quantity: 1, unitPrice: 40000, netValue: 40000 }
  ],
  documents: { salesOrder: 'SO-TEST01' },
  nextAction: 'Create Outbound Delivery',
  ...overrides,
});

describe('SAP O2C Credit Risk & Business Control Validation Suite', () => {

  // Test 1: Low-risk order approval
  it('1. Low-risk order approval: Approves within limit for excellent customer', () => {
    const customer = createMockCustomer({
      creditLimit: 500000,
      currentExposure: 100000,
      overdueReceivables: 0,
      paymentHistory: 'Excellent',
      blockedOrdersCount: 0,
    });
    const order = createMockOrder({ orderValue: 50000 });

    const risk = calculateRiskBreakdown(customer, order.orderValue);
    expect(risk.totalScore).toBeLessThan(25);
    expect(risk.riskCategory).toBe('LOW');

    const limitValidation = validateCreditLimit(order, customer);
    expect(limitValidation.valid).toBe(true);

    const customerValidation = validateCustomerRisk(customer);
    expect(customerValidation.valid).toBe(true);
  });

  // Test 2: Credit-limit violation
  it('2. Credit-limit violation: Blocks when projected exposure exceeds credit limit (RULE 1)', () => {
    const customer = createMockCustomer({
      creditLimit: 100000,
      currentExposure: 80000,
    });
    const order = createMockOrder({ orderValue: 35000 });

    const result = validateCreditLimit(order, customer);
    expect(result.valid).toBe(false);
    expect(result.ruleNumber).toBe(1);
    expect(result.reason).toContain('Credit Block: Order would exceed customer credit limit');
    expect(result.exceededBy).toBe(15000);
    expect(result.projectedExposure).toBe(115000);
  });

  // Test 3: Critical customer block
  it('3. Critical customer block: Rejects fulfillment when customer is CRITICAL risk (RULE 2)', () => {
    const customer = createMockCustomer({
      riskCategory: 'CRITICAL',
      riskScore: 85,
    });

    const result = validateCustomerRisk(customer);
    expect(result.valid).toBe(false);
    expect(result.ruleNumber).toBe(2);
    expect(result.reason).toBe('Fulfillment blocked: Customer is classified as CRITICAL risk.');
  });

  // Test 4: Manager release
  it('4. Manager release: Allows authorized Credit Manager to release with valid reason (RULE 4)', () => {
    const order = createMockOrder({
      orderStatus: 'CREDIT_BLOCKED',
      creditStatus: 'BLOCKED',
    });

    const result = validateManagerRelease(
      order,
      'CREDIT_MANAGER',
      'Customer deposited 50% advance bank guarantee BG-102.'
    );
    expect(result.valid).toBe(true);
    expect(result.reason).toContain('Authorization verified');
  });

  // Test 5: Missing release reason
  it('5. Missing release reason: Rejects release when reason is missing or empty (RULE 5)', () => {
    const order = createMockOrder({
      orderStatus: 'CREDIT_BLOCKED',
      creditStatus: 'BLOCKED',
    });

    const emptyResult = validateManagerRelease(order, 'CREDIT_MANAGER', '   ');
    expect(emptyResult.valid).toBe(false);
    expect(emptyResult.ruleNumber).toBe(5);
    expect(emptyResult.reason).toBe('Release reason is required.');
  });

  // Test 6: Blocked order attempting delivery
  it('6. Blocked order attempting delivery: Rejects direct delivery progression (RULE 3)', () => {
    const customer = createMockCustomer({ creditLimit: 100000, currentExposure: 90000 });
    const order = createMockOrder({
      orderStatus: 'CREDIT_BLOCKED',
      creditStatus: 'BLOCKED',
      orderValue: 20000,
    });

    const result = validateDeliveryCreation(order, customer);
    expect(result.valid).toBe(false);
    expect(result.ruleNumber).toBe(3);
    expect(result.reason).toContain('Cannot create delivery: Sales Order SO-TEST01 is credit blocked');
    expect(result.requiredAction).toContain('Manager credit release');
  });

  // Test 7: Billing before delivery
  it('7. Billing before delivery: Rejects billing without prior delivery and goods issue (RULE 6)', () => {
    const order = createMockOrder({
      currentStage: 'SALES_ORDER',
      documents: { salesOrder: 'SO-TEST01' },
    });

    const result = validateBillingCreation(order);
    expect(result.valid).toBe(false);
    expect(result.ruleNumber).toBe(6);
    expect(result.reason).toBe('Cannot process billing: Delivery and Goods Issue must be completed first.');
  });

  // Test 8: Payment before billing
  it('8. Payment before billing: Rejects payment clearing without billing document (RULE 7)', () => {
    const order = createMockOrder({
      currentStage: 'DELIVERY',
      documents: { salesOrder: 'SO-TEST01', delivery: 'DEL-800001', goodsIssue: 'GI-500001' },
    });

    const result = validatePaymentClearing(order);
    expect(result.valid).toBe(false);
    expect(result.ruleNumber).toBe(7);
    expect(result.reason).toBe('Cannot clear payment: Billing document must be generated first.');
  });

  // Test 9: Correct risk calculation
  it('9. Correct risk calculation: Accurately computes exact score breakdown across all 5 dimensions', () => {
    const customer = {
      creditLimit: 100000,
      currentExposure: 80000,
      overdueReceivables: 25000,
      paymentHistory: 'Average' as const,
      blockedOrdersCount: 1,
    };
    const orderValue = 30000;

    const breakdown = calculateRiskBreakdown(customer, orderValue);
    expect(breakdown.overduePoints).toBe(25);
    expect(breakdown.creditUtilizationPoints).toBe(20);
    expect(breakdown.paymentHistoryPoints).toBe(10);
    expect(breakdown.blockedOrdersPoints).toBe(10);
    expect(breakdown.orderPressurePoints).toBe(25);
    expect(breakdown.totalScore).toBe(90);
    expect(breakdown.riskCategory).toBe('CRITICAL');
  });

  // Test 10: Correct O2C status transitions
  it('10. Correct O2C status transitions: Validates progression through the full lifecycle sequence', () => {
    const orderAtCredit = createMockOrder({
      currentStage: 'CREDIT_CHECK',
      orderStatus: 'APPROVED',
      creditStatus: 'APPROVED',
    });
    const customer = createMockCustomer({ creditLimit: 200000, currentExposure: 50000 });
    expect(validateDeliveryCreation(orderAtCredit, customer).valid).toBe(true);

    const orderAtGoodsIssue = createMockOrder({
      currentStage: 'GOODS_ISSUE',
      documents: { salesOrder: 'SO-TEST01', delivery: 'DEL-800001', goodsIssue: 'GI-500001' },
    });
    expect(validateBillingCreation(orderAtGoodsIssue).valid).toBe(true);

    const orderAtBilling = createMockOrder({
      currentStage: 'BILLING',
      documents: { salesOrder: 'SO-TEST01', delivery: 'DEL-800001', goodsIssue: 'GI-500001', billingDocument: 'INV-900001' },
    });
    expect(validatePaymentClearing(orderAtBilling).valid).toBe(true);
  });
});
