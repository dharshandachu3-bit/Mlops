import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ArrowRight,
  Split,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { CohortFilter, PatientCohort } from '../../types';

export const CohortExplorer: React.FC = () => {
  const { encounters, cohorts, saveCohort, deleteCohort } = useData();

  const [cohortName, setCohortName] = useState('');
  const [cohortDesc, setCohortDesc] = useState('');
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [filters, setFilters] = useState<CohortFilter[]>([
    { id: '1', field: 'age', operator: 'in', value: ['[60-75)', '[75+)'] },
    { id: '2', field: 'diag_1_category', operator: 'equals', value: 'Cardiovascular' },
  ]);

  // Comparison Cohort selection
  const [compareAId, setCompareAId] = useState<string>(cohorts[0]?.id || '');
  const [compareBId, setCompareBId] = useState<string>(cohorts[1]?.id || '');

  // Add filter rule
  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        field: 'admission_type',
        operator: 'equals',
        value: 'Emergency',
      },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<CohortFilter>) => {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // Evaluate matches
  const matchingEncounters = encounters.filter((e) => {
    if (filters.length === 0) return true;

    if (logic === 'AND') {
      return filters.every((f) => {
        const val = e[f.field];
        if (f.operator === 'equals') return val === f.value;
        if (f.operator === 'greater_than') return Number(val) > Number(f.value);
        if (f.operator === 'less_than') return Number(val) < Number(f.value);
        if (f.operator === 'in') return Array.isArray(f.value) && f.value.includes(val);
        return true;
      });
    } else {
      return filters.some((f) => {
        const val = e[f.field];
        if (f.operator === 'equals') return val === f.value;
        if (f.operator === 'greater_than') return Number(val) > Number(f.value);
        if (f.operator === 'less_than') return Number(val) < Number(f.value);
        if (f.operator === 'in') return Array.isArray(f.value) && f.value.includes(val);
        return true;
      });
    }
  });

  const matchingCount = matchingEncounters.length;
  const readmissionCount = matchingEncounters.filter((e) => e.readmitted === '<30').length;
  const readmissionRate = matchingCount > 0 ? Number(((readmissionCount / matchingCount) * 100).toFixed(1)) : 0;
  const avgStay = matchingCount > 0 ? Number((matchingEncounters.reduce((acc, e) => acc + e.time_in_hospital, 0) / matchingCount).toFixed(1)) : 0;

  const handleSaveCohort = () => {
    if (!cohortName.trim()) return;
    saveCohort({
      name: cohortName,
      description: cohortDesc || 'Custom patient cohort definition',
      filters,
      logic,
      patientCount: matchingCount,
      readmissionRate,
      avgLengthOfStay: avgStay,
    });
    setCohortName('');
    setCohortDesc('');
  };

  const compareCohortA = cohorts.find((c) => c.id === compareAId);
  const compareCohortB = cohorts.find((c) => c.id === compareBId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Cohort Explorer &amp; Risk Stratification</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                Dynamic Subgroup Builder
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Build combinatory boolean clinical cohorts, analyze readmission risk variances, and compare cohorts side-by-side.
            </p>
          </div>
        </div>
      </div>

      {/* Cohort Builder Interface */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Define Filter Rules</span>
            </h3>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setLogic('AND')}
                className={`px-2.5 py-1 rounded font-bold ${
                  logic === 'AND' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
                }`}
              >
                Match ALL (AND)
              </button>
              <button
                onClick={() => setLogic('OR')}
                className={`px-2.5 py-1 rounded font-bold ${
                  logic === 'OR' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400'
                }`}
              >
                Match ANY (OR)
              </button>
            </div>
          </div>

          <button
            onClick={addFilter}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Condition</span>
          </button>
        </div>

        {/* Filter List */}
        <div className="space-y-2.5">
          {filters.map((f, idx) => (
            <div key={f.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">#{idx + 1}</span>

              {/* Field */}
              <select
                value={f.field}
                onChange={(e) => updateFilter(f.id, { field: e.target.value as any })}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg p-1.5 outline-none focus:border-cyan-400"
              >
                <option value="age">Age Group</option>
                <option value="diag_1_category">Diagnosis Category</option>
                <option value="admission_type">Admission Type</option>
                <option value="discharge_disposition">Discharge Disposition</option>
                <option value="time_in_hospital">Time in Hospital (Days)</option>
                <option value="num_medications">Number of Medications</option>
                <option value="number_inpatient">Prior Inpatient Stays</option>
                <option value="A1Cresult">HbA1c Lab Result</option>
              </select>

              {/* Operator */}
              <select
                value={f.operator}
                onChange={(e) => updateFilter(f.id, { operator: e.target.value as any })}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg p-1.5 outline-none focus:border-cyan-400"
              >
                <option value="equals">equals</option>
                <option value="greater_than">greater than</option>
                <option value="less_than">less than</option>
                <option value="in">is in list</option>
              </select>

              {/* Value Input */}
              <input
                type="text"
                value={Array.isArray(f.value) ? f.value.join(', ') : f.value}
                onChange={(e) => {
                  const val = f.operator === 'in' ? e.target.value.split(',').map((s) => s.trim()) : e.target.value;
                  updateFilter(f.id, { value: val });
                }}
                className="flex-1 bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg p-1.5 outline-none focus:border-cyan-400 font-mono"
              />

              <button
                onClick={() => removeFilter(f.id)}
                className="text-slate-500 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Live Cohort Preview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
          <div>
            <span className="text-[10px] text-slate-400">Cohort Size</span>
            <p className="text-xl font-bold text-white">{matchingCount.toLocaleString()} encounters</p>
            <span className="text-[10px] text-cyan-400 font-mono">
              {((matchingCount / (encounters.length || 1)) * 100).toFixed(1)}% of population
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Cohort Readmission Rate</span>
            <p className="text-xl font-bold text-magenta-400 text-[#FF36C7]">{readmissionRate}%</p>
            <span className="text-[10px] text-slate-400">vs 11.8% baseline</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400">Average Stay Duration</span>
            <p className="text-xl font-bold text-emerald-400">{avgStay} days</p>
            <span className="text-[10px] text-slate-400">Acute care duration</span>
          </div>
        </div>

        {/* Save Cohort Section */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            value={cohortName}
            onChange={(e) => setCohortName(e.target.value)}
            placeholder="Cohort Name (e.g., Post-Acute Diabetic Frailty)"
            className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
          />
          <input
            type="text"
            value={cohortDesc}
            onChange={(e) => setCohortDesc(e.target.value)}
            placeholder="Description / Clinical Hypothesis"
            className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleSaveCohort}
            disabled={!cohortName.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save Cohort</span>
          </button>
        </div>
      </div>

      {/* Cohort Comparison Tool (Side-by-Side) */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Split className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Side-by-Side Cohort Comparative Risk</h3>
          </div>
          <span className="text-xs text-slate-400">Hypothesis Testing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cohort A */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">Cohort A</span>
              <select
                value={compareAId}
                onChange={(e) => setCompareAId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded p-1 outline-none"
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {compareCohortA ? (
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 text-[11px]">{compareCohortA.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500">Size</span>
                    <p className="font-bold text-white">{compareCohortA.patientCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Readmit Rate</span>
                    <p className="font-bold text-magenta-400 text-[#FF36C7]">{compareCohortA.readmissionRate}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Avg Stay</span>
                    <p className="font-bold text-emerald-400">{compareCohortA.avgLengthOfStay}d</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Cohort B */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">Cohort B</span>
              <select
                value={compareBId}
                onChange={(e) => setCompareBId(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded p-1 outline-none"
              >
                {cohorts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {compareCohortB ? (
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 text-[11px]">{compareCohortB.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500">Size</span>
                    <p className="font-bold text-white">{compareCohortB.patientCount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Readmit Rate</span>
                    <p className="font-bold text-magenta-400 text-[#FF36C7]">{compareCohortB.readmissionRate}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Avg Stay</span>
                    <p className="font-bold text-emerald-400">{compareCohortB.avgLengthOfStay}d</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
