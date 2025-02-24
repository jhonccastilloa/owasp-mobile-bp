import getOwaspBpConfig from '@/utils/owasp-bp.config';
import tls from 'tls';
import { searchFile } from '@/utils/tool';
import path from 'path';
import fs from 'fs';
import getCertificateFingerprint from './getCertificateFingerprint';

export const SSLPinnerFactoryName = 'SSLPinnerFactory.java';

export const getSSLPinningFile = async (currentPath: string) => {
  const javaComPath = path.join(
    currentPath,
    'android',
    'app',
    'src',
    'main',
    'java',
    'com'
  );
  const [SSLPinningFile, SSLPinningFilePath] = await searchFile(
    javaComPath,
    SSLPinnerFactoryName
  );

  return {
    SSLPinningFile,
    SSLPinningFilePath,
  };
};

interface SSLPinnerFactoryTemplate {
  androidApplicationId?: string | null;
  hostname?: string | null;
  serverFingerprint?: string | null;
}

export const SSLPinnerFactoryTemplate = ({
  androidApplicationId = 'completar',
  hostname = 'completar',
  serverFingerprint = 'completar',
}: SSLPinnerFactoryTemplate) => `package ${androidApplicationId};

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.OkHttpClientProvider;

import okhttp3.CertificatePinner;
import okhttp3.OkHttpClient;

public class SSLPinnerFactory implements OkHttpClientFactory {
    private static String hostname = "${hostname}";

    public OkHttpClient createNewNetworkModuleClient() {
        CertificatePinner certificatePinner = new CertificatePinner.Builder()
                .add(hostname, "sha256/${serverFingerprint}")
                .build();
        // Get a OkHttpClient builder with all the React Native defaults
        OkHttpClient.Builder clientBuilder = OkHttpClientProvider.createClientBuilder();
        return clientBuilder
                .certificatePinner(certificatePinner)
                .build();
    }
}`;

const OK_HTTP_CLIENT_PROVIDER_IMPORT =
  'import com.facebook.react.modules.network.OkHttpClientProvider';
const OK_HTTP_CLIENT_PROVIDER =
  'OkHttpClientProvider.setOkHttpClientFactory(new SSLPinnerFactory());';

export const updateMainApplication = (
  filePath: string,
  fileContent: string
) => {
  let updatedContent = fileContent;

  if (!updatedContent.includes(OK_HTTP_CLIENT_PROVIDER_IMPORT)) {
    updatedContent = `${OK_HTTP_CLIENT_PROVIDER_IMPORT}\n${updatedContent}`;
  }

  if (!updatedContent.includes(OK_HTTP_CLIENT_PROVIDER)) {
    updatedContent = updatedContent.replace(
      'super.onCreate();',
      `super.onCreate();\n    ${OK_HTTP_CLIENT_PROVIDER}`
    );
  }

  fs.writeFileSync(filePath, updatedContent, 'utf8');
};

export const createSSLPinnerFactory = async (
  folderPath: string,
  serverFingerprint: string | null,
  androidApplicationId: string | null
) => {
  const owaspBpConfig = await getOwaspBpConfig();

  const SSLPinnerFactory = SSLPinnerFactoryTemplate({
    androidApplicationId,
    hostname: owaspBpConfig?.hostname,
    serverFingerprint,
  });
  fs.writeFileSync(
    path.join(folderPath, SSLPinnerFactoryName),
    SSLPinnerFactory,
    'utf8'
  );
};

export const getServerFingerprint = async (hostname: string) => {
  const options: tls.ConnectionOptions = {
    host: hostname,
    port: 443,
    servername: hostname,
    rejectUnauthorized: false,
  };

  return await getCertificateFingerprint(options);
};
