import { PermissionStatus } from '@/types/enums';
import { formatDate } from '@/utils/date';
import { getFingerprints } from '@/platform/android/androidSSLPinning/getCertificateFingerprint';
import {
  normalizePublicKeyHash,
  TrustKitConfigData,
} from './iosTrustKitUtils';

const verifyIosTrustKitPinning = async (
  trustKitConfigData: TrustKitConfigData | null
) => {
  if (!trustKitConfigData) {
    return {
      status: PermissionStatus.NOT_FOUND,
      message: 'No se detectó configuración de TrustKit en iOS.',
    };
  }

  if (!trustKitConfigData.hostname) {
    return {
      status: PermissionStatus.NOT_FOUND,
      message: `No se encontró hostname en la configuración TrustKit de ${trustKitConfigData.fileName}.`,
    };
  }

  if (trustKitConfigData.hashes.length === 0) {
    return {
      status: PermissionStatus.NOT_FOUND,
      message: `No se encontraron hashes en kTSKPublicKeyHashes en ${trustKitConfigData.fileName}.`,
    };
  }

  const serverFingerprints = await getFingerprints(trustKitConfigData.hostname);
  const serverByHash = new Map(
    serverFingerprints.map(fingerprint => [
      normalizePublicKeyHash(fingerprint.spki),
      fingerprint,
    ])
  );

  let hasValid = false;
  const messages: string[] = [];
  messages.push(
    `Se encontró TrustKit en ${trustKitConfigData.fileName} para host ${trustKitConfigData.hostname}.`
  );

  for (const declaredHash of trustKitConfigData.hashes) {
    const normalizedHash = normalizePublicKeyHash(declaredHash);
    const serverFingerprint = serverByHash.get(normalizedHash);
    if (!serverFingerprint) {
      messages.push(`Hash inválido/no encontrado en servidor: ${normalizedHash}`);
      continue;
    }

    const expirationDate = new Date(serverFingerprint.validTo);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0) {
      hasValid = true;
    }

    messages.push(
      `Hash válido: ${normalizedHash}. Expira: ${formatDate(expirationDate)} (${diffDays} días).`
    );
  }

  return {
    status: hasValid ? PermissionStatus.OK : PermissionStatus.NOT_FOUND,
    message: messages.join('\n'),
  };
};

export default verifyIosTrustKitPinning;

