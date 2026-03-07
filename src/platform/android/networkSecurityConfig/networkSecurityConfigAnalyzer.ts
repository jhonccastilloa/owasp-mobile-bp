import { NETWORK_SECURITY_CONFIG_RULES } from '@/rules';
import verifyPermissions from '@/utils/verifyPermissions';
import { PermissionData } from '@/types/global';
import {
  networkRegex,
  networkSecurityName,
  readNetworkSecurityConfig,
} from './networkSecurityConfigUtils';
import { AndroidVariantContext } from '@/platform/android/context/androidVariantContext';

const networkSecurityConfigAnalyze = async (
  currentPath: string,
  context?: AndroidVariantContext
): Promise<PermissionData[]> => {
  const { networkSecurityConfigNoComment } = await readNetworkSecurityConfig(
    currentPath,
    context
  );
  return verifyPermissions({
    strData: networkSecurityConfigNoComment,
    regexFn: networkRegex,
    permissions: NETWORK_SECURITY_CONFIG_RULES,
    nameFile: networkSecurityName,
  });
};

export default networkSecurityConfigAnalyze;
