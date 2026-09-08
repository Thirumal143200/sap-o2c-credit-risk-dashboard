import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyINR, calculateRiskBreakdown } from '../utils/creditEngine';
import { generateAiCreditReview } from '../utils/aiAssistant';
import {
  FileSpreadsheet,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Truck,
  PackageCheck,
  Receipt,
  BadgeCheck,
  Sparkles,
  Calendar,
  Layers,
  FileCheck2,
} from 'lucide-react';
import type { O2CStage } from '../types';

export const OrderDetailsView: React.FC = () => {
  const {
    orders,
    customers,
    selectedOrderId,
    advanceOrderStage,
    openReleaseModal,
    currentRole,
  } = useApp();

  const order = orders.find((o) => o.id === selectedOrderId);
  const customer = customers.find((c) => c.id === order?.customerId);

  if (!order || !customer) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
        <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p>Select a Sales Order from the table to inspect details and O2C timeline.</p>
      </div>
    );
  }

  // Calculate detailed risk breakdown for current order
  const riskBreakdown = order.riskBreakdown || calculateRiskBreakdown(customer, order.orderValue);

  // Generate grounded AI credit recommendation
  const aiReview = generateAiCreditReview(order, customer);

  const isOverLimit = customer.currentExposure + order.orderValue > customer.creditLimit;
  const headroomAfterOrder = customer.creditLimit - (customer.currentExposure + order.orderValue);

  // O2C Timeline Stages definition
  const stages: { id: O2CStage; label: string; icon: any; doc?: string }[] = [
    { id: 'SALES_ORDER', label: 'Sales Order', icon: FileSpreadsheet, doc: order.documents.salesOrder },
    { id: 'CREDIT_CHECK', label: 'Credit Check', icon: ShieldCheck, doc: order.creditStatus === 'BLOCKED' ? 'BLOCKED' : 'APPROVED' },
    { id: 'DELIVERY', label: 'Outbound Delivery', icon: Truck, doc: order.documents.delivery },
    { id: 'GOODS_ISSUE', label: 'Picking / Goods Issue', icon: PackageCheck, doc: order.documents.goodsIssue },
    { id: 'BILLING', label: 'Billing / Invoice', icon: Receipt, doc: order.documents.billingDocument },
    { id: 'PAYMENT', label: 'Payment / AR Clearing', icon: BadgeCheck, doc: order.documents.paymentClearing },
  ];

  const stageOrder: O2CStage[] = ['SALES_ORDER', 'CREDIT_CHECK', 'DELIVERY', 'GOODS_ISSUE', 'BILLING', 'PAYMENT'];
  const currentStageIndex = stageOrder.indexOf(order.currentStage);

  const getNextStage = (): O2CStage | null => {
    if (order.currentStage === 'SALES_ORDER') return 'CREDIT_CHECK';
    if (order.currentStage === 'CREDIT_CHECK') return 'DELIVERY';
    if (order.currentStage === 'DELIVERY') return 'GOODS_ISSUE';
    if (order.currentStage === 'GOODS_ISSUE') return 'BILLING';
    if (order.currentStage === 'BILLING') return 'PAYMENT';
    return null;
  };

  const nextStage = getNextStage();

  const getNextActionLabel = (): string => {
    if (order.creditStatus === 'BLOCKED') return 'Review & Release Credit Block';
    if (order.currentStage === 'SALES_ORDER') return 'Execute Credit Check';
    if (order.currentStage === 'CREDIT_CHECK') return 'Create Outbound Delivery (DEL)';
    if (order.currentStage === 'DELIVERY') return 'Post Goods Issue / PGI (GI)';
    if (order.currentStage === 'GOODS_ISSUE') return 'Generate Billing Document (INV)';
    if (order.currentStage === 'BILLING') return 'Post Incoming Payment & Clear AR (CLR)';
    return 'Process Completed';
  };

  const handleNextAction = () => {
    if (order.creditStatus === 'BLOCKED') {
      openReleaseModal(order);
      return;
    }
    if (nextStage) {
      advanceOrderStage(order.id, nextStage);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Key Document Stats */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold font-mono text-slate-900">{order.id}</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  order.creditStatus === 'BLOCKED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : order.creditStatus === 'RELEASED'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {order.creditStatus}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {order.orderStatus}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{customer.name}</span>
              <span>•</span>
              <span className="font-mono">{customer.id}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {order.orderDate}
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center space-x-2">
            {order.creditStatus === 'BLOCKED' && (
              <button
                onClick={() => openReleaseModal(order)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Authorize Manager Release</span>
              </button>
            )}

            {order.currentStage !== 'PAYMENT' && order.creditStatus !== 'BLOCKED' && (
              <button
                onClick={handleNextAction}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <span>{getNextActionLabel()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {order.currentStage === 'PAYMENT' && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                <BadgeCheck className="w-4 h-4" />
                <span>O2C Lifecycle Cleared</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-slate-500">Order Net Value</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrencyINR(order.orderValue)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-slate-500">Approved Credit Limit</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrencyINR(customer.creditLimit)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-slate-500">Current Exposure</div>
            <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
              {formatCurrencyINR(customer.currentExposure)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-slate-500">Projected Exposure</div>
            <div className={`text-sm font-bold font-mono mt-0.5 ${isOverLimit ? 'text-rose-600' : 'text-slate-900'}`}>
              {formatCurrencyINR(customer.currentExposure + order.orderValue)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-slate-500">Overdue Balance</div>
            <div className="text-sm font-bold font-mono text-orange-700 mt-0.5">
              {formatCurrencyINR(customer.overdueReceivables)}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="text-slate-500">Credit Headroom</div>
            <div className={`text-sm font-bold font-mono mt-0.5 ${headroomAfterOrder < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatCurrencyINR(headroomAfterOrder)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual O2C Interactive Process Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">SAP Order-to-Cash (O2C) Process Flow</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Active Stage: <strong className="text-blue-600">{order.currentStage}</strong>
          </span>
        </div>

        {/* Timeline Visualization */}
        <div className="relative">
          <div className="hidden lg:block absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
            {stages.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isBlocked = stage.id === 'CREDIT_CHECK' && order.creditStatus === 'BLOCKED';

              const StageIcon = stage.icon;

              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center text-center ${
                    isBlocked
                      ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400'
                      : isCurrent
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-300 shadow-xs'
                      : isPast
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 shadow-inner ${
                      isBlocked
                        ? 'bg-rose-600 text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <StageIcon className="w-5 h-5" />}
                  </div>

                  <span className="text-xs font-bold text-slate-900">{stage.label}</span>

                  <span
                    className={`text-[11px] font-mono mt-1 ${
                      isBlocked
                        ? 'text-rose-600 font-bold'
                        : isCurrent
                        ? 'text-blue-600 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {isBlocked ? 'CREDIT BLOCKED' : isPast ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'}
                  </span>

                  {stage.doc && (
                    <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {stage.doc}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Record if Released */}
        {order.releaseAudit && (
          <div className="mt-4 p-3 bg-blue-50/80 border border-blue-200 rounded-lg flex items-start space-x-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-900">
                Manager Release Executed by {order.releaseAudit.releasedBy} ({order.releaseAudit.releasedAt})
              </div>
              <p className="text-blue-800 mt-0.5">
                <span className="font-semibold">Documented Justification:</span> "{order.releaseAudit.releaseReason}"
              </p>
            </div>
          </div>
        )}

        {/* Block notification if blocked */}
        {order.creditStatus === 'BLOCKED' && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3 text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-900">Active Credit Block: Delivery Prohibited</div>
              <p className="text-rose-700 mt-0.5">
                {order.creditBlockReason || 'Order exceeds allowable risk threshold or customer credit limit.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Two-Column Inspection: Left = Order Items | Right = Deterministic Credit Engine & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Line Items Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Sales Order Line Items (VBAP)</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">{order.items.length} Position(s)</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Pos</th>
                  <th className="py-2.5 px-3">Material ID</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.itemNumber} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-700">{item.itemNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-600 font-semibold">{item.materialId}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{item.materialName}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {formatCurrencyINR(item.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrencyINR(item.netValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-[11px] text-slate-600">
                    Total Net Order Value:
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-blue-700 text-sm">
                    {formatCurrencyINR(order.orderValue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Customer Credit Snapshot */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Customer Master Profile</span>
              <span className="font-mono text-[11px] text-slate-500">{customer.industry} • {customer.city}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
              <div>Historical Payment: <strong className="text-slate-800">{customer.paymentHistory}</strong></div>
              <div>Customer Risk: <strong className="text-slate-800">{customer.riskCategory} ({customer.riskScore}/100)</strong></div>
              <div>Open Orders: <strong className="text-slate-800">{customer.openOrdersCount}</strong></div>
              <div>Active Blocked: <strong className="text-rose-700">{customer.blockedOrdersCount}</strong></div>
            </div>
          </div>
        </div>

        {/* Right Column: Deterministic Credit Engine Breakdown & AI Review */}
        <div className="space-y-6">
          {/* Explainable Deterministic Credit Risk Engine breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Deterministic Credit Risk Scoring</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded font-bold font-mono bg-slate-100 text-slate-800">
                Explainable Score
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Deterministic point evaluation calculated directly from customer ledger telemetry and order impact.
            </p>

            {/* Breakdown Table */}
            <div className="space-y-2 text-xs border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              {/* Overdue */}
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <div>
                  <span className="font-medium text-slate-800">Overdue Receivables:</span>
                  <span className="text-slate-500 ml-1">({formatCurrencyINR(riskBreakdown.overdueAmount)})</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  +{riskBreakdown.overduePoints} pts
                </span>
              </div>

              {/* Utilization */}
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <div>
                  <span className="font-medium text-slate-800">Credit Limit Utilization:</span>
                  <span className="text-slate-500 ml-1">({riskBreakdown.creditUtilizationPct}%)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  +{riskBreakdown.creditUtilizationPoints} pts
                </span>
              </div>

              {/* Payment History */}
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <div>
                  <span className="font-medium text-slate-800">Payment History Track Record:</span>
                  <span className="text-slate-500 ml-1">({riskBreakdown.paymentHistory})</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  +{riskBreakdown.paymentHistoryPoints} pts
                </span>
              </div>

              {/* Blocked Orders */}
              <div className="flex justify-between items-center py-1 border-b border-slate-200/70">
                <div>
                  <span className="font-medium text-slate-800">Existing Blocked Orders:</span>
                  <span className="text-slate-500 ml-1">({riskBreakdown.blockedOrdersCount} order(s))</span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  +{riskBreakdown.blockedOrdersPoints} pts
                </span>
              </div>

              {/* Order Pressure */}
              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="font-medium text-slate-800">Order Pressure (Exceeds Limit):</span>
                  <span className="text-slate-500 ml-1">
                    ({riskBreakdown.orderCausesOverLimit ? 'Causes Over-Limit' : 'Within Limit'})
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  +{riskBreakdown.orderPressurePoints} pts
                </span>
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-900">Total Credit Risk Score:</span>
                <span className="font-mono text-blue-700 text-base">
                  {riskBreakdown.totalScore} / 100
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-600">Risk Classification:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    riskBreakdown.riskCategory === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : riskBreakdown.riskCategory === 'HIGH'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : riskBreakdown.riskCategory === 'MEDIUM'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {riskBreakdown.riskCategory} RISK
                </span>
              </div>
            </div>
          </div>

          {/* AI Credit Review Assistant Feature Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-5 border border-indigo-900/60 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-indigo-600/50 text-indigo-200 border border-indigo-500/30">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
                <h3 className="text-sm font-bold tracking-tight text-white">AI Credit Review Assistant</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Grounded Analytics
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 mb-3">
              <div className="text-xs font-bold text-indigo-300 mb-1">
                {aiReview.summary}
              </div>
              <p className="text-[11px] text-slate-300">
                {aiReview.recommendedAction}
              </p>
            </div>

            <div className="space-y-1.5 mb-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Underlying Grounded Rationale:
              </div>
              {aiReview.reasons.map((r, i) => (
                <div key={i} className="flex items-start space-x-1.5 text-xs text-slate-200">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            {/* Direct Factual Citations Grid */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Approved Limit:</span>{' '}
                <span className="font-mono text-white">{formatCurrencyINR(customer.creditLimit)}</span>
              </div>
              <div>
                <span className="text-slate-400">Projected Exposure:</span>{' '}
                <span className="font-mono text-white">
                  {formatCurrencyINR(customer.currentExposure + order.orderValue)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Overdue AR:</span>{' '}
                <span className="font-mono text-white">{formatCurrencyINR(customer.overdueReceivables)}</span>
              </div>
              <div>
                <span className="text-slate-400">Blocked Orders:</span>{' '}
                <span className="font-mono text-white">{customer.blockedOrdersCount}</span>
              </div>
            </div>

            {/* Quick Action in AI Card */}
            {order.creditStatus === 'BLOCKED' && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-indigo-300">
                  {currentRole === 'CREDIT_MANAGER'
                    ? 'Credit Manager role active'
                    : 'Requires Credit Manager role to release'}
                </span>
                <button
                  onClick={() => openReleaseModal(order)}
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  Review for Release
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
