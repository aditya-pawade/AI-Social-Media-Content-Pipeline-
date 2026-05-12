import { fileURLToPath } from 'url';
import path from 'path';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

build({
  entryPoints: ['server.ts'],
  outfile: 'dist/server.cjs',
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  external: ['vite', 'express', 'firebase-admin'],
}).catch(() => process.exit(1));
