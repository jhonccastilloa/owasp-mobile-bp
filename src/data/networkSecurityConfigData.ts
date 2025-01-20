import { GeneralPermission } from '../types/global';

export const NETWORK_SECURITY_CONFIG_DATA: Record<string, GeneralPermission> = {
  cleartextTrafficPermitted: {
    values: ['false'],
    severity: 'E',
    message: 'La app no permite tráfico sin cifrar, lo que protege la comunicación del usuario.',
    owaspCategory: 'M5',
  },
};