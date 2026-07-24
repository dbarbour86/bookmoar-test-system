import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Star, Trash2, ShieldAlert, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export function SentimentSplitNode({ id, data, selected }) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  return (
    <div className={`relative w-84 rounded-xl border bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200 ${
      selected ? 'border-[#FF2538] ring-2 ring-[#FF2538]/30 shadow-[#FF2538]/20' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Input Flow Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3.5 !h-3.5 !bg-[#FF2538] !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FF2538]">Logic Gate</span>
            <h4 className="text-sm font-bold text-slate-100">{data.label || 'Sentiment Split (1-5 Scale)'}</h4>
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
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Feedback Scale Parser</span>
            <span className="text-[10px] font-mono text-[#FF2538] font-bold">1 to 5 Stars</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Parses incoming text score from post-job customer feedback request.
          </p>
        </div>

        {/* Branch Conditions Summary */}
        <div className="space-y-1.5 font-mono text-[10px]">
          {/* True Branch */}
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold">
              <ThumbsUp className="w-3 h-3 text-emerald-400" /> True (Score 4 or 5):
            </span>
            <span className="truncate max-w-[130px]">Dispatch Google Review</span>
          </div>

          {/* False Branch */}
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-1 font-bold">
              <ThumbsDown className="w-3 h-3 text-amber-400" /> False (Score 1, 2, 3):
            </span>
            <span className="truncate max-w-[130px]">Private Alert & Suppress</span>
          </div>
        </div>
      </div>

      {/* True Output Flow Handle (Top Right) */}
      <div className="absolute -right-3 top-10 flex items-center gap-1">
        <span className="text-[9px] font-mono font-bold text-emerald-400">4-5 Stars</span>
        <Handle
          type="source"
          position={Position.Right}
          id="true_output"
          className="!w-3.5 !h-3.5 !bg-emerald-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
        />
      </div>

      {/* False Output Flow Handle (Bottom Right) */}
      <div className="absolute -right-3 bottom-8 flex items-center gap-1">
        <span className="text-[9px] font-mono font-bold text-amber-400">1-3 Stars</span>
        <Handle
          type="source"
          position={Position.Right}
          id="false_output"
          className="!w-3.5 !h-3.5 !bg-amber-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
        />
      </div>
    </div>
  );
}
