import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  HospitalEncounter,
  DatasetMetadata,
  DataQualityReport,
  PipelineRun,
  TrainedModel,
  PatientCohort,
  AuditLogEntry,
  GeneratedReport,
  PipelineStage
} from '../types';
import { generateSyntheticHospitalEncounters } from '../data/syntheticGenerator';
import {
  persistDataset,
  fetchUserDatasets,
  persistPipelineRun,
  fetchPipelineRuns,
  persistModel,
  fetchModels,
  persistCohort,
  fetchCohorts,
  persistAuditLog,
  fetchAuditLogs,
  persistReport,
  fetchReports
} from '../services/firestoreService';
import { useAuth } from './AuthContext';
import { trainReadmissionModel, MLTrainingConfig } from '../services/mlEngine';

interface DataContextType {
  activeDataset: DatasetMetadata | null;
  datasets: DatasetMetadata[];
  encounters: HospitalEncounter[];
  qualityReport: DataQualityReport | null;
  pipelineRuns: PipelineRun[];
  activePipelineRun: PipelineRun | null;
  models: TrainedModel[];
  activeModel: TrainedModel | null;
  cohorts: PatientCohort[];
  auditLogs: AuditLogEntry[];
  reports: GeneratedReport[];
  isSampleMode: boolean;
  appMode: 'Local Development' | 'Connected Firebase' | 'Sample Data' | 'Production';
  isProcessing: boolean;
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  setIsSampleMode: (val: boolean) => void;
  setActiveDataset: (dataset: DatasetMetadata) => void;
  setActiveModel: (model: TrainedModel) => void;
  generateSyntheticDataset: (size?: number) => void;
  importCustomDataset: (name: string, fileName: string, records: HospitalEncounter[]) => void;
  deleteDataset: (id: string) => void;
  executePipeline: (config: PipelineRun['config']) => Promise<PipelineRun>;
  trainNewModel: (config: MLTrainingConfig) => Promise<TrainedModel>;
  saveCohort: (cohort: Omit<PatientCohort, 'id' | 'createdAt' | 'ownerId'>) => void;
  deleteCohort: (id: string) => void;
  recordAudit: (action: string, resourceType: AuditLogEntry['resourceType'], resourceId: string, details: string) => void;
  createReport: (reportType: GeneratedReport['reportType'], summary: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, currentUser, firestoreOnline } = useAuth();

  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [activeDataset, setActiveDataset] = useState<DatasetMetadata | null>(null);
  const [encounters, setEncounters] = useState<HospitalEncounter[]>([]);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [activePipelineRun, setActivePipelineRun] = useState<PipelineRun | null>(null);
  const [models, setModels] = useState<TrainedModel[]>([]);
  const [activeModel, setActiveModel] = useState<TrainedModel | null>(null);
  const [cohorts, setCohorts] = useState<PatientCohort[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [isSampleMode, setIsSampleMode] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Initial synthetic dataset generation matching the screenshot:
  // 12,482 Encounters, 8,976 Unique Patients, 11.8% Readmission Rate, 4.6 days stay, 92.3% Quality Score
  useEffect(() => {
    const { encounters: initialEncounters, metadata: initialMeta, qualityReport: initialQR } =
      generateSyntheticHospitalEncounters(12482);

    setEncounters(initialEncounters);
    setActiveDataset(initialMeta);
    setDatasets([initialMeta]);
    setQualityReport(initialQR);

    // Initial completed pipeline run
    const initialStages: PipelineStage[] = [
      { id: 'stg-1', name: 'Extract Raw Encounter Records', category: 'Extract', status: 'completed', durationLabel: '2m 14s', rowCount: 12482, details: 'Parsed CSV & mapped schema' },
      { id: 'stg-2', name: 'Transform & Normalize Categories', category: 'Transform', status: 'completed', durationLabel: '4m 32s', rowCount: 12321, details: 'Imputed missing values, categorized ICD-9' },
      { id: 'stg-3', name: 'Validate Integrity & Clinical Constraints', category: 'Validate', status: 'completed', durationLabel: '1m 03s', rowCount: 12321, details: 'Checked range violations & duplicate encounters' },
      { id: 'stg-4', name: 'Load into Analytical Partition Store', category: 'Load', status: 'completed', durationLabel: '3m 27s', rowCount: 12321, details: 'Committed to persistent research database' },
    ];

    const initialRun: PipelineRun = {
      id: 'run-prod-0842',
      datasetId: initialMeta.id,
      datasetName: initialMeta.name,
      status: 'completed',
      startedAt: new Date(Date.now() - 7200000).toISOString(),
      completedAt: new Date(Date.now() - 6520000).toISOString(),
      totalDuration: '11m 16s',
      rowsProcessed: 12482,
      rowsAccepted: 12321,
      rowsRejected: 161,
      stages: initialStages,
      logs: [
        { timestamp: '14:20:00', level: 'INFO', stage: 'Extract', message: 'Mounted dataset: diabetes_130_us_hospitals.csv' },
        { timestamp: '14:22:14', level: 'SUCCESS', stage: 'Extract', message: 'Ingested 12,482 raw encounter rows' },
        { timestamp: '14:23:00', level: 'INFO', stage: 'Transform', message: 'Categorizing ICD-9 diagnoses into Cardiovascular, Respiratory, etc.' },
        { timestamp: '14:26:46', level: 'SUCCESS', stage: 'Transform', message: 'Derived 30-day readmission outcome target' },
        { timestamp: '14:27:00', level: 'INFO', stage: 'Validate', message: 'Flagged 161 records with missing weight or expired status' },
        { timestamp: '14:27:49', level: 'SUCCESS', stage: 'Validate', message: 'Validation score: 92.3% (Passed threshold)' },
        { timestamp: '14:31:16', level: 'SUCCESS', stage: 'Load', message: 'Persisted analytical dataset. Pipeline finished.' },
      ],
      ownerId: 'system-demo',
      config: {
        imputationStrategy: 'median_mode',
        outlierHandling: 'clip',
        targetStrategy: '30_day_hrrp',
        encoding: 'one_hot',
      },
    };

    setPipelineRuns([initialRun]);
    setActivePipelineRun(initialRun);

    // Initial Baseline Trained Model
    const initialModel = trainReadmissionModel(initialEncounters.slice(0, 4000), {
      datasetName: initialMeta.name,
      algorithm: 'Random Forest',
      targetDefinition: '30_day_hrrp',
      trainTestSplitRatio: 0.8,
      randomSeed: 2026,
      features: [
        'number_inpatient', 'time_in_hospital', 'discharge_SNF', 'num_medications',
        'diag_Cardiovascular', 'a1c_high', 'number_emergency', 'change_medication'
      ],
      hyperparameters: { numTrees: 50, maxDepth: 8, classWeight: 'balanced' },
    });
    initialModel.status = 'registered';
    setModels([initialModel]);
    setActiveModel(initialModel);

    // Initial Demo Cohorts
    const initialCohorts: PatientCohort[] = [
      {
        id: 'coh-cardio-elderly',
        name: 'Elderly Cardiovascular Cohort (Age 60+)',
        description: 'High-risk cardiovascular admissions aged 60 and above with multiple inpatient stays.',
        filters: [
          { id: 'f-1', field: 'age', operator: 'in', value: ['[60-75)', '[75+)'] },
          { id: 'f-2', field: 'diag_1_category', operator: 'equals', value: 'Cardiovascular' },
        ],
        logic: 'AND',
        patientCount: 3120,
        readmissionRate: 17.8,
        avgLengthOfStay: 5.4,
        ownerId: 'system-demo',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'coh-emergency-snf',
        name: 'Emergency Admission to SNF Transition',
        description: 'Patients admitted via Emergency and discharged to Skilled Nursing Facilities.',
        filters: [
          { id: 'f-3', field: 'admission_type', operator: 'equals', value: 'Emergency' },
          { id: 'f-4', field: 'discharge_disposition', operator: 'equals', value: 'Skilled Nursing Facility' },
        ],
        logic: 'AND',
        patientCount: 1184,
        readmissionRate: 21.4,
        avgLengthOfStay: 7.2,
        ownerId: 'system-demo',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    setCohorts(initialCohorts);

    // Initial Audit Logs
    const initialAudit: AuditLogEntry[] = [
      {
        id: 'aud-1',
        action: 'Dataset Ingestion',
        resourceType: 'Dataset',
        resourceId: initialMeta.id,
        actorEmail: 'dharshandachu3@gmail.com',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'SUCCESS',
        details: 'Uploaded benchmark dataset: 12,482 records ingested.',
        ownerId: 'system-demo',
      },
      {
        id: 'aud-2',
        action: 'ETL Pipeline Run',
        resourceType: 'Pipeline',
        resourceId: initialRun.id,
        actorEmail: 'dharshandachu3@gmail.com',
        timestamp: new Date(Date.now() - 6520000).toISOString(),
        status: 'SUCCESS',
        details: 'Full ETL pipeline execution completed in 11m 16s with 12,321 valid rows.',
        ownerId: 'system-demo',
      },
      {
        id: 'aud-3',
        action: 'Model Registration',
        resourceType: 'Model',
        resourceId: initialModel.id,
        actorEmail: 'dharshandachu3@gmail.com',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'SUCCESS',
        details: 'Random Forest Classifier v1.0.0 promoted to registered status with ROC-AUC 0.76.',
        ownerId: 'system-demo',
      },
    ];
    setAuditLogs(initialAudit);

    // Initial Report
    const initialReports: GeneratedReport[] = [
      {
        id: 'rep-01',
        title: 'Q3 CMS HRRP Readmission Risk & Quality Audit',
        reportType: 'Clinical Analytics',
        datasetName: initialMeta.name,
        generatedAt: new Date(Date.now() - 3600000).toISOString(),
        summary: 'Comprehensive analysis of 12,482 hospital encounters demonstrating an overall 30-day readmission rate of 11.8%. Cardiovascular diagnoses and SNF discharges present the highest risk variance.',
        metrics: {
          'Total Encounters': 12482,
          'Readmission Rate': '11.8%',
          'Data Quality': '92.3%',
          'Avg Stay': '4.6 days',
        },
        ownerId: 'system-demo',
      },
    ];
    setReports(initialReports);
  }, []);

  // Sync with Firestore if authenticated
  useEffect(() => {
    if (currentUser) {
      fetchUserDatasets(currentUser.uid).then(d => {
        if (d && d.length > 0) setDatasets(prev => [...d, ...prev.filter(p => p.isSynthetic)]);
      }).catch(() => {});
      fetchPipelineRuns(currentUser.uid).then(r => {
        if (r && r.length > 0) setPipelineRuns(prev => [...r, ...prev]);
      }).catch(() => {});
      fetchModels(currentUser.uid).then(m => {
        if (m && m.length > 0) setModels(prev => [...m, ...prev]);
      }).catch(() => {});
      fetchCohorts(currentUser.uid).then(c => {
        if (c && c.length > 0) setCohorts(prev => [...c, ...prev]);
      }).catch(() => {});
      fetchAuditLogs(currentUser.uid).then(a => {
        if (a && a.length > 0) setAuditLogs(prev => [...a, ...prev]);
      }).catch(() => {});
      fetchReports(currentUser.uid).then(rep => {
        if (rep && rep.length > 0) setReports(prev => [...rep, ...prev]);
      }).catch(() => {});
    }
  }, [currentUser]);

  const recordAudit = (
    action: string,
    resourceType: AuditLogEntry['resourceType'],
    resourceId: string,
    details: string
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      action,
      resourceType,
      resourceId,
      actorEmail: userProfile?.email || 'researcher@hospital.org',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      details,
      ownerId: currentUser?.uid || 'local-user',
    };
    setAuditLogs(prev => [entry, ...prev]);
    if (currentUser) {
      persistAuditLog(entry).catch(() => {});
    }
  };

  const generateSyntheticDataset = (size = 12482) => {
    setIsProcessing(true);
    setTimeout(() => {
      const { encounters: newEnc, metadata: newMeta, qualityReport: newQR } =
        generateSyntheticHospitalEncounters(size, Date.now() % 10000);

      setEncounters(newEnc);
      setActiveDataset(newMeta);
      setDatasets(prev => [newMeta, ...prev]);
      setQualityReport(newQR);
      setIsSampleMode(true);
      setIsProcessing(false);

      recordAudit('Dataset Generation', 'Dataset', newMeta.id, `Generated synthetic dataset with ${size} records.`);
    }, 600);
  };

  const importCustomDataset = (name: string, fileName: string, records: HospitalEncounter[]) => {
    const rowCount = records.length;
    const readmissionCount = records.filter(r => r.readmitted === '<30').length;
    const readmissionRate = Number(((readmissionCount / (rowCount || 1)) * 100).toFixed(1));
    const avgStay = Number((records.reduce((acc, r) => acc + (r.time_in_hospital || 3), 0) / (rowCount || 1)).toFixed(1));

    const newDataset: DatasetMetadata = {
      id: `ds-${Date.now()}`,
      name: name || 'Uploaded Hospital Encounter Dataset',
      fileName: fileName || 'uploaded_records.csv',
      rowCount,
      columnCount: Object.keys(records[0] || {}).length || 20,
      qualityScore: 94.5,
      readmissionRate,
      avgLengthOfStay: avgStay,
      uniquePatients: Math.round(rowCount * 0.75),
      status: 'validated',
      isSynthetic: false,
      ownerId: currentUser?.uid || 'local-user',
      createdAt: new Date().toISOString(),
      sampleRecords: records.slice(0, 50),
      targetDefinition: '30_day_hrrp',
    };

    setEncounters(records);
    setActiveDataset(newDataset);
    setDatasets(prev => [newDataset, ...prev]);
    setIsSampleMode(false);

    if (currentUser) {
      persistDataset(newDataset).catch(() => {});
    }

    recordAudit('Dataset Upload', 'Dataset', newDataset.id, `Uploaded ${fileName} with ${rowCount} records.`);
  };

  const deleteDataset = (id: string) => {
    setDatasets(prev => prev.filter(d => d.id !== id));
    if (activeDataset?.id === id) {
      const remaining = datasets.filter(d => d.id !== id);
      if (remaining.length > 0) setActiveDataset(remaining[0]);
    }
    recordAudit('Dataset Deletion', 'Dataset', id, `Removed dataset ID: ${id}`);
  };

  const executePipeline = async (config: PipelineRun['config']): Promise<PipelineRun> => {
    setIsProcessing(true);
    const runId = `run-${Date.now()}`;
    const datasetId = activeDataset?.id || 'unknown';
    const datasetName = activeDataset?.name || 'Hospital Encounter Dataset';

    const stages: PipelineStage[] = [
      { id: 's1', name: 'File Ingestion & Schema Extraction', category: 'Extract', status: 'running', details: 'Reading rows' },
      { id: 's2', name: 'Data Quality Audits & Missingness Filters', category: 'Validate', status: 'pending', details: 'Checking clinical constraints' },
      { id: 's3', name: 'Transformation & Categorical Encoding', category: 'Transform', status: 'pending', details: 'Engineering features' },
      { id: 's4', name: 'Load into Analytical Partition Store', category: 'Load', status: 'pending', details: 'Storing clean partition' },
    ];

    const currentRun: PipelineRun = {
      id: runId,
      datasetId,
      datasetName,
      status: 'running',
      startedAt: new Date().toISOString(),
      totalDuration: '0s',
      rowsProcessed: encounters.length,
      rowsAccepted: 0,
      rowsRejected: 0,
      stages,
      logs: [{ timestamp: new Date().toLocaleTimeString(), level: 'INFO', stage: 'Extract', message: 'Starting ETL execution...' }],
      ownerId: currentUser?.uid || 'local-user',
      config,
    };

    setActivePipelineRun(currentRun);

    // Simulate real step timings
    await new Promise(r => setTimeout(r, 600));
    stages[0].status = 'completed';
    stages[0].durationLabel = '1.2s';
    stages[0].rowCount = encounters.length;
    stages[1].status = 'running';
    currentRun.logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', stage: 'Extract', message: `Extracted ${encounters.length} rows.` });

    await new Promise(r => setTimeout(r, 600));
    stages[1].status = 'completed';
    stages[1].durationLabel = '0.9s';
    stages[1].rowCount = Math.round(encounters.length * 0.985);
    stages[2].status = 'running';
    currentRun.logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', stage: 'Validate', message: 'Passed clinical validation constraints.' });

    await new Promise(r => setTimeout(r, 600));
    stages[2].status = 'completed';
    stages[2].durationLabel = '1.8s';
    stages[2].rowCount = stages[1].rowCount;
    stages[3].status = 'running';
    currentRun.logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', stage: 'Transform', message: 'Features engineered and encoded.' });

    await new Promise(r => setTimeout(r, 600));
    stages[3].status = 'completed';
    stages[3].durationLabel = '1.1s';
    stages[3].rowCount = stages[2].rowCount;
    currentRun.status = 'completed';
    currentRun.completedAt = new Date().toISOString();
    currentRun.totalDuration = '5.0s';
    currentRun.rowsAccepted = stages[3].rowCount || encounters.length;
    currentRun.rowsRejected = encounters.length - (stages[3].rowCount || encounters.length);
    currentRun.logs.push({ timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', stage: 'Load', message: 'ETL Pipeline execution completed successfully.' });

    setPipelineRuns(prev => [currentRun, ...prev]);
    setActivePipelineRun(currentRun);
    setIsProcessing(false);

    if (currentUser) {
      persistPipelineRun(currentRun).catch(() => {});
    }

    recordAudit('Pipeline Execution', 'Pipeline', runId, `ETL run finished for ${datasetName}.`);
    return currentRun;
  };

  const trainNewModel = async (config: MLTrainingConfig): Promise<TrainedModel> => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 700));

    const model = trainReadmissionModel(encounters, config);
    model.ownerId = currentUser?.uid || 'local-user';

    setModels(prev => [model, ...prev]);
    setActiveModel(model);
    setIsProcessing(false);

    if (currentUser) {
      persistModel(model).catch(() => {});
    }

    recordAudit(
      'Model Training',
      'Model',
      model.id,
      `Trained ${model.algorithm} on ${encounters.length} records. ROC-AUC: ${model.metrics.rocAuc}`
    );

    return model;
  };

  const saveCohort = (cohortData: Omit<PatientCohort, 'id' | 'createdAt' | 'ownerId'>) => {
    const newCohort: PatientCohort = {
      ...cohortData,
      id: `coh-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ownerId: currentUser?.uid || 'local-user',
    };
    setCohorts(prev => [newCohort, ...prev]);
    if (currentUser) {
      persistCohort(newCohort).catch(() => {});
    }
    recordAudit('Cohort Saved', 'Cohort', newCohort.id, `Created cohort: ${newCohort.name}`);
  };

  const deleteCohort = (id: string) => {
    setCohorts(prev => prev.filter(c => c.id !== id));
    recordAudit('Cohort Deletion', 'Cohort', id, `Deleted cohort ID: ${id}`);
  };

  const createReport = (reportType: GeneratedReport['reportType'], summary: string) => {
    const newRep: GeneratedReport = {
      id: `rep-${Date.now()}`,
      title: `${reportType} — ${activeDataset?.name || 'Hospital Analytics'}`,
      reportType,
      datasetName: activeDataset?.name || 'Hospital Encounter Dataset',
      generatedAt: new Date().toISOString(),
      summary,
      metrics: {
        'Total Encounters': activeDataset?.rowCount || encounters.length,
        'Readmission Rate': `${activeDataset?.readmissionRate || 11.8}%`,
        'Quality Score': `${activeDataset?.qualityScore || 92.3}%`,
        'Average Stay': `${activeDataset?.avgLengthOfStay || 4.6} days`,
      },
      ownerId: currentUser?.uid || 'local-user',
    };
    setReports(prev => [newRep, ...prev]);
    if (currentUser) {
      persistReport(newRep).catch(() => {});
    }
    recordAudit('Report Generated', 'Report', newRep.id, `Generated ${reportType} report.`);
  };

  const appMode = isSampleMode
    ? 'Sample Data'
    : currentUser && firestoreOnline
    ? 'Connected Firebase'
    : 'Local Development';

  return (
    <DataContext.Provider
      value={{
        activeDataset,
        datasets,
        encounters,
        qualityReport,
        pipelineRuns,
        activePipelineRun,
        models,
        activeModel,
        cohorts,
        auditLogs,
        reports,
        isSampleMode,
        appMode,
        isProcessing,
        searchFilter,
        setSearchFilter,
        setIsSampleMode,
        setActiveDataset,
        setActiveModel,
        generateSyntheticDataset,
        importCustomDataset,
        deleteDataset,
        executePipeline,
        trainNewModel,
        saveCohort,
        deleteCohort,
        recordAudit,
        createReport,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
