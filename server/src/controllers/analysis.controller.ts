import { Request, Response, NextFunction } from 'express';
import { GoogleService } from '../services/google.service';
import { LLMService } from '../services/llm.service';
import { validateUrl, sanitizeInput } from '../utils/validation';

export class AnalysisController {
  static async analyzeWebsite(req: Request, res: Response, next:NextFunction) {
    try {

        //#region   for testing the UI 
//         res.json({
//     "originalUrl": "https://www.nike.com",
//     "competitors": [
//         {
//             "url": "https://www.adidas.com",
//             "name": "Adidas",
//             "description": "Global sportswear brand for athletic footwear and apparel.",
//             "organicTraffic": 20441,
//             "similarityScore": "0.52"
//         },
//         {
//             "url": "https://www.puma.com",
//             "name": "Puma",
//             "description": "Sportswear company producing footwear and athletic clothing.",
//             "organicTraffic": 45344,
//             "similarityScore": "0.74"
//         },
//         {
//             "url": "https://www.underarmour.com",
//             "name": "Under Armour",
//             "description": "Performance athletic apparel, footwear, and accessories.",
//             "organicTraffic": 60872,
//             "similarityScore": "0.23"
//         },
//         {
//             "url": "https://www.reebok.com",
//             "name": "Reebok",
//             "description": "Fitness-focused athletic footwear and apparel company.",
//             "organicTraffic": 40977,
//             "similarityScore": "0.66"
//         },
//         {
//             "url": "https://www.newbalance.com",
//             "name": "New Balance",
//             "description": "Athletic footwear and apparel with innovative tech.",
//             "organicTraffic": 83042,
//             "similarityScore": "0.76"
//         },
//         {
//             "url": "https://www.asics.com",
//             "name": "ASICS",
//             "description": "Japanese company producing professional athletic footwear.",
//             "organicTraffic": 68775,
//             "similarityScore": "0.19"
//         },
//         {
//             "url": "https://www.skechers.com",
//             "name": "Skechers",
//             "description": "Casual and performance footwear with modern designs.",
//             "organicTraffic": 60271,
//             "similarityScore": "0.12"
//         },
//         {
//             "url": "https://www.fila.com",
//             "name": "Fila",
//             "description": "Sportswear brand offering athletic shoes and casual apparel.",
//             "organicTraffic": 16527,
//             "similarityScore": "0.88"
//         },
//         {
//             "url": "https://www.vans.com",
//             "name": "Vans",
//             "description": "Iconic skateboarding shoes and youth lifestyle apparel.",
//             "organicTraffic": 71340,
//             "similarityScore": "0.07"
//         },
//         {
//             "url": "https://www.lululemon.com",
//             "name": "Lululemon",
//             "description": "Yoga-inspired athletic apparel and accessories brand.",
//             "organicTraffic": 88387,
//             "similarityScore": "0.94"
//         }
//     ]
// });

        // // Check if URL exists in request body
        //#endregion

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