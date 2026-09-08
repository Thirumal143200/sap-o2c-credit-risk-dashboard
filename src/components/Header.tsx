import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  PlusCircle,
  RotateCcw,
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  UserCheck,
  Building,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeTab,
    setActiveTab,
    orders,
    customers,
    setNewOrderModalOpen,
    resetSimulationData,
  } = useApp();

  const blockedCount = orders.filter((o) => o.creditStatus === 'BLOCKED').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Banner: Assessment Disclaimer */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Assessment Simulation — SAP O2C
          </span>
          <span className="hidden sm:inline text-slate-400">
            Order-to-Cash Credit Risk & Fulfillment Control Engine (Simulated SAP Business Suite)
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-slate-400">Currency: <strong className="text-white">INR (₹)</strong></span>
          <button
            onClick={resetSimulationData}
            title="Reset simulation data to default master state"
            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-inner border border-blue-400/30">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">SAP O2C Credit Risk</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  S/4 Simulation
                </span>
              </div>
              <p className="text-xs text-slate-400">Order-to-Cash Credit Exposure & Authorization Portal</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'DASHBOARD'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ORDERS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Sales Orders</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-slate-700 text-slate-200">
                {orders.length}
              </span>
              {blockedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
                  {blockedCount} blocked
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('CUSTOMERS')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'CUSTOMERS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customer Master</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs bg-slate-700 text-slate-200">
                {customers.length}
              </span>
            </button>
          </nav>

          {/* Right Action Area: Role Selector & New Order */}
          <div className="flex items-center space-x-3">
            {/* Role Switcher */}
            <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700">
              <div className="flex items-center space-x-1.5 mr-2 pl-1.5 text-xs text-slate-400">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Role:</span>
              </div>
              <button
                onClick={() => setCurrentRole('SALES_USER')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  currentRole === 'SALES_USER'
                    ? 'bg-slate-700 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Sales User: Can create orders, cannot release credit blocks"
              >
                Sales User
              </button>
              <button
                onClick={() => setCurrentRole('CREDIT_MANAGER')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center space-x-1 ${
                  currentRole === 'CREDIT_MANAGER'
                    ? 'bg-emerald-600 text-white shadow font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Credit Manager: Has authority to review and release credit blocks with mandatory reason"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Credit Manager</span>
              </button>
            </div>

            {/* Quick Action: New Order */}
            <button
              onClick={() => setNewOrderModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-sm transition-all border border-blue-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">+ Create Order</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex space-x-2 py-2 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex-1 py-1.5 text-xs font-medium rounded text-center ${
              activeTab === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`flex-1 py-1.5 text-xs font-medium rounded text-center ${
              activeTab === 'ORDERS' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`flex-1 py-1.5 text-xs font-medium rounded text-center ${
              activeTab === 'CUSTOMERS' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            Customers ({customers.length})
          </button>
        </div>
      </div>
    </header>
  );
};
