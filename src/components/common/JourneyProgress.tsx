import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Clock,
  AlertCircle,
  ChevronRight,
  Info,
  X,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react';
import { JourneyService, JourneyStage } from '../../services/journeyService';

interface Props {
  stages: JourneyStage[];
  onSelectStage?: (stage: JourneyStage) => void;
  onOpenAdvisorModal?: () => void;
  variant?: 'compact' | 'sidebar' | 'full';
}

export const JourneyProgress: React.FC<Props> = ({
  stages,
  onSelectStage,
  onOpenAdvisorModal,
  variant = 'compact',
}) => {
  const [selectedStageDetail, setSelectedStageDetail] = useState<JourneyStage | null>(null);

  const getStatusIcon = (stage: JourneyStage) => {
    switch (stage.status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'IN_PROGRESS':
        return <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shrink-0" />;
      case 'ACTION_REQUIRED':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />;
      case 'WAITING_FOR_ADVISOR':
      case 'WAITING_FOR_CUSTOMER':
        return <Clock className="w-3 h-3 text-indigo-600 shrink-0" />;
      case 'WAITING_FOR_REVIEW':
        return <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />;
      case 'LOCKED':
      default:
        return <Lock className="w-3 h-3 text-slate-400 shrink-0" />;
    }
  };

  const getStatusBadge = (stage: JourneyStage) => {
    switch (stage.status) {
      case 'COMPLETED':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Done</span>;
      case 'IN_PROGRESS':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#00008F]">Active</span>;
      case 'ACTION_REQUIRED':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">Action</span>;
      case 'WAITING_FOR_ADVISOR':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">Advisor</span>;
      case 'WAITING_FOR_REVIEW':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">Review</span>;
      case 'LOCKED':
      default:
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Locked</span>;
    }
  };

  const completedCount = stages.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs space-y-3">
      {/* Header with progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00008F]" />
            Your Insurance Journey
          </span>
          <span className="font-semibold text-slate-500 text-[11px]">
            {completedCount} of {stages.length} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#00008F] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
        {stages.map((stage) => {
          const isLocked = stage.status === 'LOCKED';
          const isCompleted = stage.status === 'COMPLETED';

          return (
            <button
              key={stage.id}
              onClick={() => {
                setSelectedStageDetail(stage);
                if (!isLocked && onSelectStage) onSelectStage(stage);
              }}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                isCompleted
                  ? 'hover:bg-emerald-50/60 text-slate-800'
                  : stage.status === 'IN_PROGRESS'
                  ? 'bg-blue-50/70 border border-blue-200 text-blue-950 font-semibold'
                  : stage.status === 'ACTION_REQUIRED'
                  ? 'bg-amber-50/60 border border-amber-200 text-amber-950 font-semibold'
                  : isLocked
                  ? 'text-slate-400 hover:bg-slate-50 cursor-pointer'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="text-[11px] font-mono text-slate-400 w-4">{stage.step}</span>
                <div className="shrink-0">{getStatusIcon(stage)}</div>
                <span className="truncate">{stage.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {getStatusBadge(stage)}
                <ChevronRight className="w-3 h-3 text-slate-300" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage Detail / Locked Requirements Modal */}
      {selectedStageDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#00008F] font-bold text-sm">
                  {selectedStageDetail.step}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedStageDetail.name}</h3>
                  <p className="text-[11px] text-slate-500">{selectedStageDetail.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStageDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Gating message */}
            {selectedStageDetail.status === 'LOCKED' ? (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Lock className="w-3.5 h-3.5" />
                  Stage Locked — Requirements Remaining
                </div>
                <p className="text-[11px] text-amber-800">
                  {selectedStageDetail.lockReason || 'Please complete prerequisite stages before unlocking this step.'}
                </p>
              </div>
            ) : selectedStageDetail.status === 'COMPLETED' ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>This stage was successfully completed. You may review your recorded details below.</span>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#00008F] shrink-0" />
                <span>Responsible party: <strong>{selectedStageDetail.responsibleParty}</strong></span>
              </div>
            )}

            {/* Checklist */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Requirements Checklist:
              </span>
              <div className="space-y-1.5">
                {selectedStageDetail.requirements.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                  >
                    <span className={req.completed ? 'text-slate-800' : 'text-slate-500'}>{req.label}</span>
                    {req.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Next: <strong>{selectedStageDetail.nextAction}</strong>
              </span>
              <button
                onClick={() => setSelectedStageDetail(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
