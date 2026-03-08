import fs from 'fs';
import { getAndroidManifestPath } from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigUtils';
import { getBuildGradlePath } from '@/platform/android/buildGradle/buildGradleUtils';
import { getPackageDependencyNames } from '@/utils/packageJson';
import { logger } from '@/utils/logger';

const LEGACY_STORAGE_PERMISSIONS = [
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
];

const IMAGE_MEDIA_DEPENDENCIES = new Set([
  'react-native-share',
  'react-native-view-shot',
  'react-native-image-picker',
  'react-native-image-crop-picker',
  'react-native-cameraroll',
]);

const VIDEO_MEDIA_DEPENDENCIES = new Set([
  'react-native-video',
  'react-native-image-picker',
  'react-native-image-crop-picker',
  'react-native-compressor',
]);

const AUDIO_MEDIA_DEPENDENCIES = new Set([
  'react-native-audio',
  'react-native-sound',
  'react-native-track-player',
  'react-native-audio-recorder-player',
]);

const extractTargetSdkVersion = (buildGradleContent: string): number | null => {
  const match =
    /targetSdkVersion\s*=?\s*(\d+)/.exec(buildGradleContent) ??
    /targetSdk\s*=?\s*(\d+)/.exec(buildGradleContent);
  if (!match) return null;
  return Number(match[1]);
};

export const getAndroidTargetSdkVersion = async (
  currentPath: string
): Promise<number | null> => {
  try {
    const buildGradlePath = getBuildGradlePath(currentPath);
    const content = await fs.promises.readFile(buildGradlePath, 'utf8');
    return extractTargetSdkVersion(content);
  } catch {
    return null;
  }
};

const hasAnyDependency = (allDependencies: Set<string>, required: Set<string>) => {
  for (const dependency of required) {
    if (allDependencies.has(dependency)) return true;
  }
  return false;
};

const injectManifestPermission = (manifestContent: string, permissionName: string) => {
  const permissionRegex = new RegExp(
    `<uses-permission\\b[^>]*android:name\\s*=\\s*"${permissionName.replace(
      /\./g,
      '\\.'
    )}"[^>]*\\/?>`
  );
  if (permissionRegex.test(manifestContent)) return manifestContent;

  const permissionEntry = `  <uses-permission android:name="${permissionName}" />\n`;
  const applicationIndex = manifestContent.indexOf('<application');
  if (applicationIndex >= 0) {
    return (
      manifestContent.slice(0, applicationIndex) +
      permissionEntry +
      manifestContent.slice(applicationIndex)
    );
  }

  return manifestContent.replace('</manifest>', `${permissionEntry}</manifest>`);
};

export const fixAndroidStorageLegacyPermissions = async (
  currentPath: string
) => {
  const manifestPath = getAndroidManifestPath(currentPath, 'main');
  const originalManifestContent = await fs.promises.readFile(manifestPath, 'utf8');

  const legacyPermissionRegex =
    /<uses-permission\b[^>]*android:name\s*=\s*"android\.permission\.(READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE)"[^>]*\/?>\s*\n?/g;

  const hadLegacyPermissions = legacyPermissionRegex.test(originalManifestContent);
  if (!hadLegacyPermissions) return;
  legacyPermissionRegex.lastIndex = 0;

  const targetSdk = await getAndroidTargetSdkVersion(currentPath);
  if (targetSdk !== null && targetSdk < 33) {
    throw new Error(
      `targetSdkVersion=${targetSdk} is below 33 and conflicts with baseline rule targetSdkVersion=35.`
    );
  }

  let manifestContent = originalManifestContent;
  manifestContent = manifestContent.replace(legacyPermissionRegex, '');

  const dependencySet = new Set(await getPackageDependencyNames(currentPath));
  const permissionsToAdd: string[] = [];
  if (hasAnyDependency(dependencySet, IMAGE_MEDIA_DEPENDENCIES)) {
    permissionsToAdd.push('android.permission.READ_MEDIA_IMAGES');
  }
  if (hasAnyDependency(dependencySet, VIDEO_MEDIA_DEPENDENCIES)) {
    permissionsToAdd.push('android.permission.READ_MEDIA_VIDEO');
  }
  if (hasAnyDependency(dependencySet, AUDIO_MEDIA_DEPENDENCIES)) {
    permissionsToAdd.push('android.permission.READ_MEDIA_AUDIO');
  }

  let updatedManifest = manifestContent;
  for (const permission of permissionsToAdd) {
    updatedManifest = injectManifestPermission(updatedManifest, permission);
  }

  await fs.promises.writeFile(manifestPath, updatedManifest, 'utf8');
  logger.success(
    'Android storage permissions fixer applied (legacy removed and READ_MEDIA* migrated when needed).'
  );
};
