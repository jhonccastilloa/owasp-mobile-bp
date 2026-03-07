import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import {
  formatInfoPlistResolutionError,
  resolveProductionInfoPlist,
} from '../utils/iosFiles';
import { getPackageDependencyNames } from '@/utils/packageJson';
import path from 'path';

const IOS_PERMISSION_DEPENDENCY_MAP: Array<{
  key: string;
  dependencies: string[];
  message: string;
  owaspCategory: PermissionData['owaspCategory'];
}> = [
  {
    key: 'NSCameraUsageDescription',
    dependencies: [
      'react-native-image-picker',
      'react-native-vision-camera',
      'react-native-image-crop-picker',
    ],
    message: 'Debe existir descripción de uso de cámara en iOS.',
    owaspCategory: 'M1',
  },
  {
    key: 'NSLocationWhenInUseUsageDescription',
    dependencies: [
      'react-native-maps',
      'react-native-get-location',
      'react-native-geocoding',
    ],
    message: 'Debe existir descripción de uso de ubicación en iOS.',
    owaspCategory: 'M1',
  },
  {
    key: 'NSPhotoLibraryUsageDescription',
    dependencies: ['react-native-image-picker', 'react-native-image-crop-picker'],
    message: 'Debe existir descripción de uso de galería en iOS.',
    owaspCategory: 'M1',
  },
];

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
  for (const permissionRule of IOS_PERMISSION_DEPENDENCY_MAP) {
    const required = permissionRule.dependencies.some(dep => dependencySet.has(dep));
    if (!required) continue;
    const exists = hasInfoPlistKey(infoPlist.content, permissionRule.key);
    findings.push({
      numLine: null,
      status: exists ? PermissionStatus.OK : PermissionStatus.ERROR,
      permission: permissionRule.key,
      severity: 'E',
      message: permissionRule.message,
      owaspCategory: permissionRule.owaspCategory,
      nameFile: path.basename(infoPlist.filePath),
    });
  }
  return findings;
};

export default iosPermissionsAnalyze;
