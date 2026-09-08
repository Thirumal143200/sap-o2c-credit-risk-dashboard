import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyINR, calculateRiskBreakdown } from '../utils/creditEngine';
import {
  PlusCircle,
  X,
  Trash2,
  Plus,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export const NewOrderModal: React.FC = () => {
  const {
    newOrderModalOpen,
    setNewOrderModalOpen,
    customers,
    materials,
    createNewSalesOrder,
  } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [items, setItems] = useState<{ materialId: string; quantity: number }[]>([
    { materialId: materials[0]?.id || '', quantity: 1 },
  ]);

  if (!newOrderModalOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Calculate order total
  const orderTotal = items.reduce((sum, item) => {
    const mat = materials.find((m) => m.id === item.materialId);
    return sum + (mat ? mat.unitPrice * item.quantity : 0);
  }, 0);

  // Simulated live credit check preview
  const riskBreakdown = selectedCustomer
    ? calculateRiskBreakdown(selectedCustomer, orderTotal)
    : null;

  const isOverLimit = selectedCustomer
    ? selectedCustomer.currentExposure + orderTotal > selectedCustomer.creditLimit
    : false;

  const isCriticalRisk = selectedCustomer?.riskCategory === 'CRITICAL' || riskBreakdown?.riskCategory === 'CRITICAL';

  const handleAddItem = () => {
    setItems([...items, { materialId: materials[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'materialId' | 'quantity', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || items.length === 0) return;
    createNewSalesOrder(selectedCustomerId, items);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Create SAP Sales Order (VA01)</h3>
              <p className="text-xs text-slate-400">Deterministic Credit Assessment Simulation</p>
            </div>
          </div>
          <button
            onClick={() => setNewOrderModalOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Customer Selection */}
          <div>
            <label className="block text-slate-900 font-bold mb-1">
              Select Business Partner / Customer <span className="text-rose-600">*</span>:
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id}) — Limit: {formatCurrencyINR(c.creditLimit)} | Risk: {c.riskCategory}
                </option>
              ))}
            </select>
          </div>

          {/* Customer Ledger Snapshot */}
          {selectedCustomer && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400">Current Exposure:</span>
                <div className="font-mono font-bold text-slate-800">
                  {formatCurrencyINR(selectedCustomer.currentExposure)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Available Headroom:</span>
                <div className="font-mono font-bold text-slate-800">
                  {formatCurrencyINR(selectedCustomer.availableCredit)}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Risk Score:</span>
                <div className="font-bold text-slate-800">
                  {selectedCustomer.riskScore}/100 ({selectedCustomer.riskCategory})
                </div>
              </div>
            </div>
          )}

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-900 font-bold">Sales Order Items (VBAP):</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const mat = materials.find((m) => m.id === item.materialId);
                const net = mat ? mat.unitPrice * item.quantity : 0;

                return (
                  <div key={idx} className="flex items-center space-x-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-slate-400 font-mono font-bold">{(idx + 1) * 10}</span>
                    <select
                      value={item.materialId}
                      onChange={(e) => handleItemChange(idx, 'materialId', e.target.value)}
                      className="flex-1 p-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-800"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.id} - {m.name} ({formatCurrencyINR(m.unitPrice)}/{m.unitOfMeasure})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 p-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-center"
                    />

                    <span className="w-24 text-right font-mono font-bold text-slate-800">
                      {formatCurrencyINR(net)}
                    </span>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Credit Assessment Preview */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-300">Total Simulated Net Order Value:</span>
              <span className="font-mono font-bold text-base text-blue-400">
                {formatCurrencyINR(orderTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Projected Credit Outcome:</span>
              {isOverLimit || isCriticalRisk ? (
                <span className="flex items-center space-x-1 font-bold text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Will Trigger CREDIT BLOCK</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Eligible for Direct Approval</span>
                </span>
              )}
            </div>

            {isOverLimit && (
              <p className="text-[10px] text-rose-300">
                Notice: Projected exposure ({formatCurrencyINR((selectedCustomer?.currentExposure || 0) + orderTotal)}) exceeds credit limit ({formatCurrencyINR(selectedCustomer?.creditLimit || 0)}).
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setNewOrderModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-colors text-xs flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulate Order Creation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
