# READMITIQ AI — Intelligent Hospital Readmission Analytics & Prediction Platform

> **Smarter Data. Healthier Tomorrows.**  
> An enterprise-grade hospital readmission intelligence, ETL pipeline orchestration, data quality auditing, and machine learning prediction platform tailored for health informatics researchers and healthcare quality analysts.

---

## 1. Project Overview

**READMITIQ AI** processes hospital encounter records, models 30-day all-cause readmissions aligned with the **CMS Hospital Readmissions Reduction Program (HRRP)** standards, validates clinical data constraints, tracks feature drift, and offers what-if scenario simulations with Gemini-powered search and maps grounding.

*Academic & Research Disclaimer: READMITIQ AI is intended for academic and health system research. It is not an autonomous medical device for clinical care decisions.*

---

## 2. Key Capabilities & Workflow

1. **Overview Intelligence Dashboard**:
   - Matches the reference design with dark neon cyan/magenta styling.
   - Live KPI cards: Total Encounters (12,482), Unique Patients (8,976), 30-day Readmission Rate (11.8%), Avg. Length of Stay (4.6 days), Data Quality Score (92.3%), Pipeline Status (Completed).
   - Interactive charts: Monthly Readmission Trend, Age Group breakdown, Length of Stay histogram, Diagnosis progress meters, Admission & Discharge donuts, Pipeline Health timers, and Data Lineage chain.

2. **Dataset Manager & UCI Diabetes 130-Hospitals Benchmark**:
   - Drag-and-drop CSV upload with streaming browser parsing via PapaParse.
   - Schema mapping interface and target strategy selector:
     - Option A: Any readmission vs No readmission
     - Option B: CMS 30-Day HRRP standard (`<30` vs `>30` & `NO`)
     - Option C: Multi-class 3-tier target
   - One-click synthetic demo generator (reproducible 12,482 records).
   - CSV export capability.

3. **Data Quality Center**:
   - Multi-point validation: missing value analysis, duplicate hashing, range checks (1–30d hospital stay), deceased patient exclusions.
   - Transparent, formulaic 92.3% Data Quality Score.
   - Quarantined records inspector and downloadable rejected rows CSV.

4. **ETL Pipeline Studio & Pipeline Replay**:
   - 4 deterministic data layers: **RAW → STAGING → CLEANED → ANALYTICAL**.
   - Real-time step execution with stage durations and live log streaming.
   - **Pipeline Replay**: Re-execute identical transformations on newer dataset versions without overwriting historical runs.

5. **Healthcare Analytics**:
   - Multi-dimensional filters (Age, Gender, Admission Type, Diagnosis).
   - Polypharmacy correlation analysis (Medication count vs readmission risk).
   - Prior Inpatient Admissions risk gradient.
   - Correlation vs. causation guidelines.

6. **Cohort Explorer**:
   - Combinatory Boolean filter builder (`AND` / `OR`).
   - Real-time subpopulation size, readmission rate, and length of stay previews.
   - Side-by-side comparative risk evaluation (Cohort A vs Cohort B).
   - Persistent cohort definitions in Firestore.

7. **AI Prediction Lab & Scenario Explorer**:
   - Supervised classification algorithms: **Random Forest**, **Logistic Regression**, **Gradient Boosted Trees**, **Baseline Majority**.
   - Automatic identifier exclusion (`encounter_id`, `patient_nbr`) to prevent target leakage.
   - Global Feature Importance and clinical attribution.
   - **Readmission Scenario Explorer**: Interactive simulator where researchers alter patient factors (inpatient visits, stay duration, SNF discharge, HbA1c elevation) to observe real-time model probability shifts.

8. **Model Evaluation & MLOps Center**:
   - Interactive ROC Curve with Trapezoidal AUC calculation.
   - Confusion Matrix (TP, FP, TN, FN).
   - Model Registry with versioning (`v1.0.0`, `v1.1.0`) and lifecycle transitions (`Trained → Staging → Registered → Archived`).
   - **Population Stability Index (PSI)** data drift monitoring with tolerance alerts.

9. **Clinical Grounding Hub (Google AI)**:
   - **Google Search Grounding**: Leverages `gemini-3.8-flash` with `{ googleSearch: {} }` for real-time CMS HRRP penalty updates and ADA clinical standards.
   - **Google Maps Grounding**: Leverages `gemini-3.8-flash` with `{ googleMaps: {} }` to identify nearby post-discharge rehabilitation and Skilled Nursing Facilities (SNF) with verified clickable Google Maps links.
   - **Clinical Copilot**: AI assistant for discharge transition protocols.

10. **Apache Airflow Orchestration & DAG Monitor**:
    - **Airflow Orchestrator UI**: Visual DAG graph view, interactive task execution simulator, task instance inspector, live execution logs, and XCom payload viewing.
    - **`hospital_readmission_etl_dag.py`**: Extracts 12,482 raw encounters, evaluates clinical constraints in a BranchPythonOperator, transforms features with zero target leakage, and loads partitioned analytical tables.
    - **`data_quality_audit_dag.py`**: Scheduled quality checks (missingness rates, fuzzy hash duplicate admissions, compliance logging).
    - **`model_retraining_trigger_dag.py`**: Population Stability Index (PSI) drift monitoring triggering candidate model retraining and automated staging promotions.
    - **Production Docker Compose**: Ready-to-deploy Airflow 2.9.1 stack with PostgreSQL metadata database, Webserver, Scheduler, and LocalExecutor.

11. **Firebase Authentication & Firestore Persistence**:
    - Google Sign-In with Firebase Auth.
    - Role-Based Access Control (RBAC): Administrator, Data Engineer, Researcher, Viewer.
    - Cloud Firestore persistence for datasets, pipeline runs, cohorts, trained models, reports, and security audit logs.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons, PapaParse
- **AI & Grounding**: Google GenAI TypeScript SDK (`@google/genai`) on server-side with `gemini-3.8-flash` (Search & Maps tools) and `gemini-3.1-flash-lite`
- **Database & Auth**: Google Cloud Firestore & Firebase Authentication
- **ETL & Server**: Express middleware embedded in Vite development & preview server

---

## 4. Local Installation & Development

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run the application
npm run dev

# 3. Test compilation
npm run build

# 4. Run TypeScript checks
npm run lint
```
The app will be accessible at `http://localhost:3000`.

---

## 5. Security & Compliance

- **Zero API Key Leakage**: All `@google/genai` calls execute exclusively on server-side routes (`/api/gemini/*`).
- **HIPAA-Conscious Design**: All demonstration encounter records are synthetic; direct identifiers are scrubbed; immutable audit logs record every sensitive data mutation.
