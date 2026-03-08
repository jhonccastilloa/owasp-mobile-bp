import { UserPermission } from '../types/global';

export const IOS_PERMISSION_RULES: Record<string, UserPermission> = {
  NSCameraUsageDescription: {
    requiredDependencies: [
      'react-native-image-picker',
      'react-native-vision-camera',
      'react-native-image-crop-picker',
    ],
    severity: 'E',
    message: 'Debe existir descripción de uso de cámara en iOS.',
    owaspCategory: 'M1',
  },
  NSLocationWhenInUseUsageDescription: {
    requiredDependencies: [
      'react-native-maps',
      'react-native-get-location',
      'react-native-geocoding',
    ],
    severity: 'E',
    message: 'Debe existir descripción de uso de ubicación en iOS.',
    owaspCategory: 'M1',
  },
  NSPhotoLibraryUsageDescription: {
    requiredDependencies: [
      'react-native-image-picker',
      'react-native-image-crop-picker',
    ],
    severity: 'E',
    message: 'Debe existir descripción de uso de galería en iOS.',
    owaspCategory: 'M1',
  },
};

export interface IosLegacyPermissionRule extends UserPermission {
  replaceWith?: string;
}

export const IOS_LEGACY_PERMISSION_RULES: Record<string, IosLegacyPermissionRule> = {
  NSLocationAlwaysUsageDescription: {
    requiredDependencies: [
      'react-native-maps',
      'react-native-get-location',
      'react-native-geocoding',
    ],
    replaceWith: 'NSLocationAlwaysAndWhenInUseUsageDescription',
    severity: 'E',
    message:
      'NSLocationAlwaysUsageDescription está deprecado. Reemplazar por NSLocationAlwaysAndWhenInUseUsageDescription.',
    owaspCategory: 'M1',
  },
};
