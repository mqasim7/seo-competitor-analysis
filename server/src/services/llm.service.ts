import axios from 'axios';
import { config } from '../config/env';

interface Competitor {
  url: string;
  name: string;
  description: string;
}

interface LLMResponse {
  competitors?: Competitor[];
}

export class LLMService {
  private static cleanJsonResponse(rawData: string): string {
    return rawData
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
  }

  private static safeJsonParse<T>(data: string): T {
    try {
      return JSON.parse(data);
    } catch (error:any) {
      // Attempt to find JSON structure in malformed response
      const jsonMatch = data.match(/(\{.*\}|\[.*\])/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (innerError:any) {
          throw new Error(`JSON parse failed: ${innerError.message}`);
        }
      }
      throw new Error('No valid JSON found in response : ' + error);
    }
  }

  private static parseCompetitorsResponse(data: string): Competitor[] {
    try {
      const cleanedData = this.cleanJsonResponse(data);
      
      // First attempt to parse
      let parsed: LLMResponse | Competitor[];
      try {
        parsed = this.safeJsonParse<LLMResponse | Competitor[]>(cleanedData);
      } catch (parseError) {
        // Attempt to fix common issues
        const fixedData = cleanedData
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"')
          .replace(/(\w)\s*:\s*(?=\w)/g, '$1: ')
          .replace(/,(\s*[}\]])/g, '$1');

        parsed = this.safeJsonParse<LLMResponse | Competitor[]>(fixedData);
      }

      // Handle different response formats
      const competitors = Array.isArray(parsed) 
        ? parsed 
        : parsed.competitors || [];

      // Validate and transform results
      return competitors.slice(0, 10).map(competitor => {
        if (!competitor?.url) {
          throw new Error('Invalid competitor format - missing URL');
        }

        return {
          url: this.validateUrl(competitor.url),
          name: competitor.name || this.generateNameFromUrl(competitor.url),
          description: competitor.description || this.generateDescription(competitor.name)
        };
      });

    } catch (error: any) {
      console.error('JSON Parsing Error:', {
        rawData: data,
        cleanedData: this.cleanJsonResponse(data),
        error: error.message
      });
      throw new Error(`Failed to parse LLM response: ${error.message}`);
    }
  }

  private static generateDescription(name: string): string {
    const defaultDescriptions = [
      `Leading competitor in the same market as ${name}`,
      `Direct market rival offering similar products`,
      `Main competitor in the ${name} industry`
    ];
    return defaultDescriptions[Math.floor(Math.random() * defaultDescriptions.length)];
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
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const prompt = `
          Analyze these search results and extract 10 direct product competitors of ${targetUrl}.
          Return a JSON object with a "competitors" array containing objects with:
          - "url": Valid website URL (string)
          - "name": Company name (string)
          - "description": Short business description (40-60 characters)

          STRICT RULES:
          1. Response must be valid JSON
          2. Use double quotes only
          3. No markdown formatting
          4. No trailing commas
          5. Include exactly 10 items

          Example response:
          {"competitors":[{...}]}
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
            temperature: 0.1, // Lower temperature for more consistent results
            max_tokens: 2000,  // Increased token limit
            top_p: 0.9
          },
          {
            headers: {
              'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 40000
          }
        );

        if (response.status !== 200) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const content = response.data.choices[0].message.content;
        if (!content) throw new Error('Empty response from LLM');

        return this.parseCompetitorsResponse(content);

      } catch (error: any) {
        attempt++;
        console.error(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt >= maxRetries) {
          console.error('LLM Analysis Failed:', {
            error: error.response?.data || error.message,
            stack: error.stack,
            searchResultsCount: searchResults.length,
            targetUrl
          });
          throw new Error(`Competitor analysis failed: ${error.message}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}