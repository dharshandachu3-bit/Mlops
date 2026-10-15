import React from 'react';
import {
  Award,
  BarChart2,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { useData } from '../../context/DataContext';

export const ModelEvaluation: React.FC = () => {
  const { models, activeModel, setActiveModel } = useData();

  const selectedModel = activeModel || models[0];

  const confusion = selectedModel?.confusionMatrix || {
    truePositive: 284,
    falsePositive: 112,
    trueNegative: 1980,
    falseNegative: 124,
  };

  const rocPoints = selectedModel?.rocCurve || [
    { fpr: 0, tpr: 0 },
    { fpr: 0.1, tpr: 0.45 },
    { fpr: 0.25, tpr: 0.72 },
    { fpr: 0.5, tpr: 0.88 },
    { fpr: 1, tpr: 1 },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Model Evaluation &amp; Benchmarks</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                ROC-AUC &amp; Calibration Metrics
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Compare classifier discriminative power, inspect confusion matrix trade-offs, and audit Brier calibration scores.
            </p>
          </div>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveModel(m)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold shrink-0 transition-all ${
              selectedModel?.id === m.id
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,245,255,0.2)] font-bold'
                : 'glass-card border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {m.algorithm} (ROC: {m.metrics.rocAuc})
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Model Performance Leaderboard</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1020] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Algorithm</th>
                <th className="py-2.5 px-3">ROC-AUC</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1-Score</th>
                <th className="py-2.5 px-3">Brier Score</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-white font-sans font-bold flex items-center gap-2">
                    {m.id === selectedModel?.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    {m.algorithm}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">{m.metrics.rocAuc}</td>
                  <td className="py-2.5 px-3 text-slate-300">{(m.metrics.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-purple-300">{(m.metrics.precision * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-magenta-400 text-[#FF36C7]">{(m.metrics.recall * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{m.metrics.f1Score}</td>
                  <td className="py-2.5 px-3 text-slate-400">{m.metrics.brierScore}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 uppercase font-sans">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROC Curve & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ROC Curve Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Receiver Operating Characteristic (ROC)</h3>
              <p className="text-[11px] text-slate-400">True Positive Rate vs False Positive Rate</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">AUC = {selectedModel?.metrics.rocAuc}</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fpr" stroke="#64748b" fontSize={11} domain={[0, 1]} tickLine={false} />
                <YAxis dataKey="tpr" stroke="#64748b" fontSize={11} domain={[0, 1]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11182B', borderColor: '#00F5FF', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="tpr" stroke="#00F5FF" strokeWidth={2.5} dot={false} name="Classifier ROC" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Confusion Matrix</h3>
            <p className="text-xs text-slate-400 mb-4">Evaluation across test encounters partition</p>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">True Negative (TN)</span>
                <span className="text-2xl font-black text-slate-200 font-mono">{confusion.trueNegative}</span>
                <p className="text-[9px] text-slate-500 mt-1">Correctly predicted non-readmit</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30">
                <span className="text-[10px] text-amber-400 block mb-1">False Positive (FP)</span>
                <span className="text-2xl font-black text-amber-300 font-mono">{confusion.falsePositive}</span>
                <p className="text-[9px] text-slate-500 mt-1">Predicted readmit, was safe</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-red-500/30">
                <span className="text-[10px] text-red-400 block mb-1">False Negative (FN)</span>
                <span className="text-2xl font-black text-red-300 font-mono">{confusion.falseNegative}</span>
                <p className="text-[9px] text-slate-500 mt-1">Missed readmissions (Risk!)</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block mb-1">True Positive (TP)</span>
                <span className="text-2xl font-black text-emerald-300 font-mono">{confusion.truePositive}</span>
                <p className="text-[9px] text-slate-500 mt-1">Correctly caught readmissions</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
            Clinical utility requires optimizing for high recall (minimizing False Negatives) to capture high-risk patients.
          </div>
        </div>
      </div>
    </div>
  );
};
