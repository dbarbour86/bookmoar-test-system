import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock, Trash2, Hourglass } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export function DelayNode({ id, data, selected }) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  return (
    <div className={`relative w-80 rounded-xl border bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200 ${
      selected ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-amber-500/20' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Input Flow Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Delay Step</span>
            <h4 className="text-sm font-bold text-slate-100">{data.label || 'Time Delay'}</h4>
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

      {/* Form Controls with .nodrag */}
      <div className="space-y-3 nodrag text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Duration</label>
            <input
              type="number"
              min="1"
              max="999"
              value={data.duration || 15}
              onChange={(e) => updateNodeData(id, { duration: parseInt(e.target.value, 10) || 1 })}
              className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Time Unit</label>
            <select
              value={data.unit || 'Minutes'}
              onChange={(e) => updateNodeData(id, { unit: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="Minutes">Minutes</option>
              <option value="Hours">Hours</option>
              <option value="Days">Days</option>
            </select>
          </div>
        </div>

        <div className="p-2 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-center text-[11px] text-slate-400">
          <Hourglass className="w-3.5 h-3.5 mr-2 text-amber-400 flex-shrink-0" />
          <span>Holds sequence for <strong className="text-amber-300">{data.duration || 15} {data.unit || 'Minutes'}</strong> before executing next node.</span>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Step Name</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => updateNodeData(id, { label: e.target.value })}
            placeholder="e.g. Pre-service Cooldown"
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Output Flow Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />
    </div>
  );
}
