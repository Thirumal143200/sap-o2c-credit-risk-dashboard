import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyINR } from '../utils/creditEngine';
import {
  FileText,
  Clock,
  ShieldAlert,
  ShieldCheck,
  IndianRupee,
  AlertTriangle,
  Users,
} from 'lucide-react';

interface KpiCardsProps {
  onFilterClick?: (filterType: string, value: string) => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ onFilterClick }) => {
  const { orders, customers, setActiveTab } = useApp();

  const totalOrders = orders.length;
  const pendingCreditOrders = orders.filter(
    (o) => o.orderStatus === 'PENDING_CREDIT_CHECK' || (o.creditStatus === 'PENDING' && o.orderStatus !== 'DRAFT')
  ).length;
  const creditBlockedOrders = orders.filter((o) => o.creditStatus === 'BLOCKED').length;
  const releasedOrders = orders.filter((o) => o.creditStatus === 'RELEASED').length;

  const totalOrderValue = orders.reduce((sum, o) => sum + o.orderValue, 0);
  const totalOverdue = customers.reduce((sum, c) => sum + c.overdueReceivables, 0);
  const highRiskCustomersCount = customers.filter(
    (c) => c.riskCategory === 'HIGH' || c.riskCategory === 'CRITICAL'
  ).length;

  const handleCardClick = (filterType: string, filterValue: string) => {
    setActiveTab('ORDERS');
    if (onFilterClick) {
      onFilterClick(filterType, filterValue);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
      {/* 1. Total Sales Orders */}
      <div
        onClick={() => handleCardClick('status', 'ALL')}
        className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">{totalOrders}</div>
        <p className="text-[11px] text-slate-500 mt-1">Simulated O2C pipeline</p>
      </div>

      {/* 2. Orders Pending Credit Check */}
      <div
        onClick={() => handleCardClick('status', 'PENDING')}
        className="bg-white rounded-xl p-4 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-amber-700 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Pending Check</span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-amber-900">{pendingCreditOrders}</div>
        <p className="text-[11px] text-amber-700/80 mt-1">Awaiting credit scoring</p>
      </div>

      {/* 3. Credit Blocked Orders */}
      <div
        onClick={() => handleCardClick('status', 'BLOCKED')}
        className="bg-gradient-to-br from-white to-rose-50/50 rounded-xl p-4 border border-rose-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-rose-700 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Credit Blocked</span>
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-900">{creditBlockedOrders}</div>
        <p className="text-[11px] text-rose-600 mt-1 font-medium">Requires Manager Release</p>
      </div>

      {/* 4. Orders Released */}
      <div
        onClick={() => handleCardClick('status', 'RELEASED')}
        className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-emerald-700 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Released</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-900">{releasedOrders}</div>
        <p className="text-[11px] text-emerald-700 mt-1">Manager approved</p>
      </div>

      {/* 5. Total Order Value */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Value</span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-slate-900 truncate" title={formatCurrencyINR(totalOrderValue)}>
          {formatCurrencyINR(totalOrderValue)}
        </div>
        <p className="text-[11px] text-slate-500 mt-1">Gross pipeline value</p>
      </div>

      {/* 6. Total Overdue Receivables */}
      <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between text-orange-700 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Overdue</span>
          <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-orange-950 truncate" title={formatCurrencyINR(totalOverdue)}>
          {formatCurrencyINR(totalOverdue)}
        </div>
        <p className="text-[11px] text-orange-700 mt-1">High collections risk</p>
      </div>

      {/* 7. High Risk Customers */}
      <div
        onClick={() => setActiveTab('CUSTOMERS')}
        className="bg-white rounded-xl p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-purple-700 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">High Risk BPs</span>
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-purple-900">{highRiskCustomersCount}</div>
        <p className="text-[11px] text-purple-700 mt-1">High & Critical category</p>
      </div>
    </div>
  );
};
