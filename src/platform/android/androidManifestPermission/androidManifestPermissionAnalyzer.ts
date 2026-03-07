import { PermissionData } from '@/types/global';
import { validateSeverity } from '@/utils/tool';
import { PermissionStatus } from '@/types/enums';
import { ANDROID_PERMISSION_RULES } from '@/rules';
import { getPackageDependencyNames } from '@/utils/packageJson';
import {
  AndroidVariantContext,
  getMergedManifestPermissions,
  loadAndroidVariantContext,
} from '@/platform/android/context/androidVariantContext';

const androidManifestPermissionAnalyze = async (
  currentPath: string,
  context?: AndroidVariantContext
): Promise<PermissionData[]> => {
  try {
    const packageDependencyNamesSet = new Set(
      await getPackageDependencyNames(currentPath)
    );
    const variantContext =
      context ?? (await loadAndroidVariantContext(currentPath));
    const manifestPermissions = getMergedManifestPermissions(variantContext);

    const owaspPermission = [];

    for (const manifestPermission of manifestPermissions) {
      const requiredPermission =
        ANDROID_PERMISSION_RULES[manifestPermission.permission];
      if (requiredPermission) {
        const hasRequiredDependency =
          requiredPermission.requiredDependencies.some(dep =>
            packageDependencyNamesSet.has(dep)
          );
        const isDuplicated = !!owaspPermission.find(
          item => item.permission === manifestPermission.permission
        );
        const data: PermissionData = {
          permission: manifestPermission.permission,
          numLine: manifestPermission.numLine,
          owaspCategory: requiredPermission.owaspCategory,
          severity: requiredPermission.severity,
          message: requiredPermission.message,
          status: isDuplicated
            ? PermissionStatus.DUPLICATE
            : validateSeverity(
                requiredPermission.severity,
                hasRequiredDependency
              ),
          nameFile: manifestPermission.nameFile,
        };
        owaspPermission.push(data);
      }
    }

    return owaspPermission;
  } catch (error) {
    return [];
  }
};
export default androidManifestPermissionAnalyze;
