import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Sparkles,
  Printer
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { GeneratedReport } from '../../types';

export const ReportsCenter: React.FC = () => {
  const { reports, createReport, activeDataset } = useData();
  const [selectedType, setSelectedType] = useState<GeneratedReport['reportType']>('Clinical Analytics');
  const [summaryText, setSummaryText] = useState('');
  const [activeReport, setActiveReport] = useState<GeneratedReport>(reports[0]);

  const handleGenerate = () => {
    const summary = summaryText || `Executive summary of ${selectedType} for ${activeDataset?.name || 'hospital encounter benchmark'}. Evaluated 30-day readmissions, data quality compliance, and clinical risk distribution.`;
    createReport(selectedType, summary);
    setSummaryText('');
  };

  const downloadCSVReport = (report: GeneratedReport) => {
    const rows = Object.entries(report.metrics).map(([k, v]) => ({ Metric: k, Value: v }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
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
              <FileText className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Reports Center &amp; Clinical Briefings</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                Audit Compliant Documentation
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generate reproducible audit reports for CMS HRRP submissions, ETL pipeline runs, and ML performance metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Report Generator Creator */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Generate Analytical or Quality Report</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Report Category</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value="Clinical Analytics">Clinical Analytics Summary</option>
              <option value="Data Quality Audit">Data Quality &amp; Missingness Audit</option>
              <option value="Model Evaluation">Model Evaluation &amp; Discrimination Report</option>
              <option value="Data Drift & Monitoring">Data Drift &amp; Feature PSI Report</option>
              <option value="ETL Execution">ETL Ingestion Execution Log</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Custom Notes / Scope</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder="Optional executive findings commentary..."
                className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Listing & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reports Archive (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white mb-2">Saved Reports Archive</h3>

          <div className="space-y-2.5">
            {reports.map((rep) => {
              const isSelected = activeReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => setActiveReport(rep)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.15)] ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                        {rep.reportType}
                      </span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{rep.title}</h4>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{rep.summary}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                    {new Date(rep.generatedAt).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Report Inspection Preview (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          {activeReport ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                    Official Document Preview
                  </span>
                  <h3 className="text-base font-extrabold text-white">{activeReport.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    Generated: {new Date(activeReport.generatedAt).toLocaleString()} | Target: {activeReport.datasetName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadCSVReport(activeReport)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-xs font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-1">Executive Summary</h4>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {activeReport.summary}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Key Metric Telemetry</h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(activeReport.metrics).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">{k}:</span>
                      <strong className="text-cyan-300">{String(v)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a report from the archive to inspect.
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500">
            Reports generated by READMITIQ AI conform to reproducible health informatics guidelines.
          </div>
        </div>
      </div>
    </div>
  );
};
