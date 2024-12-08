import fs from 'fs';
import path from 'path';
import { REQUIRED_PERMISSIONS } from './data';
import { linesUpToMatch } from './utils/tool';
import { PermissionData } from './types/global';
import { PermissionStatus } from './types/enums';

const checkPermissionsGeneral = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const androidManifestFilePath = path.join(
    currentPath,
    'android',
    'app',
    'src',
    'main',
    'AndroidManifest.xml'
  );

  const readData = await fs.promises.readFile(androidManifestFilePath, 'utf-8');

  const owaspPermission = [];

  for (const [mainKey, data] of Object.entries(REQUIRED_PERMISSIONS)) {
    const regex = new RegExp(`${mainKey}\\s*=\\s*"([^b]*)"`);
    const matchData = regex.exec(readData);

    const permission: PermissionData = {
      permission: mainKey,
      owaspCategory: data.owaspCategory,
      severity: data.severity,
      message: data.message,
      numLine: null,
      status: PermissionStatus.NOT_FOUND,
      nameFile: 'AndroidManifext.xml',
    };

    if (!matchData) {
      permission.status = PermissionStatus.NOT_FOUND;
    } else {
      const numLine = linesUpToMatch(readData, matchData.index);
      permission.numLine = numLine;
      permission.status = data.values.includes(matchData[1])
        ? PermissionStatus.OK
        : PermissionStatus.ERROR;
    }
    owaspPermission.push(permission);
  }

  return owaspPermission;
};

export default checkPermissionsGeneral;
