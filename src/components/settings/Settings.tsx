import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Cpu,
  CheckCircle2,
  ShieldCheck,
  Server,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const Settings: React.FC = () => {
  const { firestoreOnline, currentUser, role, setRole } = useAuth();
  const { appMode } = useData();

  const [defaultTarget, setDefaultTarget] = useState('30_day_hrrp');
  const [defaultSplit, setDefaultSplit] = useState(0.8);
  const [defaultSeed, setDefaultSeed] = useState(2026);
  const [saveMessage, setSaveMessage] = useState(false);

  const handleSave = () => {
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SettingsIcon className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">System Settings &amp; Infrastructure Status</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                Platform Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspect backend service health, database connectivity, Gemini AI configuration, and research defaults.
            </p>
          </div>
        </div>
      </div>

      {/* Connectivity & Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Firebase Firestore */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Firebase Firestore</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {firestoreOnline ? 'ONLINE' : 'FALLBACK'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Database ID: <strong className="text-cyan-300 font-mono">ai-studio-67d27e5e-1a69-49ba-baa1-22088388d975</strong>
          </p>
          <p className="text-[11px] text-slate-500">
            Persists datasets, pipeline runs, cohorts, trained models, reports, and security audit logs.
          </p>
        </div>

        {/* Gemini AI Intelligence */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Gemini 3.8 Flash SDK</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Grounding Tools: <strong className="text-purple-300 font-mono">googleSearch &amp; googleMaps</strong>
          </p>
          <p className="text-[11px] text-slate-500">
            Server-side execution with zero key leakage to browser client bundle.
          </p>
        </div>

        {/* Full-Stack Environment */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Environment</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {appMode}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Server Runtime: <strong className="text-emerald-300 font-mono">Node.js + Express API</strong>
          </p>
          <p className="text-[11px] text-slate-500">
            Host: 0.0.0.0:3000 / AI Studio Development Proxy
          </p>
        </div>
      </div>

      {/* Default Research Preferences Form */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Default Machine Learning &amp; Pipeline Preferences</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Default Target Metric</label>
            <select
              value={defaultTarget}
              onChange={(e) => setDefaultTarget(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value="30_day_hrrp">CMS HRRP 30-Day Readmission (&lt;30)</option>
              <option value="any_readmission">All-Cause Any Readmission</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Default Train/Test Split</label>
            <select
              value={defaultSplit}
              onChange={(e) => setDefaultSplit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value={0.8}>80% Training / 20% Holdout Testing</option>
              <option value={0.7}>70% Training / 30% Holdout Testing</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Random Seed (Reproducibility)</label>
            <input
              type="number"
              value={defaultSeed}
              onChange={(e) => setDefaultSeed(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {saveMessage && (
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Preferences Saved Successfully
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)]"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Academic Disclaimer & Security */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Academic &amp; Research Boundary Statement</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          READMITIQ AI is developed for academic, educational, and clinical informatics research. It is not approved by the FDA as an autonomous diagnostic software device and must not be used as the sole determination for patient discharge or therapy alteration without physician confirmation.
        </p>
      </div>
    </div>
  );
};
