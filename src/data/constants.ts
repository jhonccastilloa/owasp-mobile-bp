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
    title: 'Autenticación insegura',
  },
  M5: {
    title: 'Criptografía insuficiente',
  },
  M6: {
    title: 'Autorización insegura',
  },
  M7: {
    title: 'Calidad del código del cliente',
  },
  M8: {
    title: 'Manipulación de código',
  },
  M9: {
    title: 'Ingeniería inversa',
  },
  M10: {
    title: 'Funcionalidad innecesaria',
  },
};
