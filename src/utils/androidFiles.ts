import { searchFile } from '@/utils/tool';
import path from 'path';

const getJavaComPath = (currentPath: string) =>
  path.join(currentPath, 'android', 'app', 'src', 'main', 'java', 'com');

export const getMainActivityJava = async (currentPath: string) => {
  const javaComPath = getJavaComPath(currentPath);
  const [mainActivityFile, mainActivityPath] = await searchFile(
    javaComPath,
    'MainActivity.java'
  );

  return { mainActivityFile, mainActivityPath };
};
export const getMainApplicationJava = async (currentPath: string) => {
  const javaComPath = getJavaComPath(currentPath);
  const [mainApplicationFile, mainApplicationPath] = await searchFile(
    javaComPath,
    'MainApplication.java'
  );
  return { mainApplicationFile, mainApplicationPath };
};
