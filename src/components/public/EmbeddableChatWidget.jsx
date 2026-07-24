import React, { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, Sparkles, Phone, User, MessageCircle } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';

export function EmbeddableChatWidget() {
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const tenants = useTenantStore((state) => state.tenants);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];
  const isWidgetEnabled = activeTenant.chatWidgetEnabled !== false;

  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // If chat widget is turned OFF for this client, render NOTHING
  if (!isWidgetEnabled) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setLoading(true);

    try {
      await fetch(`/api/v1/ingest/${activeTenant.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'form_submission',
          source: 'chat_widget',
          contact: {
            first_name: fullName.split(' ')[0] || fullName,
            last_name: fullName.split(' ').slice(1).join(' ') || 'Customer',
            phone: phone
          },
          payload: {
            initial_message: message,
            source: 'chat_widget'
          }
        })
      });
    } catch (err) {
      console.warn('Simulation ingest fallback:', err.message);
    }

    setLoading(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setFullName('');
      setPhone('');
      setMessage('');
    }, 4000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none animate-in fade-in duration-200">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white p-4 rounded-full shadow-2xl shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 border border-cyan-400/30"
          title={`Text us at ${activeTenant.name}`}
        >
          <MessageCircle className="w-6 h-6 animate-pulse" />
          <span className="text-xs font-bold pr-1">Text Us!</span>
        </button>
      )}

      {/* Slide-Up Form Modal */}
      {isOpen && (
        <div className="w-80 sm:w-90 bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
                💬
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{activeTenant.name}</h4>
                <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Instant Text Responder
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {submitted ? (
            <div className="py-6 text-center space-y-2 animate-in fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-xs font-bold text-white">Message Dispatched!</h4>
              <p className="text-[11px] text-slate-300">
                Thanks {fullName.split(' ')[0]}! A representative from {activeTenant.name} will text your cell phone ({phone}) shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Cell Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">How can we help?</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Need a quick service estimate..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:border-cyan-500 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all text-xs"
              >
                <span>{loading ? 'Ingesting...' : 'Send Instant Text Request'}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
