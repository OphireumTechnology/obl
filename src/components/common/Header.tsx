import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  RotateCcw,
  ChevronDown,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Shield,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { UserRole } from '../../types';

interface Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenDemoLogin: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<Props> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  onOpenNotifications,
  onOpenDemoLogin,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(appStore.getState().activeRole);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const state = appStore.getState();
      setActiveRole(state.activeRole);
      setUnreadCount(state.notifications.filter((n) => !n.read).length);
    };
    update();
    const unsub = appStore.subscribe(update);
    return () => unsub();
  }, []);

  const roleLabels: Record<UserRole, { title: string; color: string; desc: string }> = {
    CUSTOMER: { title: 'Customer (Maria)', color: 'bg-blue-500', desc: 'Customer exploration & portal' },
    ADVISOR: { title: 'Advisor (Bishop Orly)', color: 'bg-indigo-500', desc: 'Lead & client sales operations' },
    ADMIN: { title: 'Admin (Elena)', color: 'bg-emerald-500', desc: 'Product Brain & governance' },
    AI_TRAINER: { title: 'AI Trainer (Arthur)', color: 'bg-purple-500', desc: 'Agent evaluations & prompts' },
    SALES_MANAGER: { title: 'Sales Manager', color: 'bg-amber-500', desc: 'Agency oversight & pipeline' },
    PRODUCT_REVIEWER: { title: 'Product Reviewer', color: 'bg-teal-500', desc: 'Fact sheet verification' },
    COMPLIANCE_REVIEWER: { title: 'Compliance Lead', color: 'bg-rose-500', desc: 'Regulatory & audit review' },
    SUPER_ADMIN: { title: 'Super Admin', color: 'bg-slate-700', desc: 'System-wide configuration' },
  };

  const handleRoleSelect = (role: UserRole) => {
    appStore.setRole(role);
    setRoleDropdownOpen(false);
    if (role === 'CUSTOMER') onNavigate('/chat');
    else if (role === 'ADVISOR') onNavigate('/advisor');
    else if (role === 'ADMIN') onNavigate('/admin');
    else if (role === 'AI_TRAINER') onNavigate('/training');
  };

  return (
    <header className="bg-[#00008F] text-white border-b border-blue-950 sticky top-0 z-40 shadow-xs">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Sidebar Toggle + Title/Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-7 h-7 rounded-sm bg-[#C91432] flex items-center justify-center font-black text-white text-xs tracking-tight shadow-xs">
                AXA
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>AI Insurance Sales Agent</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-900/80 text-blue-200 border border-blue-700/50">
                    Phase 1 Demo
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Right: Minimal utility actions (Search, Notifications, Role, Reset) */}
          <div className="flex items-center gap-2">
            {/* Global Search */}
            <button
              onClick={onOpenSearch}
              className="px-2.5 py-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs bg-white/5 border border-white/10"
              title="Global Search across Leads, Products, FAQs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] text-blue-200">Search...</span>
              <kbd className="hidden sm:inline px-1 py-0.2 text-[9px] font-mono bg-white/10 rounded text-blue-300">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C91432] ring-2 ring-[#00008F]" />
              )}
            </button>

            {/* Role Selector dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${roleLabels[activeRole]?.color || 'bg-blue-400'}`} />
                <span className="max-w-[140px] truncate text-slate-100">
                  {roleLabels[activeRole]?.title || activeRole}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Active User Role</span>
                    <span className="text-[#00008F]">Switch Context</span>
                  </div>
                  {(['CUSTOMER', 'ADVISOR', 'ADMIN', 'AI_TRAINER'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        activeRole === r ? 'font-bold text-[#00008F] bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${roleLabels[r]?.color}`} />
                          <span>{roleLabels[r]?.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block pl-4">
                          {roleLabels[r]?.desc}
                        </span>
                      </div>
                      {activeRole === r && <Check className="w-3.5 h-3.5 text-[#00008F] shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setRoleDropdownOpen(false);
                        onOpenDemoLogin();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50 font-medium"
                    >
                      View Role Matrix & Details →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demo pipeline, leads, and appointments to default initial state?')) {
                  appStore.resetToDefaults();
                  window.location.reload();
                }
              }}
              className="p-1.5 rounded-lg text-blue-200/70 hover:text-white hover:bg-white/10 transition-colors text-xs hidden sm:flex items-center gap-1"
              title="Reset Demo Data to Initial Seeds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
