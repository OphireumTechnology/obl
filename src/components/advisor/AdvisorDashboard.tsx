import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GitPullRequest,
  Calendar,
  Clock,
  User,
  Shield,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { advisorService } from '../../services/advisorService';
import { Advisor, Appointment, CallbackRequest, FollowUp, Lead } from '../../types';
import { AdvisorHome } from './AdvisorHome';
import { SalesPipeline } from './SalesPipeline';
import { Customer360 } from './Customer360';
import { FollowUpCenter } from './FollowUpCenter';
import { AppointmentCenter } from './AppointmentCenter';

interface Props {
  onNavigateToChat?: () => void;
}

type AdvisorView = 'overview' | 'pipeline' | 'appointments' | 'callbacks' | 'customer360';

export const AdvisorDashboard: React.FC<Props> = ({ onNavigateToChat }) => {
  const [currentView, setCurrentView] = useState<AdvisorView>('overview');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [primaryAdvisor, setPrimaryAdvisor] = useState<Advisor>(advisorService.getPrimaryAdvisor());

  useEffect(() => {
    const update = () => {
      const state = appStore.getState();
      setLeads(state.leads);
      setAppointments(state.appointments);
      setCallbacks(state.callbacks || []);
      setFollowUps(state.followUps);
      setPrimaryAdvisor(advisorService.getPrimaryAdvisor());

      if (selectedLead) {
        const refreshed = state.leads.find((l) => l.id === selectedLead.id);
        if (refreshed) setSelectedLead(refreshed);
      } else if (state.leads.length > 0) {
        setSelectedLead(state.leads[0]);
      }
    };

    update();
    const unsub = appStore.subscribe(update);
    return () => unsub();
  }, []);

  const handleOpenCustomer360 = (lead: Lead) => {
    setSelectedLead(lead);
    setCurrentView('customer360');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
      {/* Advisor Sub-Navigation Bar (Section 14) */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentView('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'overview'
                ? 'bg-[#00008F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setCurrentView('pipeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'pipeline'
                ? 'bg-[#00008F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Sales Pipeline</span>
          </button>

          <button
            onClick={() => setCurrentView('appointments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'appointments'
                ? 'bg-[#00008F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Appointments ({appointments.filter((a) => a.status === 'CONFIRMED').length})</span>
          </button>

          <button
            onClick={() => setCurrentView('callbacks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'callbacks'
                ? 'bg-[#00008F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Follow-Ups & Callbacks ({callbacks.filter((c) => c.status === 'PENDING').length + followUps.filter((f) => f.status === 'PENDING').length})</span>
          </button>

          {selectedLead && (
            <button
              onClick={() => setCurrentView('customer360')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                currentView === 'customer360'
                  ? 'bg-[#00008F] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer 360: {selectedLead.customerName}</span>
            </button>
          )}
        </div>

        {/* Advisor Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-7 h-7 rounded-full bg-[#00008F] text-white flex items-center justify-center font-bold text-[10px]">
            BL
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900 block leading-tight">{primaryAdvisor.fullName}</span>
            <span className="text-[10px] text-slate-400">Licensed Insurance Advisor</span>
          </div>
        </div>
      </div>

      {/* VIEW SWITCHER */}
      {currentView === 'overview' && (
        <AdvisorHome
          advisor={primaryAdvisor}
          leads={leads}
          appointments={appointments}
          callbacks={callbacks}
          followUps={followUps}
          onOpenCustomer360={handleOpenCustomer360}
          onNavigateToTab={(tab) => {
            if (tab === 'pipeline') setCurrentView('pipeline');
            else if (tab === 'appointments') setCurrentView('appointments');
            else if (tab === 'callbacks') setCurrentView('callbacks');
            else if (tab === 'leads') setCurrentView('pipeline');
          }}
        />
      )}

      {currentView === 'pipeline' && (
        <SalesPipeline
          leads={leads}
          onSelectLead={handleOpenCustomer360}
        />
      )}

      {currentView === 'appointments' && (
        <AppointmentCenter
          appointments={appointments}
          leads={leads}
          onOpenCustomer360={handleOpenCustomer360}
        />
      )}

      {currentView === 'callbacks' && (
        <FollowUpCenter
          followUps={followUps}
          leads={leads}
          onOpenCustomer360={handleOpenCustomer360}
        />
      )}

      {currentView === 'customer360' && selectedLead && (
        <Customer360
          lead={selectedLead}
          advisor={primaryAdvisor}
          onBack={() => setCurrentView('overview')}
          onNavigateToChat={onNavigateToChat}
        />
      )}
    </div>
  );
};
