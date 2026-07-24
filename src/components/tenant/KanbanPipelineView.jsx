import React, { useState } from 'react';
import { Layers, Search, Phone, Mail, MapPin, Calendar, DollarSign, Tag, CheckCircle2, Clock, Sparkles, UploadCloud, LayoutGrid, List, ArrowRight, User, Car, Wrench, ShieldAlert } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';
import { CSVImportModal } from './CSVImportModal';

const LEADS_COLUMNS = [
  { id: 'lead', title: 'New Quote Requests', color: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'follow_up_sent', title: 'Follow-up Sent', color: 'border-amber-500/40 bg-amber-500/5 text-amber-400', badge: 'bg-amber-500/20 text-amber-300' }
];

const BOOKINGS_COLUMNS = [
  { id: 'booked', title: 'Confirmed Bookings', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'completed', title: 'Completed Jobs', color: 'border-purple-500/40 bg-purple-500/5 text-purple-400', badge: 'bg-purple-500/20 text-purple-300' }
];

export function KanbanPipelineView() {
  const contacts = useTenantStore((state) => state.contacts);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const activeView = useTenantStore((state) => state.activeView);
  const moveContactStage = useTenantStore((state) => state.moveContactStage);
  const selectedContactId = useTenantStore((state) => state.selectedContactId);
  const setSelectedContactId = useTenantStore((state) => state.setSelectedContactId);
  const searchQuery = useTenantStore((state) => state.searchQuery);
  const setSearchQuery = useTenantStore((state) => state.setSearchQuery);

  const [draggedContactId, setDraggedContactId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [showCsvModal, setShowCsvModal] = useState(false);

  const tenantContacts = contacts.filter((c) => c.tenant_id === activeTenantId);

  const filteredContacts = tenantContacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return fullName.includes(q) || c.phone.includes(q) || (c.service_type || '').toLowerCase().includes(q);
  });

  // Segregate columns based on activeView ('leads' vs 'bookings')
  const kanbanColumns = activeView === 'leads' ? LEADS_COLUMNS : BOOKINGS_COLUMNS;

  // Helper to generate custom secondary intake snippets
  const getCustomIntakeSnippet = (contact) => {
    if (activeTenantId === 't-003') {
      return '2024 Tesla Model Y (Ceramic Detailing)';
    }
    if (activeTenantId === 't-002') {
      return '2021 Trane Heat Pump 3-Ton (R410A)';
    }
    return 'Residential Copper Pipe Main Line';
  };

  const onDragStart = (e, contactId) => {
    e.dataTransfer.setData('text/plain', contactId);
    setDraggedContactId(contactId);
  };

  const onDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumnId(columnId);
  };

  const onDragLeave = () => {
    setDragOverColumnId(null);
  };

  const onDrop = (e, targetColumnId) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('text/plain') || draggedContactId;
    if (contactId && targetColumnId) {
      moveContactStage(contactId, targetColumnId);
    }
    setDraggedContactId(null);
    setDragOverColumnId(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#070b14] font-sans">
      
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-slate-800 bg-[#090d16] flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#FF2538]">
            <LayoutGrid className="w-4 h-4" />
            <span>{activeView === 'leads' ? 'Dedicated Leads Pipeline' : 'Operational Jobs Pipeline'}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-xs text-slate-400 font-mono">
            {filteredContacts.filter(c => activeView === 'leads' ? (c.status === 'lead' || c.status === 'follow_up_sent') : (c.status === 'booked' || c.status === 'completed')).length} Active Records
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, phone, or service..."
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#FF2538]"
            />
          </div>

          {activeView === 'leads' && (
            <button
              onClick={() => setShowCsvModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition-all active:scale-95 flex-shrink-0"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Drag & Drop Board */}
      <div className="flex-1 overflow-x-auto p-5">
        <div className={`grid ${kanbanColumns.length === 2 ? 'grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-4'} gap-5 h-full`}>
          {kanbanColumns.map((col) => {
            const columnContacts = filteredContacts.filter((c) => {
              if (col.id === 'lead') return c.status === 'lead';
              return c.status === col.id;
            });

            const isOver = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => onDragOver(e, col.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, col.id)}
                className={`flex flex-col h-full rounded-2xl border bg-slate-900/40 p-4 transition-all ${
                  isOver ? 'border-[#FF2538] bg-[#FF2538]/5 ring-2 ring-[#FF2538]/10' : 'border-slate-800/80'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3 select-none">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${col.badge}`}>
                    {columnContacts.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {columnContacts.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-800/60 rounded-xl flex items-center justify-center text-slate-500 text-[11px]">
                      Drag contacts here
                    </div>
                  ) : (
                    columnContacts.map((contact) => {
                      const isSelected = selectedContactId === contact.id;
                      const customIntake = getCustomIntakeSnippet(contact);

                      return (
                        <div
                          key={contact.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, contact.id)}
                          onClick={() => setSelectedContactId(contact.id)}
                          className={`p-4 rounded-xl border bg-slate-900 shadow-xl cursor-grab active:cursor-grabbing transition-all hover:border-slate-700 hover:shadow-cyan-500/5 ${
                            isSelected
                              ? 'border-[#FF2538] ring-2 ring-[#FF2538]/20 shadow-[#FF2538]/10'
                              : 'border-slate-800'
                          }`}
                        >
                          {/* Card Top Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-xs font-bold text-white">
                                {contact.first_name} {contact.last_name}
                              </h4>
                              <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{contact.phone}</p>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                              {contact.source || 'web'}
                            </span>
                          </div>

                          {/* Service Type */}
                          <div className="text-[11px] text-slate-200 font-semibold my-1 line-clamp-1">
                            {contact.service_type || 'Standard Plumbing Service'}
                          </div>

                          {/* Custom Intake Secondary Snippet Overlay */}
                          <div className="my-2 p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center space-x-2 text-[10px] text-cyan-300 font-mono">
                            <Wrench className="w-3 h-3 text-[#FF2538] flex-shrink-0" />
                            <span className="truncate">{customIntake}</span>
                          </div>

                          {/* Price Tag & Deal Value */}
                          <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 mt-2">
                            <span className="text-[10px] text-slate-400 uppercase font-mono">Est. Deal Value</span>
                            <span className="text-xs font-mono font-extrabold text-emerald-400">
                              ${(contact.price || 350.00).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CSVImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
      />
    </div>
  );
}
