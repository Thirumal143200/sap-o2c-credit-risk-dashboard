import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrencyINR } from '../utils/creditEngine';
import {
  XCircle,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export const ValidationModal: React.FC = () => {
  const {
    validationModal,
    dismissValidationModal,
    openReleaseModal,
    orders,
    selectedOrderId,
    currentRole,
  } = useApp();

  if (!validationModal) return null;

  const currentOrder = orders.find((o) => o.id === selectedOrderId);

  const handleOpenRelease = () => {
    dismissValidationModal();
    if (currentOrder) {
      openReleaseModal(currentOrder);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-rose-200 max-w-lg w-full overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-white/20">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">SAP Business Control Violation</h3>
              <p className="text-xs text-rose-100">Order-to-Cash Exception & Fulfillment Guard</p>
            </div>
          </div>
          <button
            onClick={dismissValidationModal}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Affected Rule Header */}
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
              {validationModal.ruleNumber ? `RULE ${validationModal.ruleNumber}` : 'POLICY EXCEPTION'}
            </span>
            <span className="font-bold text-slate-800 text-sm">
              {validationModal.ruleName || 'Business Process Exception'}
            </span>
          </div>

          {/* Reason Block */}
          <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Reason for Rejection:
            </div>
            <p className="text-xs font-semibold text-rose-900">
              {validationModal.reason}
            </p>
          </div>

          {/* Exposure / Financial Metrics Details (if available) */}
          {(validationModal.customerCreditLimit !== undefined ||
            validationModal.projectedExposure !== undefined) && (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Financial Exposure Assessment:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {validationModal.customerCreditLimit !== undefined && (
                  <div>
                    <span className="text-slate-500">Customer Credit Limit:</span>
                    <div className="font-mono font-bold text-slate-900">
                      {formatCurrencyINR(validationModal.customerCreditLimit)}
                    </div>
                  </div>
                )}
                {validationModal.projectedExposure !== undefined && (
                  <div>
                    <span className="text-slate-500">Projected Exposure:</span>
                    <div className="font-mono font-bold text-slate-900">
                      {formatCurrencyINR(validationModal.projectedExposure)}
                    </div>
                  </div>
                )}
              </div>

              {validationModal.exceededBy !== undefined && validationModal.exceededBy > 0 && (
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-semibold text-rose-700">Credit Limit Exceeded By:</span>
                  <span className="font-mono font-bold text-rose-700 text-sm">
                    {formatCurrencyINR(validationModal.exceededBy)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Required Action Block */}
          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Mandatory Required Action:</span>
            </div>
            <p className="text-xs font-medium text-blue-900">
              {validationModal.requiredAction}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] text-slate-500">
            Active Role: <strong className="text-slate-800">{currentRole}</strong>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={dismissValidationModal}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Acknowledge & Close
            </button>

            {currentOrder && currentOrder.creditStatus === 'BLOCKED' && (
              <button
                onClick={handleOpenRelease}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Authorize Release</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
