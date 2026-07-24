import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Copy, Check, Trash2, Globe, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export function TriggerNode({ id, data, selected }) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const [copied, setCopied] = React.useState(false);

  const activeTriggers = Array.isArray(data.event_triggers)
    ? data.event_triggers
    : [data.eventFilter || 'form_submission'];

  const toggleTrigger = (triggerValue) => {
    let updated;
    if (activeTriggers.includes(triggerValue)) {
      updated = activeTriggers.filter((t) => t !== triggerValue);
      if (updated.length === 0) updated = ['form_submission'];
    } else {
      updated = [...activeTriggers, triggerValue];
    }
    updateNodeData(id, { event_triggers: updated, eventFilter: updated[0] });
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(`https://api.booking-system.com/api/v1/ingest/${data.tenantId || ':tenant_id'}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative w-84 rounded-xl border bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200 ${
      selected ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-cyan-500/20' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Trigger Node</span>
              <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 rounded">Multi-Criteria</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">{data.label || 'Webhook Ingestion'}</h4>
          </div>
        </div>
        <button
          onClick={() => deleteNode(id)}
          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
          title="Delete Node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Node Body Form Controls with .nodrag utility */}
      <div className="space-y-3 nodrag text-xs">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Route Endpoint</label>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-cyan-300">
            <Globe className="w-3.5 h-3.5 mr-1.5 text-cyan-500 flex-shrink-0" />
            <span className="truncate flex-1">/api/v1/ingest/:tenant_id</span>
            <button
              onClick={copyWebhook}
              className="ml-1 text-slate-400 hover:text-cyan-300 transition-colors p-1"
              title="Copy Full Endpoint"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Multi-Trigger Array Checklist */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Firing Criteria Array (Triggers if ANY match)
          </label>
          <div className="space-y-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
            {[
              { id: 'form_submission', label: 'Landing Page Form Inbound' },
              { id: 'manual_tag_added', label: 'Manual Admin Tag Added' },
              { id: 'appointment_created', label: 'New Booking Created' },
              { id: 'inbound_sms', label: 'Inbound SMS Keyword' }
            ].map((item) => {
              const isChecked = activeTriggers.includes(item.id);
              return (
                <label
                  key={item.id}
                  className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleTrigger(item.id)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className={isChecked ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                    {item.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Safeguard Indicators */}
        <div className="p-2 bg-slate-950/80 border border-slate-800/80 rounded-lg space-y-1 text-[10px] font-mono text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Inbound SMS Halt:
            </span>
            <span className="text-emerald-300 font-bold">ACTIVE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-amber-400">
              <RefreshCw className="w-3 h-3" /> Re-entry Control:
            </span>
            <span className="text-slate-300">{data.allow_reentry ? 'Allowed' : 'Blocked (Default)'}</span>
          </div>
        </div>
      </div>

      {/* Output Flow Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3.5 !h-3.5 !bg-cyan-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />
    </div>
  );
}
