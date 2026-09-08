import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyINR } from '../utils/creditEngine';
import {
  Users,
  Search,
  ExternalLink,
} from 'lucide-react';
import type { RiskCategory } from '../types';

export const CustomerList: React.FC = () => {
  const { customers, orders, setSelectedOrderId, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  const filteredCustomers = customers.filter((c) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(search) ||
      c.id.toLowerCase().includes(search) ||
      c.city.toLowerCase().includes(search) ||
      c.industry.toLowerCase().includes(search);

    if (!matchesSearch) return false;
    if (riskFilter !== 'ALL' && c.riskCategory !== riskFilter) return false;
    return true;
  });

  const renderRiskBadge = (category: RiskCategory, score: number) => {
    switch (category) {
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {score} • LOW
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {score} • MEDIUM
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            {score} • HIGH
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 font-bold">
            {score} • CRITICAL
          </span>
        );
    }
  };

  const handleViewCustomerOrders = (customerId: string) => {
    const firstOrder = orders.find((o) => o.customerId === customerId);
    if (firstOrder) {
      setSelectedOrderId(firstOrder.id);
    }
    setActiveTab('ORDERS');
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">SAP Business Partner (Customer) Master</h2>
            <p className="text-xs text-slate-500">Credit risk profile, exposure thresholds, and receivables ledger</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 font-medium focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">LOW Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="CRITICAL">CRITICAL Risk</option>
          </select>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search BP ID, Name, City..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCustomers.map((customer) => {
          const utilizationPct =
            customer.creditLimit > 0
              ? Math.round((customer.currentExposure / customer.creditLimit) * 100)
              : 100;

          return (
            <div
              key={customer.id}
              className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                customer.riskCategory === 'CRITICAL'
                  ? 'border-rose-300 ring-1 ring-rose-300/50'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors">
                      {customer.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold text-blue-600">{customer.id}</span>
                    <span>•</span>
                    <span>{customer.industry}</span>
                    <span>•</span>
                    <span>{customer.city}</span>
                  </div>
                </div>

                <div>{renderRiskBadge(customer.riskCategory, customer.riskScore)}</div>
              </div>

              {/* Credit & Exposure Bar */}
              <div className="py-3 border-b border-slate-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600">Credit Limit Utilization:</span>
                  <span
                    className={`font-mono font-bold ${
                      utilizationPct > 100 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {utilizationPct}% ({formatCurrencyINR(customer.currentExposure)} / {formatCurrencyINR(customer.creditLimit)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      utilizationPct > 90
                        ? 'bg-rose-500'
                        : utilizationPct > 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, utilizationPct)}%` }}
                  ></div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px]">Available Credit</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {formatCurrencyINR(customer.availableCredit)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Overdue Receivables</div>
                  <div
                    className={`font-mono font-bold mt-0.5 ${
                      customer.overdueReceivables > 0 ? 'text-orange-600' : 'text-slate-500'
                    }`}
                  >
                    {formatCurrencyINR(customer.overdueReceivables)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[11px]">Payment History</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {customer.paymentHistory}
                  </div>
                </div>
              </div>

              {/* Order Status Counts & Drill Down */}
              <div className="pt-3 flex items-center justify-between text-xs">
                <div className="flex space-x-3 text-slate-600">
                  <span>
                    Open: <strong className="text-slate-900">{customer.openOrdersCount}</strong>
                  </span>
                  <span>
                    Blocked:{' '}
                    <strong
                      className={customer.blockedOrdersCount > 0 ? 'text-rose-600' : 'text-slate-900'}
                    >
                      {customer.blockedOrdersCount}
                    </strong>
                  </span>
                  <span>
                    Completed:{' '}
                    <strong className="text-emerald-700">{customer.completedOrdersCount}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleViewCustomerOrders(customer.id)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                >
                  <span>View Orders</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
