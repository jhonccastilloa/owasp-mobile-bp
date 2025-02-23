import { BUILD_GRADLE_RULES } from '@/rules/buildGradleRules';
import verifyPermissions from '@/utils/verifyPermissions';
import { PermissionData } from '@/types/global';
import {
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
    regexFn: buildGradleRegex,
    permissions: BUILD_GRADLE_RULES,
    nameFile: buildGradleName,
  });
};

export default buildGradleAnalyze;
