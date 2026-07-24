import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, User, MessageSquare, Zap, CheckCheck, Clock, ShieldCheck, Sparkles, Calendar } from 'lucide-react';
import { useTenantStore } from '../../store/useTenantStore';

export function SMSInboxView() {
  const contacts = useTenantStore((state) => state.contacts);
  const messages = useTenantStore((state) => state.messages);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);
  const selectedThreadContactId = useTenantStore((state) => state.selectedThreadContactId);
  const setSelectedThreadContactId = useTenantStore((state) => state.setSelectedThreadContactId);
  const sendSMSMessage = useTenantStore((state) => state.sendSMSMessage);
  const tenants = useTenantStore((state) => state.tenants);

  const [replyText, setReplyText] = useState('');
  const chatBottomRef = useRef(null);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];
  const tenantContacts = contacts.filter((c) => c.tenant_id === activeTenantId);

  // Map contacts to their message threads
  const threads = tenantContacts.map((contact) => {
    const contactMessages = messages.filter((m) => m.contact_id === contact.id);
    const lastMessage = contactMessages[contactMessages.length - 1];

    return {
      contact,
      messages: contactMessages,
      lastMessage: lastMessage ? lastMessage.content : 'No messages yet',
      lastTime: lastMessage ? lastMessage.created_at : contact.createdAt
    };
  });

  const activeThread = threads.find((t) => t.contact.id === selectedThreadContactId) || threads[0];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;
    sendSMSMessage(activeThread.contact.id, replyText);
    setReplyText('');
  };

  const handleQuickTemplateClick = (templateStr) => {
    setReplyText(templateStr);
  };

  // Helper to map statuses to match the exact badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'lead':
        return (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
            Lead
          </span>
        );
      case 'booked':
        return (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
            Booked
          </span>
        );
      case 'follow_up_sent':
        return (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase tracking-wide">
            Follow Up
          </span>
        );
      case 'completed':
        return (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 uppercase tracking-wide">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-800 text-slate-300 uppercase tracking-wide">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#070709]">
      {/* Left Panel: Thread Previews List */}
      <div className="w-[360px] lg:w-[400px] border-r border-[#252528] bg-[#0b0b0d] flex flex-col h-full select-none">
        
        {/* Inbox Header */}
        <div className="p-4 border-b border-[#252528] bg-[#101014]/60 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF2538]" />
              <span>Two-Way SMS Stream</span>
            </h3>
            <span className="text-[10px] font-mono text-[#FF2538] bg-[#FF2538]/10 px-2 py-0.5 rounded-full border border-[#FF2538]/20 uppercase font-bold">
              Twilio Gateway
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time customer SMS threads for {activeTenant.name}
          </p>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {threads.map((thread) => {
            const isSelected = activeThread?.contact.id === thread.contact.id;
            const initials = `${thread.contact.first_name.charAt(0)}${thread.contact.last_name.charAt(0)}`;

            return (
              <div
                key={thread.contact.id}
                onClick={() => setSelectedThreadContactId(thread.contact.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#101014] border-[#FF2538]/50 shadow-lg shadow-[#FF2538]/10 ring-1 ring-[#FF2538]/20'
                    : 'bg-[#101014]/40 border-[#252528]/80 hover:border-slate-700 hover:bg-[#101014]/70'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{thread.contact.first_name} {thread.contact.last_name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{thread.contact.phone}</p>
                    </div>
                  </div>

                  {getStatusBadge(thread.contact.status)}
                </div>

                {/* Message Snippet */}
                <p className="text-[11px] text-slate-400 truncate mt-2 font-sans">
                  {thread.lastMessage}
                </p>

                <div className="mt-2 text-[10px] text-slate-500 text-right font-mono">
                  {new Date(thread.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Active Chat Stream */}
      {activeThread ? (
        <div className="flex-1 flex flex-col h-full bg-[#070709] overflow-hidden">
          
          {/* Chat Stream Header */}
          <div className="h-16 border-b border-[#252528] bg-[#0b0b0d] px-6 flex items-center justify-between z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF2538]/10 text-[#FF2538] border border-[#FF2538]/20 flex items-center justify-center font-bold text-sm">
                {activeThread.contact.first_name.charAt(0)}{activeThread.contact.last_name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeThread.contact.first_name} {activeThread.contact.last_name}</span>
                  <span className="text-[10px] font-mono text-slate-400">({activeThread.contact.phone})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Channel: <span className="text-cyan-400 font-mono">Twilio Inbound SMS</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-black/60 border border-[#252528] px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF2538]" />
              <span>Subdomain isolated</span>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans">
            {activeThread.messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No SMS messages exchanged yet. Send a message below to start conversation.
              </div>
            ) : (
              activeThread.messages.map((msg) => {
                const isInbound = msg.direction === 'inbound';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center space-x-2 mb-1 text-[10px] text-slate-500 font-mono">
                      <span>{isInbound ? `${activeThread.contact.first_name}` : `${activeTenant.name} (Twilio Outbound)`}</span>
                      <span>•</span>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg ${
                      isInbound
                        ? 'bg-[#101014] border border-[#252528] text-slate-100 rounded-tl-xs'
                        : 'bg-gradient-to-r from-[#FF2538] to-red-600 text-white rounded-tr-xs shadow-[#FF2538]/10'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Response Templates & Reply Input Box */}
          <div className="p-4 border-t border-[#252528] bg-[#0b0b0d] space-y-3">
            
            {/* Quick Templates Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-500 font-semibold flex items-center gap-1 flex-shrink-0">
                <Sparkles className="w-3 h-3 text-[#FF2538]" /> Quick Replies:
              </span>
              <button
                type="button"
                onClick={() => handleQuickTemplateClick("Hi! We can dispatch a technician to your location today. What time works best?")}
                className="px-2.5 py-1 rounded-lg bg-[#101014] hover:bg-slate-800 text-slate-300 border border-[#252528] truncate flex-shrink-0"
              >
                "Dispatch Today"
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplateClick(`Hi ${activeThread.contact.first_name}, your appointment is confirmed! We look forward to servicing your property.`)}
                className="px-2.5 py-1 rounded-lg bg-[#101014] hover:bg-slate-800 text-slate-300 border border-[#252528] truncate flex-shrink-0"
              >
                "Booking Confirmed"
              </button>
              <button
                type="button"
                onClick={() => handleQuickTemplateClick("Thanks for contacting us! We've received your request and will follow up shortly.")}
                className="px-2.5 py-1 rounded-lg bg-[#101014] hover:bg-slate-800 text-slate-300 border border-[#252528] truncate flex-shrink-0"
              >
                "General Follow-up"
              </button>
            </div>

            {/* Form Reply Input */}
            <form onSubmit={handleSendReply} className="flex items-center space-x-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Type SMS response to send via ${activeTenant.name} Twilio integration...`}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-[#FF2538]"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="inline-flex items-center space-x-2 bg-[#FF2538] hover:bg-[#e01c2e] disabled:opacity-40 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-[#FF2538]/20 transition-all"
              >
                <span>Send SMS</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
          Select a conversation thread to start texting.
        </div>
      )}
    </div>
  );
}
export default SMSInboxView;
