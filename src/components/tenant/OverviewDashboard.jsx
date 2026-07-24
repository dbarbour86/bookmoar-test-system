import React, { useState } from 'react';
import { ClipboardList, Calendar as CalendarIcon, Users, DollarSign, CheckCircle2, Clock, MapPin, Phone, Mail, ArrowRight, Star, AlertCircle, MessageSquare, TrendingUp, ChevronLeft, ChevronRight, X, Zap } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';

export function OverviewDashboard() {
  const contacts = useTenantStore((state) => state.contacts);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const tenants = useTenantStore((state) => state.tenants);
  const setSelectedContactId = useTenantStore((state) => state.setSelectedContactId);
  const setSelectedThreadContactId = useTenantStore((state) => state.setSelectedThreadContactId);
  const setActiveView = useTenantStore((state) => state.setActiveView);
  const addBookingToContact = useTenantStore((state) => state.addBookingToContact);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];
  const tenantContacts = contacts.filter((c) => c.tenant_id === activeTenantId);

  // Calendar states
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); // July 2026 default
  const [selectedBookingEvent, setSelectedBookingEvent] = useState(null);

  // Click-to-book states
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [selectedContactIdForBooking, setSelectedContactIdForBooking] = useState('');
  const [bookingServiceType, setBookingServiceType] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingPrice, setBookingPrice] = useState('350');

  // Extract all bookings for current tenant
  const allBookings = tenantContacts.flatMap((c) =>
    (c.bookings || []).map((b) => ({ ...b, contact: c }))
  );

  // Stats summaries
  const pendingQuotes = tenantContacts.filter((c) => c.status === 'lead').length;
  const upcomingJobsCount = allBookings.filter((b) => b.status === 'scheduled' || b.status === 'confirmed').length;
  const totalRevenue = tenantContacts.reduce((sum, c) => sum + (c.price || 0), 0);

  // Calendar calculations
  const daysInMonth = 31;
  const startDayOffset = 3; // Wednesday start for July 2026
  const monthYearHeader = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getBookingsForDay = (dayNum) => {
    return allBookings.filter((b) => {
      const bDate = new Date(b.appointment_date);
      return bDate.getDate() === dayNum && bDate.getMonth() === currentMonth.getMonth();
    });
  };

  // Open booking drawer for clicked date
  const handleDateClick = (dayNum) => {
    // Format date string (YYYY-MM-DD)
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const day = String(dayNum).padStart(2, '0');
    const dateStr = `2026-${month}-${day}`;
    
    setBookingDate(dateStr);
    setSelectedBookingEvent(null); // Close inspect drawer if open
    
    // Default to first contact if available
    if (tenantContacts.length > 0 && !selectedContactIdForBooking) {
      setSelectedContactIdForBooking(tenantContacts[0].id);
    }
    
    setBookingFormOpen(true);
  };

  // Handle Form Submission
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedContactIdForBooking || !bookingDate || !bookingServiceType) return;

    const bookingId = `b-${Date.now().toString().slice(-4)}`;
    
    // Parse time to standard timestamp
    const appointmentDateStr = `${bookingDate}T${bookingTime === '10:00 AM' ? '10:00:00' : '14:30:00'}Z`;

    const bookingData = {
      id: bookingId,
      service_type: bookingServiceType,
      appointment_date: appointmentDateStr,
      price: parseFloat(bookingPrice) || 350.00,
      status: 'scheduled'
    };

    addBookingToContact(selectedContactIdForBooking, bookingData);

    // Reset Form & Close
    setBookingFormOpen(false);
    setBookingServiceType('');
    setBookingPrice('350');
  };

  // To-Do list state with action configurations
  const [todoItems, setTodoItems] = useState([
    {
      id: 1,
      text: 'Review new lead request from Marcus Vance (Main Line Inspection)',
      completed: false,
      priority: 'high',
      actionLabel: 'Review Lead',
      action: () => {
        setSelectedContactId('c-101');
        setActiveView('leads');
      }
    },
    {
      id: 2,
      text: 'Follow up with David Miller on sent quote estimate ($920.00)',
      completed: false,
      priority: 'medium',
      actionLabel: 'Text Follow Up',
      action: () => {
        setSelectedThreadContactId('c-103');
        setActiveView('inbox');
      }
    },
    {
      id: 3,
      text: 'Confirm schedule time slot for Sarah Jenkins (Water Heater Install)',
      completed: true,
      priority: 'high',
      actionLabel: 'View Schedule',
      action: () => {
        setSelectedContactId('c-102');
        setActiveView('bookings');
      }
    },
    {
      id: 4,
      text: 'Verify 24h reminder SMS dispatched for Elena Rostova',
      completed: false,
      priority: 'low',
      actionLabel: 'SMS Queue Status',
      action: () => {
        setSelectedContactId('c-104');
        setActiveView('bookings');
        const elenaBooking = allBookings.find(b => b.contact.id === 'c-104');
        if (elenaBooking) setSelectedBookingEvent(elenaBooking);
      }
    }
  ]);

  const toggleTodoItem = (id) => {
    setTodoItems(todoItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  return (
    <div className="flex-1 flex bg-[#070709] overflow-hidden relative font-sans text-slate-100 select-none animate-fade-in">
      
      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
        
        {/* Title & Live Status */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Dashboard</p>
            <h1 className="font-display text-lg font-black text-white tracking-wide uppercase">
              BOOK MOAR ENGINE
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2538] animate-ping"></span>
            <span className="text-[10px] font-bold text-[#FF2538] uppercase tracking-wider">LIVE</span>
          </div>
        </div>

        {/* 3 Minimalist Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stats Card 1 */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Quotes</span>
              <div className="text-2xl font-extrabold text-white mt-1 font-mono">{pendingQuotes}</div>
              <p className="text-[10px] text-[#FF2538] mt-0.5">Awaiting follow-up</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Stats Card 2 */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming Jobs</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{upcomingJobsCount}</div>
              <p className="text-[10px] text-emerald-400 mt-0.5">Confirmed bookings</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
          </div>

          {/* Stats Card 3 */}
          <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming Pipeline Revenue</span>
              <div className="text-2xl font-extrabold text-[#FF2538] mt-1 font-mono">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Registered deal value sum</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 animate-pulse">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Embedded centerpiece Monthly Calendar Grid */}
        <div className="bg-[#090d16] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 rounded-xl">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">{monthYearHeader} Schedule</h2>
                <p className="text-[10px] text-slate-400">Click any date cell to schedule a new customer booking</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentMonth(new Date(2026, 5, 1))}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-200 px-3 py-1 bg-slate-950 rounded-xl border border-slate-800">
                {monthYearHeader}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(2026, 7, 1))}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar 7-Day Labels */}
          <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2.5">
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`offset-${i}`} className="min-h-[80px] rounded-xl border border-transparent opacity-25"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayBookings = getBookingsForDay(dayNum);
              const isToday = dayNum === 19;

              return (
                <div
                  key={dayNum}
                  onClick={() => handleDateClick(dayNum)}
                  className={`min-h-[85px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    isToday
                      ? 'border-[#FF2538] bg-[#FF2538]/5 ring-1 ring-[#FF2538]/20 shadow-md'
                      : 'border-slate-800 bg-[#101014]/40 hover:border-slate-700'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-[#FF2538]' : 'text-slate-400'}`}>
                    {dayNum}
                  </span>

                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[50px]">
                    {dayBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBookingEvent(b);
                        }}
                        className="p-1 rounded bg-[#FF2538]/10 border border-[#FF2538]/20 text-[#FF2538] text-[9px] font-bold hover:bg-[#FF2538]/20 cursor-pointer transition-all truncate"
                      >
                        {b.contact.first_name} - ${b.price.toFixed(0)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Supporting Row: Checklist (Left) vs Activity Feed (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: To-Do Checklist with Clickable Jump Actions */}
          <div className="lg:col-span-7 bg-[#090d16] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <ClipboardList className="w-4 h-4 text-[#FF2538]" />
                <span className="uppercase tracking-wider">Action Items & To-Do List</span>
              </div>
              <span className="text-[10px] font-mono text-[#FF2538] font-bold bg-[#FF2538]/10 px-2 py-0.5 rounded border border-[#FF2538]/20">
                {todoItems.filter(t => !t.completed).length} Awaiting
              </span>
            </div>

            <div className="space-y-2.5">
              {todoItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    item.completed
                      ? 'bg-slate-950/20 border-slate-900 opacity-50'
                      : 'bg-[#101014] border-white/5 hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => toggleTodoItem(item.id)}
                    className="flex items-start space-x-3 pr-2 flex-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}} 
                      className="mt-1 w-4 h-4 rounded bg-slate-950 border-slate-800 text-[#FF2538] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className={`text-xs text-slate-200 leading-normal font-semibold ${
                      item.completed ? 'line-through text-slate-500' : ''
                    }`}>
                      {item.text}
                    </span>
                  </div>

                  {/* Required Action Link Button */}
                  {!item.completed && item.action && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        item.action();
                      }}
                      className="ml-3 inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FF2538]/10 hover:bg-[#FF2538]/20 text-[#FF2538] font-bold border border-[#FF2538]/20 transition-all text-[9px] uppercase tracking-wide active:scale-95 flex-shrink-0"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Engine Activity Feed */}
          <div className="lg:col-span-5 bg-[#090d16] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Clock className="w-4 h-4 text-[#FF2538]" />
                <span className="uppercase tracking-wider">Engine Activity Feed</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Auto text-back active
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Card 1: New Booking */}
              <div className="bg-[#070709] border border-[#FF2538]/20 rounded-2xl p-4 flex items-start gap-3.5 transition-all duration-200 hover:border-[#FF2538]/40 shadow-xl">
                <div className="w-9 h-9 rounded-xl bg-[#FF2538]/10 border border-[#FF2538]/30 flex items-center justify-center text-[#FF2538] shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-[#FF2538] font-black uppercase tracking-wider">New Booking</p>
                    <span className="text-[9px] text-slate-500">Just now</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate mt-1">Detailing Package - $350</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">John D. • Ford F-150</p>
                </div>
              </div>

              {/* Card 2: 5 Star Google Review */}
              <div className="bg-[#070709] border border-white/5 rounded-2xl p-4 flex items-start gap-3.5 transition-all duration-200 hover:border-[#FF2538]/30 shadow-xl">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0 mt-0.5">
                  <Star className="w-5 h-5 fill-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-wider">5★ Google Review</p>
                    <span className="text-[9px] text-slate-500">3m ago</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate mt-1">"Best service in Charlotte!"</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">Marcus R. • Landscaping</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Side Drawer Create Appointment Booking Form */}
      {bookingFormOpen && (
        <div className="w-96 bg-[#090d16] border-l border-slate-800 h-full flex flex-col z-35 shadow-2xl animate-in slide-in-from-right duration-200 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FF2538]">
              <CalendarIcon className="w-4 h-4" />
              <span>Schedule New Appointment</span>
            </div>
            <button
              onClick={() => setBookingFormOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
            {/* Prefilled Date square */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Selected Date</label>
              <div className="p-3 bg-slate-900 border border-[#252528] rounded-xl text-white font-mono font-bold">
                {new Date(bookingDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Select Customer Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Select Customer / Prospect</label>
              <select
                value={selectedContactIdForBooking}
                onChange={(e) => setSelectedContactIdForBooking(e.target.value)}
                className="w-full bg-slate-900 border border-[#252528] text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF2538]"
              >
                {tenantContacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Service Type / Job Description</label>
              <input
                type="text"
                required
                value={bookingServiceType}
                onChange={(e) => setBookingServiceType(e.target.value)}
                placeholder="e.g. Tankless Water Heater Install"
                className="w-full bg-slate-900 border border-[#252528] text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF2538]"
              />
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Select Preferred Time Slot</label>
              <select
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full bg-slate-900 border border-[#252528] text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#FF2538]"
              >
                <option value="10:00 AM">10:00 AM - Morning Slot</option>
                <option value="02:30 PM">02:30 PM - Afternoon Slot</option>
              </select>
            </div>

            {/* Price Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Estimated Deal Value ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  required
                  value={bookingPrice}
                  onChange={(e) => setBookingPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-[#252528] text-white rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:border-[#FF2538] font-mono"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#FF2538] hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-[#FF2538]/10"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      )}

      {/* Side Drawer Inspector Modal */}
      {selectedBookingEvent && (
        <div className="w-96 bg-[#090d16] border-l border-slate-800 h-full flex flex-col z-35 shadow-2xl animate-in slide-in-from-right duration-200 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#FF2538]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmed Booking Event</span>
            </div>
            <button
              onClick={() => setSelectedBookingEvent(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Client Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 flex items-center justify-center font-extrabold text-sm">
                {selectedBookingEvent.contact.first_name.charAt(0)}{selectedBookingEvent.contact.last_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedBookingEvent.contact.first_name} {selectedBookingEvent.contact.last_name}</h4>
                <p className="text-[11px] text-cyan-400 font-mono">{selectedBookingEvent.contact.phone}</p>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-800/80 pt-2 text-[11px]">
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

          {/* Appointment Specs */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
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
              <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-2">
                <span>Registered Deal Price:</span>
                <span className="text-[#FF2538] font-extrabold text-sm">
                  ${selectedBookingEvent.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Redis Reminder Queue */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-500 animate-pulse" /> Automated Reminder Queue Status
            </h4>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-[10px] text-slate-300">
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
