import axios from 'axios';
import { config } from '../config/env';

interface Competitor {
  url: string;
  name: string;
}

interface LLMResponse {
  competitors?: Competitor[];
}

export class LLMService {
  private static cleanJsonResponse(rawData: string): string {
    return rawData
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  private static parseCompetitorsResponse(data: string): Competitor[] {
    try {
      const cleanedData = this.cleanJsonResponse(data);
      const parsed: LLMResponse | Competitor[] = JSON.parse(cleanedData);

      // Handle both array and object responses
      const competitors = Array.isArray(parsed) 
        ? parsed 
        : parsed.competitors || [];

      if (!Array.isArray(competitors)) {
        throw new Error('Invalid competitors format');
      }

      return competitors.slice(0, 10).map(competitor => ({
        url: this.validateUrl(competitor.url),
        name: competitor.name || this.generateNameFromUrl(competitor.url)
      }));
    } catch (error:any) {
      console.error('JSON Parsing Error:', { rawData: data, error });
      throw new Error(`Failed to parse LLM response: ${error.message}`);
    }
  }

  private static validateUrl(url: string): string {
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error(`Invalid URL format: ${url}`);
    }
  }

  private static generateNameFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '').split('.')[0];
    } catch {
      return 'Unknown Competitor';
    }
  }

  static async analyzeCompetitors(
    targetUrl: string,
    searchResults: string[]
  ): Promise<Competitor[]> {
    try {
      const prompt = `
        Analyze these search results and extract 10 direct product competitors of ${targetUrl}.
        Return a JSON object with a "competitors" array containing objects with "url" and "name".
        Example valid responses:
        {"competitors": [{"url": "https://example.com", "name": "Example Inc"}]}
        or
        [{"url": "https://example.com", "name": "Example Inc"}]
        
        Rules:
        1. Only include valid website URLs
        2. Exclude social media and review sites
        3. Return pure JSON without markdown formatting
      `;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'perplexity/r1-1776',
          messages: [{
            role: 'user',
            content: `${prompt}\n\nSearch results:\n${searchResults.slice(0, 15).join('\n')}`
          }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.status !== 200) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      return this.parseCompetitorsResponse(response.data.choices[0].message.content);

    } catch (error: any) {
      console.error('LLM Analysis Failed:', {
        error: error.response?.data || error.message,
        stack: error.stack,
        searchResultsCount: searchResults.length,
        targetUrl
      });
      
      throw new Error(`Competitor analysis failed: ${
        error.response?.data?.error?.message || error.message
      }`);
    }
  }
}