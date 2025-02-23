import { GeneralPermission } from '../types/global';

type key = 'cleartextTrafficPermitted';

export const NETWORK_SECURITY_CONFIG_RULES: Record<key, GeneralPermission> = {
  cleartextTrafficPermitted: {
    values: ['false'],
    severity: 'E',
    message:
      'La app no permite tráfico sin cifrar, lo que protege la comunicación del usuario.',
    owaspCategory: 'M5',
  },
};
