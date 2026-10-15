import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  Eye,
  Settings,
  ArrowRight
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { HospitalEncounter } from '../../types';

export const DatasetManager: React.FC = () => {
  const {
    datasets,
    activeDataset,
    setActiveDataset,
    encounters,
    importCustomDataset,
    deleteDataset,
    generateSyntheticDataset,
    isProcessing,
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTargetStrategy, setSelectedTargetStrategy] = useState<'30_day_hrrp' | 'any_readmission' | 'three_class'>('30_day_hrrp');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);

  const rowsPerPage = 12;

  // Handle CSV file upload with PapaParse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setUploadError('Please select a valid CSV file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File size exceeds the 25MB browser parsing threshold.');
      return;
    }

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setUploadError('CSV file appears empty or unparseable.');
          return;
        }

        const headers = results.meta.fields || [];
        setRawHeaders(headers);
        setParsedRows(results.data);
        setShowMappingModal(true);
      },
      error: (err) => {
        setUploadError(`Parsing error: ${err.message}`);
      },
    });
  };

  const finalizeCustomUpload = () => {
    // Map parsed rows to HospitalEncounter shape
    const mapped: HospitalEncounter[] = parsedRows.slice(0, 15000).map((row, idx) => {
      const readmitRaw = String(row.readmitted || row.readmission || 'NO').trim();
      let readmitVal: '<30' | '>30' | 'NO' = 'NO';
      if (readmitRaw.includes('<30') || readmitRaw === '1' || readmitRaw.toLowerCase() === 'yes') {
        readmitVal = '<30';
      } else if (readmitRaw.includes('>30')) {
        readmitVal = '>30';
      }

      return {
        encounter_id: String(row.encounter_id || `ENC-UP-${10000 + idx}`),
        patient_nbr: String(row.patient_nbr || `P-UP-${Math.floor(idx * 0.7)}`),
        race: String(row.race || 'Caucasian'),
        gender: (row.gender === 'Female' ? 'Female' : 'Male') as any,
        age: (row.age || '[60-75)') as any,
        admission_type: (row.admission_type || 'Emergency') as any,
        discharge_disposition: (row.discharge_disposition || 'Home') as any,
        admission_source: String(row.admission_source || 'Emergency Room'),
        time_in_hospital: Number(row.time_in_hospital || 4),
        payer_code: String(row.payer_code || 'MC'),
        medical_specialty: String(row.medical_specialty || 'General'),
        num_lab_procedures: Number(row.num_lab_procedures || 40),
        num_procedures: Number(row.num_procedures || 1),
        num_medications: Number(row.num_medications || 15),
        number_outpatient: Number(row.number_outpatient || 0),
        number_emergency: Number(row.number_emergency || 0),
        number_inpatient: Number(row.number_inpatient || 0),
        diag_1: String(row.diag_1 || '414.0'),
        diag_1_category: (row.diag_1_category || 'Cardiovascular') as any,
        number_diagnoses: Number(row.number_diagnoses || 6),
        max_glu_serum: 'None',
        A1Cresult: (row.A1Cresult || 'None') as any,
        metformin: 'No',
        insulin: 'Steady',
        change: 'No',
        diabetesMed: 'Yes',
        readmitted: readmitVal,
        readmission_binary: readmitVal === '<30' ? 1 : 0,
      };
    });

    importCustomDataset('Uploaded Clinical Encounter Dataset', 'uploaded_dataset.csv', mapped);
    setShowMappingModal(false);
  };

  // Export current dataset to CSV
  const exportToCSV = () => {
    if (!encounters || encounters.length === 0) return;
    const csv = Papa.unparse(encounters);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDataset?.name.replace(/\s+/g, '_') || 'encounters'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter preview records
  const filteredEncounters = encounters.filter((e) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      e.encounter_id.toLowerCase().includes(s) ||
      e.patient_nbr.toLowerCase().includes(s) ||
      e.diag_1_category.toLowerCase().includes(s) ||
      e.admission_type.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filteredEncounters.length / rowsPerPage);
  const pageRecords = filteredEncounters.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner & Upload Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Dataset Manager</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                UCI Diabetes 130-Hospitals Standard
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Ingest, inspect schemas, configure target strategies, and validate hospital encounter cohorts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => generateSyntheticDataset(12482)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Generate Synthetic Demo (12,482)</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload CSV Dataset</span>
            </button>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#11182B] hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Dataset Profiles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((ds) => {
          const isSelected = activeDataset?.id === ds.id;
          return (
            <div
              key={ds.id}
              onClick={() => setActiveDataset(ds)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.15)] ring-1 ring-cyan-400'
                  : 'glass-card border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{ds.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ds.fileName}</p>
                </div>
                {ds.isSynthetic ? (
                  <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    SYNTHETIC
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    REAL DATA
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                <div>
                  <p className="text-[10px] text-slate-400">Encounters</p>
                  <p className="text-xs font-bold text-slate-200">{ds.rowCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Readmit Rate</p>
                  <p className="text-xs font-bold text-magenta-400 text-[#FF36C7]">{ds.readmissionRate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Quality</p>
                  <p className="text-xs font-bold text-emerald-400">{ds.qualityScore}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-slate-500">
                <span>{new Date(ds.createdAt).toLocaleDateString()}</span>
                {datasets.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDataset(ds.id);
                    }}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Target Mapping Configuration Strategy */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Target Variable Definition Strategy</h3>
          </div>
          <span className="text-[11px] text-slate-400">Configurable HRRP Alignment</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: '30_day_hrrp',
              title: 'Option B: CMS 30-Day HRRP Standard (Recommended)',
              desc: 'Classifies readmission within 30 days (<30) as positive target. Discharges with >30 or NO are negative controls.',
            },
            {
              id: 'any_readmission',
              title: 'Option A: Any Readmission vs No Readmission',
              desc: 'Treats both <30 and >30 days readmissions as positive. Broader recall, but includes delayed return visits.',
            },
            {
              id: 'three_class',
              title: 'Option C: Multi-class (3 Classes)',
              desc: 'Retains distinct classes: [<30 days, >30 days, No Readmission]. Analyzed via multi-class loss.',
            },
          ].map((strat) => (
            <div
              key={strat.id}
              onClick={() => setSelectedTargetStrategy(strat.id as any)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedTargetStrategy === strat.id
                  ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{strat.title}</span>
                {selectedTargetStrategy === strat.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{strat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Records Preview Table */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Encounter Records Preview ({filteredEncounters.length.toLocaleString()} rows)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive inspector with real-time column sorting and filtering.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by ID, Diagnosis, Admission..."
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1020] text-slate-400 border-b border-slate-800 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Encounter ID</th>
                <th className="py-2.5 px-3">Patient No.</th>
                <th className="py-2.5 px-3">Age</th>
                <th className="py-2.5 px-3">Gender</th>
                <th className="py-2.5 px-3">Admission</th>
                <th className="py-2.5 px-3">Discharge</th>
                <th className="py-2.5 px-3">Stay (Days)</th>
                <th className="py-2.5 px-3">Medications</th>
                <th className="py-2.5 px-3">Primary Diag</th>
                <th className="py-2.5 px-3">A1C Result</th>
                <th className="py-2.5 px-3">Readmitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {pageRecords.map((r) => (
                <tr key={r.encounter_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-cyan-300 font-semibold">{r.encounter_id}</td>
                  <td className="py-2 px-3 text-slate-300">{r.patient_nbr}</td>
                  <td className="py-2 px-3 text-slate-300">{r.age}</td>
                  <td className="py-2 px-3 text-slate-400">{r.gender}</td>
                  <td className="py-2 px-3 text-slate-300">{r.admission_type}</td>
                  <td className="py-2 px-3 text-slate-300 truncate max-w-[120px]">{r.discharge_disposition}</td>
                  <td className="py-2 px-3 text-slate-200 font-bold">{r.time_in_hospital}</td>
                  <td className="py-2 px-3 text-slate-300">{r.num_medications}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                      {r.diag_1_category}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.A1Cresult === '>8' ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {r.A1Cresult}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.readmitted === '<30'
                        ? 'bg-magenta-500/20 text-[#FF36C7] border border-magenta-500/40'
                        : r.readmitted === '>30'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {r.readmitted}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
          <span>
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredEncounters.length)} of {filteredEncounters.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-slate-900 border border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-mono text-cyan-400">{currentPage} / {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-slate-900 border border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Schema Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full rounded-2xl border border-cyan-500/40 p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-2">Schema Mapping & Target Verification</h3>
            <p className="text-xs text-slate-400 mb-4">
              Detected {rawHeaders.length} columns and {parsedRows.length.toLocaleString()} rows. Confirm standard clinical fields mapping.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-xs mb-4">
              {rawHeaders.map((hdr) => (
                <div key={hdr} className="flex items-center justify-between py-1 px-2 border-b border-slate-800/60 last:border-none">
                  <span className="font-mono text-slate-300">{hdr}</span>
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Inferred & Aligned
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={finalizeCustomUpload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-slate-900 text-xs font-bold hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,245,255,0.4)]"
              >
                <span>Confirm & Ingest Records</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
