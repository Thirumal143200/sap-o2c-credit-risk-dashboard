import type { Customer, PaymentHistoryRating, RiskBreakdown, RiskCategory } from '../types';

/**
 * Deterministic Credit Risk Engine for SAP O2C.
 * Calculates credit risk points based on actual underlying customer metrics.
 */
export function calculateRiskBreakdown(
  customer: Pick<Customer, 'creditLimit' | 'currentExposure' | 'overdueReceivables' | 'paymentHistory' | 'blockedOrdersCount'>,
  orderValue: number = 0
): RiskBreakdown {
  const { creditLimit, currentExposure, overdueReceivables, paymentHistory, blockedOrdersCount } = customer;

  // 1. Overdue Amount Points
  let overduePoints = 0;
  if (overdueReceivables === 0) {
    overduePoints = 0;
  } else if (overdueReceivables <= 10000) {
    overduePoints = 10;
  } else if (overdueReceivables <= 50000) {
    overduePoints = 25;
  } else {
    overduePoints = 40;
  }

  // 2. Credit Utilization Points (before new order)
  const creditUtilizationPct = creditLimit > 0 ? (currentExposure / creditLimit) * 100 : 100;
  let creditUtilizationPoints = 0;
  if (creditUtilizationPct < 50) {
    creditUtilizationPoints = 0;
  } else if (creditUtilizationPct <= 75) {
    creditUtilizationPoints = 10;
  } else if (creditUtilizationPct <= 100) {
    creditUtilizationPoints = 20;
  } else {
    creditUtilizationPoints = 35;
  }

  // 3. Payment History Points
  let paymentHistoryPoints = 0;
  switch (paymentHistory as PaymentHistoryRating) {
    case 'Excellent':
      paymentHistoryPoints = 0;
      break;
    case 'Good':
      paymentHistoryPoints = 5;
      break;
    case 'Average':
      paymentHistoryPoints = 10;
      break;
    case 'Poor':
      paymentHistoryPoints = 20;
      break;
  }

  // 4. Existing Blocked Orders Points
  let blockedOrdersPoints = 0;
  if (blockedOrdersCount === 0) {
    blockedOrdersPoints = 0;
  } else if (blockedOrdersCount === 1) {
    blockedOrdersPoints = 10;
  } else {
    blockedOrdersPoints = 20;
  }

  // 5. Order-to-credit-limit pressure
  const projectedExposure = currentExposure + orderValue;
  const orderCausesOverLimit = projectedExposure > creditLimit;
  const orderPressurePoints = orderCausesOverLimit ? 25 : 0;

  // Total Score
  const totalScore = overduePoints + creditUtilizationPoints + paymentHistoryPoints + blockedOrdersPoints + orderPressurePoints;

  // Risk Classification
  let riskCategory: RiskCategory = 'LOW';
  if (totalScore >= 75) {
    riskCategory = 'CRITICAL';
  } else if (totalScore >= 50) {
    riskCategory = 'HIGH';
  } else if (totalScore >= 25) {
    riskCategory = 'MEDIUM';
  } else {
    riskCategory = 'LOW';
  }

  return {
    overdueAmount: overdueReceivables,
    overduePoints,
    creditUtilizationPct: Math.round(creditUtilizationPct * 10) / 10,
    creditUtilizationPoints,
    paymentHistory,
    paymentHistoryPoints,
    blockedOrdersCount,
    blockedOrdersPoints,
    orderPressurePoints,
    orderCausesOverLimit,
    totalScore,
    riskCategory,
  };
}

export function formatCurrencyINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
