import React, { useState } from 'react';
import {
  Wind,
  Play,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Code,
  Terminal,
  Download,
  Copy,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Pause,
  Server,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { AirflowDAG, AirflowTask } from '../../types';
import { useData } from '../../context/DataContext';

export const AirflowOrchestrator: React.FC = () => {
  const { recordAudit } = useData();

  // DAG definitions
  const [dags, setDags] = useState<AirflowDAG[]>([
    {
      dagId: 'hospital_readmission_etl_dag',
      description: 'Automated ETL & Feature Pipeline for Hospital Readmission Intelligence',
      schedule: '@daily (00:00 UTC)',
      isPaused: false,
      status: 'success',
      lastRun: '2 hours ago',
      nextRun: 'in 22 hours',
      tags: ['healthcare', 'etl', 'readmissions', 'mlops'],
      tasks: [
        {
          id: 'start_pipeline',
          name: 'start_pipeline',
          operator: 'EmptyOperator',
          status: 'success',
          duration: '0.1s',
          tryNumber: 1,
          logs: ['[INFO] EmptyOperator start triggered.'],
        },
        {
          id: 'extract_raw_encounters',
          name: 'extract_raw_encounters',
          operator: 'PythonOperator',
          status: 'success',
          duration: '2m 14s',
          tryNumber: 1,
          xcom: { raw_count: 12482, dataset_version: 'v_20261014' },
          logs: [
            '[INFO] Starting extraction of raw encounter files from secure ingestion store.',
            '[INFO] Validating schema headers against UCI Diabetes 130 benchmark.',
            '[INFO] Successfully extracted 12,482 raw encounters.',
            '[INFO] Pushed XCom: raw_count=12482.',
          ],
        },
        {
          id: 'validate_schema_and_quality',
          name: 'validate_schema_and_quality',
          operator: 'BranchPythonOperator',
          status: 'success',
          duration: '1m 03s',
          tryNumber: 1,
          xcom: { valid_count: 12321, rejected_count: 161, quality_score: 92.3 },
          logs: [
            '[INFO] Evaluating clinical constraints across 12,482 records.',
            '[INFO] Verified 0 length-of-stay negative violations.',
            '[INFO] Flagged 161 records (expired discharge status & duplicate submissions).',
            '[INFO] Calculated Quality Score: 92.3% (Threshold >= 85.0%).',
            '[INFO] Branching to: transform_clinical_features.',
          ],
        },
        {
          id: 'transform_clinical_features',
          name: 'transform_clinical_features',
          operator: 'PythonOperator',
          status: 'success',
          duration: '4m 32s',
          tryNumber: 1,
          xcom: { target: 'readmission_30d_binary', derived_features: 6, scaled_rows: 12321 },
          logs: [
            '[INFO] Transforming 12,321 validated encounters into analytical features.',
            '[INFO] Grouped ICD-9 primary diagnoses: Cardiovascular (32%), Respiratory (18%), Endocrine (20%).',
            '[INFO] Derived binary target: readmission_30d_binary with zero target leakage.',
            '[INFO] Imputed laboratory procedures using median strategy.',
          ],
        },
        {
          id: 'load_analytical_store',
          name: 'load_analytical_store',
          operator: 'PythonOperator',
          status: 'success',
          duration: '3m 27s',
          tryNumber: 1,
          xcom: { table: 'analytical_encounters_partition', committed_rows: 12321 },
          logs: [
            '[INFO] Establishing connection to analytical warehouse partition.',
            '[INFO] Ingesting 12,321 model-ready encounters into PostgreSQL partition.',
            '[INFO] Rebuilding materialized cohort summary views.',
            '[INFO] Transaction committed successfully.',
          ],
        },
        {
          id: 'end_pipeline',
          name: 'end_pipeline',
          operator: 'EmptyOperator',
          status: 'success',
          duration: '0.2s',
          tryNumber: 1,
          logs: ['[INFO] Pipeline execution terminated with state: SUCCESS.'],
        },
      ],
      code: `from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.empty import EmptyOperator

default_args = {
    'owner': 'readmitiq-data-engineering',
    'depends_on_past': False,
    'email': ['alerts@hospital.org'],
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'hospital_readmission_etl_dag',
    default_args=default_args,
    schedule_interval='@daily',
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=['healthcare', 'etl', 'readmissions', 'mlops'],
) as dag:
    start = EmptyOperator(task_id='start_pipeline')
    extract = PythonOperator(task_id='extract_raw_encounters', python_callable=extract_raw_encounters)
    quality = BranchPythonOperator(task_id='validate_schema_and_quality', python_callable=validate_schema)
    transform = PythonOperator(task_id='transform_clinical_features', python_callable=transform_features)
    load = PythonOperator(task_id='load_analytical_store', python_callable=load_warehouse)
    end = EmptyOperator(task_id='end_pipeline', trigger_rule='none_failed_min_one_success')

    start >> extract >> quality >> transform >> load >> end`,
    },
    {
      dagId: 'data_quality_audit_dag',
      description: 'Continuous Data Quality, Missingness & Schema Integrity Audit DAG',
      schedule: '0 */6 * * * (Every 6h)',
      isPaused: false,
      status: 'success',
      lastRun: '1 hour ago',
      nextRun: 'in 5 hours',
      tags: ['quality', 'audit', 'compliance'],
      tasks: [
        {
          id: 'audit_column_completeness',
          name: 'audit_column_completeness',
          operator: 'PythonOperator',
          status: 'success',
          duration: '42s',
          tryNumber: 1,
          xcom: { weight_missing: '96.0%', max_glu_missing: '1.2%' },
          logs: ['[INFO] Auditing missingness across 28 clinical columns.'],
        },
        {
          id: 'detect_duplicate_patient_admissions',
          name: 'detect_duplicate_patient_admissions',
          operator: 'PythonOperator',
          status: 'success',
          duration: '35s',
          tryNumber: 1,
          xcom: { duplicates_found: 48 },
          logs: ['[INFO] Checked fuzzy hashes for 24-hour duplicate admissions.'],
        },
        {
          id: 'log_audit_trail_to_db',
          name: 'log_audit_trail_to_db',
          operator: 'PythonOperator',
          status: 'success',
          duration: '12s',
          tryNumber: 1,
          logs: ['[INFO] Recorded compliance entry to immutable audit table.'],
        },
      ],
      code: `from airflow import DAG
from airflow.operators.python import PythonOperator

with DAG('data_quality_audit_dag', schedule_interval='0 */6 * * *') as dag:
    audit = PythonOperator(task_id='audit_column_completeness', python_callable=audit_completeness)
    dups = PythonOperator(task_id='detect_duplicate_patient_admissions', python_callable=detect_duplicates)
    log = PythonOperator(task_id='log_audit_trail_to_db', python_callable=log_audit)

    [audit, dups] >> log`,
    },
    {
      dagId: 'model_retraining_trigger_dag',
      description: 'Automated Model Drift Monitoring & Retraining Pipeline (PSI-Triggered)',
      schedule: '@weekly (Sundays 02:00 UTC)',
      isPaused: false,
      status: 'success',
      lastRun: '4 days ago',
      nextRun: 'in 3 days',
      tags: ['mlops', 'retraining', 'drift', 'model-registry'],
      tasks: [
        {
          id: 'check_feature_psi_drift',
          name: 'check_feature_psi_drift',
          operator: 'BranchPythonOperator',
          status: 'success',
          duration: '55s',
          tryNumber: 1,
          xcom: { max_psi: 0.188, drifted_feature: 'A1Cresult_high' },
          logs: ['[INFO] PSI threshold evaluated. Triggering candidate training.'],
        },
        {
          id: 'train_candidate_models',
          name: 'train_candidate_models',
          operator: 'PythonOperator',
          status: 'success',
          duration: '8m 20s',
          tryNumber: 1,
          xcom: { candidate_roc_auc: 0.774, baseline_roc_auc: 0.760 },
          logs: ['[INFO] Random Forest v1.1.0 achieved ROC-AUC 0.774.'],
        },
        {
          id: 'compare_and_stage_model',
          name: 'compare_and_stage_model',
          operator: 'PythonOperator',
          status: 'success',
          duration: '18s',
          tryNumber: 1,
          logs: ['[INFO] Promoted model to Staging in MLOps Registry.'],
        },
      ],
      code: `from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.empty import EmptyOperator

with DAG('model_retraining_trigger_dag', schedule_interval='@weekly') as dag:
    drift = BranchPythonOperator(task_id='check_feature_psi_drift', python_callable=check_psi)
    train = PythonOperator(task_id='train_candidate_models', python_callable=train_models)
    stage = PythonOperator(task_id='compare_and_stage_model', python_callable=stage_model)
    skip = EmptyOperator(task_id='skip_retraining')
    done = EmptyOperator(task_id='complete_evaluation', trigger_rule='none_failed_min_one_success')

    drift >> train >> stage >> done
    drift >> skip >> done`,
    },
  ]);

  const [selectedDagId, setSelectedDagId] = useState<string>('hospital_readmission_etl_dag');
  const [activeTab, setActiveTab] = useState<'graph' | 'tasks' | 'code'>('graph');
  const [selectedTask, setSelectedTask] = useState<AirflowTask | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const selectedDag = dags.find((d) => d.dagId === selectedDagId) || dags[0];

  const handleTogglePause = (dagId: string) => {
    setDags((prev) =>
      prev.map((d) => (d.dagId === dagId ? { ...d, isPaused: !d.isPaused } : d))
    );
  };

  const handleTriggerDag = async (dagId: string) => {
    setIsTriggering(true);
    recordAudit('Airflow DAG Trigger', 'Pipeline', dagId, `Triggered manual DAG execution run for ${dagId}`);

    // Set tasks to running sequentially
    setDags((prev) =>
      prev.map((d) => {
        if (d.dagId !== dagId) return d;
        return {
          ...d,
          status: 'running',
          tasks: d.tasks.map((t, idx) => ({
            ...t,
            status: idx === 0 ? 'running' : 'queued',
          })),
        };
      })
    );

    // Simulate animated execution through stages
    for (let i = 0; i < selectedDag.tasks.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setDags((prev) =>
        prev.map((d) => {
          if (d.dagId !== dagId) return d;
          return {
            ...d,
            tasks: d.tasks.map((t, idx) => ({
              ...t,
              status: idx <= i ? 'success' : idx === i + 1 ? 'running' : 'queued',
            })),
          };
        })
      );
    }

    setDags((prev) =>
      prev.map((d) => (d.dagId === dagId ? { ...d, status: 'success', lastRun: 'Just now' } : d))
    );
    setIsTriggering(false);
  };

  const copyDagCode = () => {
    navigator.clipboard.writeText(selectedDag.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadDagPython = () => {
    const blob = new Blob([selectedDag.code], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedDag.dagId}.py`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Wind className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-white">Apache Airflow Orchestration Center</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                Airflow 2.9.1 Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Inspect DAG dependencies, trigger scheduled task runs, audit XCom payload transfers, and export Python DAG scripts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTriggerDag(selectedDag.dagId)}
              disabled={isTriggering || selectedDag.isPaused}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,245,255,0.4)] disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-current ${isTriggering ? 'animate-pulse' : ''}`} />
              <span>{isTriggering ? 'Executing DAG...' : 'Trigger DAG Run'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Airflow Engine Connection Status Banner */}
      <div className="glass-card rounded-xl p-4 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <div>
            <span className="font-bold text-white">Airflow Engine Mode: </span>
            <span className="text-cyan-300 font-semibold">Emulated Execution &amp; Production Docker Stack Ready</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
          <span>Docker Deploy Command:</span>
          <code className="p-1 px-2 rounded bg-black/50 border border-slate-800 text-cyan-400 select-all">
            docker compose -f airflow/docker-compose.airflow.yml up -d
          </code>
        </div>
      </div>

      {/* DAG Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dags.map((dag) => {
          const isSelected = selectedDag.dagId === dag.dagId;
          return (
            <div
              key={dag.dagId}
              onClick={() => setSelectedDagId(dag.dagId)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.15)] ring-1 ring-cyan-400'
                  : 'glass-card border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-white truncate max-w-[190px]">
                    {dag.dagId}
                  </span>
                </div>
                {/* Pause/Unpause toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePause(dag.dagId);
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                    dag.isPaused
                      ? 'bg-slate-800 text-slate-400 border border-slate-700'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                  title="Pause or Unpause DAG"
                >
                  {dag.isPaused ? 'Paused' : 'Active'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">{dag.description}</p>

              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Schedule: <strong className="text-slate-300">{dag.schedule}</strong></span>
                <span className="text-cyan-400">{dag.tasks.length} tasks</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected DAG Tabs & Details */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-mono">{selectedDag.dagId}</h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {selectedDag.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{selectedDag.description}</p>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'graph' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400'
              }`}
            >
              Graph View
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'tasks' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400'
              }`}
            >
              Task Instances ({selectedDag.tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'code' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400'
              }`}
            >
              Source Code (.py)
            </button>
          </div>
        </div>

        {/* TAB 1: DAG Graph View */}
        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#070B17] border border-slate-800/80 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[700px] gap-3 py-4">
                {selectedDag.tasks.map((task, idx) => {
                  return (
                    <React.Fragment key={task.id}>
                      <div
                        onClick={() => setSelectedTask(task)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all text-center min-w-[140px] ${
                          task.status === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/40 hover:border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.15)]'
                            : task.status === 'running'
                            ? 'bg-cyan-500/15 border-cyan-400 animate-pulse shadow-[0_0_15px_rgba(0,245,255,0.3)]'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-mono mb-1">
                          {task.status === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : task.status === 'running' ? (
                            <RotateCcw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span className="uppercase text-[9px] font-bold">{task.status}</span>
                        </div>
                        <h5 className="text-xs font-bold text-white font-mono truncate">{task.name}</h5>
                        <p className="text-[9px] text-cyan-400 font-mono mt-1">{task.operator}</p>
                        <span className="text-[9px] text-slate-500 font-mono block mt-1">{task.duration}</span>
                      </div>

                      {idx < selectedDag.tasks.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-cyan-500/50 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Click any operator node above to inspect task logs, execution duration, and XCom payloads.
            </p>
          </div>
        )}

        {/* TAB 2: Task Instances List */}
        {activeTab === 'tasks' && (
          <div className="space-y-2">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#0B1020] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Task ID</th>
                    <th className="py-2.5 px-3">Operator</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Tries</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {selectedDag.tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-white">{t.name}</td>
                      <td className="py-2.5 px-3 text-cyan-300">{t.operator}</td>
                      <td className="py-2.5 px-3 text-slate-300">{t.duration}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{t.tryNumber}</td>
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => setSelectedTask(t)}
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-sans font-semibold"
                        >
                          View Logs <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Source Code Viewer */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">airflow/dags/{selectedDag.dagId}.py</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyDagCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{copiedCode ? 'Copied!' : 'Copy DAG Code'}</span>
                </button>
                <button
                  onClick={downloadDagPython}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .py</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-96">
              {selectedDag.code}
            </pre>
          </div>
        )}
      </div>

      {/* Task Details & Logs Inspector Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full rounded-2xl border border-cyan-500/40 p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold">
                  Task Instance Inspector
                </span>
                <h4 className="text-base font-extrabold text-white font-mono">{selectedTask.name}</h4>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500">Operator</span>
                <p className="text-white font-bold">{selectedTask.operator}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500">Duration</span>
                <p className="text-cyan-300 font-bold">{selectedTask.duration}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500">State</span>
                <p className="text-emerald-400 font-bold uppercase">{selectedTask.status}</p>
              </div>
            </div>

            {selectedTask.xcom && (
              <div>
                <span className="text-xs font-bold text-white block mb-1">XCom Data Payload:</span>
                <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-cyan-300">
                  {JSON.stringify(selectedTask.xcom, null, 2)}
                </pre>
              </div>
            )}

            <div>
              <span className="text-xs font-bold text-white block mb-1 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Task Execution Logs:</span>
              </span>
              <div className="p-3 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                {selectedTask.logs.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
