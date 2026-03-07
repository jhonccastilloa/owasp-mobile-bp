import fs from 'fs';
import { logger } from '@/utils/logger';
import { getFingerprints } from '@/platform/android/androidSSLPinning/getCertificateFingerprint';
import getOwaspBpConfig from '@/utils/owasp-bp.config';
import {
  findTrustKitConfigFile,
  normalizePublicKeyHash,
  replaceTrustKitHashes,
} from './iosTrustKitUtils';

const iosSslPinningFix = async (currentPath: string): Promise<void> => {
  const trustKitConfigData = await findTrustKitConfigFile(currentPath);
  if (!trustKitConfigData) {
    logger.warn('TrustKit config not found, skipping iOS SSL pinning fixer');
    return;
  }

  const owaspBpConfig = await getOwaspBpConfig(currentPath, true);
  const hostname = trustKitConfigData.hostname ?? owaspBpConfig?.hostname ?? null;
  if (!hostname) {
    logger.warn(
      "TrustKit hostname not found. Add pinned domain or configure 'hostname' in owasp-bp.config.json."
    );
    return;
  }

  const serverFingerprints = await getFingerprints(hostname);
  const hashes = serverFingerprints.map(fingerprint =>
    normalizePublicKeyHash(fingerprint.spki)
  );
  if (hashes.length === 0) {
    logger.warn('No server fingerprints found, skipping iOS SSL pinning fixer');
    return;
  }

  const fileWithUpdatedHashes = replaceTrustKitHashes(
    trustKitConfigData.fileContent,
    hashes
  );
  if (!fileWithUpdatedHashes) {
    logger.warn(
      `kTSKPublicKeyHashes block not found in ${trustKitConfigData.fileName}, skipping fixer`
    );
    return;
  }

  if (fileWithUpdatedHashes === trustKitConfigData.fileContent) {
    logger.info('iOS TrustKit hashes are already up to date');
    return;
  }

  await fs.promises.writeFile(
    trustKitConfigData.filePath,
    fileWithUpdatedHashes,
    'utf8'
  );
  logger.success('iOS SSL pinning fixer applied successfully');
};

export default iosSslPinningFix;

