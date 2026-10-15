import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Filter
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AuditLogs: React.FC = () => {
  const { auditLogs } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedType !== 'all' && log.resourceType !== selectedType) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(s) ||
      log.actorEmail.toLowerCase().includes(s) ||
      log.details.toLowerCase().includes(s) ||
      log.resourceId.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">System Security &amp; Clinical Audit Logs</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                Immutable Governance Trail
              </span>
            </div>
            <p className="text-xs text-slate-400">
              HIPAA-conscious activity tracking of datasets, validation audits, ETL runs, model promotions, and report generations.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable Integrity Enforced</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-1.5 outline-none focus:border-cyan-400"
            >
              <option value="all">All Resource Types</option>
              <option value="Dataset">Dataset Operations</option>
              <option value="Pipeline">Pipeline Executions</option>
              <option value="Model">Model Experiments</option>
              <option value="Cohort">Cohort Definitions</option>
              <option value="Report">Generated Reports</option>
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs by action, actor, or ID..."
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1020] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Resource Type</th>
                <th className="py-2.5 px-3">Resource ID</th>
                <th className="py-2.5 px-3">Actor Email</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Operation Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white font-sans">{log.action}</td>
                  <td className="py-2.5 px-3 text-cyan-300">{log.resourceType}</td>
                  <td className="py-2.5 px-3 text-slate-400 truncate max-w-[100px]">{log.resourceId}</td>
                  <td className="py-2.5 px-3 text-purple-300 font-sans">{log.actorEmail}</td>
                  <td className="py-2.5 px-3">
                    <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-sans font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
