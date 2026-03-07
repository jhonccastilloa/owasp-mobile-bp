import { BUILD_GRADLE_RULES } from '@/rules/buildGradleRules';
import { PermissionData } from '@/types/global';
import {
  buildGradleFixRegex,
  buildGradleName,
  getBuildGradleFile,
} from './buildGradleUtils';
import { PermissionStatus } from '@/types/enums';
import { linesUpToMatch, validateSeverity } from '@/utils/tool';
import { isVersionGreaterOrEqual } from '@/utils/version';

const buildGradleAnalyze = async (
  currentPath: string
): Promise<PermissionData[]> => {
  const { buildGradleNoComment } = await getBuildGradleFile(currentPath);
  const findings: PermissionData[] = [];
  for (const [mainKey, rule] of Object.entries(BUILD_GRADLE_RULES)) {
    const regex = buildGradleFixRegex(mainKey);
    let matchData: RegExpExecArray | null;
    const permission: PermissionData = {
      permission: mainKey,
      owaspCategory: rule.owaspCategory,
      severity: rule.severity,
      message: rule.message,
      numLine: null,
      status: PermissionStatus.NOT_FOUND,
      nameFile: buildGradleName,
    };
    const results: PermissionData[] = [];
    while ((matchData = regex.exec(buildGradleNoComment)) !== null) {
      const value = matchData[1] ?? matchData[2] ?? '';
      const isValid =
        rule.strategy === 'min'
          ? isVersionGreaterOrEqual(value, rule.values[0])
          : rule.values.includes(value);
      results.push({
        ...permission,
        numLine: linesUpToMatch(buildGradleNoComment, matchData.index),
        status:
          results.length >= 1
            ? PermissionStatus.DUPLICATE
            : validateSeverity(rule.severity, isValid),
      });
    }
    findings.push(...(results.length > 0 ? results : [permission]));
  }
  return findings;
};

export default buildGradleAnalyze;
