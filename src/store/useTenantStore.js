import { create } from 'zustand';

const MOCK_TENANTS = [
  { id: 't-001', name: 'Apex Plumbing Co.', subdomain: 'apex-plumbing', phone: '+1 (555) 019-2834', email: 'owner@apexplumbing.com', chatWidgetEnabled: true },
  { id: 't-002', name: 'Elite HVAC Solutions', subdomain: 'elite-hvac', phone: '+1 (555) 482-9102', email: 'service@elitehvac.com', chatWidgetEnabled: false },
  { id: 't-003', name: 'Sparkle Auto Detailing', subdomain: 'sparkle-auto', phone: '+1 (555) 739-1144', email: 'contact@sparkleauto.com', chatWidgetEnabled: true },
];

const MOCK_CONTACTS = [
  {
    id: 'c-101',
    tenant_id: 't-001',
    first_name: 'Marcus',
    last_name: 'Vance',
    phone: '+15552345678',
    email: 'marcus.vance@example.com',
    status: 'lead',
    service_type: 'Main Line Drain Inspection',
    price: 450.00,
    address: '742 Evergreen Terrace, Springfield',
    source: 'Website Quote Form',
    createdAt: '2026-07-18T14:30:00Z',
    notes: 'Requested urgent quote for main line drain cleaning.',
    bookings: []
  },
  {
    id: 'c-102',
    tenant_id: 't-001',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    phone: '+15558765432',
    email: 'sarah.j@example.com',
    status: 'booked',
    service_type: 'Tankless Water Heater Install',
    price: 1850.00,
    address: '1042 Elm Street, Suite 4',
    source: 'Automated SMS Campaign',
    createdAt: '2026-07-17T09:15:00Z',
    notes: 'Water heater replacement scheduled.',
    bookings: [
      { id: 'b-201', service_type: 'Tankless Water Heater Installation', appointment_date: '2026-07-21T10:00:00Z', price: 1850.00, status: 'scheduled' }
    ]
  },
  {
    id: 'c-103',
    tenant_id: 't-001',
    first_name: 'David',
    last_name: 'Miller',
    phone: '+15553456789',
    email: 'dmiller@example.com',
    status: 'follow_up_sent',
    service_type: 'Bathroom Pipe Re-routing',
    price: 920.00,
    address: '350 Fifth Ave, Floor 12',
    source: 'Google Local Service Ads',
    createdAt: '2026-07-19T02:10:00Z',
    notes: 'Sent SMS quote estimate.',
    bookings: []
  },
  {
    id: 'c-104',
    tenant_id: 't-001',
    first_name: 'Elena',
    last_name: 'Rostova',
    phone: '+15559876543',
    email: 'elena.r@example.com',
    status: 'completed',
    service_type: 'Garbage Disposal Repair',
    price: 320.00,
    address: '88 Ocean Drive, Apt 3B',
    source: 'Direct Phone Inbound',
    createdAt: '2026-07-16T11:45:00Z',
    notes: 'Job completed. Google review SMS dispatched.',
    bookings: [
      { id: 'b-202', service_type: 'Emergency Sink Repair & Plumbing Check', appointment_date: '2026-07-20T14:30:00Z', price: 320.00, status: 'completed' }
    ]
  }
];

export const useTenantStore = create((set, get) => ({
  tenants: MOCK_TENANTS,
  activeTenantId: 't-001',
  activeView: 'overview', // Default landing is Dashboard Home overview
  pipelineDisplayMode: 'kanban',
  contactFilter: 'all',
  selectedContactId: 'c-101',
  selectedThreadContactId: 'c-101',
  contacts: MOCK_CONTACTS,
  messages: [],
  searchQuery: '',
  notificationToast: null,
  pendingUndoAction: null,

  // Toggle Chat Widget ON / OFF per client
  toggleTenantChatWidget: (tenantId, enabled) => {
    const updatedTenants = get().tenants.map((t) => {
      if (t.id === tenantId) {
        return { ...t, chatWidgetEnabled: enabled };
      }
      return t;
    });

    const activeTenant = updatedTenants.find(t => t.id === tenantId);

    set({
      tenants: updatedTenants,
      notificationToast: `Website Chat Widget ${enabled ? 'ENABLED' : 'DISABLED'} for ${activeTenant?.name}!`
    });

    setTimeout(() => set({ notificationToast: null }), 3500);
  },

  // Add booking to a contact and set status to booked
  addBookingToContact: (contactId, bookingData) => {
    const updatedContacts = get().contacts.map((c) => {
      if (c.id === contactId) {
        return {
          ...c,
          status: 'booked',
          bookings: [...(c.bookings || []), bookingData]
        };
      }
      return c;
    });

    const contactName = get().contacts.find(c => c.id === contactId)?.first_name || 'Customer';

    set({
      contacts: updatedContacts,
      notificationToast: `Scheduled booking for ${contactName}! Twilio Redis reminder queue loaded.`
    });

    setTimeout(() => set({ notificationToast: null }), 4000);
  },

  setPipelineDisplayMode: (mode) => set({ pipelineDisplayMode: mode }),
  setActiveTenantId: (tenantId) => {
    const tenantContacts = get().contacts.filter(c => c.tenant_id === tenantId);
    set({
      activeTenantId: tenantId,
      selectedContactId: tenantContacts[0]?.id || null,
      selectedThreadContactId: tenantContacts[0]?.id || null
    });
  },

  setActiveView: (view) => set({ activeView: view }),
  setContactFilter: (filter) => set({ contactFilter: filter }),
  setSelectedContactId: (id) => set({ selectedContactId: id }),
  setSelectedThreadContactId: (id) => set({ selectedThreadContactId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  moveContactStage: (contactId, newStatus) => {
    const activeTenant = get().tenants.find(t => t.id === get().activeTenantId);
    const targetContact = get().contacts.find(c => c.id === contactId);

    if (!targetContact || targetContact.status === newStatus) return;

    const oldStatus = targetContact.status;

    if (get().pendingUndoAction?.timeoutId) {
      clearTimeout(get().pendingUndoAction.timeoutId);
    }

    const updatedContacts = get().contacts.map((contact) => {
      if (contact.id === contactId) {
        return { ...contact, status: newStatus };
      }
      return contact;
    });

    const timeoutId = setTimeout(() => {
      const finalContacts = get().contacts.map((c) => {
        if (c.id === contactId) {
          const updatedBookings = [...c.bookings];
          if ((newStatus === 'booked' || newStatus === 'completed') && updatedBookings.length === 0) {
            updatedBookings.push({
              id: `b-${Date.now().toString().slice(-4)}`,
              service_type: c.service_type || 'General Service',
              appointment_date: new Date().toISOString(),
              price: c.price || 350.00,
              status: newStatus === 'completed' ? 'completed' : 'scheduled'
            });
          }
          return { ...c, bookings: updatedBookings };
        }
        return c;
      });

      set({
        contacts: finalContacts,
        pendingUndoAction: null,
        notificationToast: `Committed change to DB & queued Redis workflow trigger for ${targetContact.first_name}!`
      });

      setTimeout(() => set({ notificationToast: null }), 4000);
    }, 15000);

    const toastMsg = `Moved ${targetContact.first_name} to "${newStatus.replace('_', ' ')}". Automation delayed by 15s.`;

    set({
      contacts: updatedContacts,
      selectedContactId: contactId,
      notificationToast: toastMsg,
      pendingUndoAction: {
        contactId,
        oldStatus,
        newStatus,
        timeoutId,
        contactName: targetContact.first_name
      }
    });
  },

  undoPendingStageMove: () => {
    const pending = get().pendingUndoAction;
    if (!pending) return;

    clearTimeout(pending.timeoutId);

    const revertedContacts = get().contacts.map((contact) => {
      if (contact.id === pending.contactId) {
        return { ...contact, status: pending.oldStatus };
      }
      return contact;
    });

    set({
      contacts: revertedContacts,
      pendingUndoAction: null,
      notificationToast: `Undid move! ${pending.contactName} returned to "${pending.oldStatus.replace('_', ' ')}" without firing automation.`
    });

    setTimeout(() => set({ notificationToast: null }), 4000);
  },

  updateContactStatus: (contactId, newStatus, newBookingData = null) => {
    get().moveContactStage(contactId, newStatus);
  },

  bulkImportContacts: (sanitizedContacts) => {
    if (!sanitizedContacts || sanitizedContacts.length === 0) return;
    const activeTenant = get().tenants.find(t => t.id === get().activeTenantId);

    set({
      contacts: [...sanitizedContacts, ...get().contacts],
      selectedContactId: sanitizedContacts[0].id,
      notificationToast: `Successfully bulk-imported ${sanitizedContacts.length} contacts via PostgreSQL UNNEST into ${activeTenant?.name}!`
    });

    setTimeout(() => set({ notificationToast: null }), 5000);
  },

  sendSMSMessage: (contactId, textContent) => {
    if (!textContent.trim()) return;

    const activeTenant = get().tenants.find(t => t.id === get().activeTenantId);
    const newMessage = {
      id: `m-${Date.now()}`,
      contact_id: contactId,
      tenant_id: get().activeTenantId,
      direction: 'outbound',
      content: textContent,
      created_at: new Date().toISOString()
    };

    set({
      messages: [...get().messages, newMessage],
      notificationToast: `SMS dispatched via ${activeTenant?.name} Twilio Gateway`
    });

    setTimeout(() => set({ notificationToast: null }), 3500);
  },

  clearNotification: () => set({ notificationToast: null })
}));
