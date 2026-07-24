import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, Phone, Mail, MapPin, DollarSign, CheckCircle2, ShieldCheck, Zap, X } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';

export function CalendarScheduleView() {
  const contacts = useTenantStore((state) => state.contacts);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); // July 2026 default
  const [selectedBookingEvent, setSelectedBookingEvent] = useState(null);

  const tenantContacts = contacts.filter((c) => c.tenant_id === activeTenantId);

  // Extract all bookings for current tenant
  const allBookings = tenantContacts.flatMap((c) =>
    (c.bookings || []).map((b) => ({ ...b, contact: c }))
  );

  // Calendar Days calculation for July 2026 (31 days)
  const daysInMonth = 31;
  const startDayOffset = 3; // Wednesday start for July 2026

  const monthYearHeader = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map dates to bookings
  const getBookingsForDay = (dayNum) => {
    return allBookings.filter((b) => {
      const bDate = new Date(b.appointment_date);
      return bDate.getDate() === dayNum && bDate.getMonth() === currentMonth.getMonth();
    });
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#070709] font-sans relative">
      
      {/* Main Calendar View Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-6 space-y-4">
        
        {/* Calendar Header Navigation */}
        <div className="flex items-center justify-between bg-[#0b0b0d] border border-[#252528] p-4 rounded-2xl select-none">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 rounded-xl">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">{monthYearHeader}</h2>
              <p className="text-xs text-slate-400">Tenant Schedule & Automated Reminder Queue</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentMonth(new Date(2026, 5, 1))}
              className="p-2 rounded-xl bg-[#101014] hover:bg-slate-800 text-slate-300 border border-[#252528]"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-200 px-3 py-1 bg-black rounded-xl border border-[#252528]">
              {monthYearHeader}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(2026, 7, 1))}
              className="p-2 rounded-xl bg-[#101014] hover:bg-slate-800 text-slate-300 border border-[#252528]"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-Day Weekday Labels Header */}
        <div className="grid grid-cols-7 gap-3 text-center text-xs font-mono font-bold text-slate-400 uppercase tracking-wider select-none">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Monthly Date Grid */}
        <div className="flex-1 grid grid-cols-7 gap-3 overflow-y-auto">
          {/* Empty Offset Cells */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px] rounded-2xl border border-transparent bg-slate-950/20 opacity-30"></div>
          ))}

          {/* Date Squares */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayBookings = getBookingsForDay(dayNum);
            const isToday = dayNum === 19; // Current date in prompt (July 19, 2026)

            return (
              <div
                key={dayNum}
                className={`min-h-[100px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between select-none ${
                  isToday
                    ? 'border-[#FF2538] bg-[#FF2538]/5 ring-1 ring-[#FF2538]/20 shadow-lg shadow-[#FF2538]/10'
                    : 'border-[#252528] bg-[#101014]/40 hover:border-slate-700'
                }`}
              >
                {/* Date Number Badge */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-mono font-bold ${
                    isToday ? 'text-[#FF2538]' : 'text-slate-400'
                  }`}>
                    {dayNum}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-mono uppercase font-bold text-white bg-[#FF2538] px-1.5 rounded border border-[#FF2538]/20">
                      Today
                    </span>
                  )}
                </div>

                {/* Booking Ribbon Badges */}
                <div className="space-y-1 overflow-y-auto flex-1">
                  {dayBookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBookingEvent(b)}
                      className="p-1.5 rounded-lg bg-[#FF2538]/10 border border-[#FF2538]/20 text-red-300 hover:bg-[#FF2538]/25 cursor-pointer transition-all shadow-md group"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="truncate group-hover:text-white">{b.contact.first_name} {b.contact.last_name}</span>
                        <span className="font-mono text-[9px] text-[#FF2538] font-extrabold">${b.price.toFixed(0)}</span>
                      </div>
                      <p className="text-[9px] text-[#FF2538]/90 truncate font-mono mt-0.5">
                        {new Date(b.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Drawer Inspector Modal */}
      {selectedBookingEvent && (
        <div className="w-96 bg-[#0b0b0d] border-l border-[#252528] h-full flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200 p-6 space-y-5 select-none">
          
          <div className="flex items-center justify-between border-b border-[#252528] pb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FF2538]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmed Booking Event</span>
            </div>
            <button
              onClick={() => setSelectedBookingEvent(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Client Profile Card */}
          <div className="p-4 rounded-2xl bg-[#101014] border border-[#252528] space-y-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 flex items-center justify-center font-extrabold text-sm">
                {selectedBookingEvent.contact.first_name.charAt(0)}{selectedBookingEvent.contact.last_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedBookingEvent.contact.first_name} {selectedBookingEvent.contact.last_name}</h4>
                <p className="text-[11px] text-cyan-400 font-mono">{selectedBookingEvent.contact.phone}</p>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-[#252528]/80 pt-2 text-[11px]">
              <div className="flex items-center space-x-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono truncate">{selectedBookingEvent.contact.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedBookingEvent.contact.address}</span>
              </div>
            </div>
          </div>

          {/* Appointment Specs & Registered Deal Value */}
          <div className="p-4 rounded-2xl bg-[#101014] border border-[#252528] space-y-3 text-xs">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Service Appointment Details</h4>
            
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span>Service Type:</span>
                <span className="font-bold text-white font-sans">{selectedBookingEvent.service_type}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Scheduled Time:</span>
                <span className="text-cyan-400 font-bold">
                  {new Date(selectedBookingEvent.appointment_date).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300 border-t border-[#252528] pt-2">
                <span>Registered Deal Price:</span>
                <span className="text-[#FF2538] font-extrabold text-sm">
                  ${selectedBookingEvent.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Automated Text Queue Status Indicator */}
          <div className="p-4 rounded-2xl bg-black border border-[#252528] space-y-2 text-xs">
            <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-500" /> Automated Reminder Queue Status
            </h4>
            <div className="p-2.5 rounded-xl bg-[#101014] border border-[#252528] space-y-1 font-mono text-[10px] text-slate-300">
              <div className="flex items-center justify-between">
                <span>24h Pre-Service SMS:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> QUEUED
                </span>
              </div>
              <div className="text-slate-500">
                Scheduled dispatch via Twilio Redis Queue 24h before appointment.
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
export default CalendarScheduleView;
