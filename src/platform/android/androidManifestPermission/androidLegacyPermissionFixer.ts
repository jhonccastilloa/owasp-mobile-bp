import fs from 'fs';
import { getAndroidManifestPath } from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigUtils';
import { ANDROID_PERMISSION_RULES } from '@/rules';
import { getPackageDependencyNames } from '@/utils/packageJson';
import { logger } from '@/utils/logger';
import {
  createAndroidPermissionRegex,
  toAndroidPermissionName,
} from './utils';

const STORAGE_LEGACY_PERMISSIONS = new Set([
  'READ_EXTERNAL_STORAGE',
  'WRITE_EXTERNAL_STORAGE',
]);

const USE_FINGERPRINT = 'USE_FINGERPRINT';
const USE_BIOMETRIC = 'USE_BIOMETRIC';

const ensurePermission = (manifestContent: string, permission: string) => {
  const fullPermission = toAndroidPermissionName(permission);
  const existsRegex = new RegExp(
    `<uses-permission\\b[^>]*android:name\\s*=\\s*"${fullPermission.replace(
      /\./g,
      '\\.'
    )}"[^>]*\\/?>`
  );
  if (existsRegex.test(manifestContent)) return manifestContent;

  const applicationIndex = manifestContent.indexOf('<application');
  const entry = `  <uses-permission android:name="${fullPermission}" />\n`;
  if (applicationIndex >= 0) {
    return (
      manifestContent.slice(0, applicationIndex) +
      entry +
      manifestContent.slice(applicationIndex)
    );
  }
  return manifestContent.replace('</manifest>', `${entry}</manifest>`);
};

const getAutoRemovablePermissions = () =>
  Object.entries(ANDROID_PERMISSION_RULES)
    .filter(
      ([permission, rule]) =>
        rule.requiredDependencies.length === 0 &&
        !STORAGE_LEGACY_PERMISSIONS.has(permission) &&
        permission !== USE_FINGERPRINT
    )
    .map(([permission]) => permission);

export const getAutoRemovableManifestPermissions = () => [
  ...getAutoRemovablePermissions(),
  USE_FINGERPRINT,
];

export const fixAndroidLegacyPermissions = async (currentPath: string) => {
  const manifestPath = getAndroidManifestPath(currentPath, 'main');
  const originalManifest = await fs.promises.readFile(manifestPath, 'utf8');
  let updatedManifest = originalManifest;

  for (const permission of getAutoRemovablePermissions()) {
    updatedManifest = updatedManifest.replace(
      createAndroidPermissionRegex(permission),
      ''
    );
  }

  const hadUseFingerprint = createAndroidPermissionRegex(USE_FINGERPRINT).test(
    updatedManifest
  );
  updatedManifest = updatedManifest.replace(
    createAndroidPermissionRegex(USE_FINGERPRINT),
    ''
  );

  if (hadUseFingerprint) {
    const dependencySet = new Set(await getPackageDependencyNames(currentPath));
    const biometricRule = ANDROID_PERMISSION_RULES[USE_BIOMETRIC];
    const shouldAddUseBiometric = biometricRule.requiredDependencies.some(dep =>
      dependencySet.has(dep)
    );
    if (shouldAddUseBiometric) {
      updatedManifest = ensurePermission(updatedManifest, USE_BIOMETRIC);
    }
  }

  if (updatedManifest === originalManifest) return;
  await fs.promises.writeFile(manifestPath, updatedManifest, 'utf8');
  logger.success(
    'Android legacy permission fixer applied (empty-dependency permissions removed, USE_FINGERPRINT migrated).'
  );
};
