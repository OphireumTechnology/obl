import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Download,
  AlertCircle,
  HelpCircle,
  Phone,
  Video,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { Appointment, Customer, PolicySimulation, SalesStage } from '../../types';

interface Props {
  onNavigateToChat: () => void;
  onNavigateToProducts: () => void;
}

export const CustomerWorkspace: React.FC<Props> = ({ onNavigateToChat, onNavigateToProducts }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'needs' | 'fna' | 'appointments' | 'policies' | 'documents'>('overview');
  const [customer, setCustomer] = useState<Customer | undefined>(
    appStore.getState().customers.find((c) => c.id === 'cust-1')
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [policies, setPolicies] = useState<PolicySimulation[]>([]);
  const [activeLead, setActiveLead] = useState(appStore.getActiveLead());

  useEffect(() => {
    const update = () => {
      const state = appStore.getState();
      const cust = state.customers.find((c) => c.id === 'cust-1');
      setCustomer(cust);
      setAppointments(state.appointments.filter((a) => a.customerId === 'cust-1'));
      setPolicies(state.simulatedPolicies);
      setActiveLead(appStore.getActiveLead());
    };
    update();
    const unsub = appStore.subscribe(update);
    return () => unsub();
  }, []);

  const profile = customer?.needsProfile;
  const fna = customer?.fnaResult;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'needs', label: 'My Needs Profile' },
    { id: 'fna', label: 'Demo FNA' },
    { id: 'appointments', label: `Appointments (${appointments.length})` },
    { id: 'policies', label: `My Policies (${policies.length})` },
    { id: 'documents', label: 'Documents & Brochures' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00008F] to-blue-800 flex items-center justify-center text-white font-black text-xl shadow-md">
            MS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{customer?.fullName || 'Maria Santos'}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#00008F]">
                CUSTOMER PORTAL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {customer?.email} • Assigned Advisor: <strong>Carlos Mendoza</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateToChat}
            className="px-4 py-2 rounded-xl bg-[#00008F] text-white text-xs font-semibold hover:bg-blue-900 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch AI Assistant</span>
          </button>

          <button
            onClick={onNavigateToProducts}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Product Catalog
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar space-x-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`pb-3 px-3 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap ${
              activeTab === t.id
                ? 'border-[#00008F] text-[#00008F]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status & Journey Stepper */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Your Protection Advisory Progress</h2>
                  <p className="text-xs text-slate-500">Live synchronization with your AXA advisor</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  {activeLead?.currentStage.replace(/_/g, ' ') || 'NEEDS DISCOVERY'}
                </span>
              </div>

              {/* Progress Milestones */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Needs Profile</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Completed via AI</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Demo FNA</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">Gaps Identified</p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#00008F] font-bold">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Advisor Review</span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    {appointments.length > 0 ? 'Consultation Set' : 'Awaiting Booking'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Illustration</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Advisor Required</p>
                </div>
              </div>
            </div>

            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-[#00008F] text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base">Have questions about your Critical Illness coverage?</h3>
                <p className="text-xs text-blue-200 mt-1 max-w-xl">
                  Our AI Insurance Assistant is ready to explain product exclusions, compare benefits with your employer HMO, or connect you with your advisor.
                </p>
              </div>
              <button
                onClick={onNavigateToChat}
                className="px-4 py-2.5 rounded-xl bg-[#C91432] text-white font-bold text-xs hover:bg-red-700 transition-colors whitespace-nowrap shadow-xs"
              >
                Continue Chat Session →
              </button>
            </div>
          </div>

          {/* Right Column: Upcoming Appointment & Advisor Card */}
          <div className="space-y-6">
            {/* Upcoming Appointment */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#00008F]" />
                  Upcoming Consultation
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  CONFIRMED
                </span>
              </div>

              {appointments.length > 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {appointments[0].consultationMode === 'Video' ? (
                      <Video className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Phone className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{appointments[0].consultationMode} Consultation</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Date: <strong>{appointments[0].date}</strong> at <strong>{appointments[0].time}</strong>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Advisor: <strong>{appointments[0].advisorName}</strong>
                  </div>
                  {appointments[0].meetingLink && (
                    <a
                      href={appointments[0].meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-1 text-xs text-[#00008F] font-semibold underline"
                    >
                      Join Google Meet Demo Link →
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3">No consultations currently booked.</p>
              )}
            </div>

            {/* Servicing Advisor Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="font-bold text-slate-900">Your Dedicated Advisor</div>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
                  alt="Carlos Mendoza"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="font-bold text-slate-900">Carlos Mendoza</div>
                  <div className="text-slate-500 text-[11px]">Senior Wealth & Protection Advisor</div>
                  <div className="text-[10px] text-slate-400 font-mono">AXA-LIC-77402</div>
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                "Hi Maria, I have reviewed your AI case summary and noted your priority on Health Max to complement your employer HMO. Looking forward to our session."
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: My Needs Profile */}
      {activeTab === 'needs' && profile && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Customer Need Profile</h2>
              <p className="text-xs text-slate-500">Collected during progressive discovery with the AI assistant</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
              {profile.isComplete ? 'VERIFIED COMPLETE' : 'PARTIAL'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[11px]">Primary Protection Goal:</span>
              <div className="font-bold text-[#00008F] text-sm">{profile.primaryNeed}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[11px]">Secondary Goals:</span>
              <div className="font-semibold text-slate-800">{profile.secondaryNeeds.join(', ')}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[11px]">Age & Family:</span>
              <div className="font-semibold text-slate-800">
                Age {profile.ageRange}, {profile.dependentsCount} Dependents ({profile.maritalStatus})
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[11px]">Occupation & Income:</span>
              <div className="font-semibold text-slate-800">
                {profile.occupation} ({profile.incomeRange})
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[11px]">Existing Healthcare & Life:</span>
              <div className="font-semibold text-slate-800">
                HMO: {profile.existingHMO} • Life: {profile.existingLifeInsurance}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 text-[11px]">Monthly Budget Target:</span>
              <div className="font-semibold text-slate-800">{profile.monthlyBudget}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Demo FNA */}
      {activeTab === 'fna' && fna && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Financial Needs Analysis</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#00008F]">
                  DEMO ANALYSIS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Transparent evaluation separating deterministic gap assessments from advisory narrative
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            {fna.summaryNarrative}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Priority Category Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fna.categories.map((cat, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cat.category}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cat.priority === 'HIGH'
                          ? 'bg-red-100 text-red-800'
                          : cat.priority === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.priority} PRIORITY
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{cat.rationale}</p>
                  {cat.estimatedGap && (
                    <div className="text-[11px] font-semibold text-[#00008F]">
                      Calculated Shortfall: {cat.estimatedGap}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    Recommended solution: <strong>{cat.recommendedFocus}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl space-y-4">
          <h2 className="text-base font-bold text-slate-900">Your Scheduled Consultations</h2>
          <div className="space-y-3">
            {appointments.map((app) => (
              <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{app.consultationMode} Meeting</div>
                  <div className="text-slate-500 mt-0.5">
                    {app.date} at {app.time} with <strong>{app.advisorName}</strong>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-1">Topic: {app.notes}</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Simulated Policies (Section 29 Customer Success) */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-4xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Simulated Active Policies</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  SIMULATED
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Demonstrating customer success, post-issuance education, and annual policy reviews
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {policies.map((p) => (
              <div key={p.policyNumber} className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{p.productName}</span>
                    <div className="font-mono text-xs text-slate-500 mt-0.5">Policy #: {p.policyNumber}</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                    ACTIVE (SIMULATED)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-slate-400 text-[11px]">Coverage:</span>
                    <div className="font-bold text-slate-800">{p.coverageAmount}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Premium:</span>
                    <div className="font-bold text-slate-800">{p.annualPremium}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Effective Date:</span>
                    <div className="font-semibold text-slate-800">{p.startDate}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Advisor:</span>
                    <div className="font-semibold text-slate-800">{p.servicingAdvisor}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">
                    Beneficiaries: {p.beneficiaries.map((b) => `${b.name} (${b.percentage}%)`).join(', ')}
                  </span>
                  <button className="text-[#00008F] font-semibold hover:underline">
                    View Policy Pack (Demo) →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl space-y-4">
          <h2 className="text-base font-bold text-slate-900">Official Product Documents & Disclosures</h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">AXA Health Max Official Brochure (PH)</div>
                <div className="text-slate-500 text-[11px]">Version 4.2 • Verified Compliance Doc</div>
              </div>
              <a
                href="https://www.axa.com.ph/health-protection/health-max"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Brochure</span>
              </a>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">AXA Treating Customers Fairly (TCF) Policy</div>
                <div className="text-slate-500 text-[11px]">Advisory standards, suitability & transparency</div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 text-xs">
                View Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
