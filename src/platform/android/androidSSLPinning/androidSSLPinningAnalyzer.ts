import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import { getSSLPinningFile } from './androidSSLPinningUtils';
import verifySSLPinning from './verifySSLPinning';

const androidSSLPinningAnalyze = async (
  currentPath: string
): Promise<PermissionData | null> => {
  const { SSLPinningFile, fileName } = await getSSLPinningFile(currentPath);
  const { status, message } = await verifySSLPinning(SSLPinningFile, fileName);
  const data: PermissionData = {
    numLine: null,
    status,
    permission: 'SSL Pinning',
    severity: 'E',
    message,
    owaspCategory: 'M4',
    nameFile: fileName ?? '',
  };
  return data;
};

export default androidSSLPinningAnalyze;
