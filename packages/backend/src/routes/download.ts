import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { Router } from 'express';

export const downloadRouter = Router();

const worldDir = path.resolve(process.env.WORLD_DIR || '/world');

downloadRouter.get('/download', async (_req, res, next) => {
  try {
    const stat = await fsp.stat(worldDir).catch(() => null);
    if (!stat || !stat.isDirectory()) {
      res.status(404).type('text/plain').send(`World directory does not exist: ${worldDir}\n`);
      return;
    }

    const entries = await fsp.readdir(worldDir);
    if (entries.length === 0) {
      res.status(409).type('text/plain').send(`World directory is empty: ${worldDir}\n`);
      return;
    }

    const tmpZip = execSync('mktemp').toString().trim() + '.zip';

    try {
      await execFile('zip', ['-r', '-q', tmpZip, '.'], { cwd: worldDir });
      const zipStat = await fsp.stat(tmpZip);

      res.writeHead(200, {
        'Content-Type': 'application/zip',
        'Content-Length': zipStat.size,
        'Content-Disposition': `attachment; filename="${downloadName()}"`,
        'Cache-Control': 'no-store',
      });

      await streamFile(tmpZip, res);
    } finally {
      await fsp.rm(tmpZip, { force: true });
    }
  } catch (error) {
    next(error);
  }
});

function execFile(command: string, args: string[], options: { cwd?: string } = {}) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(`${command} exited with code ${code}: ${stderr || stdout}`));
    });
  });
}

function streamFile(file: string, res: NodeJS.WritableStream) {
  return new Promise<void>((resolve, reject) => {
    const stream = fs.createReadStream(file);
    stream.on('error', reject);
    res.on('error', reject);
    res.on('finish', resolve);
    stream.pipe(res);
  });
}

function downloadName() {
  const name = process.env.DOWNLOAD_NAME || 'minecraft-world.zip';
  const cleaned = path
    .basename(name)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  const safeName = cleaned || 'minecraft-world';
  return safeName.endsWith('.zip') ? safeName : `${safeName}.zip`;
}
