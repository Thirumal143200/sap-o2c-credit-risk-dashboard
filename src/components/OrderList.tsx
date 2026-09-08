import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyINR } from '../utils/creditEngine';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import type { RiskCategory, SalesOrder } from '../types';

interface OrderListProps {
  initialStatusFilter?: string;
  initialRiskFilter?: string;
}

export const OrderList: React.FC<OrderListProps> = ({
  initialStatusFilter = 'ALL',
  initialRiskFilter = 'ALL',
}) => {
  const {
    orders,
    customers,
    selectedOrderId,
    setSelectedOrderId,
    openReleaseModal,
    currentRole,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [riskFilter, setRiskFilter] = useState<string>(initialRiskFilter);
  const [customerFilter, setCustomerFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof SalesOrder>('orderDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Status Badge Helper
  const renderStatusBadge = (status: SalesOrder['orderStatus']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Approved
          </span>
        );
      case 'CREDIT_BLOCKED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            Credit Blocked
          </span>
        );
      case 'RELEASED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Released
          </span>
        );
      case 'IN_DELIVERY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
            In Delivery
          </span>
        );
      case 'GOODS_ISSUED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            Goods Issued
          </span>
        );
      case 'BILLED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            Billed
          </span>
        );
      case 'CLEARED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            Cleared / Paid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Risk Badge Helper
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

  const handleSort = (field: keyof SalesOrder) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Search
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          o.id.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.customerId.toLowerCase().includes(search);

        if (!matchesSearch) return false;

        // Status Filter
        if (statusFilter === 'BLOCKED' && o.creditStatus !== 'BLOCKED') return false;
        if (statusFilter === 'RELEASED' && o.creditStatus !== 'RELEASED') return false;
        if (statusFilter === 'PENDING' && o.orderStatus !== 'PENDING_CREDIT_CHECK') return false;
        if (statusFilter === 'APPROVED' && o.orderStatus !== 'APPROVED') return false;
        if (statusFilter === 'CLEARED' && o.orderStatus !== 'CLEARED') return false;

        // Risk Filter
        if (riskFilter !== 'ALL' && o.riskCategory !== riskFilter) return false;

        // Customer Filter
        if (customerFilter !== 'ALL' && o.customerId !== customerFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortAsc
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        if (typeof valA === 'number') {
          return sortAsc
            ? (valA as number) - (valB as number)
            : (valB as number) - (valA as number);
        }

        return 0;
      });
  }, [orders, searchTerm, statusFilter, riskFilter, customerFilter, sortField, sortAsc]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Controls Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">SAP Sales Order Worklist</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredOrders.length} of {orders.length} simulated O2C orders
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Order ID, Customer, BP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="BLOCKED">Credit Blocked</option>
            <option value="RELEASED">Manager Released</option>
            <option value="APPROVED">Direct Approved</option>
            <option value="PENDING">Pending Credit Check</option>
            <option value="CLEARED">Cleared / Settled</option>
          </select>

          {/* Risk Category Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">LOW Risk (0-24)</option>
            <option value="MEDIUM">MEDIUM Risk (25-49)</option>
            <option value="HIGH">HIGH Risk (50-74)</option>
            <option value="CRITICAL">CRITICAL Risk (75+)</option>
          </select>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px]"
          >
            <option value="ALL">All Business Partners</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'ALL' || riskFilter !== 'ALL' || customerFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setRiskFilter('ALL');
                setCustomerFilter('ALL');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Order ID</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('customerName')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Customer & BP</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('orderDate')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/70"
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('orderValue')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 text-right"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Order Value</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-right">Limit / Exposure</th>
              <th className="py-3 px-3 text-right">Overdue</th>
              <th
                onClick={() => handleSort('riskScore')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/70 text-center"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Next Action</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-400">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  No sales orders match the specified search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrderId === order.id;
                const isOverLimit = order.currentExposure + order.orderValue > order.creditLimit;

                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/90 font-medium' : ''
                    }`}
                  >
                    {/* Order ID */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        {order.creditStatus === 'BLOCKED' && (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        )}
                        <span>{order.id}</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 truncate max-w-[180px]" title={order.customerName}>
                        {order.customerName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{order.customerId}</div>
                    </td>

                    {/* Order Date */}
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {order.orderDate}
                    </td>

                    {/* Order Value */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrencyINR(order.orderValue)}
                    </td>

                    {/* Limit / Exposure */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="text-slate-700 font-mono">
                        Exp: {formatCurrencyINR(order.currentExposure)}
                      </div>
                      <div className={`text-[11px] font-mono ${isOverLimit ? 'text-rose-600' : 'text-slate-400'}`}>
                        Lim: {formatCurrencyINR(order.creditLimit)}
                      </div>
                    </td>

                    {/* Overdue */}
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono">
                      {order.overdueAmount > 0 ? (
                        <span className="text-orange-600 font-semibold">
                          {formatCurrencyINR(order.overdueAmount)}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {renderRiskBadge(order.riskCategory, order.riskScore)}
                    </td>

                    {/* Order Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {renderStatusBadge(order.orderStatus)}
                    </td>

                    {/* Next Action */}
                    <td className="py-3 px-3 text-slate-700 truncate max-w-[170px]" title={order.nextAction}>
                      <span className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {order.nextAction}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        {order.creditStatus === 'BLOCKED' && (
                          <button
                            onClick={() => openReleaseModal(order)}
                            className="px-2 py-1 rounded text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center space-x-1"
                            title={
                              currentRole === 'CREDIT_MANAGER'
                                ? 'Authorize credit release'
                                : 'Manager authorization required'
                            }
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Release</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="View complete order details & O2C timeline"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
