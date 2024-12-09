import fs from 'fs';
import path from 'path';
import { REQUIRED_PERMISSIONS_BY_USER } from './data';
import { PermissionData } from './types/global';
import {
  cleanComentaries,
  linesUpToMatch,
  validateSeverity,
} from './utils/tool';

interface AMUserPermision {
  permission: string;
  numLine: number;
}

const getDependencies = async (packageFilePath: string): Promise<string[]> => {
  const data = await fs.promises.readFile(packageFilePath, 'utf-8');
  const jsonData = JSON.parse(data);
  return Object.keys(jsonData.dependencies || {});
};

const getManifestPermissions = async (
  androidManifestFilePath: string
): Promise<AMUserPermision[]> => {
  const readData = await fs.promises.readFile(androidManifestFilePath, 'utf-8');
  const data = cleanComentaries(readData);
  const regex = /<uses-permission\s+android:name\s*?=\s*?"([^"]+)"/g;
  let match: RegExpExecArray | null;
  const permissions: AMUserPermision[] = [];
  while ((match = regex.exec(data)) !== null) {
    const matchPosition = match.index;
    const numLine = linesUpToMatch(data, matchPosition);
    permissions.push({
      permission: match[1].replace('android.permission.', ''),
      numLine,
    });
  }
  return permissions;
};

const verifyUserPermissions = async (
  currentPath: string
): Promise<PermissionData[]> => {
  try {
    const packageFilePath = path.join(currentPath, 'package.json');
    const dependencies = new Set(await getDependencies(packageFilePath));
    const manifestPath = path.join(
      currentPath,
      'android',
      'app',
      'src',
      'main',
      'AndroidManifest.xml'
    );
    const manifestPermissions = await getManifestPermissions(manifestPath);

    const owaspPermission = [];

    for (const manifestPermission of manifestPermissions) {
      const requiredPermission =
        REQUIRED_PERMISSIONS_BY_USER[manifestPermission.permission];
      if (requiredPermission) {
        const hasRequiredDependency =
          requiredPermission.requiredDependencies.some(dep =>
            dependencies.has(dep)
          );
        const data: PermissionData = {
          permission: manifestPermission.permission,
          numLine: manifestPermission.numLine,
          owaspCategory: requiredPermission.owaspCategory,
          severity: requiredPermission.severity,
          message: requiredPermission.message,
          status: validateSeverity(
            requiredPermission.severity,
            hasRequiredDependency
          ),
          nameFile: 'AndroidManifext.xml',
        };
        owaspPermission.push(data);
      }
    }

    return owaspPermission;
  } catch (error) {
    return [];
  }
};
export default verifyUserPermissions;

// const test = () => {
//   verifyUserPermissions('./example')
// }
// test()
