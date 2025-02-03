import path from 'path';
import fs from 'fs';
import { NETWORK_SECURITY_CONFIG_DATA } from './data/networkSecurityConfigData';
import verifyPermissions from './verifyPermissions';
import { PermissionData } from './types/global';
import { cleanXmlComentaries, recuperateComments } from './utils/tool';

const nameFile = 'network_security_config.xml';

const getNetworkSecurityConfigPath = (currentPath: string) =>
  path.join(
    currentPath,
    'android',
    'app',
    'src',
    'main',
    'res',
    'xml',
    nameFile
  );

const readNetworkSecurityConfig = async (currentPath: string) => {
  const networkSecurityConfigPath = getNetworkSecurityConfigPath(currentPath);
  const networkSecurityConfigData = await fs.promises.readFile(
    networkSecurityConfigPath,
    'utf-8'
  );
  const { comments, newData } = cleanXmlComentaries(networkSecurityConfigData);
  return {
    networkSecurityConfigNoComment: newData,
    comments,
    networkSecurityConfigData,
  };
};

const networkRegex = (key: string) =>
  new RegExp(`${key}\\s*=\\s*"([^b]*)"`, 'g');

const verifyNetworkSecurityConfig = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const { networkSecurityConfigData } = await readNetworkSecurityConfig(
    currentPath
  );
  return verifyPermissions({
    strData: networkSecurityConfigData,
    regexFn: networkRegex,
    permissions: NETWORK_SECURITY_CONFIG_DATA,
    nameFile,
  });
};

export const repairNetworkSecurityConfig = async (currentPath: string) => {
  let { networkSecurityConfigNoComment, comments } =
    await readNetworkSecurityConfig(currentPath);

  Object.entries(NETWORK_SECURITY_CONFIG_DATA).forEach(([key, data]) => {
    const regex = networkRegex(key);
    const value = data.values[0];

    //if the key is already in the file, replace it
    if (regex.test(networkSecurityConfigNoComment)) {
      networkSecurityConfigNoComment = networkSecurityConfigNoComment.replace(
        regex,
        `${key}="${value}"`
      );
    } else {
      networkSecurityConfigNoComment = networkSecurityConfigNoComment.replace(
        /<network-security-config/,
        `<network-security-config ${key}="${value}"`
      );
    }
  });

  //clean unused domains
  networkSecurityConfigNoComment = networkSecurityConfigNoComment.replace(
    /^\s*<domain.*?<\/domain>\s*$/gm,
    ''
  );

  fs.writeFileSync(
    getNetworkSecurityConfigPath(currentPath),
    recuperateComments(networkSecurityConfigNoComment, comments),
    'utf8'
  );
};

export default verifyNetworkSecurityConfig;
