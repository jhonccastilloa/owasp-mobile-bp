import { Finding } from '@/types/audit';
import { PermissionData } from '@/types/global';
import { stringifyPermissionMessage } from '@/utils/message';

export const permissionDataToFindings = (
  data: PermissionData[],
  platform: 'android' | 'ios',
  variant: string,
  fixedRules: Set<string> = new Set()
): Finding[] =>
  data.map(item => {
    const ruleId = `${platform}.${item.permission}`;
    const file = item.nameFile ?? 'unknown';
    return {
      id: `${ruleId}.${variant}.${item.numLine ?? 'na'}`,
      ruleId,
      platform,
      variant,
      file,
      line: item.numLine,
      severity: item.severity,
      owaspCategory: item.owaspCategory,
      status: item.status,
      message: stringifyPermissionMessage(item.message),
      fixAvailable: fixedRules.has(item.permission),
      fixRisk: fixedRules.has(item.permission) ? 'low' : 'none',
    };
  });
