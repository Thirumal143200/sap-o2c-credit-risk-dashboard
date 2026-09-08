import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { OrderList } from './components/OrderList';
import { OrderDetailsView } from './components/OrderDetailsView';
import { CustomerList } from './components/CustomerList';
import { ValidationModal } from './components/ValidationModal';
import { ManagerReleaseModal } from './components/ManagerReleaseModal';
import { NewOrderModal } from './components/NewOrderModal';
import { Toast } from './components/Toast';
import { Info, Building, FileSpreadsheet, Layers } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { activeTab, selectedOrderId, currentRole } = useApp();
  const [initialStatusFilter, setInitialStatusFilter] = useState('ALL');

  const handleKpiFilterClick = (_filterType: string, value: string) => {
    setInitialStatusFilter(value);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Simulation Info Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-4 text-white shadow-sm border border-blue-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                SAP O2C Credit Risk & Control Architecture
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Simulation
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Simulating Sales Order → Credit Check → Delivery → Goods Issue → Billing → AR Clearing.
              Strict validation rules enforce credit limits, role-based manager release, and stage order.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <span className="text-slate-400">Current Role:</span>
          <span
            className={`font-bold ${
              currentRole === 'CREDIT_MANAGER' ? 'text-emerald-400' : 'text-blue-300'
            }`}
          >
            {currentRole === 'CREDIT_MANAGER' ? 'Credit Manager (Release Authority)' : 'Sales User (Standard)'}
          </span>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          <KpiCards onFilterClick={handleKpiFilterClick} />
          <AnalyticsCharts />

          {/* Dual Panel: Order Details Inspector & Quick Order Table */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Selected Order Inspection & Lifecycle</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Inspect document flow and test sequence validation
              </span>
            </div>
            <OrderDetailsView />

            <div className="pt-4">
              <OrderList initialStatusFilter={initialStatusFilter} />
            </div>
          </div>
        </div>
      )}

      {/* SALES ORDERS TAB */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-6">
          <KpiCards onFilterClick={handleKpiFilterClick} />
          <OrderList initialStatusFilter={initialStatusFilter} />
          <div className="pt-2">
            <div className="flex items-center space-x-2 mb-4">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                Order Inspector: {selectedOrderId || 'None Selected'}
              </h2>
            </div>
            <OrderDetailsView />
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-6">
          <CustomerList />
        </div>
      )}

      {/* Modals & Toasts */}
      <ValidationModal />
      <ManagerReleaseModal />
      <NewOrderModal />
      <Toast />
    </main>
  );
};

export function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
        <Header />
        <DashboardContent />

        {/* Enterprise Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-300">
                Assessment Simulation — SAP O2C Credit Risk Control
              </span>
            </div>

            <div className="text-center sm:text-right text-[11px] text-slate-400">
              <p>
                Important Disclaimer: This project is an assessment simulation inspired by the SAP O2C
                business process. It does not connect to a live SAP system.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;
