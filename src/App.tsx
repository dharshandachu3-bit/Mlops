import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { DatasetManager } from './components/dataset/DatasetManager';
import { DataQualityCenter } from './components/quality/DataQualityCenter';
import { PipelineStudio } from './components/pipeline/PipelineStudio';
import { PipelineRuns } from './components/pipeline/PipelineRuns';
import { HealthcareAnalytics } from './components/analytics/HealthcareAnalytics';
import { CohortExplorer } from './components/cohort/CohortExplorer';
import { AIPredictionLab } from './components/prediction/AIPredictionLab';
import { ModelEvaluation } from './components/prediction/ModelEvaluation';
import { MLOpsCenter } from './components/mlops/MLOpsCenter';
import { ClinicalGroundingLab } from './components/grounding/ClinicalGroundingLab';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { DataLineageExplorer } from './components/lineage/DataLineageExplorer';
import { AuditLogs } from './components/audit/AuditLogs';
import { Settings } from './components/settings/Settings';
import { HelpDocumentation } from './components/help/HelpDocumentation';

function MainShell() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [dateRange, setDateRange] = useState('Last 30 days');

  const renderActivePage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewDashboard onNavigate={setCurrentPage} dateRange={dateRange} />;
      case 'datasets':
        return <DatasetManager />;
      case 'quality':
        return <DataQualityCenter />;
      case 'pipeline-studio':
        return <PipelineStudio />;
      case 'pipeline-runs':
        return <PipelineRuns />;
      case 'analytics':
        return <HealthcareAnalytics />;
      case 'cohorts':
        return <CohortExplorer />;
      case 'prediction-lab':
        return <AIPredictionLab />;
      case 'model-eval':
        return <ModelEvaluation />;
      case 'mlops':
        return <MLOpsCenter />;
      case 'clinical-grounding':
        return <ClinicalGroundingLab />;
      case 'reports':
        return <ReportsCenter />;
      case 'lineage':
        return <DataLineageExplorer />;
      case 'audit':
        return <AuditLogs />;
      case 'settings':
        return <Settings />;
      default:
        return <OverviewDashboard onNavigate={setCurrentPage} dateRange={dateRange} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070B17] text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenHelp={() => setShowHelp(true)}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-[1700px] mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Global Help Modal */}
      {showHelp && <HelpDocumentation onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainShell />
      </DataProvider>
    </AuthProvider>
  );
}
