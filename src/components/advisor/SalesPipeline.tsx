import React, { useState } from 'react';
import {
  Users,
  ChevronRight,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Lead, SalesStage } from '../../types';

interface Props {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const PIPELINE_STAGES: { id: SalesStage; label: string; color: string }[] = [
  { id: 'NEW', label: 'New', color: 'border-slate-300' },
  { id: 'NEEDS_DISCOVERY', label: 'Needs Discovery', color: 'border-blue-300' },
  { id: 'FNA_COMPLETE', label: 'FNA Complete', color: 'border-blue-400' },
  { id: 'PRODUCT_EXPLORATION', label: 'Product Education', color: 'border-indigo-300' },
  { id: 'QUESTIONS_IDENTIFIED', label: 'Questions', color: 'border-amber-300' },
  { id: 'ADVISOR_READY', label: 'Advisor Ready', color: 'border-emerald-400' },
  { id: 'APPOINTMENT_SCHEDULED', label: 'Consultation', color: 'border-emerald-500' },
  { id: 'OFFICIAL_ILLUSTRATION_REQUESTED', label: 'Illustration', color: 'border-purple-400' },
  { id: 'APPLICATION_IN_PROGRESS', label: 'Application', color: 'border-purple-500' },
  { id: 'UNDERWRITING_REVIEW', label: 'Underwriting', color: 'border-cyan-500' },
  { id: 'POLICY_ISSUED', label: 'Customer', color: 'border-emerald-600' },
  { id: 'POST_SALE_FOLLOWUP', label: 'Follow-Up', color: 'border-slate-400' },
];

export const SalesPipeline: React.FC<Props> = ({ leads, onSelectLead }) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter((lead) =>
    lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.primaryNeed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prospect name or protection need..."
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'kanban'
                ? 'bg-[#00008F] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-[#00008F] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 items-start min-h-[500px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.currentStage === stage.id);
            return (
              <div
                key={stage.id}
                className="w-64 shrink-0 bg-slate-50 rounded-xl border border-slate-200 flex flex-col max-h-[calc(100vh-14rem)] shadow-2xs"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-xl">
                  <div className="font-bold text-xs text-slate-800 truncate">
                    {stage.label}
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                  {stageLeads.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-400">
                      No prospects
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => onSelectLead(lead)}
                        className={`p-3 bg-white rounded-xl border-l-4 ${stage.color} border-y border-r border-slate-200 shadow-2xs hover:shadow-sm hover:border-[#00008F] cursor-pointer transition-all space-y-1.5`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {lead.customerName}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {lead.id}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#00008F] font-semibold">
                          {lead.primaryNeed}
                        </div>

                        <div className="text-[10px] text-slate-500 line-clamp-2">
                          {lead.notes || 'Needs profile captured.'}
                        </div>

                        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{lead.lastActive}</span>
                          <span className="text-[#00008F] font-bold flex items-center gap-0.5">
                            Open 360 →
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Customer</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Primary Need</th>
                <th className="p-3">Monthly Budget</th>
                <th className="p-3">Last Active</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-bold text-slate-900">{lead.customerName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#00008F] border border-blue-200">
                      {lead.currentStage}
                    </span>
                  </td>
                  <td className="p-3 text-[#00008F] font-medium">{lead.primaryNeed}</td>
                  <td className="p-3 font-mono">{lead.estimatedBudget || '₱6,000–₱10,000'}</td>
                  <td className="p-3 text-slate-400">{lead.lastActive}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLead(lead);
                      }}
                      className="text-xs font-bold text-[#00008F] hover:underline"
                    >
                      Open Customer 360 →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
