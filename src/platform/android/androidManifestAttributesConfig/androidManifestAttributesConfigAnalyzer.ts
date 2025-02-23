import { ANDROID_ATTRIBUTES_RULES } from '@/rules';
import { PermissionData } from '@/types/global';
import verifyPermissions from '@/utils/verifyPermissions';
import {
  androidManifestName,
  createPermissionRegex,
  getAndroidManifestFile,
} from './androidManifestAttributesConfigUtils';

const androidManifestAttributesConfigAnalyze = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const { androidManifestWithoutComments } = await getAndroidManifestFile(
    currentPath
  );
  return verifyPermissions({
    strData: androidManifestWithoutComments,
    regexFn: createPermissionRegex,
    permissions: ANDROID_ATTRIBUTES_RULES,
    nameFile: androidManifestName,
  });
};

export default androidManifestAttributesConfigAnalyze;
