import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import {
  DatasetMetadata,
  PipelineRun,
  TrainedModel,
  PatientCohort,
  AuditLogEntry,
  GeneratedReport,
  UserProfile
} from '../types';

// USERS
export async function saveUserProfile(user: UserProfile): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

// DATASETS
export async function persistDataset(dataset: DatasetMetadata): Promise<void> {
  const path = `datasets/${dataset.id}`;
  try {
    // Exclude large sample records array from firestore document if > 500KB to respect doc limit
    const toSave = {
      ...dataset,
      sampleRecords: dataset.sampleRecords ? dataset.sampleRecords.slice(0, 20) : [],
    };
    await setDoc(doc(db, 'datasets', dataset.id), toSave);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchUserDatasets(userId: string): Promise<DatasetMetadata[]> {
  const path = 'datasets';
  try {
    const q = query(collection(db, 'datasets'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    const datasets: DatasetMetadata[] = [];
    snapshot.forEach(docSnap => {
      datasets.push(docSnap.data() as DatasetMetadata);
    });
    return datasets;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function removeDataset(datasetId: string): Promise<void> {
  const path = `datasets/${datasetId}`;
  try {
    await deleteDoc(doc(db, 'datasets', datasetId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// PIPELINE RUNS
export async function persistPipelineRun(run: PipelineRun): Promise<void> {
  const path = `pipelineRuns/${run.id}`;
  try {
    await setDoc(doc(db, 'pipelineRuns', run.id), run);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchPipelineRuns(userId: string): Promise<PipelineRun[]> {
  const path = 'pipelineRuns';
  try {
    const q = query(collection(db, 'pipelineRuns'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    const runs: PipelineRun[] = [];
    snapshot.forEach(docSnap => {
      runs.push(docSnap.data() as PipelineRun);
    });
    return runs;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// MODEL EXPERIMENTS
export async function persistModel(model: TrainedModel): Promise<void> {
  const path = `modelExperiments/${model.id}`;
  try {
    await setDoc(doc(db, 'modelExperiments', model.id), model);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchModels(userId: string): Promise<TrainedModel[]> {
  const path = 'modelExperiments';
  try {
    const q = query(collection(db, 'modelExperiments'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    const models: TrainedModel[] = [];
    snapshot.forEach(docSnap => {
      models.push(docSnap.data() as TrainedModel);
    });
    return models;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function updateModelStatus(modelId: string, status: TrainedModel['status']): Promise<void> {
  const path = `modelExperiments/${modelId}`;
  try {
    await updateDoc(doc(db, 'modelExperiments', modelId), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// COHORTS
export async function persistCohort(cohort: PatientCohort): Promise<void> {
  const path = `cohorts/${cohort.id}`;
  try {
    await setDoc(doc(db, 'cohorts', cohort.id), cohort);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchCohorts(userId: string): Promise<PatientCohort[]> {
  const path = 'cohorts';
  try {
    const q = query(collection(db, 'cohorts'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    const cohorts: PatientCohort[] = [];
    snapshot.forEach(docSnap => {
      cohorts.push(docSnap.data() as PatientCohort);
    });
    return cohorts;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function removeCohort(cohortId: string): Promise<void> {
  const path = `cohorts/${cohortId}`;
  try {
    await deleteDoc(doc(db, 'cohorts', cohortId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// AUDIT LOGS
export async function persistAuditLog(entry: AuditLogEntry): Promise<void> {
  const path = `auditLogs/${entry.id}`;
  try {
    await setDoc(doc(db, 'auditLogs', entry.id), entry);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchAuditLogs(userId: string): Promise<AuditLogEntry[]> {
  const path = 'auditLogs';
  try {
    const q = query(collection(db, 'auditLogs'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    const logs: AuditLogEntry[] = [];
    snapshot.forEach(docSnap => {
      logs.push(docSnap.data() as AuditLogEntry);
    });
    return logs;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// REPORTS
export async function persistReport(report: GeneratedReport): Promise<void> {
  const path = `reports/${report.id}`;
  try {
    await setDoc(doc(db, 'reports', report.id), report);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchReports(userId: string): Promise<GeneratedReport[]> {
  const path = 'reports';
  try {
    const q = query(collection(db, 'reports'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    const reports: GeneratedReport[] = [];
    snapshot.forEach(docSnap => {
      reports.push(docSnap.data() as GeneratedReport);
    });
    return reports;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}
