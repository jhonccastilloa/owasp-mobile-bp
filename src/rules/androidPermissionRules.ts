import { UserPermission } from '../types/global';

export const ANDROID_PERMISSION_RULES: Record<string, UserPermission> = {
  ACCESS_COARSE_LOCATION: {
    requiredDependencies: [
      'react-native-geolocation-service',
      'react-native-maps',
      'react-native-google-maps-directions',
      'react-native-location',
    ],
    severity: 'E',
    message: 'Acceso a la ubicación aproximada',
    owaspCategory: 'M1',
  },

  ACCESS_FINE_LOCATION: {
    requiredDependencies: [
      'react-native-geolocation-service',
      'react-native-maps',
      'react-native-google-maps-directions',
      'react-native-location',
    ],
    severity: 'E',
    message: 'Acceso a la ubicación precisa',
    owaspCategory: 'M1',
  },

  ACCESS_FINGERPRINT_MANAGER: {
    requiredDependencies: [],
    severity: 'E',
    message:
      'Este permiso está deprecado desde el API 28, debe reemplazarse por USE_BIOMETRIC.',
    owaspCategory: 'M8',
  },

  // ACCESS_NETWORK_STATE: {
  //   requiredDependencies: [
  //     "react-native-geolocation-service",
  //     "react-native-maps",
  //     "react-native-webview",
  //   ],
  //   severity: "W",
  //   message: "Funciones dependientes de la conexión a internet",
  //   owaspCategory: "M9",
  // },

  // ACCESS_WIFI_STATE: {
  //   requiredDependencies: [],
  //   severity: "W",
  //   message: "Funciones como la geolocalización",
  //   owaspCategory: "M1",
  // },

  CAMERA: {
    requiredDependencies: [
      'react-native-camera',
      'react-native-qrcode-scanner',
      'react-native-image-picker',
    ],
    severity: 'E',
    message: 'Permiso para acceder a la cámara',
    owaspCategory: 'M4',
  },
  // HIGH_SAMPLING_RATE_SENSORS: {
  //   requiredDependencies: ["react-native-sensors"],
  //   severity: "W",
  //   message: "Precisión en la medición de sensores",
  //   owaspCategory: "M7",
  // },
  // INTERNET: {
  //   requiredDependencies: [
  //     "react-native-webview",
  //     "react-native-geolocation-service",
  //     "react-native-maps",
  //     "react-native-share",
  //     "react-native-firebase",
  //   ],
  //   severity: "W",
  //   message: "Acceso a Internet",
  //   owaspCategory: "M2",
  // },

  // QUERY_ALL_PACKAGES: {
  //   requiredDependencies: ["react-native-device-info", "react-native-app-links"],
  //   severity: "W",
  //   message: "Listar otras aplicaciones instaladas",
  //   owaspCategory: "M5",
  // },

  READ_CONTACTS: {
    requiredDependencies: [
      'react-native-contacts',
      'react-native-social-share',
    ],
    severity: 'E',
    message: 'Acceso a los contactos',
    owaspCategory: 'M6',
  },

  READ_PHONE_NUMBERS: {
    requiredDependencies: ['react-native-contacts', 'react-native-sms'],
    severity: 'E',
    message: 'Acceso a los números de teléfono',
    owaspCategory: 'M6',
  },

  READ_EXTERNAL_STORAGE: {
    requiredDependencies: [],
    severity: 'E',
    message:
      'A partir del nivel API 33, este permiso no tiene efecto. Reemplazarlo por READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, READ_MEDIA_AUDIO.',
    owaspCategory: 'M2',
  },

  READ_MEDIA_IMAGES: {
    requiredDependencies: [
      'react-native-share',
      'react-native-view-shot',
      'react-native-image-picker',
    ],
    severity: 'E',
    message: 'Acceso a imágenes del medio',
    owaspCategory: 'M2',
  },

  READ_PHONE_STATE: {
    requiredDependencies: [
      'react-native-call-detection',
      'react-native-telephony',
    ],
    severity: 'W',
    message: 'Monitoreo del estado del teléfono',
    owaspCategory: 'M9',
  },

  READ_PROFILE: {
    requiredDependencies: [],
    severity: 'W',
    message: 'Permiso deprecado',
    owaspCategory: 'M8',
  },

  // RECEIVE_BOOT_COMPLETED: {
  //   requiredDependencies: ["react-native-background-fetch", "react-native-push-notification"],
  //   severity: "W",
  //   message: "Aplicaciones que necesitan iniciarse al reiniciar el sistema",
  //   owaspCategory: "M1",
  // },
  USE_BIOMETRIC: {
    requiredDependencies: [
      'react-native-fingerprint-scanner',
      'react-native-biometrics',
    ],
    severity: 'E',
    message: 'Uso de biometría',
    owaspCategory: 'M8',
  },

  USE_FINGERPRINT: {
    requiredDependencies: [],
    severity: 'E',
    message:
      'Este permiso está deprecado desde el API 28, debe reemplazarse por USE_BIOMETRIC.',
    owaspCategory: 'M8',
  },

  // VIBRATE: {
  //   requiredDependencies: ["react-native-fingerprint-scanner", "react-native-sound"],
  //   severity: "W",
  //   message: "Aplicaciones que necesitan retroalimentación háptica",
  //   owaspCategory: "M3",
  // },

  WRITE_CONTACTS: {
    requiredDependencies: [
      'react-native-contacts',
      'react-native-social-share',
    ],
    severity: 'E',
    message: 'Escribir en los contactos',
    owaspCategory: 'M6',
  },

  WRITE_EXTERNAL_STORAGE: {
    requiredDependencies: [],
    severity: 'E',
    message:
      'Este permiso ya no tiene efecto en versiones de API superiores a 30.',
    owaspCategory: 'M2',
  },

  // WRITE_USE_APP_FEATURE_SURVEY: {
  //   requiredDependencies: [],
  //   severity: "E",
  //   message: "Uso de características de la aplicación",
  //   owaspCategory: "M10",
  // },

  READ_SMS: {
    requiredDependencies: ['react-native-sms', 'react-native-sms-retriever'],
    severity: 'W',
    message: 'Acceso a SMS para leer mensajes',
    owaspCategory: 'M6',
  },

  SEND_SMS: {
    requiredDependencies: ['react-native-sms'],
    severity: 'W',
    message: 'Enviar mensajes SMS',
    owaspCategory: 'M6',
  },

  ACCESS_FINE_LOCATION_BACKGROUND: {
    requiredDependencies: [],
    severity: 'E',
    message:
      'Se debe reemplazar por ACCESS_BACKGROUND_LOCATION si se requeire acceder a la ubicación en segundo plano',
    owaspCategory: 'M1',
  },

  ACCESS_BACKGROUND_LOCATION: {
    requiredDependencies: ['react-native-geolocation-service'],
    severity: 'E',
    message: 'Acceso a la ubicación en segundo plano',
    owaspCategory: 'M1',
  },

  // MODIFY_AUDIO_SETTINGS: {
  //   requiredDependencies: ["react-native-sound"],
  //   severity: "W",
  //   message: "Modificar configuraciones de audio",
  //   owaspCategory: "M4",
  // },

  RECORD_AUDIO: {
    requiredDependencies: ['react-native-audio'],
    severity: 'W',
    message: 'Grabar audio',
    owaspCategory: 'M4',
  },

  GET_ACCOUNTS: {
    requiredDependencies: ['react-native-contacts'],
    severity: 'W',
    message: 'Acceder a las cuentas en el dispositivo',
    owaspCategory: 'M6',
  },

  // ACCESS_LOCATION_EXTRA_COMMANDS: {
  //   requiredDependencies: ["react-native-geolocation-service"],
  //   severity: "W",
  //   message: "Acceder a comandos adicionales de ubicación",
  //   owaspCategory: "M1",
  // },

  ACCESS_MOCK_LOCATION: {
    requiredDependencies: [],
    severity: 'W',
    message: 'Este permiso solo se debe usar en modo desarrollador',
    owaspCategory: 'M1',
  },

  // BLUETOOTH: {
  //   requiredDependencies: ["react-native-bluetooth-serial"],
  //   severity: "W",
  //   message: "Acceder a Bluetooth",
  //   owaspCategory: "M4",
  // },
  // BLUETOOTH_ADMIN: {
  //   requiredDependencies: ["react-native-bluetooth-serial"],
  //   severity: "W",
  //   message: "Controlar dispositivos Bluetooth",
  //   owaspCategory: "M4",
  // },
  // BLUETOOTH_PRIVILEGED: {
  //   requiredDependencies: ["react-native-bluetooth-serial"],
  //   severity: "W",
  //   message: "Acceso privilegiado a Bluetooth",
  //   owaspCategory: "M4",
  // },

  // CHANGE_WIFI_STATE: {
  //   requiredDependencies: ["react-native-wifi-reborn"],
  //   severity: "W",
  //   message: "Cambiar el estado de Wi-Fi",
  //   owaspCategory: "M1",
  // },

  CAMERA_PERMISSION: {
    requiredDependencies: [],
    severity: 'E',
    message:
      'Este permiso esta deprecado, en caso requerirse usar permiso CAMERA',
    owaspCategory: 'M4',
  },

  RECEIVE_SMS: {
    requiredDependencies: ['react-native-sms'],
    severity: 'W',
    message: 'Recibir mensajes SMS',
    owaspCategory: 'M6',
  },

  USE_CREDENTIALS: {
    requiredDependencies: [],
    severity: 'W',
    message: 'Permiso deprecado',
    owaspCategory: 'M8',
  },

  WRITE_CALL_LOG: {
    requiredDependencies: ['react-native-call-log'],
    severity: 'W',
    message: 'Escribir en el registro de llamadas',
    owaspCategory: 'M9',
  },

  // WRITE_SETTINGS: {
  //   requiredDependencies: ["react-native-settings"],
  //   severity: "W",
  //   message: "Escribir en la configuración",
  //   owaspCategory: "M9",
  // },

  // ACCESS_NOTIFICATION_POLICY: {
  //   requiredDependencies: ["react-native-push-notification"],
  //   severity: "W",
  //   message: "Controlar las notificaciones",
  //   owaspCategory: "M9",
  // },

  MOUNT_UNMOUNT_FILESYSTEMS: {
    requiredDependencies: [],
    severity: 'W',
    message: 'Montar y desmontar sistemas de archivos',
    owaspCategory: 'M10',
  },

  // SYSTEM_ALERT_WINDOW: {
  //   requiredDependencies: ["react-native-push-notification"],
  //   severity: "W",
  //   message: "Dibujar sobre otras aplicaciones",
  //   owaspCategory: "M9",
  // },

  // MANAGE_EXTERNAL_STORAGE: {
  //   requiredDependencies: ["react-native-fs"],
  //   severity: "E",
  //   message: "Acceder y gestionar todos los archivos",
  //   owaspCategory: "M2",
  // },

  READ_CALENDAR: {
    requiredDependencies: ['react-native-calendar-events'],
    severity: 'W',
    message: 'Leer eventos del calendario',
    owaspCategory: 'M6',
  },

  WRITE_CALENDAR: {
    requiredDependencies: ['react-native-calendar-events'],
    severity: 'W',
    message: 'Modificar eventos del calendario',
    owaspCategory: 'M6',
  },

  CALL_PHONE: {
    requiredDependencies: ['react-native-phone-call'],
    severity: 'W',
    message: 'Iniciar llamadas telefónicas',
    owaspCategory: 'M9',
  },

  PROCESS_OUTGOING_CALLS: {
    requiredDependencies: [],
    severity: 'W',
    message: 'Permiso deprecado en API level 29',
    owaspCategory: 'M9',
  },

  ANSWER_PHONE_CALLS: {
    requiredDependencies: ['react-native-callkit'],
    severity: 'W',
    message: 'Contestar llamadas entrantes',
    owaspCategory: 'M9',
  },

  BODY_SENSORS: {
    requiredDependencies: ['react-native-healthkit'],
    severity: 'W',
    message: 'Acceder a los sensores corporales',
    owaspCategory: 'M7',
  },

  ACCESS_MEDIA_LOCATION: {
    requiredDependencies: ['react-native-permissions'],
    severity: 'W',
    message: 'Acceder a los metadatos de la ubicación de los medios',
    owaspCategory: 'M2',
  },

  // NFC: {
  //   requiredDependencies: ["react-native-nfc-manager"],
  //   severity: "W",
  //   message: "Acceder a la comunicación de campo cercano (NFC)",
  //   owaspCategory: "M5",
  // },

  // USE_SIP: {
  //   requiredDependencies: ["react-native-voip-sip"],
  //   severity: "W",
  //   message: "Acceder a los servicios SIP",
  //   owaspCategory: "M9",
  // },
  // REQUEST_IGNORE_BATTERY_OPTIMIZATIONS: {
  //   requiredDependencies: ["react-native-background-fetch"],
  //   severity: "W",
  //   message: "Ignorar las optimizaciones de batería",
  //   owaspCategory: "M10",
  // },
  // FOREGROUND_SERVICE: {
  //   requiredDependencies: ["react-native-background-actions"],
  //   severity: "E",
  //   message: "Ejecutar servicios en primer plano",
  //   owaspCategory: "M10",
  // },

  // REQUEST_COMPANION_RUN_IN_BACKGROUND: {
  //   requiredDependencies: [],
  //   severity: "W",
  //   message: "Ejecutar aplicaciones compañeras en segundo plano",
  //   owaspCategory: "M10",
  // },
  // BIND_NOTIFICATION_LISTENER_SERVICE: {
  //   requiredDependencies: ["react-native-notification-listener"],
  //   severity: "W",
  //   message: "Escuchar notificaciones",
  //   owaspCategory: "M8",
  // },
  // BIND_ACCESSIBILITY_SERVICE: {
  //   requiredDependencies: [],
  //   severity: "W",
  //   message: "Servicio de accesibilidad para tareas avanzadas",
  //   owaspCategory: "M10",
  // },
  CHANGE_NETWORK_STATE: {
    requiredDependencies: ['react-native-netinfo'],
    severity: 'W',
    message: 'Cambiar el estado de la red',
    owaspCategory: 'M9',
  },
};
