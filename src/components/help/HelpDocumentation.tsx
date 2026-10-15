import React from 'react';
import {
  HelpCircle,
  BookOpen,
  Database,
  GitFork,
  Cpu,
  Layers,
  Code,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const HelpDocumentation: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-card max-w-4xl w-full max-h-[90vh] rounded-3xl border border-cyan-500/40 p-8 shadow-2xl flex flex-col justify-between overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">READMITIQ AI Documentation &amp; Data Dictionary</h2>
              <p className="text-xs text-slate-400">System Architecture, Clinical Data Dictionary &amp; API Guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs text-slate-300 pr-2">
          {/* Section 1: Data Dictionary */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Data Dictionary: Diabetes 130-US Hospitals (1999–2008)</span>
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-[#0B1020] text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Field Name</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Clinical Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="py-2 px-3 text-cyan-300 font-bold">encounter_id</td>
                    <td className="py-2 px-3">String</td>
                    <td className="py-2 px-3">Unique identifier for each individual hospital admission</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-300 font-bold">patient_nbr</td>
                    <td className="py-2 px-3">String</td>
                    <td className="py-2 px-3">De-identified patient number (tracks multiple encounters per individual)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-300 font-bold">time_in_hospital</td>
                    <td className="py-2 px-3">Integer (1–14)</td>
                    <td className="py-2 px-3">Duration of acute hospital stay in days</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-300 font-bold">num_medications</td>
                    <td className="py-2 px-3">Integer</td>
                    <td className="py-2 px-3">Total distinct generic medications administered (polypharmacy proxy)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-300 font-bold">number_inpatient</td>
                    <td className="py-2 px-3">Integer</td>
                    <td className="py-2 px-3">Count of previous inpatient hospital visits in the preceding 12 months</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-300 font-bold">discharge_disposition</td>
                    <td className="py-2 px-3">Categorical</td>
                    <td className="py-2 px-3">Discharge destination (Home, Skilled Nursing Facility, Another Hospital)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-300 font-bold">readmitted</td>
                    <td className="py-2 px-3">Categorical</td>
                    <td className="py-2 px-3">&lt;30 days (CMS HRRP readmission), &gt;30 days, or NO readmission</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Machine Learning Methodology */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>Machine Learning &amp; Zero Leakage Methodology</span>
            </h3>
            <p className="leading-relaxed">
              Models are trained on pre-discharge covariates only. Stratified train/test splits ensure rare 30-day readmissions (target ~11.8%) are balanced across partitions. Numerical scaling and categorical one-hot encoding are fit solely on training data to prevent out-of-sample data leakage.
            </p>
          </div>

          {/* Section 3: Grounding & AI Architecture */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Google Gemini Grounding API Architecture</span>
            </h3>
            <p className="leading-relaxed">
              READMITIQ AI invokes <code className="text-cyan-300 font-mono">gemini-3.8-flash</code> server-side via Express routes. It integrates Google Search Grounding for clinical guidelines and Google Maps Grounding for post-discharge facility referrals, providing direct clickable Google Maps links.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">READMITIQ AI Version 1.0.0 (Research Edition)</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
