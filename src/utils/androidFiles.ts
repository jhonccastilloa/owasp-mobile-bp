import { searchFile } from '@/utils/tool';
import path from 'path';

const getJavaComPath = (currentPath: string) =>
  path.join(currentPath, 'android', 'app', 'src', 'main', 'java', 'com');

export const getMainActivityJava = async (currentPath: string) => {
  const javaComPath = getJavaComPath(currentPath);
  const mainActivityNames = ['MainActivity.java', 'MainActivity.kt'];
  for (const mainActivityName of mainActivityNames) {
    const [mainActivityFile, mainActivityPath] = await searchFile(
      javaComPath,
      mainActivityName
    );
    if (mainActivityFile) {
      return { mainActivityFile, mainActivityPath, mainActivityName };
    }
  }
  return {
    mainActivityFile: null,
    mainActivityPath: null,
    mainActivityName: null,
  };
};
export const getMainApplication = async (
  currentPath: string
): Promise<{
  mainApplicationFile: string | null;
  mainApplicationPath: string | null;
  mainApplicationName: string | null;
  // Backward-compatible alias; prefer mainApplicationName.
  mainAplicationName: string | null;
}> => {
  const mainApplicationNames = ['MainApplication.java', 'MainApplication.kt'];
  const javaComPath = getJavaComPath(currentPath);
  for (const mainApplicationName of mainApplicationNames) {
    const [mainApplicationFile, mainApplicationPath] = await searchFile(
      javaComPath,
      mainApplicationName
    );
    if (mainApplicationFile) {
      return {
        mainApplicationFile,
        mainApplicationPath,
        mainApplicationName,
        mainAplicationName: mainApplicationName,
      };
    }
  }

  return {
    mainApplicationFile: null,
    mainApplicationPath: null,
    mainApplicationName: null,
    mainAplicationName: null,
  };
};
