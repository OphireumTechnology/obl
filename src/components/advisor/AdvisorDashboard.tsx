import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  User,
  MessageSquare,
  Sparkles,
  Phone,
  Video,
  FileText,
  Shield,
  Edit,
  X,
  Play,
  UserCheck,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { advisorService } from '../../services/advisorService';
import {
  Advisor,
  AdvisorNote,
  Application,
  Appointment,
  FollowUp,
  Lead,
  SalesStage,
  AdvisorHandoff,
  AdvisorHandoffStatus,
  CallbackRequest,
} from '../../types';

interface Props {
  onNavigateToChat?: () => void;
}

export const AdvisorDashboard: React.FC<Props> = ({ onNavigateToChat }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [advisorNotes, setAdvisorNotes] = useState<AdvisorNote[]>([]);
  const [handoffs, setHandoffs] = useState<AdvisorHandoff[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [primaryAdvisor, setPrimaryAdvisor] = useState<Advisor>(advisorService.getPrimaryAdvisor());
  const [viewMode, setViewMode] = useState<'leads' | 'handoffs' | 'callbacks'>('leads');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [needFilter, setNeedFilter] = useState('ALL');

  // Modals / forms
  const [newNoteText, setNewNoteText] = useState('');
  const [newFollowUpType, setNewFollowUpType] = useState<FollowUp['type']>('Appointment Reminder');
  const [newFollowUpDate, setNewFollowUpDate] = useState('2026-03-24');
  const [newFollowUpNotes, setNewFollowUpNotes] = useState('');
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  useEffect(() => {
    const update = () => {
      const state = appStore.getState();
      setLeads(state.leads);
      setAdvisors(state.advisors);
      setAppointments(state.appointments);
      setFollowUps(state.followUps);
      setApplications(state.applications);
      setAdvisorNotes(state.advisorNotes);
      setHandoffs(state.handoffs || []);
      setCallbacks(state.callbacks || []);
      setPrimaryAdvisor(advisorService.getPrimaryAdvisor());

      // If selected lead is active, refresh it
      if (selectedLead) {
        const refreshed = state.leads.find((l) => l.id === selectedLead.id);
        if (refreshed) setSelectedLead(refreshed);
      } else {
        setSelectedLead(state.leads[0]);
      }
    };
    update();
    const unsub = appStore.subscribe(update);
    return () => unsub();
  }, []);

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.primaryNeed.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'ALL' || l.currentStage === stageFilter;
    const matchesNeed = needFilter === 'ALL' || l.primaryNeed === needFilter;
    return matchesSearch && matchesStage && matchesNeed;
  });

  // Metrics
  const newLeadsCount = leads.filter((l) => l.currentStage === 'NEW_LEAD').length;
  const advisorReadyCount = leads.filter((l) => l.currentStage === 'ADVISOR_READY').length;
  const inProgressAppsCount = applications.filter((a) => a.status === 'UNDERWRITING' || a.status === 'STARTED').length;
  const issuedPoliciesCount = appStore.getState().simulatedPolicies.length;

  const handleStageChange = (newStage: SalesStage) => {
    if (!selectedLead) return;
    appStore.updateLeadStage(selectedLead.id, newStage, `Advisor updated stage to ${newStage}`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;
    appStore.addAdvisorNote({
      leadId: selectedLead.id,
      advisorId: 'adv-1',
      advisorName: 'Carlos Mendoza',
      note: newNoteText.trim(),
      category: 'General',
    });
    setNewNoteText('');
  };

  const handleCreateFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    appStore.addFollowUp({
      leadId: selectedLead.id,
      customerId: selectedLead.customerId,
      customerName: selectedLead.customerName,
      advisorId: 'adv-1',
      dueDate: newFollowUpDate,
      type: newFollowUpType,
      status: 'PENDING',
      notes: newFollowUpNotes || 'Standard advisory follow-up',
    });
    setShowFollowUpModal(false);
    setNewFollowUpNotes('');
  };

  const handleStartApplication = () => {
    if (!selectedLead) return;
    appStore.startDemoApplication({
      leadId: selectedLead.id,
      customerId: selectedLead.customerId,
      customerName: selectedLead.customerName,
      productId: 'prod-health-max',
      productName: 'AXA Health Max',
      coverageAmount: '₱2,000,000 (Sum Insured)',
      paymentMode: '20 Years Pay',
      status: 'UNDERWRITING',
      underwritingNotes: 'Attending Physician Statement reviewed for standard issue.',
    });
  };

  const activeCustomer = appStore.getState().customers.find((c) => c.id === selectedLead?.customerId);
  const activeLeadNotes = advisorNotes.filter((n) => n.leadId === selectedLead?.id);
  const activeLeadAppointments = appointments.filter((a) => a.leadId === selectedLead?.id);
  const activeLeadApplication = applications.find((a) => a.leadId === selectedLead?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Centralized Primary Advisor Banner (#74, #78) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            BL
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900">{primaryAdvisor.displayName}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#00008F]">
                PRIMARY DESIGNATED ADVISOR
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                {primaryAdvisor.advisorId}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  primaryAdvisor.availabilityStatus === 'AVAILABLE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : primaryAdvisor.availabilityStatus === 'IN_CONSULTATION'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                ● {primaryAdvisor.availabilityStatus}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 mt-1 flex-wrap">
              <span>{primaryAdvisor.role}</span>
              <span>•</span>
              <a
                href={advisorService.formatTelUri(primaryAdvisor.mobilePhone)}
                className="font-medium text-[#00008F] hover:underline flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                {primaryAdvisor.mobilePhone}
              </a>
              <span>•</span>
              <span className="text-slate-400">Environment: {primaryAdvisor.environment}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-right mr-2 hidden sm:block">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Availability Status</div>
            <div className="text-xs font-bold text-slate-700">{primaryAdvisor.availabilityStatus}</div>
          </div>
          <button
            onClick={() => {
              const nextStatus =
                primaryAdvisor.availabilityStatus === 'AVAILABLE'
                  ? 'IN_CONSULTATION'
                  : primaryAdvisor.availabilityStatus === 'IN_CONSULTATION'
                  ? 'BUSY'
                  : 'AVAILABLE';
              advisorService.updateAdvisor(primaryAdvisor.advisorId, { availabilityStatus: nextStatus });
              setPrimaryAdvisor(advisorService.getPrimaryAdvisor());
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            Toggle Availability
          </button>
        </div>
      </div>

      {/* Advisor Overview KPIs (Section 23) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">New Leads</div>
          <div className="text-xl font-black text-slate-900 mt-1">{newLeadsCount}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-0.5">Website & AI chats</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Advisor Ready</div>
          <div className="text-xl font-black text-[#00008F] mt-1">{advisorReadyCount}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">High intent handoffs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Appointments</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{appointments.length}</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Confirmed bookings</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Follow-Ups Due</div>
          <div className="text-xl font-black text-amber-700 mt-1">
            {followUps.filter((f) => f.status === 'PENDING').length}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Requires outreach</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Inbound Handoffs</div>
          <div className="text-xl font-black text-indigo-700 mt-1">{handoffs.length}</div>
          <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Escalation Packages</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] text-slate-500 font-medium">Callbacks Queued</div>
          <div className="text-xl font-black text-purple-700 mt-1">{callbacks.length}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Requested by Leads</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setViewMode('leads')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'leads'
              ? 'bg-[#00008F] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Advisory Pipeline & Leads ({filteredLeads.length})
        </button>
        <button
          onClick={() => setViewMode('handoffs')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            viewMode === 'handoffs'
              ? 'bg-[#00008F] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Inbound AI Handoffs ({handoffs.length})</span>
        </button>
        <button
          onClick={() => setViewMode('callbacks')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            viewMode === 'callbacks'
              ? 'bg-[#00008F] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Callback Requests ({callbacks.length})</span>
        </button>
      </div>

      {/* Inbound Handoffs View */}
      {viewMode === 'handoffs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Escalations & Handoff Packages</h2>
              <p className="text-xs text-slate-500">
                19-field structured dossiers transferred directly from AI conversations to {primaryAdvisor.displayName}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#00008F] border border-blue-100">
              Assigned Advisor: {primaryAdvisor.displayName} ({primaryAdvisor.advisorId})
            </span>
          </div>

          {handoffs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No escalation handoffs yet. Handoffs trigger automatically during complex medical, quotation, or estate discussions.
            </div>
          ) : (
            <div className="space-y-4">
              {handoffs.map((h) => (
                <div key={h.handoffId} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{h.customerName}</span>
                        <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {h.handoffId}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          Trigger: {h.handoffReason}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Transferred at: {new Date(h.handoffTimestamp).toLocaleString()} • Assigned: {h.advisorName}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-[#00008F]">
                        Status: {h.handoffStatus}
                      </span>
                      <button
                        onClick={() => {
                          const nextStatus: AdvisorHandoffStatus =
                            h.handoffStatus === 'REQUESTED'
                              ? 'ASSIGNED'
                              : h.handoffStatus === 'ASSIGNED'
                              ? 'CONTACTED'
                              : 'CONSULTATION_COMPLETED';
                          appStore.updateHandoffStatus(h.handoffId, nextStatus);
                        }}
                        className="px-3 py-1 bg-[#00008F] text-white rounded-lg text-xs font-bold hover:bg-blue-900"
                      >
                        Advance Status
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
                    <div>
                      <span className="font-semibold text-slate-500 uppercase text-[10px] block">AI Consultation Summary:</span>
                      <p className="text-slate-800 whitespace-pre-line mt-0.5">{h.notes || h.handoffReason}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Primary Need</span>
                        <span className="font-medium text-slate-800">{h.primaryNeed}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Preferred Products</span>
                        <span className="font-medium text-slate-800">{h.productsExplored?.join(', ') || 'General Inquiries'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Unanswered Questions</span>
                        <span className="font-medium text-slate-800">{h.unresolvedQuestions?.join('; ') || 'None noted'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inbound Callbacks View */}
      {viewMode === 'callbacks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Direct Callback Requests</h2>
              <p className="text-xs text-slate-500">
                Customers requesting a phone consultation from {primaryAdvisor.displayName}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
              Direct Contact: {primaryAdvisor.mobilePhone}
            </span>
          </div>

          {callbacks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No callback requests queued at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {callbacks.map((cb) => (
                <div key={cb.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{cb.customerName}</span>
                      <span className="font-mono text-xs text-blue-700 font-semibold">{cb.preferredContactNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cb.status === 'PENDING' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {cb.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Preferred Date & Time: <strong>{cb.preferredDate} ({cb.preferredTime})</strong> • Reason: <strong>{cb.primaryReason || 'AXA Protection Portfolio'}</strong>
                    </div>
                    {cb.notes && <div className="text-xs text-slate-500 mt-0.5 italic">"{cb.notes}"</div>}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={advisorService.formatTelUri(cb.preferredContactNumber)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call Customer</span>
                    </a>
                    {cb.status === 'PENDING' && (
                      <button
                        onClick={() => appStore.updateCallbackStatus(cb.id, 'CONTACTED')}
                        className="px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                      >
                        Mark Contacted
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Split Layout: Lead Management Table (Left) + Customer 360 Drawer (Right) */}
      {viewMode === 'leads' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lead Management Table (Section 24) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Header & Controls */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Advisory Pipeline & Leads</h2>
                <p className="text-xs text-slate-500">Real-time pipeline synced with customer chat and appointments</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search prospect..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00008F]"
                  />
                </div>

                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg py-1.5 px-2 text-xs text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Stages</option>
                  <option value="NEW_LEAD">New Lead</option>
                  <option value="ADVISOR_READY">Advisor Ready</option>
                  <option value="APPOINTMENT_SCHEDULED">Appointment Scheduled</option>
                  <option value="ILLUSTRATION_REVIEW">Illustration Review</option>
                  <option value="UNDERWRITING_SIMULATION">Underwriting</option>
                  <option value="POLICY_ISSUED_SIMULATION">Policy Issued</option>
                </select>
              </div>
            </div>

            {/* Table List */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/75 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Primary Need</th>
                    <th className="p-3">Sales Stage</th>
                    <th className="p-3">Last Activity</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeads.map((lead) => {
                    const isSelected = selectedLead?.id === lead.id;
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/70 font-medium' : ''
                        }`}
                      >
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{lead.customerName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{lead.id}</div>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-800">{lead.primaryNeed}</span>
                          <div className="text-[10px] text-slate-400">{lead.source}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lead.currentStage === 'ADVISOR_READY'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : lead.currentStage === 'APPOINTMENT_SCHEDULED'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                : lead.currentStage.includes('POLICY')
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {lead.currentStage}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-500">
                          {lead.lastInteraction ? new Date(lead.lastInteraction).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                            }}
                            className="px-2.5 py-1 rounded bg-white border border-slate-300 hover:border-[#00008F] hover:text-[#00008F] text-[11px] font-semibold transition-colors"
                          >
                            Inspect 360
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Customer 360 View (Section 25) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedLead ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{selectedLead.customerName}</h3>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {selectedLead.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assigned: <strong>{selectedLead.assignedAdvisorName || primaryAdvisor.displayName}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Stage Controller</div>
                  <select
                    value={selectedLead.currentStage}
                    onChange={(e) => handleStageChange(e.target.value as SalesStage)}
                    className="mt-1 bg-white border border-blue-300 rounded-lg text-xs font-bold text-[#00008F] py-1 px-2 focus:outline-none"
                  >
                    <option value="NEW_LEAD">NEW_LEAD</option>
                    <option value="NEEDS_DISCOVERY">NEEDS_DISCOVERY</option>
                    <option value="FNA_COMPLETE">FNA_COMPLETE</option>
                    <option value="PRODUCT_EDUCATION">PRODUCT_EDUCATION</option>
                    <option value="QUESTIONS_CONCERNS">QUESTIONS_CONCERNS</option>
                    <option value="ADVISOR_READY">ADVISOR_READY</option>
                    <option value="APPOINTMENT_SCHEDULED">APPOINTMENT_SCHEDULED</option>
                    <option value="CONSULTATION_COMPLETE">CONSULTATION_COMPLETE</option>
                    <option value="ILLUSTRATION_REQUESTED">ILLUSTRATION_REQUESTED</option>
                    <option value="APPLICATION_STARTED">APPLICATION_STARTED</option>
                    <option value="UNDERWRITING_SIMULATION">UNDERWRITING_SIMULATION</option>
                    <option value="POLICY_ISSUED_SIMULATION">POLICY_ISSUED_SIMULATION</option>
                  </select>
                </div>
              </div>

              {/* Needs & Financial Overview */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Primary Goal</span>
                  <div className="font-bold text-[#00008F]">{selectedLead.primaryNeed}</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Estimated Budget</span>
                  <div className="font-semibold text-slate-800">
                    {selectedLead.estimatedBudget || activeCustomer?.needsProfile?.monthlyBudget || '₱6k–₱10k / mo'}
                  </div>
                </div>
              </div>

              {/* AI Hand-off Case Summary (Section 20 & 25) */}
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#00008F] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    AI Hand-off Case Summary
                  </span>
                  <span className="text-[10px] font-mono text-blue-700">Grounded from Chat</span>
                </div>
                <div className="text-slate-700 text-[11px] leading-relaxed">
                  {activeCustomer?.needsProfile ? (
                    <div>
                      Prospect is <strong>{activeCustomer.needsProfile.ageRange}</strong>, {activeCustomer.needsProfile.occupation}, with{' '}
                      <strong>{activeCustomer.needsProfile.dependentsCount} dependents</strong>. Existing HMO is limited to{' '}
                      <strong>{activeCustomer.needsProfile.existingHMO}</strong>. Raised concerns about affordability and HMO complementation.
                    </div>
                  ) : (
                    <div>
                      Inquiry initiated via web assistant. Ready for needs analysis and customized product review.
                    </div>
                  )}
                </div>
              </div>

              {/* Next Operational Action */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Suggested Operational Action:</span>
                </div>
                <p className="text-[11px] leading-snug">{selectedLead.nextAction}</p>
              </div>

              {/* Action Buttons: Demo Illustration & Application Simulation */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  onClick={handleStartApplication}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#00008F] hover:bg-blue-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Launch Demo Application</span>
                </button>

                <button
                  onClick={() => setShowFollowUpModal(true)}
                  className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                >
                  + Follow-Up
                </button>
              </div>

              {/* Simulated Application Status if launched */}
              {activeLeadApplication && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-purple-600" />
                      Application Simulation: {activeLeadApplication.productName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-200 text-purple-900">
                      {activeLeadApplication.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-800">
                    Coverage: {activeLeadApplication.coverageAmount} • Mode: {activeLeadApplication.paymentMode}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => appStore.updateApplicationStatus(activeLeadApplication.id, 'APPROVED')}
                      className="px-2 py-1 bg-white border border-purple-300 rounded text-[10px] font-bold text-purple-800 hover:bg-purple-100"
                    >
                      Simulate Underwriting Approval
                    </button>
                    <button
                      onClick={() => appStore.updateApplicationStatus(activeLeadApplication.id, 'POLICY_ISSUED')}
                      className="px-2 py-1 bg-purple-700 text-white rounded text-[10px] font-bold hover:bg-purple-800"
                    >
                      Simulate Policy Issuance
                    </button>
                  </div>
                </div>
              )}

              {/* Advisor Notes Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>Advisor Confidential Notes ({activeLeadNotes.length})</span>
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add operational notes or consultation feedback..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00008F]"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold disabled:bg-slate-300"
                  >
                    Add
                  </button>
                </form>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeLeadNotes.map((note) => (
                    <div key={note.id} className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700">
                      <div className="flex items-center justify-between mb-0.5 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-600">{note.advisorName}</span>
                        <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Select a lead from the table to view the complete Customer 360 profile.
            </div>
          )}
        </div>
      </div>
      )}

      {/* New Follow-up Modal */}
      {showFollowUpModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Schedule Advisory Follow-Up</h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-Up Type</label>
                <select
                  value={newFollowUpType}
                  onChange={(e) => setNewFollowUpType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                >
                  <option>Appointment Reminder</option>
                  <option>Educational Recap</option>
                  <option>Unanswered Question</option>
                  <option>Advisor Invitation</option>
                  <option>Application Reminder</option>
                  <option>Document Reminder</option>
                  <option>Annual Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newFollowUpDate}
                  onChange={(e) => setNewFollowUpDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specific Reminder / Notes</label>
                <textarea
                  value={newFollowUpNotes}
                  onChange={(e) => setNewFollowUpNotes(e.target.value)}
                  placeholder="e.g. Call to discuss spousal feedback on Health Max"
                  className="w-full border border-slate-300 rounded-lg p-2 h-16"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00008F] text-white rounded-lg font-bold hover:bg-blue-900"
                >
                  Schedule Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
