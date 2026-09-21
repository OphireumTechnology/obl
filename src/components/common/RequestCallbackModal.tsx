import React, { useState } from 'react';
import { X, Clock, CheckCircle2, AlertCircle, Phone, Calendar, User, FileText } from 'lucide-react';
import { advisorService } from '../../services/advisorService';
import { appStore } from '../../services/store';

interface RequestCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReason?: string;
  leadId?: string;
}

export const RequestCallbackModal: React.FC<RequestCallbackModalProps> = ({
  isOpen,
  onClose,
  defaultReason = '',
  leadId,
}) => {
  const primaryAdvisor = advisorService.getPrimaryAdvisor();
  const currentUser = appStore.getState().currentUser;
  const activeLead = appStore.getActiveLead();

  const [customerName, setCustomerName] = useState(currentUser.name || activeLead?.customerName || '');
  const [contactNumber, setContactNumber] = useState('+63 918 123 4567');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('Morning (9:00 AM – 12:00 PM)');
  const [primaryReason, setPrimaryReason] = useState(
    defaultReason || 'Clarify critical illness protection and plan suitability'
  );
  const [consentToContact, setConsentToContact] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentToContact) {
      setError('Please provide consent to be contacted regarding your insurance inquiry.');
      return;
    }
    if (!customerName.trim() || !contactNumber.trim()) {
      setError('Please provide your name and contact phone number.');
      return;
    }

    advisorService.requestCallback({
      leadId: leadId || activeLead?.id,
      customerName: customerName.trim(),
      preferredContactNumber: contactNumber.trim(),
      preferredDate,
      preferredTime,
      primaryReason,
      advisorId: primaryAdvisor.advisorId || primaryAdvisor.id,
      advisorName: primaryAdvisor.fullName || primaryAdvisor.name,
      consentToContact: true,
    });

    setSubmitted(true);
  };

  return (
    <div
      id="request-callback-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="request-callback-modal-card"
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/40 flex items-center justify-center text-red-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Request a Callback</h3>
              <p className="text-xs text-slate-300">Designated Advisor: {primaryAdvisor.fullName}</p>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-callback-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div id="callback-success-view" className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Callback Request Received</h4>
              <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Thank you, <span className="font-semibold text-slate-900">{customerName}</span>. Your request has been logged and assigned to{' '}
                <span className="font-bold text-red-600">{primaryAdvisor.fullName}</span> ({primaryAdvisor.role}).
              </p>

              <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Preferred Date:</span>
                  <span className="font-semibold">{preferredDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Preferred Window:</span>
                  <span className="font-semibold">{preferredTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-semibold">{contactNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Inquiry:</span>
                  <span className="font-semibold max-w-[200px] truncate">{primaryReason}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  id="btn-callback-success-done"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Return to Exploration
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" id="form-request-callback">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Advisor Assignment Callout */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {primaryAdvisor.fullName ? primaryAdvisor.fullName.charAt(0) : 'B'}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">Assigned Advisor</span>
                  <p className="font-bold text-slate-900 truncate">{primaryAdvisor.fullName}</p>
                  <p className="text-slate-500">{primaryAdvisor.role} • {primaryAdvisor.mobilePhone}</p>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cb-customer-name">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="cb-customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cb-contact-number">
                  Preferred Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="cb-contact-number"
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                    placeholder="+63 9xx xxx xxxx"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cb-preferred-date">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      id="cb-preferred-date"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cb-preferred-time">
                    Preferred Time Window
                  </label>
                  <select
                    id="cb-preferred-time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white"
                  >
                    <option value="Morning (9:00 AM – 12:00 PM)">Morning (9:00 AM – 12:00 PM)</option>
                    <option value="Afternoon (1:00 PM – 5:00 PM)">Afternoon (1:00 PM – 5:00 PM)</option>
                    <option value="Evening (5:00 PM – 7:30 PM)">Evening (5:00 PM – 7:30 PM)</option>
                    <option value="Anytime during business hours">Anytime during business hours</option>
                  </select>
                </div>
              </div>

              {/* Primary Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cb-primary-reason">
                  Primary Reason for Inquiry
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    id="cb-primary-reason"
                    type="text"
                    value={primaryReason}
                    onChange={(e) => setPrimaryReason(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden"
                    placeholder="e.g., Clarify product details, discuss family protection budget"
                  />
                </div>
              </div>

              {/* Consent to Contact Checkbox (Mandatory per Section 81) */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    id="cb-consent-checkbox"
                    type="checkbox"
                    checked={consentToContact}
                    onChange={(e) => {
                      setConsentToContact(e.target.checked);
                      if (e.target.checked) setError(null);
                    }}
                    className="mt-0.5 rounded text-red-600 focus:ring-red-500 h-4 w-4 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 font-medium leading-tight">
                    I agree to be contacted regarding my insurance inquiry.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="btn-cancel-callback"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-callback"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-xs"
                >
                  Submit Callback Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
