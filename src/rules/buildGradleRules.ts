import { GeneralPermission } from '../types/global';

export const BUILD_GRADLE_RULES: Record<string, GeneralPermission> = {
  minSdkVersion: {
    values: ['27'],
    severity: 'W',
    message:
      'Se usa una versión mínima segura para evitar vulnerabilidades obsoletas en minSdkVersion.',
    owaspCategory: 'M2',
  },
  compileSdkVersion: {
    values: ['34'],
    severity: 'W',
    message:
      'La app se compila con la última versión del SDK en compileSdkVersion, maximizando la seguridad.',
    owaspCategory: 'M8',
  },
  targetSdkVersion: {
    values: ['34'],
    severity: 'W',
    message:
      'La app se compila con la última versión del SDK en targetSdkVersion, maximizando la seguridad.',
    owaspCategory: 'M8',
  },
  buildToolsVersion: {
    values: ['34.0.0'],
    severity: 'W',
    message:
      'La app se compila con la última versión del SDK en buildToolsVersion, maximizando la seguridad.',
    owaspCategory: 'M8',
  },
};
