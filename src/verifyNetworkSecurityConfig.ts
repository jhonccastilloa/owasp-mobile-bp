import path from 'path';
import fs from 'fs';
import { NETWORK_SECURITY_CONFIG_DATA } from './data/networkSecurityConfigData';
import verifyPermissions from './verifyPermissions';
import { PermissionData } from './types/global';

const verifyNetworkSecurityConfig = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const nameFile = 'network_security_config.xml';
  const buildGradleGlobal = path.join(
    currentPath,
    'android',
    'app',
    'src',
    'main',
    'res',
    'xml',
    nameFile
  );
  let readData = await fs.promises.readFile(buildGradleGlobal, 'utf-8');

  return verifyPermissions({
    strData: readData,
    regexFn: mainKey => new RegExp(`${mainKey}\\s*=\\s*"([^b]*)"`),
    permissions: NETWORK_SECURITY_CONFIG_DATA,
    nameFile,
  });
};

export default verifyNetworkSecurityConfig;
