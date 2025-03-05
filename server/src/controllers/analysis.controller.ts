import { Request, Response, NextFunction } from 'express';
import { GoogleService } from '../services/google.service';
import { LLMService } from '../services/llm.service';
import { validateUrl, sanitizeInput } from '../utils/validation';

export class AnalysisController {
  static async analyzeWebsite(req: Request, res: Response, next:NextFunction) {
    try {
        // Check if URL exists in request body
        console.log('Req : ',req.body.url);
        if (!req.body?.url) {
        return res.status(400).json({ error: 'URL parameter is required' });
        }

        const rawUrl = req.body.url;
        
        // Check if URL is valid type
        if (typeof rawUrl !== 'string') {
        return res.status(400).json({ error: 'URL must be a string' });
        }

        // Sanitize and validate
        const sanitizedUrl = sanitizeInput(rawUrl);
        
        if (!validateUrl(sanitizedUrl)) {
        return res.status(400).json({ 
            error: 'Invalid URL format',
            example: 'https://example.com' 
        });
        }

         console.log('URL : ',sanitizedUrl);   
        // Step 1: Get search results
        const searchResults = await GoogleService.searchCompetitors(sanitizedUrl);
        console.log('Google Search : ',searchResults)
        // Step 2: Analyze with LLM
        const competitors = await LLMService.analyzeCompetitors(
            sanitizedUrl,
            searchResults
        );

        // Step 3: Add random traffic data
        const resultsWithTraffic = competitors.map(competitor => ({
            ...competitor,
            organicTraffic: this.generateRandomTraffic(),
            similarityScore: Math.random().toFixed(2)
        }));

        res.json({
            originalUrl: sanitizedUrl,
            competitors: resultsWithTraffic
        });

    } catch (error) {
      console.error('Analysis error:', error);
      res.status(500).json({ 
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private static generateRandomTraffic(): number {
    return Math.floor(Math.random() * 100000) + 1000;
  }
}