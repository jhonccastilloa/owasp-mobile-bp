import fs from 'fs';
import {
  formatInfoPlistResolutionError,
  resolveProductionInfoPlist,
} from '../utils/iosFiles';
import { logger } from '@/utils/logger';
import { AuditOptions } from '@/types/audit';
import iosPermissionsAnalyze from './iosPermissionsAnalyzer';
import { PermissionStatus } from '@/types/enums';

const buildPermissionEntry = (key: string) =>
  `\n\t<key>${key}</key>\n\t<string>Required by application functionality.</string>`;

const iosPermissionsFix = async (
  currentPath: string,
  options?: Pick<AuditOptions, 'safe' | 'fixRisky'>
) => {
  if (options?.safe !== false || !options.fixRisky) {
    logger.warn('Skipping iOS Info.plist permission fixer in safe mode');
    return;
  }

  const [infoPlist, findings] = await Promise.all([
    resolveProductionInfoPlist(currentPath),
    iosPermissionsAnalyze(currentPath),
  ]);
  if (!infoPlist.ok) {
    logger.warn(
      `Skipping iOS Info.plist permission fixer: ${formatInfoPlistResolutionError(
        infoPlist
      )}`
    );
    return;
  }

  const missingKeys = findings
    .filter(
      item =>
        item.status === PermissionStatus.ERROR &&
        /^NS.+UsageDescription$/.test(item.permission)
    )
    .map(item => item.permission);
  if (missingKeys.length === 0) return;

  let updated = infoPlist.content;
  for (const key of missingKeys) {
    updated = updated.replace(/<\/dict>\s*<\/plist>/, `${buildPermissionEntry(key)}\n</dict>\n</plist>`);
  }
  if (updated === infoPlist.content) return;
  await fs.promises.writeFile(infoPlist.filePath, updated, 'utf8');
  logger.success('iOS Info.plist permission fixer applied successfully');
};

export default iosPermissionsFix;
