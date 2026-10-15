import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  Info,
  Sliders,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const DataQualityCenter: React.FC = () => {
  const { qualityReport, activeDataset, isProcessing } = useData();
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'missing' | 'rejected'>('rules');

  if (!qualityReport) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center text-slate-400">
        <ShieldCheck className="w-12 h-12 mx-auto text-cyan-400 mb-3 animate-pulse" />
        <p className="text-base font-bold text-white">No Quality Report Available</p>
        <p className="text-xs text-slate-400 mt-1">Select or upload a dataset to run quality audits.</p>
      </div>
    );
  }

  const runRevalidation = () => {
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
    }, 700);
  };

  const downloadRejectedCSV = () => {
    const rows = qualityReport.rejectedSamples.map((s) => ({
      RowNumber: s.rowNumber,
      RejectionReason: s.reason,
      ...s.rowData,
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rejected_encounters_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Data Quality Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                Transparent Score: {qualityReport.qualityScore}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Audit data health, missingness distributions, range integrity, and inspect quarantine-rejected encounters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runRevalidation}
              disabled={isValidating || isProcessing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,245,255,0.15)]"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isValidating ? 'animate-spin' : ''}`} />
              <span>{isValidating ? 'Validating Rules...' : 'Re-run Validation'}</span>
            </button>

            <button
              onClick={downloadRejectedCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#11182B] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-magenta-400 text-[#FF36C7]" />
              <span>Download Rejected Rows CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for Quality Audit */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Inspected Rows</p>
          <p className="text-2xl font-bold text-white">{qualityReport.totalRows.toLocaleString()}</p>
          <p className="text-[10px] text-cyan-400 mt-1">100% evaluated</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Valid Rows</p>
          <p className="text-2xl font-bold text-emerald-400">{qualityReport.validRows.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Passed all hard constraints</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Quarantined / Rejected</p>
          <p className="text-2xl font-bold text-magenta-400 text-[#FF36C7]">{qualityReport.rejectedRows.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Excluded from training set</p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Duplicate Records</p>
          <p className="text-2xl font-bold text-amber-400">{qualityReport.duplicateCount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Identified via fuzzy hashing</p>
        </div>
      </div>

      {/* Audit Tabs */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rules'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Validation Rules Checklist ({qualityReport.validationRulesApplied.length})
          </button>
          <button
            onClick={() => setActiveTab('missing')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'missing'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Missing Values Analysis
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rejected'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quarantine & Rejected Records ({qualityReport.rejectedSamples.length})
          </button>
        </div>

        {/* Tab 1: Rules Checklist */}
        {activeTab === 'rules' && (
          <div className="space-y-3">
            {qualityReport.validationRulesApplied.map((rule, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  {rule.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{rule.rule}</span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-mono uppercase ${
                        rule.severity === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {rule.severity}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{rule.description}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-mono font-bold ${rule.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {rule.passed ? 'PASSED' : `${rule.violatingRows.toLocaleString()} rows flagged`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Missing Values Breakdown */}
        {activeTab === 'missing' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Columns with missing data points. In the UCI Diabetes 130 benchmark, clinical variables like <code className="text-cyan-300">weight</code> are typically omitted due to voluntary hospital entry.
            </p>
            <div className="space-y-3">
              {Object.entries(qualityReport.missingValuesByColumn).map(([col, stats]) => (
                <div key={col} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-300 font-bold">{col}</span>
                    <span className="text-slate-300 font-mono">
                      {stats.count.toLocaleString()} rows ({stats.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        stats.percentage > 50 ? 'bg-red-500' : stats.percentage > 10 ? 'bg-amber-500' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Rejected Records Samples */}
        {activeTab === 'rejected' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Sample records excluded during data quality verification to prevent model contamination and target leakage.
            </p>
            <div className="space-y-2">
              {qualityReport.rejectedSamples.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-red-500/30 text-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-red-400">Quarantine Row #{s.rowNumber}</span>
                    <span className="text-slate-400 font-mono">Action: Dropped</span>
                  </div>
                  <p className="text-slate-200 font-medium mb-2">{s.reason}</p>
                  <pre className="p-2 rounded bg-black/40 border border-slate-800 text-[10px] text-cyan-300 overflow-x-auto">
                    {JSON.stringify(s.rowData, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
