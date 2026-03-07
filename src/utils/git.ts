import { execFile } from 'child_process';

export const getCurrentGitBranch = async (
  currentPath: string
): Promise<string> => {
  return new Promise(resolve => {
    execFile(
      'git',
      ['rev-parse', '--abbrev-ref', 'HEAD'],
      { cwd: currentPath, encoding: 'utf8' },
      (error, stdout) => {
        if (error) {
          resolve('unknown');
          return;
        }

        const branch = stdout.trim();
        resolve(branch || 'unknown');
      }
    );
  });
};
