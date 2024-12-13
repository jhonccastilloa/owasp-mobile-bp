import path from 'path';
import fs from 'fs';
import { BUILD_GRADLE_DATA } from './data/buildGradleData';
import verifyPermissions from './verifyPermissions';
import { PermissionData } from './types/global';

const verifyBuildGradle = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const nameFile = 'build.gradle';
  const buildGradleGlobal = path.join(currentPath, 'android', 'build.gradle');
  let readData = await fs.promises.readFile(buildGradleGlobal, 'utf-8');

  return verifyPermissions({
    strData: readData,
    regexFn: mainKey => new RegExp(`${mainKey}\\s*=\\s*(\\d+)`),
    permissions: BUILD_GRADLE_DATA,
    nameFile,
  });
};

export default verifyBuildGradle;
