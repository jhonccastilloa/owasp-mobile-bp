import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import {
  formatInfoPlistResolutionError,
  resolveProductionInfoPlist,
} from '../utils/iosFiles';
import path from 'path';

const iosAtsAnalyze = async (currentPath: string): Promise<PermissionData | null> => {
  const infoPlist = await resolveProductionInfoPlist(currentPath);
  if (!infoPlist.ok) {
    return {
      numLine: null,
      status: PermissionStatus.ERROR,
      permission: 'iOS ATS',
      severity: 'E',
      message: formatInfoPlistResolutionError(infoPlist),
      owaspCategory: 'M5',
      nameFile: 'Info.plist',
    };
  }

  const isArbitraryLoadsEnabled = /<key>NSAllowsArbitraryLoads<\/key>\s*<true\/>/.test(
    infoPlist.content
  );

  return {
    numLine: null,
    status: isArbitraryLoadsEnabled
      ? PermissionStatus.ERROR
      : PermissionStatus.OK,
    permission: 'iOS ATS',
    severity: 'E',
    message: isArbitraryLoadsEnabled
      ? 'ATS permite conexiones arbitrarias (NSAllowsArbitraryLoads=true).'
      : 'ATS restringe conexiones inseguras.',
    owaspCategory: 'M5',
    nameFile: path.basename(infoPlist.filePath),
  };
};

export default iosAtsAnalyze;
