import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.cjs',
  banner: {
    js: '#!/usr/bin/env node\n',
  },
  minify: false,
  external: [
    'chalk',
    'commander',
    'open',
    'ora',
  ],
  format: 'cjs',
}).catch(() => process.exit(1));
