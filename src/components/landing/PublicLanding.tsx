import React from 'react';
import {
  Shield,
  MessageSquare,
  UserCheck,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileText,
  Users,
} from 'lucide-react';
import { UserRole } from '../../types';
import { appStore } from '../../services/store';

interface Props {
  onNavigate: (route: string) => void;
  onSelectRole: (role: UserRole, targetRoute: string) => void;
}

export const PublicLanding: React.FC<Props> = ({ onNavigate, onSelectRole }) => {
  const workspaces = [
    {
      role: 'CUSTOMER' as UserRole,
      title: 'Customer AI Assistant',
      subtitle: 'Conversational Needs Discovery & Matcher',
      route: '/chat',
      color: 'border-blue-200 hover:border-[#00008F]',
      badge: 'Public Experience',
      badgeColor: 'bg-blue-100 text-[#00008F]',
      description:
        'Guided discovery for life, health, and savings protection. Progressive profiling without interrogation fatigue, live financial needs analysis (FNA), transparent product suggestions, and one-click advisor booking.',
      features: [
        'AI Disclosure & Consent Gate',
        'Dynamic Financial Needs Analysis (FNA)',
        'Rules-based AXA Product Matching',
        'Instant Consultation Booking',
      ],
      cta: 'Start Customer Chat',
    },
    {
      role: 'ADVISOR' as UserRole,
      title: 'Advisor Sales Cockpit',
      subtitle: 'Customer 360 & Pipeline Intelligence',
      route: '/advisor',
      color: 'border-indigo-200 hover:border-indigo-600',
      badge: 'Sales Operations',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      description:
        'Empowering licensed AXA advisors with AI-generated hand-off briefs, rich lead dossiers, appointment trackers, follow-up automations, and end-to-end simulated underwriting and policy issuance.',
      features: [
        'Real-time Multi-Stage Pipeline',
        'Customer 360 AI Hand-off Dossier',
        'Confidential Operational Notes',
        'Demo Underwriting Stepper',
      ],
      cta: 'Open Advisor Cockpit',
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Admin Product Brain',
      subtitle: 'Knowledge Governance & Guardrails',
      route: '/admin',
      color: 'border-emerald-200 hover:border-emerald-700',
      badge: 'Governance & Rules',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      description:
        'Governing the verified enterprise factsheet repository. Manage AXA product specs, compliance verification workflows, active regulatory guardrails, approved FAQs, and full system audit logs.',
      features: [
        'AXA Product Factsheet Verification',
        'Runtime Compliance Interceptor',
        'Approved Knowledge Base Articles',
        'Immutable System Audit Logs',
      ],
      cta: 'Access Product Brain',
    },
    {
      role: 'AI_TRAINER' as UserRole,
      title: 'AI Training Laboratory',
      subtitle: 'Evaluation, Simulation & Governance',
      route: '/training',
      color: 'border-purple-200 hover:border-purple-700',
      badge: 'Quality & Benchmarking',
      badgeColor: 'bg-purple-100 text-purple-800',
      description:
        'Automated multi-turn customer dialogues with 20 distinct personas. Real-time compliance scoring, failed test root-cause diagnostics, knowledge improvement proposals, and specialist prompt version tracking.',
      features: [
        '20 Diverse Customer Personas',
        'Automated Multi-turn Dialog Simulator',
        'Failed Test Root Cause Diagnostics',
        'Specialist Agent Prompt Registry',
      ],
      cta: 'Launch Training Lab',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Hero Welcome */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#00008F]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AXA ENTERPRISE INSURANCE OPERATING SYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            AI-Assisted Insurance Sales & Advisory Platform
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            A fully governed, multi-role insurance operating system uniting customers, licensed advisors, product governance, and AI quality engineering.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                appStore.setRole('CUSTOMER');
                onNavigate('/chat');
              }}
              className="px-6 py-3 rounded-xl bg-[#00008F] hover:bg-blue-900 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Experience Customer AI Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                appStore.setRole('ADVISOR');
                onNavigate('/advisor');
              }}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-[#00008F]" />
              <span>Advisor Sales Cockpit</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary Operating Roles Grid */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Explore the 4 Integrated Workspaces</h2>
          <p className="text-xs text-slate-500">
            Select any role to test end-to-end data synchronization across the unified reactive store
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.role}
              className={`bg-white rounded-2xl border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${ws.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ws.badgeColor}`}>
                    {ws.badge}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    Role: {ws.role}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{ws.title}</h3>
                <div className="text-xs font-medium text-slate-500 mb-3">{ws.subtitle}</div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{ws.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {ws.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onSelectRole(ws.role, ws.route)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#00008F] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>{ws.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance & Architecture Principles */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Lock className="w-4 h-4 text-[#C91432]" />
            <span>Strict Compliance Guardrails</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Zero fabricated numerical premiums, zero investment guarantees on Unit-Linked (VUL) funds, and mandatory referral to licensed advisors for official illustrations.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <FileText className="w-4 h-4 text-[#00008F]" />
            <span>Official Product Grounding</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Answers are grounded in the verified AXA Product Brain: Health Max, Health Start, FlexiProtect, MyLifeChoice, and Global Health Access.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Human-in-the-Loop Advisory</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            AI assists and qualifies leads into structured Customer 360 briefs; final advice, illustration sign-off, and policy applications remain human-centered.
          </p>
        </div>
      </div>
    </div>
  );
};
