import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Shield,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  Clock,
  ArrowRight,
  HelpCircle,
  FileText,
  User,
  HeartHandshake,
  DollarSign,
  ChevronRight,
  Edit3,
  X,
  Phone,
  Scale,
  Lock,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { AIOrchestrator } from '../../agents/orchestrator';
import { advisorService } from '../../services/advisorService';
import { JourneyService, JourneyStage } from '../../services/journeyService';
import { SafeMarkdown } from '../common/SafeMarkdown';
import { JourneyProgress } from '../common/JourneyProgress';
import { ScheduleAppointmentModal } from '../common/ScheduleAppointmentModal';
import { RequestCallbackModal } from '../common/RequestCallbackModal';
import {
  AdvisorCaseSummary,
  FinancialNeedsAnalysis,
  Message,
  NeedsProfile,
  ProductMatch,
} from '../../types';

interface Props {
  onNavigateToAdvisor?: () => void;
  onNavigateToProducts?: () => void;
}

export const CustomerChat: React.FC<Props> = ({ onNavigateToAdvisor, onNavigateToProducts }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  // Current Customer profile, FNA & Journey state
  const [currentLead, setCurrentLead] = useState(appStore.getActiveLead());
  const [needsProfile, setNeedsProfile] = useState<NeedsProfile | undefined>(
    appStore.getState().customers.find((c) => c.id === 'cust-1')?.needsProfile
  );
  const [fnaResult, setFnaResult] = useState<FinancialNeedsAnalysis | undefined>(
    appStore.getState().customers.find((c) => c.id === 'cust-1')?.fnaResult
  );
  const [matchedProducts, setMatchedProducts] = useState<ProductMatch[]>([]);
  const [advisorSummary, setAdvisorSummary] = useState<AdvisorCaseSummary | undefined>(
    appStore.getState().activeAdvisorSummary
  );
  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const state = appStore.getState();
      setMessages(state.chatMessages);
      setCurrentLead(appStore.getActiveLead());
      const cust = state.customers.find((c) => c.id === 'cust-1');
      if (cust?.needsProfile) setNeedsProfile(cust.needsProfile);
      if (cust?.fnaResult) setFnaResult(cust.fnaResult);
      if (state.activeAdvisorSummary) setAdvisorSummary(state.activeAdvisorSummary);
      setJourneyStages(JourneyService.getJourney('cust-1'));
    };
    update();
    const unsub = appStore.subscribe(update);
    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const primaryNeedsList = [
    'Critical Illness',
    'Health & Medical',
    'Protect My Family',
    'Children\'s Education',
    'Retirement',
    'Savings & Investment',
    'Estate Planning',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;
    setInput('');
    setShowGoalPicker(false);

    // Add customer message
    const userMsg = appStore.addChatMessage({
      conversationId: 'conv-101',
      sender: 'customer',
      text,
    });

    setIsTyping(true);

    try {
      let replyText = '';
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            stage: currentLead?.currentStage || 'NEEDS_DISCOVERY',
            primaryNeed: needsProfile?.primaryNeed || 'Critical Illness',
            customerProfile: needsProfile,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.reply) {
            replyText = data.reply;
          }
        }
      } catch {
        // Fallback gracefully
      }

      const output = await AIOrchestrator.processTurn({
        leadId: currentLead?.id || 'lead-101',
        customerId: 'cust-1',
        customerName: 'Maria Santos',
        stage: currentLead?.currentStage || 'NEEDS_DISCOVERY',
        needsProfile,
        lastUserMessage: text,
        conversationHistory: [...messages, userMsg],
      });

      if (output.fnaResult) setFnaResult(output.fnaResult);
      if (output.matchedProducts?.length) setMatchedProducts(output.matchedProducts);
      if (output.advisorSummary) setAdvisorSummary(output.advisorSummary);

      // Add AI reply message with compliance check
      const rawText = replyText || output.response;
      const compliance = AIOrchestrator.runComplianceCheck(rawText);
      const combinedFlags = Array.from(new Set([...(output.complianceFlags || []), ...compliance.flags]));

      appStore.addChatMessage({
        conversationId: 'conv-101',
        sender: 'ai',
        agentType: output.agent,
        text: compliance.cleanedText,
        suggestedActions: output.suggestedActions,
        complianceFlags: combinedFlags,
      });
    } finally {
      setIsTyping(false);
      setJourneyStages(JourneyService.getJourney('cust-1'));
    }
  };

  const handleActionClick = (action: string, payload?: unknown) => {
    if (action === 'SELECT_NEED') {
      handleSendMessage(`I would like to focus on ${payload}`);
    } else if (action === 'CALL_ADVISOR') {
      const advisor = advisorService.getPrimaryAdvisor();
      window.location.href = advisorService.formatTelUri(advisor.mobilePhone || '+639686471868');
    } else if (action === 'REQUEST_CALLBACK') {
      setShowCallbackModal(true);
    } else if (action === 'BOOK_APPOINTMENT') {
      setShowAppointmentModal(true);
    } else if (action === 'VIEW_SUMMARY') {
      setShowSummaryModal(true);
    } else if (action === 'VIEW_PRODUCT' || action === 'COMPARE_PRODUCTS') {
      if (onNavigateToProducts) onNavigateToProducts();
    } else {
      handleSendMessage(typeof payload === 'string' ? payload : action);
    }
  };

  // Primary Advisor Info (Centralized)
  const primaryAdvisor = advisorService.getPrimaryAdvisor();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Journey Breadcrumb & Stage Indicator */}
      <div className="bg-white rounded-t-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00008F] flex items-center justify-center text-white font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">AXA AI Assistant</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#00008F] border border-blue-200">
                Verified Brain
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Personalized protection discovery with licensed advisor oversight
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowTrustModal(true)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium transition-colors"
            title="View why you are seeing these recommendations"
          >
            <Info className="w-3.5 h-3.5 text-[#00008F]" />
            <span className="hidden sm:inline">Why you're seeing this</span>
          </button>

          <button
            onClick={() => setShowAppointmentModal(true)}
            className="px-3 py-1 rounded-lg bg-[#00008F] text-white font-semibold hover:bg-blue-900 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Consult Advisor</span>
          </button>
        </div>
      </div>

      {/* Main Screen: Center Chat (68-72%) and Right Stage Context (28-32%) */}
      <div className="flex-1 bg-slate-50 border-x border-slate-200 overflow-hidden flex flex-col md:flex-row">
        {/* CENTER: Primary Conversation Workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {/* AI Disclosure Notice (Minimal & Friendly) */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#00008F] shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] leading-relaxed">
                <span>
                  <strong>Interactive Exploration Sandbox: </strong>
                  Conversations are grounded in verified AXA product knowledge. Official illustrations and underwriting decisions require review by licensed advisor <strong>{primaryAdvisor.fullName}</strong>.
                </span>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="ml-2 font-semibold text-[#00008F] underline hover:text-blue-800"
                >
                  Privacy & Consent
                </button>
              </div>
            </div>

            {/* Stream of Chat Messages */}
            {messages.map((m) => {
              const isCustomer = m.sender === 'customer';
              const isSystem = m.sender === 'system';

              if (isSystem) {
                return (
                  <div key={m.id} className="flex justify-center my-2">
                    <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{m.text}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isCustomer ? 'justify-end' : 'justify-start'}`}
                >
                  {!isCustomer && (
                    <div className="w-7 h-7 rounded-full bg-[#00008F] flex items-center justify-center text-white shrink-0 text-[10px] font-bold shadow-xs">
                      AXA
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isCustomer
                        ? 'bg-[#00008F] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {!isCustomer && (
                      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          AXA AI Assistant
                        </span>
                        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                          Verified
                        </span>
                      </div>
                    )}

                    {/* Safe Markdown Renderer (Zero raw asterisks!) */}
                    <SafeMarkdown content={m.text} />

                    {/* Compliance Notes if triggered */}
                    {m.complianceFlags && m.complianceFlags.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-amber-800 font-medium">
                        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Compliance notice: {m.complianceFlags.join(', ')}</span>
                      </div>
                    )}

                    {/* Contextual Action Chips (if non-advisor) */}
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {m.suggestedActions
                          .filter((a) => a.action !== 'CALL_ADVISOR' && a.action !== 'REQUEST_CALLBACK' && a.action !== 'BOOK_APPOINTMENT')
                          .map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(action.action, action.payload)}
                              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#00008F] border border-slate-200 text-[11px] text-slate-700 font-medium transition-colors flex items-center gap-1"
                            >
                              <span>{action.label}</span>
                              <ChevronRight className="w-3 h-3 text-slate-400" />
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Single Clean Next Action Card if advisor recommended (Section 8 & 9) */}
                    {!isCustomer &&
                      (m.suggestedActions?.some((a) => a.action === 'CALL_ADVISOR' || a.action === 'BOOK_APPOINTMENT') ||
                        m.agentType === 'IllustrationAssistantAgent') && (
                        <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                              Next Step: Speak with your advisor
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              Available
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{primaryAdvisor.fullName}</h4>
                              <p className="text-[11px] text-slate-600">
                                Licensed Insurance Advisor • {primaryAdvisor.licenseNumber}
                              </p>
                            </div>
                            <a
                              href={`tel:${primaryAdvisor.mobilePhone}`}
                              className="text-[11px] text-[#00008F] hover:underline font-semibold flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{primaryAdvisor.mobilePhone}</span>
                            </a>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-200/60">
                            <button
                              onClick={() => setShowAppointmentModal(true)}
                              className="px-3 py-1.5 rounded-lg bg-[#00008F] hover:bg-blue-900 text-white text-xs font-semibold shadow-xs transition-colors"
                            >
                              Schedule Consultation
                            </button>
                            <button
                              onClick={() => setShowCallbackModal(true)}
                              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                            >
                              Request Callback
                            </button>
                            <button
                              onClick={() => setShowSummaryModal(true)}
                              className="text-[11px] text-[#00008F] hover:underline font-medium ml-auto"
                            >
                              View Case Summary →
                            </button>
                          </div>
                        </div>
                      )}
                  </div>

                  {isCustomer && (
                    <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 shrink-0 text-[10px] font-bold">
                      MS
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#00008F] flex items-center justify-center text-white shrink-0 text-[10px] font-bold">
                  AXA
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Goal Bar & Composer at Bottom (Sections 10 & 11) */}
          <div className="bg-white border-t border-slate-200 p-3 space-y-2">
            {/* Contextual Goal Toggle (Replaces permanent 13-button row) */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Current Goal:</span>
                <span className="font-bold text-[#00008F] bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                  {needsProfile?.primaryNeed || 'Critical Illness Protection'}
                </span>
                <button
                  onClick={() => setShowGoalPicker(!showGoalPicker)}
                  className="text-[11px] text-blue-700 hover:underline font-medium"
                >
                  {showGoalPicker ? 'Hide Options' : 'Change Goal'}
                </button>
              </div>

              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Shift+Enter for newline • Enter to send
              </span>
            </div>

            {/* Collapsible selection chips (only shown when requested) */}
            {showGoalPicker && (
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 animate-in fade-in duration-100">
                {primaryNeedsList.map((need) => (
                  <button
                    key={need}
                    onClick={() => {
                      appStore.updateNeedsProfile('cust-1', { primaryNeed: need });
                      handleSendMessage(`I would like to explore options for ${need}`);
                    }}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                      needsProfile?.primaryNeed === need
                        ? 'bg-[#00008F] text-white border-[#00008F]'
                        : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {need}
                  </button>
                ))}
              </div>
            )}

            {/* Clean Message Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask a question about your needs or insurance options..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:bg-white resize-none max-h-24"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-3.5 py-2 rounded-xl bg-[#00008F] hover:bg-blue-900 disabled:bg-slate-300 text-white font-semibold transition-colors flex items-center gap-1.5 text-xs sm:text-sm shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Stage-Relevant Context Panel (28-32%) */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-3.5 overflow-y-auto space-y-3.5">
          {/* 1. Guided Journey Progress (12 Steps) */}
          <JourneyProgress
            stages={journeyStages}
            onOpenAdvisorModal={() => setShowAppointmentModal(true)}
          />

          {/* 2. Needs Profile Summary (During Discovery) */}
          {needsProfile && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00008F]" />
                  Needs Profile Summary
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {needsProfile.isComplete ? 'COMPLETE' : 'IN PROGRESS'}
                </span>
              </div>

              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Primary Goal:</span>
                  <span className="font-bold text-[#00008F]">{needsProfile.primaryNeed}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Age Bracket:</span>
                  <span className="font-medium text-slate-800">{needsProfile.ageRange}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Dependents:</span>
                  <span className="font-medium text-slate-800">{needsProfile.dependentsCount}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Existing HMO:</span>
                  <span className="font-medium text-slate-800">{needsProfile.existingHMO}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Budget Range:</span>
                  <span className="font-medium text-slate-800">{needsProfile.monthlyBudget}</span>
                </div>
              </div>

              <button
                onClick={() => setShowEditProfileModal(true)}
                className="w-full py-1 rounded bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors text-center text-[11px]"
              >
                Review / Edit Profile
              </button>
            </div>
          )}

          {/* 3. Candidate Solutions (when explored) */}
          {matchedProducts.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Products Being Discussed</span>
                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Facts
                </span>
              </div>

              {matchedProducts.map((match) => (
                <div
                  key={match.product.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#00008F] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{match.product.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {match.verificationStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-1.5">{match.product.shortDescription}</p>
                  <div className="p-2 bg-slate-50 rounded text-[10px] text-slate-600 space-y-1">
                    <div>
                      <strong className="text-slate-700">Why Matched: </strong>
                      {match.whyItAppeared}
                    </div>
                    <div>
                      <strong className="text-slate-700">Important Note: </strong>
                      {match.importantConsiderations}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 4. Designated Advisor Contact Card (Centralized) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Your Designated Advisor
            </span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#00008F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                BL
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{primaryAdvisor.fullName}</h4>
                <p className="text-[11px] text-slate-500">Licensed Insurance Advisor</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 space-y-0.5">
              <div>Mobile: <strong className="text-slate-800">{primaryAdvisor.mobilePhone}</strong></div>
              <div>Status: <span className="text-emerald-600 font-semibold">Available for Consultation</span></div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="py-1.5 px-2 bg-[#00008F] text-white text-[11px] font-semibold rounded-lg hover:bg-blue-900 transition-colors text-center"
              >
                Schedule
              </button>
              <button
                onClick={() => setShowCallbackModal(true)}
                className="py-1.5 px-2 bg-white border border-slate-300 text-slate-700 text-[11px] font-semibold rounded-lg hover:bg-slate-50 transition-colors text-center"
              >
                Callback
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* 1. Customer Trust Panel Modal (Section 58) */}
      {showTrustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-5 space-y-3.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Shield className="w-4 h-4 text-[#00008F]" />
                Why You're Seeing This (Customer Trust Panel)
              </div>
              <button onClick={() => setShowTrustModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 max-h-80 overflow-y-auto pr-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-800 block text-[11px]">1. Your Stated Needs:</strong>
                <p>
                  You indicated a focus on <strong>{needsProfile?.primaryNeed || 'Critical Illness'}</strong> with a budget of <strong>{needsProfile?.monthlyBudget}</strong> and {needsProfile?.dependentsCount} dependent(s).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-800 block text-[11px]">2. Information & Sources Used:</strong>
                <p>
                  Product recommendations reference verified AXA Product Brain fact sheets (AXA Health Max, Health Start, FlexiProtect) verified under Insurance Commission guidelines.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-800 block text-[11px]">3. Licensed Advisor Oversight:</strong>
                <p>
                  No policy is ever issued without human review. Your assigned advisor is <strong>{primaryAdvisor.fullName}</strong> (+63 968 647 1868).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <strong className="text-slate-800 block text-[11px]">4. Consent & Data Choices:</strong>
                <p>
                  You have consented to interactive exploration. You may review, edit, or clear your profile at any time.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowTrustModal(false)}
                className="px-4 py-2 bg-[#00008F] text-white rounded-xl text-xs font-semibold hover:bg-blue-900"
              >
                Close Trust Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI Disclosure & Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Shield className="w-4 h-4 text-[#00008F]" />
                AI Disclosure & Data Privacy Principles
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed max-h-80 overflow-y-auto">
              <p>
                <strong>1. Development & Simulation Environment:</strong> This AI insurance assistant is operating in an interactive demo mode. All quotations, underwriting approvals, and policy numbers are simulations.
              </p>
              <p>
                <strong>2. Data Protection:</strong> We do not store or transmit payment credentials, passwords, or government identification numbers in this chat. For your privacy, do not disclose sensitive health records or credit card numbers.
              </p>
              <p>
                <strong>3. Human Advisory Oversight:</strong> The AI provides educational guidance based on verified AXA knowledge. Licensed AXA financial planners verify all suitability criteria and official illustrations before any contractual commitment.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-[#00008F] text-white rounded-xl text-xs font-semibold hover:bg-blue-900"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />

      {/* 4. Request Callback Modal */}
      <RequestCallbackModal
        isOpen={showCallbackModal}
        onClose={() => setShowCallbackModal(false)}
      />

      {/* 5. Advisor Case Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-5 space-y-3.5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#00008F]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Advisor Case Summary (AI Hand-off)</h3>
                  <p className="text-[11px] text-slate-500">Brief transmitted to Bishop Orly B. Languisan</p>
                </div>
              </div>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs text-slate-700 pr-1">
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">Prospect: </span>
                  <strong className="text-slate-900">{advisorSummary?.customerAlias || 'Maria Santos'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Lead ID: </span>
                  <strong className="font-mono text-slate-900">{advisorSummary?.leadId || currentLead?.id}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Primary Goal: </span>
                  <strong className="text-[#00008F]">{advisorSummary?.primaryNeed || 'Critical Illness'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Budget Range: </span>
                  <strong className="text-slate-900">{advisorSummary?.budgetRange || '₱6,000–₱10,000 / mo'}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Needs Profile Dossier:</div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
                  {advisorSummary?.needsProfileSummary || 'Age 35–40, Marketing Director, 2 dependents. Employer HMO covers ₱150,000 only.'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Financial Needs Analysis (FNA) Findings:</div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
                  {advisorSummary?.fnaPrioritySummary || 'High Critical Illness priority due to mortgage and dependent family living costs.'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Products Explored:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(advisorSummary?.productsExplored || ['AXA Health Max', 'AXA Health Start', 'AXA FlexiProtect']).map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#00008F] font-semibold text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Suggested Next Operational Action:</div>
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 font-medium">
                  {advisorSummary?.suggestedNextOperationalAction || 'Prepare official Health Max 20-pay illustration and present HMO living-cost comparison.'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {onNavigateToAdvisor && (
                <button
                  onClick={() => {
                    setShowSummaryModal(false);
                    onNavigateToAdvisor();
                  }}
                  className="px-3 py-1.5 bg-[#00008F] text-white rounded-lg text-xs font-bold hover:bg-blue-900 flex items-center gap-1.5"
                >
                  <span>Open Advisor Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Edit Profile Modal */}
      {showEditProfileModal && needsProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Edit Needs Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Protection Goal</label>
                <select
                  value={needsProfile.primaryNeed}
                  onChange={(e) => {
                    const newNeed = e.target.value;
                    appStore.updateNeedsProfile('cust-1', { primaryNeed: newNeed });
                    setNeedsProfile({ ...needsProfile, primaryNeed: newNeed });
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  {primaryNeedsList.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age Range</label>
                  <select
                    value={needsProfile.ageRange}
                    onChange={(e) => {
                      appStore.updateNeedsProfile('cust-1', { ageRange: e.target.value });
                      setNeedsProfile({ ...needsProfile, ageRange: e.target.value });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  >
                    <option>20–25</option>
                    <option>26–35</option>
                    <option>35–40</option>
                    <option>41–50</option>
                    <option>50+</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dependents</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={needsProfile.dependentsCount}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      appStore.updateNeedsProfile('cust-1', { dependentsCount: count });
                      setNeedsProfile({ ...needsProfile, dependentsCount: count });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monthly Budget Allocation</label>
                <input
                  type="text"
                  value={needsProfile.monthlyBudget}
                  onChange={(e) => {
                    appStore.updateNeedsProfile('cust-1', { monthlyBudget: e.target.value });
                    setNeedsProfile({ ...needsProfile, monthlyBudget: e.target.value });
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Existing HMO Coverage</label>
                <input
                  type="text"
                  value={needsProfile.existingHMO}
                  onChange={(e) => {
                    appStore.updateNeedsProfile('cust-1', { existingHMO: e.target.value });
                    setNeedsProfile({ ...needsProfile, existingHMO: e.target.value });
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditProfileModal(false);
                  const newFna = AIOrchestrator.generateDemoFNA('cust-1', needsProfile);
                  appStore.setCustomerFNA('cust-1', newFna);
                  setFnaResult(newFna);
                  const matches = AIOrchestrator.matchProducts(needsProfile.primaryNeed);
                  setMatchedProducts(matches);
                  setJourneyStages(JourneyService.getJourney('cust-1'));
                }}
                className="px-3 py-1.5 bg-[#00008F] text-white rounded-lg text-xs font-semibold hover:bg-blue-900"
              >
                Save & Recalculate FNA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
