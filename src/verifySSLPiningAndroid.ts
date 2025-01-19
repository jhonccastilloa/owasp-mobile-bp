import tls from 'tls';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { cleanJavaComments, searchFile } from './utils/tool';
import { PermissionData } from './types/global';
import { PermissionStatus } from './types/enums';

const port: number = 443;

const regexHostname = /hostname\s*=\s*"(.+)"\s*;/;
const regexFingerprint = /"sha256\/(.+)"\)/;

export const checkCertificateSSLPinning = async (
  currentPath: string
): Promise<PermissionData | null> => {
  try {
    const javaComPath = path.join(
      currentPath,
      'android',
      'app',
      'src',
      'main',
      'java',
      'com'
    );
    let status = false;
    const sslPinningContent: string | null = await searchFile(
      javaComPath,
      'SSLPinnerFactory.java'
    );
    if (sslPinningContent) {
      const cleanComments = cleanJavaComments(sslPinningContent);
      const matchHostname = cleanComments.match(regexHostname);
      const matchFingerprint = cleanComments.match(regexFingerprint);
      if (matchHostname && matchFingerprint) {
        const options: tls.ConnectionOptions = {
          host: matchHostname[1],
          port: port,
          servername: matchHostname[1],
          rejectUnauthorized: false,
        };

        const serverFingerprint = await getCertificateFingerprint(options);
        if (serverFingerprint === matchFingerprint[1]) {
          status = true;
        }
      }
    }
    const data: PermissionData = {
      numLine: null,
      status: status ? PermissionStatus.OK : PermissionStatus.NOT_FOUND,
      permission: 'SSL Pinning',
      severity: 'E',
      message:
        'Se ha encontrado la prevención contra SSL Pinning en el archivo SSLPinningFactory.java',
      owaspCategory: 'M4',
      nameFile: 'SSLPinningFactory.java',
    };
    return data;
  } catch (error) {
    console.log('❌ Error reading the file SSLPinningFactory.js', error);
    return null;
  }
};

const getCertificateFingerprint = (options: tls.ConnectionOptions) => {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(options, () => {
      const certificate: tls.PeerCertificate = socket.getPeerCertificate(true);

      if (!certificate || !certificate.raw) {
        socket.end();
        return reject(new Error('No certificate found'));
      }

      const fingerprint = getPublicKeyFingerprint(certificate);
      socket.end();
      resolve(fingerprint);
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
