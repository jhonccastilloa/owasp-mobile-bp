import { NETWORK_SECURITY_CONFIG_RULES } from '@/rules';
import verifyPermissions from '@/utils/verifyPermissions';
import { PermissionData } from '@/types/global';
import {
  networkRegex,
  networkSecurityName,
  readNetworkSecurityConfig,
} from './networkSecurityConfigUtils';

const networkSecurityConfigAnalyze = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const { networkSecurityConfigData } = await readNetworkSecurityConfig(
    currentPath
  );
  return verifyPermissions({
    strData: networkSecurityConfigData,
    regexFn: networkRegex,
    permissions: NETWORK_SECURITY_CONFIG_RULES,
    nameFile: networkSecurityName,
  });
};

export default networkSecurityConfigAnalyze;
