import fs from 'fs';
import { getAndroidManifestPath } from '@/platform/android/androidManifestAttributesConfig/androidManifestAttributesConfigUtils';
import { ANDROID_PERMISSION_RULES } from '@/rules';
import { getPackageDependencyNames } from '@/utils/packageJson';
import { logger } from '@/utils/logger';
import { createAndroidPermissionRegex } from './utils';

const fixAndroidManifestPermissions = async (currentPath: string) => {
  const manifestPath = getAndroidManifestPath(currentPath, 'main');
  const originalManifest = await fs.promises.readFile(manifestPath, 'utf8');
  const dependencySet = new Set(await getPackageDependencyNames(currentPath));

  let updatedManifest = originalManifest;

  for (const [permission, rule] of Object.entries(ANDROID_PERMISSION_RULES)) {
    if (rule.requiredDependencies.length === 0) continue;
    const required = rule.requiredDependencies.some(dep => dependencySet.has(dep));
    if (required) continue;

    updatedManifest = updatedManifest.replace(
      createAndroidPermissionRegex(permission),
      ''
    );
  }

  if (updatedManifest === originalManifest) return;
  await fs.promises.writeFile(manifestPath, updatedManifest, 'utf8');
  logger.success(
    'Android manifest permission fixer applied (permissions without matching dependencies removed).'
  );
};

export default fixAndroidManifestPermissions;
