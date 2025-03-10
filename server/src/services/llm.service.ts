import axios from 'axios';
import { config } from '../config/env';
import { SerperResponse } from './google.service';

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
    searchResults: SerperResponse
  ): Promise<Competitor[]> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const prompt = `
          Analyze this website content to identify direct competitors:

          Company: ${searchResults.metadata.title || targetUrl}
          Description: ${searchResults.metadata.description || 'No description available'}
          
          Website Content Excerpt:
          ${searchResults.text.substring(0, 3000)} [truncated].

          DEFINITION OF COMPETITOR:
          A direct competitor offers similar products/services, targets similar customers, 
          and competes for market share in the same industry.

          Return a JSON object with a "competitors" array containing objects with:
          - "url": Valid website URL (string)
          - "name": Company name (string)
          - "description": Short business description (40-60 characters)

          STRICT RULES:
          1. URLs must be active websites
          2. No placeholder/example data
          3. Focus on actual competitors
          4. Response must be valid JSON
          5. Use double quotes only
          6. No markdown formatting
          7. No trailing commas
          8. Include exactly 10 items

          Example response:
          {"competitors":[{...}]}
        `;

        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-4o:online',
            messages: [{
              role: 'user',
              content: `${prompt}`
            }],
            response_format: { type: 'json_object' },
            temperature: 0.1, // Lower temperature for more consistent results
            max_tokens: 4000,  // Increased token limit
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