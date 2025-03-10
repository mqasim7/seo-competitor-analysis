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
  
  private static cleanResponse(rawData: string): string {
    return rawData
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  private static parseCompetitorsResponse(data: string): Competitor[] {
    try {
      const cleaned = this.cleanResponse(data);
      const parsed = JSON.parse(cleaned);
      
      // Handle both array and object responses
      const competitors = Array.isArray(parsed) 
        ? parsed 
        : parsed.competitors || [];

      return competitors.map((comp:any) => ({
        url: this.validateUrl(comp.url),
        name: comp.name || new URL(comp.url).hostname.replace(/^www\./, ''),
        description: comp.description || `Competitor in the same market as ${comp.name}`
      }));

    } catch (error) {
      console.error('Failed to parse response:', error);
      throw new Error('Invalid response format from LLM');
    }
  }

  private static validateUrl(url: string): string {
    try {
      new URL(url);
      return url;
    } catch {
      throw new Error(`Invalid URL: ${url}`);
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
        console.log('Content : ', content);
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