import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DemoEnvironmentBanner } from './components/common/DemoEnvironmentBanner';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DemoLoginModal } from './components/demo/DemoLoginModal';
import { PublicLanding } from './components/landing/PublicLanding';
import { CustomerChat } from './components/chat/CustomerChat';
import { CustomerWorkspace } from './components/customer/CustomerWorkspace';
import { AdvisorDashboard } from './components/advisor/AdvisorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TrainingCenter } from './components/training/TrainingCenter';
import { ProductExplorer } from './components/products/ProductExplorer';
import { appStore } from './services/store';
import { UserRole } from './types';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/chat');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDemoLoginOpen, setIsDemoLoginOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>(appStore.getState().activeRole);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('axa_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      setActiveRole(appStore.getState().activeRole);
    });
    return () => unsub();
  }, []);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('axa_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRole = (role: UserRole, targetRoute: string) => {
    appStore.setRole(role);
    setActiveRole(role);
    handleNavigate(targetRoute);
  };

  const roleLabels: Record<UserRole, string> = {
    CUSTOMER: 'Customer (Maria Santos)',
    ADVISOR: 'Advisor (Bishop Orly B. Languisan - AXA-LIC-77402)',
    ADMIN: 'Administrator & Product Brain (Elena Ramos)',
    AI_TRAINER: 'AI Quality Engineer (Dr. Arthur Chen)',
    SALES_MANAGER: 'Sales Agency Manager',
    PRODUCT_REVIEWER: 'Product Reviewer',
    COMPLIANCE_REVIEWER: 'Compliance Reviewer',
    SUPER_ADMIN: 'Super Administrator',
  };

  // Extract base route without query parameters
  const baseRoute = currentRoute.split('?')[0];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Persistent Demo Warning Banner */}
      <DemoEnvironmentBanner roleText={roleLabels[activeRole]} />

      {/* Global Minimal Application Header */}
      <Header
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDemoLogin={() => setIsDemoLoginOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main Workspace Layout with Persistent Collapsible Left Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
          activeRole={activeRole}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto min-h-[calc(100vh-6.5rem)] flex flex-col">
          <div className="flex-1">
            {baseRoute === '/' && (
              <PublicLanding
                onNavigate={handleNavigate}
                onSelectRole={handleSelectRole}
              />
            )}

            {baseRoute === '/chat' && (
              <CustomerChat
                onNavigateToAdvisor={() => handleNavigate('/advisor')}
                onNavigateToProducts={() => handleNavigate('/products')}
              />
            )}

            {baseRoute === '/customer' && (
              <CustomerWorkspace
                onNavigateToChat={() => handleNavigate('/chat')}
                onNavigateToProducts={() => handleNavigate('/products')}
              />
            )}

            {baseRoute === '/advisor' && (
              <AdvisorDashboard
                onNavigateToChat={() => handleNavigate('/chat')}
              />
            )}

            {baseRoute === '/admin' && (
              <AdminDashboard />
            )}

            {baseRoute === '/training' && (
              <TrainingCenter />
            )}

            {baseRoute === '/products' && (
              <ProductExplorer
                onNavigateToChat={() => handleNavigate('/chat')}
              />
            )}
          </div>

          {/* Minimal Footer */}
          <footer className="bg-white border-t border-slate-200 py-3 px-6 text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">AXA AI Insurance Sales Operating System</span>
                <span>•</span>
                <span>Production Sales Demo</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Licensed Advisor: Bishop Orly B. Languisan (+63 968 647 1868)</span>
                <span>•</span>
                <button
                  onClick={() => setIsDemoLoginOpen(true)}
                  className="text-[#00008F] hover:underline font-medium"
                >
                  Change Active Role
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals & Drawers */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={handleNavigate}
      />

      <DemoLoginModal
        isOpen={isDemoLoginOpen}
        onClose={() => setIsDemoLoginOpen(false)}
        onSelectRole={handleSelectRole}
      />
    </div>
  );
}
