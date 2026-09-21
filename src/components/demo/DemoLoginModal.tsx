import React from 'react';
import { User, ShieldCheck, Briefcase, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { appStore } from '../../services/store';
import { UserRole } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: UserRole, targetRoute: string) => void;
}

export const DemoLoginModal: React.FC<Props> = ({ isOpen, onClose, onSelectRole }) => {
  if (!isOpen) return null;

  const roles = [
    {
      role: 'CUSTOMER' as UserRole,
      title: 'Customer Workspace',
      name: 'Maria Santos',
      subtitle: 'Marketing Director, Married with 2 children',
      route: '/chat',
      icon: <User className="w-5 h-5 text-blue-600" />,
      badgeColor: 'bg-blue-100 text-blue-800',
      description:
        'Test the public conversational assistant. Go through AI disclosure, select financial needs, complete progressive profiling, generate Demo FNA, explore matched products, test objection handling, and request an advisor.',
      keyFeatures: ['Conversational Needs Discovery', 'Live Need Profile & Demo FNA', 'Rules-Based Product Matching', 'Advisor Handoff & Booking'],
    },
    {
      role: 'ADVISOR' as UserRole,
      title: 'Advisor Dashboard',
      name: 'Carlos Mendoza',
      subtitle: 'Senior Wealth & Protection Advisor (AXA-LIC-77402)',
      route: '/advisor',
      icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
      badgeColor: 'bg-indigo-100 text-indigo-800',
      description:
        'Operate the advisor sales cockpit. Review warm leads handed off from AI, examine Customer 360 dossiers with generated summaries, manage appointments, add notes, and trigger simulated applications and policy issuances.',
      keyFeatures: ['Lead Pipeline Management', 'Customer 360 & AI Hand-off Brief', 'Consultation & Note Tracker', 'Demo Underwriting Stepper'],
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Administration & Product Brain',
      name: 'Elena Ramos',
      subtitle: 'Head of Digital Distribution & Compliance',
      route: '/admin',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      badgeColor: 'bg-emerald-100 text-emerald-800',
      description:
        'Govern the enterprise knowledge repository. Manage official AXA product specifications, verify product facts, review compliance rules, manage FAQs, inspect system-wide audit logs, and monitor conversion funnels.',
      keyFeatures: ['AXA Product Catalog & Verification', 'Compliance Guardrail Engine', 'Approved FAQs & Restricted Claims', 'End-to-end System Audit Trail'],
    },
    {
      role: 'AI_TRAINER' as UserRole,
      title: 'AI Training Laboratory',
      name: 'Dr. Arthur Chen',
      subtitle: 'Lead AI Knowledge & Quality Engineer',
      route: '/training',
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      badgeColor: 'bg-purple-100 text-purple-800',
      description:
        'Simulate multi-turn customer dialogues with 20 distinct fictional personas. Evaluate conversation compliance against strict insurance regulations, review failed tests, propose knowledge improvements, and audit prompt versions.',
      keyFeatures: ['Interactive Multi-Agent Simulator', 'Automated Compliance Scorecard', 'Failed Test Root Cause Analysis', 'Prompt Version Governance'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00008F]">
                AXA Role-Based Demo Access
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                Phase 1 Development Mode
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Select an Operating Role to Experience</h2>
            <p className="text-xs text-slate-500 mt-1">
              All 4 workspaces operate on the same unified real-time repository. Changes made in one workspace immediately update the others.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>

        {/* Roles Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((item) => (
            <div
              key={item.role}
              onClick={() => {
                appStore.setRole(item.role);
                onSelectRole(item.role, item.route);
                onClose();
              }}
              className="p-5 rounded-xl border border-slate-200 hover:border-[#00008F] hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-blue-50 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#00008F] transition-colors">
                        {item.title}
                      </h3>
                      <div className="text-xs text-slate-500 font-medium">
                        {item.name}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badgeColor}`}>
                    {item.role}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {item.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#00008F] group-hover:translate-x-0.5 transition-transform">
                <span>Enter as {item.name.split(' ')[0]}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Authentication is architectured for direct migration to Firebase Authentication.</span>
          <span className="font-medium text-slate-700">AXA Philippines Prototype</span>
        </div>
      </div>
    </div>
  );
};
