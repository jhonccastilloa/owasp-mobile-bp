import fs from 'fs';
import {
  networkRegex,
  readNetworkSecurityConfig,
} from './networkSecurityConfigUtils';
import { NETWORK_SECURITY_CONFIG_RULES } from '@/rules';
import { recuperateComments } from '@/utils/tool';
import { logger } from '@/utils/logger';
import {
  AndroidVariantContext,
  loadAndroidVariantContext,
} from '@/platform/android/context/androidVariantContext';

const setUsesCleartextTrafficFalseInMainManifest = async (
  currentPath: string,
  context?: AndroidVariantContext
) => {
  const variantContext = context ?? (await loadAndroidVariantContext(currentPath));
  const manifestPath = variantContext.mainManifestPath;
  const manifestContent =
    variantContext.mainManifestContent ||
    (await fs.promises.readFile(manifestPath, 'utf8'));

  const applicationTagRegex = /<application\b[^>]*>/;
  const applicationTagMatch = applicationTagRegex.exec(manifestContent);
  if (!applicationTagMatch) {
    logger.warn('Main <application> tag not found, skipping usesCleartextTraffic fallback');
    return;
  }

  const applicationTag = applicationTagMatch[0];
  const updatedApplicationTag = /android:usesCleartextTraffic\s*=/.test(applicationTag)
    ? applicationTag.replace(
        /android:usesCleartextTraffic\s*=\s*"[^"]*"/g,
        'android:usesCleartextTraffic="false"'
      )
    : applicationTag.replace(/>$/, ' android:usesCleartextTraffic="false">');

  if (updatedApplicationTag === applicationTag) return;

  const updatedManifest = manifestContent.replace(applicationTag, updatedApplicationTag);
  await fs.promises.writeFile(manifestPath, updatedManifest, 'utf8');
  logger.success('Applied fallback android:usesCleartextTraffic="false" in main AndroidManifest.xml');
};

const setClearTextFalse = (content: string) => {
  if (content.includes('cleartextTrafficPermitted=')) {
    return content.replace(
      /cleartextTrafficPermitted\s*=\s*"[^"]*"/g,
      'cleartextTrafficPermitted="false"'
    );
  }

  if (/<domain-config\b[^>]*>/.test(content)) {
    return content.replace(
      /<domain-config\b([^>]*)>/,
      (_m, attrs: string) =>
        `<domain-config${attrs} cleartextTrafficPermitted="false">`
    );
  }

  if (/<base-config\b[^>]*>/.test(content)) {
    return content.replace(
      /<base-config\b([^>]*)>/,
      (_m, attrs: string) => `<base-config${attrs} cleartextTrafficPermitted="false">`
    );
  }

  return content.replace(
    /<\/network-security-config>/,
    '  <base-config cleartextTrafficPermitted="false" />\n</network-security-config>'
  );
};

const networkSecurityConfigFix = async (
  currentPath: string,
  context?: AndroidVariantContext
) => {
  let { networkSecurityConfigNoComment, comments, networkSecurityConfigPath } =
    await readNetworkSecurityConfig(currentPath, context);

  if (!networkSecurityConfigPath) {
    await setUsesCleartextTrafficFalseInMainManifest(currentPath, context);
    return;
  }

  Object.entries(NETWORK_SECURITY_CONFIG_RULES).forEach(([key, data]) => {
    const regex = networkRegex(key);
    const value = data.values[0];
    const match = regex.exec(networkSecurityConfigNoComment);
    if (match?.[1] === value) return;
    networkSecurityConfigNoComment = setClearTextFalse(networkSecurityConfigNoComment);
  });

  fs.writeFileSync(
    networkSecurityConfigPath,
    recuperateComments(networkSecurityConfigNoComment, comments),
    'utf8'
  );
};

export default networkSecurityConfigFix;
