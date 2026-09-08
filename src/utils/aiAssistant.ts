import type { SalesOrder, Customer, AiRecommendation } from '../types';
import { formatCurrencyINR } from './creditEngine';

/**
 * AI Credit Review Assistant
 * 
 * Provides an explainable, data-grounded assessment for any selected sales order.
 * Strictly references empirical master and transactional data without hallucination.
 * Structured to plug into an external LLM endpoint if configured, with zero external dependency.
 */
export function generateAiCreditReview(order: SalesOrder, customer: Customer): AiRecommendation {
  const projectedExposure = customer.currentExposure + order.orderValue;
  const isOverLimit = projectedExposure > customer.creditLimit;
  const exceededBy = Math.max(0, projectedExposure - customer.creditLimit);
  const isCriticalRisk = customer.riskCategory === 'CRITICAL' || customer.riskScore >= 75;
  const isHighRisk = customer.riskCategory === 'HIGH' || customer.riskScore >= 50;

  const groundedFacts = [
    { label: 'Customer Name', value: customer.name },
    { label: 'Business Partner ID', value: customer.id },
    { label: 'Order ID', value: order.id },
    { label: 'Order Value', value: formatCurrencyINR(order.orderValue) },
    { label: 'Approved Credit Limit', value: formatCurrencyINR(customer.creditLimit) },
    { label: 'Current Exposure', value: formatCurrencyINR(customer.currentExposure) },
    { label: 'Projected Exposure', value: formatCurrencyINR(projectedExposure) },
    { label: 'Overdue Receivables', value: formatCurrencyINR(customer.overdueReceivables) },
    { label: 'Payment History', value: customer.paymentHistory },
    { label: 'Customer Risk Score', value: `${customer.riskScore}/100 (${customer.riskCategory})` },
    { label: 'Active Blocked Orders', value: customer.blockedOrdersCount.toString() },
  ];

  const reasons: string[] = [];

  // Grounded reason generation
  if (isOverLimit) {
    reasons.push(
      `Projected credit exposure (${formatCurrencyINR(projectedExposure)}) exceeds the customer's credit limit (${formatCurrencyINR(customer.creditLimit)}) by ${formatCurrencyINR(exceededBy)}.`
    );
  } else {
    reasons.push(
      `Projected exposure remains within credit limit with ${formatCurrencyINR(customer.creditLimit - projectedExposure)} headroom remaining.`
    );
  }

  if (customer.overdueReceivables > 0) {
    reasons.push(`Customer has ${formatCurrencyINR(customer.overdueReceivables)} in outstanding overdue receivables.`);
  } else {
    reasons.push(`Customer has zero outstanding overdue receivables.`);
  }

  if (customer.paymentHistory === 'Poor' || customer.paymentHistory === 'Average') {
    reasons.push(`Historical payment behavior is classified as '${customer.paymentHistory}'.`);
  } else {
    reasons.push(`Historical payment track record is verified as '${customer.paymentHistory}'.`);
  }

  if (customer.blockedOrdersCount > 0) {
    reasons.push(`Customer currently holds ${customer.blockedOrdersCount} existing blocked sales order(s).`);
  }

  // Decision logic
  if (isCriticalRisk) {
    return {
      decision: 'CRITICAL_BLOCK',
      summary: `Recommendation: Do not fulfill ${order.id}. Customer is classified as CRITICAL risk.`,
      reasons,
      groundedFacts,
      recommendedAction: 'Executive Credit Committee review and debt recovery action required before any order processing.',
    };
  }

  if (isOverLimit || isHighRisk || order.creditStatus === 'BLOCKED' || order.orderStatus === 'CREDIT_BLOCKED') {
    return {
      decision: 'MANAGER_REVIEW',
      summary: `Recommendation: Do not release ${order.id} automatically. Credit risk evaluation thresholds exceeded.`,
      reasons,
      groundedFacts,
      recommendedAction: 'Manager review required: Credit Manager must inspect order rationale and provide a formal release justification reason.',
    };
  }

  return {
    decision: 'APPROVE',
    summary: `Recommendation: Safe to approve and advance ${order.id} to Delivery.`,
    reasons,
    groundedFacts,
    recommendedAction: 'Automated credit clearance granted. Proceed directly with Outbound Delivery creation.',
  };
}
