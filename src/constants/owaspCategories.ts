import { Owasp, OwaspCategory } from '../types/global';

export const OWASP_CATEGORY: Record<OwaspCategory, Owasp> = {
  M1: {
    title: 'Uso Inadecuado de Credenciales',
    // description: 'Errores en el manejo de credenciales que podrían llevar a su exposición, como almacenamiento inseguro o transmisión no cifrada.',
  },
  M2: {
    title: 'Seguridad Inadecuada de la Cadena de Suministro',
    // description: 'Riesgos derivados de dependencias inseguras en bibliotecas, SDKs o servicios de terceros.',
  },
  M3: {
    title: 'Autenticación y Autorización Inseguras',
    // description: 'Fallas en la implementación de autenticación o autorización, permitiendo acceso no autorizado a datos o funcionalidades.',
  },
  M4: {
    title: 'Validación Insuficiente de Entrada/Salida',
    // description: 'Falta de validación adecuada de datos que puede resultar en inyección de código, corrupción de datos u otros ataques.',
  },
  M5: {
    title: 'Comunicación Insegura',
    // description: 'Transmisión de datos sin cifrar o con protocolos inseguros, lo que permite ataques de interceptación o manipulación.',
  },
  M6: {
    title: 'Controles de Privacidad Inadecuados',
    // description: 'Exposición o recopilación innecesaria de datos personales sin medidas adecuadas para proteger la privacidad del usuario.',
  },
  M7: {
    title: 'Protecciones Binarias Insuficientes',
    // description: 'Ausencia de medidas de protección contra ingeniería inversa o modificación de aplicaciones.',
  },
  M8: {
    title: 'Configuración de Seguridad Incorrecta',
    // description: 'Configuraciones inseguras que pueden incluir permisos excesivos o configuraciones por defecto vulnerables.',
  },
  M9: {
    title: 'Almacenamiento de Datos Inseguro',
    // description: 'Uso de almacenamiento inseguro para datos sensibles, como almacenamiento local sin cifrado.',
  },
  M10: {
    title: 'Criptografía Insuficiente',
    // description: 'Uso de algoritmos débiles, implementación incorrecta o ausencia de cifrado para proteger datos sensibles.',
  },
};
