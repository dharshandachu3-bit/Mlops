import React, { useState } from 'react';
import {
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ChevronRight,
  Filter,
  Eye,
  FileText
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { PipelineRun } from '../../types';

export const PipelineRuns: React.FC = () => {
  const { pipelineRuns, executePipeline, activeDataset, isProcessing } = useData();
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(pipelineRuns[0] || null);
  const [replayDiffModal, setReplayDiffModal] = useState<boolean>(false);

  const handleReplay = async (run: PipelineRun) => {
    // Replay with identical config on current active dataset
    await executePipeline(run.config);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Pipeline Execution History &amp; Replay</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                Traceable Lineage
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Audit historical pipeline runs, replay configurations against newer dataset releases, and compare execution diffs.
            </p>
          </div>
        </div>
      </div>

      {/* Main Runs Table & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Runs List (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white mb-2">Recorded Pipeline Runs</h3>

          <div className="space-y-2.5">
            {pipelineRuns.map((run) => {
              const isSelected = selectedRun?.id === run.id;
              return (
                <div
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.15)] ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{run.id}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                          {run.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{run.datasetName}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-cyan-300 font-bold">{run.totalDuration}</span>
                      <p className="text-[10px] text-slate-500">
                        {new Date(run.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Processed</span>
                      <p className="font-mono text-slate-200">{run.rowsProcessed.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Accepted</span>
                      <p className="font-mono text-emerald-400">{run.rowsAccepted.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Rejected</span>
                      <p className="font-mono text-magenta-400 text-[#FF36C7]">{run.rowsRejected.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Run Details & Replay Action (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          {selectedRun ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">Run Specifications</h3>
                  <p className="text-[11px] font-mono text-cyan-400">{selectedRun.id}</p>
                </div>

                {/* Pipeline Replay Trigger */}
                <button
                  onClick={() => handleReplay(selectedRun)}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,245,255,0.25)]"
                  title="Replay this exact configuration as a new execution run"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Pipeline Replay</span>
                </button>
              </div>

              {/* Stage breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Stage Performance</h4>
                <div className="space-y-2">
                  {selectedRun.stages.map((stg) => (
                    <div key={stg.id} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-200">{stg.name}</span>
                      </div>
                      <span className="font-mono text-cyan-300 text-[11px]">{stg.durationLabel || '1.2s'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applied Configurations */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Applied Configuration</h4>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Imputation:</span>
                    <span className="text-slate-200">{selectedRun.config.imputationStrategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Outlier Action:</span>
                    <span className="text-slate-200">{selectedRun.config.outlierHandling}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Strategy:</span>
                    <span className="text-slate-200">{selectedRun.config.targetStrategy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Categorical:</span>
                    <span className="text-slate-200">{selectedRun.config.encoding}</span>
                  </div>
                </div>
              </div>

              {/* Log preview */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Recent Stage Logs</h4>
                <div className="p-2.5 bg-black/50 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 space-y-1 max-h-36 overflow-y-auto">
                  {selectedRun.logs.slice(-4).map((l, i) => (
                    <p key={i}>
                      <span className="text-cyan-400">[{l.stage}]</span> {l.message}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a pipeline run to inspect stage telemetry.
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500">
            Pipeline Replay preserves historical runs and records new execution runs with unique execution tokens.
          </div>
        </div>
      </div>
    </div>
  );
};
