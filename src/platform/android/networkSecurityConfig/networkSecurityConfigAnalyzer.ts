import { NETWORK_SECURITY_CONFIG_RULES } from '@/rules';
import verifyPermissions from '@/utils/verifyPermissions';
import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import {
  networkRegex,
  networkSecurityName,
  readNetworkSecurityConfig,
} from './networkSecurityConfigUtils';
import {
  AndroidVariantContext,
  getMergedApplicationAttribute,
  loadAndroidVariantContext,
} from '@/platform/android/context/androidVariantContext';

const networkSecurityConfigAnalyze = async (
  currentPath: string,
  context?: AndroidVariantContext
): Promise<PermissionData[]> => {
  const variantContext =
    context ?? (await loadAndroidVariantContext(currentPath));
  const { networkSecurityConfigNoComment, networkSecurityConfigPath } =
    await readNetworkSecurityConfig(
    currentPath,
    variantContext
  );

  if (!networkSecurityConfigPath) {
    const usesCleartextTraffic = getMergedApplicationAttribute(
      variantContext,
      'android:usesCleartextTraffic'
    );
    const isCompliant = usesCleartextTraffic?.value === 'false';

    return [
      {
        permission: 'cleartextTrafficPermitted',
        owaspCategory: NETWORK_SECURITY_CONFIG_RULES.cleartextTrafficPermitted.owaspCategory,
        severity: NETWORK_SECURITY_CONFIG_RULES.cleartextTrafficPermitted.severity,
        message: isCompliant
          ? 'No se encontró network_security_config.xml; se valida android:usesCleartextTraffic="false" en AndroidManifest.xml.'
          : 'No se encontró network_security_config.xml; debe declararse android:usesCleartextTraffic="false" en AndroidManifest.xml.',
        numLine: usesCleartextTraffic?.numLine ?? null,
        status: isCompliant ? PermissionStatus.OK : PermissionStatus.ERROR,
        nameFile: usesCleartextTraffic?.nameFile ?? 'AndroidManifest.xml',
      },
    ];
  }

  return verifyPermissions({
    strData: networkSecurityConfigNoComment,
    regexFn: networkRegex,
    permissions: NETWORK_SECURITY_CONFIG_RULES,
    nameFile: networkSecurityName,
  });
};

export default networkSecurityConfigAnalyze;
