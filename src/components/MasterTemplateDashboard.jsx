import React, { useState } from 'react';
import { Workflow, Plus, Sparkles, Copy, ChevronDown, Check, Eye, Building2, Zap, Shield, Search, ArrowRight, Layers, Calendar } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

export function MasterTemplateDashboard() {
  const workflows = useWorkflowStore((state) => state.workflows);
  const tenants = useWorkflowStore((state) => state.tenants);
  const openCanvasWithFlow = useWorkflowStore((state) => state.openCanvasWithFlow);
  const duplicateTemplateToTenant = useWorkflowStore((state) => state.duplicateTemplateToTenant);
  const createNewFlow = useWorkflowStore((state) => state.createNewFlow);

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowCategory, setNewFlowCategory] = useState('Quote Request');

  const filteredWorkflows = workflows.filter((w) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.category.toLowerCase().includes(q);
  });

  const handleDuplicateClick = (templateId, tenantId) => {
    duplicateTemplateToTenant(templateId, tenantId);
    setActiveDropdownId(null);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFlowName.trim()) return;
    createNewFlow(newFlowName, newFlowCategory);
    setNewFlowName('');
    setShowNewModal(false);
  };

  return (
    <div className="flex-1 bg-[#070709] overflow-y-auto p-8 space-y-8 font-sans select-none">
      
      {/* Launchpad Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#252528]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#FF2538] mb-1">
            <Layers className="w-4 h-4" />
            <span className="uppercase tracking-wider">Master Automation Launchpad</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Blueprint Repository & Flow Instantiation</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Select a master flow blueprint below to launch into the full-screen canvas workspace, or deploy directly to an active tenant's execution queue.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center space-x-2.5 bg-[#FF2538] hover:bg-[#e01c2e] text-white font-bold text-xs px-5 py-3.5 rounded-2xl shadow-xl shadow-[#FF2538]/20 transition-all transform active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Master Flow</span>
        </button>
      </div>

      {/* Overview Platform Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#101014] border border-[#252528] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Master Blueprints</span>
            <Workflow className="w-4 h-4 text-[#FF2538]" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{workflows.length}</div>
          <p className="text-[11px] text-slate-500 font-medium">Configured automation sequences</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#101014] border border-[#252528] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Tenant Instances</span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {tenants.reduce((acc, t) => acc + (t.activeWorkflowsCount || 0), 0)}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Live in Redis queue worker engines</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#101014] border border-[#252528] space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Inbound Response Safeguard</span>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-300 font-mono">ENFORCED</div>
          <p className="text-[11px] text-slate-500 font-medium">Auto-halts sequences on customer reply</p>
        </div>
      </div>

      {/* Table Section with Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Available Blueprint Repository ({filteredWorkflows.length})
          </h3>

          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter blueprints by name or category..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-[#FF2538]"
            />
          </div>
        </div>

        {/* Sleek High-Whitespace Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#252528] bg-[#0b0b0d]/50 shadow-2xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#101014] text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-[#252528]">
              <tr>
                <th className="py-4 px-6">Blueprint Name & Category</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-center">Nodes</th>
                <th className="py-4 px-6">Updated</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252528]/80 font-sans">
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-[#101014]/60 transition-colors group">
                  
                  {/* Name & Category */}
                  <td className="py-5 px-6 font-bold text-white group-hover:text-[#FF2538] transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 group-hover:scale-105 transition-transform">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{workflow.name}</div>
                        <span className="inline-block mt-0.5 text-[9px] font-mono font-bold text-[#FF2538] bg-[#FF2538]/10 px-2 py-0.5 rounded-md border border-[#FF2538]/20 uppercase">
                          {workflow.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-5 px-6 text-slate-400 max-w-sm leading-relaxed text-xs">
                    {workflow.description}
                  </td>

                  {/* Nodes Count */}
                  <td className="py-5 px-6 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-black text-[#FF2538] border border-[#252528]">
                      {workflow.nodes?.length || 3} Nodes
                    </span>
                  </td>

                  {/* Updated At */}
                  <td className="py-5 px-6 font-mono text-[11px] text-slate-400">
                    {workflow.updatedAt || '2026-07-24'}
                  </td>

                  {/* Actions */}
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2.5 relative">
                      
                      {/* Open Full-Screen Canvas Workspace */}
                      <button
                        onClick={() => openCanvasWithFlow(workflow.id)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#101014] hover:bg-slate-800 text-slate-200 hover:text-white transition-colors border border-[#252528] font-bold"
                      >
                        <Eye className="w-4 h-4 text-[#FF2538]" />
                        <span>Launch Canvas</span>
                      </button>

                      {/* Duplicate to Tenant Dropdown Trigger */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === workflow.id ? null : workflow.id)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 transition-all border border-emerald-500/40 active:scale-95"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Deploy Blueprint</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdownId === workflow.id ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdownId === workflow.id && (
                          <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-3 py-2 border-b border-slate-800 text-left">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Active Tenant Target</span>
                            </div>
                            <div className="py-1 max-h-48 overflow-y-auto space-y-1">
                              {tenants.map((tenant) => (
                                <button
                                  key={tenant.id}
                                  onClick={() => handleDuplicateClick(workflow.id, tenant.id)}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-transparent flex items-center justify-between text-xs text-slate-200 transition-colors group/t"
                                >
                                  <div className="flex items-center space-x-2 truncate">
                                    <Building2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                    <span className="truncate font-medium group-hover/t:text-emerald-300">{tenant.name}</span>
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-500">{tenant.subdomain}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0b0b0d] border border-[#252528] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#252528] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF2538]" />
                <span>Create New Master Flow</span>
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
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-[#FF2538] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Workflow Category</label>
                <select
                  value={newFlowCategory}
                  onChange={(e) => setNewFlowCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-[#FF2538] focus:outline-none"
                >
                  <option value="Quote Request">Quote Request / Webhook Lead</option>
                  <option value="Missed Call">Missed Call Text-Back</option>
                  <option value="Booked Appointment">Booked Appointment & Reminders</option>
                  <option value="Post-Job Review">Post-Service Review & Retention</option>
                </select>
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
                  className="px-5 py-2.5 rounded-xl bg-[#FF2538] text-white font-bold hover:bg-[#e01c2e] shadow-lg shadow-[#FF2538]/20"
                >
                  Create & Open Canvas Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
