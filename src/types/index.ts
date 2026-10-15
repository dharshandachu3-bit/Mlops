export type UserRole = 'Administrator' | 'Data Engineer' | 'Researcher' | 'Viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: string;
}

export interface HospitalEncounter {
  encounter_id: string;
  patient_nbr: string;
  race: string;
  gender: 'Male' | 'Female' | 'Unknown';
  age: '[18-30)' | '[30-45)' | '[45-60)' | '[60-75)' | '[75+)';
  admission_type: 'Emergency' | 'Elective' | 'Urgent' | 'Other';
  discharge_disposition: 'Home' | 'Skilled Nursing Facility' | 'Another Hospital' | 'Other';
  admission_source: string;
  time_in_hospital: number; // 1-14 days
  payer_code: string;
  medical_specialty: string;
  num_lab_procedures: number;
  num_procedures: number;
  num_medications: number;
  number_outpatient: number;
  number_emergency: number;
  number_inpatient: number;
  diag_1: string; // primary diagnosis (e.g. Circulatory, Respiratory, Diabetes, Digestive)
  diag_1_category: 'Cardiovascular' | 'Respiratory' | 'Endocrine' | 'Digestive' | 'Musculoskeletal' | 'Other';
  number_diagnoses: number;
  max_glu_serum: 'None' | 'Norm' | '>200' | '>300';
  A1Cresult: 'None' | 'Norm' | '>7' | '>8';
  metformin: 'No' | 'Steady' | 'Up' | 'Down';
  insulin: 'No' | 'Steady' | 'Up' | 'Down';
  change: 'No' | 'Ch'; // change in medications
  diabetesMed: 'Yes' | 'No';
  readmitted: '<30' | '>30' | 'NO';
  readmission_binary: 0 | 1; // 1 if readmitted (<30 or >30 depending on target strategy)
  risk_score?: number; // predicted readmission probability (0.0 - 1.0)
  predicted_class?: 0 | 1;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  fileName: string;
  rowCount: number;
  columnCount: number;
  qualityScore: number;
  readmissionRate: number;
  avgLengthOfStay: number;
  uniquePatients: number;
  status: 'raw' | 'validated' | 'transformed' | 'active';
  isSynthetic: boolean;
  ownerId: string;
  createdAt: string;
  columns?: string[];
  sampleRecords?: HospitalEncounter[];
  targetDefinition: 'any_readmission' | '30_day_hrrp' | 'three_class';
}

export interface DataQualityReport {
  id: string;
  datasetId: string;
  datasetName: string;
  totalRows: number;
  validRows: number;
  rejectedRows: number;
  qualityScore: number;
  timestamp: string;
  missingValuesByColumn: { [column: string]: { count: number; percentage: number } };
  duplicateCount: number;
  invalidRecordsCount: number;
  schemaIssuesCount: number;
  validationRulesApplied: {
    rule: string;
    passed: boolean;
    violatingRows: number;
    description: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
  rejectedSamples: { rowNumber: number; reason: string; rowData: Record<string, any> }[];
}

export type PipelineStageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface PipelineStage {
  id: string;
  name: string;
  category: 'Extract' | 'Validate' | 'Transform' | 'Load';
  status: PipelineStageStatus;
  durationSeconds?: number;
  durationLabel?: string;
  rowCount?: number;
  details?: string;
}

export interface PipelineRun {
  id: string;
  datasetId: string;
  datasetName: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  totalDuration: string;
  rowsProcessed: number;
  rowsAccepted: number;
  rowsRejected: number;
  stages: PipelineStage[];
  logs: { timestamp: string; level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS'; stage: string; message: string }[];
  ownerId: string;
  config: {
    imputationStrategy: 'median_mode' | 'drop' | 'forward_fill';
    outlierHandling: 'clip' | 'remove' | 'keep';
    targetStrategy: '30_day_hrrp' | 'any_readmission';
    encoding: 'one_hot' | 'label';
  };
}

export interface ModelMetricScores {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  brierScore: number;
}

export interface ConfusionMatrix {
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
}

export interface ROCPoint {
  fpr: number;
  tpr: number;
  threshold: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative' | 'neutral';
  clinicalMeaning: string;
}

export interface TrainedModel {
  id: string;
  modelName: string;
  algorithm: 'Logistic Regression' | 'Random Forest' | 'Gradient Boosted Trees' | 'Baseline Majority';
  version: string;
  targetDefinition: string;
  selectedFeatures: string[];
  metrics: ModelMetricScores;
  confusionMatrix: ConfusionMatrix;
  rocCurve: ROCPoint[];
  featureImportances: FeatureImportance[];
  trainingDuration: string;
  trainSamples: number;
  testSamples: number;
  hyperparameters: Record<string, any>;
  status: 'trained' | 'evaluated' | 'staging' | 'registered' | 'archived';
  createdAt: string;
  ownerId: string;
}

export interface CohortFilter {
  id: string;
  field: keyof HospitalEncounter;
  operator: 'equals' | 'greater_than' | 'less_than' | 'in';
  value: any;
}

export interface PatientCohort {
  id: string;
  name: string;
  description: string;
  filters: CohortFilter[];
  logic: 'AND' | 'OR';
  patientCount: number;
  readmissionRate: number;
  avgLengthOfStay: number;
  ownerId: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: 'Dataset' | 'Pipeline' | 'Model' | 'Cohort' | 'Report' | 'Security';
  resourceId: string;
  actorEmail: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  details: string;
  ownerId: string;
}

export interface GeneratedReport {
  id: string;
  title: string;
  reportType: 'Clinical Analytics' | 'Data Quality Audit' | 'Model Evaluation' | 'Data Drift & Monitoring' | 'ETL Execution';
  datasetName: string;
  generatedAt: string;
  summary: string;
  metrics: Record<string, string | number>;
  ownerId: string;
  downloadData?: string;
}

export interface GroundingResource {
  uri: string;
  title: string;
  snippet?: string;
}
