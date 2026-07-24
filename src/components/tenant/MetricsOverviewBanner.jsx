import React from 'react';
import { Calendar, DollarSign, Clock, Users, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';

export function MetricsOverviewBanner() {
  const contacts = useTenantStore((state) => state.contacts);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const setSelectedContactId = useTenantStore((state) => state.setSelectedContactId);
  const setActiveView = useTenantStore((state) => state.setActiveView);

  const tenantContacts = contacts.filter((c) => c.tenant_id === activeTenantId);

  // 1. Pending Quote Requests Count
  const pendingQuoteCount = tenantContacts.filter((c) => c.status === 'lead').length;

  // 2. All Bookings across contacts
  const allBookings = tenantContacts.flatMap((c) =>
    (c.bookings || []).map((b) => ({ ...b, contact: c }))
  );

  // 3. Upcoming Revenue (Sum of deal values for booked/scheduled)
  const totalUpcomingRevenue = tenantContacts.reduce((sum, c) => {
    if (c.status === 'booked' || c.status === 'completed' || (c.bookings && c.bookings.length > 0)) {
      return sum + (c.price || 0);
    }
    return sum;
  }, 0);

  // 4. Chronological Agenda Feed (Next 5 upcoming bookings)
  const sortedUpcomingBookings = allBookings
    .filter((b) => b.status === 'scheduled' || b.status === 'confirmed')
    .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
    .slice(0, 5);

  return (
    <div className="bg-[#0b0b0d] border-b border-[#252528] p-5 space-y-5 select-none font-sans flex-shrink-0">
      
      {/* 3 Minimalist Metric Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Pending Quote Requests */}
        <div className="p-4 rounded-2xl bg-[#101014] border border-[#252528] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Quote Requests</span>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">{pendingQuoteCount}</div>
            <p className="text-[9px] text-[#FF2538] mt-0.5">Awaiting follow-up</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Upcoming Jobs */}
        <div className="p-4 rounded-2xl bg-[#101014] border border-[#252528] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming Jobs (7 Days)</span>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">{allBookings.length}</div>
            <p className="text-[9px] text-[#FF2538] mt-0.5">Confirmed appointments</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Upcoming Revenue */}
        <div className="p-4 rounded-2xl bg-[#101014] border border-[#252528] flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming Pipeline Revenue</span>
            <div className="text-2xl font-extrabold text-[#FF2538] mt-1 font-mono">
              ${totalUpcomingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Registered deal value sum</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 animate-pulse">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Compact Chronological Agenda Feed */}
      <div className="bg-black/60 border border-[#252528] rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#252528] pb-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <Clock className="w-4 h-4 text-[#FF2538]" />
            <span className="uppercase tracking-wider">Upcoming Agenda Feed (Next Chronological Bookings)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Showing {sortedUpcomingBookings.length} Scheduled Events</span>
        </div>

        {sortedUpcomingBookings.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-1">No upcoming bookings scheduled for the next 7 days.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedUpcomingBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setSelectedContactId(b.contact.id);
                  setActiveView(b.contact.status === 'lead' || b.contact.status === 'follow_up_sent' ? 'leads' : 'bookings');
                }}
                className="p-3.5 rounded-xl bg-[#101014] border border-[#252528] hover:border-[#FF2538]/40 cursor-pointer transition-all flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 truncate pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white truncate">{b.contact.first_name} {b.contact.last_name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] font-mono bg-emerald-500/10 text-emerald-400 uppercase font-bold">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{b.service_type}</p>
                  <p className="text-[10px] text-[#FF2538] font-mono">
                    {new Date(b.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right flex-shrink-0 font-mono font-bold text-emerald-400">
                  ${b.price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
export default MetricsOverviewBanner;
