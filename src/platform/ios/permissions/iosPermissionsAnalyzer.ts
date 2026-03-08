import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import {
  formatInfoPlistResolutionError,
  resolveProductionInfoPlist,
} from '../utils/iosFiles';
import { getPackageDependencyNames } from '@/utils/packageJson';
import { IOS_LEGACY_PERMISSION_RULES, IOS_PERMISSION_RULES } from '@/rules';
import path from 'path';

const hasInfoPlistKey = (content: string, key: string) =>
  new RegExp(`<key>${key}</key>`).test(content);

const iosPermissionsAnalyze = async (currentPath: string): Promise<PermissionData[]> => {
  const [infoPlist, dependencyNames] = await Promise.all([
    resolveProductionInfoPlist(currentPath),
    getPackageDependencyNames(currentPath),
  ]);
  if (!infoPlist.ok) {
    return [
      {
        numLine: null,
        status: PermissionStatus.ERROR,
        permission: 'iOS Info.plist Permissions',
        severity: 'E',
        message: formatInfoPlistResolutionError(infoPlist),
        owaspCategory: 'M1',
        nameFile: 'Info.plist',
      },
    ];
  }
  const dependencySet = new Set(dependencyNames);
  const findings: PermissionData[] = [];
  for (const [permissionKey, permissionRule] of Object.entries(IOS_PERMISSION_RULES)) {
    const required = permissionRule.requiredDependencies.some(dep =>
      dependencySet.has(dep)
    );
    const exists = hasInfoPlistKey(infoPlist.content, permissionKey);
    if (!required && !exists) continue;

    let status = PermissionStatus.OK;
    let message = permissionRule.message;
    if (required && !exists) {
      status = PermissionStatus.ERROR;
    } else if (!required && exists) {
      status = PermissionStatus.ERROR;
      message =
        `${permissionRule.message} Key declarada sin dependencias asociadas en package.json.`;
    }

    findings.push({
      numLine: null,
      status,
      permission: permissionKey,
      severity: 'E',
      message,
      owaspCategory: permissionRule.owaspCategory,
      nameFile: path.basename(infoPlist.filePath),
    });
  }

  for (const [legacyPermissionKey, legacyRule] of Object.entries(
    IOS_LEGACY_PERMISSION_RULES
  )) {
    const required = legacyRule.requiredDependencies.some(dep =>
      dependencySet.has(dep)
    );
    if (!required) continue;
    const exists = hasInfoPlistKey(infoPlist.content, legacyPermissionKey);
    if (!exists) continue;

    findings.push({
      numLine: null,
      status: PermissionStatus.ERROR,
      permission: legacyPermissionKey,
      severity: legacyRule.severity,
      message: legacyRule.message,
      owaspCategory: legacyRule.owaspCategory,
      nameFile: path.basename(infoPlist.filePath),
    });
  }
  return findings;
};

export default iosPermissionsAnalyze;
