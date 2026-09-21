import React, { useState } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  X,
  FileText,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { appStore } from '../../services/store';
import { Product, ProductBenefit } from '../../types';
import { AdvisorContactCard } from '../common/AdvisorContactCard';
import { ScheduleAppointmentModal } from '../common/ScheduleAppointmentModal';
import { RequestCallbackModal } from '../common/RequestCallbackModal';

interface Props {
  onNavigateToChat: () => void;
}

export const ProductExplorer: React.FC<Props> = ({ onNavigateToChat }) => {
  const products = appStore.getState().products;
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);

  const categories = ['ALL', 'Critical Illness', 'Health & Medical', 'Life Insurance', 'Investment-Linked'];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primaryNeed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const toggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter((item) => item !== id));
    } else {
      if (compareList.length < 3) {
        setCompareList([...compareList, id]);
      }
    }
  };

  const comparedProducts = products.filter((p) => compareList.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00008F]">
              Official Catalog
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              VERIFIED KNOWLEDGE BASE
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">AXA Product Explorer & Comparison</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse verified coverage solutions grounded in official AXA Philippines policy contracts
          </p>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="px-4 py-2 rounded-xl bg-[#00008F] text-white text-xs font-bold hover:bg-blue-900 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Compare Selected ({compareList.length})</span>
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c
                  ? 'bg-[#00008F] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by need or benefit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#00008F]"
          />
        </div>
      </div>

      {/* Primary Advisor Support Banner (#82) */}
      <AdvisorContactCard
        variant="banner"
        onScheduleAppointment={() => setShowAppointmentModal(true)}
        onRequestCallback={() => setShowCallbackModal(true)}
      />

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => {
          const isComparing = compareList.includes(p.id);
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-[#00008F] hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00008F]">
                    {p.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {p.verificationStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{p.name}</h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">{p.shortDescription}</p>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl mb-4">
                  <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
                    Core Highlights
                  </div>
                  {p.benefits.slice(0, 3).map((b: ProductBenefit, i: number) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b.title}: {b.description}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>
                    Eligibility: <strong>{p.eligibility.minAge}–{p.eligibility.maxAge} years old</strong>
                  </div>
                  <div>
                    Pay Terms: <strong>{p.paymentPeriod} ({p.paymentFrequency.join(', ')})</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => toggleCompare(p.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    isComparing
                      ? 'border-[#00008F] bg-blue-50 text-[#00008F]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isComparing ? '✓ Comparing' : '+ Compare'}
                </button>

                <button
                  onClick={() => setInspectProduct(p)}
                  className="text-xs font-bold text-[#00008F] hover:underline flex items-center gap-1"
                >
                  <span>Factsheet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Product Modal */}
      {inspectProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{inspectProduct.name}</h3>
                <span className="text-xs text-[#00008F] font-semibold">{inspectProduct.category}</span>
              </div>
              <button onClick={() => setInspectProduct(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs text-slate-700 pr-1">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Product Description</h4>
                <p className="text-slate-600 leading-relaxed">{inspectProduct.fullDescription}</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl space-y-1">
                <div className="font-bold text-[#00008F]">Key Coverage Benefits:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {inspectProduct.benefits.map((b: ProductBenefit, i: number) => (
                    <li key={i}>
                      <strong>{b.title}:</strong> {b.description}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Eligibility & Underwriting Criteria</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Issue Ages: {inspectProduct.eligibility.minAge} to {inspectProduct.eligibility.maxAge} years</div>
                  <div>Occupations: {inspectProduct.eligibility.occupationsAllowed.join(', ')}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Important Exclusions & Waiting Periods</h4>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  {inspectProduct.exclusions.map((ex: string, i: number) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">Official Policy Sources</h4>
                <div className="space-y-1">
                  {inspectProduct.documents.map((s, i: number) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[#00008F] underline hover:text-blue-900"
                    >
                      {s.title} (Verified: {s.verifiedDate})
                    </a>
                  ))}
                </div>
              </div>

              {/* Designated Advisor Contact for Product Inquiry */}
              <div className="pt-2">
                <AdvisorContactCard
                  variant="banner"
                  onScheduleAppointment={() => setShowAppointmentModal(true)}
                  onRequestCallback={() => setShowCallbackModal(true)}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-400">AXA Philippines Digital Repository</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setInspectProduct(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setInspectProduct(null);
                    onNavigateToChat();
                  }}
                  className="px-4 py-2 bg-[#00008F] text-white rounded-lg text-xs font-bold hover:bg-blue-900"
                >
                  Ask AI About This Solution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && comparedProducts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Side-by-Side Product Comparison</h3>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3 w-36 text-slate-400 font-semibold">Attribute</th>
                    {comparedProducts.map((p) => (
                      <th key={p.id} className="p-3 font-bold text-slate-900 text-sm">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Category</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 font-medium text-[#00008F]">{p.category}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Primary Goal</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3">{p.primaryNeed}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Entry Age</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3">{p.eligibility.minAge}–{p.eligibility.maxAge} years</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Key Benefits</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3">
                        <ul className="list-disc list-inside space-y-1">
                          {p.benefits.slice(0, 3).map((b: ProductBenefit, i: number) => (
                            <li key={i}>{b.title}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Key Exclusion</td>
                    {comparedProducts.map((p) => (
                      <td key={p.id} className="p-3 text-red-700">{p.exclusions[0]}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Consultation Modal */}
      <ScheduleAppointmentModal
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />

      {/* Request Callback Modal */}
      <RequestCallbackModal
        isOpen={showCallbackModal}
        onClose={() => setShowCallbackModal(false)}
      />
    </div>
  );
};
