import React from 'react';
import { AdminHeader } from '../components/AdminHeader';
import { MasterTemplateDashboard } from '../components/MasterTemplateDashboard';
import { Sidebar } from '../components/Sidebar';
import { FlowCanvas } from '../components/FlowCanvas';
import { useWorkflowStore } from '../store/useWorkflowStore';

export function AdminWorkflows() {
  const adminSubView = useWorkflowStore((state) => state.adminSubView);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Top Admin Header */}
      <AdminHeader />

      {/* View A (Default Overview Dashboard) vs View B (Dedicated 100% Canvas Workspace) */}
      {adminSubView === 'dashboard' ? (
        <MasterTemplateDashboard />
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Node Palette Sidebar */}
          <Sidebar />

          {/* Dedicated Full-Screen Canvas Workspace & Property Inspector */}
          <FlowCanvas />
        </div>
      )}
    </div>
  );
}
