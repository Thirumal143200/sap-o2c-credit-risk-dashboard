import type { SalesOrder, Customer, UserRole, ValidationResult } from '../types';

/**
 * SAP-aligned validation rules engine for Order-to-Cash (O2C).
 * Enforces business consistency, role authorizations, and process sequence integrity.
 */

// RULE 1: Credit Limit Check
export function validateCreditLimit(order: SalesOrder, customer: Customer): ValidationResult {
  const projectedExposure = customer.currentExposure + order.orderValue;
  if (projectedExposure > customer.creditLimit) {
    const exceededBy = projectedExposure - customer.creditLimit;
    return {
      valid: false,
      ruleNumber: 1,
      ruleName: 'Credit Limit Exposure Check',
      reason: `Credit Block: Order would exceed customer credit limit.`,
      customerCreditLimit: customer.creditLimit,
      projectedExposure,
      exceededBy,
      requiredAction: 'Manager credit release or customer credit limit increase required before fulfillment.',
    };
  }
  return {
    valid: true,
    reason: 'Projected exposure is within customer approved credit limit.',
    requiredAction: 'Proceed to next stage.',
  };
}

// RULE 2: Critical Customer Risk Check
export function validateCustomerRisk(customer: Customer): ValidationResult {
  if (customer.riskCategory === 'CRITICAL' || customer.riskScore >= 75) {
    return {
      valid: false,
      ruleNumber: 2,
      ruleName: 'Customer Risk Classification Guard',
      reason: 'Fulfillment blocked: Customer is classified as CRITICAL risk.',
      customerCreditLimit: customer.creditLimit,
      projectedExposure: customer.currentExposure,
      requiredAction: 'Executive Credit Committee review and debt recovery action required before any order processing.',
    };
  }
  return {
    valid: true,
    reason: `Customer risk classification is ${customer.riskCategory}.`,
    requiredAction: 'Allowed to proceed.',
  };
}

// RULE 3: Blocked Order Attempting Delivery Check
export function validateDeliveryCreation(order: SalesOrder, customer: Customer): ValidationResult {
  if (order.creditStatus === 'BLOCKED' || order.orderStatus === 'CREDIT_BLOCKED') {
    const projectedExposure = customer.currentExposure + order.orderValue;
    const exceededBy = Math.max(0, projectedExposure - customer.creditLimit);
    return {
      valid: false,
      ruleNumber: 3,
      ruleName: 'Credit Block Delivery Prevention',
      reason: `Cannot create delivery: Sales Order ${order.id} is credit blocked.`,
      customerCreditLimit: customer.creditLimit,
      projectedExposure,
      exceededBy,
      requiredAction: 'Manager credit release must be executed before creating outbound delivery document.',
    };
  }

  if (order.currentStage !== 'CREDIT_CHECK' && order.currentStage !== 'SALES_ORDER') {
    return {
      valid: false,
      ruleNumber: 3,
      ruleName: 'Invalid Process Sequence',
      reason: `Delivery can only be created after Credit Check completion. Current stage is ${order.currentStage}.`,
      requiredAction: 'Complete prerequisite O2C stages.',
    };
  }

  return {
    valid: true,
    reason: 'Order is credit-cleared and ready for outbound delivery.',
    requiredAction: 'Create Outbound Delivery Document.',
  };
}

// RULE 4 & RULE 5: Manager Credit Release Validation
export function validateManagerRelease(
  order: SalesOrder,
  role: UserRole,
  releaseReason: string
): ValidationResult {
  // RULE 4: Role Authorization Check
  if (role !== 'CREDIT_MANAGER') {
    return {
      valid: false,
      ruleNumber: 4,
      ruleName: 'Credit Release Role Authorization',
      reason: 'Unauthorized: Only an authorized Credit Manager can release a credit-blocked sales order.',
      requiredAction: 'Switch to Credit Manager role or request an authorized manager review.',
    };
  }

  // RULE 5: Mandatory Release Reason
  if (!releaseReason || releaseReason.trim().length === 0) {
    return {
      valid: false,
      ruleNumber: 5,
      ruleName: 'Mandatory Release Reason',
      reason: 'Release reason is required.',
      requiredAction: 'Enter a valid business justification reason for releasing the credit block.',
    };
  }

  if (order.creditStatus !== 'BLOCKED' && order.orderStatus !== 'CREDIT_BLOCKED') {
    return {
      valid: false,
      ruleNumber: 4,
      ruleName: 'Invalid Release Target',
      reason: `Sales Order ${order.id} is not credit blocked (current status: ${order.creditStatus}).`,
      requiredAction: 'No release required.',
    };
  }

  return {
    valid: true,
    reason: 'Authorization verified and valid release reason documented.',
    requiredAction: 'Execute credit release and advance order status.',
  };
}

// RULE 6: Billing Sequence Guard
export function validateBillingCreation(order: SalesOrder): ValidationResult {
  const goodsIssueCompleted = !!order.documents.goodsIssue || order.currentStage === 'GOODS_ISSUE';
  const deliveryCompleted = !!order.documents.delivery;

  if (!deliveryCompleted || !goodsIssueCompleted) {
    return {
      valid: false,
      ruleNumber: 6,
      ruleName: 'Billing Sequence Guard',
      reason: 'Cannot process billing: Delivery and Goods Issue must be completed first.',
      requiredAction: 'Complete Outbound Delivery and Post Goods Issue (PGI) before generating billing document.',
    };
  }

  return {
    valid: true,
    reason: 'Goods Issue is confirmed. Order is eligible for billing document creation.',
    requiredAction: 'Generate Billing Document (Invoice).',
  };
}

// RULE 7: Payment / Clearing Sequence Guard
export function validatePaymentClearing(order: SalesOrder): ValidationResult {
  const billingCompleted = !!order.documents.billingDocument || order.currentStage === 'BILLING';

  if (!billingCompleted) {
    return {
      valid: false,
      ruleNumber: 7,
      ruleName: 'Payment Clearing Sequence Guard',
      reason: 'Cannot clear payment: Billing document must be generated first.',
      requiredAction: 'Generate SAP Billing Document (Invoice) before applying customer payment and clearing AR.',
    };
  }

  return {
    valid: true,
    reason: 'Customer invoice is active. Payment receipt can be applied and cleared in AR.',
    requiredAction: 'Post Incoming Payment & Clear AR.',
  };
}
