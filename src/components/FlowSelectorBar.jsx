import React, { useState } from 'react';
import { Workflow, Plus, Sparkles, Check, ChevronDown, Zap, Calendar, Star } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

export function FlowSelectorBar() {
  const workflows = useWorkflowStore((state) => state.workflows);
  const activeFlowId = useWorkflowStore((state) => state.activeFlowId);
  const switchFlow = useWorkflowStore((state) => state.switchFlow);
  const createNewFlow = useWorkflowStore((state) => state.createNewFlow);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowCategory, setNewFlowCategory] = useState('Quote Request');

  const activeFlow = workflows.find((w) => w.id === activeFlowId) || workflows[0];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFlowName.trim()) return;
    createNewFlow(newFlowName, newFlowCategory);
    setNewFlowName('');
    setShowNewModal(false);
  };

  return (
    <div className="bg-[#090d16] border-b border-slate-800 px-6 py-2 flex items-center justify-between z-20 select-none">
      
      {/* Flow Switcher Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 flex-shrink-0 mr-1">
          <Workflow className="w-3.5 h-3.5 text-cyan-400" /> Active Canvas Flow:
        </span>

        {workflows.map((wf) => {
          const isActive = wf.id === activeFlowId;
          return (
            <button
              key={wf.id}
              onClick={() => switchFlow(wf.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 flex-shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              <span className="truncate">{wf.name}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* New Flow Action Button */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Flow</span>
        </button>
      </div>

      {/* Modal: Create New Flow */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Create New Automation Flow</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Flow Name / Purpose</label>
                <input
                  type="text"
                  required
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="e.g. Emergency After-Hours Quote Response"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workflow Category</label>
                <select
                  value={newFlowCategory}
                  onChange={(e) => setNewFlowCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Quote Request">Quote Request / Webhook Lead</option>
                  <option value="Booked Appointment">Booked Appointment & Reminders</option>
                  <option value="Post-Job Review">Post-Service Review & Retention</option>
                  <option value="Re-activation">CSV Re-activation Campaign</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                ⚡ Creating a new flow will generate a fresh canvas populated with its own dedicated Trigger node.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/20"
                >
                  Create Canvas Flow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
