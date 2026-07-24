import React, { useState } from 'react';
import { Code, Copy, Check, Sparkles, X, Globe, Terminal } from 'lucide-react';
import { useWorkflowStore } from '../store/useWorkflowStore';

export function AdminChatWidgetCodeModal({ isOpen, onClose }) {
  const tenants = useWorkflowStore((state) => state.tenants);
  const [selectedTenantId, setSelectedTenantId] = useState('t-001');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeTenant = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  const rawScriptSnippet = `<!-- Book Moar Instant Chat Widget Script Injection -->
<script 
  src="https://cdn.booking-system.com/widget.v1.js" 
  data-tenant-id="${activeTenant.id}"
  data-subdomain="${activeTenant.subdomain}"
  data-endpoint="https://api.booking-system.com/api/v1/ingest/${activeTenant.id}"
  async>
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawScriptSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#090d16] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Embeddable Chat Widget Snippet</span>
                <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  JavaScript Injection
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Paste this script before the <code className="text-cyan-400">&lt;/body&gt;</code> tag on any client website.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tenant Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Target Tenant Business</label>
          <select
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:border-cyan-500"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.subdomain}.service.app)
              </option>
            ))}
          </select>
        </div>

        {/* Code Snippet Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> HTML Script Tag Snippet
            </span>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 transition-all text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code Snippet'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 border border-slate-800/90 rounded-2xl font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
{rawScriptSnippet}
          </pre>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            Submissions via this widget automatically hit <code className="text-cyan-300">/api/v1/ingest/{selectedTenantId}</code> with tag <code className="text-amber-300">source: 'chat_widget'</code> and trigger the auto-responder workflow.
          </p>
        </div>

      </div>
    </div>
  );
}
