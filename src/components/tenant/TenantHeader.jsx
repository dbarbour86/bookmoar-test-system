import React from 'react';
import { Users, MessageSquare, Building2, Lock, ShieldCheck, CheckCircle2, RotateCcw, Clock, Calendar } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';

export function TenantHeader({ onNavigateRoute }) {
  const activeView = useTenantStore((state) => state.activeView);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const tenants = useTenantStore((state) => state.tenants);
  const notificationToast = useTenantStore((state) => state.notificationToast);
  const pendingUndoAction = useTenantStore((state) => state.pendingUndoAction);
  const undoPendingStageMove = useTenantStore((state) => state.undoPendingStageMove);
  const clearNotification = useTenantStore((state) => state.clearNotification);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  return (
    <header className="h-16 border-b border-[#252528] bg-[#0b0b0d] px-6 flex items-center justify-between z-30 select-none flex-shrink-0 font-sans">
      {/* View Title & Scope Badge */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 bg-[#101014] border border-[#252528] px-3 py-1.5 rounded-xl shadow-lg">
          <div className="p-1.5 bg-[#FF2538]/10 rounded-lg text-[#FF2538] border border-[#FF2538]/20">
            {activeView === 'inbox' ? <MessageSquare className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold tracking-wider flex items-center">
                <span className="text-white">BOOK</span>
                <span className="text-[#FF2538] ml-0.5">MOAR</span>
                <span className="text-slate-400 ml-1.5 text-[10px] uppercase font-bold tracking-wider">Client Portal</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20">
                /app/dashboard
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#FF2538] font-medium">
              Active Context: {activeTenant.name} ({activeTenant.subdomain})
            </p>
          </div>
        </div>
      </div>

      {/* Accidental Drag 15-Second Undo Toast */}
      {notificationToast && (
        <div className="flex items-center space-x-3 bg-[#101014] border border-[#FF2538]/50 text-red-300 px-4 py-2 rounded-2xl text-xs shadow-2xl shadow-[#FF2538]/10 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#FF2538] flex-shrink-0" />
          <span className="font-semibold">{notificationToast}</span>

          {/* Interactive Undo Button Link */}
          {pendingUndoAction ? (
            <button
              onClick={undoPendingStageMove}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-[#FF2538] text-white font-extrabold hover:bg-red-600 transition-all shadow-md active:scale-95 text-[10px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>[Undo Move]</span>
            </button>
          ) : (
            <button onClick={clearNotification} className="ml-2 text-slate-400 hover:text-white font-bold">✕</button>
          )}
        </div>
      )}

      {/* Security Isolation Status */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="hidden sm:flex items-center space-x-2 bg-[#101014] border border-[#252528] px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF2538]" />
          <span className="text-slate-300 font-medium">Multi-Tenant Isolation:</span>
          <span className="text-[#FF2538] font-mono text-[10px] font-bold">ENFORCED (`tenant_id`)</span>
        </div>

        <button
          onClick={() => onNavigateRoute && onNavigateRoute('admin')}
          className="flex items-center space-x-1.5 bg-[#101014] hover:bg-slate-800 border border-[#252528] text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
        >
          <Lock className="w-3.5 h-3.5 text-[#FF2538]" />
          <span>Admin Canvas</span>
        </button>
      </div>
    </header>
  );
}
export default TenantHeader;
