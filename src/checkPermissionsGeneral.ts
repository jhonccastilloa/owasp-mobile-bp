import fs from 'fs';
import path from 'path';
import { REQUIRED_PERMISSIONS } from './data';
import { cleanXmlComentaries } from './utils/tool';
import { PermissionData } from './types/global';
import verifyPermissions from './verifyPermissions';

const nameFile = 'AndroidManifest.xml';

const getAndroidManifestPath = (currentPath: string) =>
  path.join(currentPath, 'android', 'app', 'src', 'main', nameFile);

const getAndroidManifestFile = async (currentPath: string) => {
  const androidManifestFilePath = getAndroidManifestPath(currentPath);
  const androidManifest = await fs.promises.readFile(
    androidManifestFilePath,
    'utf-8'
  );

  return cleanXmlComentaries(androidManifest).newData;
};

const createPermissionRegex = (mainKey: string) =>
  new RegExp(`${mainKey}\\s*=\\s*"([^"]+)"`, 'g');

const checkPermissionsGeneral = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const readAndroidManifest = await getAndroidManifestFile(currentPath);
  return verifyPermissions({
    strData: readAndroidManifest,
    regexFn: createPermissionRegex,
    permissions: REQUIRED_PERMISSIONS,
    nameFile,
  });
};

export const repairPermissions = async (currentPath: string) => {
  let readAndroidManifest = await getAndroidManifestFile(currentPath);
  Object.entries(REQUIRED_PERMISSIONS).forEach(([key, data]) => {
    const regex = createPermissionRegex(key);
    const value = data.values[0];
    if (regex.test(readAndroidManifest)) {
      readAndroidManifest = readAndroidManifest.replace(
        regex,
        `${key}="${value}"`
      );
    } else {
      readAndroidManifest = readAndroidManifest.replace(
        /<application/,
        `<application ${key}="${value}" `
      );
    }
  });
  fs.writeFileSync(
    getAndroidManifestPath(currentPath),
    readAndroidManifest,
    'utf8'
  );
};

export default checkPermissionsGeneral;
