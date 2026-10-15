import { HospitalEncounter, DatasetMetadata, DataQualityReport } from '../types';

// Seeded pseudorandom generator for reproducible synthetic records
class SeededRandom {
  private seed: number;
  constructor(seed = 1999) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  choice<T>(items: T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }
  weightedChoice<T>(items: { item: T; weight: number }[]): T {
    const total = items.reduce((sum, i) => sum + i.weight, 0);
    let rand = this.next() * total;
    for (const entry of items) {
      if (rand < entry.weight) return entry.item;
      rand -= entry.weight;
    }
    return items[0].item;
  }
  between(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export function generateSyntheticHospitalEncounters(count = 12482, seed = 2026): {
  encounters: HospitalEncounter[];
  metadata: DatasetMetadata;
  qualityReport: DataQualityReport;
} {
  const rng = new SeededRandom(seed);
  const encounters: HospitalEncounter[] = [];

  // Approximate 8,976 unique patients for 12,482 encounters (some patients have 2-4 visits)
  const uniquePatientCount = Math.round(count * 0.719);
  const patientPool: string[] = [];
  for (let i = 1; i <= uniquePatientCount; i++) {
    patientPool.push(`P-${String(i).padStart(6, '0')}`);
  }

  const races = [
    { item: 'Caucasian', weight: 75 },
    { item: 'AfricanAmerican', weight: 19 },
    { item: 'Hispanic', weight: 3 },
    { item: 'Asian', weight: 2 },
    { item: 'Other', weight: 1 },
  ];

  const ageGroups: { item: '[18-30)' | '[30-45)' | '[45-60)' | '[60-75)' | '[75+)'; weight: number; baseReadmitRate: number }[] = [
    { item: '[18-30)', weight: 5, baseReadmitRate: 0.062 },
    { item: '[30-45)', weight: 15, baseReadmitRate: 0.087 },
    { item: '[45-60)', weight: 35, baseReadmitRate: 0.119 },
    { item: '[60-75)', weight: 30, baseReadmitRate: 0.156 },
    { item: '[75+)', weight: 15, baseReadmitRate: 0.138 },
  ];

  const admissionTypes: { item: 'Emergency' | 'Elective' | 'Urgent' | 'Other'; weight: number }[] = [
    { item: 'Emergency', weight: 523 },
    { item: 'Elective', weight: 287 },
    { item: 'Urgent', weight: 126 },
    { item: 'Other', weight: 64 },
  ];

  const dischargeDispositions: { item: 'Home' | 'Skilled Nursing Facility' | 'Another Hospital' | 'Other'; weight: number }[] = [
    { item: 'Home', weight: 682 },
    { item: 'Skilled Nursing Facility', weight: 147 },
    { item: 'Another Hospital', weight: 98 },
    { item: 'Other', weight: 73 },
  ];

  const diagnosisCategories: {
    item: {
      category: 'Cardiovascular' | 'Respiratory' | 'Endocrine' | 'Digestive' | 'Musculoskeletal' | 'Other';
      icdPrefix: string;
      readmitBonus: number;
    };
    weight: number;
  }[] = [
    { item: { category: 'Cardiovascular', icdPrefix: '414', readmitBonus: 0.06 }, weight: 32 },
    { item: { category: 'Respiratory', icdPrefix: '486', readmitBonus: 0.03 }, weight: 18 },
    { item: { category: 'Endocrine', icdPrefix: '250', readmitBonus: 0.01 }, weight: 20 },
    { item: { category: 'Digestive', icdPrefix: '535', readmitBonus: -0.02 }, weight: 12 },
    { item: { category: 'Musculoskeletal', icdPrefix: '715', readmitBonus: -0.04 }, weight: 10 },
    { item: { category: 'Other', icdPrefix: '780', readmitBonus: -0.06 }, weight: 8 },
  ];

  for (let i = 0; i < count; i++) {
    const encounter_id = `ENC-${String(100000 + i)}`;
    const patient_nbr = rng.choice(patientPool);
    const race = rng.weightedChoice(races);
    const gender = rng.choice<'Male' | 'Female'>(['Male', 'Female']);
    const ageConfig = rng.weightedChoice(
      ageGroups.map((g) => ({ item: g, weight: g.weight }))
    );
    const age = ageConfig.item;
    const admission_type = rng.weightedChoice(admissionTypes);
    const discharge_disposition = rng.weightedChoice(dischargeDispositions);
    const diagChoice = rng.weightedChoice(diagnosisCategories);

    // Correlated length of stay: Emergency & SNF tend to have higher stays
    let stayBase = rng.between(1, 4);
    if (admission_type === 'Emergency') stayBase += rng.between(1, 3);
    if (discharge_disposition === 'Skilled Nursing Facility') stayBase += rng.between(2, 6);
    if (age === '[75+)' || age === '[60-75)') stayBase += rng.between(1, 3);
    const time_in_hospital = Math.min(14, Math.max(1, stayBase));

    const num_lab_procedures = rng.between(20, 85);
    const num_procedures = rng.between(0, 6);
    const num_medications = rng.between(5, 32);
    const number_outpatient = rng.next() > 0.7 ? rng.between(1, 4) : 0;
    const number_emergency = rng.next() > 0.8 ? rng.between(1, 3) : 0;
    const number_inpatient = rng.next() > 0.75 ? rng.between(1, 3) : 0;
    const number_diagnoses = rng.between(3, 9);

    const A1Cresult = rng.weightedChoice([
      { item: 'None' as const, weight: 65 },
      { item: 'Norm' as const, weight: 12 },
      { item: '>7' as const, weight: 11 },
      { item: '>8' as const, weight: 12 },
    ]);

    const max_glu_serum = rng.weightedChoice([
      { item: 'None' as const, weight: 80 },
      { item: 'Norm' as const, weight: 10 },
      { item: '>200' as const, weight: 6 },
      { item: '>300' as const, weight: 4 },
    ]);

    const change = rng.next() > 0.54 ? 'Ch' : 'No';
    const diabetesMed = rng.next() > 0.23 ? 'Yes' : 'No';
    const insulin = rng.weightedChoice([
      { item: 'Steady' as const, weight: 35 },
      { item: 'No' as const, weight: 40 },
      { item: 'Up' as const, weight: 15 },
      { item: 'Down' as const, weight: 10 },
    ]);
    const metformin = rng.weightedChoice([
      { item: 'No' as const, weight: 75 },
      { item: 'Steady' as const, weight: 20 },
      { item: 'Up' as const, weight: 3 },
      { item: 'Down' as const, weight: 2 },
    ]);

    // Readmission calculation based on realistic clinical risk models
    let risk = ageConfig.baseReadmitRate + diagChoice.readmitBonus;
    if (discharge_disposition === 'Skilled Nursing Facility') risk += 0.05;
    if (discharge_disposition === 'Another Hospital') risk += 0.03;
    if (time_in_hospital > 6) risk += 0.03;
    if (number_inpatient > 0) risk += 0.06 * number_inpatient;
    if (number_emergency > 0) risk += 0.04 * number_emergency;
    if (A1Cresult === '>8') risk += 0.03;
    if (change === 'Ch') risk += 0.02;

    // Dampen or calibrate to target ~11.8% readmission rate
    const finalRisk = Math.min(0.85, Math.max(0.01, risk * 0.82));
    const isReadmitted = rng.next() < finalRisk;

    let readmitted: '<30' | '>30' | 'NO' = 'NO';
    if (isReadmitted) {
      // HRRP 30-day readmissions vs later readmissions
      readmitted = rng.next() > 0.35 ? '<30' : '>30';
    }

    encounters.push({
      encounter_id,
      patient_nbr,
      race,
      gender,
      age,
      admission_type,
      discharge_disposition,
      admission_source: admission_type === 'Emergency' ? 'Emergency Room' : 'Physician Referral',
      time_in_hospital,
      payer_code: rng.choice(['MC', 'MD', 'HM', 'SP', 'BC', 'UN']),
      medical_specialty: diagChoice.category === 'Cardiovascular' ? 'Cardiology' : 'InternalMedicine',
      num_lab_procedures,
      num_procedures,
      num_medications,
      number_outpatient,
      number_emergency,
      number_inpatient,
      diag_1: `${diagChoice.icdPrefix}.${rng.between(0, 9)}`,
      diag_1_category: diagChoice.category,
      number_diagnoses,
      max_glu_serum,
      A1Cresult,
      metformin,
      insulin,
      change,
      diabetesMed,
      readmitted,
      readmission_binary: readmitted === '<30' ? 1 : 0,
      risk_score: Number(finalRisk.toFixed(3)),
    });
  }

  // Calculate actual dataset statistics
  const readmissionCount = encounters.filter(e => e.readmitted === '<30').length;
  const readmissionRate = Number(((readmissionCount / count) * 100).toFixed(1));
  const avgStay = Number((encounters.reduce((acc, e) => acc + e.time_in_hospital, 0) / count).toFixed(1));

  const metadata: DatasetMetadata = {
    id: `ds-${Date.now()}`,
    name: 'Diabetes 130-US Hospitals (1999–2008) Benchmark',
    fileName: 'diabetes_130_us_hospitals.csv',
    rowCount: count,
    columnCount: 28,
    qualityScore: 92.3,
    readmissionRate,
    avgLengthOfStay: avgStay,
    uniquePatients: uniquePatientCount,
    status: 'active',
    isSynthetic: true,
    ownerId: 'system-demo',
    createdAt: new Date().toISOString(),
    columns: [
      'encounter_id', 'patient_nbr', 'race', 'gender', 'age', 'admission_type',
      'discharge_disposition', 'admission_source', 'time_in_hospital', 'payer_code',
      'medical_specialty', 'num_lab_procedures', 'num_procedures', 'num_medications',
      'number_outpatient', 'number_emergency', 'number_inpatient', 'diag_1',
      'diag_1_category', 'number_diagnoses', 'max_glu_serum', 'A1Cresult',
      'metformin', 'insulin', 'change', 'diabetesMed', 'readmitted'
    ],
    sampleRecords: encounters.slice(0, 50),
    targetDefinition: '30_day_hrrp',
  };

  const qualityReport: DataQualityReport = {
    id: `qr-${Date.now()}`,
    datasetId: metadata.id,
    datasetName: metadata.name,
    totalRows: count,
    validRows: count - Math.round(count * 0.019),
    rejectedRows: Math.round(count * 0.019),
    qualityScore: 92.3,
    timestamp: new Date().toISOString(),
    missingValuesByColumn: {
      weight: { count: Math.round(count * 0.96), percentage: 96.0 },
      payer_code: { count: Math.round(count * 0.39), percentage: 39.0 },
      medical_specialty: { count: Math.round(count * 0.48), percentage: 48.0 },
      max_glu_serum: { count: Math.round(count * 0.012), percentage: 1.2 },
      A1Cresult: { count: Math.round(count * 0.011), percentage: 1.1 },
    },
    duplicateCount: Math.round(count * 0.004),
    invalidRecordsCount: Math.round(count * 0.003),
    schemaIssuesCount: Math.round(count * 0.001),
    validationRulesApplied: [
      { rule: 'Unique Encounter ID', passed: true, violatingRows: 0, description: 'Every encounter must have a non-null, unique primary key', severity: 'critical' },
      { rule: 'Length of Stay Range (1-30 days)', passed: true, violatingRows: 0, description: 'Hospital duration must be positive and not exceed clinical benchmark (30 days)', severity: 'critical' },
      { rule: 'Valid Age Bucket', passed: true, violatingRows: 0, description: 'Age group formatted as standard decade ranges', severity: 'info' },
      { rule: 'Discharge Disposition Integrity', passed: true, violatingRows: 0, description: 'Discharges with status "Expired" excluded from readmission risk', severity: 'warning' },
      { rule: 'Duplicate Patient Encounter Check', passed: false, violatingRows: Math.round(count * 0.004), description: 'Identical timestamps or records within 24h flagged', severity: 'warning' },
      { rule: 'High Missingness in Weight Column', passed: false, violatingRows: Math.round(count * 0.96), description: 'Over 90% missing values detected; recommend exclusion from ML training', severity: 'warning' },
    ],
    rejectedSamples: [
      { rowNumber: 142, reason: 'Duplicate encounter record submitted within 12 hours', rowData: { encounter_id: 'ENC-000142', patient_nbr: 'P-000042', time_in_hospital: 1 } },
      { rowNumber: 809, reason: 'Discharge disposition "Expired" (Ineligible for 30-day readmission outcome)', rowData: { encounter_id: 'ENC-000809', patient_nbr: 'P-000215', discharge_disposition: 'Expired' } },
      { rowNumber: 1337, reason: 'Invalid negative laboratory procedure count (-1)', rowData: { encounter_id: 'ENC-001337', num_lab_procedures: -1 } },
    ],
  };

  return { encounters, metadata, qualityReport };
}
