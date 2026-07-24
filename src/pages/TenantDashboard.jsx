import React from 'react';
import { TenantHeader } from '../components/tenant/TenantHeader';
import { TenantSidebar } from '../components/tenant/TenantSidebar';
import { OverviewDashboard } from '../components/tenant/OverviewDashboard';
import { ContactsView } from '../components/tenant/ContactsView';
import { SMSInboxView } from '../components/tenant/SMSInboxView';
import { useTenantStore } from '../store/useTenantStore';

export function TenantDashboard({ onNavigateRoute }) {
  const activeView = useTenantStore((state) => state.activeView);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Client Header Bar */}
      <TenantHeader onNavigateRoute={onNavigateRoute} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Vertical Navigation Sidebar */}
        <TenantSidebar currentRoute="app" onNavigateRoute={onNavigateRoute} />

        {/* View Switcher: Home Overview vs Leads/Bookings workspaces vs SMS Inbox */}
        {activeView === 'overview' ? (
          <OverviewDashboard />
        ) : activeView === 'leads' || activeView === 'bookings' ? (
          <ContactsView />
        ) : (
          <SMSInboxView />
        )}
      </div>
    </div>
  );
}

export default TenantDashboard;
