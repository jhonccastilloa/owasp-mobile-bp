import { cleanBlockAndLineComment } from '@/utils/tool';
import tls from 'tls';
import getCertificateFingerprint from './getCertificateFingerprint';

const regexHostname = /hostname\s*=\s*"(.+)"\s*;/;
const regexFingerprint = /"sha256\/(.+)"\)/;

const verifySSLPinning = async (SSLPinningFile: string | null) => {
  let status = false;
  let message = '';

  if (!SSLPinningFile) {
    message =
      'Error: Archivo de configuración de SSL Pinning no proporcionado.';
    return { status, message };
  }

  const SSLPinningFileWithoutComments =
    cleanBlockAndLineComment(SSLPinningFile).newData;
  const matchHostname = SSLPinningFileWithoutComments.match(regexHostname);
  const matchFingerprint =
    SSLPinningFileWithoutComments.match(regexFingerprint);

  if (!matchHostname) {
    message =
      'Advertencia: No se encontró un hostname válido en el archivo de configuración.';
    return { status, message };
  }

  if (!matchFingerprint) {
    message =
      'Advertencia: No se encontró un fingerprint válido en el archivo de configuración.';
    return { status, message };
  }

  const options: tls.ConnectionOptions = {
    host: matchHostname[1],
    port: 443,
    servername: matchHostname[1],
    rejectUnauthorized: false,
  };

  const serverFingerprint = await getCertificateFingerprint(options);

  if (serverFingerprint !== matchFingerprint[1]) {
    message = 'Error: El fingerprint del servidor no coincide con el esperado.';
    return { status, message };
  }

  status = true;
  message = 'SSL Pinning verificado correctamente.';

  return { status, message };
};

export default verifySSLPinning;
