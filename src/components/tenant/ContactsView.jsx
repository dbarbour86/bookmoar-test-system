import React from 'react';
import { LayoutGrid, Calendar as CalendarIcon, List } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';
import { MetricsOverviewBanner } from './MetricsOverviewBanner';
import { KanbanPipelineView } from './KanbanPipelineView';
import { CalendarScheduleView } from './CalendarScheduleView';

export function ContactsView() {
  const activeView = useTenantStore((state) => state.activeView);
  const pipelineDisplayMode = useTenantStore((state) => state.pipelineDisplayMode);
  const setPipelineDisplayMode = useTenantStore((state) => state.setPipelineDisplayMode);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070b14]">
      
      {/* 1. Top Metrics Overview & Upcoming Agenda Feed Banner */}
      <MetricsOverviewBanner />

      {/* 2. Interactive View Switcher Bar */}
      <div className="bg-[#090d16] border-b border-slate-800 px-6 py-2 flex items-center justify-between z-10 select-none flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            {activeView === 'leads' ? 'Prospect Leads Tracking' : 'Operational Scheduling & Calendar'}
          </span>
        </div>

        {/* Dynamic switcher options based on whether we are in Leads or Bookings */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setPipelineDisplayMode('kanban')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              pipelineDisplayMode === 'kanban'
                ? 'bg-[#FF2538]/20 text-red-300 border border-[#FF2538]/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Pipeline Board</span>
          </button>

          {activeView === 'bookings' && (
            <button
              onClick={() => setPipelineDisplayMode('calendar')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                pipelineDisplayMode === 'calendar'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar Schedule</span>
            </button>
          )}

          <button
            onClick={() => setPipelineDisplayMode('list')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              pipelineDisplayMode === 'list'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Split List</span>
          </button>
        </div>
      </div>

      {/* 3. Render Active View */}
      <div className="flex-1 overflow-hidden flex">
        {activeView === 'bookings' && pipelineDisplayMode === 'calendar' ? (
          <CalendarScheduleView />
        ) : (
          <KanbanPipelineView />
        )}
      </div>
    </div>
  );
}
