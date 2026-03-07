import { ANDROID_ATTRIBUTES_RULES } from '@/rules';
import { PermissionData } from '@/types/global';
import { PermissionStatus } from '@/types/enums';
import { validateSeverity } from '@/utils/tool';
import {
  AndroidVariantContext,
  getMergedApplicationAttribute,
  getMergedMainActivityAttribute,
  getMergedManifestAttribute,
  loadAndroidVariantContext,
} from '@/platform/android/context/androidVariantContext';

const androidManifestAttributesConfigAnalyze = async (
  currentPath: string,
  context?: AndroidVariantContext
): Promise<PermissionData[]> => {
  const variantContext =
    context ?? (await loadAndroidVariantContext(currentPath));

  return Object.entries(ANDROID_ATTRIBUTES_RULES).map(([key, rule]) => {
    const target = rule.target ?? 'application';
    const currentAttribute =
      target === 'manifest'
        ? getMergedManifestAttribute(variantContext, key)
        : target === 'mainActivity'
          ? getMergedMainActivityAttribute(variantContext, key)
          : getMergedApplicationAttribute(variantContext, key);
    const value = currentAttribute?.value;
    const hasExpectedValue = value ? rule.values.includes(value) : false;

    return {
      permission: key,
      numLine: currentAttribute?.numLine ?? null,
      owaspCategory: rule.owaspCategory,
      severity: rule.severity,
      message: rule.message,
      status: value
        ? validateSeverity(rule.severity, hasExpectedValue)
        : PermissionStatus.NOT_FOUND,
      nameFile: currentAttribute?.nameFile ?? 'AndroidManifest.xml',
    };
  });
};

export default androidManifestAttributesConfigAnalyze;
