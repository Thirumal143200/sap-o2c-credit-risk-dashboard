import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Customer,
  Material,
  O2CStage,
  SalesOrder,
  UserRole,
  ValidationResult,
  OrderItem,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_SALES_ORDERS,
  SEEDED_MATERIALS,
} from '../data/seedData';
import { calculateRiskBreakdown } from '../utils/creditEngine';
import {
  validateCreditLimit,
  validateCustomerRisk,
  validateDeliveryCreation,
  validateManagerRelease,
  validateBillingCreation,
  validatePaymentClearing,
} from '../utils/validationRules';

interface AppContextType {
  orders: SalesOrder[];
  customers: Customer[];
  materials: Material[];
  currentRole: UserRole;
  selectedOrderId: string | null;
  selectedCustomerId: string | null;
  activeTab: 'DASHBOARD' | 'ORDERS' | 'CUSTOMERS';
  validationModal: ValidationResult | null;
  releaseModalOrder: SalesOrder | null;
  newOrderModalOpen: boolean;
  toastNotification: { type: 'success' | 'error' | 'info'; message: string } | null;

  setCurrentRole: (role: UserRole) => void;
  setActiveTab: (tab: 'DASHBOARD' | 'ORDERS' | 'CUSTOMERS') => void;
  setSelectedOrderId: (id: string | null) => void;
  setSelectedCustomerId: (id: string | null) => void;
  setNewOrderModalOpen: (open: boolean) => void;
  dismissValidationModal: () => void;
  openReleaseModal: (order: SalesOrder) => void;
  closeReleaseModal: () => void;
  clearNotification: () => void;

  advanceOrderStage: (orderId: string, targetStage: O2CStage) => boolean;
  executeCreditRelease: (orderId: string, releaseReason: string) => boolean;
  createNewSalesOrder: (customerId: string, itemInputs: { materialId: string; quantity: number }[]) => SalesOrder | null;
  resetSimulationData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<SalesOrder[]>(() => {
    const saved = localStorage.getItem('sap_o2c_orders');
    return saved ? JSON.parse(saved) : INITIAL_SALES_ORDERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('sap_o2c_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('SALES_USER');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('SO-100003');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ORDERS' | 'CUSTOMERS'>('DASHBOARD');
  const [validationModal, setValidationModal] = useState<ValidationResult | null>(null);
  const [releaseModalOrder, setReleaseModalOrder] = useState<SalesOrder | null>(null);
  const [newOrderModalOpen, setNewOrderModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('sap_o2c_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sap_o2c_customers', JSON.stringify(customers));
  }, [customers]);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToastNotification({ type, message });
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  const clearNotification = () => setToastNotification(null);
  const dismissValidationModal = () => setValidationModal(null);
  const openReleaseModal = (order: SalesOrder) => setReleaseModalOrder(order);
  const closeReleaseModal = () => setReleaseModalOrder(null);

  // Advance Order Stage with Strict SAP Validation
  const advanceOrderStage = (orderId: string, targetStage: O2CStage): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const customer = customers.find((c) => c.id === order.customerId);
    if (!customer) return false;

    // RULE CHECKS BASED ON TARGET STAGE
    if (targetStage === 'DELIVERY') {
      // RULE 2: Customer Risk Classification
      const riskValidation = validateCustomerRisk(customer);
      if (!riskValidation.valid) {
        setValidationModal(riskValidation);
        showToast('error', riskValidation.reason);
        return false;
      }

      // RULE 1 & 3: Credit Limit Check & Delivery Block Guard
      const deliveryValidation = validateDeliveryCreation(order, customer);
      if (!deliveryValidation.valid) {
        setValidationModal(deliveryValidation);
        showToast('error', deliveryValidation.reason);
        return false;
      }

      // Check if order causes credit limit violation if not already released
      if (order.creditStatus !== 'RELEASED') {
        const creditValidation = validateCreditLimit(order, customer);
        if (!creditValidation.valid) {
          setValidationModal(creditValidation);
          showToast('error', creditValidation.reason);
          return false;
        }
      }

      // Successful Delivery Creation
      const nextDocNumber = 800000 + orders.filter((o) => o.documents.delivery).length + 1;
      const deliveryDoc = `DEL-${nextDocNumber}`;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                currentStage: 'DELIVERY',
                orderStatus: 'IN_DELIVERY',
                documents: { ...o.documents, delivery: deliveryDoc },
                nextAction: 'Post Goods Issue (PGI)',
              }
            : o
        )
      );

      showToast('success', `SAP Delivery Document ${deliveryDoc} successfully created.`);
      return true;
    }

    if (targetStage === 'GOODS_ISSUE') {
      if (order.currentStage !== 'DELIVERY' || !order.documents.delivery) {
        const errorResult: ValidationResult = {
          valid: false,
          ruleNumber: 3,
          ruleName: 'Goods Issue Sequence Guard',
          reason: 'Cannot post Goods Issue: Outbound delivery document does not exist.',
          requiredAction: 'Create Delivery document before posting Goods Issue.',
        };
        setValidationModal(errorResult);
        showToast('error', errorResult.reason);
        return false;
      }

      const nextDocNumber = 500000 + orders.filter((o) => o.documents.goodsIssue).length + 1;
      const goodsIssueDoc = `GI-${nextDocNumber}`;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                currentStage: 'GOODS_ISSUE',
                orderStatus: 'GOODS_ISSUED',
                documents: { ...o.documents, goodsIssue: goodsIssueDoc },
                nextAction: 'Generate Billing Document (Invoice)',
              }
            : o
        )
      );

      showToast('success', `Goods Issue ${goodsIssueDoc} posted. Inventory updated.`);
      return true;
    }

    if (targetStage === 'BILLING') {
      // RULE 6: Sequence check
      const billingValidation = validateBillingCreation(order);
      if (!billingValidation.valid) {
        setValidationModal(billingValidation);
        showToast('error', billingValidation.reason);
        return false;
      }

      const nextDocNumber = 900000 + orders.filter((o) => o.documents.billingDocument).length + 1;
      const billingDoc = `INV-${nextDocNumber}`;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                currentStage: 'BILLING',
                orderStatus: 'BILLED',
                documents: { ...o.documents, billingDocument: billingDoc },
                nextAction: 'Post Incoming Payment & Clear AR',
              }
            : o
        )
      );

      showToast('success', `SAP Billing Document ${billingDoc} created. AR receivables posted.`);
      return true;
    }

    if (targetStage === 'PAYMENT') {
      // RULE 7: Sequence check
      const paymentValidation = validatePaymentClearing(order);
      if (!paymentValidation.valid) {
        setValidationModal(paymentValidation);
        showToast('error', paymentValidation.reason);
        return false;
      }

      const nextDocNumber = 700000 + orders.filter((o) => o.documents.paymentClearing).length + 1;
      const clearingDoc = `CLR-${nextDocNumber}`;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                currentStage: 'PAYMENT',
                orderStatus: 'CLEARED',
                documents: { ...o.documents, paymentClearing: clearingDoc },
                nextAction: 'O2C Cycle Completed',
              }
            : o
        )
      );

      // Settle customer exposure upon full payment
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === order.customerId) {
            const newExposure = Math.max(0, c.currentExposure - order.orderValue);
            return {
              ...c,
              currentExposure: newExposure,
              availableCredit: Math.max(0, c.creditLimit - newExposure),
              completedOrdersCount: c.completedOrdersCount + 1,
              openOrdersCount: Math.max(0, c.openOrdersCount - 1),
            };
          }
          return c;
        })
      );

      showToast('success', `Payment receipt matched! AR Clearing Document ${clearingDoc} posted.`);
      return true;
    }

    return false;
  };

  // RULE 4 & 5: Credit Block Manager Release
  const executeCreditRelease = (orderId: string, releaseReason: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const validation = validateManagerRelease(order, currentRole, releaseReason);
    if (!validation.valid) {
      setValidationModal(validation);
      showToast('error', validation.reason);
      return false;
    }

    const releasedOrder: SalesOrder = {
      ...order,
      orderStatus: 'RELEASED',
      creditStatus: 'RELEASED',
      currentStage: 'CREDIT_CHECK',
      creditBlockReason: undefined,
      releaseAudit: {
        releasedBy: currentRole === 'CREDIT_MANAGER' ? 'Vikram Malhotra (Credit Risk Manager)' : 'Sales User',
        role: currentRole,
        releaseReason: releaseReason.trim(),
        releasedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
      },
      nextAction: 'Create Outbound Delivery',
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? releasedOrder : o)));

    // Update customer blocked orders count
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === order.customerId
          ? {
              ...c,
              blockedOrdersCount: Math.max(0, c.blockedOrdersCount - 1),
            }
          : c
      )
    );

    closeReleaseModal();
    showToast('success', `Credit block on ${orderId} released by Manager. Ready for delivery.`);
    return true;
  };

  // Create New Sales Order with immediate Credit Risk check
  const createNewSalesOrder = (
    customerId: string,
    itemInputs: { materialId: string; quantity: number }[]
  ): SalesOrder | null => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return null;

    let totalValue = 0;
    const items: OrderItem[] = itemInputs.map((input, idx) => {
      const mat = SEEDED_MATERIALS.find((m) => m.id === input.materialId)!;
      const net = mat.unitPrice * input.quantity;
      totalValue += net;
      return {
        itemNumber: (idx + 1) * 10,
        materialId: mat.id,
        materialName: mat.name,
        quantity: input.quantity,
        unitPrice: mat.unitPrice,
        netValue: net,
      };
    });

    const newOrderId = `SO-${100000 + orders.length + 1}`;
    const riskBreakdown = calculateRiskBreakdown(customer, totalValue);

    // Evaluate Credit Block rules
    const causesOverLimit = customer.currentExposure + totalValue > customer.creditLimit;
    const isCriticalRisk = customer.riskCategory === 'CRITICAL' || riskBreakdown.riskCategory === 'CRITICAL';

    let orderStatus: SalesOrder['orderStatus'] = 'APPROVED';
    let creditStatus: SalesOrder['creditStatus'] = 'APPROVED';
    let creditBlockReason: string | undefined = undefined;
    let nextAction = 'Create Outbound Delivery';

    if (causesOverLimit || isCriticalRisk) {
      orderStatus = 'CREDIT_BLOCKED';
      creditStatus = 'BLOCKED';
      if (causesOverLimit) {
        creditBlockReason = 'Credit Block: Order would exceed customer credit limit.';
      } else {
        creditBlockReason = 'Fulfillment blocked: Customer is classified as CRITICAL risk.';
      }
      nextAction = 'Manager Credit Release Required';
    }

    const newOrder: SalesOrder = {
      id: newOrderId,
      customerId: customer.id,
      customerName: customer.name,
      orderDate: new Date().toISOString().split('T')[0],
      orderValue: totalValue,
      creditLimit: customer.creditLimit,
      currentExposure: customer.currentExposure,
      overdueAmount: customer.overdueReceivables,
      riskScore: riskBreakdown.totalScore,
      riskCategory: riskBreakdown.riskCategory,
      orderStatus,
      creditStatus,
      currentStage: 'CREDIT_CHECK',
      items,
      documents: { salesOrder: newOrderId },
      riskBreakdown,
      creditBlockReason,
      nextAction,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update customer's open orders & exposure if approved
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newBlockedCount = creditStatus === 'BLOCKED' ? c.blockedOrdersCount + 1 : c.blockedOrdersCount;
          const newExposure = creditStatus === 'APPROVED' ? c.currentExposure + totalValue : c.currentExposure;
          return {
            ...c,
            openOrdersCount: c.openOrdersCount + 1,
            blockedOrdersCount: newBlockedCount,
            currentExposure: newExposure,
            availableCredit: Math.max(0, c.creditLimit - newExposure),
          };
        }
        return c;
      })
    );

    setSelectedOrderId(newOrderId);
    setNewOrderModalOpen(false);

    if (creditStatus === 'BLOCKED') {
      showToast('error', `Sales Order ${newOrderId} created with CREDIT BLOCK: ${creditBlockReason}`);
    } else {
      showToast('success', `Sales Order ${newOrderId} created & credit approved.`);
    }

    return newOrder;
  };

  const resetSimulationData = () => {
    localStorage.removeItem('sap_o2c_orders');
    localStorage.removeItem('sap_o2c_customers');
    setOrders(INITIAL_SALES_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setSelectedOrderId('SO-100003');
    setSelectedCustomerId(null);
    showToast('info', 'Simulation master and transactional data restored to initial state.');
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        customers,
        materials: SEEDED_MATERIALS,
        currentRole,
        selectedOrderId,
        selectedCustomerId,
        activeTab,
        validationModal,
        releaseModalOrder,
        newOrderModalOpen,
        toastNotification,
        setCurrentRole,
        setActiveTab,
        setSelectedOrderId,
        setSelectedCustomerId,
        setNewOrderModalOpen,
        dismissValidationModal,
        openReleaseModal,
        closeReleaseModal,
        clearNotification,
        advanceOrderStage,
        executeCreditRelease,
        createNewSalesOrder,
        resetSimulationData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
