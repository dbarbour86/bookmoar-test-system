import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Mail, Trash2, Send, Variable } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export function CommunicationNode({ id, data, selected }) {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  const isSMS = (data.channel || 'SMS') === 'SMS';

  return (
    <div className={`relative w-84 rounded-xl border bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-200 ${
      selected ? 'border-indigo-400 ring-2 ring-indigo-400/30 shadow-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Input Flow Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3.5 !h-3.5 !bg-indigo-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />

      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-lg border ${
            isSMS ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
          }`}>
            {isSMS ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Communication Node</span>
            <h4 className="text-sm font-bold text-slate-100">{isSMS ? 'SMS Outbound Action' : 'Email Outbound Action'}</h4>
          </div>
        </div>
        <button
          onClick={() => deleteNode(id)}
          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
          title="Delete Node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Form Controls with .nodrag */}
      <div className="space-y-3 nodrag text-xs">
        {/* Channel Selector */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Outbound Channel</label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => updateNodeData(id, { channel: 'SMS' })}
              className={`py-1 rounded text-[11px] font-medium transition-all ${
                isSMS ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SMS Text
            </button>
            <button
              type="button"
              onClick={() => updateNodeData(id, { channel: 'Email' })}
              className={`py-1 rounded text-[11px] font-medium transition-all ${
                !isSMS ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Email Body
            </button>
          </div>
        </div>

        {/* Email Subject Line (Only shown for Email channel) */}
        {!isSMS && (
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Email Subject</label>
            <input
              type="text"
              value={data.subject || ''}
              onChange={(e) => updateNodeData(id, { subject: e.target.value })}
              placeholder="e.g. Confirming Your Service Request"
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Template Body Configuration */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-medium text-slate-400">
              {isSMS ? 'SMS Message Template' : 'Email Body Content'}
            </label>
            <span className="text-[10px] text-indigo-400 flex items-center gap-1">
              <Variable className="w-3 h-3" /> Liquid Tags Supported
            </span>
          </div>
          <textarea
            rows={3}
            value={data.templateBody || ''}
            onChange={(e) => updateNodeData(id, { templateBody: e.target.value })}
            placeholder={isSMS ? 'Hi {{first_name}}, thanks for contacting {{business_name}}!' : 'Hi {{first_name}},\n\nThank you for choosing {{business_name}}.'}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-2.5 font-mono text-[11px] focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
          />
        </div>

        {/* Integration Credentials Provider */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Provider Integration</label>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300">
            <Send className="w-3.5 h-3.5 mr-2 text-indigo-400" />
            <span className="font-mono text-[11px]">{isSMS ? 'Twilio SID (Tenant Key)' : 'Resend API (Tenant Key)'}</span>
          </div>
        </div>
      </div>

      {/* Output Flow Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="!w-3.5 !h-3.5 !bg-indigo-400 !border-2 !border-slate-900 hover:!scale-125 transition-transform"
      />
    </div>
  );
}
