import React, { useState } from 'react';
import {
  User,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  HelpCircle,
  ChevronRight,
  Plus,
  Send,
  Lock,
  DollarSign,
  ArrowRight,
  Info,
  CheckSquare,
  Square,
  MessageSquare,
  Scale,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { advisorService } from '../../services/advisorService';
import { JourneyService } from '../../services/journeyService';
import {
  Advisor,
  AdvisorNote,
  Application,
  Appointment,
  Concern,
  Customer,
  FollowUp,
  Lead,
  SalesStage,
} from '../../types';

interface Props {
  lead: Lead;
  advisor: Advisor;
  onBack: () => void;
  onNavigateToChat?: () => void;
}

type TabType =
  | 'SUMMARY'
  | 'NEEDS'
  | 'FNA'
  | 'PRODUCTS'
  | 'QUESTIONS'
  | 'CONVERSATION'
  | 'APPOINTMENTS'
  | 'ILLUSTRATION'
  | 'APPLICATION'
  | 'FOLLOW-UP'
  | 'ACTIVITY';

export const Customer360: React.FC<Props> = ({
  lead,
  advisor,
  onBack,
  onNavigateToChat,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('SUMMARY');
  const [noteText, setNoteText] = useState('');
  const [noteCategory, setNoteCategory] = useState<AdvisorNote['category']>('Consultation Note');

  // Consultation Checklist state (Section 21)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    goals: true,
    existingCoverage: true,
    budgetCapacity: true,
    protectionPriorities: true,
    timeHorizon: true,
    risksExplained: false,
    limitationsDiscussed: false,
    questionsAnswered: true,
    outstandingRecorded: true,
    understandsNextStep: false,
    disclosureCompleted: true,
  });

  // Illustration gate state (Section 29)
  const [illustrationRequested, setIllustrationRequested] = useState(false);
  const [illustrationAcknowledged, setIllustrationAcknowledged] = useState(false);

  // Application gate state (Section 30)
  const [applicationUnlocked, setApplicationUnlocked] = useState(false);

  // Retrieve customer profile from store
  const state = appStore.getState();
  const customer = state.customers.find((c) => c.id === lead.customerId);
  const profile = customer?.needsProfile;
  const fna = customer?.fnaResult;
  const chatMessages = state.chatMessages.filter((m) => m.conversationId === 'conv-101');
  const appointments = state.appointments.filter((a) => a.customerId === lead.customerId);
  const followUps = state.followUps.filter((f) => f.customerId === lead.customerId);
  const customerNotes = state.advisorNotes.filter((n) => n.leadId === lead.id || n.customerId === customer?.id);

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allMandatoryChecklistSatisfied = Object.values(checklist).every(Boolean);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    appStore.addAdvisorNote({
      leadId: lead.id,
      customerId: customer?.id || lead.customerId,
      advisorId: advisor.id,
      advisorName: advisor.fullName,
      text: noteText.trim(),
      category: noteCategory,
      visibility: 'INTERNAL',
    });
    setNoteText('');
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'SUMMARY', label: 'Executive Summary' },
    { id: 'NEEDS', label: 'Needs Profile' },
    { id: 'FNA', label: 'FNA Gap' },
    { id: 'PRODUCTS', label: 'Products & Discussion' },
    { id: 'QUESTIONS', label: 'Concerns & Questions' },
    { id: 'CONVERSATION', label: 'AI Conversation', count: chatMessages.length },
    { id: 'APPOINTMENTS', label: 'Appointments', count: appointments.length },
    { id: 'ILLUSTRATION', label: 'Official Illustration' },
    { id: 'APPLICATION', label: 'Application Gate' },
    { id: 'FOLLOW-UP', label: 'Follow-Ups', count: followUps.length },
    { id: 'ACTIVITY', label: 'Audit Timeline' },
  ];

  return (
    <div className="space-y-4">
      {/* Header bar: Customer Name, Stage, Primary Need, Assigned Advisor, Next Operational Action */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-semibold"
            >
              ← Back to Dashboard
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#00008F] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {lead.customerName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">{lead.customerName}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#00008F]">
                  {lead.currentStage}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Lead ID: <strong className="font-mono text-slate-700">{lead.id}</strong> • Primary Need:{' '}
                <strong className="text-[#00008F]">{lead.primaryNeed}</strong>
              </p>
            </div>
          </div>

          {/* Direct Advisor Actions */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.customerPhone || '+639171234567'}`}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Customer</span>
            </a>

            <button
              onClick={() => setActiveTab('ILLUSTRATION')}
              className="px-3 py-1.5 rounded-lg bg-[#00008F] hover:bg-blue-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Illustration Gate</span>
            </button>
          </div>
        </div>

        {/* Operational Next Action Banner (Section 18 & 34) */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00008F] shrink-0" />
            <span className="text-slate-600">Recommended Operational Next Action:</span>
            <strong className="text-blue-950">
              {lead.currentStage === 'ADVISOR_READY'
                ? 'Review customer case summary and confirm scheduled consultation.'
                : 'Confirm customer understanding of critical illness coverage and prepare official illustration.'}
            </strong>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Assigned Advisor: <strong>{advisor.fullName}</strong>
          </span>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 border-b border-slate-200 pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#00008F] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        {/* 1. EXECUTIVE SUMMARY (Section 18) */}
        {activeTab === 'SUMMARY' && (
          <div className="space-y-5">
            {/* Top Grid Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Primary Need</span>
                <span className="font-bold text-[#00008F] text-sm truncate block mt-0.5">
                  {lead.primaryNeed}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Dependents</span>
                <span className="font-bold text-slate-800 text-sm block mt-0.5">
                  {profile?.dependentsCount ?? 2} children
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Existing Coverage</span>
                <span className="font-bold text-slate-800 text-sm truncate block mt-0.5">
                  {profile?.existingHMO || '₱150,000 HMO'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Monthly Budget</span>
                <span className="font-bold text-slate-800 text-sm truncate block mt-0.5">
                  {profile?.monthlyBudget || lead.estimatedBudget || '₱6,000–₱10,000'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs col-span-2 sm:col-span-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Readiness Status</span>
                <span className="font-bold text-emerald-700 text-sm block mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Advisor Ready
                </span>
              </div>
            </div>

            {/* AI Conversation Summary (Section 18) */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-[#00008F]" />
                AI Conversation & Case Summary
              </div>
              <p className="text-slate-700 leading-relaxed">
                Maria Santos explored <strong>AXA Health Max</strong> and <strong>AXA Health Start</strong> to bridge the gap left by her employer's ₱150,000 HMO limit. She is concerned about long-term affordability and whether premiums are guaranteed. An appointment has been requested with licensed advisor Bishop Orly B. Languisan.
              </p>
            </div>

            {/* Unresolved Questions & Concerns */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                Top Identified Customer Questions & Concerns
              </div>
              <div className="space-y-1.5">
                {(lead.customerConcerns?.length ? lead.customerConcerns : ['Affordability / long-term commitment', 'HMO duplication vs cash payout']).map((c, i) => (
                  <div key={i} className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                    <span className="text-slate-800 font-medium">{c}</span>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      Action Required in Consultation
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Process Health Indicators (Section 57) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-900 text-xs">Sales Process Health Indicators:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Needs Profile: <strong>Complete</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>FNA Gap: <strong>Complete</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Product Education: <strong>Complete</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Illustration: <strong>Pending Review</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. NEEDS PROFILE */}
        {activeTab === 'NEEDS' && profile && (
          <div className="space-y-4 text-xs">
            <div className="font-bold text-slate-900 text-sm">Customer Stated Needs Profile</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Age Range</span>
                <strong className="text-slate-800">{profile.ageRange}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Dependents</span>
                <strong className="text-slate-800">{profile.dependentsCount}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Occupation</span>
                <strong className="text-slate-800">{profile.occupation}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Primary Protection Need</span>
                <strong className="text-[#00008F]">{profile.primaryNeed}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Existing HMO</span>
                <strong className="text-slate-800">{profile.existingHMO}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Monthly Budget</span>
                <strong className="text-slate-800">{profile.monthlyBudget}</strong>
              </div>
            </div>
          </div>
        )}

        {/* 3. FNA GAP */}
        {activeTab === 'FNA' && (
          <div className="space-y-4 text-xs">
            <div className="font-bold text-slate-900 text-sm">Financial Needs Analysis (FNA) Findings</div>
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950">Recommended Protection Target:</span>
                <span className="text-lg font-bold text-[#00008F]">₱2,000,000</span>
              </div>
              <p className="text-slate-600">
                Calibrated against 24 months of household living expenses (₱60,000/month) plus medical recovery buffer minus existing ₱150,000 employer HMO card.
              </p>
            </div>
          </div>
        )}

        {/* 4. PRODUCTS & DISCUSSION */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-4 text-xs">
            <div className="font-bold text-slate-900 text-sm">Products Explored & Discussed</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">AXA Health Max</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    VERIFIED
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Comprehensive coverage for 56 major critical illnesses up to age 100 with guaranteed cash benefits.
                </p>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  Discussion point: Emphasize fixed 10 or 20-pay payment terms to resolve affordability concerns.
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">AXA Health Start</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    VERIFIED
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Starter critical illness plan covering cancer, heart attack, and stroke with child protection rider.
                </p>
                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                  Discussion point: Alternative budget option if customer prefers lower monthly commitment.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. QUESTIONS & CONCERNS */}
        {activeTab === 'QUESTIONS' && (
          <div className="space-y-4 text-xs">
            <div className="font-bold text-slate-900 text-sm">Concern Management (Section 23)</div>
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Category: Affordability & Budget Change</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Follow-Up Required
                  </span>
                </div>
                <p className="text-slate-600">
                  <strong>Customer Statement: </strong> "What if my financial situation changes in 5 years?"
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                  <strong>Verified Advisor Response: </strong> Health Max includes guaranteed cash values, policy loan privileges, and paid-up options if payment capacity shifts.
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Category: Existing HMO Overlap</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Addressed by AI
                  </span>
                </div>
                <p className="text-slate-600">
                  <strong>Customer Statement: </strong> "Why do I need this when I have a company HMO?"
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                  <strong>Verified Advisor Response: </strong> HMO pays hospital bills directly up to ₱150,000 only. Health Max pays lump-sum cash directly to you for living costs, recovery, and treatments outside HMO networks.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. CONVERSATION */}
        {activeTab === 'CONVERSATION' && (
          <div className="space-y-3 text-xs max-h-96 overflow-y-auto pr-1">
            <div className="font-bold text-slate-900 text-sm">Customer & AI Assistant Transcripts</div>
            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-xl border ${
                  m.sender === 'customer'
                    ? 'bg-blue-50/60 border-blue-200 text-blue-950 ml-6'
                    : 'bg-slate-50 border-slate-200 text-slate-800 mr-6'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold capitalize">{m.sender}</span>
                  <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* 7. APPOINTMENTS & CONSULTATION WORKSPACE (Sections 20 & 21) */}
        {activeTab === 'APPOINTMENTS' && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 text-sm">Advisor Consultation & Checklist (Section 20 & 21)</div>
              <span className="text-[11px] text-slate-500 font-mono">
                Advisor: {advisor.fullName}
              </span>
            </div>

            {/* Mandatory Advisor Question Checklist (Section 21) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#00008F]" />
                  Pre-Illustration Mandatory Compliance Checklist
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  allMandatoryChecklistSatisfied ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {allMandatoryChecklistSatisfied ? 'All Items Verified' : 'Checklist Incomplete'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries({
                  goals: 'Customer protection goals confirmed',
                  existingCoverage: 'Existing HMO & insurance reviewed',
                  budgetCapacity: 'Budget & payment capacity confirmed',
                  protectionPriorities: 'Protection priorities confirmed',
                  timeHorizon: 'Time horizon discussed',
                  risksExplained: 'Relevant risks & charges explained',
                  limitationsDiscussed: 'Material policy limitations disclosed',
                  questionsAnswered: 'Customer questions addressed',
                  outstandingRecorded: 'Outstanding items noted',
                  understandsNextStep: 'Customer understands next step',
                  disclosureCompleted: 'Required sales disclosure completed',
                }).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChecklistItem(key)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 text-left hover:bg-blue-50/50 transition-colors"
                  >
                    {checklist[key] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span className={checklist[key] ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Consultation Notes Form */}
            <form onSubmit={handleSaveNote} className="space-y-3">
              <div className="font-bold text-slate-900">Record Consultation Notes:</div>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Record topics discussed, customer preferences, and agreed next steps..."
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#00008F] focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <select
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value as any)}
                  className="border border-slate-300 rounded-lg p-1.5 text-xs"
                >
                  <option>Consultation Note</option>
                  <option>Customer-Facing Summary</option>
                  <option>Follow-Up Note</option>
                  <option>Application Note</option>
                </select>
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="px-4 py-2 bg-[#00008F] hover:bg-blue-900 disabled:bg-slate-300 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Save Consultation Note
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 8. OFFICIAL ILLUSTRATION GATE (Section 29) */}
        {activeTab === 'ILLUSTRATION' && (
          <div className="space-y-4 text-xs">
            <div className="font-bold text-slate-900 text-sm">Official Illustration Gate (Section 29)</div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Lock className="w-4 h-4" />
                Insurance Regulatory Gating Rule
              </div>
              <p className="text-amber-800 leading-relaxed">
                The AI demo does not invent official premium figures. Official illustrations must be generated through AXA's authorized actuarial illustration engine and reviewed by licensed advisor <strong>{advisor.fullName}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Illustration Status:</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  illustrationAcknowledged
                    ? 'bg-emerald-100 text-emerald-800'
                    : illustrationRequested
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {illustrationAcknowledged
                    ? 'ACKNOWLEDGED BY CUSTOMER'
                    : illustrationRequested
                    ? 'SIMULATED / OFFICIAL SYSTEM NOT CONNECTED'
                    : 'NOT REQUESTED'}
                </span>
              </div>

              <div className="space-y-1 text-slate-600 text-[11px]">
                <div>Product: <strong>AXA Health Max (20-Pay)</strong></div>
                <div>Coverage Amount: <strong>₱2,000,000</strong></div>
                <div>Customer Name: <strong>{lead.customerName}</strong></div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                {!illustrationRequested ? (
                  <button
                    onClick={() => setIllustrationRequested(true)}
                    className="px-4 py-2 bg-[#00008F] hover:bg-blue-900 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Request Official Illustration (Demo)
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIllustrationAcknowledged(true);
                      setApplicationUnlocked(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Record Customer Review & Acknowledgement
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 9. APPLICATION GATE (Section 30 & 31) */}
        {activeTab === 'APPLICATION' && (
          <div className="space-y-4 text-xs">
            <div className="font-bold text-slate-900 text-sm">Application Readiness Gate (Section 30)</div>

            {!applicationUnlocked ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Lock className="w-4 h-4" />
                  APPLICATION LOCKED
                </div>
                <p className="text-[11px] text-amber-800">
                  Before application unlocks, the following prerequisites must be verified:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-900">
                  <li>Advisor consultation conducted by Bishop Orly B. Languisan</li>
                  <li>Official illustration reviewed and acknowledged</li>
                  <li>Customer explicitly chose to proceed</li>
                </ul>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    APPLICATION UNLOCKED (Demo Workflow)
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    READY FOR SUBMISSION
                  </span>
                </div>
                <p className="text-slate-700 text-[11px]">
                  All compliance gates and illustration acknowledgements have been satisfied.
                </p>
                <button
                  onClick={() => {
                    alert('Application simulation submitted for Underwriting review.');
                  }}
                  className="px-4 py-2 bg-[#00008F] hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  Submit Demo Application for Underwriting
                </button>
              </div>
            )}
          </div>
        )}

        {/* 10. FOLLOW-UP */}
        {activeTab === 'FOLLOW-UP' && (
          <div className="space-y-4 text-xs">
            <div className="font-bold text-slate-900 text-sm">Customer Follow-Ups & Callbacks</div>
            <div className="space-y-2">
              {followUps.map((f) => (
                <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{f.type}</div>
                    <div className="text-[11px] text-slate-500">{f.notes}</div>
                    <div className="text-[10px] text-slate-400">Due: {f.dueDate} • Via {f.channel}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. AUDIT TIMELINE */}
        {activeTab === 'ACTIVITY' && (
          <div className="space-y-3 text-xs">
            <div className="font-bold text-slate-900 text-sm">Unified Communication & Audit History</div>
            <div className="space-y-2">
              {customerNotes.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold text-blue-900">{n.category}</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-800">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
