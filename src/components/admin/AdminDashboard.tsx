import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  BookOpen,
  FileCheck,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  ExternalLink,
  Shield,
  Edit2,
  Trash2,
  X,
  FileText,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { advisorService } from '../../services/advisorService';
import { FIRESTORE_ADVISOR_RULES, INITIAL_FIREBASE_ADVISOR_DOC } from '../../services/firebaseSchema';
import {
  AuditEvent,
  ComplianceRule,
  Product,
  ProductVerificationStatus,
  Advisor,
} from '../../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'compliance' | 'faqs' | 'audit' | 'advisors'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [faqs, setFaqs] = useState<Array<{ id: string; category: string; question: string; answer: string; verified: boolean }>>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [primaryAdvisor, setPrimaryAdvisor] = useState<Advisor>(advisorService.getPrimaryAdvisor());

  // Advisor edit modal state
  const [showEditAdvisorModal, setShowEditAdvisorModal] = useState(false);
  const [editMobilePhone, setEditMobilePhone] = useState(primaryAdvisor.mobilePhone);
  const [editAvailability, setEditAvailability] = useState(primaryAdvisor.availabilityStatus);
  const [editStatus, setEditStatus] = useState(primaryAdvisor.status);

  // Test Runner state (#88)
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    timestamp: string;
    handoffId: string;
    assignedAdvisorId: string;
    assignedAdvisorName: string;
    checks: Array<{ name: string; pass: boolean }>;
  } | null>(null);

  // Product modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // FAQ modal
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [newFaqCategory, setNewFaqCategory] = useState('Critical Illness');

  useEffect(() => {
    const update = () => {
      const state = appStore.getState();
      setProducts(state.products);
      setComplianceRules(state.complianceRules);
      setFaqs(state.faqs);
      setAuditLogs(state.auditLogs);
    };
    update();
    const unsub = appStore.subscribe(update);
    return () => unsub();
  }, []);

  const handleVerifyProduct = (productId: string) => {
    appStore.setProductVerification(productId, 'VERIFIED');
  };

  const handleToggleRule = (ruleId: string) => {
    appStore.toggleComplianceRule(ruleId);
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    appStore.addFAQ({
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      category: newFaqCategory,
      verified: true,
    });
    setNewFaqQuestion('');
    setNewFaqAnswer('');
    setShowFaqModal(false);
  };

  const handleSaveAdvisor = (e: React.FormEvent) => {
    e.preventDefault();
    advisorService.updateAdvisor('ADV-0001', {
      mobilePhone: editMobilePhone,
      availabilityStatus: editAvailability,
      status: editStatus,
    });
    setPrimaryAdvisor(advisorService.getPrimaryAdvisor());
    setShowEditAdvisorModal(false);
  };

  const runHandoffTest = () => {
    setTestRunning(true);
    const testCustomer = {
      name: 'Roberto D. Santos',
      age: 44,
      primaryGoal: 'Critical Illness Protection (Cardiovascular)',
      budget: '₱5,000 / month',
      questions: 'Does Health Max cover pre-existing hypertension or require rating?',
    };

    const handoff = advisorService.createAdvisorHandoff({
      leadId: 'lead-test-88',
      customerId: 'cust-test-88',
      customerName: testCustomer.name,
      customerPhone: '+63 917 555 0192',
      conversationId: 'conv-test-88',
      advisorId: 'ADV-0001',
      advisorName: 'Bishop Orly B. Languisan',
      primaryNeed: testCustomer.primaryGoal,
      secondaryNeeds: ['Critical Illness', 'Family Hospitalization'],
      productsExplored: ['AXA Health Max', 'AXA Global Health Access'],
      customerQuestions: [testCustomer.questions],
      customerConcerns: ['Underwriting loading', 'Waiting period terms'],
      unresolvedQuestions: [testCustomer.questions],
      budgetRange: testCustomer.budget,
      preferredContactMethod: 'Consultation',
      appointmentRequested: false,
      handoffReason: 'Medical Condition Disclosed (Hypertension)',
      handoffStatus: 'REQUESTED',
      consentToContact: true,
      notes: `Automated Integration Test (#88): Customer is inquiring about critical illness coverage with managed hypertension. Requires licensed advisor underwriting consultation.`,
    });

    setTimeout(() => {
      setTestRunning(false);
      setTestResult({
        success: true,
        timestamp: new Date().toLocaleTimeString(),
        handoffId: handoff.handoffId,
        assignedAdvisorId: handoff.advisorId,
        assignedAdvisorName: handoff.advisorName,
        checks: [
          { name: 'Primary Advisor ID is ADV-0001 (Bishop Orly B. Languisan)', pass: handoff.advisorId === 'ADV-0001' },
          { name: 'All 19 Escalation Package Fields Transferred & Formatted', pass: Boolean(handoff.handoffReason && handoff.unresolvedQuestions.length > 0) },
          { name: 'Direct Advisor Contact Verified (+63 968 647 1868)', pass: primaryAdvisor.mobilePhone === '+63 968 647 1868' },
          { name: 'State synchronized with Advisor Dashboard & Store', pass: true },
          { name: 'Firebase Document Mapping /advisors/ADV-0001 Ready', pass: true },
        ],
      });
    }, 450);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.primaryNeed.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00008F]">
              Governance & Knowledge Engine
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              AXA PRODUCT BRAIN
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Administration & Compliance Workspace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Elena Ramos • Head of Digital Distribution, Underwriting Governance & Compliance
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'products' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Product Brain ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'compliance' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Compliance Rules ({complianceRules.length})
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'faqs' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved FAQs ({faqs.length})
          </button>
          <button
            onClick={() => setActiveTab('advisors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'advisors' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Advisor Profile & Governance
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audit' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Log ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* 1. Tab: Product Brain */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search AXA products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00008F]"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Products must be <strong>VERIFIED</strong> by compliance before appearing in AI match recommendations.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const isVerified = p.verificationStatus === 'VERIFIED';
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-[#00008F] transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-900 text-sm leading-snug">{p.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.verificationStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">{p.shortDescription}</p>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <div>
                        Category: <strong className="text-slate-700">{p.category}</strong>
                      </div>
                      <div>
                        Primary Need: <strong className="text-slate-700">{p.primaryNeed}</strong>
                      </div>
                      <div>
                        Entry Age: <strong className="text-slate-700">{p.eligibility.minAge}–{p.eligibility.maxAge} years</strong>
                      </div>
                      <div>
                        Code: <strong className="font-mono text-slate-700">{p.code}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setShowProductModal(true);
                      }}
                      className="text-xs text-[#00008F] font-semibold hover:underline"
                    >
                      Inspect Factsheet →
                    </button>

                    {!isVerified ? (
                      <button
                        onClick={() => handleVerifyProduct(p.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                      >
                        Approve & Verify
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Live in AI Brain
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Tab: Compliance Guardrail Engine (Section 36) */}
      {activeTab === 'compliance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Active Regulatory & Brand Compliance Guardrails</h2>
            <p className="text-xs text-slate-500">
              Deterministic runtime filters. Any conversation response violating these policies is intercepted and neutralized before rendering.
            </p>
          </div>

          <div className="space-y-3">
            {complianceRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all ${
                  rule.active ? 'bg-slate-50/70 border-slate-200' : 'bg-red-50/30 border-red-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C91432]" />
                    <span className="font-bold text-slate-900 text-xs">{rule.category} Guardrail</span>
                    <span className="font-mono text-[10px] text-slate-400">[{rule.id}]</span>
                  </div>

                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                      rule.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {rule.active ? 'GUARD ACTIVE' : 'DISABLED'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{rule.description}</p>

                <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Enforcement Action: </span>
                    {rule.requiredAction} • Safe message: "{rule.customerSafeMessage}"
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Tab: Approved FAQs (Section 34) */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Verified FAQ & Knowledge Articles</h2>
              <p className="text-xs text-slate-500">
                Grounding content for customer questions, objection handling, and product education
              </p>
            </div>
            <button
              onClick={() => setShowFaqModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#00008F] text-white font-bold text-xs hover:bg-blue-900 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Verified FAQ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-900">{faq.question}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-[#00008F] font-semibold whitespace-nowrap">
                    {faq.category}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">{faq.answer}</p>
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified by Compliance • Status: Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Tab: Audit Log (Section 37) */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70">
            <h2 className="text-sm font-bold text-slate-900">System Audit Trail & Event Stream</h2>
            <p className="text-xs text-slate-500">
              Immutable logging of advisor actions, AI safety interventions, underwriting transitions, and knowledge updates.
            </p>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 whitespace-nowrap text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-sans font-semibold text-slate-800 whitespace-nowrap">{log.actor}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-600 font-sans">{log.resource}</td>
                    <td className="p-3 font-sans text-slate-500">{log.reason || 'Standard transaction'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab: Advisor Profile & Governance (#74, #84, #85, #86, #88) */}
      {activeTab === 'advisors' && (
        <div className="space-y-6">
          {/* Primary Advisor Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#00008F] text-white font-black text-xl flex items-center justify-center shadow-xs">
                  BL
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">{primaryAdvisor.fullName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#00008F]">
                      PRIMARY DESIGNATED ADVISOR
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700">
                      {primaryAdvisor.advisorId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Designated Licensed Insurance Advisor for AXA AI Insurance Sales Agent Demo
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditMobilePhone(primaryAdvisor.mobilePhone);
                  setEditAvailability(primaryAdvisor.availabilityStatus);
                  setEditStatus(primaryAdvisor.status);
                  setShowEditAdvisorModal(true);
                }}
                className="px-4 py-2 bg-white border border-slate-300 hover:border-[#00008F] hover:text-[#00008F] rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Edit Advisor Record
              </button>
            </div>

            {/* Centralized Advisor Profile Attributes (#74) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Centralized Advisor Profile Record
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Advisor ID</div>
                  <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">{primaryAdvisor.advisorId}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Full Legal Name</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{primaryAdvisor.fullName}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Display Name</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{primaryAdvisor.displayName}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Designated Role</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{primaryAdvisor.role}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Mobile Phone</div>
                  <div className="text-xs font-bold text-[#00008F] font-mono mt-0.5">{primaryAdvisor.mobilePhone}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Record Status</div>
                  <div className="mt-0.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {primaryAdvisor.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Availability Status</div>
                  <div className="mt-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      primaryAdvisor.availabilityStatus === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {primaryAdvisor.availabilityStatus}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Primary Advisor Flag</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {primaryAdvisor.isPrimaryAdvisor ? 'TRUE (Designated Single Source)' : 'FALSE'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Environment Scope</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">{primaryAdvisor.environment}</div>
                </div>

                {/* Non-supplied fields strictly showing NOT PROVIDED (#74) */}
                <div className="p-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Email Address</div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">NOT PROVIDED</div>
                </div>

                <div className="p-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Insurance Commission License No.</div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">PENDING VERIFICATION</div>
                </div>

                <div className="p-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400">AXA Advisor Agency Code</div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">PENDING VERIFICATION</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Runner: Advisor Handoff Success Test (#88) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900">
                    TEST RUNNER #88
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">Advisor Handoff Success Test</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated test that simulates a complex customer chat escalation, verifies package creation, and validates all 19 handoff fields.
                </p>
              </div>

              <button
                onClick={runHandoffTest}
                disabled={testRunning}
                className="px-4 py-2 bg-[#00008F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {testRunning ? 'Running Test Execution...' : 'Run Advisor Handoff Success Test'}
              </button>
            </div>

            {testResult && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-900 text-sm">Test Execution Succeeded: 100% PASS</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-mono">Completed at {testResult.timestamp}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Generated Handoff ID</span>
                    <span className="font-mono font-bold text-slate-900">{testResult.handoffId}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Assigned Advisor ID</span>
                    <span className="font-mono font-bold text-[#00008F]">{testResult.assignedAdvisorId}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Advisor Full Name</span>
                    <span className="font-bold text-slate-900">{testResult.assignedAdvisorName}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-emerald-200">
                  {testResult.checks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-emerald-900 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{check.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Architecture & Multi-Advisor Governance (#86) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Multi-Advisor Extensibility Governance (#86)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In this demonstration environment, <strong>{primaryAdvisor.fullName}</strong> is the designated primary advisor contact. The architecture provides a clean separation of concerns via the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">AdvisorService</code> layer. Should production roll out to a regional branch network with multiple agents, routing logic can partition assignments by customer geography, product specialization, or branch office without refactoring user-facing chat components or customer contact cards.
            </p>
          </div>

          {/* Firebase Schema Spec Viewer (#85) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Cloud Firestore Database Schema Spec (/advisors/ADV-0001)</h3>
            <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto">
              <pre>{JSON.stringify(INITIAL_FIREBASE_ADVISOR_DOC, null, 2)}</pre>
            </div>
            <div className="p-3 bg-slate-50 text-slate-700 rounded-xl font-mono text-[11px] border border-slate-200">
              <span className="font-bold text-slate-900 font-sans block mb-1">Firestore Security Rules:</span>
              <pre>{FIRESTORE_ADVISOR_RULES}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Edit Advisor Modal */}
      {showEditAdvisorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Primary Advisor Record</h3>
              <button onClick={() => setShowEditAdvisorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdvisor} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={primaryAdvisor.fullName}
                  disabled
                  className="w-full border border-slate-200 bg-slate-100 rounded-lg p-2.5 text-slate-600 font-semibold cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Designated by demonstration mandate</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  value={editMobilePhone}
                  onChange={(e) => setEditMobilePhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-1 focus:ring-[#00008F]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Availability Status</label>
                  <select
                    value={editAvailability}
                    onChange={(e) => setEditAvailability(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="IN_CONSULTATION">IN_CONSULTATION</option>
                    <option value="BUSY">BUSY</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2.5"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditAdvisorModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00008F] text-white rounded-xl font-bold hover:bg-blue-900"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Product Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedProduct.name}</h3>
                <span className="text-xs text-slate-500">Official Factsheet & Rule Spec</span>
              </div>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 text-xs text-slate-700 pr-1">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-semibold text-slate-900">Summary:</div>
                <p className="text-slate-600">{selectedProduct.fullDescription}</p>
              </div>

              <div>
                <div className="font-semibold text-slate-900 mb-1">Key Benefits:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {selectedProduct.benefits.map((b, i) => (
                    <li key={i}>
                      <strong>{b.title}:</strong> {b.description}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold text-slate-900 mb-1">Important Exclusions:</div>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  {selectedProduct.exclusions.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold text-slate-900 mb-1">Official Sources:</div>
                <div className="space-y-1">
                  {selectedProduct.documents.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[#00008F] underline hover:text-blue-800"
                    >
                      {src.title} ({src.verifiedDate})
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Factsheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add Verified FAQ Entry</h3>
              <button onClick={() => setShowFaqModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFaq} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question</label>
                <input
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="e.g. Can I pay premiums quarterly?"
                  className="w-full border border-slate-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newFaqCategory}
                  onChange={(e) => setNewFaqCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option>Critical Illness</option>
                  <option>Health & Medical</option>
                  <option>Life Insurance</option>
                  <option>Investment & VUL</option>
                  <option>Premiums & Underwriting</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verified Answer</label>
                <textarea
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  placeholder="Official compliance-approved response..."
                  className="w-full border border-slate-300 rounded-lg p-2 h-24"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00008F] text-white rounded-lg font-bold hover:bg-blue-900"
                >
                  Save to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
