import { copyPlugin } from './esbuild.plugins';
import esbuild from 'esbuild';

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    outfile: 'dist/index.js',
    banner: {
      js: '#!/usr/bin/env node',
    },
    minify: true,
    // plugins: [copyPlugin('src/assets', 'dist/assets')],
  })
  .catch(() => process.exit(1));
