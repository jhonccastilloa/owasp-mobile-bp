import getOwaspBpConfig from '@/utils/owasp-bp.config';
import tls from 'tls';
import { searchFile } from '@/utils/tool';
import path from 'path';
import fs from 'fs';
import getCertificateFingerprint, {
  Fingerprints,
} from './getCertificateFingerprint';

export const SSLPinnerFactoryNames = [
  'SSLPinnerFactory.java',
  'SSLPinningFactory.kt',
];

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
  for (const fileName of SSLPinnerFactoryNames) {
    const [SSLPinningFile, SSLPinningFilePath] = await searchFile(
      javaComPath,
      fileName
    );

    if (SSLPinningFile) {
      return {
        SSLPinningFile,
        SSLPinningFilePath,
        fileName,
      };
    }
  }

  return {
    SSLPinningFile: null,
    SSLPinningFilePath: null,
    fileName: null,
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

const SSLPinnerFactoryTemplateKotlin = ({
  androidApplicationId = 'completar',
  hostname = 'completar',
  fingerPrints,
}: {
  androidApplicationId: string;
  hostname: string;
  fingerPrints: Fingerprints[];
}) => `
package ${androidApplicationId}

import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.CertificatePinner
import okhttp3.OkHttpClient

class SSLPinningFactory : OkHttpClientFactory {
    companion object {
        private const val hostname = "${hostname}"
        private val sha256Keys = listOf(${fingerPrints
          ?.map(f => `"${f.spki}"`)
          .join(',')})
    }
    override fun createNewNetworkModuleClient(): OkHttpClient {
        val certificatePinnerBuilder = CertificatePinner.Builder()
        for (key in sha256Keys) {
            certificatePinnerBuilder.add(hostname, key)
        }
        val certificatePinner = certificatePinnerBuilder.build()
        val clientBuilder = OkHttpClientProvider.createClientBuilder()
        return clientBuilder.certificatePinner(certificatePinner).build()
    }
}
`;

export const updateMainApplication = (
  filePath: string,
  fileContent: string
) => {
  let updatedContent = fileContent;
  const isKotlin = path.extname(filePath) === '.kt';

  const OK_HTTP_IMPORT = isKotlin
    ? 'import com.facebook.react.modules.network.OkHttpClientProvider'
    : 'import com.facebook.react.modules.network.OkHttpClientProvider;';

  const OK_HTTP_LINE = isKotlin
    ? 'OkHttpClientProvider.setOkHttpClientFactory(SSLPinningFactory())'
    : 'OkHttpClientProvider.setOkHttpClientFactory(new SSLPinnerFactory());';

  // 1. Agregar el import si no existe
  if (!updatedContent.includes('OkHttpClientProvider')) {
    updatedContent = updatedContent.replace(
      /(^package[\s\S]+?\n)/,
      `$1${OK_HTTP_IMPORT}\n`
    );
  }

  // 2. Insertar la línea en onCreate después de super.onCreate()
  if (!updatedContent.includes('OkHttpClientProvider.setOkHttpClientFactory')) {
    updatedContent = updatedContent.replace(
      'super.onCreate()',
      `super.onCreate()\n    ${OK_HTTP_LINE}`
    );
  }

  fs.writeFileSync(filePath, updatedContent, 'utf8');
};

export const createSSLPinnerFactory = async (
  folderPath: string,
  serverFingerprint: Fingerprints[],
  androidApplicationId: string,
  isKotlin: boolean
) => {
  const owaspBpConfig = await getOwaspBpConfig();
  if (!owaspBpConfig) return;
  let SSLPinnerFactory = '';
  if (isKotlin) {
    SSLPinnerFactory = SSLPinnerFactoryTemplateKotlin({
      androidApplicationId,
      hostname: owaspBpConfig?.hostname,
      fingerPrints: serverFingerprint,
    });
  } else {
    SSLPinnerFactory = SSLPinnerFactoryTemplate({
      androidApplicationId,
      hostname: owaspBpConfig?.hostname,
      serverFingerprint: serverFingerprint[0].spki,
    });
  }

  fs.writeFileSync(
    path.join(
      folderPath,
      isKotlin ? 'SSLPinningFactory.kt' : 'SSLPinnerFactory.java'
    ),
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
