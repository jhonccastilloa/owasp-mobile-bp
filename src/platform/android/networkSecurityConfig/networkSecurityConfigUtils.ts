import { cleanXmlComments } from '@/utils/tool';
import {
  AndroidVariantContext,
  getNetworkSecurityConfigForVariant,
  loadAndroidVariantContext,
} from '@/platform/android/context/androidVariantContext';

export const networkSecurityName = 'network_security_config.xml';

export const networkRegex = (key: string) =>
  new RegExp(`${key}\\s*=\\s*"([^"]*)"`, 'g');

export const readNetworkSecurityConfig = async (
  currentPath: string,
  context?: AndroidVariantContext
) => {
  const variantContext =
    context ?? (await loadAndroidVariantContext(currentPath));
  const [networkSecurityConfigData, networkSecurityConfigPath] =
    await getNetworkSecurityConfigForVariant(currentPath, variantContext);

  if (!networkSecurityConfigData) {
    return {
      networkSecurityConfigNoComment: '',
      comments: [],
      networkSecurityConfigData: '',
      networkSecurityConfigPath: null,
    };
  }

  const { comments, newData } = cleanXmlComments(networkSecurityConfigData);
  return {
    networkSecurityConfigNoComment: newData,
    comments,
    networkSecurityConfigData,
    networkSecurityConfigPath,
  };
};
