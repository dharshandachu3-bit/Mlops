import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  ShieldCheck,
  GitFork,
  RefreshCw,
  Activity,
  Users,
  Cpu,
  Award,
  Layers,
  FileText,
  Network,
  ShieldAlert,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Compass,
  Wind
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type PageId =
  | 'overview'
  | 'datasets'
  | 'quality'
  | 'pipeline-studio'
  | 'pipeline-runs'
  | 'airflow'
  | 'analytics'
  | 'cohorts'
  | 'prediction-lab'
  | 'model-eval'
  | 'mlops'
  | 'reports'
  | 'lineage'
  | 'audit'
  | 'clinical-grounding'
  | 'settings'
  | 'help';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { firestoreOnline, currentUser } = useAuth();

  const navItems = [
    { id: 'overview' as PageId, label: 'Overview', icon: LayoutDashboard },
    { id: 'datasets' as PageId, label: 'Dataset Manager', icon: FileSpreadsheet },
    { id: 'quality' as PageId, label: 'Data Quality', icon: ShieldCheck },
    { id: 'pipeline-studio' as PageId, label: 'Pipeline Studio', icon: GitFork },
    { id: 'pipeline-runs' as PageId, label: 'Pipeline Runs', icon: RefreshCw },
    { id: 'airflow' as PageId, label: 'Airflow Orchestrator', icon: Wind },
    { id: 'analytics' as PageId, label: 'Healthcare Analytics', icon: Activity },
    { id: 'cohorts' as PageId, label: 'Cohort Explorer', icon: Users },
    { id: 'prediction-lab' as PageId, label: 'AI Prediction Lab', icon: Cpu },
    { id: 'model-eval' as PageId, label: 'Model Evaluation', icon: Award },
    { id: 'mlops' as PageId, label: 'MLOps Center', icon: Layers },
    { id: 'clinical-grounding' as PageId, label: 'Clinical Grounding (AI)', icon: Compass },
    { id: 'reports' as PageId, label: 'Reports', icon: FileText },
    { id: 'lineage' as PageId, label: 'Data Lineage', icon: Network },
    { id: 'audit' as PageId, label: 'Audit Logs', icon: ShieldAlert },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`h-screen bg-[#0B1020] border-r border-cyan-500/15 flex flex-col transition-all duration-300 z-40 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.4)] shrink-0">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-extrabold tracking-wider bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-200 bg-clip-text text-transparent uppercase">
              READMITIQ AI
            </h1>
            <p className="text-[10px] text-cyan-400/80 font-medium tracking-tight truncate">
              Smarter Data. Healthier Tomorrows.
            </p>
          </div>
        )}
      </div>

      {/* Environment Status Badge */}
      {!isCollapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                {currentUser && firestoreOnline ? 'Connected' : 'Development'}
              </span>
              <span className="text-[11px] text-slate-300">
                {currentUser && firestoreOnline ? 'Firebase Firestore' : 'Local Environment'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/15 text-cyan-300 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.15)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive
                    ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,245,255,0.7)]'
                    : 'text-slate-400 group-hover:text-cyan-300'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isActive && !isCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00F5FF]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Promo Box (matching screenshot: AI for Better Healthcare Decisions) */}
      {!isCollapsed && (
        <div className="p-3 mx-3 mb-2 rounded-xl bg-gradient-to-br from-[#11182B] to-[#1a233d] border border-cyan-500/20 p-3 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-colors" />
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-cyan-300">READMITIQ PRO</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            AI for Better Healthcare Decisions
          </p>
          <div className="mt-2 text-[10px] text-slate-400">
            Version 1.0.0
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800/40 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
