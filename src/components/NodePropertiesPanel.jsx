import React from 'react';
import { Sliders, X, Trash2, Zap, Clock, MessageSquare, Variable, Globe, Send, ShieldCheck } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

export function NodePropertiesPanel() {
  const selectedNodeId = useWorkflowStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const nodes = useWorkflowStore((state) => state.nodes);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  if (!selectedNodeId) return null;

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const { data } = node;

  return (
    <div className="w-80 bg-[#090d16] border-l border-slate-800 flex flex-col h-full z-30 shadow-2xl animate-in slide-in-from-right duration-200 select-none">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400">
          <Sliders className="w-4 h-4" />
          <span className="uppercase tracking-wider">Node Property Inspector</span>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          title="Close Property Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel Body */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
        
        {/* Node Identifier Header Card */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Node Type: {node.type}</span>
            <span className="text-[10px] font-mono text-cyan-400">ID: {node.id}</span>
          </div>
          <h4 className="text-sm font-bold text-white">{data.label || 'Configured Node'}</h4>
        </div>

        {/* Dynamic Controls based on Node Type */}
        {node.type === 'trigger' && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Custom Trigger Label</label>
              <input
                type="text"
                value={data.label || ''}
                onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Webhook Target Route</label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-cyan-300">
                <Globe className="w-3.5 h-3.5 mr-2 text-cyan-400 flex-shrink-0" />
                <span className="truncate">/api/v1/ingest/:tenant_id</span>
              </div>
            </div>
          </div>
        )}

        {node.type === 'delay' && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Step Label</label>
              <input
                type="text"
                value={data.label || ''}
                onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Duration</label>
                <input
                  type="number"
                  min="1"
                  value={data.duration || 30}
                  onChange={(e) => updateNodeData(node.id, { duration: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Unit</label>
                <select
                  value={data.unit || 'Minutes'}
                  onChange={(e) => updateNodeData(node.id, { unit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Seconds">Seconds</option>
                  <option value="Minutes">Minutes</option>
                  <option value="Hours">Hours</option>
                  <option value="Days">Days</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {node.type === 'communication' && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Outbound Channel</label>
              <select
                value={data.channel || 'SMS'}
                onChange={(e) => updateNodeData(node.id, { channel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="SMS">Twilio SMS Outbound</option>
                <option value="Email">Resend Email Outbound</option>
              </select>
            </div>

            {data.channel === 'Email' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Subject Line</label>
                <input
                  type="text"
                  value={data.subject || ''}
                  onChange={(e) => updateNodeData(node.id, { subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold">Message Template Body</label>
                <span className="text-[10px] text-indigo-400 font-mono">Liquid Tags</span>
              </div>
              <textarea
                rows={5}
                value={data.templateBody || ''}
                onChange={(e) => updateNodeData(node.id, { templateBody: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 font-mono text-[11px] rounded-xl p-2.5 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

      </div>

      {/* Panel Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80">
        <button
          onClick={() => deleteNode(node.id)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete Node from Canvas</span>
        </button>
      </div>

    </div>
  );
}
