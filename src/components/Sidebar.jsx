import React from 'react';
import { Zap, Clock, MessageSquare, Plus, Info, ShieldAlert, Sparkles, Layers, GitBranch } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

export function Sidebar() {
  const addNode = useWorkflowStore((state) => state.addNode);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-80 border-r border-[#252528] bg-[#0B0B0D] flex flex-col h-full z-10 select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#252528] bg-[#101014]/60">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#FF2538] mb-1">
          <Layers className="w-4 h-4" />
          <span className="uppercase tracking-wider">Node Palette</span>
        </div>
        <h3 className="text-base font-bold text-white">Workflow Components</h3>
        <p className="text-xs text-slate-400 mt-1">
          Drag nodes into the canvas or click to construct tenant automation sequences.
        </p>
      </div>

      {/* Palette Items */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">

        {/* 1. Trigger Node Item */}
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'trigger')}
          className="group relative rounded-xl border border-cyan-500/30 bg-[#101014] p-3.5 cursor-grab active:cursor-grabbing hover:border-cyan-400 hover:bg-[#16161c] transition-all shadow-lg hover:shadow-cyan-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Trigger Node</h4>
                <p className="text-[11px] text-slate-400">Webhook Ingestion</p>
              </div>
            </div>
            <button
              onClick={() => addNode('trigger')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors border border-slate-800"
              title="Add to canvas"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Sentiment Split Node Item */}
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'sentiment_split')}
          className="group relative rounded-xl border border-[#FF2538]/30 bg-[#101014] p-3.5 cursor-grab active:cursor-grabbing hover:border-[#FF2538] hover:bg-[#16161c] transition-all shadow-lg hover:shadow-[#FF2538]/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 group-hover:scale-110 transition-transform">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">Sentiment Split</h4>
                <p className="text-[11px] text-slate-400">Review Gate (1-5 Stars)</p>
              </div>
            </div>
            <button
              onClick={() => addNode('sentiment_split')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-[#FF2538]/20 text-slate-300 hover:text-red-400 transition-colors border border-slate-800"
              title="Add to canvas"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed bg-[#050505] p-2 rounded-lg border border-[#252528] font-mono">
            Routes 4-5 star ratings to Google Review link; routes 1-3 stars to private alert flag.
          </p>
        </div>

        {/* 3. Delay Node Item */}
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'delay')}
          className="group relative rounded-xl border border-amber-500/30 bg-[#101014] p-3.5 cursor-grab active:cursor-grabbing hover:border-amber-400 hover:bg-[#16161c] transition-all shadow-lg hover:shadow-amber-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Delay Node</h4>
                <p className="text-[11px] text-slate-400">Time Interval Buffer</p>
              </div>
            </div>
            <button
              onClick={() => addNode('delay')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors border border-slate-800"
              title="Add to canvas"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Communication Node Item */}
        <div
          draggable
          onDragStart={(e) => onDragStart(e, 'communication')}
          className="group relative rounded-xl border border-indigo-500/30 bg-[#101014] p-3.5 cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:bg-[#16161c] transition-all shadow-lg hover:shadow-indigo-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">Communication</h4>
                <p className="text-[11px] text-slate-400">SMS / Email Dispatch</p>
              </div>
            </div>
            <button
              onClick={() => addNode('communication')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-300 transition-colors border border-slate-800"
              title="Add to canvas"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
