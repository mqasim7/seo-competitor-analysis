import axios from 'axios';
import { config } from '../config/env';

export interface SerperResponse {
  text: string;
  metadata: any;
}
export class GoogleService {
  static async searchCompetitors(url: string): Promise<SerperResponse> {
    try {
      const response = await axios.post('https://scrape.serper.dev', { url: url }, {
        headers: {
          'X-API-KEY': config.SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      return {
        text: response.data.text,
        metadata: response.data.metadata
      };

    } catch (error) {
      console.error('Google search failed:', error);
      throw new Error('Failed to fetch search results ' + error);
    }
  }
}