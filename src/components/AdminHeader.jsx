import React, { useState } from 'react';
import { Shield, Server, Database, Cpu, Lock, LayoutDashboard, Workflow, Code, Calendar } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { AdminChatWidgetCodeModal } from './AdminChatWidgetCodeModal';

export function AdminHeader() {
  const adminSubView = useWorkflowStore((state) => state.adminSubView);
  const setAdminSubView = useWorkflowStore((state) => state.setAdminSubView);
  const [showCodeModal, setShowCodeModal] = useState(false);

  return (
    <header className="h-16 border-b border-[#252528] bg-[#0B0B0D] px-6 flex items-center justify-between z-30 select-none flex-shrink-0">
      {/* Brand & Sub-View Switcher */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 bg-[#101014] border border-[#252528] px-3 py-1.5 rounded-xl shadow-lg">
          <div className="p-1.5 bg-[#FF2538]/10 rounded-lg text-[#FF2538] border border-[#FF2538]/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-bold tracking-wider flex items-center">
                <span className="text-white">BOOK</span>
                <span className="text-[#FF2538] ml-0.5">MOAR</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">ENGINE</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 flex items-center gap-1">
                <Lock className="w-2 h-2" /> PRIVATE
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#FF2538] font-medium">/admin/workflows</p>
          </div>
        </div>

        {/* View Mode Toggle Pills */}
        <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-xl border border-[#252528]">
          <button
            onClick={() => setAdminSubView('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              adminSubView === 'dashboard'
                ? 'bg-[#FF2538]/20 text-[#FF2538] border border-[#FF2538]/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Master Launchpad</span>
          </button>

          <button
            onClick={() => setAdminSubView('canvas')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              adminSubView === 'canvas'
                ? 'bg-[#FF2538]/20 text-[#FF2538] border border-[#FF2538]/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Canvas Workspace</span>
          </button>
        </div>
      </div>

      {/* Embed Script Trigger & System Status Badges */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Get Embed Script Button */}
        <button
          onClick={() => setShowCodeModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FF2538]/10 hover:bg-[#FF2538]/20 text-[#FF2538] font-bold border border-[#FF2538]/30 transition-all active:scale-95 shadow-md shadow-[#FF2538]/5"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Get Embed Script</span>
        </button>

        <div className="hidden md:flex items-center space-x-2 bg-[#101014] border border-[#252528] px-3 py-1.5 rounded-xl">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300 font-medium">PostgreSQL:</span>
          <span className="flex items-center text-emerald-400 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span> Connected
          </span>
        </div>
      </div>

      {/* Code Modal */}
      <AdminChatWidgetCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </header>
  );
}
