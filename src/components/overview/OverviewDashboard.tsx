import React from 'react';
import {
  Users,
  UserCheck,
  RotateCcw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Database,
  ArrowRight,
  Upload,
  Play,
  BarChart2,
  Cpu,
  FileText,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useData } from '../../context/DataContext';
import { PageId } from '../layout/Sidebar';

interface OverviewDashboardProps {
  onNavigate: (page: PageId) => void;
  dateRange: string;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate, dateRange }) => {
  const { activeDataset, encounters, isSampleMode, pipelineRuns, activeModel } = useData();

  // Metrics from real dataset
  const totalEncounters = activeDataset?.rowCount || encounters.length || 12482;
  const uniquePatients = activeDataset?.uniquePatients || Math.round(totalEncounters * 0.72) || 8976;
  const readmissionRate = activeDataset?.readmissionRate ?? 11.8;
  const avgStay = activeDataset?.avgLengthOfStay ?? 4.6;
  const qualityScore = activeDataset?.qualityScore ?? 92.3;

  // Monthly trend chart data
  const trendData = [
    { month: 'Jan', rate: 9.8 },
    { month: 'Feb', rate: 12.6 },
    { month: 'Mar', rate: 9.2 },
    { month: 'Apr', rate: 12.4 },
    { month: 'May', rate: 10.1 },
    { month: 'Jun', rate: 7.9 },
    { month: 'Jul', rate: 11.8 },
  ];

  // Age group readmission rates
  const ageData = [
    { group: '18-30', rate: 6.2, fill: '#00F5FF' },
    { group: '31-45', rate: 8.7, fill: '#00D1FF' },
    { group: '46-60', rate: 11.9, fill: '#20E3A2' },
    { group: '61-75', rate: 15.6, fill: '#8B5CF6' },
    { group: '76+', rate: 13.8, fill: '#FF36C7' },
  ];

  // Length of stay distribution
  const losData = [
    { range: '1-2', count: 1120 },
    { range: '3-4', count: 1680 },
    { range: '5-7', count: 1210 },
    { range: '8-10', count: 720 },
    { range: '11-14', count: 390 },
    { range: '15+', count: 140 },
  ];

  // Diagnosis readmission percentages
  const diagnosisData = [
    { name: 'Cardiovascular', rate: 18.2, color: 'from-cyan-400 to-blue-500' },
    { name: 'Respiratory', rate: 14.7, color: 'from-purple-400 to-pink-500' },
    { name: 'Endocrine', rate: 12.3, color: 'from-emerald-400 to-teal-500' },
    { name: 'Digestive', rate: 9.8, color: 'from-amber-400 to-orange-500' },
    { name: 'Musculoskeletal', rate: 7.6, color: 'from-cyan-300 to-teal-400' },
    { name: 'Other', rate: 5.4, color: 'from-blue-400 to-indigo-500' },
  ];

  // Donut data
  const admissionTypeData = [
    { name: 'Emergency', value: 52.3, color: '#00F5FF' },
    { name: 'Elective', value: 28.7, color: '#8B5CF6' },
    { name: 'Urgent', value: 12.6, color: '#FFB020' },
    { name: 'Other', value: 6.4, color: '#9BA8C7' },
  ];

  const dischargeData = [
    { name: 'Home', value: 68.2, color: '#00F5FF' },
    { name: 'Skilled Nursing', value: 14.7, color: '#FFB020' },
    { name: 'Another Hospital', value: 9.8, color: '#8B5CF6' },
    { name: 'Other', value: 7.3, color: '#9BA8C7' },
  ];

  const latestRun = pipelineRuns[0];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Title & Mode Banner matching reference UI */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_25px_rgba(0,245,255,0.25)]">
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-cyan-400 absolute -top-1 -right-1 animate-ping" />
              <RotateCcw className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Hospital Readmission Intelligence
            </h1>
            <p className="text-xs text-slate-400">
              Monitor healthcare data quality, admission patterns, pipeline performance, and readmission analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sample Data Mode badge */}
          <div className="px-3.5 py-1.5 rounded-lg bg-[#11182B] border border-cyan-500/30 text-slate-300 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-cyan-300">SAMPLE DATA MODE</span>
            <Info className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-[#11182B] border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards Row matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Encounters */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group hover:border-cyan-400/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.12)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Encounters</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {totalEncounters.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 12.5%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            Total hospital encounters in dataset
            <Info className="w-2.5 h-2.5" />
          </p>
        </div>

        {/* Unique Patients */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group hover:border-cyan-400/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.12)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Unique Patients</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {uniquePatients.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 9.2%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            Distinct patients in dataset
            <Info className="w-2.5 h-2.5" />
          </p>
        </div>

        {/* Readmission Rate */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group hover:border-magenta-400/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,54,199,0.12)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Readmission Rate</span>
            <div className="p-1.5 rounded-lg bg-magenta-500/10 text-[#FF36C7]">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {readmissionRate}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <TrendingDown className="w-3 h-3" />
            <span>↓ 2.3%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            Percentage of readmitted patients
            <Info className="w-2.5 h-2.5" />
          </p>
        </div>

        {/* Avg. Length of Stay */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group hover:border-emerald-400/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(32,227,162,0.12)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg. Length of Stay</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {avgStay} days
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 5.1%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            Average hospital stay duration
            <Info className="w-2.5 h-2.5" />
          </p>
        </div>

        {/* Data Quality Score */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group hover:border-cyan-400/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.12)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Data Quality Score</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {qualityScore}%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>↑ 4.7%</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            Overall dataset quality score
            <Info className="w-2.5 h-2.5" />
          </p>
        </div>

        {/* Pipeline Status */}
        <div className="glass-card rounded-xl p-4 relative overflow-hidden group hover:border-emerald-400/50 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(32,227,162,0.12)]">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pipeline Status</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Completed</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Last run: 2h ago
          </div>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            Last run: 2h ago
            <Info className="w-2.5 h-2.5" />
          </p>
        </div>
      </div>

      {/* Row 1 Charts: Trend | Age Group | Length of Stay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readmission Trend */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Readmission Trend</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                Monthly
              </span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 20]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11182B',
                    borderColor: '#00F5FF',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 0 15px rgba(0,245,255,0.3)',
                  }}
                  itemStyle={{ color: '#00F5FF' }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#00F5FF"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#00F5FF', stroke: '#11182B', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#FF36C7', stroke: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Readmission by Age Group */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Readmission by Age Group</h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
              Age Group
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="group" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 20]} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11182B',
                    borderColor: '#8B5CF6',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Length of Stay Distribution */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Length of Stay Distribution</h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">
              Distribution
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={losData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#11182B',
                    borderColor: '#00F5FF',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#00D1FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Diagnosis Analysis | Admission & Discharge Donut | Pipeline Health | Data Quality Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Diagnosis Analysis */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Diagnosis Analysis</h3>
            <span className="text-[10px] text-cyan-400 font-medium">Top Diagnoses</span>
          </div>
          <div className="space-y-3.5">
            {diagnosisData.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{d.name}</span>
                  <span className="text-cyan-300 font-bold">{d.rate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${d.color}`}
                    style={{ width: `${(d.rate / 25) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admission & Discharge Patterns */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">Admission & Discharge Patterns</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            {/* Admission Type Donut */}
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-1">Admission Type</p>
              <div className="h-28 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={admissionTypeData} innerRadius={28} outerRadius={42} dataKey="value" stroke="none">
                      {admissionTypeData.map((e, idx) => (
                        <Cell key={idx} fill={e.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-[10px] font-bold text-slate-300">
                  12.5K
                </div>
              </div>
              <div className="space-y-1 text-[10px] text-left mt-1">
                {admissionTypeData.map((e) => (
                  <div key={e.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400 truncate">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                      {e.name}
                    </span>
                    <span className="text-slate-200 font-medium">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Discharge Disposition Donut */}
            <div>
              <p className="text-[11px] text-slate-400 font-medium mb-1">Discharge Disposition</p>
              <div className="h-28 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dischargeData} innerRadius={28} outerRadius={42} dataKey="value" stroke="none">
                      {dischargeData.map((e, idx) => (
                        <Cell key={idx} fill={e.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-[10px] font-bold text-slate-300">
                  12.5K
                </div>
              </div>
              <div className="space-y-1 text-[10px] text-left mt-1">
                {dischargeData.map((e) => (
                  <div key={e.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400 truncate">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                      {e.name}
                    </span>
                    <span className="text-slate-200 font-medium">{e.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Pipeline Health</h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Success
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'Extract', time: '2m 14s', rows: '12,482 rows' },
                { name: 'Transform', time: '4m 32s', rows: '12,321 rows' },
                { name: 'Validate', time: '1m 03s', rows: '12,321 rows' },
                { name: 'Load', time: '3m 27s', rows: '12,321 rows' },
              ].map((stage) => (
                <div key={stage.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-200 font-medium">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-400 font-mono">{stage.time}</span>
                    <span className="text-cyan-400 font-mono text-[10px]">{stage.rows}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Duration: <strong className="text-white">11m 16s</strong></span>
            <span className="text-slate-500">0 Failed Tasks</span>
          </div>
        </div>

        {/* Data Quality Summary */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Data Quality Summary</h3>
              <span className="text-[10px] text-slate-400">Quality Metrics</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-cyan-400"
                    strokeDasharray="92.3, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-sm font-extrabold text-white">92.3%</span>
                  <p className="text-[8px] text-slate-400">Score</p>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-magenta-400" />
                    Missing Values
                  </span>
                  <span className="text-slate-200 font-mono">1.2%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Duplicates
                  </span>
                  <span className="text-slate-200 font-mono">0.4%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Invalid Records
                  </span>
                  <span className="text-slate-200 font-mono">0.3%</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Schema Issues
                  </span>
                  <span className="text-slate-200 font-mono">0.1%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              Passed
            </span>
            <span>Last Checked: 2h ago</span>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity | Data Lineage Explorer | Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity (4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Recent Activity</h3>
            <button
              onClick={() => onNavigate('audit')}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { text: 'Dataset uploaded: hospital_encounters.csv', time: '2h ago', icon: Upload, color: 'text-cyan-400' },
              { text: 'Pipeline executed successfully', time: '2h ago', icon: CheckCircle2, color: 'text-emerald-400' },
              { text: 'Model training completed', time: '4h ago', icon: Cpu, color: 'text-purple-400' },
              { text: 'Report generated: analytics_summary.pdf', time: '5h ago', icon: FileText, color: 'text-blue-400' },
              { text: 'New dataset added: diabetes_130_hospitals', time: '6h ago', icon: Database, color: 'text-cyan-400' },
            ].map((act, i) => {
              const Icon = act.icon;
              return (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className={`p-1.5 rounded-lg bg-slate-800/80 ${act.color} shrink-0 mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">{act.text}</p>
                    <span className="text-[10px] text-slate-500">{act.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Lineage Explorer Preview (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Data Lineage Explorer</h3>
              <button
                onClick={() => onNavigate('lineage')}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                View Lineage <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Lineage Node Chain matching screenshot */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto py-2">
              {[
                { name: 'Raw Dataset', format: 'CSV', count: '12,482 rows', color: 'border-cyan-500/40 text-cyan-300' },
                { name: 'Staging', format: 'Clean', count: '12,321 rows', color: 'border-emerald-500/40 text-emerald-300' },
                { name: 'Transformed', format: 'Parquet', count: '12,321 rows', color: 'border-blue-500/40 text-blue-300' },
                { name: 'Analytics DB', format: 'PostgreSQL', count: '12,321 rows', color: 'border-purple-500/40 text-purple-300' },
                { name: 'Dashboards', format: 'Live View', count: 'Real-time', color: 'border-pink-500/40 text-pink-300' },
              ].map((node, idx) => (
                <React.Fragment key={node.name}>
                  <div className={`p-2.5 rounded-xl bg-slate-900/90 border ${node.color} text-center min-w-[76px] shrink-0`}>
                    <p className="text-[10px] font-bold text-white truncate">{node.name}</p>
                    <p className="text-[9px] text-slate-400">{node.format}</p>
                    <p className="text-[8px] text-cyan-400 font-mono mt-1">{node.count}</p>
                  </div>
                  {idx < 4 && <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Deterministic 4-stage partition tracking</span>
            <span className="text-cyan-400">Zero Target Leakage</span>
          </div>
        </div>

        {/* Quick Actions (3 cols) */}
        <div className="lg:col-span-3 glass-card rounded-2xl p-5 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onNavigate('datasets')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all group"
            >
              <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>Upload Dataset</span>
            </button>
            <button
              onClick={() => onNavigate('pipeline-studio')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all group"
            >
              <Play className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Run Pipeline</span>
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all group"
            >
              <BarChart2 className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span>View Analytics</span>
            </button>
            <button
              onClick={() => onNavigate('prediction-lab')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all group"
            >
              <Cpu className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Train Model</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold transition-all group"
            >
              <FileText className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
              <span>Generate Report</span>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 text-xs font-semibold transition-all group"
            >
              <SettingsIcon className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
              <span>Open Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
