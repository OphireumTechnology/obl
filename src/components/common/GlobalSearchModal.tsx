import React, { useState } from 'react';
import {
  Search,
  X,
  FileText,
  User,
  Shield,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { appStore } from '../../services/store';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const GlobalSearchModal: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  if (!isOpen) return null;

  const state = appStore.getState();
  const lower = query.toLowerCase().trim();

  const filteredProducts = lower
    ? state.products.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.primaryNeed.toLowerCase().includes(lower)
      )
    : state.products.slice(0, 3);

  const filteredLeads = lower
    ? state.leads.filter(
        (l) =>
          l.customerName.toLowerCase().includes(lower) ||
          l.primaryNeed.toLowerCase().includes(lower) ||
          l.currentStage.toLowerCase().includes(lower)
      )
    : state.leads.slice(0, 3);

  const filteredFaqs = lower
    ? state.faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(lower) ||
          f.answer.toLowerCase().includes(lower) ||
          f.category.toLowerCase().includes(lower)
      )
    : state.faqs.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in duration-150">
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search AXA products, leads, customers, FAQs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-slate-900 text-sm focus:outline-none placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {/* Products */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#00008F]" />
              Products ({filteredProducts.length})
            </div>
            {filteredProducts.length === 0 ? (
              <p className="text-xs text-slate-400 pl-4 py-1">No products found</p>
            ) : (
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate('/products');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800 group-hover:text-[#00008F]">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.category} • Primary Need: {p.primaryNeed}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Leads (Internal) */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C91432]" />
              Leads & Customers ({filteredLeads.length})
            </div>
            {filteredLeads.length === 0 ? (
              <p className="text-xs text-slate-400 pl-4 py-1">No leads found</p>
            ) : (
              <div className="space-y-1">
                {filteredLeads.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      appStore.setActiveLead(l.id);
                      onNavigate('/advisor');
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-800 group-hover:text-[#C91432]">
                        {l.customerName}
                      </div>
                      <div className="text-xs text-slate-500">
                        Need: {l.primaryNeed} • Stage: {l.currentStage}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {l.id}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FAQs */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              Verified FAQs ({filteredFaqs.length})
            </div>
            <div className="space-y-1">
              {filteredFaqs.map((f) => (
                <div key={f.id} className="p-2.5 bg-slate-50 rounded-lg text-xs">
                  <div className="font-semibold text-slate-800 mb-1">{f.question}</div>
                  <div className="text-slate-600 line-clamp-2">{f.answer}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Press ESC or click close to dismiss</span>
          <span className="font-mono text-[11px] text-slate-400">AXA Knowledge Engine</span>
        </div>
      </div>
    </div>
  );
};
