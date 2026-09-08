import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyINR } from '../utils/creditEngine';
import {
  ShieldCheck,
  ShieldAlert,
  X,
  AlertTriangle,
  UserCheck,
  Check,
} from 'lucide-react';

export const ManagerReleaseModal: React.FC = () => {
  const {
    releaseModalOrder,
    closeReleaseModal,
    executeCreditRelease,
    currentRole,
    setCurrentRole,
    customers,
  } = useApp();

  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!releaseModalOrder) return null;

  const customer = customers.find((c) => c.id === releaseModalOrder.customerId);

  const predefinedReasons = [
    'Customer provided verified Bank Guarantee (BG) covering 100% order value.',
    'Advance payment of 50% confirmed via RTGS ledger credit.',
    'Special executive exemption approved by Corporate Credit Committee.',
    'Customer provided signed irrevocable Letter of Credit (LC) valid for 60 days.',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (currentRole !== 'CREDIT_MANAGER') {
      setErrorMsg('Unauthorized: Only an authorized Credit Manager can release a credit-blocked sales order.');
      return;
    }

    if (!reason || reason.trim().length === 0) {
      setErrorMsg('Release reason is required.');
      return;
    }

    const success = executeCreditRelease(releaseModalOrder.id, reason);
    if (success) {
      setReason('');
      setErrorMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Credit Manager Authorization</h3>
              <p className="text-xs text-slate-400">Release Credit Block for {releaseModalOrder.id}</p>
            </div>
          </div>
          <button
            onClick={closeReleaseModal}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Order Summary Strip */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-slate-900 text-sm font-mono">{releaseModalOrder.id}</span>
                <div className="text-slate-600 font-semibold">{releaseModalOrder.customerName}</div>
                <div className="text-slate-400 font-mono text-[11px]">{releaseModalOrder.customerId}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Order Net Value:</span>
                <div className="text-sm font-bold font-mono text-blue-700">
                  {formatCurrencyINR(releaseModalOrder.orderValue)}
                </div>
              </div>
            </div>

            {customer && (
              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Credit Limit:</span>
                  <div className="font-mono font-bold text-slate-800">{formatCurrencyINR(customer.creditLimit)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Current Exp:</span>
                  <div className="font-mono font-bold text-slate-800">{formatCurrencyINR(customer.currentExposure)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Risk Level:</span>
                  <div className="font-bold text-rose-700">{customer.riskCategory} ({customer.riskScore}/100)</div>
                </div>
              </div>
            )}
          </div>

          {/* Role Check Banner */}
          {currentRole !== 'CREDIT_MANAGER' ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-950">Active Role: Sales User (Read-Only Authorization)</div>
                <p className="text-[11px] text-amber-800">
                  Per SAP business controls (RULE 4), Sales Users cannot release credit blocks. Switch your simulation role to
                  Credit Manager below to simulate manager approval.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentRole('CREDIT_MANAGER')}
                  className="mt-1 px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors"
                >
                  Switch Role to Credit Manager
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-center space-x-2 text-[11px]">
              <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Authorized as <strong>Credit Manager</strong>. You have release authority with mandatory audit justification.
              </span>
            </div>
          )}

          {/* Predefined Templates */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Quick Justification Template:
            </label>
            <div className="space-y-1.5">
              {predefinedReasons.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReason(r)}
                  className="w-full text-left p-2 rounded border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-[11px] text-slate-700 transition-colors flex items-center justify-between"
                >
                  <span>{r}</span>
                  {reason === r && <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mandatory Release Reason Textarea */}
          <div>
            <label className="block text-slate-900 font-bold mb-1">
              Official Release Audit Justification <span className="text-rose-600">*</span>:
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Enter comprehensive business rationale for overriding credit block..."
              className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Recorded in the permanent SAP credit audit trail. Mandatory per RULE 5.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 font-semibold flex items-center space-x-1.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeReleaseModal}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-colors text-xs flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Release Block</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
