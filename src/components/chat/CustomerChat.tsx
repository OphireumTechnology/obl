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
} from 'lucide-react';
import { appStore } from '../../services/store';
import { AIOrchestrator } from '../../agents/orchestrator';
import { advisorService } from '../../services/advisorService';
import { AdvisorContactCard } from '../common/AdvisorContactCard';
import { ScheduleAppointmentModal } from '../common/ScheduleAppointmentModal';
import { RequestCallbackModal } from '../common/RequestCallbackModal';
import {
  AdvisorCaseSummary,
  FinancialNeedsAnalysis,
  Message,
  NeedsProfile,
  ProductMatch,
  SalesStage,
} from '../../types';

interface Props {
  onNavigateToAdvisor?: () => void;
  onNavigateToProducts?: () => void;
}

export const CustomerChat: React.FC<Props> = ({ onNavigateToAdvisor, onNavigateToProducts }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Current Customer profile & FNA state
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
    'Travel',
    'Car',
    'Home',
    'Business',
    'Employee Benefits',
    'I\'m Not Sure',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input.trim();
    if (!text) return;
    setInput('');

    // Add customer message
    const userMsg = appStore.addChatMessage({
      conversationId: 'conv-101',
      sender: 'customer',
      text,
    });

    setIsTyping(true);

    try {
      // Check server API or local orchestrator
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
    }
  };

  const handleActionClick = (action: string, payload?: unknown) => {
    if (action === 'SELECT_NEED') {
      handleSendMessage(`I would like to focus on ${payload}`);
    } else if (action === 'QUICK_PROFILE_1') {
      appStore.updateNeedsProfile('cust-1', {
        ageRange: '25–35',
        dependentsCount: 1,
        existingHMO: '₱100,000 employer card',
      });
      handleSendMessage('I am 31 years old, have 1 child, and have a ₱100,000 employer HMO.');
    } else if (action === 'QUICK_PROFILE_2') {
      appStore.updateNeedsProfile('cust-1', {
        ageRange: '35–45',
        dependentsCount: 2,
        existingHMO: '₱150,000 employer card',
        monthlyBudget: '₱6,000–₱10,000 / month',
      });
      handleSendMessage('I am 38 years old with 2 school-age children, a ₱150,000 HMO, and a monthly budget of ₱6,000 to ₱10,000.');
    } else if (action === 'QUICK_PROFILE_3') {
      appStore.updateNeedsProfile('cust-1', {
        ageRange: '45+',
        dependentsCount: 0,
        existingHMO: 'None (Self-employed)',
      });
      handleSendMessage('I am 48 years old, self-employed with no company HMO coverage.');
    } else if (action === 'CONCERN_AFFORDABILITY') {
      handleSendMessage('What if I am worried about whether the premiums will be affordable or if my budget changes?');
    } else if (action === 'COMPARE_HMO') {
      handleSendMessage('Why do I need critical illness insurance if my company already gives me an HMO card?');
    } else if (action === 'CALL_ADVISOR') {
      const advisor = advisorService.getPrimaryAdvisor();
      window.location.href = advisorService.formatTelUri(advisor.mobilePhone || '+639686471868');
    } else if (action === 'REQUEST_CALLBACK') {
      setShowCallbackModal(true);
    } else if (action === 'CONTINUE_EXPLORING') {
      handleSendMessage('I would like to explore more protection coverage details with AI.');
    } else if (action === 'TALK_TO_ADVISOR') {
      handleSendMessage('I would like to talk to an AXA financial advisor.');
    } else if (action === 'BOOK_APPOINTMENT') {
      setShowAppointmentModal(true);
    } else if (action === 'VIEW_SUMMARY') {
      setShowSummaryModal(true);
    } else if (action === 'VIEW_PRODUCT') {
      if (onNavigateToProducts) onNavigateToProducts();
    } else if (action === 'COMPARE_PRODUCTS') {
      if (onNavigateToProducts) onNavigateToProducts();
    } else {
      handleSendMessage(typeof payload === 'string' ? payload : action);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-6.5rem)]">
      {/* Top Header bar inside Chat view */}
      <div className="bg-white rounded-t-xl border border-slate-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#00008F] flex items-center justify-center text-white font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">AXA Conversational Insurance Assistant</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Personalized protection discovery • Grounded in verified AXA product brain
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {needsProfile?.isComplete && (
            <button
              onClick={() => setShowEditProfileModal(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-1 font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Needs Profile</span>
            </button>
          )}

          <button
            onClick={() => setShowSummaryModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#00008F] text-white text-xs font-semibold hover:bg-blue-900 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Advisor Summary</span>
          </button>

          <button
            onClick={() => setShowAppointmentModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#C91432] text-white text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Consultation</span>
          </button>
        </div>
      </div>

      {/* Main chat window split with live sidebar on desktop */}
      <div className="flex-1 bg-slate-50 border-x border-slate-200 overflow-hidden flex flex-col md:flex-row">
        {/* Chat Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* AI Disclosure Banner (Section 10) */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#00008F] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-blue-950">AI Disclosure & Security Notice: </span>
              You are interacting with an AI demo assistant. Information is for educational and exploration purposes. Official premiums, illustrations, and underwriting require review by an authorized AXA advisor. Never enter sensitive passwords or bank account credentials.
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-[11px] text-[#00008F] font-semibold underline hover:text-blue-800"
                >
                  Learn About Privacy & Consent
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => handleActionClick('TALK_TO_ADVISOR')}
                  className="text-[11px] text-[#C91432] font-semibold hover:underline"
                >
                  Talk to a Licensed Advisor
                </button>
              </div>
            </div>
          </div>

          {/* Message stream */}
          {messages.map((m) => {
            const isCustomer = m.sender === 'customer';
            const isSystem = m.sender === 'system';

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-3">
                  <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{m.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isCustomer ? 'justify-end' : 'justify-start'}`}
              >
                {!isCustomer && (
                  <div className="w-8 h-8 rounded-full bg-[#00008F] flex items-center justify-center text-white shrink-0 shadow-xs text-xs font-bold">
                    AXA
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                    isCustomer
                      ? 'bg-[#00008F] text-white rounded-tr-xs shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {!isCustomer && m.agentType && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00008F]" />
                      <span>{m.agentType}</span>
                    </div>
                  )}

                  <div className="whitespace-pre-line prose-sm">{m.text}</div>

                  {/* Compliance Flags if any */}
                  {m.complianceFlags && m.complianceFlags.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Compliance note applied: {m.complianceFlags.join(', ')}</span>
                    </div>
                  )}

                  {/* Suggested action pills */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {m.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(action.action, action.payload)}
                          className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#00008F] hover:border-blue-300 border border-slate-200 text-xs text-slate-700 font-medium transition-colors flex items-center gap-1"
                        >
                          <span>{action.label}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Render advisor contact banner if advisor escalation is active */}
                  {!isCustomer && (m.agentType === 'IllustrationAssistantAgent' || m.suggestedActions?.some(a => a.action === 'CALL_ADVISOR')) && (
                    <div className="mt-3 pt-2">
                      <AdvisorContactCard
                        variant="banner"
                        onScheduleAppointment={() => setShowAppointmentModal(true)}
                        onRequestCallback={() => setShowCallbackModal(true)}
                      />
                    </div>
                  )}
                </div>

                {isCustomer && (
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 shrink-0 text-xs font-bold">
                    MS
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-[#00008F] flex items-center justify-center text-white shrink-0 text-xs font-bold">
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

        {/* Right contextual panel (FNA & Product Matches live summary) */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-4 overflow-y-auto space-y-4">
          {/* Active Sales Stage Indicator */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                Sales Journey Stage
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {currentLead?.id || 'lead-101'}
              </span>
            </div>
            <div className="font-bold text-[#00008F] text-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#C91432]" />
              <span>{currentLead?.currentStage || 'NEEDS_DISCOVERY'}</span>
            </div>
          </div>

          {/* Designated Licensed Advisor Contact Card */}
          <AdvisorContactCard
            variant="compact"
            onScheduleAppointment={() => setShowAppointmentModal(true)}
            onRequestCallback={() => setShowCallbackModal(true)}
          />

          {/* Live Customer Needs Profile card */}
          {needsProfile && (
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#00008F]" />
                  Needs Profile
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {needsProfile.isComplete ? 'COMPLETE' : 'IN PROGRESS'}
                </span>
              </div>

              <div className="space-y-1 text-slate-600 text-[11px]">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Age Bracket:</span>
                  <span className="font-medium text-slate-800">{needsProfile.ageRange}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Dependents:</span>
                  <span className="font-medium text-slate-800">{needsProfile.dependentsCount}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Occupation:</span>
                  <span className="font-medium text-slate-800">{needsProfile.occupation}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Primary Need:</span>
                  <span className="font-bold text-[#00008F]">{needsProfile.primaryNeed}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-400">Existing HMO:</span>
                  <span className="font-medium text-slate-800">{needsProfile.existingHMO}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Budget Target:</span>
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

          {/* Demo Financial Needs Analysis Card */}
          {fnaResult && (
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00008F]" />
                  Financial Needs Analysis
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200/80 text-blue-900 tracking-wider">
                  DEMO ANALYSIS
                </span>
              </div>

              <p className="text-[11px] text-blue-900 leading-snug">
                {fnaResult.summaryNarrative}
              </p>

              <div className="space-y-1.5 pt-1">
                {fnaResult.categories.map((cat, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-lg border border-blue-100 text-[11px]">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-slate-800">{cat.category}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          cat.priority === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : cat.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat.priority}
                      </span>
                    </div>
                    <div className="text-slate-500 line-clamp-2">{cat.rationale}</div>
                    {cat.estimatedGap && (
                      <div className="mt-1 text-[10px] font-medium text-[#00008F]">
                        Protection Gap: {cat.estimatedGap}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Candidate Products */}
          {matchedProducts.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Candidate Solutions</span>
                <span className="text-[10px] text-slate-400 font-normal">To explore with advisor</span>
              </div>

              {matchedProducts.map((match) => (
                <div
                  key={match.product.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#00008F] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-xs">{match.product.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {match.verificationStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-1.5">{match.product.shortDescription}</p>
                  <div className="p-2 bg-slate-50 rounded text-[10px] text-slate-600 space-y-1">
                    <div>
                      <strong className="text-slate-700">Why it appeared: </strong>
                      {match.whyItAppeared}
                    </div>
                    <div>
                      <strong className="text-slate-700">Consideration: </strong>
                      {match.importantConsiderations}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigateToProducts) onNavigateToProducts();
                    }}
                    className="mt-2 w-full py-1 text-[11px] text-[#00008F] font-semibold hover:underline text-center"
                  >
                    View Official Benefits & Sources →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input bar */}
      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-3 shadow-xs">
        {/* Rapid prompt suggestions bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar text-xs">
          <span className="text-[11px] text-slate-400 shrink-0 font-medium">Quick explore:</span>
          {primaryNeedsList.slice(0, 7).map((need) => (
            <button
              key={need}
              onClick={() => handleSendMessage(`Tell me about ${need} options`)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#00008F] text-slate-600 text-[11px] whitespace-nowrap transition-colors border border-slate-200/80 font-medium"
            >
              {need}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about AXA coverage, compare with HMO, discuss budget, or request an advisor..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00008F] focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-4 py-2.5 rounded-xl bg-[#00008F] hover:bg-blue-900 disabled:bg-slate-300 text-white font-semibold transition-colors flex items-center gap-1.5 text-sm shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* --- Modals --- */}

      {/* 1. Privacy & Consent Modal (Section 10) */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Shield className="w-5 h-5 text-[#00008F]" />
                AI Disclosure & Data Privacy Principles
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-80 overflow-y-auto">
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
            <div className="pt-3 border-t border-slate-100 flex justify-end">
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

      {/* 2. Schedule Consultation Modal (#76, #77) */}
      <ScheduleAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />

      {/* 2b. Request a Callback Modal (#76, #77) */}
      <RequestCallbackModal
        isOpen={showCallbackModal}
        onClose={() => setShowCallbackModal(false)}
      />

      {/* 3. Advisor Case Summary Modal (Section 20) */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#00008F]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Advisor Case Summary (AI Hand-off)</h3>
                  <p className="text-xs text-slate-500">Structured brief transmitted to the Advisor Dashboard</p>
                </div>
              </div>
              <button onClick={() => setShowSummaryModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-700 pr-1">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">Prospect: </span>
                  <strong className="text-slate-900">{advisorSummary?.customerAlias || 'Maria Santos'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Lead ID: </span>
                  <strong className="font-mono text-slate-900">{advisorSummary?.leadId || currentLead?.id}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Primary Need: </span>
                  <strong className="text-[#00008F]">{advisorSummary?.primaryNeed || 'Critical Illness'}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Monthly Budget: </span>
                  <strong className="text-slate-900">{advisorSummary?.budgetRange || '₱6,000–₱10,000 / mo'}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Needs Profile Dossier:</div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
                  {advisorSummary?.needsProfileSummary || 'Age 35–40, Marketing Director, 2 dependents. Employer HMO covers ₱150,000 only.'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Financial Needs Analysis (FNA) Findings:</div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 leading-relaxed">
                  {advisorSummary?.fnaPrioritySummary || 'High Critical Illness priority due to mortgage and dependent family living costs.'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Products Explored & Inquired:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(advisorSummary?.productsExplored || ['AXA Health Max', 'AXA Health Start', 'AXA FlexiProtect']).map((p, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[#00008F] font-semibold text-xs">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Identified Concerns & Inquiries:</div>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {(advisorSummary?.customerConcerns || ['Affordability / long-term commitment', 'HMO duplication vs cash payout']).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-900">Suggested Next Operational Action:</div>
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 font-medium">
                  {advisorSummary?.suggestedNextOperationalAction || 'Prepare official Health Max 20-pay illustration and present HMO living-cost comparison.'}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">Available to advisor in Advisor Workspace</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                {onNavigateToAdvisor && (
                  <button
                    onClick={() => {
                      setShowSummaryModal(false);
                      onNavigateToAdvisor();
                    }}
                    className="px-4 py-2 bg-[#00008F] text-white rounded-lg text-xs font-bold hover:bg-blue-900 flex items-center gap-1.5"
                  >
                    <span>View in Advisor Cockpit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Profile Modal */}
      {showEditProfileModal && needsProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Customer Need Profile</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
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

              <div className="grid grid-cols-2 gap-3">
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

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditProfileModal(false);
                  // Trigger re-FNA
                  const newFna = AIOrchestrator.generateDemoFNA('cust-1', needsProfile);
                  appStore.setCustomerFNA('cust-1', newFna);
                  setFnaResult(newFna);
                  const matches = AIOrchestrator.matchProducts(needsProfile.primaryNeed);
                  setMatchedProducts(matches);
                }}
                className="px-4 py-2 bg-[#00008F] text-white rounded-lg text-xs font-semibold hover:bg-blue-900"
              >
                Save & Recalculate Demo FNA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
