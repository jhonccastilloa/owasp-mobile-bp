import path from 'path';
import fs from 'fs';
import { cleanXmlComentaries } from '@/utils/tool';

export const networkSecurityName = 'network_security_config.xml';

export const getNetworkSecurityConfigPath = (currentPath: string) =>
  path.join(
    currentPath,
    'android',
    'app',
    'src',
    'main',
    'res',
    'xml',
    networkSecurityName
  );

export const networkRegex = (key: string) =>
  new RegExp(`${key}\\s*=\\s*"([^b]*)"`, 'g');

export const readNetworkSecurityConfig = async (currentPath: string) => {
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
