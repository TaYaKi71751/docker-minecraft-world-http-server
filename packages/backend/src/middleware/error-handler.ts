import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('[minecraft-world-downloader] Request failed:', error);

  if (res.headersSent) {
    res.end();
    return;
  }

  res.status(500).type('text/plain').send('Server error\n');
};
