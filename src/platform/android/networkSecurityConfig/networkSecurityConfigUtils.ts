import path from 'path';
import { cleanXmlComentaries, searchFile } from '@/utils/tool';

export const networkSecurityName = 'network_security_config.xml';

export const getNetworkSecurityConfigPath = async (currentPath: string) => {
  const result = await searchFile(
    path.join(currentPath, 'android', 'app', 'src'),
    networkSecurityName
  );

  return result;
};

export const networkRegex = (key: string) =>
  new RegExp(`${key}\\s*=\\s*"([^b]*)"`, 'g');

export const readNetworkSecurityConfig = async (currentPath: string) => {
  const [networkSecurityConfigData] = await getNetworkSecurityConfigPath(
    currentPath
  );
  const { comments, newData } = cleanXmlComentaries(networkSecurityConfigData!);
  return {
    networkSecurityConfigNoComment: newData,
    comments,
    networkSecurityConfigData: networkSecurityConfigData!,
  };
};
