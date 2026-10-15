import React, { useState } from 'react';
import {
  GitFork,
  Play,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sliders,
  AlertCircle,
  FileText,
  Activity,
  Layers,
  Terminal,
  Database
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const PipelineStudio: React.FC = () => {
  const { activeDataset, encounters, executePipeline, activePipelineRun, isProcessing } = useData();

  const [imputationStrategy, setImputationStrategy] = useState<'median_mode' | 'drop' | 'forward_fill'>('median_mode');
  const [outlierHandling, setOutlierHandling] = useState<'clip' | 'remove' | 'keep'>('clip');
  const [targetStrategy, setTargetStrategy] = useState<'30_day_hrrp' | 'any_readmission'>('30_day_hrrp');
  const [encoding, setEncoding] = useState<'one_hot' | 'label'>('one_hot');

  const handleStartPipeline = async () => {
    await executePipeline({
      imputationStrategy,
      outlierHandling,
      targetStrategy,
      encoding,
    });
  };

  const stages = activePipelineRun?.stages || [
    { id: '1', name: 'File Ingestion & Schema Extraction', category: 'Extract', status: 'completed', durationLabel: '2m 14s', rowCount: 12482 },
    { id: '2', name: 'Data Quality Audits & Missingness Filters', category: 'Validate', status: 'completed', durationLabel: '1m 03s', rowCount: 12321 },
    { id: '3', name: 'Transformation & Categorical Encoding', category: 'Transform', status: 'completed', durationLabel: '4m 32s', rowCount: 12321 },
    { id: '4', name: 'Load into Analytical Partition Store', category: 'Load', status: 'completed', durationLabel: '3m 27s', rowCount: 12321 },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitFork className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Pipeline Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                ETL Orchestration Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configure and trigger deterministic 4-stage data engineering workflows: RAW → STAGING → CLEANED → ANALYTICAL.
            </p>
          </div>

          <button
            onClick={handleStartPipeline}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,245,255,0.4)] disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${isProcessing ? 'animate-pulse' : ''}`} />
            <span>{isProcessing ? 'Executing Pipeline...' : 'Run Pipeline Job'}</span>
          </button>
        </div>
      </div>

      {/* 4 Logical Layers Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { step: '01', title: 'RAW LAYER', desc: 'Immutable source encounters & schema headers', color: 'border-cyan-500/40 text-cyan-300', icon: Database },
          { step: '02', title: 'STAGING LAYER', desc: 'Type-casted columns & integrity verification', color: 'border-purple-500/40 text-purple-300', icon: Activity },
          { step: '03', title: 'CLEANED LAYER', desc: 'Imputed values, encoded categories, zero leakage', color: 'border-blue-500/40 text-blue-300', icon: Layers },
          { step: '04', title: 'ANALYTICAL STORE', desc: 'Aggregated cohorts & partitioned model features', color: 'border-emerald-500/40 text-emerald-300', icon: CheckCircle2 },
        ].map((layer) => {
          const Icon = layer.icon;
          return (
            <div key={layer.step} className={`glass-card p-4 rounded-xl border ${layer.color} relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-500">{layer.step}</span>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">{layer.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{layer.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Configuration Matrix */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Pipeline Stage Transformation Parameters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Missing Value Imputation</label>
            <select
              value={imputationStrategy}
              onChange={(e) => setImputationStrategy(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value="median_mode">Median (Numeric) + Mode (Categorical)</option>
              <option value="drop">Listwise Deletion (Drop Missing)</option>
              <option value="forward_fill">Clinical Last-Observed-Forward</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Outlier Handling (Length of Stay)</label>
            <select
              value={outlierHandling}
              onChange={(e) => setOutlierHandling(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value="clip">Winsorize / Clip at 99th Percentile</option>
              <option value="remove">Exclude Extreme Outliers (&gt;30d)</option>
              <option value="keep">Keep Raw Values Unmodified</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Target Definition</label>
            <select
              value={targetStrategy}
              onChange={(e) => setTargetStrategy(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value="30_day_hrrp">CMS HRRP 30-Day Readmission (&lt;30)</option>
              <option value="any_readmission">All-Cause Any Readmission</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-medium">Categorical Encoding</label>
            <select
              value={encoding}
              onChange={(e) => setEncoding(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value="one_hot">One-Hot Encoding (Diagnoses &amp; Admissions)</option>
              <option value="label">Ordinal Label Encoding</option>
            </select>
          </div>
        </div>
      </div>

      {/* Execution Stages Status & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stages Checklist */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Execution Stages</h3>
            <span className="text-xs text-slate-400">
              Run ID: <strong className="text-cyan-400 font-mono">{activePipelineRun?.id || 'run-prod-0842'}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : stage.status === 'running' ? (
                    <RotateCcw className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white">{stage.name}</h4>
                    <p className="text-[10px] text-slate-400">{stage.details || `${stage.rowCount} rows processed`}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-cyan-300 font-bold">{stage.durationLabel || '0.0s'}</span>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">{stage.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Terminal Logs */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Execution Logs</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Authoritative Stream
              </span>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 max-h-64 overflow-y-auto">
              {(activePipelineRun?.logs || [
                { timestamp: '14:20:00', level: 'INFO', stage: 'Extract', message: 'Dataset mounted: diabetes_130_us_hospitals.csv' },
                { timestamp: '14:22:14', level: 'SUCCESS', stage: 'Extract', message: 'Ingested 12,482 raw encounter rows.' },
                { timestamp: '14:23:00', level: 'INFO', stage: 'Transform', message: 'Encoding ICD-9 diagnostic codes into primary organ cohorts.' },
                { timestamp: '14:26:46', level: 'SUCCESS', stage: 'Transform', message: 'Generated CMS 30-day binary readmission label.' },
                { timestamp: '14:27:49', level: 'SUCCESS', stage: 'Validate', message: 'Verified 12,321 valid encounters. 161 records quarantined.' },
                { timestamp: '14:31:16', level: 'SUCCESS', stage: 'Load', message: 'Persisted to analytical research store. Job completed.' },
              ]).map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                  <span className={`font-bold ${
                    log.level === 'SUCCESS' ? 'text-emerald-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Airflow DAG Definition: <strong className="text-slate-200">readmitiq_etl_v1</strong></span>
            <span className="text-cyan-400">Deterministic Reproducibility</span>
          </div>
        </div>
      </div>
    </div>
  );
};
