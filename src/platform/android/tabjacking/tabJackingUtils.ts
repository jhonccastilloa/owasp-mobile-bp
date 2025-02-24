import { searchFile } from '@/utils/tool';
import path from 'path';

export const getMainActivity = async (currentPath: string) => {
  const javaComPath = path.join(
    currentPath,
    'android',
    'app',
    'src',
    'main',
    'java',
    'com'
  );

  const [mainActivityFile, mainActivityPath] = await searchFile(
    javaComPath,
    'MainActivity.java'
  );

  return { mainActivityFile, mainActivityPath };
};
