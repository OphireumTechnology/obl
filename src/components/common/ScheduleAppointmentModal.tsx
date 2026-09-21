import React, { useState } from 'react';
import { X, Calendar, Clock, Phone, Video, Users, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { advisorService } from '../../services/advisorService';
import { appStore } from '../../services/store';

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  defaultTopic?: string;
}

export const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  leadId,
  defaultTopic = 'Comprehensive Insurance Review & Plan Suitability',
}) => {
  const primaryAdvisor = advisorService.getPrimaryAdvisor();
  const activeLead = appStore.getActiveLead();
  const currentUser = appStore.getState().currentUser;

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00 AM');
  const [consultationMode, setConsultationMode] = useState<'PHONE' | 'VIDEO' | 'IN_PERSON'>('PHONE');
  const [topic, setTopic] = useState(defaultTopic);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const modeLabel =
      consultationMode === 'PHONE'
        ? 'Phone Consultation'
        : consultationMode === 'VIDEO'
        ? 'Video Consultation (Demo)'
        : 'In-Person Consultation (Demo)';

    const consultationModeValue: 'Phone' | 'Video' | 'In Person — Demo' =
      consultationMode === 'PHONE'
        ? 'Phone'
        : consultationMode === 'VIDEO'
        ? 'Video'
        : 'In Person — Demo';

    appStore.bookAppointment({
      leadId: leadId || activeLead?.id || 'lead-101',
      customerId: activeLead?.customerId || 'cust-1',
      customerName: currentUser.name || activeLead?.customerName || 'Maria Santos',
      advisorId: primaryAdvisor.advisorId || primaryAdvisor.id,
      advisorName: primaryAdvisor.fullName || primaryAdvisor.name,
      date,
      time,
      notes: `[Topic: ${topic}] ${notes} [Mode: ${modeLabel}]`.trim(),
      consultationMode: consultationModeValue,
      status: 'CONFIRMED',
    });

    setSubmitted(true);
  };

  return (
    <div
      id="schedule-appointment-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="schedule-appointment-modal-card"
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Demo Appointment Badge */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Schedule Consultation</h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  DEMO APPOINTMENT
                </span>
              </div>
              <p className="text-xs text-slate-300">Designated Advisor: {primaryAdvisor.fullName}</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-appointment-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div id="appointment-success-view" className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Consultation Scheduled!</h4>
              <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Your consultation has been booked with{' '}
                <span className="font-bold text-red-600">{primaryAdvisor.fullName}</span> ({primaryAdvisor.role}).
              </p>

              <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Advisor:</span>
                  <span className="font-bold text-slate-900">{primaryAdvisor.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Phone:</span>
                  <span className="font-semibold">{primaryAdvisor.mobilePhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold">{date} at {time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="font-semibold">
                    {consultationMode === 'PHONE'
                      ? 'Phone Call'
                      : consultationMode === 'VIDEO'
                      ? 'Video Conference (Demo)'
                      : 'In-Person Meeting (Demo)'}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Demo Environment:</strong> This appointment is recorded in the simulated system pipeline and advisor dashboard. No external calendar invitation has been generated.
                </span>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  id="btn-appointment-success-done"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-4" id="form-schedule-appointment">
              {/* Advisor Card Header */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {primaryAdvisor.fullName ? primaryAdvisor.fullName.charAt(0) : 'B'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">Licensed Advisor</span>
                    <h4 className="font-bold text-slate-900 text-xs">{primaryAdvisor.fullName}</h4>
                    <p className="text-[11px] text-slate-500">{primaryAdvisor.mobilePhone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {primaryAdvisor.availabilityStatus || 'AVAILABLE'}
                  </span>
                </div>
              </div>

              {/* Consultation Methods Supported (Section 80) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Consultation Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="btn-mode-phone"
                    onClick={() => setConsultationMode('PHONE')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      consultationMode === 'PHONE'
                        ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-xs font-bold">Phone</span>
                    <span className="text-[10px] text-slate-500">Direct Call</span>
                  </button>

                  <button
                    type="button"
                    id="btn-mode-video"
                    onClick={() => setConsultationMode('VIDEO')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      consultationMode === 'VIDEO'
                        ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-xs font-bold">Video</span>
                    <span className="text-[10px] text-slate-500">Demo</span>
                  </button>

                  <button
                    type="button"
                    id="btn-mode-inperson"
                    onClick={() => setConsultationMode('IN_PERSON')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      consultationMode === 'IN_PERSON'
                        ? 'border-red-600 bg-red-50 text-red-700 ring-2 ring-red-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold">In Person</span>
                    <span className="text-[10px] text-slate-500">Demo</span>
                  </button>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="apt-date">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      id="apt-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="apt-time">
                    Preferred Time
                  </label>
                  <select
                    id="apt-time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Topic / Discussion Focus */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="apt-topic">
                  Consultation Focus
                </label>
                <input
                  id="apt-topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                  placeholder="e.g., Critical Illness coverage, retirement calculation"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="apt-notes">
                  Additional Notes for Advisor (Optional)
                </label>
                <textarea
                  id="apt-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden resize-none"
                  placeholder="Share any specific questions or existing policies you want reviewed..."
                />
              </div>

              {/* Explicit Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  This scheduling action is recorded in the AXA Demo CRM under advisor <strong>{primaryAdvisor.fullName}</strong>.
                </span>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="btn-cancel-appointment"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-appointment"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
                >
                  Confirm Demo Appointment
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
