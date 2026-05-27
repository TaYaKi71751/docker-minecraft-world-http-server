import { createApp } from './app.js';

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

const app = createApp();

app.listen(port, () => {
  console.log(`[minecraft-world-downloader] Backend running on http://localhost:${port}`);
});
