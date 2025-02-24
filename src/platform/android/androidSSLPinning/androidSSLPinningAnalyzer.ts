import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import { getSSLPinningFile } from './androidSSLPinningUtils';
import verifySSLPinning from './verifySSLPinning';

const androidSSLPinningAnalyze = async (
  currentPath: string
): Promise<PermissionData | null> => {
  const { SSLPinningFile } = await getSSLPinningFile(currentPath);
  const { status } = await verifySSLPinning(SSLPinningFile);
  const data: PermissionData = {
    numLine: null,
    status: status ? PermissionStatus.OK : PermissionStatus.NOT_FOUND,
    permission: 'SSL Pinning',
    severity: 'E',
    message: `${
      status ? 'Se' : 'No se'
    } ha encontrado la prevención contra SSL Pinning en el archivo SSLPinningFactory.java`,
    owaspCategory: 'M4',
    nameFile: 'SSLPinningFactory.java',
  };
  return data;
};

export default androidSSLPinningAnalyze;
