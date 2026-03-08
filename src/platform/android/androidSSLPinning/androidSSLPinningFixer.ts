import { getMainApplication } from '@/utils/androidFiles';
import {
  createSSLPinnerFactory,
  getSSLPinningFile,
  updateMainApplication,
} from './androidSSLPinningUtils';
import verifySSLPinning from './verifySSLPinning';
import getAndroidApplicationId from '@/utils/getAndroidApplicationId';
import getOwaspBpConfig from '@/utils/owasp-bp.config';
import { PermissionStatus } from '@/types/enums';
import { getFingerprints } from './getCertificateFingerprint';
import { logger } from '@/utils/logger';

const androidSSLPinningFix = async (currentPath: string) => {
  const { SSLPinningFile, fileName } = await getSSLPinningFile(currentPath);
  const { status } = await verifySSLPinning(SSLPinningFile, fileName);
  if (status === PermissionStatus.OK) return;
  const { mainApplicationFile, mainApplicationPath, mainApplicationName } =
    await getMainApplication(currentPath);

  if (!mainApplicationPath || !mainApplicationFile || !mainApplicationName)
    return;
  const mainApplicationFolder = mainApplicationPath.replace(
    mainApplicationName,
    ''
  );
  const androidApplicationId = await getAndroidApplicationId(currentPath);
  if (!androidApplicationId) {
    logger.warn('Android applicationId not found, skipping SSL pinning fixer');
    return;
  }

  const owaspBpConfig = await getOwaspBpConfig(currentPath);
  if (!owaspBpConfig?.hostname) {
    logger.warn("File 'owasp-bp.config.json' missing required 'hostname'.");
    return;
  }
  const fingerprints = await getFingerprints(owaspBpConfig.hostname);
  await createSSLPinnerFactory(
    mainApplicationFolder,
    fingerprints,
    androidApplicationId,
    mainApplicationName.endsWith('.kt'),
    currentPath
  );
  updateMainApplication(mainApplicationPath, mainApplicationFile);
  logger.success('SSL Pinning fixer applied successfully');
};
export default androidSSLPinningFix;
