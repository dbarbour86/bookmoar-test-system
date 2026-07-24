import React, { useState } from 'react';
import { Layers, Copy, ChevronDown, Check, Sparkles, Eye, Plus, Building2, Workflow } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

export function MasterTemplateTable() {
  const masterTemplates = useWorkflowStore((state) => state.masterTemplates);
  const tenants = useWorkflowStore((state) => state.tenants);
  const loadTemplateToCanvas = useWorkflowStore((state) => state.loadTemplateToCanvas);
  const duplicateTemplateToTenant = useWorkflowStore((state) => state.duplicateTemplateToTenant);
  const saveCurrentAsMasterTemplate = useWorkflowStore((state) => state.saveCurrentAsMasterTemplate);

  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [selectedTenantMap, setSelectedTenantMap] = useState({});

  const handleDuplicateClick = (templateId, tenantId) => {
    duplicateTemplateToTenant(templateId, tenantId);
    setActiveDropdownId(null);
    setSelectedTenantMap({ ...selectedTenantMap, [templateId]: tenantId });
  };

  const handleSaveModalSubmit = (e) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    saveCurrentAsMasterTemplate(newTemplateName, newTemplateDesc);
    setNewTemplateName('');
    setNewTemplateDesc('');
    setShowNewModal(false);
  };

  return (
    <div className="bg-[#0b101d] border-t border-slate-800 p-5 z-20">
      {/* Table Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400">
            <Layers className="w-4 h-4" />
            <span className="uppercase tracking-wider">Master Flow Blueprints</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5">Master Template Repository & Tenant Instantiation</h3>
          <p className="text-xs text-slate-400">
            Select a saved layout block below to edit or deploy directly into an active tenant's Redis engine sequence.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Save Canvas as Master Template</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Template Name</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-center">Nodes Count</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4 text-right">Actions & Tenant Deployment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {masterTemplates.map((template) => (
              <tr key={template.id} className="hover:bg-slate-800/40 transition-colors group">
                {/* Name */}
                <td className="py-3.5 px-4 font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Workflow className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{template.name}</span>
                  </div>
                </td>

                {/* Description */}
                <td className="py-3.5 px-4 text-slate-400 max-w-md truncate">
                  {template.description}
                </td>

                {/* Nodes Count */}
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {template.nodesCount || template.nodes?.length || 0} Nodes
                  </span>
                </td>

                {/* Updated At */}
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                  {template.updatedAt}
                </td>

                {/* Action Controls */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2 relative">
                    {/* Load to Canvas */}
                    <button
                      onClick={() => loadTemplateToCanvas(template)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700/60"
                      title="Load into active canvas"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Load to Canvas</span>
                    </button>

                    {/* Duplicate to Tenant Dropdown Trigger */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdownId(activeDropdownId === template.id ? null : template.id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20 transition-all border border-emerald-500/40 active:scale-95"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate to Tenant</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${activeDropdownId === template.id ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdownId === template.id && (
                        <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-2 border-b border-slate-800 text-left">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Active Tenant Target</span>
                          </div>
                          <div className="py-1 max-h-48 overflow-y-auto space-y-1">
                            {tenants.map((tenant) => (
                              <button
                                key={tenant.id}
                                onClick={() => handleDuplicateClick(template.id, tenant.id)}
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

      {/* Modal: Save Canvas as Master Template */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span>Save Canvas as Master Blueprint</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blueprint Title</label>
                <input
                  type="text"
                  required
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g. 5-Day Nurture Sequence for HVAC Leads"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  placeholder="Describe the trigger event, delays, and communication steps..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none resize-none"
                />
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
                  Save Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
