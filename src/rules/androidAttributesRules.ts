import { GeneralPermission } from '../types/global';

export const ANDROID_ATTRIBUTES_RULES: Record<string, GeneralPermission> = {
  ['android:allowBackup']: {
    values: ['false'],
    severity: 'E',
    message:
      'La aplicación no permite que sus datos se incluyan en copias de seguridad.',
    owaspCategory: 'M9',
  },
  // ['android:debuggable']: {
  //   values: ['false'],
  //   severity: 'E',
  //   message:
  //     'La instalación está restringida al almacenamiento interno, evitando riesgos de seguridad.',
  //   owaspCategory: 'M7',
  // },
  ['android:installLocation']: {
    values: ['internalOnly'],
    severity: 'E',
    message:
      'Se debe usar internalOnly para proteger los datos de la aplicación y prevenir accesos desde almacenamiento externo.',
    owaspCategory: 'M9',
  },
  ['android:launchMode']: {
    values: ['singleInstance'],
    severity: 'E',
    message:
      'Se debe usar singleInstance para evitar accesos indebidos y garantizar el aislamiento de actividades sensibles.',
    owaspCategory: 'M3',
  },
  // ['android:configChanges']: {
  //   values: ['false'],
  //   severity: 'E',
  //   message:
  //     'Los cambios críticos se gestionan manualmente para mayor control. ',
  //   owaspCategory: 'M4',
  // },
};
