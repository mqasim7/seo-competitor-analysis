import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Proxy to backend via Next.js
});

export interface Competitor {
  url: string;
  name: string;
  description: string;
  organicTraffic: number;
  similarityScore: string;
}

export interface AnalysisResponse {
  originalUrl: string;
  competitors: Competitor[];
}

export const analyzeWebsite = async (url: string) => {
   const response = await api.post<AnalysisResponse>('/analyze', { url });
   return response.data;
};