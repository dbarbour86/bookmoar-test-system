import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant
} from '@xyflow/react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { TriggerNode } from './nodes/TriggerNode';
import { DelayNode } from './nodes/DelayNode';
import { CommunicationNode } from './nodes/CommunicationNode';
import { SentimentSplitNode } from './nodes/SentimentSplitNode';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { CheckCircle2, ShieldCheck, ArrowLeft, Layers, Calendar } from 'lucide-react';

const nodeTypes = {
  trigger: TriggerNode,
  delay: DelayNode,
  communication: CommunicationNode,
  sentiment_split: SentimentSplitNode
};

function FlowCanvasInner() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);
  const onNodesChange = useWorkflowStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowStore((state) => state.onConnect);
  const addNode = useWorkflowStore((state) => state.addNode);
  const setSelectedNodeId = useWorkflowStore((state) => state.setSelectedNodeId);
  const activeNotification = useWorkflowStore((state) => state.activeNotification);
  const clearNotification = useWorkflowStore((state) => state.clearNotification);
  const setAdminSubView = useWorkflowStore((state) => state.setAdminSubView);
  const workflows = useWorkflowStore((state) => state.workflows);
  const activeFlowId = useWorkflowStore((state) => state.activeFlowId);

  const activeFlow = workflows.find((w) => w.id === activeFlowId) || workflows[0];

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  return (
    <div className="relative flex-1 h-full w-full bg-[#070709] flex overflow-hidden" ref={reactFlowWrapper}>
      
      {/* Canvas Area */}
      <div className="relative flex-1 h-full w-full">
        
        {/* Top Floating Header Bar */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-3 bg-[#0B0B0D]/90 border border-[#252528] backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-2xl">
          <button
            onClick={() => setAdminSubView('dashboard')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors border border-slate-800"
            title="Return to Master Blueprints Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FF2538]" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-slate-800"></div>

          <div>
            <span className="text-[9px] uppercase font-bold text-[#FF2538] font-mono tracking-wider">Canvas Workspace</span>
            <h3 className="text-xs font-bold text-white">{activeFlow?.name}</h3>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {activeNotification && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-slate-900 to-slate-950 border border-[#FF2538]/40 text-red-300 px-5 py-3 rounded-2xl shadow-2xl shadow-[#FF2538]/20 backdrop-blur-xl text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{activeNotification}</span>
              <button onClick={clearNotification} className="ml-3 text-slate-400 hover:text-white font-bold">✕</button>
            </div>
          </div>
        )}

        {/* React Flow Core Engine */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          defaultEdgeOptions={{
            animated: true,
            style: { strokeWidth: 2.5, stroke: '#FF2538' }
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={32}
            size={1.5}
            color="#334155"
          />

          <Controls
            position="bottom-left"
            showInteractive={false}
            className="!bg-slate-900/60 !backdrop-blur-xl !border !border-slate-800/80 !rounded-2xl !p-1 !shadow-2xl"
          />

          <MiniMap
            nodeColor={(n) => {
              if (n.type === 'trigger') return '#06b6d4';
              if (n.type === 'delay') return '#f59e0b';
              if (n.type === 'communication') return '#6366f1';
              if (n.type === 'sentiment_split') return '#FF2538';
              return '#64748b';
            }}
            maskColor="rgba(7, 7, 9, 0.85)"
            className="!bg-slate-900/90 !border !border-slate-800 !rounded-xl overflow-hidden shadow-2xl"
            position="bottom-right"
          />
        </ReactFlow>
      </div>

      {/* Slide-out Properties Inspector Panel */}
      <NodePropertiesPanel />
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
