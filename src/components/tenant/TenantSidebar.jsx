import React, { useState } from 'react';
import { Users, MessageSquare, Building2, ChevronUp, Shield, Sparkles, Phone, CheckCircle2, ChevronRight, MessageCircle, Calendar, ToggleLeft, Home } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';

export function TenantSidebar({ currentRoute, onNavigateRoute }) {
  const activeView = useTenantStore((state) => state.activeView);
  const setActiveView = useTenantStore((state) => state.setActiveView);
  const tenants = useTenantStore((state) => state.tenants);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const setActiveTenantId = useTenantStore((state) => state.setActiveTenantId);
  const toggleTenantChatWidget = useTenantStore((state) => state.toggleTenantChatWidget);
  const contacts = useTenantStore((state) => state.contacts);
  const messages = useTenantStore((state) => state.messages);

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];
  
  // Leads count (status: 'lead' or 'follow_up_sent')
  const leadsCount = contacts.filter((c) => c.tenant_id === activeTenantId && (c.status === 'lead' || c.status === 'follow_up_sent')).length;
  
  // Bookings count (status: 'booked' or 'completed')
  const bookingsCount = contacts.filter((c) => c.tenant_id === activeTenantId && (c.status === 'booked' || c.status === 'completed')).length;

  const totalMessagesCount = messages.filter((m) => m.tenant_id === activeTenantId).length;
  const isWidgetOn = activeTenant.chatWidgetEnabled !== false;

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#090d16] flex flex-col h-full z-20 select-none flex-shrink-0">
      {/* Client Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF2538] to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-[#FF2538]/20">
            {activeTenant.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{activeTenant.name}</h2>
            <div className="flex items-center space-x-1 font-mono text-[10px] text-[#FF2538]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="truncate">{activeTenant.subdomain}.service.app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Views */}
      <div className="p-3 space-y-1.5 flex-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Client Portal Navigation
        </div>

        {/* View A: Dashboard Home (Overview) */}
        <button
          onClick={() => setActiveView('overview')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'overview'
              ? 'bg-[#FF2538]/10 text-red-300 border border-[#FF2538]/20 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Home className={`w-4 h-4 ${activeView === 'overview' ? 'text-[#FF2538]' : 'text-slate-400'}`} />
            <span>Dashboard Home</span>
          </div>
        </button>

        {/* View B: Leads Pipeline */}
        <button
          onClick={() => setActiveView('leads')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'leads'
              ? 'bg-[#FF2538]/10 text-red-300 border border-[#FF2538]/20 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Users className={`w-4 h-4 ${activeView === 'leads' ? 'text-[#FF2538]' : 'text-slate-400'}`} />
            <span>Leads Pipeline</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FF2538]/15 text-[#FF2538] font-bold border border-[#FF2538]/25">
            {leadsCount}
          </span>
        </button>

        {/* View C: Bookings & Calendar */}
        <button
          onClick={() => setActiveView('bookings')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'bookings'
              ? 'bg-[#FF2538]/10 text-red-300 border border-[#FF2538]/20 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Calendar className={`w-4 h-4 ${activeView === 'bookings' ? 'text-[#FF2538]' : 'text-slate-400'}`} />
            <span>Bookings & Calendar</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 font-bold border border-slate-700">
            {bookingsCount}
          </span>
        </button>

        {/* View D: Two-Way SMS Inbox */}
        <button
          onClick={() => setActiveView('inbox')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'inbox'
              ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-500/5'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className={`w-4 h-4 ${activeView === 'inbox' ? 'text-indigo-400' : 'text-slate-400'}`} />
            <span>Two-Way SMS Inbox</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
            {totalMessagesCount}
          </span>
        </button>

        {/* Chat Widget ON / OFF Toggle Controls */}
        <div className="pt-3 border-t border-slate-800/60 mt-3">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Client Site Integration
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-cyan-400" /> Chat Widget
              </span>
              <button
                onClick={() => toggleTenantChatWidget(activeTenant.id, !isWidgetOn)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isWidgetOn
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                <span>{isWidgetOn ? 'ENABLED [ON]' : 'DISABLED [OFF]'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isWidgetOn ? 'Widget is live on website corner.' : 'Widget is completely hidden.'}
            </p>
          </div>
        </div>

      </div>

      {/* Multi-Tenant Context Switcher */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-2">
        <button
          onClick={() => onNavigateRoute && onNavigateRoute('admin')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors border border-slate-800/60"
        >
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium">Switch to /admin Canvas</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowTenantDropdown(!showTenantDropdown)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
          >
            <div className="flex items-center space-x-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate text-[11px] font-medium">{activeTenant.name}</span>
            </div>
            <ChevronUp className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showTenantDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showTenantDropdown && (
            <div className="absolute left-0 bottom-full mb-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1 space-y-1">
              <div className="px-2.5 py-1.5 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Multi-Tenant Isolation Context
              </div>
              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTenantId(t.id);
                    setShowTenantDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition-colors ${
                    t.id === activeTenantId
                      ? 'bg-cyan-500/10 text-cyan-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  {t.id === activeTenantId && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 ml-1 flex-shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
