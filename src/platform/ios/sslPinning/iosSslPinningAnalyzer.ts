import { PermissionData } from '@/types/global';
import { findTrustKitConfigFile } from './iosTrustKitUtils';
import verifyIosTrustKitPinning from './verifyIosTrustKitPinning';

const iosSslPinningAnalyze = async (
  currentPath: string
): Promise<PermissionData | null> => {
  const trustKitConfigData = await findTrustKitConfigFile(currentPath);
  const { status, message } = await verifyIosTrustKitPinning(trustKitConfigData);

  return {
    numLine: null,
    status,
    permission: 'iOS SSL Pinning',
    severity: 'E',
    message,
    owaspCategory: 'M4',
    nameFile: trustKitConfigData?.fileName ?? 'ios',
  };
};

export default iosSslPinningAnalyze;

