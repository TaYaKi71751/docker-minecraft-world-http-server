import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { downloadRouter } from './routes/download.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.type('text/plain').send('ok\n');
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/', downloadRouter);

  const frontendDist = process.env.FRONTEND_DIST;
  if (frontendDist) {
    const distPath = path.resolve(frontendDist);
    app.use(express.static(distPath));

    app.get('{*path}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });

    console.log(`[minecraft-world-downloader] Serving frontend from ${distPath}`);
  }

  app.use(errorHandler);

  return app;
}
