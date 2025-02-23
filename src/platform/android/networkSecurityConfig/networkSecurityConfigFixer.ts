import fs from 'fs';
import {
  getNetworkSecurityConfigPath,
  networkRegex,
  readNetworkSecurityConfig,
} from './networkSecurityConfigUtils';
import { NETWORK_SECURITY_CONFIG_RULES } from '@/rules';
import { recuperateComments } from '@/utils/tool';

const networkSecurityConfigFix = async (currentPath: string) => {
  let { networkSecurityConfigNoComment, comments } =
    await readNetworkSecurityConfig(currentPath);

  Object.entries(NETWORK_SECURITY_CONFIG_RULES).forEach(([key, data]) => {
    const regex = networkRegex(key);
    const value = data.values[0];

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

export default networkSecurityConfigFix;
