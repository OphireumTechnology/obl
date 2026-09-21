import React, { useEffect, useState } from 'react';
import { Phone, Calendar, Clock, ShieldCheck, UserCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Advisor } from '../../types';
import { advisorService } from '../../services/advisorService';

interface AdvisorContactCardProps {
  advisorId?: string;
  variant?: 'card' | 'compact' | 'banner';
  onScheduleAppointment?: () => void;
  onRequestCallback?: () => void;
  onRequestConsultation?: () => void;
  showCredentials?: boolean;
}

export const AdvisorContactCard: React.FC<AdvisorContactCardProps> = ({
  advisorId,
  variant = 'card',
  onScheduleAppointment,
  onRequestCallback,
  onRequestConsultation,
  showCredentials = true,
}) => {
  const [advisor, setAdvisor] = useState<Advisor>(() => {
    return advisorId ? advisorService.getAdvisor(advisorId) || advisorService.getPrimaryAdvisor() : advisorService.getPrimaryAdvisor();
  });

  useEffect(() => {
    const update = () => {
      const current = advisorId
        ? advisorService.getAdvisor(advisorId) || advisorService.getPrimaryAdvisor()
        : advisorService.getPrimaryAdvisor();
      setAdvisor(current);
    };

    update();
    const unsubscribe = advisorService.subscribe(update);
    return () => unsubscribe();
  }, [advisorId]);

  const telLink = advisorService.formatTelUri(advisor.mobilePhone || '+639686471868');

  // Compact variant for chat message bubbles or product sidebar
  if (variant === 'compact') {
    return (
      <div id="advisor-contact-card-compact" className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 text-sm shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 block">Designated Advisor</span>
            <h4 className="font-bold text-slate-900 text-base">{advisor.fullName || advisor.name}</h4>
            <p className="text-xs text-slate-600 font-medium">{advisor.role || advisor.title}</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {advisor.availabilityStatus || 'AVAILABLE'}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
          <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span className="font-semibold">Mobile:</span>
          <a
            href={telLink}
            id="advisor-contact-tel-compact"
            className="text-red-700 hover:text-red-800 font-bold hover:underline transition-colors"
            title="Click to place phone call"
          >
            {advisor.mobilePhone || '+63 968 647 1868'}
          </a>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 pt-1 border-t border-slate-200">
          <a
            href={telLink}
            id="btn-call-advisor-compact"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            <Phone className="w-3 h-3" />
            Call Advisor
          </a>
          {onScheduleAppointment && (
            <button
              type="button"
              id="btn-schedule-advisor-compact"
              onClick={onScheduleAppointment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-xs"
            >
              <Calendar className="w-3 h-3" />
              Schedule Appointment
            </button>
          )}
          {onRequestCallback && (
            <button
              type="button"
              id="btn-callback-advisor-compact"
              onClick={onRequestCallback}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Clock className="w-3 h-3 text-slate-500" />
              Request Callback
            </button>
          )}
        </div>
      </div>
    );
  }

  // Banner variant for dashboards
  if (variant === 'banner') {
    return (
      <div id="advisor-contact-banner" className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 border border-red-900/30 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 font-bold text-lg">
              {advisor.fullName ? advisor.fullName.charAt(0) : 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-semibold tracking-wider text-red-400">Primary Designated Advisor</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {advisor.status || 'ACTIVE'} ({advisor.environment || 'DEMO'})
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">{advisor.fullName || advisor.name}</h3>
              <p className="text-xs text-slate-300">{advisor.role || advisor.title} • {advisor.mobilePhone || '+63 968 647 1868'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={telLink}
              id="btn-banner-call-advisor"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Advisor
            </a>
            {onScheduleAppointment && (
              <button
                type="button"
                id="btn-banner-schedule-appointment"
                onClick={onScheduleAppointment}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors shadow-xs"
              >
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                Schedule Consultation
              </button>
            )}
            {onRequestCallback && (
              <button
                type="button"
                id="btn-banner-request-callback"
                onClick={onRequestCallback}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                Request Callback
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default Standard Card variant
  return (
    <div id="advisor-contact-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header Accent */}
      <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold tracking-wide uppercase text-slate-200">Your Insurance Advisor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-300">{advisor.availabilityStatus || 'AVAILABLE'}</span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            {advisor.fullName ? advisor.fullName.charAt(0) : 'B'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{advisor.fullName || advisor.name}</h3>
            <p className="text-xs font-medium text-slate-600 mt-0.5">{advisor.role || advisor.title}</p>
            <div className="mt-2.5 inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800">
              <Phone className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="font-semibold text-slate-500">Mobile:</span>
              <a
                href={telLink}
                id="advisor-card-phone-link"
                className="font-bold text-red-700 hover:text-red-800 hover:underline transition-colors"
                title="Click to dial"
              >
                {advisor.mobilePhone || '+63 968 647 1868'}
              </a>
            </div>
          </div>
        </div>

        {/* Credentials Breakdown (Explicitly honest per Section 74) */}
        {showCredentials && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
              <span className="text-slate-400 block font-medium">Advisor Code</span>
              <span className="font-semibold text-slate-700">{advisorService.formatCredential(advisor.advisorCode, 'NOT PROVIDED')}</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
              <span className="text-slate-400 block font-medium">License / Accreditation</span>
              <span className="font-semibold text-slate-700">{advisorService.formatCredential(advisor.licenseNumber, 'NOT PROVIDED')}</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
              <span className="text-slate-400 block font-medium">Official Email</span>
              <span className="font-semibold text-slate-700">{advisorService.formatCredential(advisor.email, 'NOT PROVIDED')}</span>
            </div>
            <div className="bg-slate-50/70 p-2 rounded-lg border border-slate-100">
              <span className="text-slate-400 block font-medium">Verification Status</span>
              <span className="font-semibold text-amber-700 inline-flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                {advisor.credentialVerificationStatus || 'PENDING VERIFICATION'}
              </span>
            </div>
          </div>
        )}

        {/* Consultation Methods */}
        <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-500">
          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Consultation Modes:</span>
          <span className="font-medium text-slate-700">Phone • Video (Demo) • In Person (Demo)</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <a
            href={telLink}
            id="btn-card-call-advisor"
            className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            Call Advisor
          </a>

          {onScheduleAppointment && (
            <button
              type="button"
              id="btn-card-schedule-appointment"
              onClick={onScheduleAppointment}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              Schedule Appointment
            </button>
          )}

          {onRequestCallback && (
            <button
              type="button"
              id="btn-card-request-callback"
              onClick={onRequestCallback}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Ask Advisor to Contact Me (Request Callback)
            </button>
          )}

          {onRequestConsultation && !onScheduleAppointment && (
            <button
              type="button"
              id="btn-card-request-consultation"
              onClick={onRequestConsultation}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              Request Consultation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
