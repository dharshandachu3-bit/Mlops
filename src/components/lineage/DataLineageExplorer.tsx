import React, { useState } from 'react';
import {
  Network,
  Database,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  ArrowRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface LineageNode {
  id: string;
  title: string;
  stageType: 'Source' | 'Validation' | 'Transformation' | 'Persistence' | 'Machine Learning' | 'Output';
  rows: string;
  schema: string;
  timestamp: string;
  status: 'Clean' | 'Verified' | 'Active';
  details: string;
}

export const DataLineageExplorer: React.FC = () => {
  const { activeDataset, activeModel } = useData();

  const nodes: LineageNode[] = [
    {
      id: 'node-raw',
      title: 'Raw Encounter Dataset',
      stageType: 'Source',
      rows: `${(activeDataset?.rowCount || 12482).toLocaleString()} rows`,
      schema: '28 Columns (CSV format, UCI 130-Hospitals Benchmark)',
      timestamp: '2h ago',
      status: 'Clean',
      details: 'Ingested unmodified encounter records. Contains patient demographics, laboratory metrics, medications, and admission/discharge IDs.',
    },
    {
      id: 'node-val',
      title: 'Quality Rules & Quarantine Filter',
      stageType: 'Validation',
      rows: '161 rows rejected (12,321 passed)',
      schema: 'Range constraints, expired discharge exclusions, duplicate hashes',
      timestamp: '2h ago',
      status: 'Verified',
      details: 'Evaluated 6 clinical data quality rules. Excluded deceased discharge records and duplicate submissions to prevent label contamination.',
    },
    {
      id: 'node-trans',
      title: 'Feature Engineering & Encoding',
      stageType: 'Transformation',
      rows: '12,321 rows',
      schema: 'Derived 30-day readmit target, one-hot ICD categories, normalized stay',
      timestamp: '2h ago',
      status: 'Clean',
      details: 'Categorized primary ICD-9 diagnoses into Cardiovascular, Respiratory, Endocrine. Transformed readmitted into CMS HRRP binary target. Scaled numerical covariates without target leakage.',
    },
    {
      id: 'node-db',
      title: 'Analytical Data Warehouse',
      stageType: 'Persistence',
      rows: '12,321 partitioned encounters',
      schema: 'PostgreSQL Research Schema / Partitioned Tables',
      timestamp: '2h ago',
      status: 'Active',
      details: 'Persisted to high-performance analytical storage for cohort slicing and machine learning experimentation.',
    },
    {
      id: 'node-ml',
      title: 'Machine Learning Model Experiment',
      stageType: 'Machine Learning',
      rows: '80/20 Stratified Partition (9,856 train / 2,465 test)',
      schema: `${activeModel?.algorithm || 'Random Forest'} (ROC-AUC: ${activeModel?.metrics.rocAuc || '0.76'})`,
      timestamp: '2h ago',
      status: 'Active',
      details: 'Trained ensemble decision trees with balanced class weighting. Validated out-of-sample discriminative ability.',
    },
    {
      id: 'node-out',
      title: 'Clinical Analytics & HRRP Reports',
      stageType: 'Output',
      rows: 'Dashboards & Exported PDF/CSV Summaries',
      schema: 'Aggregated metrics & risk distributions',
      timestamp: 'Real-time',
      status: 'Active',
      details: 'Presented in dark neon medical analytics dashboard for researcher inspection.',
    },
  ];

  const [selectedNode, setSelectedNode] = useState<LineageNode>(nodes[0]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Network className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Data Lineage &amp; Provenance Explorer</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                End-to-End Auditability
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive graphical trace of data flow: from raw hospital ingest to transformation, warehouse persistence, ML models, and reports.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Lineage Flow Chart */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Pipeline Provenance Graph</h3>

        <div className="flex items-center justify-between gap-3 overflow-x-auto py-4 px-2">
          {nodes.map((node, index) => {
            const isSelected = selectedNode.id === node.id;
            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl cursor-pointer border min-w-[170px] max-w-[200px] shrink-0 transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.25)] ring-2 ring-cyan-400'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono uppercase text-cyan-400 font-bold">
                      {node.stageType}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  </div>
                  <h4 className="text-xs font-bold text-white leading-tight mb-2">{node.title}</h4>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{node.rows}</p>
                </div>

                {index < nodes.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-cyan-500/60 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Deep Inspector */}
      <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] text-cyan-400 font-mono uppercase font-bold">Node Inspector</span>
            <h3 className="text-lg font-extrabold text-white">{selectedNode.title}</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Status: {selectedNode.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">Row Volumetrics</span>
            <strong className="text-white text-sm">{selectedNode.rows}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">Schema Specification</span>
            <strong className="text-cyan-300 text-xs block leading-relaxed">{selectedNode.schema}</strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">Execution Recency</span>
            <strong className="text-white text-sm">{selectedNode.timestamp}</strong>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-300 mb-1">Transformation &amp; Governance Details:</h4>
          <p className="text-xs text-slate-300 leading-relaxed p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            {selectedNode.details}
          </p>
        </div>
      </div>
    </div>
  );
};
