import fs from 'fs';
import path from 'path';
import { REQUIRED_PERMISSIONS } from './data';
import { cleanComentaries } from './utils/tool';
import { PermissionData } from './types/global';
import verifyPermissions from './verifyPermissions';

const checkPermissionsGeneral = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const nameFile = 'AndroidManifest.xml';
  const androidManifestFilePath = path.join(
    currentPath,
    'android',
    'app',
    'src',
    'main',
    nameFile
  );
  let readData = await fs.promises.readFile(androidManifestFilePath, 'utf-8');
  readData = cleanComentaries(readData);
  return verifyPermissions({
    strData: readData,
    regexFn: mainKey => new RegExp(`${mainKey}\\s*=\\s*"([^b]*)"`),
    permissions: REQUIRED_PERMISSIONS,
    nameFile,
  });
};

export default checkPermissionsGeneral;
