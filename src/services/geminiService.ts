import { GroundingResource } from '../types';

export interface ClinicalAnalysisResult {
  analysis: string;
  modelUsed: string;
}

export interface SearchGuidanceResult {
  text: string;
  sources: GroundingResource[];
  query: string;
}

export interface MapsGroundingPlace {
  uri: string;
  title: string;
  reviewSnippet?: string;
}

export interface MapsGroundingResult {
  text: string;
  places: MapsGroundingPlace[];
  center: { lat: number; lng: number };
}

export async function requestClinicalAnalysis(
  encounterData: Record<string, any>,
  modelMetrics?: Record<string, any>,
  promptQuestion?: string
): Promise<ClinicalAnalysisResult> {
  const response = await fetch('/api/gemini/analyze-readmission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encounterData, modelMetrics, promptQuestion }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || 'Failed to obtain AI clinical analysis');
  }

  return response.json();
}

export async function requestSearchGuidance(query: string): Promise<SearchGuidanceResult> {
  const response = await fetch('/api/gemini/search-guidance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || 'Failed to fetch search guidance');
  }

  return response.json();
}

export async function requestNearbyFacilities(
  latitude?: number,
  longitude?: number,
  facilityType?: string
): Promise<MapsGroundingResult> {
  const response = await fetch('/api/gemini/nearby-facilities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude, facilityType }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || 'Failed to query nearby facilities');
  }

  return response.json();
}

export async function requestFastMetricInsight(
  metricName: string,
  metricValue: string,
  baselineValue: string
): Promise<string> {
  try {
    const response = await fetch('/api/gemini/fast-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metricName, metricValue, baselineValue }),
    });

    if (!response.ok) return `${metricName} shows active variation against baseline.`;
    const data = await response.json();
    return data.insight || `${metricName} updated.`;
  } catch {
    return `${metricName} evaluated against historical encounters.`;
  }
}
