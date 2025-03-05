import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import router from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use(router);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(config.PORT, () => {
  console.log(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
});