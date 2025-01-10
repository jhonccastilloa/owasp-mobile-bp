import { Plugin } from 'esbuild';
import fs from 'fs-extra';

export const copyPlugin = (sourceDir: string, destDir: string): Plugin => {
  return {
    name: 'copy-assets',
    setup(build) {
      build.onEnd(() => {
        fs.copy(sourceDir, destDir)
          .then(() => {
            console.log('Archivos copiados correctamente');
          })
          .catch(err => {
            console.error('Error al copiar los archivos', err);
          });
      });
    },
  };
};
