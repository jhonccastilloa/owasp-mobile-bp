import { cleanBlockAndLineComment } from '@/utils/tool';
import tls from 'tls';
import getCertificateFingerprint from './getCertificateFingerprint';
import { PermissionStatus } from '@/types/enums';
import { formatDate } from '@/utils/date';
import { ContentText } from 'pdfmake/interfaces';

const regexHostname = /hostname\s*=\s*"(.+)"\s*;/;
const regexFingerprint = /"sha256\/(.+)"\)/;

const verifySSLPinning = async (SSLPinningFile: string | null) => {
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
  const matchFingerprint =
    SSLPinningFileWithoutComments.match(regexFingerprint);

  if (!matchHostname) {
    message =
      'No se encontró un hostname válido en el archivo de configuración.';
    return { status, message };
  }

  if (!matchFingerprint) {
    message =
      'No se encontró un fingerprint válido en el archivo de configuración.';
    return { status, message };
  }

  const options: tls.ConnectionOptions = {
    host: matchHostname[1],
    port: 443,
    servername: matchHostname[1],
    rejectUnauthorized: false,
  };

  const { fingerprint: serverFingerprint, certificate } =
    await getCertificateFingerprint(options);

  if (serverFingerprint !== matchFingerprint[1]) {
    message = 'Error: El fingerprint del servidor no coincide con el esperado.';
    return { status, message };
  }

  // Verificar la fecha de expiración
  const expirationDate = new Date(certificate.valid_to);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    message = 'El certificado del servidor expirará en menos de 30 días.';
    return { status: PermissionStatus.WARNING, message };
  }
  if (diffDays < 0) {
    message = 'El certificado del servidor ya expiró.';
    return { status, message };
  }

  status = PermissionStatus.OK;
  message = [
    {
      text: 'Se ha encontrado la prevención contra SSL Pinning en el archivo SSLPinningFactory.java',
    },
    { text: '.\nCertificado expira el: ', bold: true },
    { text: formatDate(expirationDate) },
    { text: '.\nFaltan: ', bold: true },
    { text: `${diffDays} días.` },
  ];

  return { status, message };
};

export default verifySSLPinning;
