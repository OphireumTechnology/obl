import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface Props {
  roleText?: string;
}

export const DemoEnvironmentBanner: React.FC<Props> = ({ roleText }) => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-200 text-amber-900 tracking-wider">
            DEMO ENVIRONMENT
          </span>
          <span className="text-amber-800">
            Development and simulation environment. Insurance product information, illustrations, applications, underwriting decisions, policy issuance, and payments are simulated. No live transaction is performed.
          </span>
        </div>
        {roleText && (
          <div className="text-xs text-amber-700 font-medium whitespace-nowrap flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            <span>Workspace: {roleText}</span>
          </div>
        )}
      </div>
    </div>
  );
};
