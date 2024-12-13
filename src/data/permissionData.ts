import { GeneralPermission } from '../types/global';

export const REQUIRED_PERMISSIONS: Record<string, GeneralPermission> = {
  ['android:allowBackup']: {
    values: ['false'],
    severity: 'E',
    message:
      'La aplicación no permite que sus datos se incluyan en copias de seguridad.',
    owaspCategory: 'M1',
  },
  ['android:debuggable']: {
    values: ['false'],
    severity: 'E',
    message:
      'La instalación está restringida al almacenamiento interno, evitando riesgos de seguridad.',
    owaspCategory: 'M1',
  },
  ['android:InstallLocation']: {
    values: ['internalOnly'],
    severity: 'E',
    message: 'La aplicación no es depurable en entornos de producción. ',
    owaspCategory: 'M1',
  },
  ['android:launchMode']: {
    values: ['singleInstance'],
    severity: 'E',
    message: 'El manejo de actividades previene aperturas indebidas',
    owaspCategory: 'M4',
  },
  // ['android:configChanges']: {
  //   values: ['false'],
  //   severity: 'E',
  //   message:
  //     'Los cambios críticos se gestionan manualmente para mayor control. ',
  //   owaspCategory: 'M4',
  // },
};
