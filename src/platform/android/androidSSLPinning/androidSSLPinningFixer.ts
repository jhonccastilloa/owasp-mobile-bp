import { getMainApplication } from '@/utils/androidFiles';
import {
  createSSLPinnerFactory,
  getServerFingerprint,
  getSSLPinningFile,
  updateMainApplication,
} from './androidSSLPinningUtils';
import verifySSLPinning from './verifySSLPinning';
import getAndroidApplicationId from '@/utils/getAndroidApplicationId';
import getOwaspBpConfig from '@/utils/owasp-bp.config';
import { PermissionStatus } from '@/types/enums';
import { getFingerprints } from './getCertificateFingerprint';

const androidSSLPinningFix = async (currentPath: string) => {
  const { SSLPinningFile, fileName } = await getSSLPinningFile(currentPath);
  const { status } = await verifySSLPinning(SSLPinningFile, fileName);
  if (status === PermissionStatus.OK) return;
  let { mainApplicationFile, mainApplicationPath, mainAplicationName } =
    await getMainApplication(currentPath);

  if (!mainApplicationPath || !mainApplicationFile || !mainAplicationName)
    return;
  const mainApplicationFolder = mainApplicationPath.replace(
    mainAplicationName,
    ''
  );
  const androidApplicationId = await getAndroidApplicationId(currentPath);
  const owaspBpConfig = await getOwaspBpConfig();
  if (!owaspBpConfig) return;
  const fingerprints = await getFingerprints(owaspBpConfig.hostname);
  createSSLPinnerFactory(
    mainApplicationFolder,
    fingerprints,
    androidApplicationId!,

    mainAplicationName.endsWith('.kt')
  );
  updateMainApplication(mainApplicationPath, mainApplicationFile);
  console.log('✅ ¡Corrección de SSL Pinning aplicada con éxito!');
};
export default androidSSLPinningFix;
