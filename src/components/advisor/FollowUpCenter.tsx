import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  PhoneCall,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { FollowUp, Lead } from '../../types';

interface Props {
  followUps: FollowUp[];
  leads: Lead[];
  onOpenCustomer360: (lead: Lead) => void;
}

export const FollowUpCenter: React.FC<Props> = ({
  followUps,
  leads,
  onOpenCustomer360,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');

  const filtered = followUps.filter((f) => {
    if (filter === 'ALL') return true;
    return f.status === filter;
  });

  const handleComplete = (id: string) => {
    appStore.updateFollowUpStatus(id, 'COMPLETED');
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Follow-Up Center & Task Queue</h2>
          <p className="text-xs text-slate-500">
            Timely advisor outreach to prevent stalled customer journeys
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              filter === 'PENDING' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600'
            }`}
          >
            Due & Pending
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              filter === 'COMPLETED' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              filter === 'ALL' ? 'bg-white text-[#00008F] shadow-xs' : 'text-slate-600'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Follow-Up List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No follow-ups matching filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => {
              const lead = leads.find((l) => l.customerId === item.customerId) || leads[0];
              const isCompleted = item.status === 'COMPLETED';

              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.customerName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700">
                      <strong>Reason: </strong> {item.notes || item.type}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Due: <strong>{item.dueDate}</strong></span>
                      <span>•</span>
                      <span>Channel: <strong>{item.channel}</strong></span>
                      <span>•</span>
                      <span>Stage: <strong>{lead?.currentStage || 'CONSULTATION'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isCompleted && (
                      <button
                        onClick={() => handleComplete(item.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Done</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenCustomer360(lead)}
                      className="px-3 py-1.5 bg-[#00008F] hover:bg-blue-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Open 360</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
