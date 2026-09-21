import React, { useState } from 'react';
import {
  MessageSquare,
  Shield,
  Compass,
  User,
  Package,
  Calendar,
  FileText,
  Users,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Settings,
  ShieldAlert,
  Search,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  PhoneCall,
} from 'lucide-react';
import { UserRole } from '../../types';

interface Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
  activeRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
  allowedRoles: UserRole[];
}

export const Sidebar: React.FC<Props> = ({
  currentRoute,
  onNavigate,
  activeRole,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Collapsed state of individual groups within sidebar
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const navGroups: NavGroup[] = [
    {
      id: 'customer',
      title: 'CUSTOMER',
      allowedRoles: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'],
      items: [
        { id: 'c-home', label: 'Overview', route: '/', icon: <Compass className="w-4 h-4" /> },
        { id: 'c-chat', label: 'AI Assistant', route: '/chat', icon: <MessageSquare className="w-4 h-4" />, badge: 'Active' },
        { id: 'c-journey', label: 'My Journey', route: '/customer?tab=journey', icon: <Shield className="w-4 h-4" /> },
        { id: 'c-needs', label: 'My Needs & Profile', route: '/customer?tab=needs', icon: <User className="w-4 h-4" /> },
        { id: 'c-products', label: 'Products', route: '/products', icon: <Package className="w-4 h-4" /> },
        { id: 'c-comparisons', label: 'Comparisons', route: '/products?tab=compare', icon: <Scale className="w-4 h-4" /> },
        { id: 'c-appointments', label: 'Appointments', route: '/customer?tab=appointments', icon: <Calendar className="w-4 h-4" /> },
        { id: 'c-documents', label: 'Documents', route: '/customer?tab=documents', icon: <FileText className="w-4 h-4" /> },
      ],
    },
    {
      id: 'sales',
      title: 'SALES & ADVISORY',
      allowedRoles: ['ADVISOR', 'SALES_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
      items: [
        { id: 's-overview', label: 'Overview', route: '/advisor', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 's-pipeline', label: 'Sales Pipeline', route: '/advisor?view=pipeline', icon: <Layers className="w-4 h-4" /> },
        { id: 's-leads', label: 'Leads', route: '/advisor?view=leads', icon: <Users className="w-4 h-4" /> },
        { id: 's-customers', label: 'Customers', route: '/advisor?view=customers', icon: <UserCheck className="w-4 h-4" /> },
        { id: 's-ready', label: 'Advisor Ready', route: '/advisor?view=handoffs', icon: <Sparkles className="w-4 h-4" />, badge: 'New' },
        { id: 's-appointments', label: 'Appointments', route: '/advisor?view=appointments', icon: <Calendar className="w-4 h-4" /> },
        { id: 's-followups', label: 'Follow-Ups & Callbacks', route: '/advisor?view=callbacks', icon: <PhoneCall className="w-4 h-4" /> },
        { id: 's-applications', label: 'Applications', route: '/advisor?view=applications', icon: <FileText className="w-4 h-4" /> },
      ],
    },
    {
      id: 'knowledge',
      title: 'KNOWLEDGE',
      allowedRoles: ['CUSTOMER', 'ADVISOR', 'ADMIN', 'AI_TRAINER', 'PRODUCT_REVIEWER', 'SUPER_ADMIN'],
      items: [
        { id: 'k-brain', label: 'Product Brain', route: '/admin?tab=brain', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'k-products', label: 'Products Catalog', route: '/products', icon: <Package className="w-4 h-4" /> },
        { id: 'k-faqs', label: 'Verified FAQs', route: '/admin?tab=faqs', icon: <CheckCircle2 className="w-4 h-4" /> },
      ],
    },
    {
      id: 'ai-quality',
      title: 'AI & QUALITY',
      allowedRoles: ['AI_TRAINER', 'ADMIN', 'COMPLIANCE_REVIEWER', 'SUPER_ADMIN'],
      items: [
        { id: 'q-training', label: 'Training Center', route: '/training', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'q-evaluations', label: 'Evaluations & Tests', route: '/training?tab=evaluations', icon: <ShieldAlert className="w-4 h-4" /> },
        { id: 'q-improvements', label: 'Knowledge Proposals', route: '/training?tab=improvements', icon: <Sparkles className="w-4 h-4" /> },
      ],
    },
    {
      id: 'admin',
      title: 'ADMINISTRATION',
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
      items: [
        { id: 'a-advisors', label: 'Advisors', route: '/admin?tab=advisors', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'a-compliance', label: 'Compliance & Audit', route: '/admin?tab=audit', icon: <Shield className="w-4 h-4" /> },
        { id: 'a-settings', label: 'System Settings', route: '/admin?tab=settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  // Filter groups appropriate to active role
  const visibleGroups = navGroups.filter((g) => g.allowedRoles.includes(activeRole));

  return (
    <aside
      className={`bg-[#000048] text-slate-100 flex flex-col shrink-0 transition-all duration-200 border-r border-blue-950/70 select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header with collapse button */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-blue-900/60">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded bg-[#C91432] text-white flex items-center justify-center font-black text-xs shrink-0">
              AXA
            </div>
            <div className="truncate">
              <span className="font-bold text-xs tracking-tight text-white block truncate">
                SALES AGENT OS
              </span>
              <span className="text-[10px] text-blue-300/80 block truncate">
                Phase 1 Production Demo
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-7 h-7 rounded bg-[#C91432] text-white flex items-center justify-center font-black text-xs shrink-0">
            AXA
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-white/10 text-blue-200 hover:text-white transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 mx-auto" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation items grouped */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 no-scrollbar">
        {visibleGroups.map((group) => {
          const isGroupCollapsed = collapsedGroups[group.id];

          return (
            <div key={group.id} className="space-y-1">
              {!isCollapsed ? (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-blue-300/70 uppercase tracking-wider hover:text-blue-200 transition-colors"
                >
                  <span>{group.title}</span>
                  {isGroupCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-blue-400/60" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-blue-400/60" />
                  )}
                </button>
              ) : (
                <div className="h-2 border-t border-blue-900/40 my-2" />
              )}

              {(!isGroupCollapsed || isCollapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = currentRoute === item.route.split('?')[0];

                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.route)}
                        title={isCollapsed ? item.label : undefined}
                        className={`w-full flex items-center rounded-lg text-xs transition-colors relative group ${
                          isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-2.5 justify-between'
                        } ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="shrink-0">{item.icon}</span>
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#C91432] text-white">
                            {item.badge}
                          </span>
                        )}

                        {/* Tooltip on collapsed hover */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-medium whitespace-nowrap shadow-xl z-50 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advisor Quick Status footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-blue-900/60 bg-blue-950/40 text-[11px] space-y-1">
          <div className="text-blue-300 font-medium">Licensed Insurance Advisor</div>
          <div className="font-bold text-white truncate">Bishop Orly B. Languisan</div>
          <div className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            +63 968 647 1868 • Active
          </div>
        </div>
      )}
    </aside>
  );
};
