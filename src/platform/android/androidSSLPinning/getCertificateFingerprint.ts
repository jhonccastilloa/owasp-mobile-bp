import tls, { PeerCertificate } from 'tls';
import crypto from 'crypto';
export type Fingerprints = {
  subject: any;
  issuer: any;
  spki: string;
  cert: string;
  validTo: string;
};

export async function getFingerprints(
  host: string,
  port = 443
): Promise<Fingerprints[]> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host, port, servername: host, rejectUnauthorized: true },
      () => {
        try {
          const results: Fingerprints[] = [];
          const seen = new Set<string>();

          let cert: any= socket.getPeerCertificate(true);
          while (cert && cert.raw) {
            const x509 = new crypto.X509Certificate(cert.raw);
            const spkiDer = x509.publicKey.export({
              format: 'der',
              type: 'spki',
            });
            const spkiB64 = crypto
              .createHash('sha256')
              .update(spkiDer)
              .digest('base64');
            const certB64 = crypto
              .createHash('sha256')
              .update(cert.raw)
              .digest('base64');

            const id = spkiB64 + '|' + certB64;
            if (seen.has(id)) break;
            seen.add(id);
        
            results.push({
              subject: cert.subject,
              issuer: cert.issuer,
              spki: `sha256/${spkiB64}`,
              cert: `sha256/${certB64}`,
              validTo:cert.valid_to
            });

            if (!cert.issuerCertificate || cert.issuerCertificate === cert)
              break;
            cert = cert.issuerCertificate;
          }

          socket.end();
          resolve(results.slice(0, 2));
        } catch (err) {
          socket.end();
          reject(err);
        }
      }
    );

    socket.on('error', err => reject(err));
  });
}
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
