import { Owasp, OwaspCategory } from '../types/global';

export const OWASP: Record<OwaspCategory, Owasp> = {
  M1: {
    title: 'Uso inadecuado de la plataforma',
  },
  M2: {
    title: 'Almacenamiento de datos inseguro',
  },
  M3: {
    title: 'Comunicación insegura',
  },
  M4: {
    title: 'Autentificación insegura',
  },
  M5: {
    title: '',
  },
  M6: {
    title: '',
  },
  M7: {
    title: '',
  },
  M8: {
    title: 'Manipulación de código',
  },
  M9: {
    title: '',
  },
  M10: {
    title: '',
  },
};
