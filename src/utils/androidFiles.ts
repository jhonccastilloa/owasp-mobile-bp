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
export const getMainApplication = async (
  currentPath: string
): Promise<{
  mainApplicationFile: string | null;
  mainApplicationPath: string | null;
  mainAplicationName: string | null;
}> => {
  const mainAplicationNames = ['MainApplication.java', 'MainApplication.kt'];
  const javaComPath = getJavaComPath(currentPath);
  for (let mainAplicationName of mainAplicationNames) {
    const [mainApplicationFile, mainApplicationPath] = await searchFile(
      javaComPath,
      mainAplicationName
    );
    if (mainApplicationFile)
      return { mainApplicationFile, mainApplicationPath, mainAplicationName };
  }

  return {
    mainApplicationFile: null,
    mainApplicationPath: null,
    mainAplicationName: null,
  };
};
