import { Router } from 'express';
import { AnalysisController } from './controllers/analysis.controller';

const router = Router();

router.post('/api/analyze', (req, res, next) => {
  AnalysisController.analyzeWebsite(req, res, next)
    .catch(next);
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;