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
    const match = regex.exec(networkSecurityConfigNoComment);
    if (match?.[1] === value) return;
    networkSecurityConfigNoComment = networkSecurityConfigNoComment.replace(
      /<domain-config[^>]*>[\s\S]*?<\/domain-config>/g,
      '<base-config cleartextTrafficPermitted="false" />'
    );
  });

  fs.writeFileSync(
    getNetworkSecurityConfigPath(currentPath),
    recuperateComments(networkSecurityConfigNoComment, comments),
    'utf8'
  );
};

export default networkSecurityConfigFix;
