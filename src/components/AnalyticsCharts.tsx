import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyINR } from '../utils/creditEngine';
import { BarChart3, PieChart, TrendingUp, AlertOctagon } from 'lucide-react';

export const AnalyticsCharts: React.FC = () => {
  const { orders, customers } = useApp();

  // 1. Order Value by Risk Category
  const riskValues = {
    LOW: orders.filter((o) => o.riskCategory === 'LOW').reduce((sum, o) => sum + o.orderValue, 0),
    MEDIUM: orders.filter((o) => o.riskCategory === 'MEDIUM').reduce((sum, o) => sum + o.orderValue, 0),
    HIGH: orders.filter((o) => o.riskCategory === 'HIGH').reduce((sum, o) => sum + o.orderValue, 0),
    CRITICAL: orders.filter((o) => o.riskCategory === 'CRITICAL').reduce((sum, o) => sum + o.orderValue, 0),
  };
  const maxRiskValue = Math.max(...Object.values(riskValues), 1);

  // 2. Customer Risk Distribution
  const customerRiskCounts = {
    LOW: customers.filter((c) => c.riskCategory === 'LOW').length,
    MEDIUM: customers.filter((c) => c.riskCategory === 'MEDIUM').length,
    HIGH: customers.filter((c) => c.riskCategory === 'HIGH').length,
    CRITICAL: customers.filter((c) => c.riskCategory === 'CRITICAL').length,
  };

  // 3. Credit Blocked vs Released
  const blockedCount = orders.filter((o) => o.creditStatus === 'BLOCKED').length;
  const releasedCount = orders.filter((o) => o.creditStatus === 'RELEASED').length;
  const cleanCount = orders.filter((o) => o.creditStatus === 'APPROVED').length;
  const totalCreditOrders = blockedCount + releasedCount + cleanCount;

  // 4. Top Overdue Receivables Customers
  const overdueCustomers = [...customers]
    .filter((c) => c.overdueReceivables > 0)
    .sort((a, b) => b.overdueReceivables - a.overdueReceivables);
  const maxOverdue = overdueCustomers.length > 0 ? overdueCustomers[0].overdueReceivables : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Chart 1: Order Value by Risk Category */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Order Value by Risk Category</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Gross INR</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {/* LOW */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> LOW RISK
                </span>
                <span className="font-mono text-slate-700 font-medium">
                  {formatCurrencyINR(riskValues.LOW)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(riskValues.LOW / maxRiskValue) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* MEDIUM */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-blue-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> MEDIUM RISK
                </span>
                <span className="font-mono text-slate-700 font-medium">
                  {formatCurrencyINR(riskValues.MEDIUM)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(riskValues.MEDIUM / maxRiskValue) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* HIGH */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> HIGH RISK
                </span>
                <span className="font-mono text-slate-700 font-medium">
                  {formatCurrencyINR(riskValues.HIGH)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(riskValues.HIGH / maxRiskValue) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* CRITICAL */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> CRITICAL RISK
                </span>
                <span className="font-mono text-rose-700 font-semibold">
                  {formatCurrencyINR(riskValues.CRITICAL)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(riskValues.CRITICAL / maxRiskValue) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>Total Pipeline Assessed</span>
          <span className="font-semibold text-slate-700">
            {formatCurrencyINR(
              riskValues.LOW + riskValues.MEDIUM + riskValues.HIGH + riskValues.CRITICAL
            )}
          </span>
        </div>
      </div>

      {/* Chart 2: Credit Blocked vs Released Status */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Credit Block & Release Control</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Authorization</span>
          </div>

          {/* Visualization bar */}
          <div className="pt-2">
            <div className="flex text-xs font-semibold justify-between mb-2">
              <span className="text-slate-600">Decision Breakdown</span>
              <span className="font-mono text-slate-500">{totalCreditOrders} Orders</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden p-0.5 border border-slate-200">
              <div
                title={`Approved clean: ${cleanCount}`}
                className="bg-emerald-500 h-full rounded-l-full transition-all"
                style={{ width: `${(cleanCount / totalCreditOrders) * 100}%` }}
              ></div>
              <div
                title={`Released by Manager: ${releasedCount}`}
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${(releasedCount / totalCreditOrders) * 100}%` }}
              ></div>
              <div
                title={`Credit Blocked: ${blockedCount}`}
                className="bg-rose-500 h-full rounded-r-full transition-all"
                style={{ width: `${(blockedCount / totalCreditOrders) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-semibold text-emerald-800">Direct Clear</div>
                <div className="text-lg font-bold text-emerald-900 mt-0.5">{cleanCount}</div>
                <div className="text-[10px] text-emerald-600">
                  {Math.round((cleanCount / totalCreditOrders) * 100)}%
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xs font-semibold text-blue-800">Released</div>
                <div className="text-lg font-bold text-blue-900 mt-0.5">{releasedCount}</div>
                <div className="text-[10px] text-blue-600">
                  {Math.round((releasedCount / totalCreditOrders) * 100)}%
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <div className="text-xs font-semibold text-rose-800">Blocked</div>
                <div className="text-lg font-bold text-rose-900 mt-0.5">{blockedCount}</div>
                <div className="text-[10px] text-rose-600">
                  {Math.round((blockedCount / totalCreditOrders) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-slate-600">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Active Control Rate
          </span>
          <span className="font-semibold text-slate-700">
            {Math.round(((blockedCount + releasedCount) / totalCreditOrders) * 100)}% Under Exception
          </span>
        </div>
      </div>

      {/* Chart 3: Overdue Receivables Ranking */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-slate-800">Overdue Receivables Exposure</h3>
            </div>
            <span className="text-xs text-orange-600 font-semibold font-mono">
              {overdueCustomers.length} Accounts
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {overdueCustomers.slice(0, 4).map((c) => (
              <div key={c.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 truncate max-w-[170px]" title={c.name}>
                    {c.name}
                  </span>
                  <span className="font-mono text-orange-700 font-semibold">
                    {formatCurrencyINR(c.overdueReceivables)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${(c.overdueReceivables / maxOverdue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
          <span>Customer Master Risk</span>
          <div className="flex space-x-1.5 font-semibold text-[11px]">
            <span className="text-emerald-600">{customerRiskCounts.LOW} Low</span>
            <span>•</span>
            <span className="text-blue-600">{customerRiskCounts.MEDIUM} Med</span>
            <span>•</span>
            <span className="text-amber-600">{customerRiskCounts.HIGH} High</span>
            <span>•</span>
            <span className="text-rose-600">{customerRiskCounts.CRITICAL} Crit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
