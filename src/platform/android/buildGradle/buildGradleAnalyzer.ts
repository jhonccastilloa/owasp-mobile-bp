import { BUILD_GRADLE_RULES } from '@/rules/buildGradleRules';
import verifyPermissions from '@/utils/verifyPermissions';
import { PermissionData } from '@/types/global';
import {
  buildGradleFixRegex,
  buildGradleName,
  buildGradleRegex,
  getBuildGradleFile,
} from './buildGradleUtils';

const buildGradleAnalyze = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const { buildGradleNoComment } = await getBuildGradleFile(currentPath);
  return verifyPermissions({
    strData: buildGradleNoComment,
    regexFn: mainKey =>
      mainKey === 'buildToolsVersion'
        ? buildGradleFixRegex(mainKey)
        : buildGradleRegex(mainKey),
    permissions: BUILD_GRADLE_RULES,
    nameFile: buildGradleName,
  });
};

export default buildGradleAnalyze;
