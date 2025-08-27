import tls, { PeerCertificate } from 'tls';
import crypto from 'crypto';

const getCertificateFingerprint = (
  options: tls.ConnectionOptions
): Promise<{ fingerprint: string | null; certificate: PeerCertificate }> => {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(options, () => {
      const certificate: tls.PeerCertificate = socket.getPeerCertificate(true);

      if (!certificate || !certificate.raw) {
        socket.end();
        return reject(new Error('No certificate found'));
      }

      const fingerprint = getPublicKeyFingerprint(certificate);
      socket.end();
      resolve({ fingerprint, certificate });
    });

    socket.on('error', err => {
      reject(err);
    });
  });
};

const getPublicKeyFingerprint = (cert: tls.PeerCertificate): string | null => {
  if (!cert.raw) {
    console.error('❌ No certificate data available.');
    return null;
  }

  try {
    const x509Cert = new crypto.X509Certificate(cert.raw);

    const publicKeyDer = x509Cert.publicKey.export({
      format: 'der',
      type: 'spki',
    });

    return crypto.createHash('sha256').update(publicKeyDer).digest('base64');
  } catch (error) {
    console.error('❌ Error extracting public key fingerprint:', error);
    return null;
  }
};

export default getCertificateFingerprint;
