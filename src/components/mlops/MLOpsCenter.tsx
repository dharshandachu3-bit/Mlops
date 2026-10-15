import React, { useState } from 'react';
import {
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  Archive,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Info
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { TrainedModel } from '../../types';

export const MLOpsCenter: React.FC = () => {
  const { models, recordAudit } = useData();
  const [modelList, setModelList] = useState<TrainedModel[]>(models);
  const [selectedModel, setSelectedModel] = useState<TrainedModel>(models[0]);

  // Model promotion handler with lifecycle states
  const handlePromote = (modelId: string, newStatus: TrainedModel['status']) => {
    setModelList((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, status: newStatus } : m))
    );
    if (selectedModel?.id === modelId) {
      setSelectedModel({ ...selectedModel, status: newStatus });
    }
    recordAudit('Model Lifecycle Transition', 'Model', modelId, `Promoted model status to: ${newStatus}`);
  };

  // Feature Drift Monitoring: Population Stability Index (PSI)
  const driftFeatures = [
    { feature: 'time_in_hospital', psi: 0.042, status: 'Normal', baselineMean: '4.6d', currentMean: '4.7d' },
    { feature: 'number_inpatient', psi: 0.081, status: 'Normal', baselineMean: '0.43', currentMean: '0.45' },
    { feature: 'num_medications', psi: 0.145, status: 'Moderate Drift', baselineMean: '16.0', currentMean: '18.2' },
    { feature: 'diag_Cardiovascular', psi: 0.031, status: 'Normal', baselineMean: '32%', currentMean: '33%' },
    { feature: 'A1Cresult_high', psi: 0.188, status: 'Moderate Drift', baselineMean: '12%', currentMean: '15%' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">MLOps Center &amp; Drift Monitoring</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                Lifecycle &amp; PSI Population Stability
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Govern model registry promotions, version rollbacks, and track clinical feature distribution drift.
            </p>
          </div>
        </div>
      </div>

      {/* Model Registry Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Model Registry &amp; Lifecycle Management</h3>
          <span className="text-xs text-slate-400">Requires explicit promotion confirmation</span>
        </div>

        <div className="space-y-3">
          {modelList.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-bold text-white">{m.modelName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    v{m.version}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    m.status === 'registered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    m.status === 'staging' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Target: <strong className="text-slate-300">{m.targetDefinition}</strong> | Train Samples: {m.trainSamples.toLocaleString()} | ROC-AUC: <strong className="text-cyan-400">{m.metrics.rocAuc}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {m.status !== 'staging' && (
                  <button
                    onClick={() => handlePromote(m.id, 'staging')}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold"
                  >
                    Promote to Staging
                  </button>
                )}
                {m.status !== 'registered' && (
                  <button
                    onClick={() => handlePromote(m.id, 'registered')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
                  >
                    Register Production
                  </button>
                )}
                {m.status !== 'archived' && (
                  <button
                    onClick={() => handlePromote(m.id, 'archived')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
                    title="Archive model"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Drift & Population Stability Index (PSI) */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Population Stability Index (PSI) Data Drift Monitor</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluates shifts between training baseline distribution and current incoming hospital encounters.
            </p>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">
            Monitoring Active
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1020] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Feature Name</th>
                <th className="py-2.5 px-3">PSI Metric</th>
                <th className="py-2.5 px-3">Baseline Mean</th>
                <th className="py-2.5 px-3">Current Mean</th>
                <th className="py-2.5 px-3">Drift Status</th>
                <th className="py-2.5 px-3">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {driftFeatures.map((f) => (
                <tr key={f.feature} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-cyan-300 font-sans">{f.feature}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{f.psi}</td>
                  <td className="py-2.5 px-3 text-slate-400">{f.baselineMean}</td>
                  <td className="py-2.5 px-3 text-slate-200">{f.currentMean}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                      f.status === 'Normal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400 text-[10px]">
                    {f.status === 'Normal' ? 'Within tolerance threshold' : 'Schedule automated model retraining'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Statistical PSI thresholds: <strong className="text-white">PSI &lt; 0.10</strong> = Insignificant shift; <strong className="text-amber-300">0.10 ≤ PSI &lt; 0.25</strong> = Moderate shift requiring monitoring; <strong className="text-red-400">PSI ≥ 0.25</strong> = Significant concept/data drift requiring pipeline replay and retraining.
          </p>
        </div>
      </div>
    </div>
  );
};
