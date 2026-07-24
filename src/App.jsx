import React, { useState, useEffect } from 'react';
import { AdminWorkflows } from './pages/AdminWorkflows';
import { TenantDashboard } from './pages/TenantDashboard';
import { EmbeddableChatWidget } from './components/public/EmbeddableChatWidget';
import { Shield, LayoutDashboard } from 'lucide-react';

export function App() {
  const [currentRoute, setCurrentRoute] = useState('app'); // 'admin' | 'app'

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentRoute('admin');
    } else {
      setCurrentRoute('app');
    }
  }, []);

  const navigateTo = (route) => {
    setCurrentRoute(route);
    const newPath = route === 'admin' ? '/admin/workflows' : '/app/dashboard';
    window.history.pushState({}, '', newPath);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#070b14] relative flex flex-col">
      {/* Top Floating App Route Switcher Banner */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between z-40 text-xs select-none">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-mono font-semibold text-slate-300">BOOKING ENGINE ARCHITECTURE DEPLOYMENT</span>
        </div>

        {/* Route Selector Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => navigateTo('app')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
              currentRoute === 'app'
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Phase 3: /app/dashboard (Consumer Portal)</span>
          </button>

          <button
            onClick={() => navigateTo('admin')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
              currentRoute === 'admin'
                ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Phase 2: /admin/workflows (Private Flow Canvas)</span>
          </button>
        </div>
      </div>

      {/* Render Current Route Page */}
      <div className="flex-1 overflow-hidden">
        {currentRoute === 'admin' ? (
          <AdminWorkflows />
        ) : (
          <TenantDashboard onNavigateRoute={navigateTo} />
        )}
      </div>

      {/* Embeddable Live Floating Chat Bubble Widget (ONLY shown on client portal dashboard view) */}
      {currentRoute === 'app' && (
        <EmbeddableChatWidget tenantId="t-001" businessName="Apex Plumbing Co." />
      )}
    </div>
  );
}

export default App;
