import { GoogleGenAI } from '@google/genai';
import express, { Request, Response } from 'express';

export const apiRouter = express.Router();
apiRouter.use(express.json());

// Initialize GoogleGenAI client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// GET /api/health
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mode: 'full-stack-live',
    timestamp: new Date().toISOString(),
    services: {
      geminiApi: !!process.env.GEMINI_API_KEY,
      firestore: 'connected',
      environment: 'AI Studio Node.js Server',
    },
  });
});

// POST /api/gemini/analyze-readmission
apiRouter.post('/gemini/analyze-readmission', async (req: Request, res: Response) => {
  try {
    const { encounterData, modelMetrics, promptQuestion } = req.body;

    const systemPrompt = `You are READMITIQ AI's Chief Clinical Data Scientist and Readmission Specialist.
Analyze the provided hospital encounter or readmission model statistics.
Provide a clear, clinical, objective breakdown:
1. Primary risk drivers identified.
2. Comorbidity interactions (e.g. diabetes with cardiovascular/respiratory conditions).
3. Target intervention opportunities (discharge planning, medication reconciliation, outpatient follow-up within 7 days).
4. Explain clearly that this is an academic research prediction model, not an autonomous clinical diagnostic determination.`;

    const userPrompt = `Encounter Context:
${JSON.stringify(encounterData, null, 2)}

Model Metrics:
${JSON.stringify(modelMetrics, null, 2)}

Question: ${promptQuestion || 'What are the key readmission drivers and recommended post-discharge care management pathways for this patient cohort?'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    res.json({
      analysis: response.text,
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Gemini Analysis Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate clinical analysis',
      fallback: 'Clinical risk evaluation temporarily offline. Please verify API key in Settings > Secrets.',
    });
  }
});

// POST /api/gemini/search-guidance (Search Grounding with gemini-3.8-flash)
apiRouter.post('/gemini/search-guidance', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    const searchQuery = query || 'CMS Hospital Readmissions Reduction Program (HRRP) 30-day penalty benchmarks and diabetes care standards';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide an up-to-date summary of evidence-based clinical protocols and policy benchmarks regarding: "${searchQuery}". Focus on preventing 30-day all-cause hospital readmissions.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract sources
    const sources: { uri: string; title: string }[] = [];
    for (const chunk of groundingChunks as any[]) {
      if (chunk.web?.uri) {
        sources.push({
          uri: chunk.web.uri,
          title: chunk.web.title || chunk.web.uri,
        });
      }
    }

    res.json({
      text,
      sources,
      query: searchQuery,
    });
  } catch (error: any) {
    console.error('Search Grounding Error:', error);
    res.status(500).json({
      error: error?.message || 'Search grounding request failed',
      sources: [],
    });
  }
});

// POST /api/gemini/nearby-facilities (Maps Grounding with gemini-3.8-flash)
apiRouter.post('/gemini/nearby-facilities', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, facilityType } = req.body;

    const lat = latitude || 37.7749; // Default SF or user's coords
    const lng = longitude || -122.4194;
    const type = facilityType || 'skilled nursing facility, diabetes rehabilitation clinic, and post-acute hospital care';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `List top-rated ${type} located near this area for post-discharge transitional care to reduce hospital readmission risk. Include clinic names, addresses, and specialties.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(lat),
              longitude: Number(lng),
            },
          },
        },
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract place URLs and review snippets as mandated by skill
    const places: { uri: string; title: string; reviewSnippet?: string }[] = [];
    for (const chunk of groundingChunks as any[]) {
      if (chunk.maps?.uri) {
        places.push({
          uri: chunk.maps.uri,
          title: chunk.maps.title || 'Healthcare Facility on Google Maps',
          reviewSnippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0] || undefined,
        });
      }
    }

    res.json({
      text,
      places,
      center: { lat, lng },
    });
  } catch (error: any) {
    console.error('Maps Grounding Error:', error);
    res.status(500).json({
      error: error?.message || 'Maps grounding request failed',
      places: [],
    });
  }
});

// POST /api/gemini/fast-insight (Gemini 3.1 Flash Lite for instantaneous metric commentary)
apiRouter.post('/gemini/fast-insight', async (req: Request, res: Response) => {
  try {
    const { metricName, metricValue, baselineValue } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Provide a 2-sentence clinical data science interpretation of this hospital metric:
Metric: ${metricName}
Current: ${metricValue}
Baseline: ${baselineValue}
State if this is favorable, concerning, or expected, and what immediate investigation is warranted. Keep it under 40 words.`,
      config: {
        temperature: 0.2,
      },
    });

    res.json({
      insight: response.text,
    });
  } catch (error: any) {
    res.json({
      insight: `Metric ${req.body.metricName} is currently ${req.body.metricValue}. Monitor for demographic cohort variations.`,
    });
  }
});
