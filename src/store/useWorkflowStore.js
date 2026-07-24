import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';

// FLOW 1: Quote Form Submission & Owner Alert Flow
const FLOW_1_NODES = [
  {
    id: 't-q1',
    type: 'trigger',
    position: { x: 100, y: 150 },
    data: {
      tenantId: 'all',
      webhookUrl: '/api/v1/ingest/:tenant_id',
      eventFilter: 'form_submission',
      event_triggers: ['form_submission'],
      label: 'Quote Form Submission'
    }
  },
  {
    id: 'c-q-alert',
    type: 'communication',
    position: { x: 460, y: 50 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Alert: A new lead has submitted a quote request! View details in dashboard.',
      senderConfig: 'Twilio Owner Alert'
    }
  },
  {
    id: 'c-q-kanban',
    type: 'communication',
    position: { x: 460, y: 250 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Welcome! We received your quote request. A coordinator will text you shortly.',
      senderConfig: 'Twilio Lead Auto-Responder'
    }
  },
  {
    id: 'c-q-est',
    type: 'communication',
    position: { x: 820, y: 250 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Hi {{first_name}}, here is your estimated price for {{service_type}}: ${{price}}. Reply to accept.',
      senderConfig: 'Twilio Estimate Sender'
    }
  }
];

const FLOW_1_EDGES = [
  { id: 'eq1-2', source: 't-q1', target: 'c-q-alert', animated: true },
  { id: 'eq1-3', source: 't-q1', target: 'c-q-kanban', animated: true },
  { id: 'eq3-4', source: 'c-q-kanban', target: 'c-q-est', animated: true }
];

// FLOW 2: Customer Booking & Multi-Path Dispatch Flow
const FLOW_2_NODES = [
  {
    id: 't-b1',
    type: 'trigger',
    position: { x: 80, y: 180 },
    data: {
      tenantId: 'all',
      webhookUrl: '/api/v1/ingest/:tenant_id',
      eventFilter: 'appointment_created',
      event_triggers: ['appointment_created'],
      label: 'Customer Books Appointment'
    }
  },
  {
    id: 'c-b-cal',
    type: 'communication',
    position: { x: 440, y: 50 },
    data: {
      channel: 'Email',
      subject: 'Calendar Slot Reserved',
      templateBody: 'Internal: Sub-calendar slot locked for {{service_type}}.',
      senderConfig: 'Sub-Calendar Engine'
    }
  },
  {
    id: 'c-b-conf',
    type: 'communication',
    position: { x: 440, y: 200 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Hello {{first_name}}, your booking for {{service_type}} is confirmed on {{appointment_date}}!',
      senderConfig: 'Twilio Booking Confirmation'
    }
  },
  {
    id: 'd-b-24h',
    type: 'delay',
    position: { x: 440, y: 350 },
    data: {
      duration: 1,
      unit: 'Days',
      label: 'Schedule 24hr Reminder'
    }
  },
  {
    id: 'c-b-rem',
    type: 'communication',
    position: { x: 820, y: 350 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Reminder: You have an upcoming service tomorrow with {{business_name}}!',
      senderConfig: 'Twilio Reminder Gateway'
    }
  }
];

const FLOW_2_EDGES = [
  { id: 'eb1-2', source: 't-b1', target: 'c-b-cal', animated: true },
  { id: 'eb1-3', source: 't-b1', target: 'c-b-conf', animated: true },
  { id: 'eb1-4', source: 't-b1', target: 'd-b-24h', animated: true },
  { id: 'eb4-5', source: 'd-b-24h', target: 'c-b-rem', animated: true }
];

// FLOW 3: Post-Service Rating Gating & No-Show Rebooking Flow
const FLOW_3_NODES = [
  {
    id: 't-k1',
    type: 'trigger',
    position: { x: 80, y: 220 },
    data: {
      tenantId: 'all',
      webhookUrl: '/api/v1/ingest/:tenant_id',
      eventFilter: 'status_changed',
      event_triggers: ['status_changed'],
      label: 'Kanban Drag / Status Change'
    }
  },
  {
    id: 'd-k-1h',
    type: 'delay',
    position: { x: 400, y: 50 },
    data: {
      duration: 1,
      unit: 'Hours',
      label: 'Wait 1 Hour'
    }
  },
  {
    id: 'c-k-rate',
    type: 'communication',
    position: { x: 740, y: 50 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Thanks for choosing us! Please reply 1 to 5 to rate your service experience today.',
      senderConfig: 'Twilio Rating Collector'
    }
  },
  {
    id: 's-k-split',
    type: 'sentiment_split',
    position: { x: 1080, y: 50 },
    data: {
      label: 'Rating Score Gating'
    }
  },
  {
    id: 'c-k-google',
    type: 'communication',
    position: { x: 1440, y: 0 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Awesome! Please leave us a 5-star Google Review here: {{review_link}}',
      senderConfig: 'Twilio Google Reviews'
    }
  },
  {
    id: 'c-k-alert',
    type: 'communication',
    position: { x: 1440, y: 180 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Internal Alert: Contact left score below 4. Review feedback in dashboard.',
      senderConfig: 'Twilio Owner Alert'
    }
  },
  {
    id: 'c-k-noshow',
    type: 'communication',
    position: { x: 400, y: 350 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Internal: Booking marked as no-show. Rescheduling trigger running.',
      senderConfig: 'Database Sync'
    }
  },
  {
    id: 'c-k-rebook',
    type: 'communication',
    position: { x: 740, y: 350 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Hi {{first_name}}, we missed you today! Click here to easily reschedule: {{reschedule_link}}',
      senderConfig: 'Twilio Rebooking'
    }
  }
];

const FLOW_3_EDGES = [
  { id: 'ek1-2', source: 't-k1', target: 'd-k-1h', animated: true },
  { id: 'ek2-3', source: 'd-k-1h', target: 'c-k-rate', animated: true },
  { id: 'ek3-4', source: 'c-k-rate', target: 's-k-split', animated: true },
  { id: 'ek4-5-true', source: 's-k-split', sourceHandle: 'true_output', target: 'c-k-google', animated: true },
  { id: 'ek4-5-false', source: 's-k-split', sourceHandle: 'false_output', target: 'c-k-alert', animated: true },
  { id: 'ek1-6', source: 't-k1', target: 'c-k-noshow', animated: true },
  { id: 'ek6-7', source: 'c-k-noshow', target: 'c-k-rebook', animated: true }
];

// FLOW 4: SMS Website Widget Lead Ingest Flow
const FLOW_4_NODES = [
  {
    id: 't-w1',
    type: 'trigger',
    position: { x: 100, y: 150 },
    data: {
      tenantId: 'all',
      webhookUrl: '/api/v1/ingest/:tenant_id',
      eventFilter: 'chat_widget',
      event_triggers: ['chat_widget'],
      label: 'SMS Chat Widget message'
    }
  },
  {
    id: 'c-w-cap',
    type: 'communication',
    position: { x: 460, y: 150 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Thanks! We received your chat widget inquiry. A coordinator will text you here.',
      senderConfig: 'Twilio SMS Auto-Response'
    }
  },
  {
    id: 'c-w-alert',
    type: 'communication',
    position: { x: 820, y: 150 },
    data: {
      channel: 'SMS',
      subject: '',
      templateBody: 'Alert: New web chat lead captured from {{first_name}}! Message: "{{initial_message}}"',
      senderConfig: 'Twilio Owner Alert'
    }
  }
];

const FLOW_4_EDGES = [
  { id: 'ew1-2', source: 't-w1', target: 'c-w-cap', animated: true },
  { id: 'ew2-3', source: 'c-w-cap', target: 'c-w-alert', animated: true }
];

const INITIAL_WORKFLOWS = [
  {
    id: 'wf-quote-01',
    name: '1. Quote Form & Owner Alert Flow',
    category: 'Leads',
    description: 'Fired when a prospect submits a website quote form. Alerts owner and sends automated quote estimate SMS.',
    nodes: FLOW_1_NODES,
    updatedAt: '2026-07-24',
    edges: FLOW_1_EDGES
  },
  {
    id: 'wf-booked-02',
    name: '2. Customer Booking & Dispatch Flow',
    category: 'Bookings',
    description: 'Fired when an appointment is booked. Reserves calendar, sends SMS confirmation, and schedules 24h reminder.',
    nodes: FLOW_2_NODES,
    updatedAt: '2026-07-24',
    edges: FLOW_2_EDGES
  },
  {
    id: 'wf-review-03',
    name: '3. Rating Gating & No-Show Rebooking',
    category: 'Pipeline',
    description: 'Fired on Kanban drag action. Gates Google reviews on 4-5 stars, and triggers automated rebooking SMS for No-shows.',
    nodes: FLOW_3_NODES,
    updatedAt: '2026-07-24',
    edges: FLOW_3_EDGES
  },
  {
    id: 'wf-widget-04',
    name: '4. SMS Website Widget Ingest Flow',
    category: 'Widget',
    description: 'Fired when a lead submits a message via the embeddable chat widget. Ingests contact and alerts owner.',
    nodes: FLOW_4_NODES,
    updatedAt: '2026-07-24',
    edges: FLOW_4_EDGES
  }
];

const INITIAL_TENANTS = [
  { id: 't-001', name: 'Apex Plumbing Co.', subdomain: 'apex-plumbing', status: 'Active', activeWorkflowsCount: 4 },
  { id: 't-002', name: 'Elite HVAC Solutions', subdomain: 'elite-hvac', status: 'Active', activeWorkflowsCount: 2 },
  { id: 't-003', name: 'Sparkle Auto Detailing', subdomain: 'sparkle-auto', status: 'Active', activeWorkflowsCount: 3 }
];

export const useWorkflowStore = create((set, get) => ({
  adminSubView: 'dashboard',
  workflows: INITIAL_WORKFLOWS,
  activeFlowId: 'wf-quote-01',
  selectedNodeId: null,
  nodes: FLOW_1_NODES,
  edges: FLOW_1_EDGES,
  tenants: INITIAL_TENANTS,
  masterTemplates: INITIAL_WORKFLOWS,
  activeNotification: null,

  setAdminSubView: (view) => set({ adminSubView: view }),
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),

  openCanvasWithFlow: (flowId) => {
    const targetFlow = get().workflows.find((w) => w.id === flowId) || get().workflows[0];
    set({
      adminSubView: 'canvas',
      activeFlowId: targetFlow.id,
      nodes: targetFlow.nodes,
      edges: targetFlow.edges,
      selectedNodeId: null,
      activeNotification: `Opened Canvas Workspace: "${targetFlow.name}"`
    });
    setTimeout(() => set({ activeNotification: null }), 3000);
  },

  switchFlow: (flowId) => {
    const targetFlow = get().workflows.find((w) => w.id === flowId);
    if (!targetFlow) return;

    set({
      activeFlowId: flowId,
      nodes: targetFlow.nodes,
      edges: targetFlow.edges,
      selectedNodeId: null,
      activeNotification: `Switched canvas to: "${targetFlow.name}"`
    });

    setTimeout(() => set({ activeNotification: null }), 3000);
  },

  createNewFlow: (flowName, category = 'General') => {
    const newId = `wf-${Date.now().toString().slice(-4)}`;
    const newFlow = {
      id: newId,
      name: flowName || 'New Automation Flow',
      category: category,
      description: 'Custom flow canvas created by admin.',
      nodes: [
        {
          id: `trigger-${Date.now().toString().slice(-3)}`,
          type: 'trigger',
          position: { x: 100, y: 180 },
          data: {
            tenantId: 'all',
            webhookUrl: '/api/v1/ingest/:tenant_id',
            eventFilter: 'form_submission',
            event_triggers: ['form_submission'],
            label: `${flowName} Trigger`
          }
        }
      ],
      updatedAt: new Date().toISOString().split('T')[0],
      edges: []
    };

    set({
      workflows: [...get().workflows, newFlow],
      activeFlowId: newId,
      nodes: newFlow.nodes,
      edges: newFlow.edges,
      selectedNodeId: null,
      adminSubView: 'canvas',
      activeNotification: `Created new flow: "${newFlow.name}". Opened full-screen canvas.`
    });

    setTimeout(() => set({ activeNotification: null }), 4000);
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  addNode: (type, position) => {
    const id = `${type}-${Date.now().toString().slice(-4)}`;
    let defaultData = {};

    if (type === 'trigger') {
      defaultData = {
        tenantId: 'all',
        webhookUrl: '/api/v1/ingest/:tenant_id',
        eventFilter: 'form_submission',
        event_triggers: ['form_submission'],
        label: 'Webhook Trigger'
      };
    } else if (type === 'delay') {
      defaultData = {
        duration: 30,
        unit: 'Minutes',
        label: 'Delay Step'
      };
    } else if (type === 'communication') {
      defaultData = {
        channel: 'SMS',
        subject: 'Notification Subject',
        templateBody: 'Hello {{first_name}}, this is an automated message.',
        senderConfig: 'Twilio SMS'
      };
    } else if (type === 'sentiment_split') {
      defaultData = {
        label: 'Rating Gating Split'
      };
    }

    const newNode = {
      id,
      type,
      position: position || { x: 250, y: 250 },
      data: defaultData
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: id
    });
  },

  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId
    });
  },

  duplicateTemplateToTenant: (templateId, targetTenantId) => {
    const template = get().workflows.find((t) => t.id === templateId) || get().masterTemplates.find((t) => t.id === templateId);
    const tenant = get().tenants.find((t) => t.id === targetTenantId);

    if (!template || !tenant) return;

    const updatedTenants = get().tenants.map((t) => {
      if (t.id === targetTenantId) {
        return { ...t, activeWorkflowsCount: t.activeWorkflowsCount + 1 };
      }
      return t;
    });

    set({
      tenants: updatedTenants,
      activeNotification: `Successfully duplicated "${template.name}" to tenant ${tenant.name}! Sequence active in Redis queue.`
    });

    setTimeout(() => set({ activeNotification: null }), 5000);
  },

  clearNotification: () => set({ activeNotification: null })
}));
