import fs from 'fs';
import {
  formatInfoPlistResolutionError,
  resolveProductionInfoPlist,
} from '../utils/iosFiles';
import { logger } from '@/utils/logger';
import iosPermissionsAnalyze from './iosPermissionsAnalyzer';
import { PermissionStatus } from '@/types/enums';
import { IOS_LEGACY_PERMISSION_RULES, IOS_PERMISSION_RULES } from '@/rules';
import { getPackageDependencyNames } from '@/utils/packageJson';
import { hasInfoPlistKey } from './iosPermissionUtils';

const buildPermissionEntry = (key: string) =>
  `\n\t<key>${key}</key>\n\t<string>Required by application functionality.</string>`;

const removePermissionEntry = (content: string, key: string) =>
  content.replace(
    new RegExp(`<key>${key}</key>\\s*<string>[\\s\\S]*?<\\/string>\\s*`, 'g'),
    ''
  );

const iosPermissionsFix = async (currentPath: string) => {
  const [infoPlist, findings, dependencyNames] = await Promise.all([
    resolveProductionInfoPlist(currentPath),
    iosPermissionsAnalyze(currentPath),
    getPackageDependencyNames(currentPath),
  ]);
  if (!infoPlist.ok) {
    logger.warn(
      `Skipping iOS Info.plist permission fixer: ${formatInfoPlistResolutionError(
        infoPlist
      )}`
    );
    return;
  }

  const dependencySet = new Set(dependencyNames);

  let updated = infoPlist.content;
  const hasErrorOnInfoPlist =
    findings.length > 0 &&
    findings.some(
      item =>
        item.status === PermissionStatus.ERROR &&
        /^NS.+UsageDescription$/.test(item.permission)
    );

  if (!hasErrorOnInfoPlist) return;

  for (const [permissionKey, permissionRule] of Object.entries(IOS_PERMISSION_RULES)) {
    const required = permissionRule.requiredDependencies.some(dep =>
      dependencySet.has(dep)
    );
    const exists = hasInfoPlistKey(updated, permissionKey);
    if (required && !exists) {
      updated = updated.replace(
        /<\/dict>\s*<\/plist>/,
        `${buildPermissionEntry(permissionKey)}\n</dict>\n</plist>`
      );
    }
    if (!required && exists) {
      updated = removePermissionEntry(updated, permissionKey);
    }
  }

  for (const [legacyKey, legacyRule] of Object.entries(IOS_LEGACY_PERMISSION_RULES)) {
    const required = legacyRule.requiredDependencies.some(dep =>
      dependencySet.has(dep)
    );
    if (!hasInfoPlistKey(updated, legacyKey)) continue;

    updated = removePermissionEntry(updated, legacyKey);

    if (required && legacyRule.replaceWith && !hasInfoPlistKey(updated, legacyRule.replaceWith)) {
      updated = updated.replace(
        /<\/dict>\s*<\/plist>/,
        `${buildPermissionEntry(legacyRule.replaceWith)}\n</dict>\n</plist>`
      );
    }
  }

  if (updated === infoPlist.content) return;
  await fs.promises.writeFile(infoPlist.filePath, updated, 'utf8');
  logger.success('iOS Info.plist permission fixer applied successfully');
};

export default iosPermissionsFix;
