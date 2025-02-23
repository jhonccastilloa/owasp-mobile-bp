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
    message: 'La aplicación no es depurable en entornos de producción.',
    owaspCategory: 'M9',
  },
  ['android:launchMode']: {
    values: ['singleInstance'],
    severity: 'E',
    message: 'El manejo de actividades previene aperturas indebidas.',
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
