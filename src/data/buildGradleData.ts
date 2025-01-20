import { GeneralPermission } from '../types/global';

export const BUILD_GRADLE_DATA: Record<string, GeneralPermission> = {
  minSdkVersion: {
    values: ['27'],
    severity: 'W',
    message:
      'Se usa una versión mínima segura para evitar vulnerabilidades obsoletas.',
    owaspCategory: 'M2',
  },
  compileSdkVersion: {
    values: ['34'],
    severity: 'W',
    message:
      'La app se compila con la última versión del SDK, maximizando la seguridad.',
    owaspCategory: 'M8',
  },
};
