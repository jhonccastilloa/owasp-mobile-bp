import path from 'path';
import fs from 'fs';
import { cleanBlockAndLineComment } from '@/utils/tool';

export const buildGradleName = 'build.gradle';

export const getBuildGradlePath = (currentPath: string) =>
  path.join(currentPath, 'android', buildGradleName);

export const getBuildGradleFile = async (currentPath: string) => {
  const buildGradleFilePath = getBuildGradlePath(currentPath);
  const buildGradle = await fs.promises.readFile(buildGradleFilePath, 'utf-8');
  const { comments, newData } = cleanBlockAndLineComment(buildGradle);
  return {
    buildGradle,
    buildGradleNoComment: newData,
    comments,
  };
};

export const buildGradleRegex = (mainKey: string) =>
  new RegExp(`${mainKey}\\s*=\\s*(?:"(\\d+\\.\\d+\\.\\d+)"|(\\d+))`, 'g');
