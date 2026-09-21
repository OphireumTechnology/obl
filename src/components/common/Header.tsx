import React, { useState, useEffect } from 'react';
import {
  Shield,
  MessageSquare,
  UserCheck,
  LayoutDashboard,
  GraduationCap,
  Package,
  Search,
  Bell,
  RotateCcw,
  ChevronDown,
  User,
  Home,
  Check,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { UserRole } from '../../types';

interface Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenDemoLogin: () => void;
}

export const Header: React.FC<Props> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  onOpenNotifications,
  onOpenDemoLogin,
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

  const navItems = [
    { label: 'Home', route: '/', icon: <Home className="w-3.5 h-3.5" /> },
    { label: 'Customer AI', route: '/chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { label: 'Customer Portal', route: '/customer', icon: <User className="w-3.5 h-3.5" /> },
    { label: 'Advisor Workspace', route: '/advisor', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { label: 'Admin & Brain', route: '/admin', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { label: 'Training Lab', route: '/training', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { label: 'Products', route: '/products', icon: <Package className="w-3.5 h-3.5" /> },
  ];

  const roleLabels: Record<UserRole, { title: string; color: string }> = {
    CUSTOMER: { title: 'Customer (Maria)', color: 'bg-blue-600' },
    ADVISOR: { title: 'Advisor (Carlos)', color: 'bg-indigo-600' },
    ADMIN: { title: 'Admin (Elena)', color: 'bg-emerald-600' },
    AI_TRAINER: { title: 'AI Trainer (Arthur)', color: 'bg-purple-600' },
    SALES_MANAGER: { title: 'Sales Manager', color: 'bg-amber-600' },
    PRODUCT_REVIEWER: { title: 'Product Reviewer', color: 'bg-teal-600' },
    COMPLIANCE_REVIEWER: { title: 'Compliance Lead', color: 'bg-rose-600' },
    SUPER_ADMIN: { title: 'Super Admin', color: 'bg-slate-700' },
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
    <header className="bg-[#00008F] text-white border-b border-blue-950 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2 group text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-sm bg-[#C91432] flex items-center justify-center font-black text-white text-sm tracking-tighter shadow-xs group-hover:bg-red-700 transition-colors">
                AXA
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>AI SALES AGENT</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-900/80 text-blue-200 border border-blue-700/50">
                    DEMO
                  </span>
                </div>
                <div className="text-[10px] text-blue-200/80 tracking-wide font-medium">
                  Enterprise Advisory Operating System
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => onNavigate(item.route)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-xs font-semibold'
                      : 'text-blue-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right utility actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
              title="Global Search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline text-[11px] text-blue-300">Search</span>
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
                <span className="max-w-[120px] truncate text-slate-100">
                  {roleLabels[activeRole]?.title || activeRole}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Active Role
                  </div>
                  {(['CUSTOMER', 'ADVISOR', 'ADMIN', 'AI_TRAINER'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        activeRole === r ? 'font-bold text-[#00008F] bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${roleLabels[r]?.color}`} />
                        <span>{roleLabels[r]?.title}</span>
                      </div>
                      {activeRole === r && <Check className="w-3.5 h-3.5 text-[#00008F]" />}
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

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center overflow-x-auto py-1.5 border-t border-blue-900/60 no-scrollbar space-x-1">
          {navItems.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => onNavigate(item.route)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap flex items-center gap-1 ${
                  isActive ? 'bg-white/20 text-white font-semibold' : 'text-blue-200/80 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
