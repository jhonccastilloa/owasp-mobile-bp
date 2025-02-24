import { getMainApplicationJava } from '@/utils/androidFiles';
import {
  createSSLPinnerFactory,
  getServerFingerprint,
  getSSLPinningFile,
  updateMainApplication,
} from './androidSSLPinningUtils';
import verifySSLPinning from './verifySSLPinning';
import getAndroidApplicationId from '@/utils/getAndroidApplicationId';
import getOwaspBpConfig from '@/utils/owasp-bp.config';

const androidSSLPinningFix = async (currentPath: string) => {
  const { SSLPinningFile } = await getSSLPinningFile(currentPath);
  const { status } = await verifySSLPinning(SSLPinningFile);
  if (status) return;
  let { mainApplicationFile, mainApplicationPath } =
    await getMainApplicationJava(currentPath);
  if (!mainApplicationPath || !mainApplicationFile) return;
  const mainApplicationFolder = mainApplicationPath.replace(
    'MainApplication.java',
    ''
  );
  const androidApplicationId = await getAndroidApplicationId(currentPath);
  const owaspBpConfig = await getOwaspBpConfig();
  if (!owaspBpConfig) return;
  const serverFingerprint = await getServerFingerprint(owaspBpConfig.hostname);
  createSSLPinnerFactory(
    mainApplicationFolder,
    serverFingerprint,
    androidApplicationId
  );
  updateMainApplication(mainApplicationPath, mainApplicationFile);
  console.log('✅ ¡Corrección de SSL Pinning aplicada con éxito!');
};
export default androidSSLPinningFix;
