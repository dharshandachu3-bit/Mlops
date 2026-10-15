import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Info,
  HelpCircle,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useData } from '../../context/DataContext';
import {
  getDefaultFeatureList,
  simulateEncounterPrediction
} from '../../services/mlEngine';
import { HospitalEncounter, TrainedModel } from '../../types';

export const AIPredictionLab: React.FC = () => {
  const { encounters, activeDataset, activeModel, trainNewModel, isProcessing, setActiveModel } = useData();

  // Model Training Config State
  const [algorithm, setAlgorithm] = useState<'Random Forest' | 'Logistic Regression' | 'Gradient Boosted Trees' | 'Baseline Majority'>('Random Forest');
  const [targetDefinition, setTargetDefinition] = useState<'30_day_hrrp' | 'any_readmission'>('30_day_hrrp');
  const [trainSplit, setTrainSplit] = useState<number>(0.8);
  const [randomSeed, setRandomSeed] = useState<number>(2026);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'number_inpatient', 'time_in_hospital', 'discharge_SNF', 'num_medications',
    'diag_Cardiovascular', 'a1c_high', 'number_emergency', 'change_medication'
  ]);

  // Scenario Simulator Interactive Inputs
  const [simEncounter, setSimEncounter] = useState<HospitalEncounter>({
    encounter_id: 'SIM-PATIENT-01',
    patient_nbr: 'P-SYNTH-99',
    race: 'Caucasian',
    gender: 'Male',
    age: '[60-75)',
    admission_type: 'Emergency',
    discharge_disposition: 'Home',
    admission_source: 'Emergency Room',
    time_in_hospital: 5,
    payer_code: 'MC',
    medical_specialty: 'Cardiology',
    num_lab_procedures: 48,
    num_procedures: 1,
    num_medications: 16,
    number_outpatient: 0,
    number_emergency: 1,
    number_inpatient: 1,
    diag_1: '414.0',
    diag_1_category: 'Cardiovascular',
    number_diagnoses: 6,
    max_glu_serum: 'None',
    A1Cresult: '>8',
    metformin: 'No',
    insulin: 'Steady',
    change: 'Ch',
    diabetesMed: 'Yes',
    readmitted: 'NO',
    readmission_binary: 0,
  });

  const availableFeatures = getDefaultFeatureList();

  const handleToggleFeature = (key: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleTrain = async () => {
    await trainNewModel({
      datasetName: activeDataset?.name || 'Hospital Encounter Dataset',
      algorithm,
      targetDefinition,
      trainTestSplitRatio: trainSplit,
      randomSeed,
      features: selectedFeatures,
      hyperparameters: {
        numTrees: 50,
        maxDepth: 8,
        classWeight: 'balanced',
        learningRate: 0.05,
        iterations: 150,
      },
    });
  };

  // Run live scenario prediction
  const simResult = activeModel
    ? simulateEncounterPrediction(activeModel, simEncounter)
    : {
        predictedProbability: 0.18,
        readmissionPredicted: false,
        riskTier: 'Moderate Risk' as const,
        topRiskContributors: [
          { feature: 'Prior Inpatient Admissions', impact: '+14% risk factor' },
          { feature: 'Cardiovascular Diagnosis', impact: '+9% baseline risk' },
        ],
      };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">AI Prediction Lab &amp; Clinical Modeling</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                Supervised Classification &amp; Explainability
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Train mathematical readmission estimators, audit feature importances, and run what-if clinical scenario simulations.
            </p>
          </div>

          <button
            onClick={handleTrain}
            disabled={isProcessing || selectedFeatures.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(0,245,255,0.4)] disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${isProcessing ? 'animate-pulse' : ''}`} />
            <span>{isProcessing ? 'Training Model...' : `Train ${algorithm}`}</span>
          </button>
        </div>
      </div>

      {/* Training Configuration Panel */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Experiment Hyperparameters &amp; Target Setup</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Model Architecture</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400 font-medium"
            >
              <option value="Random Forest">Random Forest Classifier</option>
              <option value="Logistic Regression">Logistic Regression (L2 Regularized)</option>
              <option value="Gradient Boosted Trees">Gradient Boosted Trees</option>
              <option value="Baseline Majority">Majority Class Baseline</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Target Definition</label>
            <select
              value={targetDefinition}
              onChange={(e) => setTargetDefinition(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value="30_day_hrrp">CMS HRRP 30-Day Readmission (&lt;30)</option>
              <option value="any_readmission">All-Cause Any Readmission</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Train / Test Split</label>
            <select
              value={trainSplit}
              onChange={(e) => setTrainSplit(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400"
            >
              <option value={0.8}>80% Train / 20% Test (Stratified)</option>
              <option value={0.7}>70% Train / 30% Test</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium block mb-1">Random Seed</label>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2.5 outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        {/* Feature Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-semibold">
              Select Features ({selectedFeatures.length} selected)
            </span>
            <span className="text-[11px] text-cyan-400">Identifiers (encounter_id, patient_nbr) automatically excluded</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {availableFeatures.map((f) => {
              const isSelected = selectedFeatures.includes(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => handleToggleFeature(f.key)}
                  className={`p-2 rounded-lg text-left text-xs border transition-all truncate ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,245,255,0.15)] font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="truncate">{f.label}</p>
                  <span className="text-[9px] text-slate-500 uppercase">{f.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Model Performance Card */}
      {activeModel && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs text-cyan-400 font-mono uppercase font-bold">Active Trained Estimator</span>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{activeModel.modelName}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {activeModel.status.toUpperCase()}
                </span>
              </h3>
            </div>
            <div className="text-right text-xs text-slate-400">
              Training duration: <strong className="text-white font-mono">{activeModel.trainingDuration}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400">ROC-AUC Score</span>
              <p className="text-xl font-extrabold text-cyan-300 font-mono">{activeModel.metrics.rocAuc}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400">Accuracy</span>
              <p className="text-xl font-extrabold text-white font-mono">{(activeModel.metrics.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400">Precision</span>
              <p className="text-xl font-extrabold text-purple-300 font-mono">{(activeModel.metrics.precision * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400">Recall (Sensitivity)</span>
              <p className="text-xl font-extrabold text-magenta-400 text-[#FF36C7] font-mono">{(activeModel.metrics.recall * 100).toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400">F1 Score</span>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">{activeModel.metrics.f1Score}</p>
            </div>
          </div>

          {/* Feature Importance Bar Chart */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-white mb-2">Global Feature Importance &amp; Impact Weights</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeModel.featureImportances.slice(0, 8)} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="feature" stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#11182B', borderColor: '#00F5FF', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="importance" fill="#00F5FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Readmission Scenario Explorer (What-If Simulator) */}
      <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Readmission Scenario Explorer</h3>
              <p className="text-xs text-slate-400">
                Hypothetical sensitivity analyzer: Modify patient factors to observe real-time predicted probability shifts.
              </p>
            </div>
          </div>

          <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
            Research Model Estimate Only
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Prior Inpatient Admissions (past 12m): {simEncounter.number_inpatient}
                </label>
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={simEncounter.number_inpatient}
                  onChange={(e) => setSimEncounter({ ...simEncounter, number_inpatient: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">
                  Length of Stay: {simEncounter.time_in_hospital} days
                </label>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={simEncounter.time_in_hospital}
                  onChange={(e) => setSimEncounter({ ...simEncounter, time_in_hospital: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Discharge Destination</label>
                <select
                  value={simEncounter.discharge_disposition}
                  onChange={(e) => setSimEncounter({ ...simEncounter, discharge_disposition: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-cyan-400"
                >
                  <option value="Home">Home (Routine Discharge)</option>
                  <option value="Skilled Nursing Facility">Skilled Nursing Facility (SNF)</option>
                  <option value="Another Hospital">Transferred to Another Hospital</option>
                  <option value="Other">Other Specialized Facility</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Primary Diagnosis Category</label>
                <select
                  value={simEncounter.diag_1_category}
                  onChange={(e) => setSimEncounter({ ...simEncounter, diag_1_category: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-cyan-400"
                >
                  <option value="Cardiovascular">Cardiovascular (Heart Failure, CAD)</option>
                  <option value="Respiratory">Respiratory (COPD, Pneumonia)</option>
                  <option value="Endocrine">Endocrine (Diabetes Mellitus)</option>
                  <option value="Digestive">Digestive Disorders</option>
                  <option value="Musculoskeletal">Musculoskeletal</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">HbA1c Result</label>
                <select
                  value={simEncounter.A1Cresult}
                  onChange={(e) => setSimEncounter({ ...simEncounter, A1Cresult: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-cyan-400"
                >
                  <option value="None">None (Not Measured)</option>
                  <option value="Norm">Norm (&lt;7%)</option>
                  <option value=">7">&gt;7%</option>
                  <option value=">8">&gt;8% (Uncontrolled Glycemia)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-semibold block mb-1">Medication Regimen Change</label>
                <select
                  value={simEncounter.change}
                  onChange={(e) => setSimEncounter({ ...simEncounter, change: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg p-2 outline-none focus:border-cyan-400"
                >
                  <option value="No">No Change in Dosage</option>
                  <option value="Ch">Dosage Adjusted During Stay</option>
                </select>
              </div>
            </div>
          </div>

          {/* Model Inference Result Display (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase">Inference Output</span>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-black text-cyan-300 font-mono">
                  {(simResult.predictedProbability * 100).toFixed(1)}%
                </span>
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  simResult.riskTier === 'Critical Risk' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                  simResult.riskTier === 'High Risk' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {simResult.riskTier}
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden my-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    simResult.predictedProbability > 0.35 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, simResult.predictedProbability * 200)}%` }}
                />
              </div>

              <h5 className="text-[11px] font-bold text-slate-300 mb-1">Top Risk Contributions:</h5>
              <div className="space-y-1">
                {simResult.topRiskContributors.map((c, i) => (
                  <div key={i} className="flex justify-between text-[11px] text-slate-300">
                    <span>{c.feature}</span>
                    <span className="font-mono text-cyan-300">{c.impact}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500">
              Evaluated live using {activeModel?.algorithm || 'Random Forest'} model weights.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
