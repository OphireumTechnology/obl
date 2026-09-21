import React from 'react';
import {
  Calendar,
  Clock,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Users,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { Advisor, Appointment, CallbackRequest, FollowUp, Lead } from '../../types';

interface Props {
  advisor: Advisor;
  leads: Lead[];
  appointments: Appointment[];
  callbacks: CallbackRequest[];
  followUps: FollowUp[];
  onOpenCustomer360: (lead: Lead) => void;
  onNavigateToTab: (tab: 'pipeline' | 'appointments' | 'callbacks' | 'leads') => void;
}

export const AdvisorHome: React.FC<Props> = ({
  advisor,
  leads,
  appointments,
  callbacks,
  followUps,
  onOpenCustomer360,
  onNavigateToTab,
}) => {
  // Compute TODAY metrics (Focused 5 KPIs only, Section 15)
  const todayAppointments = appointments.filter(
    (a) => a.date.includes('2026-03-21') || a.status === 'CONFIRMED'
  );
  const pendingCallbacks = callbacks.filter((c) => c.status === 'PENDING');
  const dueFollowUps = followUps.filter((f) => f.status === 'PENDING');
  const advisorReadyLeads = leads.filter(
    (l) => l.currentStage === 'ADVISOR_READY' || l.currentStage === 'APPOINTMENT_SCHEDULED'
  );
  const customersWaiting = pendingCallbacks.length + advisorReadyLeads.length;

  // Priority actionable leads
  const priorityLead = advisorReadyLeads[0] || leads[0];

  return (
    <div className="space-y-6">
      {/* Personalized Greeting Header */}
      <div className="bg-gradient-to-r from-[#00008F] to-[#000055] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-blue-200 uppercase block mb-1">
            Advisor Command Center
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Good afternoon, Bishop Orly.
          </h1>
          <p className="text-xs text-blue-100/80 mt-1 max-w-xl">
            You have {customersWaiting} customer{customersWaiting === 1 ? '' : 's'} waiting for operational action or consultation today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToTab('pipeline')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>Sales Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TODAY Focused Metrics (Section 15: Appointments, Callbacks, Follow-ups, Customers Waiting, Advisor-Ready) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => onNavigateToTab('appointments')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#00008F] text-left transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Appointments</span>
            <Calendar className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{todayAppointments.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Scheduled today</div>
        </button>

        <button
          onClick={() => onNavigateToTab('callbacks')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#00008F] text-left transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Callbacks</span>
            <PhoneCall className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingCallbacks.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Customer requests</div>
        </button>

        <button
          onClick={() => onNavigateToTab('callbacks')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#00008F] text-left transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Follow-Ups</span>
            <Clock className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{dueFollowUps.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Due today</div>
        </button>

        <button
          onClick={() => onNavigateToTab('leads')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#00008F] text-left transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Waiting</span>
            <Users className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{customersWaiting}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Needs action</div>
        </button>

        <button
          onClick={() => onNavigateToTab('pipeline')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-[#00008F] text-left transition-all shadow-xs group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Advisor Ready</span>
            <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{advisorReadyLeads.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Qualified leads</div>
        </button>
      </div>

      {/* Priority Action Hero (Section 15: Maria Santos Example) */}
      {priorityLead && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Priority Action Required
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Waiting 18 minutes
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{priorityLead.customerName}</span>
                <span className="text-xs font-normal text-slate-500">({priorityLead.id})</span>
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                <strong>Intent: </strong> {priorityLead.primaryNeed} • Budget: {priorityLead.estimatedBudget}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI brief prepared • Customer explored AXA Health Max and requested advisor consultation.
              </p>
            </div>

            <button
              onClick={() => onOpenCustomer360(priorityLead)}
              className="px-4 py-2 bg-[#00008F] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
            >
              <span>Open Case & Customer 360</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Grid: Today's Appointments & Follow-Ups Due */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00008F]" />
              <h2 className="font-bold text-slate-900 text-sm">Today's Appointments</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('appointments')}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              View Calendar →
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No appointments scheduled for today.
            </div>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((apt) => {
                const lead = leads.find((l) => l.customerId === apt.customerId) || leads[0];
                return (
                  <div
                    key={apt.id}
                    className="p-3 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {apt.customerName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-[#00008F]">{apt.time}</span>
                        <span>•</span>
                        <span>{apt.preferredTopic || 'Protection Review'}</span>
                        <span>•</span>
                        <span className="capitalize">{apt.type}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenCustomer360(lead)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors shrink-0"
                    >
                      Open Case
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Follow-Ups Due */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="font-bold text-slate-900 text-sm">Follow-Ups Due</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('callbacks')}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              All Follow-Ups →
            </button>
          </div>

          {dueFollowUps.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              All follow-up actions up to date.
            </div>
          ) : (
            <div className="space-y-2">
              {dueFollowUps.slice(0, 4).map((f) => {
                const lead = leads.find((l) => l.customerId === f.customerId) || leads[0];
                return (
                  <div
                    key={f.id}
                    className="p-3 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl border border-slate-200 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {f.customerName}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5 truncate">
                        {f.notes || f.type}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Due: {f.dueDate} • Via {f.channel}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenCustomer360(lead)}
                      className="px-3 py-1.5 bg-[#00008F] hover:bg-blue-900 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                    >
                      Complete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recently Advisor-Ready Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">Recently Advisor Ready</h2>
          </div>
          <button
            onClick={() => onNavigateToTab('leads')}
            className="text-xs text-blue-700 hover:underline font-semibold"
          >
            All Qualified Leads →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {advisorReadyLeads.slice(0, 3).map((lead) => (
            <div
              key={lead.id}
              className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 hover:border-[#00008F] transition-all space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs truncate">
                    {lead.customerName}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                    {lead.currentStage}
                  </span>
                </div>
                <p className="text-[11px] text-[#00008F] font-semibold mt-1">
                  {lead.primaryNeed}
                </p>
                <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                  {lead.notes || 'Needs profile captured. Ready for official consultation & HMO comparison.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Score: {lead.salesReadinessScore}/100
                </span>
                <button
                  onClick={() => onOpenCustomer360(lead)}
                  className="text-xs text-[#00008F] hover:underline font-bold"
                >
                  Review Case →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
