import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Phone,
  Video,
  MapPin,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { Appointment, Lead } from '../../types';

interface Props {
  appointments: Appointment[];
  leads: Lead[];
  onOpenCustomer360: (lead: Lead) => void;
}

export const AppointmentCenter: React.FC<Props> = ({
  appointments,
  leads,
  onOpenCustomer360,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED'>('CONFIRMED');

  const filtered = appointments.filter((apt) => {
    if (activeFilter === 'ALL') return true;
    return apt.status === activeFilter;
  });

  const handleStatusChange = (id: string, newStatus: Appointment['status']) => {
    appStore.updateAppointmentStatus(id, newStatus);
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Appointment Management & Calendar</h2>
          <p className="text-xs text-slate-500">
            Confirmed consultations and customer-requested appointments
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveFilter('CONFIRMED')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              activeFilter === 'CONFIRMED' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600'
            }`}
          >
            Confirmed & Upcoming
          </button>
          <button
            onClick={() => setActiveFilter('COMPLETED')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              activeFilter === 'COMPLETED' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              activeFilter === 'ALL' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No appointments found for this filter.
          </div>
        ) : (
          filtered.map((apt) => {
            const lead = leads.find((l) => l.customerId === apt.customerId) || leads[0];
            const isCompleted = apt.status === 'COMPLETED';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#00008F] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {apt.customerName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-[#00008F]'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-[#00008F]">
                      <Calendar className="w-3.5 h-3.5" />
                      {apt.date} at {apt.time}
                    </span>
                    <span>•</span>
                    <span className="capitalize flex items-center gap-1">
                      {apt.type === 'video' ? <Video className="w-3.5 h-3.5 text-blue-600" /> : <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                      {apt.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Topic: <strong>{apt.preferredTopic || 'Protection & HMO Living-Cost Review'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'COMPLETED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenCustomer360(lead)}
                    className="px-3.5 py-1.5 bg-[#00008F] hover:bg-blue-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Open Case & Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
