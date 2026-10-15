import React, { useState } from 'react';
import {
  Activity,
  Filter,
  RotateCcw,
  Download,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useData } from '../../context/DataContext';

export const HealthcareAnalytics: React.FC = () => {
  const { encounters, activeDataset } = useData();

  // Filter States
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedAdmission, setSelectedAdmission] = useState<string>('all');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('all');

  const filtered = encounters.filter((e) => {
    if (selectedAge !== 'all' && e.age !== selectedAge) return false;
    if (selectedGender !== 'all' && e.gender !== selectedGender) return false;
    if (selectedAdmission !== 'all' && e.admission_type !== selectedAdmission) return false;
    if (selectedDiagnosis !== 'all' && e.diag_1_category !== selectedDiagnosis) return false;
    return true;
  });

  const totalFiltered = filtered.length || 1;
  const readmitCount = filtered.filter((e) => e.readmitted === '<30').length;
  const currentRate = Number(((readmitCount / totalFiltered) * 100).toFixed(1));
  const avgStay = Number((filtered.reduce((acc, e) => acc + e.time_in_hospital, 0) / totalFiltered).toFixed(1));

  // Inpatient visits vs Readmission aggregation
  const inpatientBuckets = [0, 1, 2, 3, 4].map((visits) => {
    const subset = filtered.filter((e) => e.number_inpatient === visits);
    const count = subset.length;
    const readmitted = subset.filter((e) => e.readmitted === '<30').length;
    const rate = count > 0 ? Number(((readmitted / count) * 100).toFixed(1)) : 0;
    return { visits: `${visits} prior visits`, rate, count };
  });

  // Medications vs Readmission aggregation
  const medBuckets = [
    { label: '1-10 meds', min: 1, max: 10 },
    { label: '11-20 meds', min: 11, max: 20 },
    { label: '21-30 meds', min: 21, max: 30 },
    { label: '31+ meds', min: 31, max: 100 },
  ].map((b) => {
    const subset = filtered.filter((e) => e.num_medications >= b.min && e.num_medications <= b.max);
    const count = subset.length;
    const readmitted = subset.filter((e) => e.readmitted === '<30').length;
    const rate = count > 0 ? Number(((readmitted / count) * 100).toFixed(1)) : 0;
    return { range: b.label, rate, count };
  });

  // Medication Change status aggregation
  const medChangeData = ['No', 'Ch'].map((status) => {
    const subset = filtered.filter((e) => e.change === status);
    const count = subset.length;
    const readmitted = subset.filter((e) => e.readmitted === '<30').length;
    const rate = count > 0 ? Number(((readmitted / count) * 100).toFixed(1)) : 0;
    return {
      status: status === 'Ch' ? 'Dosage Changed' : 'No Change',
      rate,
      count,
    };
  });

  const resetFilters = () => {
    setSelectedAge('all');
    setSelectedGender('all');
    setSelectedAdmission('all');
    setSelectedDiagnosis('all');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Healthcare Analytics &amp; Cross-Cohort Risk</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                Multi-Dimensional Clinical Audit
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dissect hospital readmission variances by medication changes, prior inpatient history, and comorbidities.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Interactive Filter Toolbar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Age Group</label>
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-cyan-400"
            >
              <option value="all">All Age Groups</option>
              <option value="[18-30)">[18-30)</option>
              <option value="[30-45)">[30-45)</option>
              <option value="[45-60)">[45-60)</option>
              <option value="[60-75)">[60-75)</option>
              <option value="[75+)">[75+)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-cyan-400"
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Admission Type</label>
            <select
              value={selectedAdmission}
              onChange={(e) => setSelectedAdmission(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-cyan-400"
            >
              <option value="all">All Admissions</option>
              <option value="Emergency">Emergency</option>
              <option value="Elective">Elective</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Primary Diagnosis</label>
            <select
              value={selectedDiagnosis}
              onChange={(e) => setSelectedDiagnosis(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-cyan-400"
            >
              <option value="all">All Diagnoses</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Endocrine">Endocrine (Diabetes)</option>
              <option value="Digestive">Digestive</option>
              <option value="Musculoskeletal">Musculoskeletal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cohort Slice KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-400">Current Cohort Slice Size</p>
          <p className="text-2xl font-bold text-white mt-1">{filtered.length.toLocaleString()} encounters</p>
          <p className="text-[10px] text-slate-500 mt-1">
            {((filtered.length / encounters.length) * 100).toFixed(1)}% of entire dataset
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-400">Cohort 30-Day Readmission Rate</p>
          <p className="text-2xl font-bold text-magenta-400 text-[#FF36C7] mt-1">{currentRate}%</p>
          <p className="text-[10px] text-slate-400 mt-1">
            Baseline benchmark: 11.8% ({currentRate > 11.8 ? `+${(currentRate - 11.8).toFixed(1)}% elevated` : 'below baseline'})
          </p>
        </div>

        <div className="glass-card rounded-xl p-4 border border-slate-800">
          <p className="text-xs text-slate-400">Mean Hospital Stay</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{avgStay} days</p>
          <p className="text-[10px] text-slate-400 mt-1">Hospitalized duration in acute care</p>
        </div>
      </div>

      {/* Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prior Inpatient Visits vs Readmission */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Prior Inpatient Admissions vs. 30-Day Readmission</h3>
              <p className="text-[10px] text-slate-400">Number of prior hospital stays in past 12 months</p>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">Strongest Predictor</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inpatientBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="visits" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 50]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11182B',
                    borderColor: '#00F5FF',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" fill="#00F5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medication Volume vs Readmission */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Polypharmacy: Medication Count vs Readmission Rate</h3>
              <p className="text-[10px] text-slate-400">Distinct therapeutic medications prescribed during encounter</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={medBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 25]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11182B',
                    borderColor: '#8B5CF6',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Medication Change & Clinical Disclaimer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-2">Medication Change Status</h3>
          <p className="text-xs text-slate-400 mb-4">
            Patients who had diabetic medications altered or titrated during their stay vs unchanged regimen.
          </p>
          <div className="grid grid-cols-2 gap-4 text-center">
            {medChangeData.map((d) => (
              <div key={d.status} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-semibold text-slate-300">{d.status}</span>
                <p className="text-2xl font-extrabold text-cyan-300 mt-1">{d.rate}%</p>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">{d.count.toLocaleString()} encounters</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1.5">
            <h4 className="font-bold text-amber-300">Academic &amp; Research Analytics Disclaimer</h4>
            <p className="text-slate-300 leading-relaxed">
              Observed correlations between hospital length of stay, laboratory testing volume, or discharge disposition and readmissions do not demonstrate clinical causation.
            </p>
            <p className="text-slate-400 leading-relaxed">
              This analytics module is intended for health informatics researchers and healthcare quality analysts studying the CMS HRRP penalties framework. Do not make autonomous clinical care or discharge decisions without licensed physician oversight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
