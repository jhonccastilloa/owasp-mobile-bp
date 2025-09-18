import { cleanBlockAndLineComment } from '@/utils/tool';
import { getFingerprints } from './getCertificateFingerprint';
import { PermissionStatus } from '@/types/enums';
import { formatDate } from '@/utils/date';
import { ContentText } from 'pdfmake/interfaces';

const regexHostname = /hostname\s*=\s*"(.+)"\s*/;
const regexFingerprint = /sha256\/[A-Za-z0-9+/=]+/g;

const verifySSLPinning = async (
  SSLPinningFile: string | null,
  fileName: string | null
) => {
  let status = PermissionStatus.NOT_FOUND;
  let message: ContentText[] | string = '';

  if (!SSLPinningFile) {
    message =
      'No se ha encontrado la prevención contra SSL Pinning en el archivo SSLPinningFactory.java';
    return { status, message };
  }

  const SSLPinningFileWithoutComments =
    cleanBlockAndLineComment(SSLPinningFile).newData;

  const matchHostname = SSLPinningFileWithoutComments.match(regexHostname);
  if (!matchHostname) {
    message =
      'No se encontró un hostname válido en el archivo de configuración.';
    return { status, message };
  }

  const matchFingerprint =
    SSLPinningFileWithoutComments.match(regexFingerprint);
  if (!matchFingerprint) {
    message =
      'No se encontró un fingerprint válido en el archivo de configuración.';
    return { status, message };
  }

  // Trae todos los fingerprints del servidor
  const fingerprints = await getFingerprints(matchHostname[1]);

  const messages: ContentText[] = [
    {
      text: `Se ha encontrado la prevención contra SSL Pinning en el archivo ${fileName}\n`,
    },
  ];

  let hasValid = false;
  let allExpiredOrInvalid = true;

  messages.push({ text: '\nSe encontraros los siguientes fingerprints: \n' });
  for (const declaredFp of matchFingerprint) {
    const serverFp = fingerprints.find(fp => fp.spki === declaredFp);

    if (!serverFp) {
      messages.push(
        { text: `\nFingerprint Invalido: ` },
        { text: declaredFp, bold: true }
      );
      continue;
    }

    const expirationDate = new Date(serverFp.validTo);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    messages.push(
      { text: `\n\nFingerprint válido: ` },
      { text: declaredFp, bold: true },
      { text: '\n   Expira el: ', bold: true },
      { text: formatDate(expirationDate) },
      { text: '.\n   Faltan: ', bold: true },
      { text: `${diffDays} días.` }
    );

    if (diffDays < 0) {
      messages.push({
        text: '\n   Error: El certificado ya expiró.',
      });
      // no lo marcamos como válido
    } else {
      hasValid = true; // al menos uno sigue siendo válido
      allExpiredOrInvalid = false;
      if (diffDays < 30) {
        messages.push({
          text: '\n   Advertencia: El certificado expira en menos de 30 días.',
        });
      }
    }
  }

  if (hasValid) {
    status = PermissionStatus.OK;
  } else if (allExpiredOrInvalid) {
    status = PermissionStatus.NOT_FOUND;
  }

  return { status, message: messages };
};

export default verifySSLPinning;
