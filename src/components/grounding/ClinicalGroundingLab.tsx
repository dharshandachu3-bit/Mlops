import React, { useState } from 'react';
import {
  Compass,
  Search,
  MapPin,
  ExternalLink,
  Sparkles,
  RotateCcw,
  BookOpen,
  Building,
  AlertCircle,
  HelpCircle,
  Activity
} from 'lucide-react';
import {
  requestSearchGuidance,
  requestNearbyFacilities,
  requestClinicalAnalysis,
  SearchGuidanceResult,
  MapsGroundingResult
} from '../../services/geminiService';
import { useData } from '../../context/DataContext';

export const ClinicalGroundingLab: React.FC = () => {
  const { activeDataset, activeModel } = useData();

  // Mode: Search Grounding vs Maps Grounding vs Deep Clinical Copilot
  const [activeTab, setActiveTab] = useState<'search' | 'maps' | 'copilot'>('search');

  // Search Grounding state
  const [searchQuery, setSearchQuery] = useState(
    'CMS Hospital Readmissions Reduction Program (HRRP) 30-day penalty benchmarks and diabetes care standards'
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchGuidanceResult | null>(null);

  // Maps Grounding state
  const [facilityType, setFacilityType] = useState('skilled nursing facility, diabetes rehabilitation clinic');
  const [userLat, setUserLat] = useState<number>(37.7749); // default SF
  const [userLng, setUserLng] = useState<number>(-122.4194);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<MapsGroundingResult | null>(null);

  // Clinical Copilot state
  const [copilotQuestion, setCopilotQuestion] = useState(
    'What evidence-based clinical protocols mitigate 30-day readmissions in elderly diabetic patients with cardiovascular disease?'
  );
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);

  // Trigger Google Search Grounding with gemini-3.8-flash
  const handleRunSearchGrounding = async () => {
    setSearchLoading(true);
    try {
      const res = await requestSearchGuidance(searchQuery);
      setSearchResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Trigger Google Maps Grounding with gemini-3.8-flash
  const handleRunMapsGrounding = async () => {
    setMapsLoading(true);
    try {
      // Try asking for browser location if supported
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserLat(lat);
            setUserLng(lng);
            const res = await requestNearbyFacilities(lat, lng, facilityType);
            setMapsResult(res);
            setMapsLoading(false);
          },
          async () => {
            // Fallback coords
            const res = await requestNearbyFacilities(userLat, userLng, facilityType);
            setMapsResult(res);
            setMapsLoading(false);
          }
        );
      } else {
        const res = await requestNearbyFacilities(userLat, userLng, facilityType);
        setMapsResult(res);
        setMapsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setMapsLoading(false);
    }
  };

  // Trigger Deep Clinical Analysis
  const handleRunCopilot = async () => {
    setCopilotLoading(true);
    try {
      const res = await requestClinicalAnalysis(
        {
          dataset: activeDataset?.name,
          readmissionRate: activeDataset?.readmissionRate,
          avgStay: activeDataset?.avgLengthOfStay,
        },
        activeModel?.metrics,
        copilotQuestion
      );
      setCopilotResponse(res.analysis);
    } catch (err: any) {
      console.error(err);
      setCopilotResponse('Clinical intelligence evaluation temporarily unavailable.');
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold text-white">Clinical AI &amp; Google Grounding Hub</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                gemini-3.8-flash (Search &amp; Maps Grounding)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Query real-time medical literature and CMS guidelines via Google Search, and locate transitional post-discharge facilities via Google Maps.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Grounding (Guidelines)</span>
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'maps'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Maps Grounding (Post-Discharge Care)</span>
          </button>

          <button
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'copilot'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Clinical Readmission Copilot</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Search Grounding with gemini-3.8-flash */}
      {activeTab === 'search' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Google Search Grounded Medical Literature</h3>
            <p className="text-xs text-slate-400">
              Grounded with real-time web search results via Google Search tool on gemini-3.8-flash.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic or clinical standard (e.g. ADA 2026 guidelines, HRRP penalties)..."
              className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-3 outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleRunSearchGrounding}
              disabled={searchLoading || !searchQuery.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 disabled:opacity-40 shadow-[0_0_15px_rgba(0,245,255,0.3)] shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{searchLoading ? 'Grounding...' : 'Query Search Data'}</span>
            </button>
          </div>

          {searchResult && (
            <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                {searchResult.text}
              </div>

              {/* Source citations */}
              {searchResult.sources.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Search Grounding Sources &amp; Citations:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResult.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-400/50 flex items-center justify-between text-xs text-cyan-300 transition-colors group"
                      >
                        <span className="truncate pr-2 font-medium">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Maps Grounding with gemini-3.8-flash */}
      {activeTab === 'maps' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Google Maps Grounded Post-Discharge Referral Locator</h3>
            <p className="text-xs text-slate-400">
              Query geographic post-acute resources (Skilled Nursing, Transitional Care) near patient communities to prevent readmission lapses.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              placeholder="Facility type (e.g., skilled nursing facility, diabetes rehabilitation center)"
              className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-3 outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleRunMapsGrounding}
              disabled={mapsLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 disabled:opacity-40 shadow-[0_0_15px_rgba(0,245,255,0.3)] shrink-0"
            >
              <MapPin className="w-4 h-4" />
              <span>{mapsLoading ? 'Locating Facilities...' : 'Find Nearby Facilities'}</span>
            </button>
          </div>

          {mapsResult && (
            <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                {mapsResult.text}
              </div>

              {/* Verified Google Maps Links - Mandatory per skill */}
              {mapsResult.places.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Verified Google Maps Facility Links:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {mapsResult.places.map((place, i) => (
                      <a
                        key={i}
                        href={place.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 flex flex-col justify-between text-xs text-cyan-300 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {place.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                        </div>
                        {place.reviewSnippet && (
                          <p className="text-[11px] text-slate-400 italic">"{place.reviewSnippet}"</p>
                        )}
                        <span className="text-[10px] text-slate-500 mt-2 font-mono">View on Google Maps →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Clinical Copilot */}
      {activeTab === 'copilot' && (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Clinical Readmission Advisory Copilot</h3>
            <p className="text-xs text-slate-400">
              Interactive clinical AI synthesis powered by gemini-3.8-flash for cohort intervention strategies.
            </p>
          </div>

          <div className="flex gap-3">
            <textarea
              rows={3}
              value={copilotQuestion}
              onChange={(e) => setCopilotQuestion(e.target.value)}
              placeholder="Ask for care transition protocols, medication reconciliation workflows, or cohort analysis..."
              className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl p-3 outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleRunCopilot}
              disabled={copilotLoading || !copilotQuestion.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xs hover:from-purple-400 hover:to-indigo-500 disabled:opacity-40 shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0 self-end"
            >
              {copilotLoading ? 'Analyzing...' : 'Generate Guidance'}
            </button>
          </div>

          {copilotResponse && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 text-xs leading-relaxed text-slate-200 whitespace-pre-line animate-in fade-in">
              {copilotResponse}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
