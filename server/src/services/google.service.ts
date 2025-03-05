import axios from 'axios';
import { config } from '../config/env';

export class GoogleService {
  static async searchCompetitors(url: string): Promise<string[]> {
    try {
      const response = await axios.post('https://google.serper.dev/search', {
        q: `top competitors of ${url}`,
        gl: 'us',
        hl: 'en',
        num: 20
      }, {
        headers: {
          'X-API-KEY': config.SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      return response.data.organic
        .map((result: any) => result.link)
        .filter((link: string) => link !== url);

    } catch (error) {
      console.error('Google search failed:', error);
      throw new Error('Failed to fetch search results');
    }
  }
}