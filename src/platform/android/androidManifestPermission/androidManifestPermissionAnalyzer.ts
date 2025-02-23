import fs from 'fs';
import path from 'path';
import { PermissionData } from '@/types/global';
import {
  cleanXmlComentaries,
  linesUpToMatch,
  validateSeverity,
} from '@/utils/tool';
import { PermissionStatus } from '@/types/enums';
import { ANDROID_PERMISSION_RULES } from '@/rules';
import { AMUserPermision } from './types';
import { getPackageDependencyNames } from '@/utils/packageJson';

const getManifestPermissions = async (
  androidManifestFilePath: string
): Promise<AMUserPermision[]> => {
  const readData = await fs.promises.readFile(androidManifestFilePath, 'utf-8');
  const { newData: data } = cleanXmlComentaries(readData);
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

const androidManifestPermissionAnalyze = async (
  currentPath: string
): Promise<PermissionData[]> => {
  try {
    const packageDependencyNamesSet = new Set(
      await getPackageDependencyNames(currentPath)
    );
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
        ANDROID_PERMISSION_RULES[manifestPermission.permission];
      if (requiredPermission) {
        const hasRequiredDependency =
          requiredPermission.requiredDependencies.some(dep =>
            packageDependencyNamesSet.has(dep)
          );
        const isDuplicated = !!owaspPermission.find(
          item => item.permission === manifestPermission.permission
        );
        const data: PermissionData = {
          permission: manifestPermission.permission,
          numLine: manifestPermission.numLine,
          owaspCategory: requiredPermission.owaspCategory,
          severity: requiredPermission.severity,
          message: requiredPermission.message,
          status: isDuplicated
            ? PermissionStatus.DUPLICATE
            : validateSeverity(
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
export default androidManifestPermissionAnalyze;
