import { Finding } from '@/types/audit';
import { PermissionData } from '@/types/global';

const stringifyMessage = (message: PermissionData['message']) => {
  if (typeof message === 'string') return message;
  return message
    .map(item => {
      if (typeof item === 'string') return item;
      return item.text ?? '';
    })
    .join('');
};

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
      message: stringifyMessage(item.message),
      fixAvailable: fixedRules.has(item.permission),
      fixRisk: fixedRules.has(item.permission) ? 'low' : 'none',
    };
  });

